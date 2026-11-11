'use client'

// Tickets: online ticket orders (paid through Stripe), grouped by event.
// Doubles as the door list: tick people off as they arrive. Refunds are
// made in Stripe; mark the order refunded here so the seat frees up.

import { useState } from 'react'
import { getJson, postJson, type Order } from '@/lib/admin/api'
import { fmtWhen, useLoad } from '@/lib/admin/use-load'
import { dollars } from '@/lib/events'
import { useAdmin } from '@/components/internal/admin-shell'
import { EmptyState, ErrorNote, FormField, Mono, PageHeader, Panel, Stat } from '@/components/internal/internal-ui'
import { downloadCsv } from '@/components/internal/admin/csv'
import { StatusPill } from '@/components/internal/status-pill'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const shortDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

function csv(title: string, orders: Order[]) {
  downloadCsv(`door-list-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, [
    ['Name', 'Email', 'Tickets', 'Paid', 'Bought', 'Checked in', 'Refunded'],
    ...orders.map((o) => [
      o.name ?? '',
      o.email,
      String(o.quantity),
      (o.amount_cents / 100).toFixed(2),
      fmtWhen(o.created_at),
      o.checked_in ? 'yes' : '',
      o.refunded_at ? 'yes' : '',
    ]),
  ])
}

function useOrderUpdate(o: Order, onChange: () => void) {
  const [error, setError] = useState('')
  const refunded = Boolean(o.refunded_at)
  async function update(patch: { checkedIn?: boolean; refunded?: boolean }) {
    setError('')
    try {
      await postJson('order-update', { id: o.id, checkedIn: o.checked_in, refunded, ...patch })
      onChange()
    } catch (e) {
      setError((e as Error).message)
    }
  }
  return { error, refunded, update }
}

function CheckIn({ o, id, refunded, update }: { o: Order; id: string; refunded: boolean; update: (p: { checkedIn: boolean }) => void }) {
  return (
    <Checkbox
      id={id}
      checked={o.checked_in}
      disabled={refunded}
      onCheckedChange={(v) => update({ checkedIn: v === true })}
      aria-label={`Checked in: ${o.name || o.email}`}
    />
  )
}

function Who({ o, id, refunded }: { o: Order; id: string; refunded: boolean }) {
  return (
    <label htmlFor={id} className={cn('block min-w-0 cursor-pointer', refunded && 'text-ink-2 line-through')}>
      <span className="font-semibold">{o.name || '(no name)'}</span>
      <span className="block text-meta break-all text-ink-2">{o.email}</span>
    </label>
  )
}

const Paid = ({ o, refunded }: { o: Order; refunded: boolean }) =>
  refunded ? <StatusPill status="refunded" /> : <Mono>{dollars(o.amount_cents)}</Mono>

/** Tablet and up: one table row per order. */
function OrderRow({ o, onChange }: { o: Order; onChange: () => void }) {
  const { error, refunded, update } = useOrderUpdate(o, onChange)
  const id = `order-${o.id}`
  return (
    <>
      <TableRow className={cn(refunded && 'text-ink-2')}>
        <TableCell className="w-10 pr-0">
          <CheckIn o={o} id={id} refunded={refunded} update={update} />
        </TableCell>
        <TableCell>
          <Who o={o} id={id} refunded={refunded} />
        </TableCell>
        <TableCell className="text-right">
          <Mono className="text-ui font-semibold">×{o.quantity}</Mono>
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <Paid o={o} refunded={refunded} />
        </TableCell>
        <TableCell className="hidden whitespace-nowrap md:table-cell">
          <Mono className="text-ink-2">{fmtWhen(o.created_at)}</Mono>
        </TableCell>
        <TableCell className="text-right whitespace-nowrap">
          <RowActions o={o} refunded={refunded} update={update} />
        </TableCell>
      </TableRow>
      {error && (
        <TableRow>
          <TableCell colSpan={6}>
            <ErrorNote>{error}</ErrorNote>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

/** Phone: stacked rows, big check-in target first. */
function OrderItem({ o, onChange }: { o: Order; onChange: () => void }) {
  const { error, refunded, update } = useOrderUpdate(o, onChange)
  const id = `order-m-${o.id}`
  return (
    <li className="flex gap-3 py-3">
      <div className="pt-0.5">
        <CheckIn o={o} id={id} refunded={refunded} update={update} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Who o={o} id={id} refunded={refunded} />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Mono className="text-ui font-semibold">×{o.quantity}</Mono>
            <Paid o={o} refunded={refunded} />
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3">
          <Mono className="text-ink-2">Bought {fmtWhen(o.created_at)}</Mono>
          <RowActions o={o} refunded={refunded} update={update} />
        </div>
        <ErrorNote>{error}</ErrorNote>
      </div>
    </li>
  )
}

function RowActions({
  o,
  refunded,
  update,
}: {
  o: Order
  refunded: boolean
  update: (p: { refunded: boolean }) => void
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {o.payment_intent && (
        <a
          href={`https://dashboard.stripe.com/payments/${o.payment_intent}`}
          target="_blank"
          rel="noreferrer"
          className="text-meta font-semibold"
          title="Refunds are made in Stripe"
        >
          Stripe ↗
        </a>
      )}
      <Button variant="ghost" size="sm" className="px-2" onClick={() => update({ refunded: !refunded })}>
        {refunded ? 'Undo refunded' : 'Mark refunded'}
      </Button>
    </span>
  )
}

