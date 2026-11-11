import Link from 'next/link'
import { Fragment } from 'react'
import { Sparkle } from '@/components/brand/sparkle'
import { Wordmark } from '@/components/brand/wordmark'
import { site } from '@/lib/data/site'
import { SiteNav } from './site-nav'

export function SiteHeader() {
  const ticker = [site.tagline, site.neighborhood]
  return (
    <header className="theme-ink">
      <div className="label-sm flex flex-wrap items-center justify-center gap-x-5.5 gap-y-2.5 bg-yellow px-4 py-2.5 text-center text-xs text-ink">
        {ticker.map((t) => (
          <Fragment key={t}>
            <span>{t}</span>
            <Sparkle size={12} />
          </Fragment>
        ))}
        <Link href="/#newsletter" className="text-ink underline">
          Get the fog report →
        </Link>
      </div>
      <div className="container-site flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="block" aria-label="Sunset Village Music Hall, home">
          <Wordmark variant="on-dark" height={76} priority className="max-[520px]:h-15!" />
        </Link>
        <SiteNav />
      </div>
    </header>
  )
}
