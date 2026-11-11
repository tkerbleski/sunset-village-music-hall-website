'use client'

// Bookings: inquiries sent from the Music Hall form. Each can be marked
// replied / booked / declined and carry private notes.

import { useState, type FormEvent } from 'react'
import { getJson, postJson, type Booking } from '@/lib/admin/api'
import { useLoad } from '@/lib/admin/use-load'
import { useAdmin } from '@/components/internal/admin-shell'
import { EmptyState, ErrorNote, FormField, PageHeader, Panel } from '@/components/internal/internal-ui'
import { BookingCard } from '@/components/internal/admin/booking-card'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Which form the Music Hall page shows: this site's own (inquiries land on
// this screen) or a Google Form (responses go to the owner's Google account).
function FormChoice({ onSignedOut }: { onSignedOut: () => void }) {
  const { data, reload } = useLoad(() => getJson<Record<string, string>>('settings'), onSignedOut)
  const current = data?.booking_form_url ?? ''
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'site' | 'google' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  if (!data) return null
  const shown = mode ?? (current ? 'google' : 'site')

  async function save(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault()
    const url = e ? String(new FormData(e.currentTarget).get('url') ?? '') : ''
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      await postJson('booking-form', { url })
      setSaved(true)
      setMode(null)
      reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p>
          <span className="font-semibold">Booking form on the website:</span>{' '}
          <span className="text-ink-2">{current ? 'your Google Form' : 'built-in form'}</span>
        </p>
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Close' : 'Change'}
        </Button>
      </div>
      {open && (
        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
          <ToggleGroup
            type="single"
            size="sm"
            spacing={2}
            value={shown}
            onValueChange={(v) => v && setMode(v as 'site' | 'google')}
            aria-label="Booking form"
          >
            <ToggleGroupItem value="site">Built-in form</ToggleGroupItem>
            <ToggleGroupItem value="google">Google Form</ToggleGroupItem>
          </ToggleGroup>
          {shown === 'site' ? (
            <>
              <p className="text-ink-2">
                {current
                  ? 'The site’s own form. Inquiries show up on this page.'
                  : 'The site uses its own form now. Inquiries show up on this page.'}
              </p>
              {current && (
                <div>
                  <Button size="sm" disabled={busy} onClick={() => save()}>
                    {busy ? 'Saving…' : 'Switch back to the built-in form'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={save} className="flex flex-col gap-3">
              <FormField
                label="Google Form link"
                htmlFor="google-form-url"
                hint="In Google Forms click Send, then the link icon. Untick “Shorten URL” so the form shows right on the page, then copy and paste it here. Responses go to your Google Form, not this page."
              >
                <Input
                  density="compact"
                  id="google-form-url"
                  name="url"
                  type="url"
                  required
                  defaultValue={current}
                  placeholder="https://docs.google.com/forms/…"
                />
              </FormField>
              <div>
                <Button type="submit" size="sm" disabled={busy}>
                  {busy ? 'Saving…' : current ? 'Save link' : 'Use this Google Form'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
      {(error || saved) && (
        <div className="mt-4">
          <ErrorNote>{error}</ErrorNote>
          {saved && (
            <Alert variant="info" className="font-normal">
              Saved. The Music Hall page updates within a minute.
            </Alert>
          )}
        </div>
      )}
    </Panel>
  )
}

export default function BookingsPage() {
  const { refresh, signedOut } = useAdmin()
  const { data, error, reload } = useLoad(() => getJson<Booking[]>('bookings'), signedOut)
  const [filter, setFilter] = useState<'open' | 'all'>('open')

  const shown = (data ?? []).filter((b) => filter === 'all' || b.status === 'new' || b.status === 'replied')
  const changed = () => {
    reload()
    refresh() // update the "new" badge on the Bookings tab
  }

  return (
    <>
      <PageHeader title="Bookings" description="Inquiries sent through the form on the Music Hall page." />
      <FormChoice onSignedOut={signedOut} />
      <ToggleGroup
        type="single"
        size="sm"
        spacing={2}
        value={filter}
        onValueChange={(v) => v && setFilter(v as 'open' | 'all')}
        aria-label="Show"
        className="mb-5"
      >
        <ToggleGroupItem value="open">Needs attention</ToggleGroupItem>
        <ToggleGroupItem value="all">All ({data?.length ?? 0})</ToggleGroupItem>
      </ToggleGroup>
      <ErrorNote>{error}</ErrorNote>
      {data && shown.length === 0 && (
        <EmptyState>
          {filter === 'open' ? 'You’re all caught up. Nothing new or waiting on a reply.' : 'No inquiries yet.'}
        </EmptyState>
      )}
      <div className="flex flex-col gap-4">
        {shown.map((b) => (
          <BookingCard key={b.id} b={b} onChange={changed} />
        ))}
      </div>
    </>
  )
}
