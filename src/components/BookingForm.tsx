// The booking form on the Music Hall page: the site's own form, or a Google
// Form if one is chosen in /admin → Bookings. Full Google Forms links are
// embedded; short forms.gle links can't be, so they show as a button.

import { useContent } from '../lib/content'
import InquiryForm from './InquiryForm'

const embedUrl = (url: string) => {
  const u = new URL(url)
  if (u.hostname !== 'docs.google.com') return null
  u.pathname = u.pathname.replace(/\/(edit|viewform)?$/, '/viewform')
  u.searchParams.set('embedded', 'true')
  return u.toString()
}

export default function BookingForm() {
  const { ready, bookingFormUrl } = useContent()
  if (!ready) return <div className="min-h-[24rem]" />
  if (!bookingFormUrl) return <InquiryForm />

  const embed = embedUrl(bookingFormUrl)
  return (
    <div>
      {embed && (
        <iframe
          src={embed}
          title="Booking inquiry form"
          className="h-[48rem] w-full border-2 border-ink bg-card"
          loading="lazy"
        />
      )}
      <a
        href={bookingFormUrl}
        target="_blank"
        rel="noreferrer"
        className={
          embed
            ? 'mt-3 inline-block text-sm font-semibold text-sunset hover:underline'
            : 'inline-block rounded-[3px] bg-sunset px-6 py-3 font-semibold text-white transition hover:bg-sunset-deep'
        }
      >
        {embed ? 'Open the form in a new tab ↗' : 'Send a booking inquiry ↗'}
      </a>
    </div>
  )
}
