// Bookings: inquiries sent from the Music Hall form. Each can be marked
// replied / booked / declined and carry private notes.

import { useState, type FormEvent } from 'react'
import { fmtDateLong } from '../data/events'
import { getJson, postJson, type Booking } from './api'
import { Button, ErrorNote, Field, Notice, PageHead, fmtWhen, input, useLoad } from './ui'

const STATUSES: { value: Booking['status']; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'booked', label: 'Booked' },
  { value: 'declined', label: 'Declined' },
]

const statusStyle: Record<Booking['status'], string> = {
  new: 'bg-sunset text-white',
  replied: 'bg-gold text-ink',
  booked: 'bg-dusk text-white',
  declined: 'bg-line text-ink-soft',
}

function BookingCard({ b, onChange }: { b: Booking; onChange: () => void }) {
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
    if (!confirm(`Archive the inquiry from ${b.name}? It disappears from this list but stays in your records and weekly backup.`)) return
    try {
      await postJson('booking-delete', { id: b.id })
      onChange()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const reply = `mailto:${b.email}?subject=${encodeURIComponent(`Re: your Sunset Village inquiry`)}`
  const requested = /^\d{4}-\d{2}-\d{2}$/.test(b.date ?? '') ? fmtDateLong(b.date!) : b.date

  return (
    <article className="border-2 border-ink bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold">{b.name}</h3>
          <p className="text-sm text-ink-soft">
            {b.type || 'Inquiry'} · sent {fmtWhen(b.created_at)}
          </p>
        </div>
        <span className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] ${statusStyle[b.status]}`}>
          {STATUSES.find((s) => s.value === b.status)?.label}
        </span>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-1 text-[15px] sm:grid-cols-[auto_1fr]">
        <dt className="font-semibold">Email</dt>
        <dd>
          <a href={reply} className="text-sunset hover:underline">
            {b.email}
          </a>
        </dd>
        {requested && (
          <>
            <dt className="font-semibold">Date wanted</dt>
            <dd>{requested}</dd>
          </>
        )}
        {b.headcount && (
          <>
            <dt className="font-semibold">Headcount</dt>
            <dd>{b.headcount}</dd>
          </>
        )}
      </dl>
      <p className="mt-4 whitespace-pre-wrap border-l-4 border-line pl-4 leading-relaxed">{b.message}</p>

      <div className="mt-5 space-y-3 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <a href={reply} className="rounded-[4px] bg-sunset px-4 py-2 text-[15px] font-semibold text-white hover:bg-sunset-deep">
            Reply by email
          </a>
          <span className="ml-2 text-sm font-semibold">Mark as:</span>
          {STATUSES.filter((s) => s.value !== b.status).map((s) => (
            <Button key={s.value} kind="secondary" disabled={busy} onClick={() => update({ status: s.value })} className="px-3 py-1.5 text-sm">
              {s.label}
            </Button>
          ))}
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Private notes</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              setSavedNotes(false)
            }}
            placeholder="Only you see these. e.g. “Quoted $400, waiting to hear back.”"
            className={input}
          />
        </label>
        <div className="flex items-center gap-3">
          {notes !== (b.notes ?? '') && (
            <Button kind="secondary" disabled={busy} onClick={async () => setSavedNotes(await update({}))} className="py-1.5 text-sm">
              Save notes
            </Button>
          )}
          {savedNotes && <span className="text-sm text-ink-soft">Notes saved.</span>}
          <Button kind="quiet" onClick={remove} className="ml-auto px-0 text-sm">
            Archive
          </Button>
        </div>
        <ErrorNote>{error}</ErrorNote>
      </div>
    </article>
  )
}

// Which form the Music Hall page shows: this site's own (inquiries land on
// this screen) or a Google Form (responses go to the owner's Google account).
function FormChoice({ onSignedOut }: { onSignedOut: () => void }) {
  const { data, reload } = useLoad(() => getJson<Record<string, string>>('settings'), onSignedOut)
  const current = data?.booking_form_url ?? ''
  const [mode, setMode] = useState<'site' | 'google' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  if (!data) return null
  const shown = mode ?? (current ? 'google' : 'site')

  async function save(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault()
    const url = e ? String(new FormData(e.currentTarget).get('url') ?? '') : ''
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      await postJson('booking-form', { url })
      setSaved(true)
      setMode(null)
      reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="mb-8 border-2 border-ink bg-card p-4" open={mode !== null || undefined}>
      <summary className="cursor-pointer font-semibold">
        Booking form on the website:{' '}
        <span className="text-sunset">{current ? 'your Google Form' : 'built-in form'}</span>
      </summary>
      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button kind={shown === 'site' ? 'primary' : 'secondary'} className="py-1.5 text-sm" onClick={() => setMode('site')}>
            Built-in form
          </Button>
          <Button kind={shown === 'google' ? 'primary' : 'secondary'} className="py-1.5 text-sm" onClick={() => setMode('google')}>
            Google Form
          </Button>
        </div>
        {shown === 'site' ? (
          <>
            <p className="text-[15px] text-ink-soft">
              {current ? 'The site’s own form. Inquiries show up on this page.' : 'The site uses its own form now. Inquiries show up on this page.'}
            </p>
            {current && (
              <Button disabled={busy} onClick={() => save()}>
                {busy ? 'Saving…' : 'Switch back to the built-in form'}
              </Button>
            )}
          </>
        ) : (
          <form onSubmit={save} className="space-y-3">
            <Field
              label="Google Form link"
              hint="In Google Forms click Send, then the link icon. Untick “Shorten URL” so the form shows right on the page, then copy and paste it here. Responses go to your Google Form, not this page."
            >
              <input name="url" type="url" required defaultValue={current} placeholder="https://docs.google.com/forms/…" className={input} />
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : current ? 'Save link' : 'Use this Google Form'}
            </Button>
          </form>
        )}
        <ErrorNote>{error}</ErrorNote>
        {saved && <Notice>Saved. The Music Hall page updates within a minute.</Notice>}
      </div>
    </details>
  )
}

export default function BookingsAdmin({ onSignedOut, onChange }: { onSignedOut: () => void; onChange: () => void }) {
  const { data, error, reload } = useLoad(() => getJson<Booking[]>('bookings'), onSignedOut)
  const [filter, setFilter] = useState<'open' | 'all'>('open')

  const shown = (data ?? []).filter((b) => filter === 'all' || b.status === 'new' || b.status === 'replied')
  const changed = () => {
    reload()
    onChange() // refresh the "new" badge in the header
  }

  return (
    <>
      <PageHead title="Bookings" sub="Inquiries sent through the form on the Music Hall page." />
      <FormChoice onSignedOut={onSignedOut} />
      <div className="mb-5 flex gap-2">
        {(['open', 'all'] as const).map((f) => (
          <Button key={f} kind={filter === f ? 'primary' : 'secondary'} onClick={() => setFilter(f)} className="py-1.5 text-sm">
            {f === 'open' ? 'Needs attention' : `All (${data?.length ?? 0})`}
          </Button>
        ))}
      </div>
      <ErrorNote>{error}</ErrorNote>
      {data && shown.length === 0 && (
        <p className="py-6 text-ink-soft">
          {filter === 'open' ? 'You’re all caught up. Nothing new or waiting on a reply.' : 'No inquiries yet.'}
        </p>
      )}
      <div className="space-y-5">
        {shown.map((b) => (
          <BookingCard key={b.id} b={b} onChange={changed} />
        ))}
      </div>
    </>
  )
}
