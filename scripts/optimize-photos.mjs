// Optimize photos from "Photo Assets/" → public/photos/*.webp
//
// - auto-rotates by EXIF (iPhone shots arrive sideways otherwise)
// - resizes to max 2400px wide
// - strips metadata (GPS etc.) — originals have location data baked in
// - names: mapped below when known, otherwise a slug of the filename
//
// Run after adding new photos:  npm run optimize:photos

import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = path.resolve('Photo Assets')
const OUT = path.resolve('public/photos')

// Stable, meaningful names for photos referenced in src/. New drops fall back
// to slugged filenames — reference those directly or add a mapping here.
const NAMES = {
  'IMG_1027.jpeg': 'hero-judah-sunset',
  'IMG_4751.jpeg': 'judah-dusk',
  'IMG_0465 2.jpeg': 'judah-night',
  'IMG_6048.jpeg': 'ocean-beach-sunset',
  '4114-Judah-St-scaled_jan2026_predevelopment.webp': 'building-today',
  'historicsunsetvillage.jpg': 'historic-1950s',
  'IMG_9970.jpg': 'flyer-olas-pena-aug-7',
  'Screenshot 2026-09-03 at 7.40.21 PM.png': 'flyer-sunset-is-dead',
}

const slug = (name) =>
  name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

await mkdir(OUT, { recursive: true })
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))

for (const file of files) {
  // macOS screenshot names carry a narrow no-break space before AM/PM.
  const key = file.replace(/ /g, ' ')
  const out = path.join(OUT, `${NAMES[key] ?? slug(file)}.webp`)
  const img = sharp(path.join(SRC, file)).rotate() // apply EXIF orientation
  const meta = await img.metadata()
  await img
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out)
  console.log(`${file} (${meta.width}x${meta.height}) → ${path.relative('.', out)}`)
}
console.log(`\n${files.length} photos optimized → public/photos/`)
