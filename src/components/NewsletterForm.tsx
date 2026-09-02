import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitJson } from '../lib/submit'

export default function NewsletterForm() {
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

  if (state === 'sent') {
    return <p className="font-display text-xl text-gold">You're on the list.</p>
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="your@email.com"
        className="flex-1 rounded-[3px] border border-bg/40 bg-transparent px-4 py-3 text-bg placeholder:text-bg/50 transition focus:border-gold"
      />
      <button
        type="submit"
        disabled={state === 'sending'}
        className="rounded-[3px] bg-gold px-5 py-3 font-semibold text-ink transition hover:bg-bg disabled:opacity-60"
      >
        {state === 'sending' ? 'Joining…' : 'Join the list'}
      </button>
      {state === 'error' && (
        <p className="text-sm text-gold sm:w-full">That didn't go through. Try again.</p>
      )}
    </form>
  )
}
