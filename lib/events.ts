// Date and CTA helpers for events. Dates are plain yyyy-mm-dd strings in
// San Francisco time; "today" is computed in America/Los_Angeles so the
// server and the visitor agree on what's upcoming.

import type { EventCategory, VillageEvent } from '@/lib/data/events'

export const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => parse(iso).toLocaleDateString('en-US', { timeZone: 'UTC', ...o })

export const dateParts = (iso: string) => ({
  dow: fmt(iso, { weekday: 'short' }).toUpperCase(),
  day: Number(iso.slice(8, 10)),
  month: fmt(iso, { month: 'short' }).toUpperCase(),
})
export const monthLabel = (iso: string) => fmt(iso, { month: 'long', year: 'numeric' })
export const longDate = (iso: string) => fmt(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

export const categoryOf = (e: VillageEvent): EventCategory => e.category ?? 'music'

/** Online sales are open: a price is set and the event hasn't happened. */
export const sellsOnline = (e: VillageEvent) => Boolean(e.ticketPrice) && e.date >= todayISO()

export const upcoming = (events: VillageEvent[]) =>
  events.filter((e) => e.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date))

export const past = (events: VillageEvent[]) =>
  events.filter((e) => e.date < todayISO()).sort((a, b) => b.date.localeCompare(a.date))

export const dollars = (cents: number) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`

/** "$18 adv · $22 door" style price line, from the free-text price or the online price. */
export function priceLine(e: VillageEvent): string | undefined {
  if (e.price) return e.price
  if (e.ticketPrice) return dollars(e.ticketPrice)
  return undefined
}

export const eventHref = (e: VillageEvent) => `/events/${encodeURIComponent(e.id)}`

/**
 * The event's main action. Online sales and RSVPs go to the event page
 * (where the ticket box lives); an outside ticket link goes straight out.
 */
export function primaryAction(e: VillageEvent): { label: string; href: string; external: boolean } | null {
  if (e.date < todayISO()) return null
  if (sellsOnline(e)) return { label: e.cta || 'Get tickets', href: eventHref(e), external: false }
  if (e.ticketUrl) return { label: e.cta || 'Get tickets', href: e.ticketUrl, external: true }
  if (e.cta) return { label: e.cta, href: eventHref(e), external: false }
  return null
}

export function groupByMonth(events: VillageEvent[]) {
  const groups: { label: string; events: VillageEvent[] }[] = []
  for (const e of events) {
    const label = monthLabel(e.date)
    const last = groups[groups.length - 1]
    if (last?.label === label) last.events.push(e)
    else groups.push({ label, events: [e] })
  }
  return groups
}
