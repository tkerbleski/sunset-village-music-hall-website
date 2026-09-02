import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { submitJson } from '../lib/submit'

const TYPES = [
  'Private event — Music Hall',
  'Community space request',
  'Studio / office interest',
  'General question',
]

export default function BookingForm() {
  const [type, setType] = useState(TYPES[0])
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // "Inquire" buttons in the Spaces section preselect the request type.
  useEffect(() => {
    const onPreselect = (e: Event) => {
      const t = (e as CustomEvent<string>).detail
      if (TYPES.includes(t)) setType(t)
      setState('idle')
    }
    window.addEventListener('preselect-booking', onPreselect)
    return () => window.removeEventListener('preselect-booking', onPreselect)
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState('sending')
    try {
      await submitJson('/api/inquiry', { ...data, type })
      setState('sent')
      form.reset()
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <section id="book" className="scroll-mt-16 bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="font-display text-4xl font-semibold">Request sent</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Thanks — we got your request and will follow up with availability
            and next steps.
          </p>
          <button
            onClick={() => setState('idle')}
            className="mt-8 rounded-full border border-line px-6 py-3 font-medium transition hover:bg-bg"
          >
            Send another request
          </button>
        </div>
      </section>
    )
  }

  const input =
    'w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink outline-none transition focus:border-sunset'

  return (
    <section id="book" className="scroll-mt-16 bg-card py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-5">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-sunset">
          Book the Village
        </p>
        <h2 className="font-display text-4xl font-semibold sm:text-5xl">
          Start a request
        </h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Planning a private event, a workshop, a show — or curious about a
          studio? Tell us a little and we&rsquo;ll get back to you. No detail
          is too rough.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">What are you looking to do?</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input name="name" required className={input} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input name="email" type="email" required className={input} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Preferred date</label>
              <input name="date" type="date" className={input} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Expected headcount</label>
              <input name="headcount" inputMode="numeric" placeholder="e.g. 40" className={input} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tell us about it *</label>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="What's the occasion? Music, food, timing, anything you already know."
              className={input}
            />
          </div>
          {state === 'error' && (
            <p className="text-sm text-sunset-deep">
              Something went wrong sending your request. Please try again, or
              email us directly.
            </p>
          )}
          <button
            type="submit"
            disabled={state === 'sending'}
            className="w-full rounded-full bg-sunset px-6 py-3.5 font-medium text-white transition hover:bg-sunset-deep disabled:opacity-60 sm:w-auto"
          >
            {state === 'sending' ? 'Sending…' : 'Send request'}
          </button>
        </form>
      </div>
    </section>
  )
}
