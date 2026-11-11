// Layout primitives for any page, public or internal. Spacing follows the
// design system: 72px section rhythm, 28px head-to-content, 1280px container.
import { cn } from '@/lib/utils'
import { Eyebrow } from '@/components/brand/eyebrow'

/** A page section inside the site container. */
export function Section({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('container-site', className)} {...props} />
}

/** Eyebrow + display H2 on the left, an optional action (link/button) on the right. */
export function SectionHead({
  eyebrow,
  title,
  action,
  className,
  as: H = 'h2',
}: {
  eyebrow?: string
  title: React.ReactNode
  action?: React.ReactNode
  className?: string
  as?: 'h1' | 'h2'
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <H className="text-display-lg">{title}</H>
      </div>
      {action}
    </div>
  )
}

/** Small arrow link used for "Full calendar →" style section actions. */
export function MoreLink({ className, ...props }: React.ComponentProps<'a'>) {
  return <a className={cn('text-lg font-bold', className)} {...props} />
}

/** Rounded color band (CTA strips). `tone` is a palette fill; text is always ink. */
export function Band({
  tone = 'yellow',
  className,
  ...props
}: React.ComponentProps<'div'> & { tone?: 'yellow' | 'teal' | 'pink' | 'sun' }) {
  const fill = { yellow: 'bg-yellow', teal: 'bg-teal', pink: 'bg-pink', sun: 'bg-sun' }[tone]
  return (
    <div
      className={cn(
        'relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-3xl border-2 border-ink p-10 text-ink max-[520px]:px-6 max-[520px]:py-8',
        fill,
        className,
      )}
      {...props}
    />
  )
}

/** Labelled facts: `label-sm` term over a bold value. */
export function Facts({ items, className }: { items: [string, React.ReactNode][]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-2 gap-x-5 gap-y-4', className)}>
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="label-sm text-ink-2">{k}</dt>
          <dd className="mt-1 text-lg leading-snug font-bold">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
