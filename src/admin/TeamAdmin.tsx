// Team: who can sign in to this admin. Every admin sees and can do
// everything. New admins get a temporary password, shown here once, which
// they change after signing in.

import { useState, type FormEvent } from 'react'
import { getJson, postJson, type AdminUser, type Me } from './api'
import { Button, ErrorNote, Field, Notice, PageHead, fmtWhen, input, useLoad } from './ui'

function NewPassword({ who, password, emailed }: { who: string; password: string; emailed?: boolean }) {
  return (
    <div className="border-2 border-sunset bg-card p-4">
      <p className="font-semibold">Temporary password for {who}:</p>
      <p className="mt-2 select-all font-mono text-xl">{password}</p>
      <p className="mt-2 text-[14px] text-ink-soft">
        Send this to them by text or in person. It won’t be shown again.
        {emailed ? ' They’ve been emailed the sign-in link (not the password).' : ''} They can change it under Team once
        they sign in.
      </p>
      <Button kind="secondary" className="mt-3 py-1.5 text-sm" onClick={() => navigator.clipboard?.writeText(password)}>
        Copy password
      </Button>
    </div>
  )
}

function AddAdmin({ onAdded }: { onAdded: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ who: string; password: string; emailed: boolean } | null>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    setBusy(true)
    setError('')
    try {
      const r = await postJson<{ password: string; emailed: boolean }>('admin-add', { name: f.get('name'), email: f.get('email') })
      setResult({ who: String(f.get('name')), ...r })
      form.reset()
      onAdded()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="eyebrow border-b-2 border-ink pb-2">Add an admin</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" required className={input} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required className={input} />
          </Field>
        </div>
        <ErrorNote>{error}</ErrorNote>
        <Button type="submit" disabled={busy}>
          {busy ? 'Adding…' : 'Add admin'}
        </Button>
      </form>
      {result && (
        <div className="mt-5">
          <NewPassword {...result} />
        </div>
      )}
    </section>
  )
}

function ChangePassword({ onChanged }: { onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    if (f.get('next') !== f.get('again')) return setError('The new passwords don’t match')
    setBusy(true)
    setError('')
    setDone(false)
    try {
      await postJson('password', { current: f.get('current'), next: f.get('next') })
      setDone(true)
      form.reset()
      onChanged()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="eyebrow border-b-2 border-ink pb-2">Your password</h2>
      <form onSubmit={submit} className="mt-4 max-w-sm space-y-4">
        <Field label="Current password">
          <input name="current" type="password" required autoComplete="current-password" className={input} />
        </Field>
        <Field label="New password" hint="At least 10 characters. A few words strung together works well.">
          <input name="next" type="password" required minLength={10} autoComplete="new-password" className={input} />
        </Field>
        <Field label="New password again">
          <input name="again" type="password" required autoComplete="new-password" className={input} />
        </Field>
        <ErrorNote>{error}</ErrorNote>
        {done && <Notice>Password changed.</Notice>}
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Change password'}
        </Button>
      </form>
    </section>
  )
}

export default function TeamAdmin({ me, onSignedOut, onChange }: { me: Me; onSignedOut: () => void; onChange: () => void }) {
  const { data, error, reload } = useLoad(() => getJson<AdminUser[]>('admins'), onSignedOut)
  const [reset, setReset] = useState<{ who: string; password: string } | null>(null)
  const [actionError, setActionError] = useState('')

  async function remove(a: AdminUser) {
    if (!confirm(`Remove ${a.name}? They’ll be signed out and can’t sign in again.`)) return
    setActionError('')
    try {
      await postJson('admin-remove', { id: a.id })
      reload()
    } catch (e) {
      setActionError((e as Error).message)
    }
  }

  async function resetPassword(a: AdminUser) {
    if (!confirm(`Give ${a.name} a new temporary password? Their current one stops working.`)) return
    setActionError('')
    try {
      const { password } = await postJson<{ password: string }>('admin-reset', { id: a.id })
      setReset({ who: a.name, password })
    } catch (e) {
      setActionError((e as Error).message)
    }
  }

  return (
    <>
      <PageHead title="Team" sub="Everyone who can sign in here. Every admin can see and change everything." />
      <ErrorNote>{error || actionError}</ErrorNote>
      {reset && (
        <div className="mb-5">
          <NewPassword {...reset} />
        </div>
      )}
      <ul className="divide-y divide-line border-y-2 border-ink">
        {data?.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
            <div className="min-w-[12rem] flex-1">
              <div className="font-semibold">
                {a.name}
                {a.id === me.admin.id && <span className="ml-2 text-sm font-normal text-ink-soft">(you)</span>}
              </div>
              <div className="text-sm text-ink-soft">{a.email}</div>
              <div className="text-[13px] text-ink-soft">
                {a.last_login_at ? `Last signed in ${fmtWhen(a.last_login_at)}` : 'Hasn’t signed in yet'}
                {a.created_by_name ? ` · added by ${a.created_by_name}` : ''}
              </div>
            </div>
            {a.id !== me.admin.id && (
              <div className="flex gap-2">
                <Button kind="secondary" className="py-1.5 text-sm" onClick={() => resetPassword(a)}>
                  New password
                </Button>
                <Button kind="danger" className="py-1.5 text-sm" onClick={() => remove(a)}>
                  Remove
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <AddAdmin onAdded={reload} />
      <ChangePassword onChanged={onChange} />
    </>
  )
}
