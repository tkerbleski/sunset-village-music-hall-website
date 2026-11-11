# Sunset Village Music Hall: instructions for Claude Code

Copy this file to the root of the new repo (merge it with any existing CLAUDE.md). Keep the `handoff/` folder in the repo, or move its contents to the paths below.

## Goal
Build the Sunset Village Music Hall website so it matches the approved V2 design exactly, on a codebase that new pages (including internal ones) can extend with the same look.

## Stack
- Next.js (App Router, TypeScript), Tailwind CSS v4, shadcn/ui (new-york style, CSS variables), `lucide-react` for any UI icons.
- Fonts via `next/font/google` (`design-system/fonts.ts`). No other font sources.
- Deploy target: Vercel.

## Setup order
1. `npx create-next-app@latest` (TS, App Router, Tailwind) → `npx shadcn@latest init`.
2. Replace `app/globals.css` with `handoff/design-system/globals.css`. Put `fonts.ts` in `lib/` and apply `fontVariables` to `<html>`.
3. `npx shadcn@latest add button toggle-group input select textarea checkbox label card badge alert`, then replace `components/ui/button.tsx` with the one in `handoff/design-system/components/ui/`. Restyle the other primitives as described in `handoff/docs/design-system.md` → Components.
4. Copy `handoff/design-system/components/brand/` to `components/brand/`.
5. Copy `handoff/assets/brand/*.svg` and `favicon.svg` to `public/brand/` (favicon to `app/icon.svg`), and `handoff/assets/photos/` to `public/photos/`.
6. Build the pages from `handoff/docs/design-spec.md`, with content from `handoff/reference/content/*.json`.

## Sources of truth (in order)
1. `handoff/reference/site/` — a working static HTML/CSS build of the approved design. Open it with any static server (`npx serve handoff/reference/site`). Read its `assets/styles.css` for exact values.
2. `handoff/reference/screenshots/` — 1440px desktop and 390px (2×) mobile captures of every page, plus filter and form-success states.
3. `handoff/docs/design-spec.md` — section-by-section spec and behavior.
4. `handoff/docs/design-system.md` + `handoff/design-system/` — tokens, utilities and component rules.

## Rules
- **Never type a raw hex, px font size or arbitrary color in a component.** Use the tokens (`bg-ink`, `text-sun`, `text-display-xl`, `eyebrow`, `rounded-xl` …). If a value is missing, add it to `globals.css` `@theme` first.
- Use shadcn primitives restyled to the system. Do not add other component libraries.
- Dark sections use `.theme-ink`, not `.dark`.
- The wordmark is only ever one of `public/brand/wordmark-on-dark.svg`, `wordmark-on-light.svg` or `wordmark-mono.svg` via the `Wordmark` component. Never use `source-wordmark-gradient-DO-NOT-USE.png`.
- Keep the mid-century touches limited to what is specified (wordmark, sparkle, eyebrow labels, ticket stubs). Don't add new ornaments.
- Keep `[bracketed]` placeholders visible; don't invent venue details.
- Events, businesses and venue details come from data (start with the JSON files; a CMS can come later), not hard-coded JSX.

## Verify before calling a page done
- Run the dev server and capture each page at 1440×900 and 390×844 (deviceScaleFactor 2) with Playwright. Compare against the matching file in `handoff/reference/screenshots/`. Fix differences in spacing, type size/weight, color, border and radius.
- No horizontal scroll at 390px. Keyboard-test the event filter and the booking form (including error and success states).
