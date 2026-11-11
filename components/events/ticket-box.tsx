'use client'

// Buy tickets on the event page. Sends the visitor to Stripe's hosted
// checkout; Stripe sends them back with ?tickets=success, and we confirm the
// order (which also records it, in case the webhook hasn't yet).

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Sparkle } from '@/components/brand/sparkle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { dollars } from '@/lib/events'
import type { VillageEvent } from '@/lib/data/events'

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
    <div role="status" className="flex flex-col items-start gap-3">
      {state === 'pending' && <p className="text-heading-md">Confirming your payment…</p>}
      {state === 'unknown' && (
        <>
          <p className="text-heading-lg">Thanks!</p>
          <p className="text-ink-2">
            We’re still confirming your payment. If it went through you’ll get an email receipt shortly.
          </p>
        </>
      )}
      {typeof state === 'object' && (
        <>
          <Sparkle size={44} className="text-sun" />
          <p className="text-heading-lg">You’re in.</p>
          <p className="text-ink-2">
            {state.quantity} ticket{state.quantity === 1 ? '' : 's'}. A receipt is on its way to {state.email}. Nothing
            to print: give your name at the door.
          </p>
        </>
      )}
    </div>
  )
}

export function TicketBox({ event }: { event: VillageEvent & { ticketPrice: number } }) {
  const params = useSearchParams()
  const [qty, setQty] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const sessionId = params.get('session_id')
  if (params.get('tickets') === 'success' && sessionId) return <Confirmed sessionId={sessionId} />

  const left = event.ticketsLeft
  if (left === 0) return <p className="text-heading-md">Sold out.</p>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex w-28 flex-col gap-1.5">
          <Label htmlFor="qty">Tickets</Label>
          <Select value={String(qty)} onValueChange={(v) => setQty(Number(v))}>
            <SelectTrigger id="qty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="sun" size="lg" onClick={buy} disabled={busy}>
          {busy ? 'One moment…' : `${event.cta || 'Buy tickets'} · ${dollars(event.ticketPrice * qty)}`}
        </Button>
      </div>
      {left !== undefined && left <= 15 && <p className="meta">Only {left} left</p>}
      {error && <Alert variant="destructive">{error}</Alert>}
      <p className="text-ui text-ink-2">Secure card payment through Stripe. Your name goes on the door list.</p>
    </div>
  )
}
