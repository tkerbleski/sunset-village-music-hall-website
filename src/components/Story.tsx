export default function Story() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-sunset">
            The story
          </p>
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">
            A village, again.
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-ink-soft">
            <p>
              In the 1950s, the corner of Judah and 46th was Sunset Village — a
              cluster of neighborhood businesses with a hardware store, a
              grocery market, and the original Sunset Variety Store, right on
              the N&nbsp;Judah line.
            </p>
            <p>
              Seventy years later, the name is back. While the site awaits its
              next chapter, we&rsquo;re filling it with small businesses,
              live music, and room for the neighborhood to gather — a curated
              consignment shop, a flower shop, a music hall, and more on the
              way.
            </p>
            <p className="font-medium text-ink">
              Come by. It&rsquo;s your village too.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <figure>
            <img
              src="/photos/historic-1950s.webp"
              alt="Sunset Village in the 1950s, with the Sunset Variety Store and an N Judah streetcar"
              className="w-full rounded-xl border border-line shadow-sm"
            />
            <figcaption className="mt-2 text-xs text-ink-soft">
              Judah Street, circa 1950s — the original Sunset Village.
            </figcaption>
          </figure>
          <figure>
            <img
              src="/photos/building-today.webp"
              alt="The building at 4114 Judah St today, at the corner of 46th Avenue"
              className="w-full rounded-xl border border-line shadow-sm"
            />
            <figcaption className="mt-2 text-xs text-ink-soft">
              The same corner today — 4114 Judah St at 46th Ave.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
