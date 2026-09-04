import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { submitJson } from '../lib/submit'

const STORAGE_KEY = 'sv-newsletter-popup'

const remember = (v: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, v)
  } catch {
    /* private mode etc. */
  }
}

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    let seen = null
    try {
      seen = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* if storage is unavailable, show it; nothing to remember with */
    }
    if (seen) return
    const t = setTimeout(() => setOpen(true), 2200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function dismiss() {
    remember('dismissed')
    setOpen(false)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') ?? '')
    setState('sending')
    try {
      await submitJson('/api/newsletter', { email })
      setState('sent')
      remember('joined')
      setTimeout(() => setOpen(false), 1600)
    } catch {
      setState('error')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-5"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Newsletter signup"
        className="w-full max-w-md border-2 border-ink bg-bg p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">Join the newsletter</h2>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="-mr-1 -mt-1 p-1 text-xl leading-none text-ink-soft transition hover:text-ink"
          >
            ×
          </button>
        </div>
        {state === 'sent' ? (
          <p className="mt-3 font-display text-xl text-sunset-deep">You're on the list.</p>
        ) : (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Shows, openings, and other things happening at 46th and Judah.
            </p>
            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2.5">
              <label htmlFor="popup-email" className="sr-only">
                Email address
              </label>
              <input
                id="popup-email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="w-full rounded-[3px] border border-line bg-card px-4 py-3 text-ink transition focus:border-sunset"
              />
              <button
                type="submit"
                disabled={state === 'sending'}
                className="rounded-[3px] bg-sunset px-5 py-3 font-semibold text-white transition hover:bg-sunset-deep disabled:opacity-60"
              >
                {state === 'sending' ? 'Joining…' : 'Join the list'}
              </button>
              {state === 'error' && (
                <p className="text-sm font-medium text-sunset-deep">
                  That didn't go through. Try again.
                </p>
              )}
              <button
                type="button"
                onClick={dismiss}
                className="self-start text-sm text-ink-soft underline-offset-2 hover:underline"
              >
                Not now
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
