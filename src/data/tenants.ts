// The shops and spaces inside the building. Single source for the
// "What's here" listings.
//
// Status: 'open' | 'coming-soon'. Do not list a business until its name is
// confirmed; the closing line in the section covers everything unannounced.
//
// TODO(Tom): Sunset Variety hours below are placeholders. Confirm before
// pointing people at them.

export type DayHours = { open: string; close: string } | null // "11:00", 24h

export interface Tenant {
  id: string
  name: string
  status: 'open' | 'coming-soon'
  blurb: string
  /** Sun..Sat (index 0 = Sunday). null day = closed. Omit if not applicable. */
  hours?: [DayHours, DayHours, DayHours, DayHours, DayHours, DayHours, DayHours]
  hoursNote?: string
  /** External site, or internal path starting with "/". */
  link?: string
  linkLabel?: string
}

const CLOSED = null
const H = (open: string, close: string): DayHours => ({ open, close })

export const tenants: Tenant[] = [
  {
    id: 'music-hall',
    name: 'Sunset Village Music Hall',
    status: 'open',
    blurb:
      'Live music and events in the former sanctuary. About 2,500 square feet, room for around 70 people.',
    hoursNote: 'Open during events',
    link: '/music-hall',
    linkLabel: 'About the hall',
  },
  {
    id: 'sunset-variety',
    name: 'Sunset Variety',
    status: 'open',
    blurb:
      'A shop of prints, ceramics, textiles, woodwork, and other goods by artists with roots in the Sunset. Run by Jeana Lorraine.',
    hours: [H('11:00', '17:00'), CLOSED, CLOSED, H('11:00', '18:00'), H('11:00', '18:00'), H('11:00', '18:00'), H('11:00', '18:00')],
    link: 'https://sunsetvariety.com/',
    linkLabel: 'sunsetvariety.com',
  },
  {
    id: 'flower-shop',
    name: 'Flower Shop',
    status: 'coming-soon',
    blurb: 'A flower shop is moving in. Details soon.',
  },
]

// Rendered after the tenant list.
export const tenantsFootnote =
  'The rest of the building is still taking shape. New tenants and projects will be announced here.'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const fmt = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hr = h % 12 === 0 ? 12 : h % 12
  return m ? `${hr}:${String(m).padStart(2, '0')}${ampm}` : `${hr}${ampm}`
}

/** Collapse weekly hours into lines like "Wed to Sat, 11am to 6pm". */
export function hourLines(hours: NonNullable<Tenant['hours']>): string[] {
  const groups: { days: number[]; label: string }[] = []
  hours.forEach((h, day) => {
    if (!h) return
    const label = `${fmt(h.open)} to ${fmt(h.close)}`
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
        ? `${DAY_NAMES[g.days[0]]} to ${DAY_NAMES[g.days[g.days.length - 1]]}`
        : DAY_NAMES[g.days[0]]
    return `${range}, ${g.label}`
  })
}

/** Open right now, by the viewer's local clock. */
export function isOpenNow(t: Tenant, now = new Date()): boolean {
  if (!t.hours) return false
  const today = t.hours[now.getDay()]
  if (!today) return false
  const mins = now.getHours() * 60 + now.getMinutes()
  const toMin = (s: string) => Number(s.split(':')[0]) * 60 + Number(s.split(':')[1])
  return mins >= toMin(today.open) && mins < toMin(today.close)
}
