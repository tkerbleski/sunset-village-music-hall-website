# Sunset Village

Site for Sunset Village — a neighborhood gathering place at 4114 Judah St
at 46th Ave in the Outer Sunset, San Francisco. Local shops, a 70-person
music hall, and community spaces you can book.

## Stack

Vite + React 19 + TypeScript + Tailwind v4. No `tailwind.config` — design
tokens live in `@theme` inside `src/index.css`.

```bash
npm run dev              # local dev at :5173
npm run build            # tsc + vite build
npm run optimize:photos  # "Photo Assets/" → public/photos/*.webp
```

## Photos

Originals go in `Photo Assets/` (git-ignored — keep backups elsewhere).
`npm run optimize:photos` auto-rotates, resizes to 2400px, strips EXIF/GPS,
and writes webp to `public/photos/`. Known photos get stable names via the
map in `scripts/optimize-photos.mjs`; new drops get slugged filenames.

## Pages

React Router SPA (vercel.json rewrites all paths to index.html):
`/` home, `/events` calendar (upcoming + recent), `/events/:id` event
pages, `/music-hall` venue page with the inquiry form.

## Content

All frequently changing content lives in `src/data/` — components only
render it:

- `src/data/site.ts` — address, directions link, transit line, socials
- `src/data/tenants.ts` — shops/spaces, status (open / coming-soon), hours
  (**placeholder hours — confirm with Tom**)
- `src/data/events.ts` — the calendar; upcoming/past computed from date.
  Events marked `sample: true` render an "example listing" label. Add
  `ticketUrl` (Stripe payment link / Eventbrite) to an event to turn on its
  "Tickets" button — this is the seam for real ticket sales later.

## Forms / backend

`api/inquiry.ts` and `api/newsletter.ts` are Vercel functions that send via
the Resend REST API. Local dev short-circuits to success. To go live, set
env vars in Vercel — see `.env.example`. Newsletter signups also join a
Resend Audience when `NEWSLETTER_AUDIENCE_ID` is set.
