// Events: list upcoming and past, add / edit / duplicate / delete, upload a
// flyer. Saved changes show on the public site within about a minute.

import { useState, type FormEvent } from 'react'
import { dollars, fmtDate, upcomingEvents, pastEvents, type VillageEvent } from '../data/events'
import { getJson, postJson, type Setup } from './api'
import { prepareImage } from './image'
import { Button, ErrorNote, Field, Notice, PageHead, input, useLoad } from './ui'

// The form edits the online price in dollars; the API stores cents.
type Draft = Omit<Partial<VillageEvent>, 'ticketPrice' | 'capacity'> & { ticketPrice?: string; capacity?: string }

const toDraft = (e: Partial<VillageEvent>): Draft => ({
  ...e,
  ticketPrice: e.ticketPrice ? String(e.ticketPrice / 100) : '',
  capacity: e.capacity ? String(e.capacity) : '',
})

function FlyerPicker({
  value,
  onChange,
  enabled,
  title,
}: {
  value?: string
  onChange: (url: string | undefined) => void
  enabled: boolean
  title: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const img = await prepareImage(file)
      const { url } = await postJson<{ url: string }>('upload', { ...img, name: title || 'flyer' })
      onChange(url)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">Flyer</span>
      {value && <img src={value} alt="" className="mb-3 max-h-64 border-2 border-ink" />}
      {enabled ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-[4px] border border-ink bg-card px-4 py-2.5 text-[15px] font-semibold hover:bg-bg">
            {busy ? 'Uploading…' : value ? 'Replace flyer' : 'Upload a flyer'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </label>
          {value && (
            <Button kind="quiet" onClick={() => onChange(undefined)}>
              Remove flyer
            </Button>
          )}
        </div>
      ) : (
        <p className="text-[13px] text-ink-soft">Image uploads aren’t set up yet.</p>
      )}
      <ErrorNote>{error}</ErrorNote>
      <span className="mt-1 block text-[13px] text-ink-soft">Shown on the event’s own page. A photo from your phone is fine.</span>
    </div>
  )
}

function EventForm({
  initial,
  setup,
  onDone,
}: {
  initial: Draft
  setup: Setup
  onDone: (saved?: VillageEvent) => void
}) {
  const [d, setD] = useState<Draft>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value })

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onDone(await postJson<VillageEvent>('event-save', d))
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  async function remove() {
    if (!d.id || !confirm(`Delete “${d.title}”? This removes it from the site.`)) return
    setBusy(true)
    try {
      await postJson('event-delete', { id: d.id })
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <PageHead title={d.id ? 'Edit event' : 'New event'} />
      <Field label="Event name">
        <input required value={d.title ?? ''} onChange={set('title')} className={input} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date">
          <input required type="date" value={d.date ?? ''} onChange={set('date')} className={input} />
        </Field>
        <Field label="Time" hint="Written however you like, e.g. “Doors 7pm” or “6 to 9pm”.">
          <input value={d.time ?? ''} onChange={set('time')} className={input} />
        </Field>
      </div>
      <Field label="Where" hint="Usually the Music Hall. Events at the Music Hall also appear on its page.">
        <input list="venues" value={d.venue ?? ''} onChange={set('venue')} className={input} />
        <datalist id="venues">
          <option value="Music Hall" />
        </datalist>
      </Field>
      <Field label="Short description" hint="One or two sentences. Shown in the calendar lists.">
        <textarea required rows={2} value={d.summary ?? ''} onChange={set('summary')} className={input} />
      </Field>
      <Field label="Full description (optional)" hint="Shown on the event’s own page. Leave blank to reuse the short description.">
        <textarea rows={5} value={d.details ?? ''} onChange={set('details')} className={input} />
      </Field>
      <fieldset className="space-y-5 border-2 border-line p-4">
        <legend className="px-1 text-sm font-semibold">Tickets</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Sell tickets on this site: price ($)"
            hint={
              setup.payments
                ? 'e.g. 15. Shows a Buy tickets button; buyers pay by card through Stripe. Leave blank for none.'
                : 'Works once Stripe is connected. Until then this event uses the link or door price below.'
            }
          >
            <input inputMode="decimal" value={d.ticketPrice ?? ''} onChange={set('ticketPrice')} placeholder="15" className={input} />
          </Field>
          <Field label="Tickets available online" hint="Stops sales at this number. Leave blank for no limit. The hall holds 70.">
            <input inputMode="numeric" value={d.capacity ?? ''} onChange={set('capacity')} placeholder="70" className={input} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Price shown (optional)" hint="e.g. “$10” or “$10 / $15 at the door”. Leave blank for free.">
            <input value={d.price ?? ''} onChange={set('price')} className={input} />
          </Field>
          <Field label="Outside ticket link (optional)" hint="Only if selling somewhere else (Ticket Tailor, Eventbrite).">
            <input type="url" value={d.ticketUrl ?? ''} onChange={set('ticketUrl')} placeholder="https://" className={input} />
          </Field>
        </div>
      </fieldset>
      <FlyerPicker
        value={d.flyer}
        onChange={(flyer) => setD({ ...d, flyer })}
        enabled={setup.uploads}
        title={d.title ?? ''}
      />
      <ErrorNote>{error}</ErrorNote>
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : d.id ? 'Save changes' : 'Add to calendar'}
        </Button>
        <Button kind="secondary" onClick={() => onDone()} disabled={busy}>
          Cancel
        </Button>
        {d.id && (
          <Button kind="danger" onClick={remove} disabled={busy} className="ml-auto">
            Delete event
          </Button>
        )}
      </div>
    </form>
  )
}

