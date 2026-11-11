import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sparkle } from '@/components/brand/sparkle'
import { Wordmark } from '@/components/brand/wordmark'
import { fillClass } from '@/components/brand/categories'
import { hourLines, type Tenant } from '@/lib/data/tenants'
import { site } from '@/lib/data/site'
import { cn } from '@/lib/utils'

const isMusicHall = (t: Tenant) => t.id === 'music-hall'

function LinkButton({ href, children, variant }: { href: string; children: React.ReactNode; variant?: 'outline' }) {
  const internal = href.startsWith('/')
  return (
    <Button asChild size="md" variant={variant}>
      {internal ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener">
          {children} ↗
        </a>
      )}
    </Button>
  )
}

/** Building directory card. The music hall gets the wordmark and a "You are here" badge. */
export function SpaceCard({ space }: { space: Tenant }) {
  const hall = isMusicHall(space)
  const instagram = space.instagram ?? (hall ? site.instagram : undefined)
  const hours = space.hours ? hourLines(space.hours).join(' · ') : space.hoursNote
  const kind = space.type ?? '[Business type]'

  return (
    <article className="lift flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-card">
      <div
        className={cn(
          'relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b-2 border-ink',
          fillClass[space.fill ?? (hall ? 'fog' : 'teal')],
        )}
      >
        {space.photo ? (
          <Image src={space.photo} alt={`${space.name} storefront`} fill sizes="(max-width: 640px) 100vw, 420px" className="object-cover" />
        ) : hall ? (
          <Wordmark variant="on-light" height={120} className="h-auto! w-[72%]" />
        ) : (
          <span className="font-mono text-meta">[PHOTO · storefront]</span>
        )}
        {hall && (
          <span className="label-sm absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full bg-ink px-3 py-2 tracking-[0.18em] text-yellow">
            <Sparkle size={11} simple />
            You are here
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 pt-4.5 pb-5">
        <span className="kind">{kind}</span>
        <h3 className="text-heading-lg">{space.name}</h3>
        <p className="text-ink-2">{space.blurb}</p>
        {(space.status === 'coming-soon' || hours) && (
          <p className="meta">{[space.status === 'coming-soon' && 'Coming soon', hours].filter(Boolean).join(' · ')}</p>
        )}
        {(space.link || instagram) && (
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            {space.link && <LinkButton href={space.link}>{space.linkLabel && hall ? space.linkLabel : 'Visit website'}</LinkButton>}
            {instagram && (
              <LinkButton href={instagram} variant="outline">
                Instagram
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

/** Always the last card in the directory. */
export function ComingSoonCard() {
  return (
    <article className="flex min-h-80 flex-col justify-center gap-2.5 rounded-xl border-2 border-dashed border-ink px-6 py-7">
      <Sparkle size={32} />
      <span className="kind">Coming soon</span>
      <h3 className="text-heading-lg">Something new is moving in</h3>
      <p className="text-ink-2">Watch this space. We’ll announce new neighbors in the fog report.</p>
      <Link className="font-bold" href="/#newsletter">
        Get the newsletter →
      </Link>
    </article>
  )
}
