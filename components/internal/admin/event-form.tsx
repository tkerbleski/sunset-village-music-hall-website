'use client'

// Add / edit one event. The form edits the online price in dollars; the API
// stores cents.

import { useState, type FormEvent } from 'react'
import { postJson, type Setup } from '@/lib/admin/api'
import type { EventCategory, VillageEvent } from '@/lib/data/events'
import { CATEGORIES, categoryLabel } from '@/components/brand/categories'
import { ErrorNote, FormField, Panel } from '@/components/internal/internal-ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImagePicker } from './image-picker'

export type EventDraft = Omit<Partial<VillageEvent>, 'ticketPrice' | 'capacity'> & {
  ticketPrice?: string
  capacity?: string
}

export const toDraft = (e: Partial<VillageEvent>): EventDraft => ({
  ...e,
  ticketPrice: e.ticketPrice ? String(e.ticketPrice / 100) : '',
  capacity: e.capacity ? String(e.capacity) : '',
})

export function EventForm({
  initial,
  setup,
  onDone,
}: {
  initial: EventDraft
  setup: Setup
  onDone: (saved?: VillageEvent) => void
}) {
  const [d, setD] = useState<EventDraft>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k: keyof EventDraft) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value })

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
    <form onSubmit={save} className="flex flex-col gap-5">
      <Panel title="The event">
        <div className="flex flex-col gap-4">
          <FormField label="Event name" htmlFor="ev-title">
            <Input density="compact" id="ev-title" required value={d.title ?? ''} onChange={set('title')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Category" htmlFor="ev-category" hint="Sets the color and the filter on the Events page.">
              <Select value={d.category ?? 'music'} onValueChange={(v) => setD({ ...d, category: v as EventCategory })}>
                <SelectTrigger id="ev-category" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabel[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Kind line (optional)" htmlFor="ev-kind" hint="Small line above the title, e.g. “Live music · Indie rock”.">
              <Input density="compact" id="ev-kind" value={d.kind ?? ''} onChange={set('kind')} />
            </FormField>
          </div>
          <FormField label="Subtitle (optional)" htmlFor="ev-subtitle" hint="One line under the title, e.g. “with Low Tide Choir”.">
            <Input density="compact" id="ev-subtitle" value={d.subtitle ?? ''} onChange={set('subtitle')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Date" htmlFor="ev-date">
              <Input density="compact" id="ev-date" required type="date" value={d.date ?? ''} onChange={set('date')} />
            </FormField>
            <FormField label="Time" htmlFor="ev-time" hint="Written however you like, e.g. “Doors 7pm” or “6 to 9pm”.">
              <Input density="compact" id="ev-time" value={d.time ?? ''} onChange={set('time')} />
            </FormField>
          </div>
          <FormField
            label="Where"
            htmlFor="ev-venue"
            hint="Usually the Music Hall."
          >
            <Input density="compact" id="ev-venue" list="venues" value={d.venue ?? ''} onChange={set('venue')} />
            <datalist id="venues">
              <option value="Music Hall" />
            </datalist>
          </FormField>
          <FormField label="Short description" htmlFor="ev-summary" hint="One or two sentences. Shown in the calendar lists.">
            <Textarea density="compact" id="ev-summary" required rows={2} value={d.summary ?? ''} onChange={set('summary')} />
          </FormField>
          <FormField
            label="Full description (optional)"
            htmlFor="ev-details"
            hint="Shown on the event’s own page. Leave blank to reuse the short description."
          >
            <Textarea density="compact" id="ev-details" rows={5} value={d.details ?? ''} onChange={set('details')} />
          </FormField>
        </div>
      </Panel>

      <Panel title="Tickets">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Sell tickets on this site: price ($)"
              htmlFor="ev-ticketPrice"
              hint={
                setup.payments
                  ? 'e.g. 15. Shows a Buy tickets button; buyers pay by card through Stripe. Leave blank for none.'
                  : 'Works once Stripe is connected. Until then this event uses the link or door price below.'
              }
            >
              <Input
                density="compact"
                id="ev-ticketPrice"
                inputMode="decimal"
                value={d.ticketPrice ?? ''}
                onChange={set('ticketPrice')}
                placeholder="15"
              />
            </FormField>
            <FormField
              label="Tickets available online"
              htmlFor="ev-capacity"
              hint="Stops sales at this number. Leave blank for no limit."
            >
              <Input
                density="compact"
                id="ev-capacity"
                inputMode="numeric"
                value={d.capacity ?? ''}
                onChange={set('capacity')}
                placeholder="70"
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Price shown (optional)"
              htmlFor="ev-price"
              hint="e.g. “$10” or “$10 / $15 at the door”. Leave blank for free."
            >
              <Input density="compact" id="ev-price" value={d.price ?? ''} onChange={set('price')} />
            </FormField>
            <FormField
              label="Outside ticket link (optional)"
              htmlFor="ev-ticketUrl"
              hint="Only if selling somewhere else (Ticket Tailor, Eventbrite)."
            >
              <Input
                density="compact"
                id="ev-ticketUrl"
                type="url"
                value={d.ticketUrl ?? ''}
                onChange={set('ticketUrl')}
                placeholder="https://"
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Button label (optional)"
              htmlFor="ev-cta"
              hint="e.g. “Get tickets” or “RSVP”. Leave blank for “Get tickets”."
            >
              <Input density="compact" id="ev-cta" value={d.cta ?? ''} onChange={set('cta')} />
            </FormField>
          </div>
        </div>
      </Panel>

      <Panel>
        <ImagePicker
          label="Flyer"
          noun="flyer"
          value={d.flyer}
          onChange={(flyer) => setD({ ...d, flyer })}
          enabled={setup.uploads}
          name={d.title ?? ''}
          hint="Shown on the event’s own page. A photo from your phone is fine."
        />
      </Panel>

      <ErrorNote>{error}</ErrorNote>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? 'Saving…' : d.id ? 'Save changes' : 'Add to calendar'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onDone()} disabled={busy}>
          Cancel
        </Button>
        {d.id && (
          <Button type="button" variant="destructive" size="sm" onClick={remove} disabled={busy} className="ml-auto">
            Delete event
          </Button>
        )}
      </div>
    </form>
  )
}
