// Shops & Spaces: the businesses listed on the homepage, their hours, and
// the order they appear in.

import { useState, type FormEvent } from 'react'
import { hourLines, type DayHours, type Tenant } from '../data/tenants'
import { getJson, postJson } from './api'
import { Button, ErrorNote, Field, Notice, PageHead, input, useLoad } from './ui'

type Draft = Partial<Tenant>
type Week = NonNullable<Tenant['hours']>

// Shown Monday-first, stored Sunday-first (index 0 = Sunday).
const DAYS = [
  [1, 'Monday'],
  [2, 'Tuesday'],
  [3, 'Wednesday'],
  [4, 'Thursday'],
  [5, 'Friday'],
  [6, 'Saturday'],
  [0, 'Sunday'],
] as const

const CLOSED_WEEK: Week = [null, null, null, null, null, null, null]

function HoursEditor({ value, onChange }: { value: Week; onChange: (w: Week) => void }) {
  const setDay = (i: number, h: DayHours) => {
    const w = [...value] as Week
    w[i] = h
    onChange(w)
  }
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">Regular hours</span>
      <div className="divide-y divide-line border border-line bg-card">
        {DAYS.map(([i, name]) => {
          const h = value[i]
          return (
            <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
              <span className="w-24 font-medium">{name}</span>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={!!h}
                  onChange={(e) => setDay(i, e.target.checked ? { open: '11:00', close: '18:00' } : null)}
                  className="h-4 w-4 accent-[var(--color-sunset)]"
                />
                Open
              </label>
              {h ? (
                <span className="flex items-center gap-2">
                  <input type="time" value={h.open} onChange={(e) => setDay(i, { ...h, open: e.target.value })} className={`${input} w-auto py-1.5`} />
                  <span className="text-sm text-ink-soft">to</span>
                  <input type="time" value={h.close} onChange={(e) => setDay(i, { ...h, close: e.target.value })} className={`${input} w-auto py-1.5`} />
                </span>
              ) : (
                <span className="text-sm text-ink-soft">Closed</span>
              )}
            </div>
          )
        })}
      </div>
      <span className="mt-1 block text-[13px] text-ink-soft">
        {value.some(Boolean)
          ? `Shows on the site as: ${hourLines(value).join('; ')}`
          : 'No regular hours. The note below shows instead.'}
      </span>
    </div>
  )
}

function ShopForm({ initial, onDone }: { initial: Draft; onDone: () => void }) {
  const [d, setD] = useState<Draft>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k: keyof Tenant) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value })

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await postJson('tenant-save', d)
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  async function remove() {
    if (!d.id || !confirm(`Remove “${d.name}” from the site?`)) return
    setBusy(true)
    try {
      await postJson('tenant-delete', { id: d.id })
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <PageHead title={d.id ? `Edit ${initial.name}` : 'New shop or space'} />
      <Field label="Name">
        <input required value={d.name ?? ''} onChange={set('name')} className={input} />
      </Field>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Status</legend>
        <div className="flex gap-5">
          {(['open', 'coming-soon'] as const).map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                checked={(d.status ?? 'open') === s}
                onChange={() => setD({ ...d, status: s })}
                className="h-4 w-4 accent-[var(--color-sunset)]"
              />
              {s === 'open' ? 'Open' : 'Coming soon'}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Description" hint="A sentence or two about what they are.">
        <textarea required rows={3} value={d.blurb ?? ''} onChange={set('blurb')} className={input} />
      </Field>
      <HoursEditor value={d.hours ?? CLOSED_WEEK} onChange={(hours) => setD({ ...d, hours })} />
      <Field label="Hours note (optional)" hint="Shown when there are no regular hours, e.g. “Open during events” or “Opens October 12”.">
        <input value={d.hoursNote ?? ''} onChange={set('hoursNote')} className={input} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Website (optional)" hint="Their own site or Instagram.">
          <input value={d.link ?? ''} onChange={set('link')} placeholder="https://" className={input} />
        </Field>
        <Field label="Link text (optional)" hint="e.g. “sunsetvariety.com”">
          <input value={d.linkLabel ?? ''} onChange={set('linkLabel')} className={input} />
        </Field>
      </div>
      <ErrorNote>{error}</ErrorNote>
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <Button kind="secondary" onClick={onDone} disabled={busy}>
          Cancel
        </Button>
        {d.id && (
          <Button kind="danger" onClick={remove} disabled={busy} className="ml-auto">
            Remove from site
          </Button>
        )}
      </div>
    </form>
  )
}

export default function ShopsAdmin({ onSignedOut }: { onSignedOut: () => void }) {
  const { data, error, reload, setData } = useLoad(() => getJson<Tenant[]>('tenants'), onSignedOut)
  const [editing, setEditing] = useState<Draft | null>(null)
  const [moveError, setMoveError] = useState('')

  if (editing) {
    return (
      <ShopForm
        initial={editing}
        onDone={() => {
          setEditing(null)
          reload()
          window.scrollTo(0, 0)
        }}
      />
    )
  }

  async function move(i: number, by: -1 | 1) {
    if (!data) return
    const next = [...data]
    ;[next[i], next[i + by]] = [next[i + by], next[i]]
    setData(next)
    setMoveError('')
    try {
      await postJson('tenant-order', { ids: next.map((t) => t.id) })
    } catch (e) {
      setMoveError((e as Error).message)
      reload()
    }
  }

  return (
    <>
      <PageHead
        title="Shops & Spaces"
        sub="The businesses listed on the homepage, in this order."
        action={<Button onClick={() => setEditing({ status: 'open' })}>+ Add shop</Button>}
      />
      <ErrorNote>{error || moveError}</ErrorNote>
      {data && data.length === 0 && <Notice>No shops listed yet.</Notice>}
      <div className="divide-y divide-line border-y-2 border-ink">
        {data?.map((t, i) => (
          <div key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
            <div className="flex flex-col">
              <button aria-label={`Move ${t.name} up`} disabled={i === 0} onClick={() => move(i, -1)} className="px-2 text-ink-soft hover:text-ink disabled:opacity-20">
                ▲
              </button>
              <button aria-label={`Move ${t.name} down`} disabled={i === data.length - 1} onClick={() => move(i, 1)} className="px-2 text-ink-soft hover:text-ink disabled:opacity-20">
                ▼
              </button>
            </div>
            <div className="min-w-[10rem] flex-1">
              <div className="font-semibold">
                {t.name}
                <span className="ml-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                  {t.status === 'open' ? 'Open' : 'Coming soon'}
                </span>
              </div>
              <div className="text-sm text-ink-soft">{t.hours ? hourLines(t.hours).join('; ') : t.hoursNote}</div>
            </div>
            <Button kind="secondary" onClick={() => setEditing(t)} className="py-1.5">
              Edit
            </Button>
          </div>
        ))}
      </div>
    </>
  )
}
