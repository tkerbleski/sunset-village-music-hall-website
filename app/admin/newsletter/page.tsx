'use client'

// Newsletter: write and send an announcement to everyone signed up, see
// past announcements, and manage the subscriber list.

import { useState, type FormEvent } from 'react'
import { getJson, postJson, type Announcement, type Setup, type Subscriber } from '@/lib/admin/api'
import { fmtWhen, useLoad } from '@/lib/admin/use-load'
import { useAdmin } from '@/components/internal/admin-shell'
import { EmptyState, ErrorNote, FormField, Mono, PageHeader, Panel } from '@/components/internal/internal-ui'
import { ConfirmDialog } from '@/components/internal/admin/confirm-dialog'
import { downloadCsv } from '@/components/internal/admin/csv'
import { StatusPill } from '@/components/internal/status-pill'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const DRAFT_KEY = 'sv-admin-announcement-draft'

function loadDraft(): { subject: string; body: string } {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '') ?? { subject: '', body: '' }
  } catch {
    return { subject: '', body: '' }
  }
}
function saveDraft(d: { subject: string; body: string }) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
  } catch {
    /* draft just isn't remembered */
  }
}

const people = (n: number) => `${n} ${n === 1 ? 'person' : 'people'}`

function Composer({ setup, active, onSent }: { setup: Setup; active: number; onSent: () => void }) {
  const [draft, setDraftState] = useState(loadDraft)
  const [testTo, setTestTo] = useState('')
  const [busy, setBusy] = useState<'' | 'test' | 'send'>('')
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [tested, setTested] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const setDraft = (d: typeof draft) => {
    setDraftState(d)
    saveDraft(d)
    setTested(false)
  }

  async function send(test: boolean) {
    setError('')
    setDone('')
    setBusy(test ? 'test' : 'send')
    try {
      const r = await postJson<{ sent: number; total?: number }>('announce', { ...draft, test, testTo })
      if (test) {
        setTested(true)
        setDone('Test sent. Check your inbox to see how it looks.')
      } else {
        setDone(
          r.total && r.sent < r.total
            ? `Sent to ${r.sent} of ${r.total}. Some didn’t go through.`
            : `Sent to ${people(r.sent)}.`,
        )
        setDraft({ subject: '', body: '' })
        onSent()
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy('')
    }
  }

  if (!setup.email) {
    return (
      <Alert variant="info" className="font-normal">
        Sending email isn’t set up yet, so announcements can’t go out. Signups are still being collected below.
      </Alert>
    )
  }

  return (
    <Panel title="Send an announcement">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          setError('')
          setDone('')
          setConfirming(true)
        }}
        className="flex flex-col gap-4"
      >
        <FormField label="Subject" htmlFor="ann-subject">
          <Input
            density="compact"
            id="ann-subject"
            required
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            placeholder="e.g. This Friday at the Music Hall"
          />
        </FormField>
        <FormField
          label="Message"
          htmlFor="ann-body"
          hint="Plain text. Leave a blank line between paragraphs. Links are clickable automatically. An unsubscribe link is added at the bottom."
        >
          <Textarea
            density="compact"
            id="ann-body"
            required
            rows={10}
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          />
        </FormField>
        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
          <FormField label="Send a test to yourself first" htmlFor="ann-test" className="min-w-56 flex-1">
            <Input
              density="compact"
              id="ann-test"
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="your@email.com"
            />
          </FormField>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-0.5"
            disabled={!!busy || !draft.subject || !draft.body}
            onClick={() => send(true)}
          >
            {busy === 'test' ? 'Sending test…' : 'Send test'}
          </Button>
        </div>
        <ErrorNote>{error}</ErrorNote>
        {done && (
          <Alert variant="info" className="font-normal">
            {done}
          </Alert>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="sun" size="sm" disabled={!!busy || active === 0}>
            {busy === 'send' ? 'Sending…' : `Send to ${active} ${active === 1 ? 'subscriber' : 'subscribers'}`}
          </Button>
          {!tested && draft.body && <span className="text-meta text-ink-2">Tip: send yourself a test first.</span>}
        </div>
      </form>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Send this announcement?"
        description={`“${draft.subject}” goes to ${people(active)} now. This can’t be undone.`}
        confirmLabel="Send now"
        variant="sun"
        onConfirm={() => send(false)}
      />
    </Panel>
  )
}

const joined = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function csv(subs: Subscriber[]) {
  downloadCsv(
    `sunset-village-newsletter-${new Date().toISOString().slice(0, 10)}.csv`,
    [['email', 'signed_up', 'unsubscribed'], ...subs.map((s) => [s.email, s.created_at, s.unsubscribed_at ?? ''])],
    false,
  )
}

export default function NewsletterPage() {
  const { me, signedOut } = useAdmin()
  const subs = useLoad(() => getJson<Subscriber[]>('subscribers'), signedOut)
  const past = useLoad(() => getJson<Announcement[]>('announcements'), signedOut)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState('')
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)

  const list = subs.data ?? []
  const active = list.filter((s) => !s.unsubscribed_at)
  const shown = list.filter((s) => s.email.includes(search.trim().toLowerCase()))

  async function add(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await postJson('subscriber-add', { email: adding })
      setAdding('')
      subs.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function remove(s: Subscriber) {
    if (!confirm(`Unsubscribe ${s.email}? They won’t get any more announcements.`)) return
    try {
      await postJson('subscriber-delete', { id: s.id })
      subs.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={
          subs.data ? `${active.length} ${active.length === 1 ? 'person is' : 'people are'} signed up.` : undefined
        }
      />
      <div className="flex flex-col gap-5">
        <Composer setup={me} active={active.length} onSent={past.reload} />

        {past.data && past.data.length > 0 && (
          <Panel title="Sent announcements">
            <ul className="divide-y divide-border">
              {past.data.map((a) => {
                const open = openId === a.id
                return (
                  <li key={a.id} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : a.id)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-0.5 text-left"
                    >
                      <span className="font-semibold">
                        {open ? '▾' : '▸'} {a.subject}
                      </span>
                      <Mono className="text-ink-2">
                        {fmtWhen(a.created_at)} · sent to {a.sent}
                        {a.sent < a.recipients ? ` of ${a.recipients}` : ''}
                      </Mono>
                    </button>
                    {open && <p className="mt-2 pl-4 whitespace-pre-wrap text-ink-2">{a.body}</p>}
                  </li>
                )
              })}
            </ul>
          </Panel>
        )}

        <Panel
          title="Subscribers"
          action={
            list.length > 0 && (
              <Button variant="link" size="sm" className="h-auto px-0" onClick={() => csv(list)}>
                Download list (spreadsheet)
              </Button>
            )
          }
        >
          <ErrorNote>{subs.error || error}</ErrorNote>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              density="compact"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails"
              aria-label="Search emails"
            />
            <form onSubmit={add} className="flex gap-2">
              <Input
                density="compact"
                type="email"
                required
                value={adding}
                onChange={(e) => setAdding(e.target.value)}
                placeholder="Add someone by email"
                aria-label="Add someone by email"
              />
              <Button type="submit" variant="outline" size="sm" className="h-10">
                Add
              </Button>
            </form>
          </div>
          {subs.data && list.length === 0 && (
            <div className="mt-3">
              <EmptyState>No signups yet.</EmptyState>
            </div>
          )}
          {shown.length > 0 && (
            <Table className="mt-3">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="break-all">
                      <span className={s.unsubscribed_at ? 'text-ink-2 line-through' : undefined}>{s.email}</span>
                      <span className="block sm:hidden">
                        <Mono className="text-ink-2">
                          {s.unsubscribed_at ? 'Unsubscribed' : `Joined ${joined(s.created_at)}`}
                        </Mono>
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <StatusPill status={s.unsubscribed_at ? 'unsubscribed' : 'subscribed'} />
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap sm:table-cell">
                      <Mono className="text-ink-2">{joined(s.created_at)}</Mono>
                    </TableCell>
                    <TableCell className="text-right">
                      {!s.unsubscribed_at && (
                        <Button variant="ghost" size="sm" className="px-2" onClick={() => remove(s)}>
                          Unsubscribe
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      </div>
    </>
  )
}
