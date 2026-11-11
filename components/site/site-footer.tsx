import Link from 'next/link'
import { Wordmark } from '@/components/brand/wordmark'
import { site } from '@/lib/data/site'

const link = 'py-2.5 font-semibold text-fog underline hover:text-yellow'

export function SiteFooter() {
  return (
    <footer className="theme-ink">
      <div className="container-site flex flex-wrap justify-between gap-8 pt-14 pb-8">
        <div className="flex flex-[1_1_280px] flex-col gap-4 text-mist">
          <Wordmark variant="on-dark" height={116} className="self-start" />
          <span>
            {site.address.street} · {site.address.city}, {site.address.state} {site.address.zip}
          </span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-start gap-x-7 gap-y-2">
          <Link className={link} href="/events">Events</Link>
          <Link className={link} href="/book">Book the hall</Link>
          <Link className={link} href="/village">The Village</Link>
          <Link className={link} href="/#newsletter">Newsletter</Link>
          <a className={link} href={site.instagram} target="_blank" rel="noopener">Instagram ↗</a>
        </nav>
      </div>
      <div className="container-site">
        <p className="border-t border-rule pt-5 pb-8 font-mono text-xs tracking-[0.06em] text-mist">
          © {new Date().getFullYear()} {site.name} · {site.neighborhood}
        </p>
      </div>
    </footer>
  )
}
