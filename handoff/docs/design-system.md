# Sunset Village design system

A small system for the public site and any internal pages (admin, booking inbox, door list). It sits on Tailwind CSS v4 and shadcn/ui. The code lives in `design-system/`; this document explains how to use it.

**Character:** modern, with a dash of mid-century. Chunky grotesque headlines, fog-paper grounds, deep cypress ink, sunset accents. The retro touches are small and specific: the wordmark, its four-point star, tracked caps labels, ticket-stub dates. Do not add more retro devices (script fonts, starbursts, halftones, gradients). The client explicitly rejected the gradient wordmark as cheesy.

## Files

| File | What it is |
|---|---|
| `design-system/globals.css` | Tailwind v4 `@theme` tokens, shadcn CSS variables, the `.theme-ink` scope, base styles and signature utilities. Use it as `app/globals.css`. |
| `design-system/fonts.ts` | `next/font` setup for the three families. |
| `design-system/tokens.json` | The same tokens as data, for email, OG images and other non-Tailwind code. |
| `design-system/components/ui/button.tsx` | shadcn Button restyled (pill, 2px border, `sun` variant). |
| `design-system/components/brand/*` | `Sparkle`, `Eyebrow`, `WaveDivider`, `TicketStub`, `Wordmark`, `PageHero`, event `categories`. |
| `design-system/preview.html` | Open in a browser: a one-page visual reference of every token and pattern, including an internal-UI example. |

## Color

Two grounds, one ink, a few sunset fills.

| Token | Hex | Use |
|---|---|---|
| `ink` | #18302E | Text, dark bands (header, heroes, footer), 2px outlines, default buttons |
| `ink-2` | #4A5856 | Secondary text on fog/paper (6.2:1) |
| `fog` | #EEEAE2 | Page background; text on ink (11.7:1) |
| `paper` | #F8F6F1 | Cards |
| `sand` | #E2DDD3 | Muted fills, hover fills (shadcn `secondary`/`muted`/`accent`) |
| `line` | #C9C2B4 | Subtle 1px borders in dense UI (shadcn `border`). Decorative only, 1.5:1 |
| `mist` | #C9D3CF | Secondary text on ink (9.1:1) |
| `sun` | #FF6A3D | The CTA fill, always with ink text (4.9:1). Accent word in display headlines on ink |
| `yellow` | #FFC93C | Ticker bar, highlight panels, eyebrows on ink, focus ring |
| `teal` | #8FD3CB | Panel/category fill |
| `pink` | #F6B3BF | Panel/category fill |
| `sea` | #0E5E66 | Links on light grounds (6.2:1); hero photo tint |
| `map` | #DCE7E3 | Placeholder ground for maps/photos |

Rules:

- Sun, yellow, teal and pink are **fills with ink text**. Never set body text in them on fog. Sun is allowed as text only for large display words on ink.
- One `sun` button per view. Everything else is ink or outline.
- Event categories map to fills: music → sun, DJ → yellow, community → teal, workshop → pink (`categories.ts`).
- No gradients except the hero photo scrim. No drop shadows anywhere.

## Type

| Role | Family | Tailwind |
|---|---|---|
| Display + headings + body | Bricolage Grotesque (800 headings, 400 body) | `font-display` (default) |
| Tracked caps labels | Montserrat 700 | `eyebrow`, `label-sm` utilities |
| Dates, times, prices, meta | DM Mono 400/500 | `font-mono`, `meta`, `kind` utilities |

Scale (Tailwind classes generated from `@theme`):

| Class | Size / leading / tracking | Use |
|---|---|---|
| `text-display-xl` | clamp(48→104px) / .9 / -0.04em, 800 | Page H1s |
| `text-display-lg` | clamp(38→64px) / .95 / -0.03em, 800 | Section H2s ("Coming up") |
| `text-heading-xl` | 36 / 1 / -0.02em, 800 | Month headers, panel titles |
| `text-heading-lg` | 28 / 1.05 / -0.02em, 800 | Card titles |
| `text-heading-md` | 20 / 1.2, 800 | Small titles (Address, Getting here) |
| `text-lede` | 19 / 1.5 | Intro paragraphs |
| `text-body` | 17 / 1.5 | Default body |
| `text-ui` | 15 / 1.45 | Internal/dense UI body |
| `eyebrow` | Montserrat 13, 0.24em, caps | Section kickers (with a `Sparkle`) |
| `label-sm` | Montserrat 11, 0.22em, caps | `<dt>` labels, stub labels, badges |
| `kind` | DM Mono 12, 0.12em, caps, ink-2 | "LIVE MUSIC · INDIE ROCK" lines |
| `meta` | DM Mono 13 / 1.6 | Times · prices |

Montserrat is only ever uppercase and tracked. Never set a heading in it.

## Space and layout

