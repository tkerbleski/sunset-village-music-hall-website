// Overview: everything at a glance. New inquiries, recent ticket sales,
// what's coming up, and which outside services are connected.

import { Link } from 'react-router-dom'
import { dollars, fmtDate, type VillageEvent } from '../data/events'
import { getJson, type Booking, type Order, type Setup } from './api'
import { ErrorNote, PageHead, fmtWhen, useLoad } from './ui'

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

function Stat({ label, value, to }: { label: string; value: string | number; to: string }) {
  return (
    <Link to={to} className="block border-2 border-ink bg-card p-4 transition hover:bg-bg">
      <div className="font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-ink-soft">{label}</div>
    </Link>
  )
}

function Section({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
        <h2 className="eyebrow">{title}</h2>
        <Link to={to} className="text-sm font-semibold text-sunset hover:underline">
          See all →
        </Link>
      </div>
      {children}
    </section>
  )
}

const SERVICES: { key: keyof Setup; label: string; off: string }[] = [
  { key: 'notifications', label: 'Email', off: 'Inquiry alerts, ticket receipts, and announcements won’t send.' },
  { key: 'payments', label: 'Online tickets (Stripe)', off: 'Events can’t sell tickets on the site yet.' },
  { key: 'uploads', label: 'Flyer uploads', off: 'You can’t upload flyer images yet.' },
  { key: 'backups', label: 'Weekly backup email', off: 'The Monday backup email isn’t running.' },
]

function Connections({ setup }: { setup: Setup }) {
  const missing = SERVICES.filter((s) => !setup[s.key])
  return (
    <section className="mt-10">
      <h2 className="eyebrow border-b-2 border-ink pb-2">Connected services</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <li key={s.key} className="flex items-start gap-2 text-[15px]">
            <span className={setup[s.key] ? 'text-dusk' : 'text-sunset-deep'}>{setup[s.key] ? '●' : '○'}</span>
            <span>
              <span className="font-semibold">{s.label}</span>
              {setup[s.key] ? <span className="text-ink-soft"> · connected</span> : <span className="text-ink-soft"> · not set up. {s.off}</span>}
            </span>
          </li>
        ))}
      </ul>
      {missing.length > 0 && (
        <p className="mt-3 text-[13px] text-ink-soft">Your web developer connects these in Vercel. Everything else works without them.</p>
      )}
    </section>
  )
}

export default function OverviewAdmin({ setup, onSignedOut }: { setup: Setup; onSignedOut: () => void }) {
  const { data, error } = useLoad(() => getJson<Overview>('overview'), onSignedOut)

  return (
    <>
      <PageHead title="Overview" sub="What needs you, what’s selling, and what’s coming up." />
      <ErrorNote>{error}</ErrorNote>
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="New inquiries" value={data.counts.new_bookings} to="/admin/bookings" />
            <Stat label="Waiting on a reply" value={data.counts.waiting_bookings} to="/admin/bookings" />
            <Stat
              label="Tickets sold, last 30 days"
              value={`${data.counts.tickets_30d} · ${dollars(data.counts.revenue_30d)}`}
              to="/admin/tickets"
            />
            <Stat label="Newsletter subscribers" value={data.counts.subscribers} to="/admin/newsletter" />
          </div>

          <Section title="Latest inquiries" to="/admin/bookings">
            {data.bookings.length === 0 ? (
              <p className="py-4 text-ink-soft">No inquiries yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.bookings.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-baseline gap-x-3 py-3">
                    <span className="font-semibold">{b.name}</span>
                    <span className="text-sm text-ink-soft">{b.type || 'Inquiry'}</span>
                    <span className="text-sm text-ink-soft">{fmtWhen(b.created_at)}</span>
                    {b.status === 'new' && (
                      <span className="ml-auto bg-sunset px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">New</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Latest ticket sales" to="/admin/tickets">
            {data.orders.length === 0 ? (
              <p className="py-4 text-ink-soft">
                {setup.payments ? 'No tickets sold yet.' : 'Online ticket sales start once Stripe is connected.'}
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {data.orders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-baseline gap-x-3 py-3">
                    <span className="font-semibold">{o.name || o.email}</span>
                    <span className="text-sm text-ink-soft">
                      {o.quantity} × {o.event_title ?? o.event_id}
                    </span>
                    <span className="ml-auto text-sm">{dollars(o.amount_cents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Coming up" to="/admin/events">
            {data.upcoming.length === 0 ? (
              <p className="py-4 text-ink-soft">Nothing on the calendar.</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.upcoming.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-baseline gap-x-4 py-3">
                    <span className="w-28 font-display font-bold text-sunset">{fmtDate(e.date)}</span>
                    <span className="font-semibold">{e.title}</span>
                    <span className="ml-auto text-sm text-ink-soft">
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
          </Section>

          <Connections setup={setup} />
        </>
      )}
    </>
  )
}
