import type { VillageEvent } from '@/lib/data/events'
import { categoryOf, dateParts, priceLine } from '@/lib/events'
import { PosterArt } from './poster-art'
import { EventActions } from './event-actions'

/** Events page card: poster on the category fill, then kind/title/subtitle/meta and actions. */
export function EventCard({ event }: { event: VillageEvent }) {
  const { dow, day } = dateParts(event.date)
  const meta = [event.time, priceLine(event)].filter(Boolean).join(' · ')
  return (
    <article className="lift flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-card">
      <PosterArt
        category={categoryOf(event)}
        dow={dow}
        day={day}
        flyer={event.flyer}
        title={event.title}
        className="border-b-2 border-dashed border-ink"
      />
      <div className="flex flex-1 flex-col gap-2 px-5 pt-4.5 pb-5">
        {event.kind && <span className="kind">{event.kind}</span>}
        <h3 className="text-heading-card">{event.title}</h3>
        {event.subtitle && <span className="text-base text-ink-2">{event.subtitle}</span>}
        {meta && <p className="meta mt-1">{meta}</p>}
        <EventActions event={event} />
      </div>
    </article>
  )
}