export default function TicketsPage() {
  const { me, signedOut } = useAdmin()
  const { data, error, reload } = useLoad(() => getJson<Order[]>('orders'), signedOut)
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<string | null>(null)

  // Orders arrive sorted by event date (newest first), so grouping keeps that order.
  const groups = new Map<string, Order[]>()
  for (const o of data ?? []) groups.set(o.event_id, [...(groups.get(o.event_id) ?? []), o])
  const eventId = picked ?? [...groups.keys()][0] ?? null
  const orders = eventId ? (groups.get(eventId) ?? []) : []
  const live = orders.filter((o) => !o.refunded_at)
  const term = search.trim().toLowerCase()
  const shown = term ? orders.filter((o) => `${o.name} ${o.email}`.toLowerCase().includes(term)) : orders
  const first = orders[0]

  return (
    <>
      <PageHeader title="Tickets" description="Tickets bought on the website. Use it as the door list on the night." />
      {!me.payments && (
        <Alert variant="info" className="mb-5 font-normal">
          Online ticket sales aren’t switched on yet (Stripe isn’t connected). Once it is, give an event an online ticket
          price under Events and a Buy tickets button appears on its page.
        </Alert>
      )}
      <ErrorNote>{error}</ErrorNote>
      {data && groups.size === 0 && <EmptyState>No tickets sold yet.</EmptyState>}
      {first && (
        <div className="flex flex-col gap-5">
          <FormField label="Event" htmlFor="ticket-event" className="sm:max-w-md">
            <Select value={eventId ?? ''} onValueChange={setPicked}>
              <SelectTrigger id="ticket-event" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...groups.entries()].map(([id, os]) => (
                  <SelectItem key={id} value={id}>
                    {os[0].event_date ? `${shortDate(os[0].event_date)} · ` : ''}
                    {os[0].event_title ?? `${id} (deleted event)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Tickets sold" value={live.reduce((n, o) => n + o.quantity, 0)} />
              <Stat label="Checked in" value={live.filter((o) => o.checked_in).reduce((n, o) => n + o.quantity, 0)} />
              <Stat label="Collected" value={dollars(live.reduce((n, o) => n + o.amount_cents, 0))} />
            </div>
            <p className="mt-2 text-meta text-ink-2">
              Collected is before Stripe’s fee (about 3%). Payouts show in your Stripe account.
            </p>
          </div>

          <Panel
            title="Door list"
            action={
              <Button variant="link" size="sm" className="h-auto px-0" onClick={() => csv(first.event_title ?? first.event_id, orders)}>
                Download door list (spreadsheet)
              </Button>
            }
          >
            <Input
              density="compact"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a name or email"
              aria-label="Find a name or email"
              className="mb-2 sm:max-w-xs"
            />
            {shown.length === 0 ? (
              <EmptyState>No one matches “{search}”.</EmptyState>
            ) : (
              <>
                <ul className="divide-y divide-border sm:hidden">
                  {shown.map((o) => (
                    <OrderItem key={o.id} o={o} onChange={reload} />
                  ))}
                </ul>
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-10 pr-0">
                          <span className="sr-only">Checked in</span>
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Tickets</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="hidden md:table-cell">Bought</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shown.map((o) => (
                        <OrderRow key={o.id} o={o} onChange={reload} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Panel>
        </div>
      )}
    </>
  )
}
