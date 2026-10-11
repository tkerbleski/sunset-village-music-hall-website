// Vercel cron: GET /api/backup, weekly (see vercel.json "crons").
// Emails INQUIRY_TO spreadsheets (CSV) of every booking, ticket order, and
// newsletter subscriber, archived and unsubscribed included, so a copy of the records
// always exists outside the database. Vercel signs cron calls with
// CRON_SECRET; anything else is refused.

import { query, hasDb } from './_lib/db.js'
import { hasEmail } from './_lib/email.js'
import { header, type VercelReq, type VercelRes } from './_lib/http.js'

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString() : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const toCsv = (rows: Record<string, unknown>[], cols: string[]) =>
  [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n')

export default async function handler(req: VercelReq, res: VercelRes) {
  const secret = process.env.CRON_SECRET
  if (!secret || header(req, 'authorization') !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!hasDb() || !hasEmail() || !process.env.INQUIRY_TO) {
    return res.status(503).json({ error: 'Not configured' })
  }

  const [bookings, subscribers, orders] = await Promise.all([
    query(`select * from bookings order by created_at`),
    query(`select email, created_at, unsubscribed_at from subscribers order by created_at`),
    query(
      `select o.*, e.title as event_title, e.date as event_date from orders o
       left join events e on e.id = o.event_id order by o.created_at`,
    ),
  ])
  const active = subscribers.filter((s) => !s.unsubscribed_at).length
  const day = new Date().toISOString().slice(0, 10)

  const send = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM,
      to: [process.env.INQUIRY_TO],
      subject: `Sunset Village weekly backup — ${day}`,
      text: [
        'Your weekly backup of the website records is attached. You don’t need to do anything;',
        'keep these emails as a spare copy. Open the files in Excel, Numbers, or Google Sheets.',
        '',
        `Bookings: ${bookings.length} total`,
        `Newsletter: ${active} subscribed (${subscribers.length} including unsubscribed)`,
        `Ticket orders: ${orders.length} total`,
      ].join('\n'),
      attachments: [
        {
          filename: `bookings-${day}.csv`,
          content: Buffer.from(
            toCsv(bookings, ['created_at', 'name', 'email', 'type', 'date', 'headcount', 'message', 'status', 'notes', 'archived_at']),
          ).toString('base64'),
        },
        {
          filename: `newsletter-${day}.csv`,
          content: Buffer.from(toCsv(subscribers, ['email', 'created_at', 'unsubscribed_at'])).toString('base64'),
        },
        {
          filename: `ticket-orders-${day}.csv`,
          content: Buffer.from(
            toCsv(orders, ['created_at', 'event_date', 'event_title', 'name', 'email', 'quantity', 'amount_cents', 'checked_in', 'refunded_at', 'payment_intent']),
          ).toString('base64'),
        },
      ],
    }),
  }).catch(() => null)

  if (!send?.ok) {
    console.error('backup: email failed', send?.status, await send?.text().catch(() => ''))
    return res.status(502).json({ error: 'Backup email failed' })
  }
  return res.status(200).json({ ok: true, bookings: bookings.length, subscribers: subscribers.length, orders: orders.length })
}
