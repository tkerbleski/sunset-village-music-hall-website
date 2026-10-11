// Buy tickets on the event page. Sends the visitor to Stripe's hosted
// checkout; Stripe sends them back with ?tickets=success, and we confirm the
// order (which also records it, in case the webhook hasn't yet).

import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dollars, type VillageEvent } from '../data/events'

const MAX_PER_ORDER = 10

function Confirmed({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<{ quantity: number; email: string } | 'pending' | 'unknown'>('pending')

  useEffect(() => {
    let tries = 0
    let live = true
    const check = () =>
      fetch(`/api/tickets?action=confirm&session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => live && setState(d))
        .catch(() => {
          if (!live) return
          if (++tries < 5) setTimeout(check, 2000)
          else setState('unknown')
        })
    check()
    return () => {
      live = false
    }
  }, [sessionId])

  return (
    <div className="border-2 border-ink bg-card p-6">
      {state === 'pending' && <p className="font-display text-xl">Confirming your payment…</p>}
      {state === 'unknown' && (
        <>
          <p className="font-display text-2xl font-semibold">Thanks!</p>
          <p className="mt-2 text-ink-soft">
            We’re still confirming your payment. If it went through you’ll get an email receipt from us shortly.
          </p>
        </>
      )}
      {typeof state === 'object' && (
        <>
          <p className="font-display text-2xl font-semibold">You’re in.</p>
          <p className="mt-2 text-ink-soft">
            {state.quantity} ticket{state.quantity === 1 ? '' : 's'}. A receipt is on its way to {state.email}. Nothing to
            print: give your name at the door.
          </p>
        </>
      )}
    </div>
  )
}

export default function TicketBox({ event }: { event: VillageEvent & { ticketPrice: number } }) {
  const [params] = useSearchParams()
  const [qty, setQty] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const sessionId = params.get('session_id')
  if (params.get('tickets') === 'success' && sessionId) return <Confirmed sessionId={sessionId} />

  const left = event.ticketsLeft
  if (left === 0) return <p className="font-display text-xl font-semibold">Sold out.</p>
  const max = Math.min(MAX_PER_ORDER, left ?? MAX_PER_ORDER)

  async function buy() {
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/tickets?action=checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, quantity: qty }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.url) throw new Error(d.error ?? 'Something went wrong. Try again.')
      window.location.href = d.url
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-[15px]">
        <span className="font-semibold">Tickets</span>
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded-[3px] border border-line bg-card px-3 py-2.5"
        >
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <button
        onClick={buy}
        disabled={busy}
        className="rounded-[3px] bg-sunset px-6 py-3 font-semibold text-white transition hover:bg-sunset-deep disabled:opacity-60"
      >
        {busy ? 'One moment…' : `Buy tickets · ${dollars(event.ticketPrice * qty)}`}
      </button>
      {left !== undefined && left <= 15 && <span className="text-sm text-ink-soft">Only {left} left</span>}
      {error && (
        <p role="alert" className="w-full text-[15px] text-sunset-deep">
          {error}
        </p>
      )}
      <p className="w-full text-[13px] text-ink-soft">Secure card payment through Stripe. Your name goes on the door list.</p>
    </div>
  )
}
