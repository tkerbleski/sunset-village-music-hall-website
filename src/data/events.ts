// Music Hall programming.
//
// Events with `sample: true` are placeholders to show the layout — they render
// with an "example" badge. Replace with real programming as it's confirmed.
//
// Ticketing: when an event gets a `ticketUrl` (Stripe payment link, Eventbrite,
// etc.) the card shows a "Get tickets" button. `price` alone renders
// "$X at the door". Neither → "Free / details soon". This is the seam where
// real ticket sales plug in later.

export interface VillageEvent {
  id: string
  title: string
  date: string // ISO yyyy-mm-dd
  time?: string
  description: string
  price?: string
  ticketUrl?: string
  sample?: boolean
}

export const pastHighlight = {
  title: 'July 4th Open House',
  description:
    'The Music Hall opened its doors for a first listen, with sets from Sadie Applegate and Sunset Taxi Service.',
}

export const events: VillageEvent[] = [
  {
    id: 'sample-fri-night',
    title: 'Friday Night at the Hall',
    date: '2026-09-18',
    time: '7:30pm',
    description: 'An evening of live music from Sunset locals. Lineup to be announced.',
    price: '$15',
    sample: true,
  },
  {
    id: 'sample-listening',
    title: 'Neighborhood Listening Night',
    date: '2026-09-26',
    time: '7:00pm',
    description: 'Bring a record, hear it on the big system. Casual, all ages.',
    sample: true,
  },
  {
    id: 'sample-matinee',
    title: 'Sunday Matinee: Acoustic Afternoon',
    date: '2026-10-04',
    time: '3:00pm',
    description: 'Unplugged sets and coffee while the fog burns off.',
    price: '$10',
    sample: true,
  },
]

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
