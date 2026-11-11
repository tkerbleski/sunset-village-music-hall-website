# Sunset Village

Site for Sunset Village — a neighborhood gathering place at 4114 Judah St
at 46th Ave in the Outer Sunset, San Francisco. Local shops, a 70-person
music hall, and community spaces you can book.

## Stack

Next.js (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui, on
Vercel. No `tailwind.config`: design tokens live in `@theme` in
`app/globals.css`. The design system (tokens, components, rules for public and
internal pages) is described in `CLAUDE.md` and `handoff/docs/design-system.md`;
the approved design is in `handoff/`.

```bash
npm run dev              # local dev at :3000
SAMPLE_CONTENT=1 npm run dev   # with the design handoff's sample calendar
npm run build            # production build (includes type check)
npm run lint             # tsc --noEmit
npm run optimize:photos  # "Photo Assets/" → public/photos/*.webp
node scripts/screenshots.mjs http://localhost:3000   # page captures at 1440 / 390
```

## Photos

Originals go in `Photo Assets/` (git-ignored — keep backups elsewhere).
`npm run optimize:photos` auto-rotates, resizes to 2400px, strips EXIF/GPS,
and writes webp to `public/photos/`. Known photos get stable names via the
map in `scripts/optimize-photos.mjs`; new drops get slugged filenames.

## Pages

`/` home, `/events` calendar (category filter, `?type=` links), `/events/:id`
event pages (with Buy tickets when online sales are on), `/book` hall booking
request form, `/village` building directory. Pages read the database on the
server and refresh every 30 seconds.

## Deploying

Merges to `main` deploy to Vercel production through GitHub Actions
(`.github/workflows/deploy.yml`): the runner builds with the Vercel CLI and
uploads the result. It needs three repository secrets: `VERCEL_TOKEN`,
`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` (the last two are in
`.vercel/project.json` after `vercel link`). The app's own environment
variables live in the Vercel project. The workflow can also be run by hand
from the Actions tab. For a one-off deploy from your machine, run
`vercel deploy --prod`.

## Content & admin

Events and shops are edited at **/admin** and stored in Neon Postgres. Each
admin signs in with their own email + password (`admins` table, scrypt
hashes). `ADMIN_PASSWORD` is the owner's master key: the first sign-in with
it creates the first admin, and it works as a recovery password for any
admin email. The public pages fetch them
directly from the database on the server (`lib/server/content.ts`);
`lib/data/events.ts` and `lib/data/tenants.ts` are only the initial seed and
the fallback used in local dev (no database) or if the database is
unreachable. Editing those files does not change the live site.

`lib/data/site.ts` (address, socials, emails, room specs, and the
`[bracketed]` placeholders still to be filled in) is edited in code.

Admin screens (`app/admin/`): Overview (counts, latest inquiries and ticket
sales, upcoming events, which services are connected), Events
(add/edit/duplicate, flyer upload to Vercel Blob, online ticket price +
capacity), Bookings (requests from the Book the hall form, status + private
notes), Tickets (orders per event, door-list check-in, refunded flag, CSV),
Newsletter (subscribers, CSV download, send announcements), Shops (details,
weekly hours, order), Team (add/remove admins, temp passwords, change your
own password).

## Backend

Route handlers in `app/api/*/route.ts` run the handlers in
`lib/server/handlers/` (shared code in `lib/server/`) through a small adapter,
so the URLs are the same as before:

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
   `DATABASE_URL` and `BLOB_STORE_ID`).
2. `DATABASE_URL=… npm run db:setup` creates the tables and seeds events/shops
   from `lib/data/`. Safe to re-run; re-run it after pulling schema changes.
3. Resend: verify the sunsetvillagesf.com domain and create a sending-only key
   for it. Set `RESEND_API_KEY`, `INQUIRY_FROM`, `INQUIRY_TO`.
4. Stripe: set `STRIPE_SECRET_KEY` and add the webhook endpoint
   `https://sunsetvillagesf.com/api/tickets?action=webhook`
   (`checkout.session.completed`).
5. Set `ADMIN_PASSWORD` and `CRON_SECRET`, then redeploy.
6. Sign in at /admin with your email and `ADMIN_PASSWORD`; that creates the
   first admin. Add everyone else under Team.

See `.env.example`.
