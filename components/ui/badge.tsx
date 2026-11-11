import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Pill tags. Fills always take ink text. `tone` maps to the palette and to
// internal status colors.
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border-2 border-ink font-semibold whitespace-nowrap text-ink [&>svg]:size-3',
  {
    variants: {
      tone: {
        plain: 'bg-transparent',
        paper: 'bg-paper',
        sun: 'bg-sun',
        yellow: 'bg-yellow',
        teal: 'bg-teal',
        pink: 'bg-pink',
        ink: 'bg-ink text-fog',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-danger text-danger-text border-danger-text',
        muted: 'border-line bg-sand text-ink-2',
      },
      size: {
        default: 'px-3 py-1 text-sm',
        sm: 'px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: { tone: 'plain', size: 'default' },
  },
)

function Badge({
  className,
  tone,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'
  return <Comp data-slot="badge" className={cn(badgeVariants({ tone, size }), className)} {...props} />
}

export { Badge, badgeVariants }
