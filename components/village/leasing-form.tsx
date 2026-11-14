'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkle } from '@/components/brand/sparkle'
import { Field, fieldGrid } from '@/components/site/form-field'
import { postJson } from '@/lib/post'

const SPACES = ['Retail', 'Office', 'Studio', 'Not sure yet']

const schema = z.object({
  name: z.string().trim().min(1, 'Tell us your name.'),
  org: z.string().trim().optional(),
  email: z.email('Enter an email address we can reply to.'),
  phone: z.string().trim().optional(),
  space: z.string().min(1, 'Choose the kind of space.'),
  message: z.string().trim().min(1, 'Tell us a little about your business.'),
})
type Values = z.input<typeof schema>

/** Leasing inquiry. Goes through /api/inquiry, so it lands in /admin → Bookings and Tom's inbox. */
export function LeasingForm() {
  const [status, setStatus] = useState<'idle' | 'error' | 'sent'>('idle')
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', org: '', email: '', phone: '', space: '', message: '' },
  })

  const a11y = (k: keyof Values) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `l-${k}-error` : undefined,
  })

  if (status === 'sent') {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-4">
        <Sparkle size={56} className="text-sun" />
        <h3 className="text-heading-2xl">Thanks, we got it.</h3>
        <p className="max-w-120 text-lede">We’ll be in touch about the space soon.</p>
        <Button
          variant="outline"
          onClick={() => {
            reset()
            setStatus('idle')
          }}
        >
          Send another
        </Button>
      </div>
    )
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(async ({ space, ...v }) => {
        setStatus('idle')
        const ok = await postJson('/api/inquiry', { ...v, kind: 'leasing', type: `Leasing · ${space}` })
        setStatus(ok ? 'sent' : 'error')
      })}
    >
      <p className="text-ink-2">Fields marked * are required.</p>

      <div className={fieldGrid}>
        <Field id="l-name" label="Your name *" error={errors.name?.message}>
          <Input id="l-name" autoComplete="name" {...register('name')} {...a11y('name')} />
        </Field>
        <Field id="l-org" label="Business name">
          <Input id="l-org" autoComplete="organization" {...register('org')} />
        </Field>
        <Field id="l-email" label="Email *" error={errors.email?.message}>
          <Input id="l-email" type="email" autoComplete="email" {...register('email')} {...a11y('email')} />
        </Field>
        <Field id="l-phone" label="Phone">
          <Input id="l-phone" type="tel" autoComplete="tel" {...register('phone')} />
        </Field>
      </div>

      <Field id="l-space" label="What kind of space? *" error={errors.space?.message}>
        <Controller
          control={control}
          name="space"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="l-space" onBlur={field.onBlur} {...a11y('space')}>
                <SelectValue placeholder="Choose one" />
              </SelectTrigger>
              <SelectContent>
                {SPACES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field id="l-message" label="Tell us about your business *" error={errors.message?.message}>
        <Textarea
          id="l-message"
          rows={4}
          placeholder="What you do, how much room you need, when you’d like to move in."
          {...register('message')}
          {...a11y('message')}
        />
      </Field>

      {status === 'error' && <Alert variant="destructive">Something went wrong sending your message. Please try again.</Alert>}

      <Button type="submit" variant="sun" size="lg" className="self-end" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send →'}
      </Button>
    </form>
  )
}
