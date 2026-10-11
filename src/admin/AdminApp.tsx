// The /admin area: login gate, header, and the screens. Loaded lazily
// from App.tsx so none of this ships to regular visitors.

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { getJson, postJson, SignedOut, type Me } from './api'
import { Button, ErrorNote, Field, input } from './ui'
import EventsAdmin from './EventsAdmin'
import BookingsAdmin from './BookingsAdmin'
import NewsletterAdmin from './NewsletterAdmin'
import ShopsAdmin from './ShopsAdmin'
import OverviewAdmin from './OverviewAdmin'
import TicketsAdmin from './TicketsAdmin'
import TeamAdmin from './TeamAdmin'

function Login({ onIn }: { onIn: () => void }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const f = new FormData(e.currentTarget)
      await postJson('login', { email: f.get('email'), password: f.get('password') })
      onIn()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm px-5 pt-24">
      <p className="eyebrow">Sunset Village</p>
      <h1 className="mt-1 font-display text-4xl font-bold">Admin</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email">
          <input name="email" type="email" required autoFocus autoComplete="username" className={input} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" required autoComplete="current-password" className={input} />
        </Field>
        <ErrorNote>{error}</ErrorNote>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}

export default function AdminApp() {
  const [me, setMe] = useState<Me | null | 'out'>(null)
  const [error, setError] = useState('')

  const check = useCallback(() => {
    getJson<Me>('me')
      .then(setMe)
      .catch((e) => (e instanceof SignedOut ? setMe('out') : setError(e.message)))
  }, [])

  useEffect(() => {
    document.title = 'Admin | Sunset Village'
    check()
  }, [check])

  const signedOut = useCallback(() => setMe('out'), [])

  if (error) {
    return (
      <main className="mx-auto max-w-md px-5 pt-24">
        <ErrorNote>{error}</ErrorNote>
      </main>
    )
  }
  if (me === null) return <main className="min-h-screen" />
  if (me === 'out') return <Login onIn={check} />

  const tabs = [
    { to: '/admin/overview', label: 'Overview' },
    { to: '/admin/events', label: 'Events' },
    { to: '/admin/bookings', label: 'Bookings', badge: me.newBookings },
    { to: '/admin/tickets', label: 'Tickets' },
    { to: '/admin/newsletter', label: 'Newsletter' },
    { to: '/admin/shops', label: 'Shops' },
    { to: '/admin/team', label: 'Team' },
  ]

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 pt-3">
          <span className="font-display text-lg font-bold">Sunset Village Admin</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-ink-soft sm:inline">{me.admin.name}</span>
            <a href="/" target="_blank" rel="noreferrer" className="text-ink-soft hover:text-ink">
              View site ↗
            </a>
            <button
              onClick={() => postJson('logout', {}).finally(() => setMe('out'))}
              className="text-ink-soft hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-2 pt-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-[3px] px-3 py-2 text-[15px] font-semibold transition ${
                  isActive ? 'border-sunset text-ink' : 'border-transparent text-ink-soft hover:text-ink'
                }`
              }
            >
              {t.label}
              {t.badge ? (
                <span className="ml-1.5 rounded-full bg-sunset px-1.5 py-0.5 text-[11px] text-white">{t.badge}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 pt-8">
        {me.usingSetupPassword && (
          <p className="mb-6 rounded-[4px] border-2 border-sunset bg-card px-4 py-3 text-[15px]">
            You’re signed in with the setup password.{' '}
            <NavLink to="/admin/team" className="font-semibold text-sunset hover:underline">
              Choose your own password on the Team page
            </NavLink>{' '}
            so only you know it.
          </p>
        )}
        <Routes>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<OverviewAdmin setup={me} onSignedOut={signedOut} />} />
          <Route path="events" element={<EventsAdmin setup={me} onSignedOut={signedOut} />} />
          <Route path="bookings" element={<BookingsAdmin onSignedOut={signedOut} onChange={check} />} />
          <Route path="newsletter" element={<NewsletterAdmin setup={me} onSignedOut={signedOut} />} />
          <Route path="tickets" element={<TicketsAdmin setup={me} onSignedOut={signedOut} />} />
          <Route path="shops" element={<ShopsAdmin onSignedOut={signedOut} />} />
          <Route path="team" element={<TeamAdmin me={me} onSignedOut={signedOut} onChange={check} />} />
          <Route path="*" element={<Navigate to="/admin/overview" replace />} />
        </Routes>
      </main>
    </div>
  )
}
