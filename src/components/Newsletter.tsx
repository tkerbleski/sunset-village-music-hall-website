import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitJson } from '../lib/submit'

export default function Newsletter() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = String(new FormData(form).get('email') ?? '')
    setState('sending')
    try {
      await submitJson('/api/newsletter', { email })
      setState('sent')
      form.reset()
    } catch {
      setState('error')
    }
  }

  return (
    <section
      id="newsletter"
      className="relative scroll-mt-16 overflow-hidden bg-dusk py-20 text-bg sm:py-24"
    >
      <img
        src="/photos/ocean-beach-sunset.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-ink/40" />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <h2 className="font-display text-4xl font-semibold sm:text-5xl">
          Hear what&rsquo;s happening
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-bg/80">
          Show announcements, new shop openings, and neighborhood happenings at
          the Village. No spam — just the good stuff, occasionally.
        </p>
        {state === 'sent' ? (
          <p className="mt-8 font-medium text-gold">
            You&rsquo;re on the list. See you at the Village. 🌅
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-full border border-bg/30 bg-ink/40 px-5 py-3 text-bg placeholder:text-bg/50 outline-none backdrop-blur transition focus:border-gold"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="rounded-full bg-gold px-6 py-3 font-medium text-ink transition hover:bg-bg disabled:opacity-60"
            >
              {state === 'sending' ? 'Joining…' : 'Join the newsletter'}
            </button>
          </form>
        )}
        {state === 'error' && (
          <p className="mt-3 text-sm text-gold">
            That didn&rsquo;t go through — please try again.
          </p>
        )}
      </div>
    </section>
  )
}
