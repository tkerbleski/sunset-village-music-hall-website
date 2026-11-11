'use client'

// Team: who can sign in to this admin. Every admin sees and can do
// everything. New admins get a temporary password, shown here once, which
// they change after signing in.

import { useState, type FormEvent } from 'react'
import { getJson, postJson, type AdminUser } from '@/lib/admin/api'
import { fmtWhen, useLoad } from '@/lib/admin/use-load'
import { useAdmin } from '@/components/internal/admin-shell'
import { ErrorNote, FormField, Mono, PageHeader, Panel } from '@/components/internal/internal-ui'
import { ConfirmDialog } from '@/components/internal/admin/confirm-dialog'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function NewPassword({ who, password, emailed }: { who: string; password: string; emailed?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <Alert variant="warning" className="font-normal">
      <p className="font-semibold">Temporary password for {who}:</p>
      <p className="mt-2 font-mono text-heading-md break-all select-all">{password}</p>
      <p className="mt-2 text-meta">
        Send this to them by text or in person. It won’t be shown again.
        {emailed ? ' They’ve been emailed the sign-in link (not the password).' : ''} They can change it under Team once
        they sign in.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => navigator.clipboard?.writeText(password).then(() => setCopied(true))}
      >
        {copied ? 'Copied' : 'Copy password'}
      </Button>
    </Alert>
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
      const r = await postJson<{ password: string; emailed: boolean }>('admin-add', {
        name: f.get('name'),
        email: f.get('email'),
      })
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
    <Panel title="Add an admin">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="add-name">
            <Input density="compact" id="add-name" name="name" required />
          </FormField>
          <FormField label="Email" htmlFor="add-email">
            <Input density="compact" id="add-email" name="email" type="email" required />
          </FormField>
        </div>
        <ErrorNote>{error}</ErrorNote>
        <div>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? 'Adding…' : 'Add admin'}
          </Button>
        </div>
      </form>
      {result && (
        <div className="mt-5">
          <NewPassword {...result} />
        </div>
      )}
    </Panel>
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
    <Panel title="Your password">
      <form onSubmit={submit} className="flex max-w-sm flex-col gap-4">
        <FormField label="Current password" htmlFor="pw-current">
          <Input density="compact" id="pw-current" name="current" type="password" required autoComplete="current-password" />
        </FormField>
        <FormField
          label="New password"
          htmlFor="pw-next"
          hint="At least 10 characters. A few words strung together works well."
        >
          <Input
            density="compact"
            id="pw-next"
            name="next"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="New password again" htmlFor="pw-again">
          <Input density="compact" id="pw-again" name="again" type="password" required autoComplete="new-password" />
        </FormField>
        <ErrorNote>{error}</ErrorNote>
        {done && (
          <Alert variant="info" className="font-normal">
            Password changed.
          </Alert>
        )}
        <div>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? 'Saving…' : 'Change password'}
          </Button>
        </div>
      </form>
    </Panel>
  )
}

type Pending = { kind: 'remove' | 'reset'; admin: AdminUser } | null

export default function TeamPage() {
  const { me, refresh, signedOut } = useAdmin()
  const { data, error, reload } = useLoad(() => getJson<AdminUser[]>('admins'), signedOut)
  const [reset, setReset] = useState<{ who: string; password: string } | null>(null)
  const [actionError, setActionError] = useState('')
  const [pending, setPending] = useState<Pending>(null)

  async function remove(a: AdminUser) {
    setActionError('')
    try {
      await postJson('admin-remove', { id: a.id })
      reload()
    } catch (e) {
      setActionError((e as Error).message)
    }
  }

  async function resetPassword(a: AdminUser) {
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
      <PageHeader title="Team" description="Everyone who can sign in here. Every admin can see and change everything." />
      <ErrorNote>{error || actionError}</ErrorNote>
      <div className="flex flex-col gap-5">
        {reset && <NewPassword {...reset} />}
        {data && (
          <Panel title={`Admins (${data.length})`}>
            <ul className="divide-y divide-border">
              {data.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <div className="min-w-0 flex-1 basis-60">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{a.name}</span>
                      {a.id === me.admin.id && (
                        <Badge tone="muted" size="sm">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="break-all text-ink-2">{a.email}</div>
                    <Mono className="text-ink-2">
                      {a.last_login_at ? `Last signed in ${fmtWhen(a.last_login_at)}` : 'Hasn’t signed in yet'}
                      {a.created_by_name ? ` · added by ${a.created_by_name}` : ''}
                    </Mono>
                  </div>
                  {a.id !== me.admin.id && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPending({ kind: 'reset', admin: a })}>
                        New password
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setPending({ kind: 'remove', admin: a })}>
                        Remove
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        )}
        <AddAdmin onAdded={reload} />
        <ChangePassword onChanged={refresh} />
      </div>
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending?.kind === 'remove' ? `Remove ${pending.admin.name}?` : `New password for ${pending?.admin.name}?`}
        description={
          pending?.kind === 'remove'
            ? 'They’ll be signed out and can’t sign in again.'
            : 'They get a new temporary password. Their current one stops working.'
        }
        confirmLabel={pending?.kind === 'remove' ? 'Remove' : 'Make new password'}
        variant={pending?.kind === 'remove' ? 'destructive' : 'default'}
        onConfirm={() => {
          if (!pending) return
          if (pending.kind === 'remove') remove(pending.admin)
          else resetPassword(pending.admin)
        }}
      />
    </>
  )
}
