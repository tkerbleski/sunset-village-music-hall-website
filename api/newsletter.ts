// Vercel serverless function: POST /api/newsletter
// Adds a signup to a Resend Audience when NEWSLETTER_AUDIENCE_ID is set;
// always forwards the signup to the inquiry inbox as a backup record.

interface VercelReq {
  method?: string
  body?: Record<string, unknown>
}
interface VercelRes {
  status: (code: number) => VercelRes
  json: (data: unknown) => void
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { RESEND_API_KEY, INQUIRY_TO, INQUIRY_FROM, NEWSLETTER_AUDIENCE_ID } = process.env
  if (!RESEND_API_KEY || !INQUIRY_TO || !INQUIRY_FROM) {
    return res.status(500).json({ error: 'Newsletter endpoint not configured' })
  }

  const email = String(req.body?.email ?? '').slice(0, 200)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const headers = {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  }

  if (NEWSLETTER_AUDIENCE_ID) {
    await fetch(`https://api.resend.com/audiences/${NEWSLETTER_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, unsubscribed: false }),
    }).catch(() => {}) // backup email below still records the signup
  }

  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: INQUIRY_FROM,
      to: [INQUIRY_TO],
      subject: `Sunset Village newsletter signup — ${email}`,
      text: `New newsletter signup: ${email}`,
    }),
  })

  if (!send.ok) return res.status(502).json({ error: 'Signup failed' })
  return res.status(200).json({ ok: true })
}
