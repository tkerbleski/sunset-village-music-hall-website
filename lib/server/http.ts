// Minimal request/response shapes for Vercel Node functions (no @vercel/node
// dependency), plus small helpers shared by the endpoints.

export interface VercelReq {
  method?: string
  body?: Record<string, unknown>
  query?: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
}
export interface VercelRes {
  status: (code: number) => VercelRes
  json: (data: unknown) => void
  send: (body: string) => void
  setHeader: (name: string, value: string | string[]) => void
}

export const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v))

/** Trimmed string or null, capped at `max` characters. */
export const opt = (v: unknown, max = 2000): string | null => {
  const s = str(v).trim().slice(0, max)
  return s ? s : null
}

export const header = (req: VercelReq, name: string): string => {
  const v = req.headers[name.toLowerCase()]
  return Array.isArray(v) ? v[0] ?? '' : v ?? ''
}

export const clientIp = (req: VercelReq): string =>
  header(req, 'x-forwarded-for').split(',')[0].trim() || header(req, 'x-real-ip') || 'unknown'

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
