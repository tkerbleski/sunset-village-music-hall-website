import { Sparkle } from '@/components/brand/sparkle'

/** Month name + 2px ink rule filling the row + sparkle. */
export function MonthHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-4 text-heading-xl">
      {children}
      <span className="h-0.5 flex-1 bg-ink" aria-hidden="true" />
      <Sparkle size={20} />
    </h2>
  )
}
