'use client'

// Add / edit one shop or space: name, status, description, weekly hours,
// links, and how its card looks on the homepage.

import { useState, type FormEvent } from 'react'
import { postJson, type Setup } from '@/lib/admin/api'
import { hourLines, type DayHours, type Tenant } from '@/lib/data/tenants'
import { fillClass, type Fill } from '@/components/brand/categories'
import { ErrorNote, FormField, Panel } from '@/components/internal/internal-ui'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { ImagePicker } from './image-picker'

export type ShopDraft = Partial<Tenant>
type Week = NonNullable<Tenant['hours']>

// Shown Monday-first, stored Sunday-first (index 0 = Sunday).
const DAYS = [
  [1, 'Monday'],
  [2, 'Tuesday'],
  [3, 'Wednesday'],
  [4, 'Thursday'],
  [5, 'Friday'],
  [6, 'Saturday'],
  [0, 'Sunday'],
] as const

const CLOSED_WEEK: Week = [null, null, null, null, null, null, null]

const FILL_LABEL: Record<Fill, string> = {
  fog: 'Fog (plain)',
  sun: 'Sun orange',
  yellow: 'Yellow',
  teal: 'Teal',
  pink: 'Pink',
}

function HoursEditor({ value, onChange }: { value: Week; onChange: (w: Week) => void }) {
  const setDay = (i: number, h: DayHours) => {
    const w = [...value] as Week
    w[i] = h
    onChange(w)
  }
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-ui font-bold">Regular hours</span>
      <div className="divide-y divide-border rounded-md border border-line bg-field">
        {DAYS.map(([i, name]) => {
          const h = value[i]
          const id = `day-${i}`
          return (
            <div key={i} className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
              <span className="w-24 font-semibold">{name}</span>
              <span className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={!!h}
                  onCheckedChange={(v) => setDay(i, v === true ? { open: '11:00', close: '18:00' } : null)}
                />
                <Label htmlFor={id} className="font-normal">
                  Open
                </Label>
              </span>
              {h ? (
                <span className="flex items-center gap-2">
                  <Input
                    density="compact"
                    type="time"
                    aria-label={`${name} opens`}
                    value={h.open}
                    onChange={(e) => setDay(i, { ...h, open: e.target.value })}
                    className="min-h-9 w-auto py-1"
                  />
                  <span className="text-meta text-ink-2">to</span>
                  <Input
                    density="compact"
                    type="time"
                    aria-label={`${name} closes`}
                    value={h.close}
                    onChange={(e) => setDay(i, { ...h, close: e.target.value })}
                    className="min-h-9 w-auto py-1"
                  />
                </span>
              ) : (
                <span className="text-meta text-ink-2">Closed</span>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-meta text-ink-2">
        {value.some(Boolean)
          ? `Shows on the site as: ${hourLines(value).join('; ')}`
          : 'No regular hours. The note below shows instead.'}
      </p>
    </div>
  )
}

export function ShopForm({ initial, setup, onDone }: { initial: ShopDraft; setup: Setup; onDone: () => void }) {
  const [d, setD] = useState<ShopDraft>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k: keyof Tenant) => (e: { target: { value: string } }) => setD({ ...d, [k]: e.target.value })

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await postJson('tenant-save', d)
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  async function remove() {
    if (!d.id || !confirm(`Remove “${d.name}” from the site?`)) return
    setBusy(true)
    try {
      await postJson('tenant-delete', { id: d.id })
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <Panel title="About">
        <div className="flex flex-col gap-4">
          <FormField label="Name" htmlFor="shop-name">
            <Input density="compact" id="shop-name" required value={d.name ?? ''} onChange={set('name')} />
          </FormField>
          <div className="flex flex-col gap-1.5">
            <span id="shop-status" className="text-ui font-bold">
              Status
            </span>
            <ToggleGroup
              type="single"
              size="sm"
              spacing={2}
              aria-labelledby="shop-status"
              value={d.status ?? 'open'}
              onValueChange={(v) => v && setD({ ...d, status: v as Tenant['status'] })}
            >
              <ToggleGroupItem value="open">Open</ToggleGroupItem>
              <ToggleGroupItem value="coming-soon">Coming soon</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Type (optional)" htmlFor="shop-type" hint="Small line on the card, e.g. “Gift shop”.">
              <Input density="compact" id="shop-type" value={d.type ?? ''} onChange={set('type')} />
            </FormField>
            <FormField label="Unit (optional)" htmlFor="shop-unit" hint="e.g. “Unit 2”.">
              <Input density="compact" id="shop-unit" value={d.unit ?? ''} onChange={set('unit')} />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="shop-blurb" hint="A sentence or two about what they are.">
            <Textarea density="compact" id="shop-blurb" required rows={3} value={d.blurb ?? ''} onChange={set('blurb')} />
          </FormField>
        </div>
      </Panel>

      <Panel title="Hours">
        <div className="flex flex-col gap-4">
          <HoursEditor value={d.hours ?? CLOSED_WEEK} onChange={(hours) => setD({ ...d, hours })} />
          <FormField
            label="Hours note (optional)"
            htmlFor="shop-hoursNote"
            hint="Shown when there are no regular hours, e.g. “Open during events” or “Opens October 12”."
          >
            <Input density="compact" id="shop-hoursNote" value={d.hoursNote ?? ''} onChange={set('hoursNote')} />
          </FormField>
        </div>
      </Panel>

      <Panel title="Links">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Website (optional)" htmlFor="shop-link" hint="Their own site.">
              <Input density="compact" id="shop-link" value={d.link ?? ''} onChange={set('link')} placeholder="https://" />
            </FormField>
            <FormField label="Link text (optional)" htmlFor="shop-linkLabel" hint="e.g. “sunsetvariety.com”">
              <Input density="compact" id="shop-linkLabel" value={d.linkLabel ?? ''} onChange={set('linkLabel')} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Instagram (optional)" htmlFor="shop-instagram" hint="Link to their Instagram profile.">
              <Input
                density="compact"
                id="shop-instagram"
                value={d.instagram ?? ''}
                onChange={set('instagram')}
                placeholder="https://instagram.com/…"
              />
            </FormField>
          </div>
        </div>
      </Panel>

      <Panel title="Card on the homepage">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Card color" htmlFor="shop-fill" hint="Fills the photo area when there’s no photo.">
              <Select value={d.fill ?? 'teal'} onValueChange={(v) => setD({ ...d, fill: v as Fill })}>
                <SelectTrigger id="shop-fill" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(fillClass) as Fill[]).map((f) => (
                    <SelectItem key={f} value={f}>
                      <span className={cn('mr-2 inline-block size-4 rounded-full border border-ink align-middle', fillClass[f])} aria-hidden />
                      {FILL_LABEL[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <ImagePicker
            label="Storefront photo (optional)"
            noun="photo"
            value={d.photo}
            onChange={(photo) => setD({ ...d, photo })}
            enabled={setup.uploads}
            name={d.name ?? ''}
            hint="Fills the card’s photo area. A landscape photo works best."
          />
        </div>
      </Panel>

      <ErrorNote>{error}</ErrorNote>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={busy}>
          Cancel
        </Button>
        {d.id && (
          <Button type="button" variant="destructive" size="sm" onClick={remove} disabled={busy} className="ml-auto">
            Remove from site
          </Button>
        )}
      </div>
    </form>
  )
}
