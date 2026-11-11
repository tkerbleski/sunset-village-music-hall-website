'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/events', label: 'Events' },
  { href: '/book', label: 'Book the hall' },
  { href: '/village', label: 'The Village' },
]

export function SiteNav() {
  const path = usePathname()
  return (
    <nav aria-label="Main" className="flex flex-wrap items-center gap-1 text-base font-semibold">
      {LINKS.map((l) => {
        const current = path === l.href || path.startsWith(`${l.href}/`)
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'rounded-full border-2 border-transparent px-4 py-2.5 text-fog no-underline hover:bg-fog/14',
              current && 'border-fog',
            )}
          >
            {l.label}
          </Link>
        )
      })}
      <Link
        href="/#newsletter"
        className="ml-2 rounded-full border-2 border-transparent bg-sun px-4 py-2.5 text-ink no-underline hover:bg-sun-hover max-[520px]:ml-0"
      >
        Newsletter
      </Link>
    </nav>
  )
}
