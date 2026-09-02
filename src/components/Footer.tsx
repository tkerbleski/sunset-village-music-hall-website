import { Link } from 'react-router-dom'
import { site, fullAddress } from '../data/site'

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-bg">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <div className="font-display text-2xl font-bold">Sunset Village</div>
          <address className="mt-2 text-sm not-italic leading-relaxed text-ink-soft">
            {site.address.street}
            <br />
            {site.address.city}, {site.address.state} {site.address.zip}
          </address>
          <a
            href={site.directionsUrl}
            className="mt-2 inline-block text-sm font-medium text-sunset hover:underline"
          >
            Directions
          </a>
        </div>
        <nav aria-label="Footer" className="text-sm leading-7 text-ink-soft">
          <Link to="/events" className="block hover:text-ink">
            What's on
          </Link>
          <a href="/#whats-here" className="block hover:text-ink">
            What's here
          </a>
          <Link to="/music-hall" className="block hover:text-ink">
            Music Hall
          </Link>
          <a href="/#newsletter" className="block hover:text-ink">
            Newsletter
          </a>
        </nav>
        <div className="text-sm leading-relaxed text-ink-soft">
          <p>{site.transit}</p>
          <p className="mt-3 text-ink-soft/70">
            © {new Date().getFullYear()} Sunset Village, {site.corner}
          </p>
        </div>
      </div>
      <div className="sr-only">{fullAddress}</div>
    </footer>
  )
}
