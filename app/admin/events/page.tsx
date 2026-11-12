'use client'

// Events: list upcoming and past, add / edit / duplicate / delete, upload a
// flyer. Saved changes show on the public site within about a minute.

import { useState } from 'react'
import { getJson, postJson } from '@/lib/admin/api'
import { useLoad } from '@/lib/admin/use-load'
import { dollars, eventHref, past as pastEvents, upcoming as upcomingEvents } from '@/lib/events'
import type { VillageEvent } from '@/lib/data/events'
import { categoryLabel } from '@/components/brand/categories'
import { useAdmin } from '@/components/internal/admin-shell'
import { EmptyState, ErrorNote, Mono, PageHeader, Panel } from '@/components/internal/internal-ui'
import { EventForm, toDraft, type EventDraft } from '@/components/internal/admin/event-form'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const TONE = { music: 'sun', dj: 'yellow', community: 'teal', workshop: 'pink' } as const

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

function Row({ e, onEdit, onCopy }: { e: VillageEvent; onEdit: () => void; onCopy: () => void }) {
  const cat = e.category ?? 'music'
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
      <Mono className="w-28 shrink-0 font-medium">{shortDate(e.date)}</Mono>
      <div className="min-w-0 flex-1 basis-56">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{e.title}</span>
          <Badge tone={TONE[cat]} size="sm">
            {categoryLabel[cat]}
          </Badge>
        </div>
        <div className="truncate text-meta text-ink-2">
          {[e.time, e.venue, e.ticketPrice ? `Online tickets ${dollars(e.ticketPrice)}` : e.ticketUrl ? 'Tickets link' : e.price]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onCopy} title="Start a new event with these details">
          Duplicate
        </Button>
      </div>
    </li>
  )
}

export default function EventsPage() {
  const { me, signedOut } = useAdmin()
  const { data, error, reload } = useLoad(() => getJson<VillageEvent[]>('events'), signedOut)
  const [editing, setEditing] = useState<EventDraft | null>(null)
  const [saved, setSaved] = useState<(VillageEvent & { calendar?: 'synced' | 'failed' | 'off' }) | null>(null)
  const [syncNote, setSyncNote] = useState('')
  const [syncing, setSyncing] = useState(false)

  async function syncCalendar() {
    setSyncing(true)
    setSyncNote('')
    try {
      const r = await postJson<{ synced: number; total: number }>('calendar-sync', {})
      setSyncNote(
        r.synced === r.total
          ? `Google Calendar is up to date (${r.total} upcoming ${r.total === 1 ? 'event' : 'events'}).`
          : `Updated ${r.synced} of ${r.total} events in Google Calendar. Try again in a minute.`,
      )
    } catch (e) {
      setSyncNote((e as Error).message)
    } finally {
      setSyncing(false)
    }
  }
  const [showPast, setShowPast] = useState(false)

  if (editing) {
    return (
      <>
        <PageHeader title={editing.id ? 'Edit event' : 'New event'} />
        <EventForm
          initial={editing}
          setup={me}
          onDone={(ev) => {
            setEditing(null)
            setSaved(ev ?? null)
            reload()
            window.scrollTo(0, 0)
          }}
        />
      </>
    )
  }

  const upcoming = data ? upcomingEvents(data) : []
  const past = data ? pastEvents(data) : []
  const edit = (e: VillageEvent) => {
    setSaved(null)
    setEditing(toDraft(e))
  }
  const copy = (e: VillageEvent) => {
    // A duplicate is a new event: no id, no date, so nothing is overwritten.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, date: _date, sample: _s, ...rest } = e
    setSaved(null)
    setEditing(toDraft(rest))
  }

  return (
    <>
      <PageHeader
        title="Events"
        description="The calendar on the website. Changes show up on the site within a minute."
        actions={
          <>
            {me.calendar && (
              <Button size="sm" variant="outline" onClick={syncCalendar} disabled={syncing}>
                {syncing ? 'Syncing…' : 'Sync Google Calendar'}
              </Button>
            )}
            <Button size="sm" onClick={() => setEditing({ venue: 'Music Hall', category: 'music' })}>
              + Add event
            </Button>
          </>
        }
      />
      {saved && (
        <Alert variant="info" className="mb-5 font-normal">
          Saved “{saved.title}”.{' '}
          <a href={eventHref(saved)} target="_blank" rel="noreferrer" className="font-semibold">
            See it on the site ↗
          </a>
          {saved.calendar === 'synced' && ' Google Calendar is updated too.'}
        </Alert>
      )}
      {saved?.calendar === 'failed' && (
        <Alert variant="warning" className="mb-5 font-normal">
          The event is saved, but Google Calendar didn’t update. Use “Sync Google Calendar” to try again.
        </Alert>
      )}
      {syncNote && (
        <Alert variant="info" className="mb-5 font-normal">
          {syncNote}
        </Alert>
      )}
      <ErrorNote>{error}</ErrorNote>
      {data && (
        <div className="flex flex-col gap-5">
          <Panel title={`Coming up (${upcoming.length})`}>
            {upcoming.length === 0 ? (
              <EmptyState>Nothing on the calendar yet. Add an event to get started.</EmptyState>
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.map((e) => (
                  <Row key={e.id} e={e} onEdit={() => edit(e)} onCopy={() => copy(e)} />
                ))}
              </ul>
            )}
          </Panel>
          {past.length > 0 && (
            <Panel
              title={`Past events (${past.length})`}
              action={
                <Button variant="ghost" size="sm" onClick={() => setShowPast(!showPast)} aria-expanded={showPast}>
                  {showPast ? 'Hide' : 'Show'}
                </Button>
              }
            >
              {showPast ? (
                <ul className="divide-y divide-border text-ink-2">
                  {past.map((e) => (
                    <Row key={e.id} e={e} onEdit={() => edit(e)} onCopy={() => copy(e)} />
                  ))}
                </ul>
              ) : (
                <p className="text-ink-2">Hidden. Open to edit or duplicate a past event.</p>
              )}
            </Panel>
          )}
        </div>
      )}
    </>
  )
}
