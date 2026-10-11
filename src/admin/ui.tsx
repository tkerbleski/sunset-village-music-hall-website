// Small building blocks shared by the admin screens. Same palette as the
// public site, larger hit targets for phone use.

import { useEffect, useState, type ReactNode } from 'react'
import { SignedOut } from './api'

export const input =
  'w-full rounded-[4px] border border-line bg-card px-3.5 py-2.5 text-[16px] text-ink transition focus:border-sunset focus:outline-none'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[13px] leading-snug text-ink-soft">{hint}</span>}
    </label>
  )
}

type BtnKind = 'primary' | 'secondary' | 'danger' | 'quiet'
const btn: Record<BtnKind, string> = {
  primary: 'bg-sunset text-white hover:bg-sunset-deep',
  secondary: 'border border-ink bg-card text-ink hover:bg-bg',
  danger: 'border border-sunset-deep text-sunset-deep hover:bg-sunset-deep hover:text-white',
  quiet: 'text-ink-soft underline-offset-2 hover:text-ink hover:underline',
}

export function Button({
  kind = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: BtnKind }) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-[4px] px-4 py-2.5 text-[15px] font-semibold transition disabled:opacity-50 ${btn[kind]} ${className}`}
    />
  )
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-[4px] border border-sunset-deep bg-sunset/10 px-3.5 py-2.5 text-[15px] text-sunset-deep">
      {children}
    </p>
  )
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-[4px] border border-line bg-card px-3.5 py-2.5 text-[15px] text-ink-soft">{children}</p>
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-ink-soft">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/**
 * Load data for a screen. `reload` refetches; a SignedOut error bubbles up
 * through `onSignedOut` so the shell can show the login screen.
 */
export function useLoad<T>(fn: () => Promise<T>, onSignedOut: () => void) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    fn()
      .then((d) => live && (setData(d), setError('')))
      .catch((e) => {
        if (!live) return
        if (e instanceof SignedOut) onSignedOut()
        else setError(e.message)
      })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])
  return { data, error, reload: () => setTick((t) => t + 1), setData }
}

export const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
