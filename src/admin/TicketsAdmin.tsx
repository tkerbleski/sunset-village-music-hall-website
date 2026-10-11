// Tickets: online ticket orders (paid through Stripe), grouped by event.
// Doubles as the door list: tick people off as they arrive. Refunds are
// made in Stripe; mark the order refunded here so the seat frees up.

import { useState } from 'react'
import { dollars, fmtDate } from '../data/events'
import { getJson, postJson, type Order, type Setup } from './api'
import { Button, ErrorNote, Notice, PageHead, fmtWhen, input, useLoad } from './ui'

function csv(title: string, orders: Order[]) {
  const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [
    ['Name', 'Email', 'Tickets', 'Paid', 'Bought', 'Checked in', 'Refunded'],
    ...orders.map((o) => [
      o.name ?? '',
      o.email,
      o.quantity,
      (o.amount_cents / 100).toFixed(2),
      fmtWhen(o.created_at),
      o.checked_in ? 'yes' : '',
      o.refunded_at ? 'yes' : '',
    ]),
  ]
  const blob = new Blob([rows.map((r) => r.map(q).join(',')).join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `door-list-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`
  a.click()
}

function OrderRow({ o, onChange }: { o: Order; onChange: () => void }) {
  const [error, setError] = useState('')
  const refunded = Boolean(o.refunded_at)

  async function update(patch: { checkedIn?: boolean; refunded?: boolean }) {
    setError('')
    try {
      await postJson('order-update', { id: o.id, checkedIn: o.checked_in, refunded, ...patch })
      onChange()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <li className={`py-3 ${refunded ? 'opacity-50' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex min-w-[12rem] flex-1 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={o.checked_in}
            disabled={refunded}
            onChange={(e) => update({ checkedIn: e.target.checked })}
            className="h-5 w-5 accent-sunset"
          />
          <span>
            <span className="font-semibold">{o.name || '(no name)'}</span>
            <span className="block text-sm text-ink-soft">{o.email}</span>
          </span>
        </label>
        <span className="font-display text-lg font-bold">× {o.quantity}</span>
        <span className="w-20 text-right text-sm">{refunded ? 'Refunded' : dollars(o.amount_cents)}</span>
        <details className="text-sm">
          <summary className="cursor-pointer text-ink-soft">More</summary>
          <div className="mt-2 space-y-1">
            <p className="text-ink-soft">Bought {fmtWhen(o.created_at)}</p>
            {o.payment_intent && (
              <a
                href={`https://dashboard.stripe.com/payments/${o.payment_intent}`}
                target="_blank"
                rel="noreferrer"
                className="block text-sunset hover:underline"
              >
                Open in Stripe (to refund) ↗
              </a>
            )}
            <Button kind="quiet" className="px-0 py-0 text-sm" onClick={() => update({ refunded: !refunded })}>
              {refunded ? 'Undo refunded' : 'Mark as refunded'}
            </Button>
          </div>
        </details>
      </div>
      <ErrorNote>{error}</ErrorNote>
    </li>
  )
}

export default function TicketsAdmin({ setup, onSignedOut }: { setup: Setup; onSignedOut: () => void }) {
  const { data, error, reload } = useLoad(() => getJson<Order[]>('orders'), onSignedOut)
  const [search, setSearch] = useState('')

  // Orders arrive sorted by event date (newest first), so grouping keeps that order.
  const groups = new Map<string, Order[]>()
  for (const o of data ?? []) groups.set(o.event_id, [...(groups.get(o.event_id) ?? []), o])
  const [picked, setPicked] = useState<string | null>(null)
  const eventId = picked ?? [...groups.keys()][0] ?? null
  const orders = eventId ? groups.get(eventId) ?? [] : []
  const live = orders.filter((o) => !o.refunded_at)
  const term = search.trim().toLowerCase()
  const shown = term ? orders.filter((o) => `${o.name} ${o.email}`.toLowerCase().includes(term)) : orders
  const first = orders[0]

  return (
    <>
      <PageHead title="Tickets" sub="Tickets bought on the website. Use it as the door list on the night." />
      {!setup.payments && (
        <div className="mb-6">
          <Notice>
            Online ticket sales aren’t switched on yet (Stripe isn’t connected). Once it is, give an event an online ticket
            price under Events and a Buy tickets button appears on its page.
          </Notice>
        </div>
      )}
      <ErrorNote>{error}</ErrorNote>
      {data && groups.size === 0 && <p className="py-6 text-ink-soft">No tickets sold yet.</p>}
      {first && (
        <>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Event</span>
            <select value={eventId ?? ''} onChange={(e) => setPicked(e.target.value)} className={input}>
              {[...groups.entries()].map(([id, os]) => (
                <option key={id} value={id}>
                  {os[0].event_date ? `${fmtDate(os[0].event_date)} · ` : ''}
                  {os[0].event_title ?? `${id} (deleted event)`}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Tickets sold', live.reduce((n, o) => n + o.quantity, 0)],
              ['Checked in', live.filter((o) => o.checked_in).reduce((n, o) => n + o.quantity, 0)],
              ['Collected', dollars(live.reduce((n, o) => n + o.amount_cents, 0))],
            ].map(([label, value]) => (
              <div key={label} className="border-2 border-ink bg-card p-3">
                <div className="font-display text-2xl font-bold">{value}</div>
                <div className="text-sm text-ink-soft">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-ink-soft">Collected is before Stripe’s fee (about 3%). Payouts show in your Stripe account.</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a name or email"
              className={`${input} max-w-xs`}
            />
            <Button kind="quiet" onClick={() => csv(first.event_title ?? first.event_id, orders)} className="ml-auto px-0 text-sm">
              Download door list (spreadsheet)
            </Button>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {shown.map((o) => (
              <OrderRow key={o.id} o={o} onChange={reload} />
            ))}
          </ul>
        </>
      )}
    </>
  )
}
