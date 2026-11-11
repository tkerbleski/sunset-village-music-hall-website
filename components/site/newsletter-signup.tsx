'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { postJson } from '@/lib/post'

/** Built-in signup (subscribers live in this site's database). Sits on the sun band. */
export function NewsletterSignup() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [email, setEmail] = useState('')

  if (state === 'done') {
    return (
      <p role="status" className="flex-[1_1_440px] self-end text-heading-md">
        You’re on the list. See you in the fog.
      </p>
    )
  }

  return (
    <form
      className="flex flex-[1_1_440px] flex-col gap-2.5 self-end"
      onSubmit={async (e) => {
        e.preventDefault()
        setState('sending')
        const ok = await postJson('/api/newsletter', { email })
        setState(ok ? 'done' : 'error')
      }}
    >
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-wrap gap-3">
        <Input
          id="nl-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-16 flex-[1_1_220px] rounded-full px-6 text-lg"
        />
        <Button type="submit" size="xl" disabled={state === 'sending'}>
          {state === 'sending' ? 'Signing up…' : 'Sign up'}
        </Button>
      </div>
      {state === 'error' && (
        <p role="alert" className="font-semibold">
          That didn’t go through. Check the address and try again.
        </p>
      )}
    </form>
  )
}
