'use client'

// One booking inquiry: who, what they asked for, status buttons, private
// notes, archive.

import { useState } from 'react'
import { postJson, type Booking } from '@/lib/admin/api'
import { fmtWhen } from '@/lib/admin/use-load'
import { longDate } from '@/lib/events'
import { ErrorNote, Mono } from '@/components/internal/internal-ui'
import { StatusPill } from '@/components/internal/status-pill'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export const BOOKING_STATUSES: { value: Booking['status']; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'booked', label: 'Booked' },
  { value: 'declined', label: 'Declined' },
]

const asDate = (v?: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? longDate(v) : v)

export function BookingCard({ b, onChange }: { b: Booking; onChange: () => void }) {
  const [notes, setNotes] = useState(b.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [savedNotes, setSavedNotes] = useState(false)

  async function update(patch: Partial<Booking>) {
    setBusy(true)
    setError('')
    try {
      await postJson('booking-update', { id: b.id, status: b.status, notes, ...patch })
      onChange()
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (
      !confirm(
        `Archive the inquiry from ${b.name}? It disappears from this list but stays in your records and weekly backup.`,
      )
    )
      return
    try {
      await postJson('booking-delete', { id: b.id })
      onChange()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const reply = `mailto:${b.email}?subject=${encodeURIComponent('Re: your Sunset Village inquiry')}`
  const needs = (b.needs ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const details: [string, React.ReactNode][] = [
    [
      'Email',
      <a key="e" href={reply} className="break-all">
        {b.email}
      </a>,
    ],
  ]
  if (b.phone)
    details.push([
      'Phone',
      <a key="p" href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>
        {b.phone}
      </a>,
    ])
  if (b.org) details.push(['Organization', b.org])
  if (b.date) details.push(['Date wanted', asDate(b.date)])
  if (b.backup_date) details.push(['Backup date', asDate(b.backup_date)])
  if (b.headcount) details.push(['Headcount', b.headcount])
  if (needs.length)
    details.push([
      'Needs',
      <span key="n" className="flex flex-wrap gap-1.5">
        {needs.map((n) => (
          <Badge key={n} tone="paper" size="sm">
            {n}
          </Badge>
        ))}
      </span>,
    ])

  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-heading-md">{b.name}</h3>
          <p className="mt-0.5 text-ink-2">
            {b.type || 'Inquiry'} · <Mono>sent {fmtWhen(b.created_at)}</Mono>
          </p>
        </div>
        <StatusPill status={b.status}>{BOOKING_STATUSES.find((s) => s.value === b.status)?.label}</StatusPill>
      </div>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5">
        {details.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="label-sm self-center text-ink-2">{k}</dt>
            <dd className="min-w-0">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-l-4 border-sand pl-4 whitespace-pre-wrap">{b.message}</p>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <a href={reply}>Reply by email</a>
          </Button>
          <span className="label-sm ml-1 text-ink-2">Mark as</span>
          {BOOKING_STATUSES.filter((s) => s.value !== b.status).map((s) => (
            <Button key={s.value} variant="outline" size="sm" disabled={busy} onClick={() => update({ status: s.value })}>
              {s.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`notes-${b.id}`}>Private notes</Label>
          <Textarea
            density="compact"
            id={`notes-${b.id}`}
            rows={2}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setSavedNotes(false)
            }}
            placeholder="Only you see these. e.g. “Quoted $400, waiting to hear back.”"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {notes !== (b.notes ?? '') && (
            <Button variant="outline" size="sm" disabled={busy} onClick={async () => setSavedNotes(await update({}))}>
              Save notes
            </Button>
          )}
          {savedNotes && <span className="text-meta text-ink-2">Notes saved.</span>}
          <Button variant="ghost" size="sm" onClick={remove} className="ml-auto">
            Archive
          </Button>
        </div>
        <ErrorNote>{error}</ErrorNote>
      </div>
    </article>
  )
}
