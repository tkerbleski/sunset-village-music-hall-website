import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva('w-full rounded-md border-2 px-4 py-3 font-semibold', {
  variants: {
    variant: {
      default: 'border-ink bg-paper text-ink',
      info: 'border-ink bg-map text-ink',
      warning: 'border-ink bg-warning text-ink',
      destructive: 'border-danger-text bg-danger text-danger-text',
    },
  },
  defaultVariants: { variant: 'default' },
})

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={variant === 'destructive' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="alert-title" className={cn('font-extrabold', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('font-normal', className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
