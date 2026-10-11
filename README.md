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
pages (with Buy tickets when online sales are on), `/music-hall` venue page
with the inquiry form.

## Content & admin

Events and shops are edited at **/admin** and stored in Neon Postgres. Each
admin signs in with their own email + password (`admins` table, scrypt
hashes). `ADMIN_PASSWORD` is the owner's master key: the first sign-in with
it creates the first admin, and it works as a recovery password for any
admin email. The public pages fetch them
from `/api/content`; `src/data/events.ts` and `src/data/tenants.ts` are only
the initial seed and the fallback used in local dev (no API there) or if the
API is unreachable. Editing those files does not change the live site.

`src/data/site.ts` (address, socials, booking email) is still edited in code.

Admin screens (`src/admin/`): Overview (counts, latest inquiries and ticket
sales, upcoming events, which services are connected), Events
(add/edit/duplicate, flyer upload to Vercel Blob, online ticket price +
capacity), Bookings (inquiries from the Music Hall form, status + private
notes), Tickets (orders per event, door-list check-in, refunded flag, CSV),
Newsletter (subscribers, CSV download, send announcements), Shops (details,
weekly hours, order), Team (add/remove admins, temp passwords, change your
own password).

## Backend

Vercel functions in `api/` (shared code in `api/_lib/`):

- `inquiry.ts` saves to the `bookings` table, then emails `INQUIRY_TO`.
  Succeeds if either works; if both fail the visitor sees an error.
- `newsletter.ts` saves to `subscribers`; emails the signup to `INQUIRY_TO`
  if the database write fails. Also serves the unsubscribe link.
- `content.ts` is a public read of events + shops (CDN-cached 30s).
- `admin.ts` serves all admin actions, routed by `?action=`.
- `tickets.ts` creates Stripe Checkout sessions (`?action=checkout`), confirms
  them on the success page (`?action=confirm`), and takes the Stripe webhook
  (`?action=webhook`). Orders are recorded by re-reading the session from
  Stripe's API, so the webhook needs no signing secret; one row per session.
  Capacity is checked when checkout starts.
- `backup.ts` is a weekly Vercel cron (Mondays) that emails `INQUIRY_TO` a CSV of
  all bookings, ticket orders, and subscribers, archived/unsubscribed included.

Nothing the public submits is hard-deleted: "Archive" on a booking and
"Unsubscribe" on a subscriber only flag the row.

Email uses only Resend's plain send endpoints, never Audiences/Segments. The
subscriber list lives in this database, and announcements are sent with
`/emails/batch` with a per-subscriber unsubscribe link. Use a sending-only
Resend key restricted to the sunsetvillagesf.com domain.

### Setup (once)

1. Vercel → Storage: add **Neon** and **Blob** to this project (sets
   `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`).
2. `DATABASE_URL=… npm run db:setup` creates the tables and seeds events/shops
   from `src/data/`. Safe to re-run; re-run it after pulling schema changes.
3. Resend: verify the sunsetvillagesf.com domain and create a sending-only key
   for it. Set `RESEND_API_KEY`, `INQUIRY_FROM`, `INQUIRY_TO`.
4. Stripe: set `STRIPE_SECRET_KEY` and add the webhook endpoint
   `https://sunsetvillagesf.com/api/tickets?action=webhook`
   (`checkout.session.completed`).
5. Set `ADMIN_PASSWORD` and `CRON_SECRET`, then redeploy.
6. Sign in at /admin with your email and `ADMIN_PASSWORD`; that creates the
   first admin. Add everyone else under Team.

See `.env.example`.