function Row({ e, onEdit, onCopy }: { e: VillageEvent; onEdit: () => void; onCopy: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
      <div className="w-28 shrink-0 font-display font-bold text-sunset">{fmtDate(e.date)}</div>
      <div className="min-w-[11rem] flex-1">
        <div className="font-semibold">{e.title}</div>
        <div className="truncate text-sm text-ink-soft">
          {[e.time, e.venue, e.ticketPrice ? `Online tickets ${dollars(e.ticketPrice)}` : e.ticketUrl ? 'Tickets link' : e.price]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
      <div className="flex gap-2">
        <Button kind="secondary" onClick={onEdit} className="py-1.5">
          Edit
        </Button>
        <Button kind="quiet" onClick={onCopy} className="px-2 py-1.5" title="Start a new event with these details">
          Duplicate
        </Button>
      </div>
    </div>
  )
}

export default function EventsAdmin({ setup, onSignedOut }: { setup: Setup; onSignedOut: () => void }) {
  const { data, error, reload } = useLoad(() => getJson<VillageEvent[]>('events'), onSignedOut)
  const [editing, setEditing] = useState<Draft | null>(null)
  const [saved, setSaved] = useState<VillageEvent | null>(null)
  const [showPast, setShowPast] = useState(false)

  if (editing) {
    return (
      <EventForm
        initial={editing}
        setup={setup}
        onDone={(ev) => {
          setEditing(null)
          setSaved(ev ?? null)
          reload()
          window.scrollTo(0, 0)
        }}
      />
    )
  }

  const upcoming = data ? upcomingEvents(data) : []
  const past = data ? pastEvents(data) : []
  const copy = (e: VillageEvent) => {
    // A duplicate is a new event: no id, no date, so nothing is overwritten.
    const { id: _id, date: _date, sample: _s, ...rest } = e
    setEditing(toDraft(rest))
  }

  return (
    <>
      <PageHead
        title="Events"
        sub="The calendar on the website. Changes show up on the site within a minute."
        action={<Button onClick={() => setEditing({ venue: 'Music Hall' })}>+ Add event</Button>}
      />
      {saved && (
        <div className="mb-6">
          <Notice>
            Saved “{saved.title}”.{' '}
            <a href={`/events/${saved.id}`} target="_blank" rel="noreferrer" className="font-semibold text-sunset hover:underline">
              See it on the site ↗
            </a>
          </Notice>
        </div>
      )}
      <ErrorNote>{error}</ErrorNote>
      {data && (
        <>
          <h2 className="eyebrow border-b-2 border-ink pb-2">Coming up ({upcoming.length})</h2>
          {upcoming.length === 0 ? (
            <p className="py-6 text-ink-soft">Nothing on the calendar yet. Add an event to get started.</p>
          ) : (
            <div className="divide-y divide-line">
              {upcoming.map((e) => (
                <Row key={e.id} e={e} onEdit={() => setEditing(toDraft(e))} onCopy={() => copy(e)} />
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div className="mt-10">
              <button onClick={() => setShowPast(!showPast)} className="eyebrow w-full border-b-2 border-ink pb-2 text-left">
                {showPast ? '▾' : '▸'} Past events ({past.length})
              </button>
              {showPast && (
                <div className="divide-y divide-line opacity-80">
                  {past.map((e) => (
                    <Row key={e.id} e={e} onEdit={() => setEditing(toDraft(e))} onCopy={() => copy(e)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
