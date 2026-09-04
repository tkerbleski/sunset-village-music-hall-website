import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/events', label: 'Calendar' },
  { to: '/#shops', label: 'Shops & Spaces', plain: true, mobile: true },
  { to: '/music-hall', label: 'Music Hall' },
  { to: '/#visit', label: 'Visit', plain: true },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-bg">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3"
      >
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink">
          Sunset Village
        </Link>
        <div className="flex items-center gap-x-5 gap-y-1 text-[15px]">
          {links.map((l) =>
            l.plain ? (
              // Hash links into the homepage need a plain anchor so the
              // browser scrolls; NavLink would not re-scroll on same-page use.
              <a
                key={l.label}
                href={l.to}
                className={`${l.mobile ? '' : 'hidden sm:inline '}whitespace-nowrap text-ink-soft transition hover:text-ink`}
              >
                {l.mobile ? (
                  <>
                    <span className="sm:hidden">Shops</span>
                    <span className="hidden sm:inline">{l.label}</span>
                  </>
                ) : (
                  l.label
                )}
              </a>
            ) : (
              <NavLink
                key={l.label}
                to={l.to}
                className={({ isActive }) =>
                  `whitespace-nowrap transition hover:text-ink ${isActive ? 'font-semibold text-ink underline decoration-sunset decoration-2 underline-offset-4' : 'text-ink-soft'}`
                }
              >
                {l.label}
              </NavLink>
            ),
          )}
          <a
            href="/#newsletter"
            className="rounded-[3px] bg-sunset px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-sunset-deep"
          >
            Newsletter
          </a>
        </div>
      </nav>
    </header>
  )
}
