# Sunset Village Music Hall

Next.js (App Router, TypeScript) + Tailwind CSS v4 + shadcn/ui (new-york, CSS variables), deployed on Vercel. Content lives in Neon Postgres and is edited at `/admin`.

The approved V2 design is in `handoff/` (Claude Design handoff). Treat it as the visual source of truth:
1. `handoff/reference/site/` — static HTML/CSS build of the design (`npx serve handoff/reference/site`); its `assets/styles.css` has exact values.
2. `handoff/reference/screenshots/` — every page at 1440 and 390 (2×).
3. `handoff/docs/design-spec.md` — page-by-page spec. `handoff/docs/design-system.md` — tokens, components, internal-page rules.

Deliberate differences from the handoff: content comes from the database, not the sample JSON; the newsletter signup is built in (subscribers table), not an external link; event pages with Stripe tickets and the admin are kept; capacity shows `[capacity]` until confirmed.

## Layout

```
app/
  globals.css          Design tokens (@theme), shadcn variables, .theme-ink, signature utilities
  (site)/              Public pages with header + footer: /, /events, /events/[id], /book, /village
  admin/               Internal pages (client components behind the sign-in gate)
  api/*/route.ts       Thin wrappers: route(handler) from lib/server/adapter.ts
components/
  ui/                  shadcn primitives, restyled to the system (don't add other UI kits)
  brand/               Wordmark, Sparkle, Eyebrow, WaveDivider, TicketStub, PageHero, categories
  layout/section.tsx   Section, SectionHead, MoreLink, Band, Facts (public-page building blocks)
  site/ events/ book/ village/   Page-specific pieces
  internal/            Internal-page kit (InternalTopBar, InternalMain, PageHeader, Panel, Stat, FormField…) + AdminShell
lib/
  data/                site.ts (venue facts; edit here), seed events/tenants, dev sample events
  server/              Neon, auth, Stripe, Resend, content loader, API handlers (server-only)
  admin/               Admin API client + hooks
  events.ts            Date/CTA helpers; tokens.json mirrors the tokens for email
```

## Rules
- **Never type a raw hex, px font size or arbitrary color in a component.** Use tokens (`bg-ink`, `text-sun`, `text-display-xl`, `text-heading-md`, `eyebrow`, `label-sm`, `meta`, `kind`, `rounded-xl` …). If a value is missing, add it to `@theme` in `app/globals.css` first (and to the `text`/`radius` lists in `lib/utils.ts` so `cn()` merges it correctly).
- Use shadcn primitives from `components/ui/`. Inputs/textarea take `density="compact"` in internal UI; selects take `<SelectTrigger size="sm">`.
- Dark sections use `.theme-ink`, not `.dark`. One `sun` button per view; everything else ink or outline.
- The wordmark only via `<Wordmark variant="on-dark|on-light|mono">`. Never use `handoff/assets/brand/source-wordmark-gradient-DO-NOT-USE.png`.
- Mid-century touches only where specified (wordmark, sparkle, eyebrows, ticket stubs, wave under ink heroes). No new ornaments, gradients or shadows.
- Keep `[bracketed]` placeholders visible (they live in `lib/data/site.ts`); don't invent venue details.
- Events, spaces and venue facts come from data, not hard-coded JSX.

## New pages
- Public: put it in `app/(site)/<route>/page.tsx`. Start with `<PageHero eyebrow title lede />`, then `<Section>` blocks (`pt-18 pb-12` rhythm, `pb-22` before the footer) with `<SectionHead>`; cards are `rounded-xl border-2 border-ink bg-card`; CTA strips are `<Band tone="yellow|teal|pink">`.
- Internal: put it under `app/admin/<route>/page.tsx` (add a tab in `components/internal/admin-shell.tsx`), or for a standalone tool use `<InternalTopBar>` + `<InternalMain>`. Use `PageHeader`, `Panel`, `Stat`, `FormField`, `StatusPill`, the shadcn `table`, `size="sm"` buttons, `text-ui` body.

## Commands
```bash
npm run dev                      # localhost:3000 (seed data when DATABASE_URL is unset)
SAMPLE_CONTENT=1 npm run dev     # handoff sample calendar, for design review
npm run build
npm run lint                     # tsc --noEmit
node scripts/screenshots.mjs http://localhost:3000   # 1440 + 390@2x captures → tests/screenshots/
DATABASE_URL=… npm run db:setup  # create/migrate tables (safe to re-run)
```

## Verify before calling a page done
Capture it at 1440×900 and 390×844 (2×) with `scripts/screenshots.mjs` and compare with `handoff/reference/screenshots/`. No horizontal scroll at 390px (the script warns). Keyboard-test interactive pieces (event filter, booking form errors/success).
