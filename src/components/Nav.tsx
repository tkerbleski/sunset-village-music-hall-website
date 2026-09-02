const links = [
  { href: '#whats-here', label: "What's here" },
  { href: '#music-hall', label: 'Music Hall' },
  { href: '#spaces', label: 'Spaces' },
  { href: '#newsletter', label: 'Newsletter' },
]

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/60 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a href="#top" className="font-display text-lg font-semibold tracking-wide text-bg">
          Sunset Village
        </a>
        <div className="hidden items-center gap-6 text-sm text-bg/80 sm:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-bg">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#book"
          className="rounded-full bg-sunset px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sunset-deep"
        >
          Book a space
        </a>
      </nav>
    </header>
  )
}
