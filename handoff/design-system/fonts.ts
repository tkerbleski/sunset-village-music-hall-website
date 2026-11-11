// Sunset Village Music Hall — font loading (Next.js App Router).
// In app/layout.tsx: <html lang="en" className={fontVariables}> …
import { Bricolage_Grotesque, DM_Mono, Montserrat } from "next/font/google";

// Headings + body. Variable font; the optical-size axis gives the tight, chunky display cut.
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

// Tracked uppercase labels only (eyebrows, dt, date stubs). Never for headings or body.
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

// Dates, times, prices, event "kind" lines, captions on placeholders.
export const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const fontVariables = `${bricolage.variable} ${montserrat.variable} ${dmMono.variable}`;
