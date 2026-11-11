import * as React from 'react'
import { cn } from '@/lib/utils'

// Marketing forms: 2px ink outline, 50px tall, 17px text.
// Internal UI: pass density="compact" for a 1px line border and 15px text.
export const fieldStyles = {
  base: 'w-full min-w-0 rounded-md bg-field text-ink placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-text',
  default: 'min-h-12.5 border-2 border-input px-3.5 py-3 text-body',
  compact: 'min-h-10 border border-line px-3 py-2 text-ui focus-visible:border-ink',
}

function Input({
  className,
  type,
  density = 'default',
  ...props
}: React.ComponentProps<'input'> & { density?: 'default' | 'compact' }) {
  return <input type={type} data-slot="input" className={cn(fieldStyles.base, fieldStyles[density], className)} {...props} />
}

export { Input }
