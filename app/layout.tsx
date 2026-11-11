import type { Metadata, Viewport } from 'next'
import { fontVariables } from '@/lib/fonts'
import { site } from '@/lib/data/site'
import tokens from '@/lib/tokens.json'
import './globals.css'

const description =
  'A neighborhood venue for live bands, dance nights and community get-togethers at 4114 Judah St in San Francisco’s Outer Sunset.'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Sunset Village Music Hall · Live music in the Outer Sunset',
    template: '%s · Sunset Village Music Hall',
  },
  description,
  openGraph: {
    siteName: site.name,
    description,
    images: [{ url: '/photos/og-image-1200x630.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
}

export const viewport: Viewport = { themeColor: tokens.color.ink.value }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
