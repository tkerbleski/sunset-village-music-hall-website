// The events calendar. This file is the single source for every event
// listing on the site (homepage, /events, event pages).
//
// To add an event: copy an entry, give it a unique id (it becomes the URL,
// /events/<id>), set the date as yyyy-mm-dd. Upcoming vs past is computed
// from the date automatically.
//
// Events marked `sample: true` are placeholders that show how the calendar
// works. They render with a visible "example" label. Delete them as real
// programming is confirmed.
//
// Tickets: add `ticketUrl` (a Stripe payment link, Eventbrite page, etc.)
// and the listing shows a "Tickets" button. `price` alone shows
// "$X at the door".

export interface VillageEvent {
  id: string
  title: string
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
  sample?: boolean
}

export const events: VillageEvent[] = [
  {
    id: 'the-sunset-is-dead',
    title: 'The Sunset is Dead',
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
    date: '2026-09-09',
    time: '6:00 to 9:00pm',
    venue: 'Music Hall',
    summary: 'Olas Perdidas return to the hall.',
    ticketUrl: 'https://www.tickettailor.com/events/toddhanniganmusicllc/2361891',
  },
  {
    id: 'first-show-aug-7',
    title: 'Olas Perdidas with PEÑA (solo)',
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

export const upcomingEvents = () =>
  events.filter((e) => e.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))

export const pastEvents = () =>
  events.filter((e) => e.date < todayISO()).sort((a, b) => b.date.localeCompare(a.date))

export const eventById = (id: string) => events.find((e) => e.id === id)

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
