import { upcomingEvents, pastEvents } from '../data/events'
import { EventRow, EmptyCalendar } from '../components/EventList'
import { usePageMeta } from '../lib/head'

export default function EventsPage() {
  usePageMeta(
    'Calendar | Sunset Village',
    'Upcoming shows, classes, and events at Sunset Village and the Sunset Village Music Hall, 46th & Judah, San Francisco.',
  )
  const upcoming = upcomingEvents()
  const past = pastEvents()

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-12">
      <p className="eyebrow">Events</p>
      <h1 className="mt-1 font-display text-4xl font-black sm:text-6xl">Calendar</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-soft">
        Everything coming up at the Village. Events are announced through the{' '}
        <a href="/#newsletter" className="text-sunset underline">
          newsletter
        </a>{' '}
        first.
      </p>

      <section className="mt-10 border-t-2 border-ink pt-4">
        <h2 className="eyebrow">Upcoming</h2>
        {upcoming.length === 0 ? (
          <EmptyCalendar />
        ) : (
          <div className="divide-y divide-line">
            {upcoming.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-12 border-t-2 border-ink pt-4">
          <h2 className="eyebrow">Recently</h2>
          <div className="divide-y divide-line opacity-80">
            {past.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
