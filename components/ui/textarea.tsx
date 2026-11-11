import * as React from 'react'
import { cn } from '@/lib/utils'
import { fieldStyles } from './input'

function Textarea({
  className,
  density = 'default',
  ...props
}: React.ComponentProps<'textarea'> & { density?: 'default' | 'compact' }) {
  return (
    <textarea data-slot="textarea" className={cn(fieldStyles.base, fieldStyles[density], 'resize-y', className)} {...props} />
  )
}

export { Textarea }
