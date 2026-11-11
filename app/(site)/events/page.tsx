import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/brand/page-hero'
import { Button } from '@/components/ui/button'
import { Band, Section } from '@/components/layout/section'
import { EventsBrowser } from '@/components/events/events-browser'
import { EventCard } from '@/components/events/event-card'
import { MonthHeading } from '@/components/events/month-heading'
import { loadContent } from '@/lib/server/content'
import { past, upcoming } from '@/lib/events'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Live bands, DJ nights, workshops and community events at Sunset Village Music Hall, 4114 Judah St, San Francisco.',
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ events }, { type }] = await Promise.all([loadContent(), searchParams])
  const recent = past(events).slice(0, 6)

  return (
    <>
      <PageHero
        eyebrow="The calendar"
        title={
          <>
            What’s <span className="text-sun">up</span>
          </>
        }
        lede="Bands, DJs, theater and neighborhood nights. Tickets go fast when the fog rolls in."
      />

      <EventsBrowser events={upcoming(events)} initial={type ?? null} />

      {recent.length > 0 && (
        <Section className="flex flex-col gap-5 pt-6 pb-8">
          <MonthHeading>Recently</MonthHeading>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-5">
            {recent.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Section>
      )}

      <Section className="pt-8 pb-22">
        <Band tone="yellow">
          <div className="min-w-0 flex-[999_1_420px]">
            <h2 className="mb-2 text-display-md">Got a show in mind?</h2>
            <p className="text-lede">Bands, promoters, birthdays, fundraisers. The hall is up for grabs.</p>
          </div>
          <Button asChild>
            <Link href="/book">Request a date →</Link>
          </Button>
        </Band>
      </Section>
    </>
  )
}
