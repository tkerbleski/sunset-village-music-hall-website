// Capture pages at the handoff's reference sizes for side-by-side checks
// against handoff/reference/screenshots/. Run the dev server first.
//
//   node scripts/screenshots.mjs [baseUrl] [page ...]
//   e.g. node scripts/screenshots.mjs http://localhost:3000 / /events
//
// Writes tests/screenshots/<name>--desktop-1440.png and --mobile-390.png
// (tests/ is git-ignored) and reports any horizontal overflow at 390px.

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const [base = 'http://localhost:3000', ...pages] = process.argv.slice(2)
const paths = pages.length ? pages : ['/', '/events', '/book', '/village']
const out = 'tests/screenshots'
mkdirSync(out, { recursive: true })

const sizes = [
  { tag: 'desktop-1440', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { tag: 'mobile-390', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
]

const browser = await chromium.launch()
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: s.viewport, deviceScaleFactor: s.deviceScaleFactor })
  const page = await ctx.newPage()
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    // Scroll through so lazy images load before the full-page capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 40))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForLoadState('networkidle')
    const name = p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '_')
    await page.screenshot({ path: `${out}/${name}--${s.tag}.png`, fullPage: true })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    console.log(`${name} ${s.tag}${overflow > 0 ? `  ⚠ horizontal overflow ${overflow}px` : ''}`)
  }
  await ctx.close()
}
await browser.close()
