import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { VillageEvent } from '@/lib/data/events'
import { eventHref, primaryAction } from '@/lib/events'

/** The event's main button (ink), styled as a link. */
export function PrimaryEventButton({ event, size }: { event: VillageEvent; size?: 'md' | 'default' }) {
  const a = primaryAction(event)
  if (!a) return null
  return (
    <Button asChild size={size}>
      {a.external ? (
        <a href={a.href} target="_blank" rel="noopener">
          {a.label} ↗
        </a>
      ) : (
        <Link href={a.href}>{a.label}</Link>
      )}
    </Button>
  )
}

/** Main action + "Details". When there's no main action, Details becomes the ink button. */
export function EventActions({ event }: { event: VillageEvent }) {
  const a = primaryAction(event)
  const detailsIsPrimary = !a || (!a.external && a.href === eventHref(event) && !event.cta && !event.ticketPrice)
  return (
    <div className="mt-auto flex flex-wrap gap-2 pt-3">
      <PrimaryEventButton event={event} size="md" />
      <Button asChild size="md" variant={a && !detailsIsPrimary ? 'outline' : 'default'}>
        <Link href={eventHref(event)}>Details</Link>
      </Button>
    </div>
  )
}
