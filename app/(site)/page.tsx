import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/brand/eyebrow'
import { Sparkle } from '@/components/brand/sparkle'
import { WaveDivider } from '@/components/brand/wave-divider'
import { Wordmark } from '@/components/brand/wordmark'
import { Section, SectionHead, MoreLink } from '@/components/layout/section'
import { EventRow } from '@/components/events/event-row'
import { MapIllustration } from '@/components/site/map-illustration'
import { NewsletterSignup } from '@/components/site/newsletter-signup'
import { loadContent } from '@/lib/server/content'
import { upcoming } from '@/lib/events'
import { site, isPlaceholder } from '@/lib/data/site'

export const revalidate = 30

export default async function HomePage() {
  const { events } = await loadContent()
  const next = upcoming(events).slice(0, 4)

  const venueLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicVenue',
    name: site.name,
    url: site.url,
    sameAs: [site.instagram],
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: 'US',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueLd) }} />
      {/* Photo hero */}
      <section className="theme-ink relative overflow-hidden">
        <Image
          src="/photos/hero-dancefloor.jpg"
          alt="A foggy dance floor at Sunset Village Music Hall, with people dancing in silhouette"
          fill
          priority
          sizes="100vw"
          className="photo-duotone object-cover object-[60%_45%]"
        />
        <div className="photo-tint absolute inset-0" aria-hidden="true" />
        <div className="hero-scrim absolute inset-0" aria-hidden="true" />
        <div className="container-site relative flex min-h-160 items-center pt-24 pb-32 max-[760px]:min-h-0 max-[760px]:pt-16 max-[760px]:pb-22">
          <div className="flex max-w-160 flex-col gap-7">
            <Eyebrow className="mb-0">Neighborhood venue · Outer Sunset</Eyebrow>
            <h1 className="text-display-hero">
              Sick sets. Thick <span className="text-sun">fog.</span> Good neighbors.
            </h1>
            <p className="max-w-135 text-xl leading-normal text-mist">
              Sunset Village Music Hall is a room for live bands, dance nights and community get-togethers out by Ocean
              Beach. Bring a hoodie.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="sun" size="lg">
                <Link href="/events">See what’s up →</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/book">Book the hall</Link>
              </Button>
            </div>
          </div>
        </div>
        <WaveDivider className="relative" />
      </section>

      {/* Coming up */}
      <Section className="flex flex-col gap-7 pt-18 pb-12">
        <SectionHead
          eyebrow="On the calendar"
          title="Coming up"
          action={<MoreLink href="/events">Full calendar →</MoreLink>}
        />
        {next.length ? (
          <div className="flex flex-col gap-3.5">
            {next.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-dashed border-ink px-7 py-6">
            <p className="text-lede">
              Nothing on the calendar just yet. New shows land in the fog report first.
            </p>
            <Button asChild variant="outline">
              <Link href="#newsletter">Get the fog report</Link>
            </Button>
          </div>
        )}
      </Section>

      {/* Find us */}
      <Section className="flex flex-col gap-7 pt-12 pb-18">
        <SectionHead eyebrow="Come say hi" title="Find us out west" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-5">
          <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card">
            <a
              href={site.directionsUrl}
              target="_blank"
              rel="noopener"
              className="block h-65 border-b-2 border-ink"
              aria-label="Open the hall in Google Maps"
            >
              <MapIllustration />
            </a>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6 px-7 pt-6 pb-7">
              <div>
                <h3 className="mb-2 text-heading-md">Address</h3>
                <p className="mb-2.5">
                  {site.name}
                  <br />
                  {site.address.street}
                  <br />
                  {site.address.city}, {site.address.state} {site.address.zip}
                </p>
                <a className="font-bold" href={site.directionsUrl} target="_blank" rel="noopener">
                  Get directions ↗
                </a>
              </div>
              <div>
                <h3 className="mb-2 text-heading-md">Getting here</h3>
                <p>
                  {site.transit}
                  <br />
                  {site.parking}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-heading-md">Doors &amp; box office</h3>
                <p>
                  {site.boxOffice}
                  <br />
                  Doors open 30–60 min before showtime
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5.5 rounded-2xl border-2 border-ink bg-yellow px-7 py-8">
            <h3 className="text-heading-xl">Get in touch</h3>
            <dl className="flex flex-col gap-4 text-lg">
              {(
                [
                  ['General', site.generalEmail, `mailto:${site.generalEmail}`],
                  ['Phone', site.phone, `tel:${site.phone}`],
                  ['Instagram', site.instagramHandle, site.instagram],
                  ['Artists & promoters', site.bookingEmail, `mailto:${site.bookingEmail}`],
                ] as const
              ).map(([label, value, href]) => (
                <div key={label}>
                  <dt className="label-sm">{label}</dt>
                  <dd className="mt-1 font-semibold wrap-anywhere">
                    {isPlaceholder(value) ? (
                      value
                    ) : (
                      <a className="text-ink" href={href}>
                        {value}
                      </a>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <Button asChild className="mt-auto self-start">
              <Link href="/book">Want to rent the room? →</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Newsletter */}
      <Section id="newsletter" className="scroll-mt-6 pb-18">
        <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-4xl border-2 border-ink bg-sun px-10 py-14 text-ink max-[520px]:px-6 max-[520px]:py-8">
          <Sparkle size={44} className="absolute top-7 right-9 max-[520px]:hidden" />
          <Sparkle size={22} simple className="absolute top-17.5 right-24 max-[520px]:hidden" />
          <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-3">
            <Eyebrow sparkle={false} className="mb-0 text-ink">
              Newsletter
            </Eyebrow>
            <h2 className="text-display-band">Get the fog report.</h2>
            <p className="max-w-140 text-xl">
              New shows, presales and what’s happening around the Village, straight to your inbox.
            </p>
          </div>
          <NewsletterSignup />
        </div>
      </Section>

      {/* Village teaser */}
      <Section className="pb-22">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border-2 border-dashed border-ink px-8 py-7">
          <Wordmark variant="on-light" height={72} alt="Sunset Village" />
          <div className="min-w-0 flex-[999_1_360px]">
            <h2 className="mb-1.5 text-heading-lg">Part of Sunset Village</h2>
            <p className="text-lg text-ink-2">
              The hall lives in a building full of good neighbors. Make a night of it.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/village">Meet the neighbors →</Link>
          </Button>
        </div>
      </Section>
    </>
  )
}
