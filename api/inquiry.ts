// Vercel serverless function: POST /api/inquiry
// Saves a booking/event inquiry to the database (shown in /admin under
// Bookings) and emails it to INQUIRY_TO via Resend when email is set up.
// Succeeds if either the save or the email went through; if both fail the
// visitor sees an error (their form stays filled in) and can try again.

import { query, hasDb } from './_lib/db.js'
import { sendEmail, hasEmail } from './_lib/email.js'
import { str, type VercelReq, type VercelRes } from './_lib/http.js'

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const notify = hasEmail() && Boolean(process.env.INQUIRY_TO)
  if (!hasDb() && !notify) {
    return res.status(500).json({ error: 'Inquiry endpoint not configured' })
  }

  const body = req.body ?? {}
  const type = str(body.type).slice(0, 100)
  const name = str(body.name).slice(0, 200)
  const email = str(body.email).slice(0, 200)
  const date = str(body.date).slice(0, 40)
  const headcount = str(body.headcount).slice(0, 40)
  const message = str(body.message).slice(0, 5000)
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  let saved = false
  if (hasDb()) {
    saved = await query(
      `insert into bookings (type, name, email, date, headcount, message) values ($1, $2, $3, $4, $5, $6)`,
      [type, name, email, date || null, headcount || null, message],
    )
      .then(() => true)
      .catch((e) => {
        console.error('inquiry: database save failed', e)
        return false
      })
  }

  let emailed = false
  if (notify) {
    const lines = [
      `Type: ${type}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Preferred date: ${date || '(none)'}`,
      `Headcount: ${headcount || '(none)'}`,
      '',
      'Message:',
      message,
      '',
      saved ? 'Also saved in the admin: https://sunsetvillagesf.com/admin' : '',
    ]
    emailed = await sendEmail({
      to: [process.env.INQUIRY_TO!],
      reply_to: email,
      subject: `Sunset Village inquiry — ${type || 'general'} — ${name}`,
      text: lines.join('\n'),
    })
  }

  if (!saved && !emailed) return res.status(502).json({ error: 'Could not save inquiry' })
  return res.status(200).json({ ok: true })
}
