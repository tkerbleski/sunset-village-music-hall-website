import type { Metadata } from 'next'
import { PageHero } from '@/components/brand/page-hero'
import { Sparkle } from '@/components/brand/sparkle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Facts, Section } from '@/components/layout/section'
import { BookingForm } from '@/components/book/booking-form'
import { loadContent } from '@/lib/server/content'
import { site } from '@/lib/data/site'

export const metadata: Metadata = {
  title: 'Book the hall',
  description:
    'Rent Sunset Village Music Hall at 4114 Judah St for shows, album releases, parties, fundraisers and workshops. Request a date.',
}

export const revalidate = 30

const GOOD_FOR = ['Shows', 'Private parties', 'Fundraisers', 'Workshops', 'Rehearsals', 'Community meetings']
const TAG_TONES = ['yellow', 'teal', 'pink'] as const

const STEPS = [
  { fill: 'bg-sun', text: 'Send the request. Rough dates are fine.' },
  { fill: 'bg-yellow', text: `We reply within ${site.replyTime} with a quote or a door split.` },
  { fill: 'bg-teal', text: `Lock in your date with a deposit of ${site.deposit}. The rest is due on the day of the event.` },
]

export default async function BookPage() {
  const { bookingFormUrl } = await loadContent()

  return (
    <>
      <PageHero
        eyebrow="Book the hall"
        title={
          <>
            Your night. <span className="text-sun">Our room.</span>
          </>
        }
        lede="Shows, album releases, birthdays, fundraisers, workshops. Tell us what you’re dreaming up and we’ll get back to you with dates and a quote."
      />

      <Section className="flex flex-wrap items-start gap-8 pt-12 pb-22">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-5">
          <div className="flex flex-col gap-4.5 rounded-2xl border-2 border-ink bg-card p-7">
            <h2 className="text-heading-panel">The room</h2>
            <Facts
              items={[
                ['Capacity', site.room.capacity],
                ['Stage', site.room.stage],
                ['Sound', site.room.sound],
                ['Extras', site.room.extras],
              ]}
            />
            <div className="flex flex-wrap gap-2">
              {GOOD_FOR.map((g, i) => (
                <Badge key={g} tone={TAG_TONES[i % 3]}>
                  {g}
                </Badge>
              ))}
            </div>
            <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-ink bg-map p-3 text-center font-mono text-meta">
              [PHOTO · the room set up for an event]
            </div>
          </div>

          <div className="theme-ink relative flex flex-col gap-4.5 rounded-2xl p-7">
            <Sparkle size={28} className="absolute top-6 right-6 text-yellow" />
            <h2 className="text-heading-panel">How it works</h2>
            <ol className="flex flex-col gap-4">
              {STEPS.map((s, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <b className={`flex size-10 flex-none items-center justify-center rounded-full font-extrabold text-ink ${s.fill}`}>
                    {i + 1}
                  </b>
                  <span className="pt-2">{s.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="min-w-0 flex-[1.4_1_480px] rounded-2xl border-2 border-ink bg-card p-8 max-[520px]:px-5 max-[520px]:py-6">
          {bookingFormUrl ? (
            <div className="flex flex-col items-start gap-4">
              <h2 className="text-heading-form">Request a date</h2>
              <p className="text-lede">Tell us about your event on our request form. We’ll reply within {site.replyTime}.</p>
              <Button asChild variant="sun" size="lg">
                <a href={bookingFormUrl} target="_blank" rel="noopener">
                  Open the request form ↗
                </a>
              </Button>
            </div>
          ) : (
            <BookingForm />
          )}
        </div>
      </Section>
    </>
  )
}
