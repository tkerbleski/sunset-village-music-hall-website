// Vercel serverless function: POST /api/inquiry
// Emails a booking/event inquiry via the Resend REST API (no SDK dependency).
// Env vars (see .env.example): RESEND_API_KEY, INQUIRY_TO, INQUIRY_FROM.
// Until set, this returns 500 and the form shows an error.

interface VercelReq {
  method?: string
  body?: Record<string, unknown>
}
interface VercelRes {
  status: (code: number) => VercelRes
  json: (data: unknown) => void
}

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v))

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { RESEND_API_KEY, INQUIRY_TO, INQUIRY_FROM } = process.env
  if (!RESEND_API_KEY || !INQUIRY_TO || !INQUIRY_FROM) {
    return res.status(500).json({ error: 'Inquiry endpoint not configured' })
  }

  const body = req.body ?? {}
  const name = str(body.name).slice(0, 200)
  const email = str(body.email).slice(0, 200)
  const message = str(body.message).slice(0, 5000)
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const lines = [
    `Type: ${str(body.type)}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Preferred date: ${str(body.date) || '(none)'}`,
    `Headcount: ${str(body.headcount) || '(none)'}`,
    '',
    'Message:',
    message,
  ]

  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: INQUIRY_FROM,
      to: [INQUIRY_TO],
      reply_to: email,
      subject: `Sunset Village inquiry — ${str(body.type) || 'general'} — ${name}`,
      text: lines.join('\n'),
    }),
  })

  if (!send.ok) return res.status(502).json({ error: 'Email send failed' })
  return res.status(200).json({ ok: true })
}
