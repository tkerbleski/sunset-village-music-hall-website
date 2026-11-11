// Sunset Village Music Hall wordmark. SVGs live in /public/brand/.
// on-dark: fog script, sun star + MUSIC HALL  → header, footer, any ink ground.
// on-light: sun script with ink outline, ink star + MUSIC HALL → fog/paper grounds.
// mono: single color (renders black as an <img>).
// Never use the original gradient version. Never recolor outside these variants. Min height 40px.
// `height` is the default; override responsively with e.g. className="max-[520px]:h-15".
import Image from 'next/image'
import { cn } from '@/lib/utils'

const SRC = {
  'on-dark': '/brand/wordmark-on-dark.svg',
  'on-light': '/brand/wordmark-on-light.svg',
  mono: '/brand/wordmark-mono.svg',
} as const
const RATIO = 1606 / 695

export function Wordmark({
  variant = 'on-dark',
  height = 76,
  className,
  priority,
  alt = 'Sunset Village Music Hall',
}: {
  variant?: keyof typeof SRC
  height?: number
  className?: string
  priority?: boolean
  alt?: string
}) {
  return (
    <Image
      src={SRC[variant]}
      alt={alt}
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      unoptimized
      className={cn('block h-(--wm-h) w-auto max-w-full', className)}
      style={{ '--wm-h': `${height}px` } as React.CSSProperties}
    />
  )
}
