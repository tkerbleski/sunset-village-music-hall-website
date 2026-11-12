// One-way sync of the events calendar into a Google Calendar (site → Google).
// Saving an event in /admin creates or updates it there; deleting removes it.
// Edits made in Google are overwritten by the next save from the site.
//
// Auth: a Google Cloud service account (no SDK — REST + a self-signed JWT).
// The calendar's owner shares the calendar with the service account's email
// and gives it "Make changes to events".
//
// Env:
//   GOOGLE_SERVICE_ACCOUNT_KEY  the service account's JSON key file, pasted whole
//   GOOGLE_CALENDAR_ID          the calendar's ID (Settings → Integrate calendar)
//
// Each site event maps to a calendar event with a fixed ID derived from the
// site's event ID, so saves are idempotent and retries never duplicate.

import { createHash, createSign } from 'node:crypto'
import { SITE_URL } from './email'
import { fullAddress } from '@/lib/data/site'

const TZ = 'America/Los_Angeles'
const DEFAULT_LENGTH_MIN = 180
const API = 'https://www.googleapis.com/calendar/v3'

interface ServiceAccount {
  client_email: string
  private_key: string
}

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) return null
  try {
    // Accept the JSON as-is, or base64-encoded (handy for some env editors).
    const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
    const key = JSON.parse(json) as ServiceAccount
    return key.client_email && key.private_key ? key : null
  } catch {
    return null
  }
}

export const hasCalendar = () => Boolean(serviceAccount() && process.env.GOOGLE_CALENDAR_ID)

// ── Access token (cached until shortly before it expires) ───────────────

let cached: { token: string; exp: number } | null = null

const b64url = (s: string | Buffer) => Buffer.from(s).toString('base64url')

async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token
  const sa = serviceAccount()
  if (!sa) throw new Error('Google service account key is missing or invalid')
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  )
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(sa.private_key.replace(/\\n/g, '\n'))
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${b64url(signature)}`,
    }),
  })
  const data: any = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) throw new Error(`Google token: ${data.error_description ?? data.error ?? res.status}`)
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in ?? 3600) * 1000 }
  return cached.token
}

async function gcal(method: string, path: string, body?: unknown): Promise<Response> {
  return fetch(`${API}/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ── Mapping a site event to a calendar event ───────────────────────────

/** Calendar event IDs allow a–v and 0–9 only; a hex hash fits. */
export const calendarEventId = (siteId: string) => `sv${createHash('sha1').update(siteId).digest('hex')}`

export interface CalendarSource {
  id: string
  title: string
  date: string // yyyy-mm-dd
  startTime?: string | null // HH:MM, 24h, Pacific
  endTime?: string | null
  venue?: string | null
  kind?: string | null
  subtitle?: string | null
  summary?: string | null
  details?: string | null
  price?: string | null
  ticketUrl?: string | null
}

const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

/** Start/end in Google's format. No start time → all-day. End before start → next day (e.g. "til 2am"). */
export function calendarTimes(e: Pick<CalendarSource, 'date' | 'startTime' | 'endTime'>) {
  if (!e.startTime) return { start: { date: e.date }, end: { date: addDays(e.date, 1) } }
  const start = toMin(e.startTime)
  let end = e.endTime ? toMin(e.endTime) : start + DEFAULT_LENGTH_MIN
  if (e.endTime && end <= start) end += 24 * 60
  const endDate = addDays(e.date, Math.floor(end / (24 * 60)))
  return {
    start: { dateTime: `${e.date}T${e.startTime}:00`, timeZone: TZ },
    end: { dateTime: `${endDate}T${fromMin(end % (24 * 60))}:00`, timeZone: TZ },
  }
}

export function calendarEvent(e: CalendarSource) {
  const page = `${SITE_URL}/events/${encodeURIComponent(e.id)}`
  const description = [
    [e.kind, e.subtitle].filter(Boolean).join(' · '),
    e.details ?? e.summary,
    e.price ? `Price: ${e.price}` : '',
    e.ticketUrl ? `Tickets: ${e.ticketUrl}` : '',
    `Event page: ${page}`,
  ]
    .filter(Boolean)
    .join('\n\n')
  return {
    id: calendarEventId(e.id),
    status: 'confirmed',
    summary: e.title,
    description,
    location: `${e.venue ?? 'Music Hall'}, ${fullAddress}`,
    ...calendarTimes(e),
    source: { title: 'Sunset Village Music Hall', url: page },
  }
}

// ── Sync ───────────────────────────────────────────────────────────────

/** Create or update the event in Google Calendar. Resolves false (and logs) on failure. */
export async function upsertCalendarEvent(e: CalendarSource): Promise<boolean> {
  if (!hasCalendar()) return false
  try {
    const body = calendarEvent(e)
    let res = await gcal('PUT', `/events/${body.id}`, body)
    if (res.status === 404) res = await gcal('POST', '/events', body)
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
    return true
  } catch (err) {
    console.error('calendar: upsert failed', e.id, err)
    return false
  }
}

/** Remove the event from Google Calendar. Already gone counts as success. */
export async function deleteCalendarEvent(siteId: string): Promise<boolean> {
  if (!hasCalendar()) return false
  try {
    const res = await gcal('DELETE', `/events/${calendarEventId(siteId)}`)
    if (!res.ok && res.status !== 404 && res.status !== 410) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
    return true
  } catch (err) {
    console.error('calendar: delete failed', siteId, err)
    return false
  }
}
