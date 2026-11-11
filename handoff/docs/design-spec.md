# Sunset Village Music Hall: page spec (V2)

This is the build spec for the public site. The **source of truth for pixels** is the reference implementation in `reference/site/` (plain HTML + CSS) and the screenshots in `reference/screenshots/`. When this document and the reference disagree, the reference wins. Content (events, businesses, venue details) is in `reference/content/*.json`.

Venue facts: Sunset Village Music Hall, 4114 Judah St, San Francisco, CA 94122. Bookings: bookings@sunsetvillagesf.com. Capacity 150; stage 2550 sq ft (~75 × 30). Sunset Village is a building with several spaces; this site promotes the Music Hall and links out to the other businesses.

## Routes

| Route | Page | Reference |
|---|---|---|
| `/` | Home | `reference/site/index.html` |
| `/events` | Events calendar | `reference/site/events.html` |
| `/book` | Book the hall (request form) | `reference/site/book.html` |
| `/village` | The Village (building directory) | `reference/site/village.html` |

## Global chrome (every page)

### Header (`.theme-ink`)
1. **Ticker bar**: full-width yellow strip, centered, wraps on mobile. Montserrat 700 12px, 0.22em, caps, ink. Items: "Live music in the fog" ✦ "Outer Sunset, San Francisco" ✦ link "Get the fog report →" (underlined, to `/#newsletter`). ✦ = `Sparkle` 12px ink.
2. **Nav row**: container-site, 16px vertical padding, `flex-wrap justify-between items-center gap-4`.
   - Left: `Wordmark variant="on-dark"` at 76px tall (60px under 520px), linking home.
   - Right: nav pills Events / Book the hall / The Village (fog text, 16px semibold, `px-4 py-2.5 rounded-full`, hover `bg-fog/14`). The current page gets a 2px fog outline (`aria-current="page"`). Then a `sun` pill "Newsletter" → `/#newsletter`, 8px extra left margin.
   - On phones the nav wraps under the wordmark. No hamburger is needed at this link count.

### Footer (`.theme-ink`)
- container-site, 56px top / 32px bottom, `flex-wrap justify-between gap-8`.
- Left: `Wordmark on-dark` at 116px tall; under it "4114 Judah St · San Francisco, CA 94122" in mist.
- Right: links Events, Book the hall, The Village, Newsletter, Instagram ↗ (fog, semibold, underlined, hover yellow).
- Legal line: 1px `rule` top border, DM Mono 12px, 0.06em, mist: "© 2026 Sunset Village Music Hall · Outer Sunset, San Francisco".

### Page heroes (Events, Book)
`PageHero` component: ink band, eyebrow + `text-display-xl` H1 on the left (`flex-[999_1_480px]`), `text-lede` mist paragraph on the right (`flex-[1_1_320px]`), bottom-aligned, `pt-10 pb-16`, then `WaveDivider`. The accent word in the H1 is `text-sun`.

## Home `/`

1. **Photo hero** (`.theme-ink`, `relative overflow-hidden`)
   - Background: `assets/photos/hero-dancefloor.jpg`, `absolute inset-0 object-cover`, `object-position: 60% 45%`, class `photo-duotone`. Over it: `photo-tint` layer, then `hero-scrim` layer.
   - Content: container-site, `min-h-[640px] py-24 pb-32 flex items-center` (phones: no min-height, `py-16 pb-22`). Column `max-w-[640px] gap-7`:
     - Eyebrow (yellow): "Neighborhood venue · Outer Sunset"
     - H1 `text-display-xl` (clamp(52→104px), tracking -0.035em): "Sick sets. Thick **fog.** Good neighbors." ("fog." in sun)
     - Lede 20px mist: "Sunset Village Music Hall is a room for live bands, dance nights and community get-togethers out by Ocean Beach. Bring a hoodie."
     - Buttons: `sun lg` "See what's up →" (/events), `outline lg` "Book the hall" (/book).
   - `WaveDivider` at the bottom.
   - Use `next/image` with `priority` and `fill`; `alt="A foggy dance floor at Sunset Village Music Hall, with people dancing in silhouette"`.
2. **Coming up** (`py-18 pt-18 pb-12`): section head with Eyebrow "On the calendar" + `text-display-lg` "Coming up", right-aligned link "Full calendar →" (sea, 18px bold). Below, a vertical list (gap 14px) of the next 4 events as **event rows**:
   - Row: paper card, 2px ink border, radius 22, padding `16px 20px 16px 16px`, `flex-wrap items-center gap-x-7 gap-y-4`, hover lift -2px.
   - `TicketStub` (category fill) → main column (`flex-[999_1_280px]`: `kind` line, `text-heading-lg` title, 16px ink-2 subtitle) → meta column (`flex-[1_1_160px]`, DM Mono 14: time line, price line weight 500) → ink button (CTA label from data, "Get tickets"/"RSVP").
