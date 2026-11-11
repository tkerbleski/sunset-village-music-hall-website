import type { Metadata } from 'next'
import { Eyebrow } from '@/components/brand/eyebrow'
import { WaveDivider } from '@/components/brand/wave-divider'
import { Band, Section, SectionHead } from '@/components/layout/section'
import { BuildingIllustration } from '@/components/village/building-illustration'
import { ComingSoonCard, SpaceCard } from '@/components/village/space-card'
import { loadContent } from '@/lib/server/content'
import { site, isPlaceholder } from '@/lib/data/site'

export const metadata: Metadata = {
  title: 'The Village',
  description:
    'Sunset Village is a building at 4114 Judah St with the music hall and local businesses under one roof. Meet the neighbors.',
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
              Sunset Village is a building on Judah St with a handful of spaces under one roof: the music hall plus local
              businesses worth a detour. Make a night of it.
            </p>
          </div>
          <BuildingIllustration />
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
            <p className="text-lede">We’re looking for local, independent businesses to fill the Village. Let’s talk.</p>
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
