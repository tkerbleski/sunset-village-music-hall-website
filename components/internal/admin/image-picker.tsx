'use client'

// Upload a photo (event flyer, shop storefront). Shrinks it in the browser,
// sends it to the `upload` action and hands back the public URL.

import { useId, useState } from 'react'
import { postJson } from '@/lib/admin/api'
import { prepareImage } from '@/lib/admin/image'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ErrorNote } from '@/components/internal/internal-ui'
import { cn } from '@/lib/utils'

export function ImagePicker({
  label,
  noun,
  value,
  onChange,
  enabled,
  name,
  hint,
}: {
  label: string
  /** "flyer", "photo" — used in the button labels. */
  noun: string
  value?: string
  onChange: (url: string | undefined) => void
  enabled: boolean
  /** Used for the stored file name. */
  name: string
  hint?: string
}) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const img = await prepareImage(file)
      const { url } = await postJson<{ url: string }>('upload', { ...img, name: name || noun })
      onChange(url)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={enabled ? id : undefined}>{label}</Label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded blob URL, any host
        <img src={value} alt="" className="max-h-64 w-fit max-w-full rounded-md border border-border" />
      )}
      {enabled ? (
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={id}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), busy && 'pointer-events-none opacity-50')}
          >
            {busy ? 'Uploading…' : value ? `Replace ${noun}` : `Upload a ${noun}`}
          </label>
          <input
            id={id}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
              Remove {noun}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-meta text-ink-2">Image uploads aren’t set up yet.</p>
      )}
      <ErrorNote>{error}</ErrorNote>
      {hint && <p className="text-meta text-ink-2">{hint}</p>}
    </div>
  )
}
