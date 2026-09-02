import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitJson } from '../lib/submit'

const TYPES = [
  'Private event',
  'Show or performance',
  'Workshop or class',
  'Something else',
]

export default function InquiryForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState('sending')
    try {
      await submitJson('/api/inquiry', data)
      setState('sent')
      form.reset()
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="border-2 border-ink bg-card p-8 text-center">
        <p className="font-display text-2xl font-semibold">Got it.</p>
        <p className="mt-2 text-ink-soft">
          We read every inquiry and will get back to you about dates and details.
        </p>
        <button
          onClick={() => setState('idle')}
          className="mt-6 rounded-[3px] border border-ink px-5 py-2.5 font-medium transition hover:bg-bg"
        >
          Send another
        </button>
      </div>
    )
  }

  const input =
    'w-full rounded-[3px] border border-line bg-card px-4 py-3 text-ink transition focus:border-sunset'
  const label = 'mb-1 block text-sm font-semibold'

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="inq-type" className={label}>
          What kind of thing?
        </label>
        <select id="inq-type" name="type" className={input}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-name" className={label}>
            Name
          </label>
          <input id="inq-name" name="name" required className={input} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="inq-email" className={label}>
            Email
          </label>
          <input id="inq-email" name="email" type="email" required className={input} autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-date" className={label}>
            Date, if you have one
          </label>
          <input id="inq-date" name="date" type="date" className={input} />
        </div>
        <div>
          <label htmlFor="inq-headcount" className={label}>
            Rough headcount
          </label>
          <input id="inq-headcount" name="headcount" inputMode="numeric" placeholder="e.g. 50" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="inq-message" className={label}>
          What do you have in mind?
        </label>
        <textarea
          id="inq-message"
          name="message"
          required
          rows={4}
          placeholder="A show, a party, a class, a screening. Whatever it is, a few sentences is plenty."
          className={input}
        />
      </div>
      {state === 'error' && (
        <p className="text-sm font-medium text-sunset-deep">
          Something went wrong. Try again in a minute.
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="rounded-[3px] bg-ink px-6 py-3 font-semibold text-bg transition hover:bg-dusk disabled:opacity-60"
      >
        {state === 'sending' ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  )
}
