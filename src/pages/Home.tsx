import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { upcomingEvents } from '../data/events'
import { tenants, tenantsFootnote, hourLines, isOpenNow } from '../data/tenants'
import { site } from '../data/site'
import { EventRow, EmptyCalendar } from '../components/EventList'
import StatusTag from '../components/StatusTag'
import NewsletterForm from '../components/NewsletterForm'
import { usePageMeta } from '../lib/head'

function SectionHead({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return (
    <div id={id} className="scroll-mt-20 border-t-2 border-ink pt-5">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
    </div>
  )
}

export default function Home() {
  usePageMeta(
    'Sunset Village | Music, shops, and events at 46th & Judah, Outer Sunset',
    'Sunset Village is a collection of small shops, music, classes, and events in a former church at 4114 Judah St, San Francisco. Home of the Sunset Village Music Hall.',
  )
  const upcoming = upcomingEvents().slice(0, 4)

  // Respect reduced-motion: hold on the poster frame instead of playing.
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.pause()
    }
  }, [])

  return (
    <main>
      {/* Hero: full-bleed video of the sunset over the Judah terminus. */}
      <section className="relative flex min-h-[72svh] items-center justify-center overflow-hidden border-b-2 border-ink bg-dusk sm:min-h-[80svh]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src="/video/hero.mp4"
          poster="/video/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-ink/20" />
        <div className="relative px-5 py-16 text-center text-bg">
          <p className="eyebrow !text-bg/90 [text-shadow:0_1px_10px_rgba(20,18,35,0.8)]">
            46th Ave &amp; Judah St · {site.address.neighborhood}, San Francisco
          </p>
          <h1 className="mt-3 font-hero text-6xl leading-[0.95] [text-shadow:0_2px_28px_rgba(20,18,35,0.55)] sm:text-8xl">
            Sunset Village
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-bg/95 [text-shadow:0_1px_10px_rgba(20,18,35,0.8)]">
            Music, shops, classes, and other things happening in a former
            church a few blocks from the beach.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/events"
              className="rounded-[3px] bg-sunset px-5 py-3 font-semibold text-white transition hover:bg-sunset-deep"
            >
              See what's on
            </Link>
            <Link
              to="/music-hall"
              className="rounded-[3px] bg-bg/95 px-5 py-3 font-semibold text-ink transition hover:bg-bg"
            >
              Book the Music Hall
            </Link>
          </div>
        </div>
      </section>

      {/* What's on */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHead eyebrow="Calendar" title="What's on" />
        {upcoming.length === 0 ? (
          <EmptyCalendar />
        ) : (
          <div className="mt-2 divide-y divide-line">
            {upcoming.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </div>
        )}
        <div className="border-t border-line pt-4">
          <Link to="/events" className="font-semibold text-sunset hover:underline">
            Full calendar
          </Link>
        </div>
      </section>

      {/* What's here */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHead eyebrow="Shops & spaces" title="What's here" id="whats-here" />
        <div className="mt-2 divide-y divide-line">
          {tenants.map((t) => (
            <article key={t.id} className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[1fr_16rem]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl font-semibold">{t.name}</h3>
                  <StatusTag status={t.status} openNow={isOpenNow(t)} />
                </div>
                <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">{t.blurb}</p>
                {t.link &&
                  (t.link.startsWith('/') ? (
                    <Link to={t.link} className="mt-2 inline-block font-medium text-sunset hover:underline">
                      {t.linkLabel ?? 'More'}
                    </Link>
                  ) : (
                    <a href={t.link} className="mt-2 inline-block font-medium text-sunset hover:underline">
                      {t.linkLabel ?? 'Website'}
                    </a>
                  ))}
              </div>
              <div className="text-sm leading-6 text-ink-soft sm:pt-1.5 sm:text-right">
                {t.hours ? hourLines(t.hours).map((l) => <div key={l}>{l}</div>) : t.hoursNote}
              </div>
            </article>
          ))}
        </div>
        <p className="border-t border-line pt-4 text-[15px] text-ink-soft">{tenantsFootnote}</p>
      </section>

      {/* Music Hall */}
      <section className="mt-16 bg-ink py-16 text-bg sm:mt-20 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="eyebrow !text-gold">The Music Hall</p>
          <h2 className="mt-1 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            Have something you want to do here?
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-bg/80">
            The Music Hall can host shows, talks, workshops, screenings, and
            private events. Tell us what you have in mind.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/music-hall#inquire"
              className="rounded-[3px] bg-gold px-5 py-3 font-semibold text-ink transition hover:bg-bg"
            >
              Inquire about the space
            </Link>
            <Link
              to="/music-hall"
              className="rounded-[3px] border-2 border-bg/40 px-5 py-3 font-semibold text-bg transition hover:border-bg"
            >
              About the hall
            </Link>
          </div>
        </div>
      </section>

      {/* About / history */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHead eyebrow="About" title="A few years to do something with the place" id="about" />
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div className="space-y-4 leading-relaxed text-ink-soft">
            <p>
              Sunset Village is inside the former church at 4114 Judah Street.
              The building will eventually make way for new housing. Until
              then, we're filling it with things the neighborhood can actually
              use: a music hall, local shops, classes, and events, with more
              still taking shape.
            </p>
            <p>
              The name comes from the old Sunset Village shops that stood on
              this corner in the 1950s. For a little while, we're bringing the
              idea back.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <figure>
              <img
                src="/photos/historic-1950s.webp"
                alt="Sunset Village shops and an N Judah streetcar on Judah Street, around 1951"
                className="w-full border-2 border-ink"
              />
              <figcaption className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Sunset Village, 1951
              </figcaption>
            </figure>
            <figure>
              <div className="flex aspect-[3/2] w-full items-center justify-center border-2 border-dashed border-line bg-card">
                <p className="px-4 text-center text-sm text-ink-soft">Photo coming soon</p>
              </div>
              <figcaption className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Sunset Village, 2026
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="mt-16 scroll-mt-20 bg-dusk py-16 text-bg sm:mt-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Keep up with Sunset Village
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-bg/80">
            Shows, events, openings, workshops, and other things happening at
            the corner.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Visit */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-20">
        <SectionHead eyebrow="Visit" title="Come by" id="visit" />
        <div className="mt-6 grid items-start gap-10 md:grid-cols-2">
          <div>
            <p className="font-display text-2xl font-semibold leading-snug">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </p>
            <p className="mt-3 leading-relaxed text-ink-soft">
              On the corner of 46th Avenue and Judah Street in the{' '}
              {site.address.neighborhood}. {site.transit}
            </p>
            <a
              href={site.directionsUrl}
              className="mt-4 inline-block rounded-[3px] border-2 border-ink px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-bg"
            >
              Get directions
            </a>
          </div>
          <figure>
            <img
              src="/photos/judah-dusk.webp"
              alt="Houses and streetlights along Judah Street at dusk"
              className="aspect-[4/3] w-full border-2 border-ink object-cover"
            />
            <figcaption className="mt-1.5 text-xs text-ink-soft">The neighborhood at dusk.</figcaption>
          </figure>
        </div>
      </section>
    </main>
  )
}
