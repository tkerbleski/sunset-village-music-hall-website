import { Badge } from '@/components/ui/badge'

const TONES = {
  new: 'warning',
  replied: 'teal',
  booked: 'success',
  declined: 'muted',
  paid: 'success',
  refunded: 'danger',
  'checked-in': 'success',
  subscribed: 'success',
  unsubscribed: 'muted',
  open: 'success',
  'coming-soon': 'yellow',
} as const

/** Status label for internal lists. Unknown statuses render neutral. */
export function StatusPill({ status, children }: { status: string; children?: React.ReactNode }) {
  const tone = TONES[status as keyof typeof TONES] ?? 'paper'
  return (
    <Badge tone={tone} size="sm">
      {children ?? status.replace('-', ' ')}
    </Badge>
  )
}
