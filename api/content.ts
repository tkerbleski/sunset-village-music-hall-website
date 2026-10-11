// Vercel serverless function: GET /api/content
// Public read of the events calendar and the shops list for the site.
// CDN-cached for 30 seconds, so admin edits show up within about a minute.

import { query, hasDb, eventFromRow, tenantFromRow, getSettings } from './_lib/db.js'
import { hasStripe, soldByEvent } from './_lib/stripe.js'
import type { VercelReq, VercelRes } from './_lib/http.js'

// Online sales show only once Stripe is connected; until then an event with
// a ticket price falls back to its ticket link or "at the door".
function withTickets(e: Record<string, any>, sold: Map<string, number>) {
  if (!e.ticketPrice || !hasStripe()) {
    const { ticketPrice: _p, capacity: _c, ...rest } = e
    return rest
  }
  const { capacity, ...rest } = e
  return capacity ? { ...rest, ticketsLeft: Math.max(0, capacity - (sold.get(e.id) ?? 0)) } : rest
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasDb()) return res.status(503).json({ error: 'Not configured' })

  try {
    const [events, tenants, sold, settings] = await Promise.all([
      query(`select * from events order by date`),
      query(`select * from tenants order by sort, name`),
      hasStripe() ? soldByEvent() : new Map<string, number>(),
      getSettings(),
    ])
    // Browsers always ask for fresh data, so the owner sees an edit as soon as
    // they reload. Only Vercel's CDN caches (briefly), which keeps it fast.
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Vercel-CDN-Cache-Control', 'max-age=30, stale-while-revalidate=60')
    return res.status(200).json({ events: events.map((r) => withTickets(eventFromRow(r), sold)), tenants: tenants.map(tenantFromRow),
      bookingFormUrl: settings.booking_form_url ?? null,
    })
  } catch {
    return res.status(502).json({ error: 'Could not load content' })
  }
}
