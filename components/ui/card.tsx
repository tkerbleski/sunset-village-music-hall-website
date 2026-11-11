import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Paper on fog. Marketing cards carry the 2px ink outline; internal UI uses
// the quieter 1px line border. No shadows anywhere.
const cardVariants = cva('flex flex-col bg-card text-card-foreground', {
  variants: {
    variant: {
      default: 'rounded-xl border-2 border-ink',
      large: 'rounded-2xl border-2 border-ink',
      quiet: 'rounded-xl border border-border',
      dashed: 'rounded-xl border-2 border-dashed border-ink bg-transparent',
    },
  },
  defaultVariants: { variant: 'default' },
})

function Card({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-wrap items-start justify-between gap-3 px-5 pt-5', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 data-slot="card-title" className={cn('text-heading-md', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('text-ui text-ink-2', className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-5', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex flex-wrap items-center gap-2 px-5 pb-5', className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
