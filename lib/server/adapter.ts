// Runs the (req, res) style handlers in lib/server/handlers/ as Next.js
// route handlers, so the backend logic (and every /api URL, the Stripe
// webhook and the admin cookie) stays exactly as it was on Vercel functions.

import type { VercelReq, VercelRes } from './http'

type Handler = (req: VercelReq, res: VercelRes) => unknown | Promise<unknown>

async function readBody(request: Request): Promise<Record<string, unknown> | undefined> {
  if (request.method === 'GET' || request.method === 'HEAD') return undefined
  const type = request.headers.get('content-type') ?? ''
  const text = await request.text().catch(() => '')
  if (!text) return undefined
  if (type.includes('application/json')) {
    try {
      return JSON.parse(text)
    } catch {
      return undefined
    }
  }
  if (type.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(text))
  }
  return undefined
}

export function route(handler: Handler) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    const query: Record<string, string> = Object.fromEntries(url.searchParams)
    const headers: Record<string, string> = {}
    request.headers.forEach((v, k) => (headers[k] = v))

    const req: VercelReq = { method: request.method, query, headers, body: await readBody(request) }

    let status = 200
    let body: string | null = null
    const out = new Headers()
    const res: VercelRes = {
      status(code) {
        status = code
        return res
      },
      json(data) {
        if (!out.has('content-type')) out.set('content-type', 'application/json; charset=utf-8')
        body = JSON.stringify(data)
      },
      send(text) {
        body = text
      },
      setHeader(name, value) {
        out.delete(name)
        for (const v of Array.isArray(value) ? value : [value]) out.append(name, v)
      },
    }

    await handler(req, res)
    return new Response(body, { status, headers: out })
  }
}
