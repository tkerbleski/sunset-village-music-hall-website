import { Link, useParams } from 'react-router-dom'
import { dollars, fmtDateLong, sellsOnline } from '../data/events'
import { useContent } from '../lib/content'
import { usePageMeta } from '../lib/head'
import { site } from '../data/site'
import TicketBox from '../components/TicketBox'

export default function EventDetailPage() {
  const { id } = useParams()
  const { ready, events } = useContent()
  const event = events.find((e) => e.id === id)
  usePageMeta(
    event ? `${event.title} | Sunset Village` : 'Event | Sunset Village',
    event?.summary,
  )

  if (!ready) return <main className="min-h-[60vh]" />

  if (!event) {
    return (
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-16 text-center">
        <h1 className="font-display text-4xl font-bold">Event not found</h1>
        <p className="mt-3 text-ink-soft">It may have been removed or renamed.</p>
        <Link to="/events" className="mt-6 inline-block font-semibold text-sunset hover:underline">
          Back to the calendar
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-12">
      <Link to="/events" className="text-sm font-medium text-ink-soft hover:text-ink">
        ← All events
      </Link>
      <p className="eyebrow mt-6">
        {fmtDateLong(event.date)}
        {event.time ? ` · ${event.time}` : ''}
      </p>
      <h1 className="mt-2 font-display text-4xl font-black leading-tight sm:text-5xl">
        {event.title}
      </h1>
      {event.sample && (
        <p className="mt-3 inline-block border border-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em]">
          Example listing. Real programming is announced on the calendar.
        </p>
      )}
      {event.flyer && (
        <img
          src={event.flyer}
          alt={`Flyer for ${event.title}`}
          className="mt-6 w-full max-w-md border-2 border-ink"
        />
      )}
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
        {event.details ?? event.summary}
      </p>
      <div className="mt-6 border-t border-line pt-4 text-[15px] leading-7 text-ink-soft">
        <p>
          <span className="font-semibold text-ink">Where:</span> {event.venue}, Sunset Village,{' '}
          {site.address.street}
        </p>
        {(event.price || event.ticketPrice) && (
          <p>
            <span className="font-semibold text-ink">Price:</span> {event.price || dollars(event.ticketPrice!)}
          </p>
        )}
      </div>
      <div id="tickets" className="mt-6 scroll-mt-24">
        {event.ticketPrice && sellsOnline(event) ? (
          <TicketBox event={{ ...event, ticketPrice: event.ticketPrice }} />
        ) : event.ticketUrl ? (
          <a
            href={event.ticketUrl}
            className="inline-block rounded-[3px] bg-sunset px-6 py-3 font-semibold text-white transition hover:bg-sunset-deep"
          >
            Get tickets{event.price ? ` ${event.price}` : ''}
          </a>
        ) : (
          <p className="text-[15px] text-ink-soft">
            {event.price ? `${event.price} at the door.` : 'Free.'} No advance tickets for this one.
          </p>
        )}
      </div>
    </main>
  )
}
