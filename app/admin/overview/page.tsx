'use client'

// Overview: everything at a glance. New inquiries, recent ticket sales,
// what's coming up, and which outside services are connected.

import Link from 'next/link'
import { getJson, type Booking, type Order, type Setup } from '@/lib/admin/api'
import { fmtWhen, useLoad } from '@/lib/admin/use-load'
import { dollars } from '@/lib/events'
import type { VillageEvent } from '@/lib/data/events'
import { useAdmin } from '@/components/internal/admin-shell'
import { EmptyState, ErrorNote, Mono, PageHeader, Panel, Stat } from '@/components/internal/internal-ui'
import { StatusPill } from '@/components/internal/status-pill'
import { Badge } from '@/components/ui/badge'

interface Overview {
  counts: {
    new_bookings: number
    waiting_bookings: number
    subscribers: number
    tickets_30d: number
    revenue_30d: number
  }
  bookings: Booking[]
  orders: Order[]
  upcoming: (VillageEvent & { sold: number })[]
}

const SERVICES: { key: keyof Setup; label: string; off: string }[] = [
  { key: 'notifications', label: 'Email', off: 'Inquiry alerts, ticket receipts, and announcements won’t send.' },
  { key: 'payments', label: 'Online tickets (Stripe)', off: 'Events can’t sell tickets on the site yet.' },
  { key: 'uploads', label: 'Flyer uploads', off: 'You can’t upload flyer images yet.' },
  { key: 'backups', label: 'Weekly backup email', off: 'The Monday backup email isn’t running.' },
]

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

const seeAll = (href: string) => (
  <Link href={href} className="font-semibold">
    See all →
  </Link>
)

export default function OverviewPage() {
  const { me, signedOut } = useAdmin()
  const { data, error } = useLoad(() => getJson<Overview>('overview'), signedOut)

  return (
    <>
      <PageHeader title="Overview" description="What needs you, what’s selling, and what’s coming up." />
      <ErrorNote>{error}</ErrorNote>
      {data && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="New inquiries" value={data.counts.new_bookings} href="/admin/bookings" />
            <Stat label="Waiting on a reply" value={data.counts.waiting_bookings} href="/admin/bookings" />
            <Stat
              label="Tickets, last 30 days"
              value={`${data.counts.tickets_30d} · ${dollars(data.counts.revenue_30d)}`}
              href="/admin/tickets"
            />
            <Stat label="Newsletter subscribers" value={data.counts.subscribers} href="/admin/newsletter" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Latest inquiries" action={seeAll('/admin/bookings')}>
              {data.bookings.length === 0 ? (
                <EmptyState>No inquiries yet.</EmptyState>
              ) : (
                <ul className="divide-y divide-border">
                  {data.bookings.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                      <span className="font-semibold">{b.name}</span>
                      <span className="text-ink-2">{b.type || 'Inquiry'}</span>
                      <Mono className="text-ink-2">{fmtWhen(b.created_at)}</Mono>
                      {b.status === 'new' && <StatusPill status="new" />}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Latest ticket sales" action={seeAll('/admin/tickets')}>
              {data.orders.length === 0 ? (
                <EmptyState>
                  {me.payments ? 'No tickets sold yet.' : 'Online ticket sales start once Stripe is connected.'}
                </EmptyState>
              ) : (
                <ul className="divide-y divide-border">
                  {data.orders.map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                      <span className="font-semibold">{o.name || o.email}</span>
                      <span className="text-ink-2">
                        {o.quantity} × {o.event_title ?? o.event_id}
                      </span>
                      <Mono className="ml-auto">{dollars(o.amount_cents)}</Mono>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Coming up" action={seeAll('/admin/events')}>
            {data.upcoming.length === 0 ? (
              <EmptyState>Nothing on the calendar.</EmptyState>
            ) : (
              <ul className="divide-y divide-border">
                {data.upcoming.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                    <Mono className="w-28 font-medium">{shortDate(e.date)}</Mono>
                    <span className="font-semibold">{e.title}</span>
                    <span className="ml-auto text-ink-2">
                      {e.ticketPrice
                        ? `${e.sold}${e.capacity ? ` / ${e.capacity}` : ''} sold`
                        : e.ticketUrl
                          ? 'Outside ticket link'
                          : e.price
                            ? `${e.price} at the door`
                            : 'Free'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Connected services">
            <ul className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <li key={s.key} className="flex items-start gap-2.5">
                  <Badge tone={me[s.key] ? 'success' : 'muted'} size="sm">
                    {me[s.key] ? 'On' : 'Off'}
                  </Badge>
                  <span>
                    <span className="font-semibold">{s.label}</span>
                    {!me[s.key] && <span className="text-ink-2"> · {s.off}</span>}
                  </span>
                </li>
              ))}
            </ul>
            {SERVICES.some((s) => !me[s.key]) && (
              <p className="mt-3 text-meta text-ink-2">
                Your web developer connects these in Vercel. Everything else works without them.
              </p>
            )}
          </Panel>
        </div>
      )}
    </>
  )
}
