// The shops and operations at Sunset Village.
//
// TODO(Tom): all hours below are placeholders — confirm real hours before
// launch. A business with `hours: null` shows its `hoursNote` instead.

export type DayHours = { open: string; close: string } | null // "11:00" 24h

export interface Business {
  id: string
  name: string
  status: 'open' | 'coming-soon' | 'planned'
  tagline: string
  description: string
  /** Sun..Sat (index 0 = Sunday). null day = closed. */
  hours: [DayHours, DayHours, DayHours, DayHours, DayHours, DayHours, DayHours] | null
  hoursNote?: string
  link?: string
}

const CLOSED = null
const H = (open: string, close: string): DayHours => ({ open, close })

export const businesses: Business[] = [
  {
    id: 'sunset-variety',
    name: 'Sunset Variety',
    status: 'open',
    tagline: 'Curated consignment shop',
    description:
      'Prints, stickers, magnets, small original art, textiles, woodwork, and ceramics — all by artists with strong connections to the Sunset. Curated by Jeana Lorraine.',
    // Placeholder hours — confirm with Jeana/Tom.
    hours: [H('11:00', '17:00'), CLOSED, CLOSED, H('11:00', '18:00'), H('11:00', '18:00'), H('11:00', '18:00'), H('11:00', '18:00')],
  },
  {
    id: 'music-hall',
    name: 'Sunset Village Music Hall',
    status: 'open',
    tagline: 'A 70-person neighborhood venue',
    description:
      'An intimate music hall for live performances, listening events, and gatherings. Open during shows and events — see the calendar below.',
    hours: null,
    hoursNote: 'Open for scheduled events',
    link: '#music-hall',
  },
  {
    id: 'flower-shop',
    name: 'The Flower Shop',
    status: 'coming-soon',
    tagline: 'Fresh flowers on Judah',
    description: 'A neighborhood flower shop is on its way. Details soon.',
    hours: null,
    hoursNote: 'Opening soon',
  },
  {
    id: 'more',
    name: 'More in the works',
    status: 'planned',
    tagline: 'Practice rooms · recording space · small offices',
    description:
      'The remaining spaces are being shaped into practice and recording rooms for musicians and small offices for solo practitioners. Interested? Get in touch below.',
    hours: null,
    hoursNote: 'In planning',
    link: '#book',
  },
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const fmt = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hr = h % 12 === 0 ? 12 : h % 12
  return m ? `${hr}:${String(m).padStart(2, '0')}${ampm}` : `${hr}${ampm}`
}

/** Collapse weekly hours into lines like "Wed–Sun · 11am–6pm". */
export function hourLines(hours: NonNullable<Business['hours']>): string[] {
  const groups: { days: number[]; label: string }[] = []
  hours.forEach((h, day) => {
    const label = h ? `${fmt(h.open)}–${fmt(h.close)}` : ''
    if (!h) return
    const last = groups[groups.length - 1]
    if (last && last.label === label && last.days[last.days.length - 1] === day - 1) {
      last.days.push(day)
    } else {
      groups.push({ days: [day], label })
    }
  })
  return groups.map((g) => {
    const range =
      g.days.length > 1
        ? `${DAY_NAMES[g.days[0]]}–${DAY_NAMES[g.days[g.days.length - 1]]}`
        : DAY_NAMES[g.days[0]]
    return `${range} · ${g.label}`
  })
}

/** Is the business open right now (viewer's local time)? */
export function isOpenNow(b: Business, now = new Date()): boolean {
  if (!b.hours) return false
  const today = b.hours[now.getDay()]
  if (!today) return false
  const mins = now.getHours() * 60 + now.getMinutes()
  const toMin = (t: string) => Number(t.split(':')[0]) * 60 + Number(t.split(':')[1])
  return mins >= toMin(today.open) && mins < toMin(today.close)
}
