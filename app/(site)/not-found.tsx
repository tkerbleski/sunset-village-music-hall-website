import Link from 'next/link'
import { PageHero } from '@/components/brand/page-hero'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/layout/section'

export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="404" title={<>Lost in the <span className="text-sun">fog.</span></>} lede="That page isn’t here. It may have moved, or the link has a typo." />
      <Section className="flex flex-wrap gap-3 pt-12 pb-22">
        <Button asChild>
          <Link href="/events">See what’s up</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </Section>
    </>
  )
}
