// Vercel serverless function: /api/newsletter
//   POST {email}               sign up (saved to this site's database)
//   GET/POST ?unsubscribe=…    unsubscribe link from announcement emails
//                              (POST is the one-click List-Unsubscribe form)
// The list lives only in this site's database; Resend is used just to send.

import { query, hasDb } from '../db'
import { sendEmail, hasEmail, emailFont } from '../email'
import tokens from '@/lib/tokens.json'
import { str, isEmail, type VercelReq, type VercelRes } from '../http'

const page = (msg: string) => `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sunset Village Music Hall</title>
<body style="font-family:${emailFont};background:${tokens.color.fog.value};color:${tokens.color.ink.value};text-align:center;padding:80px 20px">
<h1 style="font-size:36px;letter-spacing:-0.02em">${msg}</h1>
<p><a href="/" style="color:${tokens.color.sea.value}">Back to Sunset Village Music Hall</a></p></body>`

export default async function handler(req: VercelReq, res: VercelRes) {
  const token = str(req.query?.unsubscribe)
  if (token) {
    if (!hasDb()) return res.status(500).json({ error: 'Not configured' })
    await query(
      `update subscribers set unsubscribed_at = now() where token::text = $1 and unsubscribed_at is null`,
      [token],
    ).catch(() => {})
    if (req.method === 'POST') return res.status(200).json({ ok: true })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(page('You’re unsubscribed.'))
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasDb()) return res.status(500).json({ error: 'Newsletter endpoint not configured' })

  const email = str(req.body?.email).trim().toLowerCase().slice(0, 200)
  if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email' })

  // Signing up again re-subscribes someone who had unsubscribed.
  const saved = await query(
    `insert into subscribers (email) values ($1)
     on conflict (email) do update set unsubscribed_at = null`,
    [email],
  )
    .then(() => true)
    .catch((e) => {
      console.error('newsletter: database save failed', e)
      return false
    })

  // If the database is down, email the signup to the inbox so it isn't lost.
  const emailed =
    !saved &&
    hasEmail() &&
    Boolean(process.env.INQUIRY_TO) &&
    (await sendEmail({
      to: [process.env.INQUIRY_TO!],
      subject: `Newsletter signup (not saved, add it in the admin) — ${email}`,
      text: `The website couldn't save this newsletter signup to the database, so here it is by email.\n\nAdd it under Newsletter in https://sunsetvillagesf.com/admin:\n\n${email}`,
    }))

  if (!saved && !emailed) return res.status(502).json({ error: 'Signup failed' })
  return res.status(200).json({ ok: true })
}
