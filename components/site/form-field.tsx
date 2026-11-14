import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Public-form field: label, control, inline error (the control points at `${id}-error`). */
export function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-ui font-semibold text-danger-text">
          {error}
        </p>
      )}
    </div>
  )
}

/** Fields that sit side by side when there's room. */
export const fieldGrid = 'grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4'
