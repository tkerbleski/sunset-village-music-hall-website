// Calls to /api/admin. Errors carry the server's plain-language message so
// screens can show it as is.

export class SignedOut extends Error {}

async function call<T>(action: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/admin?action=${action}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  }).catch(() => null)
  if (!res) throw new Error('Can’t reach the server. Check your internet connection.')
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && action !== 'login') throw new SignedOut()
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Try again.')
  return data as T
}

export const getJson = <T,>(action: string) => call<T>(action)
export const postJson = <T = { ok: true },>(action: string, body: unknown) => call<T>(action, body)

export interface Booking {
  id: number
  created_at: string
  type: string | null
  name: string
  email: string
  date: string | null
  headcount: string | null
  message: string
  status: 'new' | 'replied' | 'booked' | 'declined'
  notes: string | null
  org?: string | null
  phone?: string | null
  backup_date?: string | null
  /** Comma-separated, e.g. "Sound tech, Bar". */
  needs?: string | null
}

export interface Subscriber {
  id: number
  email: string
  created_at: string
  unsubscribed_at: string | null
}

export interface Announcement {
  id: number
  created_at: string
  subject: string
  body: string
  recipients: number
  sent: number
}

export interface Setup {
  email: boolean
  notifications: boolean
  uploads: boolean
  payments: boolean
  backups: boolean
  calendar: boolean
}

export interface Me extends Setup {
  admin: { id: number; email: string; name: string }
  newBookings: number
  usingSetupPassword: boolean
}

export interface AdminUser {
  id: number
  email: string
  name: string
  created_at: string
  last_login_at: string | null
  created_by_name: string | null
}

export interface Order {
  id: number
  created_at: string
  event_id: string
  event_title: string | null
  event_date: string | null
  name: string | null
  email: string
  quantity: number
  amount_cents: number
  payment_intent: string | null
  checked_in: boolean
  refunded_at: string | null
}
