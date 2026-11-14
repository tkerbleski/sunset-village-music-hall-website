'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkle } from '@/components/brand/sparkle'
import { Field, fieldGrid as grid } from '@/components/site/form-field'
import { site } from '@/lib/data/site'
import { postJson } from '@/lib/post'

const EVENT_TYPES = [
  'Concert or show',
  'DJ or dance night',
  'Theater or performance',
  'Private party',
  'Fundraiser or benefit',
  'Workshop or class',
  'Rehearsal',
  'Community meeting',
  'Something else',
]
const NEEDS = ['Sound engineer', 'Lighting', 'Bar service', 'Projector', 'Ticketing', 'Chairs & tables']

const schema = z.object({
  name: z.string().trim().min(1, 'Tell us your name.'),
  org: z.string().trim().optional(),
  email: z.email('Enter an email address we can reply to.'),
  phone: z.string().trim().optional(),
  type: z.string().min(1, 'Choose the kind of event.'),
  headcount: z.coerce.number<string>('Roughly how many people?').int().min(1, 'Roughly how many people?'),
  date: z.string().min(1, 'Pick a preferred date.'),
  backupDate: z.string().optional(),
  needs: z.array(z.string()),
  message: z.string().trim().min(1, 'Tell us a little about it.'),
})
type Values = z.input<typeof schema>

export function BookingForm() {
  const [status, setStatus] = useState<'idle' | 'error' | 'sent'>('idle')
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', org: '', email: '', phone: '', type: '', date: '', backupDate: '', needs: [], message: '' },
  })

  const a11y = (k: keyof Values) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `b-${k}-error` : undefined,
  })

  if (status === 'sent') {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <Sparkle size={72} className="text-sun" />
        <h2 className="text-heading-2xl">Request sent. Nice.</h2>
        <p className="max-w-120 text-lede">
          We’ll be in touch within {site.replyTime}. Keep an eye on your inbox, and maybe the fog forecast.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/events">See upcoming shows</Link>
          </Button>
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
      </div>
    )
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(async (v) => {
        setStatus('idle')
        const ok = await postJson('/api/inquiry', { ...v, headcount: String(v.headcount) })
        setStatus(ok ? 'sent' : 'error')
      })}
    >
      <div>
        <h2 className="mb-1.5 text-heading-form">Request a date</h2>
        <p className="text-ink-2">Fields marked * are required.</p>
      </div>

      <div className={grid}>
        <Field id="b-name" label="Your name *" error={errors.name?.message}>
          <Input id="b-name" autoComplete="name" {...register('name')} {...a11y('name')} />
        </Field>
        <Field id="b-org" label="Band, org or company">
          <Input id="b-org" autoComplete="organization" {...register('org')} />
        </Field>
        <Field id="b-email" label="Email *" error={errors.email?.message}>
          <Input id="b-email" type="email" autoComplete="email" {...register('email')} {...a11y('email')} />
        </Field>
        <Field id="b-phone" label="Phone">
          <Input id="b-phone" type="tel" autoComplete="tel" {...register('phone')} />
        </Field>
      </div>

      <div className={grid}>
        <Field id="b-type" label="What kind of event? *" error={errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="b-type" onBlur={field.onBlur} {...a11y('type')}>
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field id="b-headcount" label="Expected guests *" error={errors.headcount?.message}>
          <Input id="b-headcount" type="number" min={1} inputMode="numeric" placeholder={`Room holds ${site.room.capacity.toLowerCase()}`} {...register('headcount')} {...a11y('headcount')} />
        </Field>
        <Field id="b-date" label="Preferred date *" error={errors.date?.message}>
          <Input id="b-date" type="date" {...register('date')} {...a11y('date')} />
        </Field>
        <Field id="b-backupDate" label="Backup date">
          <Input id="b-backupDate" type="date" {...register('backupDate')} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2.5 text-ui font-bold">What will you need?</legend>
        <Controller
          control={control}
          name="needs"
          render={({ field }) => (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5">
              {NEEDS.map((n) => {
                const id = `need-${n.replace(/\W+/g, '-').toLowerCase()}`
                const on = field.value.includes(n)
                return (
                  <label
                    key={n}
                    htmlFor={id}
                    className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-md border-2 border-ink bg-field px-3.5 py-2 text-base font-semibold"
                  >
                    <Checkbox
                      id={id}
                      checked={on}
                      onCheckedChange={(c) => field.onChange(c ? [...field.value, n] : field.value.filter((x) => x !== n))}
                    />
                    {n}
                  </label>
                )
              })}
            </div>
          )}
        />
      </fieldset>

      <Field id="b-message" label="Tell us about it *" error={errors.message?.message}>
        <Textarea
          id="b-message"
          rows={5}
          placeholder="The vibe, the lineup, the timing, anything we should know."
          {...register('message')}
          {...a11y('message')}
        />
      </Field>

      {status === 'error' && (
        <Alert variant="destructive">
          Something went wrong sending your request. Please try again in a moment.
        </Alert>
      )}

      <Button type="submit" variant="sun" size="lg" className="self-end" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send request →'}
      </Button>
    </form>
  )
}
