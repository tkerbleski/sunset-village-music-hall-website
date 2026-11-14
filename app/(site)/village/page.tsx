import type { Metadata } from 'next'
import { Eyebrow } from '@/components/brand/eyebrow'
import { WaveDivider } from '@/components/brand/wave-divider'
import { Band, Section, SectionHead } from '@/components/layout/section'
import Image from 'next/image'
import { ComingSoonCard, SpaceCard } from '@/components/village/space-card'
import { LeasingForm } from '@/components/village/leasing-form'
import { loadContent } from '@/lib/server/content'
import { site } from '@/lib/data/site'

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
              src="/photos/sunset-village-colorized.jpeg"
              alt="Sunset Village in the 1950s: the cream storefront with its red script “Sunset Village, a complete shopping center” sign and the Sunset Variety Store, a vintage car parked out front, and a green-and-cream Judah streetcar heading up the street"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 620px"
              className="object-cover object-[68%_center]"
            />
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

      <Section id="leasing" className="scroll-mt-6 pt-6 pb-22">
        <Band tone="teal" className="items-start">
          <div className="min-w-0 flex-[1_1_300px]">
            <h2 className="mb-2 text-display-md">Want to set up shop here?</h2>
            <p className="text-lede">
              Retail, office and studio space is available. We’re looking for local, independent businesses. Let’s talk.
            </p>
          </div>
          <div className="min-w-0 flex-[1.4_1_420px] rounded-xl border-2 border-ink bg-card p-7 max-[520px]:px-5 max-[520px]:py-6">
            <LeasingForm />
          </div>
        </Band>
      </Section>
    </>
  )
}
