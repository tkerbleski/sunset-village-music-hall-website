export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[92svh] items-end overflow-hidden bg-dusk">
      <img
        src="/photos/hero-judah-sunset.webp"
        alt="Sunset over Judah Street and the N Judah wires in the Outer Sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 to-ink/15" />
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-40 sm:pb-20">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-gold [text-shadow:0_1px_12px_rgba(20,18,35,0.9)]">
          Judah &amp; 46th · Outer Sunset · San Francisco
        </p>
        <h1 className="font-display text-6xl font-semibold leading-[0.95] text-bg [text-shadow:0_2px_24px_rgba(20,18,35,0.55)] sm:text-8xl">
          Sunset Village
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-bg/90 [text-shadow:0_1px_10px_rgba(20,18,35,0.7)]">
          A neighborhood gathering place — local makers, fresh flowers, a
          70&#8209;person music hall, and spaces the community can book.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#whats-here"
            className="rounded-full bg-bg px-6 py-3 font-medium text-ink transition hover:bg-white"
          >
            See what&rsquo;s here
          </a>
          <a
            href="#book"
            className="rounded-full border border-bg/50 px-6 py-3 font-medium text-bg transition hover:border-bg hover:bg-bg/10"
          >
            Book a space
          </a>
        </div>
      </div>
    </section>
  )
}
