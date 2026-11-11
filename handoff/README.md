# Sunset Village Music Hall: design handoff (V2)

Everything needed to build the approved V2 design with Next.js, Tailwind CSS v4 and shadcn/ui, plus a small design system for future pages.

**Start here:** put this folder in the new repo as `handoff/`, copy `CLAUDE.md` to the repo root, and ask Claude Code to "build the site per CLAUDE.md".

```
CLAUDE.md                  Instructions for Claude Code: stack, setup order, rules, how to verify
docs/
  design-spec.md           Page-by-page build spec (layout, copy, behavior, responsive, placeholders)
  design-system.md         How to use the design system: color, type, spacing, shape, components, internal pages
design-system/
  globals.css              Tailwind v4 @theme tokens + shadcn variables + .theme-ink + signature utilities
  fonts.ts                 next/font setup (Bricolage Grotesque, Montserrat, DM Mono)
  tokens.json              Same tokens as data (email, OG images, other tools)
  preview.html             Visual reference sheet for the system, incl. an internal-UI example
  components/ui/button.tsx Restyled shadcn Button
  components/brand/        Sparkle, Eyebrow, WaveDivider, TicketStub, Wordmark, PageHero, categories
assets/
  brand/                   Wordmark SVGs (on-dark, on-light, mono) + PNG fallbacks, favicon, original source (do not use)
  photos/                  Hero photo: web (2000px), original (4080px), pre-tinted duotone, OG image 1200×630
  ornaments/               sparkle.svg, sparkle-simple.svg, wave-divider.svg (all currentColor)
reference/
  site/                    Working static HTML/CSS build of the V2 design: the pixel reference
  screenshots/             Every page at 1440 desktop and 390 mobile, plus filter and form-success states
  content/                 events.json (sample), spaces.json, site.json (venue facts + placeholders)
```

## Notes

- **Wordmark:** the gradient original was recolored to two solid versions and vectorized. Check the SVGs against the original at large sizes before printing; for print or signage, get the designer's vector master recolored the same way.
- **Hero photo treatment** is done in CSS (grayscale + sea tint + scrim), so swapping the photo keeps the look. `hero-dancefloor-duotone.jpg` is pre-baked for places CSS can't reach (social, email).
- **Booking form** needs a backend: a route handler or server action that emails bookings@sunsetvillagesf.com (for example with Resend).
- **Sample data:** events are layout samples. Replace them before launch, along with every `[bracketed]` placeholder (listed at the end of `docs/design-spec.md`).