3. **Find us out west** (`pt-12 pb-18`): Eyebrow "Come say hi", H2 "Find us out west". Two-up grid `repeat(auto-fit,minmax(min(320px,100%),1fr))`, gap 20:
   - **Visit card** (paper, rounded-2xl, overflow hidden): map area 260px tall on `map` ground with 2px ink bottom border. The reference shows an illustrated street grid with a sun sparkle pin and an "[EMBEDDED MAP]" tag. **Replace with a real static map or embed** (Mapbox/Google static image styled to the palette if possible; the illustration is an acceptable fallback). Below it, a 3-column auto-fit grid (min 180px): Address (with "Get directions ↗" link to Google Maps), Getting here (placeholders), Doors & box office (placeholders).
   - **Contact card**: yellow fill, 2px ink border, rounded-2xl, `p-8`. H3 "Get in touch" (36px). `<dl>` with `label-sm` dt / 18px semibold dd: General, Phone, Instagram, Artists & promoters (bookings@sunsetvillagesf.com). Ink button "Want to rent the room? →" (/book) pinned to the bottom.
4. **Newsletter band** `id="newsletter"`: sun fill, 2px ink border, rounded-4xl, `px-10 py-14`. Two decorative sparkles top-right (44px full + 22px simple, ink; hidden under 520px). Left: plain eyebrow "Newsletter" (ink, no sparkle), H2 "Get the fog report." (clamp(44→80px)), 20px copy "New shows, presales and what's happening around the Village, straight to your inbox." Right: ink `xl` button "Sign up for the newsletter ↗" → newsletter provider URL (TBD).
5. **Village teaser**: 2px **dashed** ink border, rounded-2xl, `px-8 py-7`, `flex-wrap items-center justify-between gap-6`: `Wordmark on-light` at 72px, then H2 28px "Part of Sunset Village" + 18px ink-2 copy, then outline button "Meet the neighbors →" (/village). Bottom padding before footer 88px.

## Events `/events`

1. `PageHero`: eyebrow "The calendar", H1 "What's **up**", lede "Bands, DJs, theater and neighborhood nights. Tickets go fast when the fog rolls in."
2. **Filter bar** (`pt-10 pb-6`, `flex-wrap justify-between items-center`): shadcn `ToggleGroup` single-select with chips Everything / Live music / DJ nights / Community / Workshops; right side DM Mono 14 ink-2 count "10 events" (`aria-live="polite"`). Filtering hides cards and hides a month entirely when it has none. Optional: reflect the filter in `?type=` for shareable links.
3. **Month sections**: H2 `text-heading-xl` month name, followed by a 2px ink rule that fills the row, ending in a 20px ink `Sparkle`. Then a card grid `repeat(auto-fill,minmax(min(280px,100%),1fr))`, gap 20.
   - **Event card**: paper, 2px ink border, rounded-xl, overflow hidden, hover lift -3px.
   - Poster (4:3) on the category fill with a **2px dashed** ink bottom border. Top-left: day-of-week (`label-sm`) over a 96px 800-weight day number (tracking -0.05em, leading .85). Top-right: 40px ink sparkle. Decoration: a 12% ink circle bottom-right and two 35% ink wave lines across the bottom. An "[EVENT ART]" tag marks where real event art goes. **When an event has artwork, it fills the poster area (object-cover) and the date sits on a small ink-outlined stub in the corner instead.**
   - Body (`p-5 pt-4.5 gap-2`): `kind`, title 26px 800, subtitle ink-2 16px, `meta` "time · price", then actions pinned to the bottom: ink button (CTA) + outline "Details".
4. **CTA band**: yellow fill, rounded-3xl, `p-10`: H2 "Got a show in mind?" (clamp(32→48px)), copy "Bands, promoters, birthdays, fundraisers. The hall is up for grabs.", ink button "Request a date →" (/book).

## Book `/book`

1. `PageHero`: eyebrow "Book the hall", H1 "Your night. **Our room.**", lede "Shows, album releases, birthdays, fundraisers, workshops. Tell us what you're dreaming up and we'll get back to you with dates and a quote."
2. Two-column `flex-wrap gap-8 items-start` (`pt-12 pb-22`):
   - **Left** (`flex-[1_1_360px]`, stack gap 20):
     - "The room" card (paper, rounded-2xl, `p-7`): H2 30px; 2-col `<dl>` Capacity 150 · Stage 2550 sq feet (~75 x 30) · Sound [placeholder] · Extras [placeholder]; tag row (Shows, Private parties, Fundraisers, Workshops, Rehearsals, Community meetings on yellow/teal/pink fills, cycling); 16:9 photo placeholder (map ground, 2px ink border, rounded-lg).
     - "How it works" (`.theme-ink`, rounded-2xl, `p-7`, yellow 28px sparkle top-right): ordered list with 40px numbered circles (sun, yellow, teal fills, ink numerals): 1 "Send the request. Rough dates are fine." 2 "We reply within [X business days] with availability and a quote." 3 "Lock it in with a [deposit] and we'll plan the night together."
   - **Right** (`flex-[1.4_1_480px]`): paper card rounded-2xl `p-8` containing the form.
