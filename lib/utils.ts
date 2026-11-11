import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge the design system's custom font sizes, so
// `text-display-xl` and `text-ink` are not treated as conflicting classes.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['row'],
      text: ['display-xl', 'display-hero', 'display-split', 'display-band', 'display-md', 'display-lg', 'heading-2xl', 'heading-xl', 'heading-form', 'heading-panel', 'heading-card', 'heading-lg', 'heading-md', 'lede', 'body', 'ui', 'label', 'label-sm', 'meta'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
