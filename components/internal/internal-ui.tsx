// Building blocks for internal pages (admin, door list, booking inbox…).
// Same tokens as the public site, quieter treatment: fog page, paper cards
// with 1px line borders, 15px body, small pill buttons. See
// docs/design-system.md → "Internal pages".
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Wordmark } from '@/components/brand/wordmark'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

/** Slim ink top bar with the wordmark. `children` go on the right. */
export function InternalTopBar({ title, href = '/', children }: { title: string; href?: string; children?: React.ReactNode }) {
  return (
    <div className="theme-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link href={href} className="flex items-center gap-3 no-underline">
          <Wordmark variant="on-dark" height={40} />
          <span className="label-sm text-yellow">{title}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ui text-mist">{children}</div>
      </div>
    </div>
  )
}

/** Main content column for internal pages. */
export function InternalMain({ className, ...props }: React.ComponentProps<'main'>) {
  return <main className={cn('mx-auto max-w-6xl px-4 pt-8 pb-24 text-ui sm:px-6', className)} {...props} />
}

/** Page title + one-line description, with optional actions on the right. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-heading-xl">{title}</h1>
        {description && <p className="mt-1.5 text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** Paper card with a 1px line border. Optional title row with an action. */
export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-5', className)}>
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          {title && <h2 className="text-heading-md">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/** A number with a label, optionally linking somewhere. */
export function Stat({ label, value, href }: { label: string; value: React.ReactNode; href?: string }) {
  const body = (
    <>
      <div className="text-heading-lg">{value}</div>
      <div className="label-sm mt-1.5 text-ink-2">{label}</div>
    </>
  )
  const cls = 'block rounded-xl border border-border bg-card p-4 text-ink no-underline'
  return href ? (
    <Link href={href} className={cn(cls, 'transition-colors hover:border-ink')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

/** Label + control + hint/error. Wrap any Input/Select/Textarea. */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-meta text-ink-2">{hint}</p>}
      {error && <p className="text-meta font-semibold text-danger-text">{error}</p>}
    </div>
  )
}

/** Inline error from a failed load or save. Renders nothing when empty. */
export function ErrorNote({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <Alert variant="destructive" className="mb-4">{children}</Alert>
}

/** Quiet message for empty lists. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-5 py-6 text-center text-ink-2">{children}</p>
}

/** Mono text for dates and money in tables and lists. */
export function Mono({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('font-mono text-meta', className)} {...props} />
}