3. **Form** (react-hook-form + zod suggested): H2 "Request a date" 34px + "Fields marked * are required." Fields in auto-fit grids (min 220px):
   - Row 1: Your name* · Band, org or company · Email* · Phone
   - Row 2: What kind of event?* (Select: Concert or show, DJ or dance night, Theater or performance, Private party, Fundraiser or benefit, Workshop or class, Rehearsal, Community meeting, Something else) · Expected guests* (number, 1–150, placeholder "Up to 150") · Preferred date* · Backup date
   - "What will you need?" checkbox rows (auto-fit min 200): Sound engineer, Lighting, Bar service, Backline / drums, Ticketing, Chairs & tables
   - Tell us about it* (textarea, 5 rows, placeholder "The vibe, the lineup, the timing, anything we should know.")
   - Footer row: "Or email bookings@sunsetvillagesf.com" (15px ink-2, link) and `sun lg` submit "Send request →".
   - **Submission**: POST to a server action / route handler that emails bookings@sunsetvillagesf.com (e.g. Resend) or stores the request. Disable the button while sending. On error show the danger alert: "Something went wrong sending your request. Please try again, or email bookings@sunsetvillagesf.com."
   - **Success state** replaces the form in the same card (`role="status"`): 72px sun sparkle, H2 "Request sent. Nice." (44px), copy "We'll be in touch within [X business days]. Keep an eye on your inbox, and maybe the fog forecast.", ink button "See upcoming shows" + outline "Send another" (resets). See `reference/screenshots/book--sent-state--desktop-1440.png`.

## The Village `/village`

1. **Hero** (`.theme-ink`, 2-col auto-fit min 340, gap 48, `pt-10 pb-16`): eyebrow "The Village", H1 "One building. **Good neighbors.**" (clamp(48→96px)), lede "Sunset Village is a building on Judah St with a handful of spaces under one roof: the music hall plus local businesses worth a detour. Make a night of it." Right: the building illustration (inline SVG from `reference/site/village.html`) with `wordmark-on-light.svg` positioned on its sign (centered, top 18.9%, height 16%). Then `WaveDivider`.
2. **Who's here** (`pt-14 pb-10`): Eyebrow "Building directory", H2 "Who's here", right side DM Mono "4114 Judah St · San Francisco". Grid `repeat(auto-fill,minmax(min(300px,100%),1fr))` gap 20, driven by `spaces.json`:
   - **Space card**: paper, rounded-xl, 2px ink. Photo area 16:10 (solid ink bottom border) on the space's fill; real storefront photos go here (object-cover). Body: `kind` "TYPE · UNIT", `text-heading-lg` name, ink-2 blurb, `meta` hours, actions: ink "Visit website ↗" (external, `target=_blank rel=noopener`) + outline "Instagram ↗".
   - The Music Hall card: fog photo area with `Wordmark on-light` at 72% width, and an ink "You are here" badge (yellow `label-sm` + simple sparkle) top-left; its primary action is "See events" → /events.
   - **Always end with the "Coming soon" card**: 2px dashed ink, rounded-xl, min-h 320, 32px ink sparkle, `kind` "UNIT [#] · COMING SOON", title "Something new is moving in", copy "Watch this space. We'll announce new neighbors in the fog report.", link "Get the newsletter →".
   - Must scale to more businesses with no layout changes.
3. **Leasing band**: teal fill, rounded-3xl, `p-10`: H2 "Want to set up shop here?", copy "We're looking for local, independent businesses to fill the Village. Let's talk.", ink pill showing the leasing email (selectable text, or `mailto:`).

## Responsive behavior

Breakpoints are content-driven (flex-wrap and auto-fit grids), not fixed. Check at 1440, 1024, 768 and 390. Specific rules:
- Under 760px the hero scrim becomes a flat 80% ink and the hero drops its min height.
- Under 520px: wordmark 60px, bands pad `px-6 py-8`, buttons may wrap text, newsletter sparkles hide.
- No horizontal scrolling at 390px (tested in the reference).

## SEO and metadata

Per-page `<title>` and description as in the reference `<head>`s. Use `assets/photos/og-image-1200x630.jpg` (pre-tinted) for Open Graph. Favicon `assets/brand/favicon.svg`. Add JSON-LD `MusicVenue` with the address, and `Event` entries on /events once data is real.

## Placeholders still open

Anything in `[brackets]`: general email, phone, Instagram handle, leasing email, box office hours, transit/parking notes, sound/extras specs, reply time, deposit, unit numbers, neighbor business details, newsletter URL, ticketing URLs, real event data and art, a photo of the room set up for an event. Keep them visibly bracketed until supplied. Do not invent values.

## Acceptance

- Side-by-side with `reference/screenshots/*` at 1440 and 390 (2×), each page matches in layout, type, color and spacing.
- No raw hex values or arbitrary colors in components; everything comes from `globals.css` tokens.
- Event filter, form validation, success and error states work by keyboard. Focus rings are visible.
- Lighthouse accessibility ≥ 95.
