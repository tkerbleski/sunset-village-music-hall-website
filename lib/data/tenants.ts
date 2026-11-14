// The shops and spaces inside the building. Shops are now managed in /admin
// and stored in the database; the list below is only the initial seed
// (npm run db:setup) and the fallback for local dev.
//
// Status: 'open' | 'coming-soon'. Do not list a business until its name is
// confirmed; the closing line in the section covers everything unannounced.
//
// Sunset Variety hours confirmed by Tom, Sep 2026: Fri to Sun, 11 to 6.

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
  /** Shown in the mono kind line, e.g. "Curated goods". */
  type?: string
  /** Street address, e.g. "1399 46th Ave". Shown after the type. (Stored in the old `unit` column.) */
  unit?: string
  instagram?: string
  /** Storefront photo; fills the card's photo area. */
  photo?: string
  /** Card photo-area fill when there is no photo. */
  fill?: 'fog' | 'sun' | 'yellow' | 'teal' | 'pink'
}

const CLOSED = null
const H = (open: string, close: string): DayHours => ({ open, close })

export const tenants: Tenant[] = [
  {
    id: 'music-hall',
    name: 'Sunset Village Music Hall',
    status: 'open',
    type: 'Live music venue',
    blurb: 'Bands, DJ nights and community events. That’s us.',
    hoursNote: 'Show nights · see calendar',
    link: '/events',
    linkLabel: 'See events',
    fill: 'fog',
  },
  {
    id: 'sunset-variety',
    name: 'Sunset Variety',
    status: 'open',
    type: 'Curated goods',
    unit: '1399 46th Ave',
    fill: 'teal',
    blurb: 'Prints, ceramics, textiles, woodwork and more, curated from over 90 local artists.',
    hours: [H('11:00', '18:00'), CLOSED, CLOSED, CLOSED, CLOSED, H('11:00', '18:00'), H('11:00', '18:00')],
    link: 'https://sunsetvariety.com/',
    linkLabel: 'sunsetvariety.com',
  },
  {
    id: 'bright-moments',
    name: 'Bright Moments',
    status: 'open',
    type: 'Flowers & gifts',
    unit: '1397 46th Ave',
    fill: 'pink',
    blurb: 'A flower shop with gifts, cards and more for all of life’s bright moments.',
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
  // A span crossing the week boundary (e.g. Fri to Sun) arrives as two
  // groups, Sun plus Fri-Sat; merge them so it reads as one range.
  if (groups.length > 1) {
    const first = groups[0]
    const last = groups[groups.length - 1]
    if (first.days[0] === 0 && last.days[last.days.length - 1] === 6 && first.label === last.label) {
      last.days.push(...first.days.map((d) => d + 7))
      groups.shift()
    }
  }
  return groups.map((g) => {
    const range =
      g.days.length > 1
        ? `${DAY_NAMES[g.days[0] % 7]} to ${DAY_NAMES[g.days[g.days.length - 1] % 7]}`
        : DAY_NAMES[g.days[0] % 7]
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
