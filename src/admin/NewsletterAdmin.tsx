// Newsletter: write and send an announcement to everyone signed up, see
// past announcements, and manage the subscriber list.

import { useState, type FormEvent } from 'react'
import { getJson, postJson, type Announcement, type Setup, type Subscriber } from './api'
import { Button, ErrorNote, Field, Notice, PageHead, fmtWhen, input, useLoad } from './ui'

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

function Composer({ setup, active, onSent }: { setup: Setup; active: number; onSent: () => void }) {
  const [draft, setDraftState] = useState(loadDraft)
  const [testTo, setTestTo] = useState('')
  const [busy, setBusy] = useState<'' | 'test' | 'send'>('')
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [tested, setTested] = useState(false)

  const setDraft = (d: typeof draft) => {
    setDraftState(d)
    saveDraft(d)
    setTested(false)
  }

  async function send(test: boolean) {
    setError('')
    setDone('')
    if (!test && !confirm(`Send “${draft.subject}” to ${active} ${active === 1 ? 'person' : 'people'} now? This can’t be undone.`)) return
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
            : `Sent to ${r.sent} ${r.sent === 1 ? 'person' : 'people'}.`,
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
    return <Notice>Sending email isn’t set up yet, so announcements can’t go out. Signups are still being collected below.</Notice>
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        send(false)
      }}
      className="space-y-4 border-2 border-ink bg-card p-5"
    >
      <h2 className="font-display text-2xl font-semibold">Send an announcement</h2>
      <Field label="Subject">
        <input
          required
          value={draft.subject}
          onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
          placeholder="e.g. This Friday at the Music Hall"
          className={input}
        />
      </Field>
      <Field label="Message" hint="Plain text. Leave a blank line between paragraphs. Links are clickable automatically. An unsubscribe link is added at the bottom.">
        <textarea
          required
          rows={10}
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          className={input}
        />
      </Field>
      <div className="flex flex-wrap items-end gap-3 border-t border-line pt-4">
        <label className="min-w-[14rem] flex-1">
          <span className="mb-1 block text-sm font-semibold">Send a test to yourself first</span>
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="your@email.com"
            className={input}
          />
        </label>
        <Button kind="secondary" disabled={!!busy || !draft.subject || !draft.body} onClick={() => send(true)}>
          {busy === 'test' ? 'Sending test…' : 'Send test'}
        </Button>
      </div>
      <ErrorNote>{error}</ErrorNote>
      {done && <Notice>{done}</Notice>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!!busy || active === 0}>
          {busy === 'send' ? 'Sending…' : `Send to ${active} ${active === 1 ? 'subscriber' : 'subscribers'}`}
        </Button>
        {!tested && draft.body && <span className="text-sm text-ink-soft">Tip: send yourself a test first.</span>}
      </div>
    </form>
  )
}

function csv(subs: Subscriber[]) {
  const rows = [['email', 'signed_up', 'unsubscribed'], ...subs.map((s) => [s.email, s.created_at, s.unsubscribed_at ?? ''])]
  const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `sunset-village-newsletter-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function NewsletterAdmin({ setup, onSignedOut }: { setup: Setup; onSignedOut: () => void }) {
  const subs = useLoad(() => getJson<Subscriber[]>('subscribers'), onSignedOut)
  const past = useLoad(() => getJson<Announcement[]>('announcements'), onSignedOut)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState('')
  const [error, setError] = useState('')

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
      <PageHead
        title="Newsletter"
        sub={subs.data ? `${active.length} ${active.length === 1 ? 'person is' : 'people are'} signed up.` : undefined}
      />
      <Composer setup={setup} active={active.length} onSent={past.reload} />

      {past.data && past.data.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow border-b-2 border-ink pb-2">Sent announcements</h2>
          <div className="divide-y divide-line">
            {past.data.map((a) => (
              <details key={a.id} className="py-3">
                <summary className="cursor-pointer">
                  <span className="font-semibold">{a.subject}</span>
                  <span className="ml-2 text-sm text-ink-soft">
                    {fmtWhen(a.created_at)} · sent to {a.sent}
                    {a.sent < a.recipients ? ` of ${a.recipients}` : ''}
                  </span>
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-[15px] text-ink-soft">{a.body}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-2">
          <h2 className="eyebrow">Subscribers</h2>
          {list.length > 0 && (
            <Button kind="quiet" onClick={() => csv(list)} className="px-0 py-0 text-sm">
              Download list (spreadsheet)
            </Button>
          )}
        </div>
        <ErrorNote>{subs.error || error}</ErrorNote>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails" className={input} />
          <form onSubmit={add} className="flex gap-2">
            <input
              type="email"
              required
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
              placeholder="Add someone by email"
              className={input}
            />
            <Button type="submit" kind="secondary">
              Add
            </Button>
          </form>
        </div>
        {subs.data && list.length === 0 && <p className="py-6 text-ink-soft">No signups yet.</p>}
        <ul className="mt-3 divide-y divide-line">
          {shown.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-[15px]">
              <span className={`min-w-0 flex-1 break-all ${s.unsubscribed_at ? 'text-ink-soft line-through' : ''}`}>{s.email}</span>
              <span className="text-sm text-ink-soft">
                {s.unsubscribed_at ? 'Unsubscribed' : `Joined ${new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </span>
              {!s.unsubscribed_at && (
                <Button kind="quiet" onClick={() => remove(s)} className="px-0 py-0 text-sm">
                  Unsubscribe
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
