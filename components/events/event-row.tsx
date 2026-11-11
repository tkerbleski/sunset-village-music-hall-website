import Link from 'next/link'
import type { VillageEvent } from '@/lib/data/events'
import { TicketStub } from '@/components/brand/ticket-stub'
import { categoryOf, dateParts, eventHref, priceLine } from '@/lib/events'
import { PrimaryEventButton } from './event-actions'
import { Button } from '@/components/ui/button'
import { primaryAction } from '@/lib/events'

/** Home "Coming up" row: ticket stub, title block, time/price, one button. */
export function EventRow({ event }: { event: VillageEvent }) {
  const price = priceLine(event)
  return (
    <article className="flex flex-wrap items-center gap-x-7 gap-y-4 rounded-row border-2 border-ink bg-card py-4 pr-5 pl-4 transition-transform duration-200 hover:-translate-y-0.5">
      <TicketStub {...dateParts(event.date)} category={categoryOf(event)} />
      <div className="flex min-w-0 flex-[999_1_280px] flex-col gap-1.5">
        {event.kind && <span className="kind">{event.kind}</span>}
        <h3 className="text-heading-lg">
          <Link href={eventHref(event)} className="text-ink no-underline hover:underline">
            {event.title}
          </Link>
        </h3>
        {event.subtitle && <span className="text-base text-ink-2">{event.subtitle}</span>}
      </div>
      <div className="flex-[1_1_160px] font-mono text-sm leading-[1.6]">
        {event.time && <div>{event.time}</div>}
        {price && <div className="font-medium">{price}</div>}
      </div>
      {primaryAction(event) ? (
        <PrimaryEventButton event={event} />
      ) : (
        <Button asChild>
          <Link href={eventHref(event)}>Details</Link>
        </Button>
      )}
    </article>
  )
}
