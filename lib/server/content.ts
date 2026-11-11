// Events, spaces and site settings for the public pages. Read straight from
// Neon on the server (pages revalidate every 30s); the seed files in
// lib/data/ are the fallback for local dev without DATABASE_URL, or if the
// database can't be reached.

import 'server-only'
import { query, hasDb, eventFromRow, tenantFromRow, getSettings } from './db'
import { hasStripe, soldByEvent } from './stripe'
import { events as seedEvents, type VillageEvent } from '@/lib/data/events'
import { tenants as seedTenants, type Tenant } from '@/lib/data/tenants'
import { sampleEvents } from '@/lib/data/sample-events'

// Local design review: SAMPLE_CONTENT=1 npm run dev shows the handoff's sample calendar.
const fallbackEvents = () => (process.env.SAMPLE_CONTENT === '1' ? sampleEvents : seedEvents)

export interface Content {
  events: VillageEvent[]
  tenants: Tenant[]
  /** Google Form that replaces the built-in booking form, if one is set in /admin. */
  bookingFormUrl: string | null
}

// Online sales show only once Stripe is connected; until then an event with
// a ticket price falls back to its ticket link or "at the door".
export function withTickets(e: Record<string, any>, sold: Map<string, number>) {
  if (!e.ticketPrice || !hasStripe()) {
    const { ticketPrice: _p, capacity: _c, ...rest } = e
    return rest
  }
  const { capacity, ...rest } = e
  return capacity ? { ...rest, ticketsLeft: Math.max(0, capacity - (sold.get(e.id) ?? 0)) } : rest
}

export async function loadContent(): Promise<Content> {
  if (!hasDb()) return { events: fallbackEvents(), tenants: seedTenants, bookingFormUrl: null }
  try {
    const [events, tenants, sold, settings] = await Promise.all([
      query(`select * from events order by date`),
      query(`select * from tenants order by sort, name`),
      hasStripe() ? soldByEvent() : new Map<string, number>(),
      getSettings(),
    ])
    return {
      events: events.map((r) => withTickets(eventFromRow(r), sold) as VillageEvent),
      tenants: tenants.map((r) => tenantFromRow(r) as Tenant),
      bookingFormUrl: settings.booking_form_url ?? null,
    }
  } catch (e) {
    console.error('content: database read failed, using seed data', e)
    return { events: seedEvents, tenants: seedTenants, bookingFormUrl: null }
  }
}
