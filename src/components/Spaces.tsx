import { spaces } from '../data/spaces'

export default function Spaces() {
  return (
    <section id="spaces" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-sunset">
          Host something
        </p>
        <h2 className="font-display text-4xl font-semibold sm:text-5xl">The spaces</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          Book the hall for a private event, or request the community space
          for a workshop or meeting.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {spaces.map((s) => (
            <article
              key={s.id}
              className="flex flex-col rounded-2xl border border-line bg-card p-6 shadow-sm"
            >
              <h3 className="font-display text-2xl font-semibold">{s.name}</h3>
              {s.capacity && (
                <p className="mt-1 text-sm font-medium text-sunset-deep">{s.capacity}</p>
              )}
              <p className="mt-3 flex-1 leading-relaxed text-ink-soft">{s.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.goodFor.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-dusk/8 px-3 py-1 text-xs font-medium text-dusk"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <a
                href="#book"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('preselect-booking', { detail: s.bookingType }),
                  )
                }}
                className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-center text-sm font-medium text-bg transition hover:bg-dusk"
              >
                Inquire →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
