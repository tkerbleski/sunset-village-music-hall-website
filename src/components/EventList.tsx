import { Link } from 'react-router-dom'
import { fmtDate, type VillageEvent } from '../data/events'

function TicketAction({ e, dark }: { e: VillageEvent; dark?: boolean }) {
  if (e.ticketUrl) {
    return (
      <a
        href={e.ticketUrl}
        className="inline-block rounded-[3px] bg-sunset px-4 py-2 text-sm font-semibold text-white transition hover:bg-sunset-deep"
      >
        Tickets{e.price ? ` ${e.price}` : ''}
      </a>
    )
  }
  const cls = dark ? 'text-bg/70' : 'text-ink-soft'
  if (e.price) return <span className={`text-sm ${cls}`}>{e.price} at the door</span>
  return <span className={`text-sm ${cls}`}>Free</span>
}

export function EventRow({ e, dark }: { e: VillageEvent; dark?: boolean }) {
  const sub = dark ? 'text-bg/60' : 'text-ink-soft'
  const accent = dark ? 'text-gold' : 'text-sunset'
  return (
    <div className="grid gap-x-6 gap-y-2 py-5 sm:grid-cols-[8.5rem_1fr_auto] sm:items-center">
      <div>
        <div className={`font-display text-lg font-bold leading-tight ${accent}`}>
          {fmtDate(e.date)}
        </div>
        {e.time && <div className={`text-sm ${sub}`}>{e.time}</div>}
      </div>
      <div>
        <h3 className="font-display text-xl font-semibold leading-snug">
          <Link to={`/events/${e.id}`} className="hover:underline">
            {e.title}
          </Link>
          {e.sample && (
            <span
              className={`ml-2 align-middle text-[11px] font-sans font-semibold uppercase tracking-[0.14em] ${sub}`}
            >
              Example listing
            </span>
          )}
        </h3>
        <p className={`mt-0.5 text-[15px] leading-relaxed ${sub}`}>
          {e.summary} <span className="whitespace-nowrap">({e.venue})</span>
        </p>
      </div>
      <div className="sm:text-right">
        <TicketAction e={e} dark={dark} />
      </div>
    </div>
  )
}

export function EmptyCalendar({ dark }: { dark?: boolean }) {
  return (
    <div className={`py-10 text-center ${dark ? 'text-bg/70' : 'text-ink-soft'}`}>
      <p className="font-display text-xl">Nothing on the calendar right now.</p>
      <p className="mt-2 text-[15px]">
        New shows and events are announced through the{' '}
        <a href="/#newsletter" className={dark ? 'text-gold underline' : 'text-sunset underline'}>
          newsletter
        </a>{' '}
        first.
      </p>
    </div>
  )
}
