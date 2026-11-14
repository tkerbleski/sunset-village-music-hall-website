import type { Metadata } from 'next'
import { Eyebrow } from '@/components/brand/eyebrow'
import { WaveDivider } from '@/components/brand/wave-divider'
import { Band, Section, SectionHead } from '@/components/layout/section'
import Image from 'next/image'
import { ComingSoonCard, SpaceCard } from '@/components/village/space-card'
import { loadContent } from '@/lib/server/content'
import { site, isPlaceholder } from '@/lib/data/site'

export const metadata: Metadata = {
  title: 'The Village',
  description:
    'Sunset Village Music Hall is at 46th & Judah, in the old Sunset Village Shopping Center, with local shops on the corner. Meet the neighbors.',
}

export const revalidate = 30

export default async function VillagePage() {
  const { tenants } = await loadContent()

  return (
    <>
      <section className="theme-ink">
        <div className="container-site grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-center gap-12 pt-10 pb-16">
          <div className="flex flex-col gap-5">
            <Eyebrow className="mb-0">The Village</Eyebrow>
            <h1 className="text-display-split">
              One building. <span className="text-sun">Good neighbors.</span>
            </h1>
            <p className="max-w-135 text-lede text-mist">
              The music hall is in a building on Judah St. In the 1940s and ’50s, this and the other buildings along 45th and
              46th Aves were known as the Sunset Village Shopping Center. Today there are new shops on the corner of 46th Ave
              too. Make a night of it.
            </p>
          </div>
          <div className="relative aspect-[10/7] overflow-hidden rounded-2xl">
            <Image
              src="/photos/village-hero-toggery.webp"
              alt="The Sunset Village corner decades ago: a low storefront with a painted “Sunset Village, your complete shopping center” sign, the Sunset Toggery and Sally’s Coffee Shop, and a vintage car parked out front"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 620px"
              className="photo-duotone object-cover"
            />
            <div className="photo-tint absolute inset-0" aria-hidden="true" />
          </div>
        </div>
        <WaveDivider />
      </section>

      <Section className="flex flex-col gap-7 pt-14 pb-10">
        <SectionHead
          eyebrow="Building directory"
          title="Who’s here"
          action={
            <span className="font-mono text-sm text-ink-2">
              {site.address.street} · {site.address.city}
            </span>
          }
        />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-5">
          {tenants.map((t) => (
            <SpaceCard key={t.id} space={t} />
          ))}
          <ComingSoonCard />
        </div>
      </Section>

      <Section className="pt-6 pb-22">
        <Band tone="teal">
          <div className="min-w-0 flex-[999_1_420px]">
            <h2 className="mb-2 text-display-md">Want to set up shop here?</h2>
            <p className="text-lede">Retail, office and studio space is available. We’re looking for local, independent businesses. Let’s talk.</p>
          </div>
          {isPlaceholder(site.leasingEmail) ? (
            <span className="inline-flex min-h-12 items-center rounded-full border-2 border-ink bg-ink px-5.5 font-bold text-fog select-all">
              {site.leasingEmail}
            </span>
          ) : (
            <a
              href={`mailto:${site.leasingEmail}`}
              className="inline-flex min-h-12 items-center rounded-full border-2 border-ink bg-ink px-5.5 font-bold text-fog no-underline select-all hover:bg-ink-hover"
            >
              {site.leasingEmail}
            </a>
          )}
        </Band>
      </Section>
    </>
  )
}
