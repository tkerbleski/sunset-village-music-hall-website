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
  sample?: boolean
}

export const events: VillageEvent[] = [
  {
    id: 'open-house-july-4',
    title: 'Music Hall Open House',
    date: '2026-07-04',
    venue: 'Music Hall',
    summary: 'First look at the hall, with sets from Sadie Applegate and Sunset Taxi Service.',
    details:
      'The Music Hall opened its doors for a first listen. Sadie Applegate and Sunset Taxi Service played to a full room.',
  },
  {
    id: 'sample-friday-show',
    title: 'Friday Night at the Hall',
    date: '2026-09-18',
    time: '7:30pm',
    venue: 'Music Hall',
    summary: 'Live music from Sunset locals. Lineup to be announced.',
    price: '$15',
    sample: true,
  },
  {
    id: 'sample-listening-night',
    title: 'Neighborhood Listening Night',
    date: '2026-09-26',
    time: '7:00pm',
    venue: 'Music Hall',
    summary: 'Bring a record, hear it on the big system. Casual, all ages.',
    sample: true,
  },
  {
    id: 'sample-matinee',
    title: 'Sunday Matinee',
    date: '2026-10-04',
    time: '3:00pm',
    venue: 'Music Hall',
    summary: 'Acoustic sets in the afternoon while the fog burns off.',
    price: '$10',
    sample: true,
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
