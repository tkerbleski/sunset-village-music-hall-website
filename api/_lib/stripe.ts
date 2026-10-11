// Stripe Checkout over the REST API (no SDK). Visitors pay on Stripe's own
// hosted page; this site never sees card details.
//
// Orders are recorded by fetching the Checkout Session back from Stripe with
// the secret key, both when the buyer lands on the success page and from the
// webhook. Because the data always comes straight from Stripe's API, the
// webhook needs no signing secret, and recording is idempotent (one row per
// Checkout Session).

import { query } from './db.js'
import { sendEmail, SITE_URL } from './email.js'

export const hasStripe = () => Boolean(process.env.STRIPE_SECRET_KEY)

/** Flatten {a: {b: 1}} into Stripe's form encoding: a[b]=1. */
function form(obj: Record<string, unknown>, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const name = prefix ? `${prefix}[${k}]` : k
    if (typeof v === 'object') form(v as Record<string, unknown>, name, out)
    else out.append(name, String(v))
  }
  return out
}

async function stripe<T>(method: 'GET' | 'POST', path: string, body?: Record<string, unknown>): Promise<T> {
  const r = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: body ? form(body) : undefined,
  })
  const data: any = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`Stripe ${path}: ${data?.error?.message ?? r.status}`)
  return data as T
}

export interface CheckoutSession {
  id: string
  url: string
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  amount_total: number
  payment_intent: string | null
  customer_details: { email: string | null; name: string | null } | null
  metadata: Record<string, string>
}

export interface TicketEvent {
  id: string
  title: string
  date: string
  time: string | null
  ticket_price_cents: number
}

export const dollars = (cents: number) =>
  `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`

const HOLD_SECONDS = 30 * 60 + 30 // Stripe's minimum session length

export async function createCheckout(e: TicketEvent, quantity: number) {
  const page = `${SITE_URL}/events/${encodeURIComponent(e.id)}`
  const expiresAt = Math.floor(Date.now() / 1000) + HOLD_SECONDS
  const session = await stripe<CheckoutSession>('POST', '/checkout/sessions', {
    mode: 'payment',
    line_items: {
      0: {
        quantity,
        price_data: {
          currency: 'usd',
          unit_amount: e.ticket_price_cents,
          product_data: { name: `${e.title} (${e.date})`, description: 'Sunset Village Music Hall, 4114 Judah St' },
        },
      },
    },
    metadata: { event_id: e.id, quantity },
    payment_intent_data: { metadata: { event_id: e.id } },
    expires_at: expiresAt,
    success_url: `${page}?tickets=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: page,
  })
  // Hold the seats until the session is paid (then the order counts) or expires.
  await query(`insert into ticket_holds (stripe_session_id, event_id, quantity, expires_at) values ($1,$2,$3,to_timestamp($4))`, [
    session.id,
    e.id,
    quantity,
    expiresAt,
  ])
  return session
}

/** Seats taken for an event: paid orders plus live checkout holds. */
export async function seatsTaken(eventId: string): Promise<number> {
  const [{ n }] = await query<{ n: number }>(
    `select (select coalesce(sum(quantity), 0) from orders where event_id = $1 and refunded_at is null)
          + (select coalesce(sum(quantity), 0) from ticket_holds where event_id = $1 and expires_at > now()) as n`,
    [eventId],
  )
  return Number(n)
}

export interface Order {
  id: number
  event_id: string
  name: string | null
  email: string
  quantity: number
  amount_cents: number
}

/**
 * Look the session up at Stripe and save it as an order if it's paid.
 * Returns the order (new or already saved), or null if not paid.
 */
export async function recordSession(sessionId: string): Promise<Order | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null
  const s = await stripe<CheckoutSession>('GET', `/checkout/sessions/${sessionId}`)
  if (s.payment_status !== 'paid') return null
  // Another payment in the same Stripe account, not a ticket from this site.
  if (!s.metadata?.event_id) return null

  const eventId = s.metadata.event_id
  const quantity = Number(s.metadata.quantity) || 1
  const email = s.customer_details?.email ?? ''
  const name = s.customer_details?.name ?? null

  const inserted = await query<Order>(
    `insert into orders (stripe_session_id, payment_intent, event_id, name, email, quantity, amount_cents)
     values ($1,$2,$3,$4,$5,$6,$7) on conflict (stripe_session_id) do nothing returning *`,
    [s.id, s.payment_intent, eventId, name, email, quantity, s.amount_total],
  )
  await query(`delete from ticket_holds where stripe_session_id = $1 or expires_at < now() - interval '1 day'`, [s.id])
  if (!inserted.length) {
    return (await query<Order>(`select * from orders where stripe_session_id = $1`, [s.id]))[0] ?? null
  }

  // First time we've seen this order: send the receipt and tell the owner.
  const order = inserted[0]
  const [ev] = await query<TicketEvent>(`select * from events where id = $1`, [eventId])
  const what = ev ? `${ev.title} on ${ev.date}${ev.time ? `, ${ev.time}` : ''}` : eventId
  const tix = `${quantity} ticket${quantity === 1 ? '' : 's'}`
  await Promise.all([
    email &&
      sendEmail({
        to: [email],
        reply_to: process.env.INQUIRY_TO,
        subject: `Your tickets: ${ev?.title ?? 'Sunset Village'}`,
        text: [
          `Hi${name ? ` ${name.split(' ')[0]}` : ''},`,
          '',
          `You're in. ${tix} for ${what}.`,
          `Total paid: ${dollars(s.amount_total)}`,
          '',
          'There is nothing to print. Give your name at the door.',
          '',
          `Event details: ${SITE_URL}/events/${eventId}`,
          'Sunset Village Music Hall · 4114 Judah St at 46th Ave, San Francisco',
          '(N Judah to 46th Avenue)',
        ].join('\n'),
      }),
    process.env.INQUIRY_TO &&
      sendEmail({
        to: [process.env.INQUIRY_TO],
        subject: `Ticket sale: ${tix} for ${ev?.title ?? eventId}`,
        text: `${name ?? '(no name)'} <${email}> bought ${tix} for ${what}. ${dollars(s.amount_total)}.\n\nDoor list: ${SITE_URL}/admin/tickets`,
      }),
  ]).catch((e) => console.error('order emails failed', e))
  return order
}

/** Seats taken (sold or held at checkout) for each event with online sales. */
export async function soldByEvent(): Promise<Map<string, number>> {
  const rows = await query<{ event_id: string; n: number }>(
    `select event_id, sum(quantity)::int as n from (
       select event_id, quantity from orders where refunded_at is null
       union all
       select event_id, quantity from ticket_holds where expires_at > now()
     ) t group by event_id`,
  )
  return new Map(rows.map((r) => [r.event_id, r.n]))
}