- 4px base grid (Tailwind default spacing).
- Content width 1280px with 24px gutters: `container-site`.
- Section rhythm: 72px top/bottom by default (`py-18`), 88px before the footer (`pb-22`), 48px between related sections (`py-12`).
- Section head to content: 28px (`gap-7`). Card grids: 20px (`gap-5`). Row lists: 14px (`gap-3.5`).
- Grids are fluid: `grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]` for event cards, 300px for business cards. Rows use `flex-wrap` with growing children instead of breakpoints.
- Everything must work at 390px wide with no horizontal scroll.

## Shape, borders, depth

- Radius: inputs 14 (`rounded-md`), small panels 18 (`rounded-lg`), cards 24 (`rounded-xl`), large cards 28 (`rounded-2xl`), bands 32 (`rounded-3xl`), newsletter band 36 (`rounded-4xl`). Buttons, chips, badges and nav items are `rounded-full`.
- **The 2px ink outline is the signature.** Marketing cards, inputs, chips, checkboxes and buttons use `border-2 border-ink`. Dashed 2px ink marks placeholders, "coming soon" and the poster/body divider on event cards.
- Internal and dense UI may drop to 1px `border-border` (line) to reduce noise, but keep the paper-on-fog card and pill buttons.
- No shadows. Interactive cards lift: rows -2px, cards -3px on hover (`lift`).

## Ornaments (use sparingly)

- **Sparkle:** the four-point star from the wordmark. Before eyebrows (16px), between ticker items (12px), at the end of month rules (20px), as the map pin, in the "How it works" panel corner, and as the success icon. At most one decorative sparkle per card.
- **Wave divider:** the bottom edge of every ink hero band. Only there.
- **Ticket stub:** notched date block on the Home "Coming up" rows.
- **Hero photo treatment:** grayscale + 60% sea tint (`photo-duotone` + `photo-tint`) under a left-weighted ink scrim (`hero-scrim`). Any future photography on ink bands gets the same treatment so it never fights the palette.

## Components (shadcn mapping)

Install with `npx shadcn add <name>`, then restyle as below. Keep to these; don't import other UI kits.

| Need | shadcn | Styling |
|---|---|---|
| Buttons | `button` | Use the provided `button.tsx`. Variants: `default` (ink), `sun` (CTA), `outline`, `ghost`, `link`, `destructive`. Sizes `sm`, `default` (44px), `lg`, `xl`. Links styled as buttons use `asChild`. |
| Event filter chips | `toggle-group` (type="single") | Items: `rounded-full border-2 border-ink px-5 min-h-11 font-bold`, pressed: `data-[state=on]:bg-ink data-[state=on]:text-fog`. |
| Text inputs, select, textarea | `input`, `select`, `textarea`, `label` | `border-2 border-ink rounded-md bg-white px-3.5 min-h-12 text-[17px]`. Labels 15px bold. |
| Checkbox rows | `checkbox` + `label` | Whole row is the label: `border-2 border-ink rounded-md bg-white min-h-12 px-3.5 gap-2.5`. Checkbox fill ink. |
| Cards | `card` | `bg-card border-2 border-ink rounded-xl` (marketing) or `border` (internal). Remove shadcn's shadow. |
| Tags / categories | `badge` | `rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold` on a category fill. |
| Alerts / form errors | `alert` | Danger: `bg-danger text-danger-text border-2 border-danger-text rounded-md`. |
| Dialogs, sheets, popovers | `dialog`, `sheet`, `popover` | `bg-paper border-2 border-ink rounded-2xl`, scrim `bg-ink/60`. |
| Mobile nav (if needed) | `sheet` | Side sheet with `.theme-ink`. |
| Tables (internal) | `table` | Header row `label-sm text-ink-2`, 1px `border-border` rows, mono for dates and money. |

## Ink bands

Wrap any dark section in `.theme-ink`. It re-points the shadcn variables, so shadcn components inside (Button, Input) invert correctly without per-component overrides.

## Internal pages

Use the same tokens with a quieter treatment:

- Fog page, paper cards, 1px `line` borders, `rounded-xl`.
- No ticker, no wave, no hero. A slim ink top bar with the `on-dark` wordmark at 40px is enough.
- Body `text-ui` (15px). Page titles `text-heading-xl`, section titles `text-heading-md`. Labels `label-sm`.
- Buttons `size="sm"`; `default` variant for primary actions, `sun` only for the single most important action (for example "Confirm booking").
- Status: fills `success`/`warning`/`danger` with ink text for pills; `*-text` shades for colored text on paper.
- Charts: `chart-1…5` (sun, sea, yellow, teal, pink).

See the "Internal UI" section of `design-system/preview.html`.

## Accessibility

- Focus: 3px yellow outline, 3px offset, on every interactive element.
- Touch targets ≥ 44px (buttons `default` size and up, chips `min-h-11`).
- Real `<button>`, `<a href>`, `<label for>` everywhere; filter chips expose `aria-pressed` / `data-state`.
- Honor `prefers-reduced-motion` (no lift, no press scale).
- Checked contrast pairs: ink/fog 11.7, ink-2/fog 6.2, sea/fog 6.2, ink/sun 4.9, yellow/ink 9.1, mist/ink 9.1, ink/teal 8.2, ink/pink 8.1.
