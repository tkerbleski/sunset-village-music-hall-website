import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { PageHero } from '@/components/brand/page-hero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Facts, Section } from '@/components/layout/section'
import { PosterArt } from '@/components/events/poster-art'
import { TicketBox } from '@/components/events/ticket-box'
import { loadContent } from '@/lib/server/content'
import { categoryOf, dateParts, longDate, priceLine, sellsOnline } from '@/lib/events'
import { site, fullAddress } from '@/lib/data/site'

type Props = { params: Promise<{ id: string }> }

async function findEvent(id: string) {
  const { events } = await loadContent()
  return events.find((e) => e.id === decodeURIComponent(id))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await findEvent((await params).id)
  if (!event) return { title: 'Event not found' }
  return {
    title: event.title,
    description: event.summary,
    openGraph: event.flyer ? { images: [event.flyer] } : undefined,
  }
}

export default async function EventPage({ params }: Props) {
  const event = await findEvent((await params).id)
  if (!event) notFound()

  const { dow, day } = dateParts(event.date)
  const isPast = event.date < new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
  const price = priceLine(event)
  const lede = event.subtitle ?? event.summary
  const body = event.details ?? event.summary
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: event.title,
    startDate: event.date,
    description: event.summary,
    image: event.flyer ? new URL(event.flyer, site.url).toString() : undefined,
    location: { '@type': 'MusicVenue', name: site.name, address: fullAddress },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow={[longDate(event.date), event.kind].filter(Boolean).join(' · ')}
        title={event.title}
        lede={lede}
      />

      <Section className="flex flex-wrap items-start gap-8 pt-12 pb-22">
        <div className="flex min-w-0 flex-[1.4_1_480px] flex-col gap-6">
          <Link href="/events" className="font-bold">
            ← All events
          </Link>
          <PosterArt
            category={categoryOf(event)}
            dow={dow}
            day={day}
            flyer={event.flyer}
            title={event.title}
            className="rounded-2xl border-2 border-ink"
          />
          {event.sample && <Badge tone="yellow">Example listing</Badge>}
          {body && body !== lede && <p className="max-w-160 text-lede whitespace-pre-line">{body}</p>}
        </div>

        <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-6 rounded-2xl border-2 border-ink bg-card p-7">
          <h2 className="text-heading-panel">{isPast ? 'This one’s over' : 'Tickets'}</h2>
          <Facts
            className="grid-cols-1 sm:grid-cols-2"
            items={[
              ['Date', longDate(event.date)],
              ...(event.time ? ([['Time', event.time]] as [string, string][]) : []),
              ...(price ? ([['Price', price]] as [string, string][]) : []),
              ['Where', `${event.venue}, ${site.address.street}`],
            ]}
          />
          {isPast ? (
            <Button asChild>
              <Link href="/events">See what’s coming up</Link>
            </Button>
          ) : event.ticketPrice && sellsOnline(event) ? (
            <Suspense>
              <TicketBox event={{ ...event, ticketPrice: event.ticketPrice }} />
            </Suspense>
          ) : event.ticketUrl ? (
            <Button asChild variant="sun" size="lg" className="self-start">
              <a href={event.ticketUrl} target="_blank" rel="noopener">
                {event.cta || 'Get tickets'} ↗
              </a>
            </Button>
          ) : (
            <p className="text-ink-2">{price ? 'Pay at the door.' : 'Free.'} No advance tickets for this one.</p>
          )}
        </aside>
      </Section>
    </>
  )
}
