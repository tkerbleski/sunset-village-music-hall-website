'use client'

import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CATEGORIES, categoryLabel, type EventCategory } from '@/components/brand/categories'
import type { VillageEvent } from '@/lib/data/events'
import { categoryOf, groupByMonth } from '@/lib/events'
import { EventCard } from './event-card'
import { MonthHeading } from './month-heading'

type Filter = 'all' | EventCategory

const isFilter = (v: string | null): v is Filter => v === 'all' || CATEGORIES.includes(v as EventCategory)

/** Category chips + month-grouped card grids. The filter is mirrored in ?type= for shareable links. */
export function EventsBrowser({ events, initial }: { events: VillageEvent[]; initial: string | null }) {
  const [filter, setFilter] = useState<Filter>(isFilter(initial) ? initial : 'all')
  const shown = filter === 'all' ? events : events.filter((e) => categoryOf(e) === filter)

  const choose = (v: string) => {
    if (!isFilter(v)) return // ToggleGroup sends '' when the pressed chip is clicked again
    setFilter(v)
    const url = new URL(window.location.href)
    if (v === 'all') url.searchParams.delete('type')
    else url.searchParams.set('type', v)
    window.history.replaceState(null, '', url)
  }

  return (
    <>
      <section className="container-site flex flex-wrap items-center justify-between gap-4 pt-10 pb-6">
        <ToggleGroup type="single" value={filter} onValueChange={choose} aria-label="Filter events" spacing={2.5}>
          <ToggleGroupItem value="all">Everything</ToggleGroupItem>
          {CATEGORIES.map((c) => (
            <ToggleGroupItem key={c} value={c}>
              {categoryLabel[c]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="font-mono text-sm text-ink-2" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'event' : 'events'}
        </span>
      </section>

      {shown.length === 0 && (
        <section className="container-site pt-6 pb-8">
          <p className="rounded-xl border-2 border-dashed border-ink px-7 py-6 text-lede">
            {events.length
              ? 'Nothing in this category right now. Try Everything.'
              : 'Nothing on the calendar just yet. New shows land in the fog report first.'}
          </p>
        </section>
      )}

      {groupByMonth(shown).map((m) => (
        <section key={m.label} className="container-site flex flex-col gap-5 pt-6 pb-8">
          <MonthHeading>{m.label}</MonthHeading>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-5">
            {m.events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
