// GET /api/content
// Public read of the events calendar and the shops list. The site's own pages
// read the database on the server (lib/server/content.ts); this endpoint is
// kept for anything else that wants the data. CDN-cached for 30 seconds.

import { hasDb } from '../db'
import { loadContent } from '../content'
import type { VercelReq, VercelRes } from '../http'

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasDb()) return res.status(503).json({ error: 'Not configured' })
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Vercel-CDN-Cache-Control', 'max-age=30, stale-while-revalidate=60')
  return res.status(200).json(await loadContent())
}
