import { events, fmtDate, pastHighlight } from '../data/events'

export default function MusicHall() {
  return (
    <section id="music-hall" className="scroll-mt-16 bg-ink py-20 text-bg sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-gold">
          Live at the Village
        </p>
        <h2 className="font-display text-4xl font-semibold sm:text-5xl">
          Sunset Village Music Hall
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-bg/75">
          An intimate 70-person hall on Judah Street for live music,
          listening nights, and neighborhood gatherings.{' '}
          <span className="text-bg/60">{pastHighlight.description}</span>
        </p>

        <h3 className="mt-12 text-sm font-medium uppercase tracking-[0.2em] text-bg/60">
          Upcoming
        </h3>
        <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="w-32 shrink-0">
                <div className="font-display text-lg font-semibold text-gold">
                  {fmtDate(e.date)}
                </div>
                {e.time && <div className="text-sm text-bg/60">{e.time}</div>}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-display text-xl font-semibold">{e.title}</h4>
                  {e.sample && (
                    <span className="rounded-full border border-bg/25 px-2 py-0.5 text-[11px] uppercase tracking-wide text-bg/50">
                      Example — programming TBA
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-bg/70">{e.description}</p>
              </div>
              <div className="shrink-0">
                {e.ticketUrl ? (
                  <a
                    href={e.ticketUrl}
                    className="inline-block rounded-full bg-sunset px-5 py-2 text-sm font-medium text-white transition hover:bg-sunset-deep"
                  >
                    Get tickets{e.price ? ` · ${e.price}` : ''}
                  </a>
                ) : e.price ? (
                  <span className="inline-block rounded-full border border-bg/30 px-5 py-2 text-sm text-bg/80">
                    {e.price} at the door
                  </span>
                ) : (
                  <span className="inline-block rounded-full border border-bg/30 px-5 py-2 text-sm text-bg/80">
                    Free · details soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-bg/50">
          Online ticket sales are coming. For now, follow the newsletter for
          show announcements — or{' '}
          <a href="#book" className="text-gold hover:underline">
            inquire about booking the hall
          </a>
          .
        </p>
      </div>
    </section>
  )
}
