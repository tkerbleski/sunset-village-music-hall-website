// Resend REST API (no SDK). This site only ever uses the plain email
// endpoints, never Resend Audiences/Segments: the subscriber list lives in
// this site's own database. Use a *sending-only* API key restricted to the
// sunsetvillagesf.com domain so the key cannot reach any other site's lists.

import tokens from '@/lib/tokens.json'
import { site } from '@/lib/data/site'

export const SITE_URL = 'https://sunsetvillagesf.com'

// Email can't use the Tailwind classes, so colors come from the token file.
const c = (k: keyof typeof tokens.color) => tokens.color[k].value
export const emailFont = "'Bricolage Grotesque', Helvetica, Arial, sans-serif"

export const hasEmail = () => Boolean(process.env.RESEND_API_KEY && process.env.INQUIRY_FROM)

export interface Email {
  to: string[]
  subject: string
  text: string
  html?: string
  reply_to?: string
  headers?: Record<string, string>
}

const resend = (path: string, body: unknown) =>
  fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export async function sendEmail(e: Email): Promise<boolean> {
  if (!hasEmail()) return false
  const r = await resend('/emails', { from: process.env.INQUIRY_FROM, ...e }).catch(() => null)
  return Boolean(r?.ok)
}

/** Up to 100 emails per call (Resend batch limit). Returns how many were accepted. */
export async function sendBatch(emails: Email[]): Promise<number> {
  if (!hasEmail()) return 0
  let sent = 0
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100).map((e) => ({ from: process.env.INQUIRY_FROM, ...e }))
    const r = await resend('/emails/batch', chunk).catch(() => null)
    if (r?.ok) sent += chunk.length
  }
  return sent
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Plain text announcement → simple HTML: paragraphs, line breaks, links. */
export function announcementHtml(body: string, unsubscribeUrl: string): string {
  const paras = body
    .trim()
    .split(/\n\s*\n/)
    .map((p) =>
      esc(p)
        .replace(/(https?:\/\/[^\s<]+)/g, `<a href="$1" style="color:${c('sea')}">$1</a>`)
        .replace(/\n/g, '<br>'),
    )
    .map((p) => `<p style="margin:0 0 16px">${p}</p>`)
    .join('')
  return `<div style="background:${c('fog')};padding:24px 12px">
<div style="font-family:${emailFont};font-size:17px;line-height:1.5;color:${c('ink')};background:${c('paper')};border:2px solid ${c('ink')};border-radius:24px;max-width:560px;margin:0 auto;padding:28px">
${paras}
<hr style="border:none;border-top:1px solid ${c('line')};margin:28px 0 12px">
<p style="font-size:13px;color:${c('ink-2')};margin:0">Sunset Village Music Hall · 4114 Judah St, San Francisco<br>
You signed up for the ${site.newsletter} at sunsetvillagesf.com. <a href="${unsubscribeUrl}" style="color:${c('ink-2')}">Unsubscribe</a></p>
</div></div>`
}

export const announcementText = (body: string, unsubscribeUrl: string) =>
  `${body.trim()}\n\n--\nSunset Village · 4114 Judah St, San Francisco\nUnsubscribe: ${unsubscribeUrl}`

export const unsubscribeUrl = (token: string) => `${SITE_URL}/api/newsletter?unsubscribe=${token}`
