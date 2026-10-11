import { upcomingEvents } from '../data/events'
import { useContent } from '../lib/content'
import { EventRow } from '../components/EventList'
import BookingForm from '../components/BookingForm'
import { usePageMeta } from '../lib/head'
import { site } from '../data/site'

const GOOD_FOR = [
  'Live music',
  'Talks and readings',
  'Screenings',
  'Workshops and classes',
  'Receptions and parties',
  'Community meetings',
]

export default function MusicHallPage() {
  usePageMeta(
    'Sunset Village Music Hall | 46th & Judah, San Francisco',
    'A music venue and event space in a former church sanctuary at 4114 Judah St. About 2,500 sq ft. Inquire about shows, workshops, and private events.',
  )
  const hallEvents = upcomingEvents(useContent().events).filter((e) => e.venue === 'Music Hall').slice(0, 3)

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-12">
      <p className="eyebrow">The venue</p>
      <h1 className="mt-1 max-w-3xl font-display text-4xl font-black leading-[1.02] sm:text-6xl">
        Sunset Village Music Hall
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        A hall in the former church sanctuary at {site.address.street}. Live
        music, talks, screenings, workshops, and private events.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_20rem]">
        <div>
          {/* Interior photos slot in here once shot. */}
          <figure>
            <div className="flex aspect-[16/9] w-full items-center justify-center border-2 border-dashed border-line bg-card">
              <p className="px-4 text-center text-sm text-ink-soft">Photos of the hall coming soon</p>
            </div>
          </figure>

          <section className="mt-10 border-t-2 border-ink pt-4">
            <h2 className="eyebrow">The room</h2>
            <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
              The hall is the old sanctuary, about 2,500 square feet, with room
              for around 70 people. It works set up with rows of seats, standing
              for a show, or cleared out entirely.
            </p>
          </section>

          <section className="mt-10 border-t-2 border-ink pt-4">
            <h2 className="eyebrow">Good for</h2>
            <ul className="mt-2 grid max-w-xl grid-cols-2 gap-x-6 gap-y-1.5 leading-relaxed text-ink-soft">
              {GOOD_FOR.map((g) => (
                <li key={g} className="border-b border-line pb-1.5">
                  {g}
                </li>
              ))}
            </ul>
          </section>

          {hallEvents.length > 0 && (
            <section className="mt-10 border-t-2 border-ink pt-4">
              <h2 className="eyebrow">Coming up in the hall</h2>
              <div className="divide-y divide-line">
                {hallEvents.map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside id="inquire" className="scroll-mt-20 md:sticky md:top-20 md:self-start">
          <div className="border-2 border-ink bg-card p-6">
            <h2 className="font-display text-2xl font-bold">Use the hall</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Booking a show, planning a party, or teaching something? Tell us
              what you have in mind and we'll follow up about dates. Or email{' '}
              <a href={`mailto:${site.bookingEmail}`} className="text-sunset hover:underline">
                {site.bookingEmail}
              </a>
              .
            </p>
            <div className="mt-5">
              <BookingForm />
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
