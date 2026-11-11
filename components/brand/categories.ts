// Event categories → fill color. Text on these fills is always ink.
import type { EventCategory } from '@/lib/data/events'
export type { EventCategory }

export const CATEGORIES: EventCategory[] = ['music', 'dj', 'community', 'workshop']

export const categoryLabel: Record<EventCategory, string> = {
  music: 'Live music',
  dj: 'DJ nights',
  community: 'Community',
  workshop: 'Workshops',
}

export const categoryFill: Record<EventCategory, string> = {
  music: 'bg-sun',
  dj: 'bg-yellow',
  community: 'bg-teal',
  workshop: 'bg-pink',
}

/** Palette fills for spaces and tag rows. */
export const fillClass = {
  fog: 'bg-fog',
  sun: 'bg-sun',
  yellow: 'bg-yellow',
  teal: 'bg-teal',
  pink: 'bg-pink',
} as const
export type Fill = keyof typeof fillClass
