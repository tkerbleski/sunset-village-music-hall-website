// Vercel serverless function: /api/tickets
//   POST ?action=checkout {eventId, quantity}  → {url} of a Stripe Checkout page
//   GET  ?action=confirm&session_id=cs_…       → the order, once paid (success page)
//   POST ?action=webhook                       → Stripe webhook (checkout.session.completed)
//
// Env: STRIPE_SECRET_KEY, DATABASE_URL. See api/_lib/stripe.ts for why the
// webhook needs no signing secret.

import { query, hasDb } from '../db'
import { hasStripe, createCheckout, recordSession, seatsTaken, type TicketEvent } from '../stripe'
import { str, type VercelReq, type VercelRes } from '../http'

const MAX_PER_ORDER = 10

const todayLA = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })

async function checkout(b: Record<string, unknown>, res: VercelRes) {
  const quantity = Math.floor(Number(b.quantity))
  if (!(quantity >= 1 && quantity <= MAX_PER_ORDER)) {
    return res.status(400).json({ error: `Choose 1 to ${MAX_PER_ORDER} tickets.` })
  }
  const [ev] = await query<TicketEvent & { capacity: number | null }>(`select * from events where id = $1`, [str(b.eventId)])
  if (!ev || !ev.ticket_price_cents) return res.status(404).json({ error: 'Tickets aren’t on sale for this event.' })
  if (ev.date < todayLA()) return res.status(400).json({ error: 'This event has already happened.' })

  if (ev.capacity) {
    // Includes seats held by people still on the checkout page.
    const left = ev.capacity - (await seatsTaken(ev.id))
    if (left <= 0) return res.status(409).json({ error: 'Sold out. Seats held at checkout free up within 30 minutes.' })
    if (quantity > left) return res.status(409).json({ error: `Only ${left} left.` })
  }

  const session = await createCheckout(ev, quantity)
  return res.status(200).json({ url: session.url })
}

export default async function handler(req: VercelReq, res: VercelRes) {
  res.setHeader('Cache-Control', 'no-store')
  if (!hasDb() || !hasStripe()) return res.status(503).json({ error: 'Online tickets aren’t set up yet.' })

  const action = str(req.query?.action)
  const b = (req.body ?? {}) as Record<string, any>
  try {
    if (action === 'checkout' && req.method === 'POST') return await checkout(b, res)

    if (action === 'confirm') {
      const order = await recordSession(str(req.query?.session_id))
      if (!order) return res.status(404).json({ error: 'Payment not found yet.' })
      return res.status(200).json({ quantity: order.quantity, email: order.email })
    }

    if (action === 'webhook' && req.method === 'POST') {
      if (b.type === 'checkout.session.completed' || b.type === 'checkout.session.async_payment_succeeded') {
        await recordSession(str(b.data?.object?.id))
      }
      return res.status(200).json({ received: true })
    }

    return res.status(404).json({ error: 'Unknown action' })
  } catch (e) {
    console.error(`tickets ${action} failed`, e)
    return res.status(500).json({ error: 'Something went wrong. Try again in a moment.' })
  }
}
