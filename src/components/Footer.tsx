export default function Footer() {
  return (
    <footer className="bg-ink py-12 text-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-display text-2xl font-semibold">Sunset Village</div>
          <p className="mt-2 text-sm leading-relaxed text-bg/60">
            4114 Judah St at 46th Ave
            <br />
            Outer Sunset, San Francisco
            <br />
            <span className="text-bg/40">Take the N Judah to 46th Avenue.</span>
          </p>
        </div>
        <div className="text-sm text-bg/60 sm:text-right">
          <div className="flex gap-5 sm:justify-end">
            <a href="#whats-here" className="hover:text-bg">What&rsquo;s here</a>
            <a href="#music-hall" className="hover:text-bg">Music Hall</a>
            <a href="#book" className="hover:text-bg">Book a space</a>
          </div>
          <p className="mt-4 text-bg/35">
            © {new Date().getFullYear()} Sunset Village · Judah &amp; 46th
          </p>
        </div>
      </div>
    </footer>
  )
}
