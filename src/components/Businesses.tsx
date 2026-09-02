import { businesses, hourLines, isOpenNow } from '../data/businesses'

const statusBadge = {
  open: { label: 'Open', cls: 'bg-sage/15 text-sage' },
  'coming-soon': { label: 'Coming soon', cls: 'bg-gold/20 text-sunset-deep' },
  planned: { label: 'In planning', cls: 'bg-dusk/10 text-dusk' },
} as const

export default function Businesses() {
  return (
    <section id="whats-here" className="scroll-mt-16 bg-card py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-sunset">
          Shops &amp; spaces
        </p>
        <h2 className="font-display text-4xl font-semibold sm:text-5xl">
          What&rsquo;s here
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {businesses.map((b) => {
            const badge = statusBadge[b.status]
            const openNow = isOpenNow(b)
            return (
              <article
                key={b.id}
                className="flex flex-col rounded-2xl border border-line bg-bg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-2xl font-semibold">{b.name}</h3>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      openNow ? 'bg-sage text-white' : badge.cls
                    }`}
                  >
                    {openNow ? 'Open now' : badge.label}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-sunset-deep">{b.tagline}</p>
                <p className="mt-3 flex-1 leading-relaxed text-ink-soft">{b.description}</p>
                <div className="mt-4 border-t border-line pt-3 text-sm text-ink-soft">
                  {b.hours ? (
                    hourLines(b.hours).map((line) => <div key={line}>{line}</div>)
                  ) : (
                    <div>{b.hoursNote}</div>
                  )}
                </div>
                {b.link && (
                  <a href={b.link} className="mt-3 text-sm font-medium text-sunset hover:underline">
                    Learn more →
                  </a>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
