// shadcn/ui Button, restyled for Sunset Village.
// Pills only. 2px outlines. Ink is the default; `sun` is the single high-emphasis CTA per view.
import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border-2 font-display font-bold leading-tight whitespace-nowrap no-underline transition-[background-color,color,transform] duration-[120ms] active:scale-[.975] disabled:pointer-events-none disabled:opacity-50 max-[520px]:whitespace-normal [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Ink fill. On .theme-ink it inverts automatically (fog fill, ink text).
        default:
          'border-primary bg-primary text-primary-foreground hover:bg-ink-hover hover:text-fog [.theme-ink_&]:hover:bg-paper [.theme-ink_&]:hover:text-ink',
        // The call to action: sunset orange with ink text. One per view.
        sun: 'border-ink bg-sun text-ink hover:bg-sun-hover hover:text-ink [.theme-ink_&]:border-sun',
        // Outline that follows the current text color: ink on fog, fog on ink bands.
        outline: 'border-foreground bg-transparent text-foreground hover:bg-ink/7 hover:text-foreground [.theme-ink_&]:hover:bg-fog/12',
        // Quiet text button for dense/internal UI.
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-accent hover:text-foreground',
        link: 'border-transparent bg-transparent p-0 text-sea underline-offset-4 hover:underline [.theme-ink_&]:text-yellow',
        destructive: 'border-destructive bg-destructive text-white hover:bg-destructive/90 hover:text-white',
      },
      size: {
        sm: 'h-9 px-4 text-sm', // internal UI
        md: 'min-h-11 px-4.5 text-base', // card actions
        default: 'min-h-12 px-5.5 text-body', // 48px
        lg: 'min-h-14 px-7 text-lg', // hero / band CTAs
        xl: 'min-h-16 px-8 text-xl', // newsletter band
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
