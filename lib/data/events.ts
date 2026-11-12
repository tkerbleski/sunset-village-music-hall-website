// The events calendar. Events are now managed in /admin and stored in the
// database; the list below is only the initial seed (npm run db:setup) and
// the fallback for local dev. Editing it does NOT change the live site.
//
// Upcoming vs past is computed from the date. `ticketPrice` (cents) sells
// tickets on the site through Stripe; `ticketUrl` links out to another
// ticket seller instead; `price` alone shows "$X at the door".
// `sample: true` renders an "example listing" label.

export type EventCategory = 'music' | 'dj' | 'community' | 'workshop'

export interface VillageEvent {
  id: string
  title: string
  /** Drives the fill color and the Events page filter. */
  category?: EventCategory
  /** Mono "kind" line, e.g. "Live music · Indie rock". */
  kind?: string
  /** One line under the title, e.g. "with Low Tide Choir". */
  subtitle?: string
  /** Button label, e.g. "Get tickets" or "RSVP". */
  cta?: string
  /** Structured start/end, 24h "HH:MM" Pacific, for calendar sync. `time` stays the display text. */
  startTime?: string
  endTime?: string
  date: string // yyyy-mm-dd
  time?: string
  venue: string
  summary: string
  /** Longer text for the event's own page. Falls back to summary. */
  details?: string
  price?: string
  ticketUrl?: string
  /** Flyer image path under public/, shown on the event's page. */
  flyer?: string
  /** Online ticket price in cents (sold on this site via Stripe). */
  ticketPrice?: number
  /** Tickets available online. Admin only; the public site gets ticketsLeft. */
  capacity?: number
  ticketsLeft?: number
  sample?: boolean
}

export const events: VillageEvent[] = [
  {
    id: 'the-sunset-is-dead',
    title: 'The Sunset is Dead',
    category: 'music',
    kind: 'Live music · Grateful Dead tribute',
    subtitle: 'Tangled & Free',
    date: '2026-09-05',
    time: 'Doors 7pm',
    venue: 'Music Hall',
    summary:
      'A night of Dead music from Outer Sunset band Tangled & Free, in honor of the Forever Grateful shows happening across SF.',
    details:
      'In honor of the Forever Grateful exhibitions and shows happening across San Francisco, a special night of Dead music from Outer Sunset band Tangled & Free. 7 to 10pm.',
    price: '$10',
    flyer: '/photos/flyer-sunset-is-dead.webp',
  },
  {
    id: 'olas-perdidas-sep-9',
    title: 'Olas Perdidas',
    category: 'music',
    kind: 'Live music',
    date: '2026-09-09',
    time: '6:00 to 9:00pm',
    venue: 'Music Hall',
    summary: 'Olas Perdidas return to the hall.',
    ticketUrl: 'https://www.tickettailor.com/events/toddhanniganmusicllc/2361891',
  },
  {
    id: 'first-show-aug-7',
    title: 'Olas Perdidas with PEÑA (solo)',
    category: 'music',
    kind: 'Live music',
    date: '2026-08-07',
    time: 'Doors 7pm',
    venue: 'Music Hall',
    summary: 'The first official show at the Music Hall.',
    details:
      'The first official show at Sunset Village Music Hall, the Outer Sunset’s newest live music venue. Olas Perdidas, with a solo set from PEÑA.',
    flyer: '/photos/flyer-olas-pena-aug-7.webp',
  },
  {
    id: 'open-house-july-4',
    title: 'Music Hall Open House',
    category: 'community',
    kind: 'Community · All ages',
    date: '2026-07-04',
    time: 'Doors 2:30pm',
    venue: 'Music Hall',
    summary: 'First look at the hall. Sadie Applegate, Sunset Taxi Service, and Zoo. All ages.',
    details:
      'The Music Hall opened its doors for a first listen. Sadie Applegate at 3pm, Sunset Taxi Service at 4:30pm, and Zoo at 7pm. Doors at 2:30pm, all ages.',
  },
]

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Online sales are open: a price is set and the event hasn't happened. */
export const sellsOnline = (e: VillageEvent) => Boolean(e.ticketPrice) && e.date >= todayISO()

export const upcomingEvents = (events: VillageEvent[]) =>
  events.filter((e) => e.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))

export const pastEvents = (events: VillageEvent[]) =>
  events.filter((e) => e.date < todayISO()).sort((a, b) => b.date.localeCompare(a.date))

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function fmtDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export const dollars = (cents: number) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
