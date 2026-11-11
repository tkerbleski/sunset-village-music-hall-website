// Admin auth. Each admin has their own email + password (the `admins`
// table, passwords scrypt-hashed). Signing in sets an HttpOnly cookie holding
// the admin's id, an expiry, and an HMAC of both plus their password hash,
// keyed off ADMIN_PASSWORD. So changing ADMIN_PASSWORD in Vercel signs
// everyone out, changing or resetting an admin's password signs out their
// other sessions, and removing an admin signs them out on their next request.
//
// ADMIN_PASSWORD is also the owner's master key: with it, any admin's email
// signs in (password recovery), and when there are no admins yet it creates
// the first account.

import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { query } from './db'
import { header, type VercelReq, type VercelRes } from './http'

const COOKIE = 'sv_admin'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface Admin {
  id: number
  email: string
  name: string
}

const key = () => createHash('sha256').update(`sv-admin:${process.env.ADMIN_PASSWORD}`).digest()
const sign = (payload: string, passwordHash: string | null) =>
  createHmac('sha256', key()).update(`${payload}.${passwordHash ?? ''}`).digest('hex')

const safeEqual = (a: string, b: string) => {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export const isMasterPassword = (pw: string) =>
  Boolean(process.env.ADMIN_PASSWORD) && safeEqual(pw, process.env.ADMIN_PASSWORD!)

// ── Passwords ──────────────────────────────────────────────────────────

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`
}

export function checkPassword(pw: string, stored: string | null): boolean {
  if (!stored) return false
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const got = scryptSync(pw, salt, 32)
  const want = Buffer.from(hash, 'hex')
  return want.length === got.length && timingSafeEqual(got, want)
}

/** Readable one-time password for a new admin, e.g. "harbor-7342-sunny". */
export function tempPassword(): string {
  const words = ['judah', 'ocean', 'harbor', 'sunny', 'dune', 'cypress', 'fog', 'tide', 'kelp', 'gull', 'coast', 'pier']
  const pick = () => words[randomBytes(1)[0] % words.length]
  return `${pick()}-${1000 + (randomBytes(2).readUInt16BE() % 9000)}-${pick()}`
}

// ── Sessions ───────────────────────────────────────────────────────────

const cookieAttrs = (maxAge: number) => `Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`

export async function setSession(res: VercelRes, adminId: number) {
  const [row] = await query<{ password_hash: string | null }>(`select password_hash from admins where id = $1`, [adminId])
  const payload = `${adminId}.${Math.floor(Date.now() / 1000) + MAX_AGE}`
  res.setHeader('Set-Cookie', `${COOKIE}=${payload}.${sign(payload, row?.password_hash ?? null)}; ${cookieAttrs(MAX_AGE)}`)
}

export function clearSession(res: VercelRes) {
  res.setHeader('Set-Cookie', `${COOKIE}=; ${cookieAttrs(0)}`)
}

/** The signed-in admin, or null. */
export async function currentAdmin(req: VercelReq): Promise<Admin | null> {
  if (!process.env.ADMIN_PASSWORD) return null
  const raw = header(req, 'cookie')
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
  if (!raw) return null
  const [id, exp, sig] = raw.slice(COOKIE.length + 1).split('.')
  if (!/^\d+$/.test(id ?? '') || !exp || !sig || Number(exp) < Date.now() / 1000) return null
  const [row] = await query<Admin & { password_hash: string | null }>(
    `select id, email, name, password_hash from admins where id = $1`,
    [Number(id)],
  )
  if (!row || !safeEqual(sig, sign(`${id}.${exp}`, row.password_hash))) return null
  return { id: row.id, email: row.email, name: row.name }
}
