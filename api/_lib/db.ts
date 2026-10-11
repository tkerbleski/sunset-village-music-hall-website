// Neon Postgres client. DATABASE_URL is set by the Neon integration in
// Vercel. Schema lives in scripts/db-setup.mjs.

import { neon } from '@neondatabase/serverless'

export const hasDb = () => Boolean(process.env.DATABASE_URL)

let client: ReturnType<typeof neon> | null = null

/** Parameterized query: query('select * from events where id = $1', [id]) */
export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set')
  client ??= neon(process.env.DATABASE_URL)
  return (await client.query(text, params)) as T[]
}

/** Site settings edited in the admin, as {key: value}. */
export async function getSettings(): Promise<Record<string, string>> {
  const rows = await query<{ key: string; value: string | null }>(`select key, value from settings`)
  return Object.fromEntries(rows.filter((r) => r.value).map((r) => [r.key, r.value!]))
}

// Row → the shapes the frontend uses (src/data/events.ts, src/data/tenants.ts).
// Empty columns are dropped so optional fields stay undefined, as in the
// original hand-written data.

const clean = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== '')) as T

export const eventFromRow = (r: Record<string, any>) =>
  clean({
    id: r.id,
    title: r.title,
    date: r.date,
    time: r.time,
    venue: r.venue,
    summary: r.summary,
    details: r.details,
    price: r.price,
    ticketUrl: r.ticket_url,
    flyer: r.flyer,
    ticketPrice: r.ticket_price_cents,
    capacity: r.capacity,
    sample: r.sample || null,
  })

export const tenantFromRow = (r: Record<string, any>) =>
  clean({
    id: r.id,
    name: r.name,
    status: r.status,
    blurb: r.blurb,
    hours: r.hours,
    hoursNote: r.hours_note,
    link: r.link,
    linkLabel: r.link_label,
  })
