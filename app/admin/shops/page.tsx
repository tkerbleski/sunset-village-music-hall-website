'use client'

// Shops & Spaces: the businesses listed on the homepage, their hours, and
// the order they appear in.

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getJson, postJson } from '@/lib/admin/api'
import { useLoad } from '@/lib/admin/use-load'
import { hourLines, type Tenant } from '@/lib/data/tenants'
import { fillClass } from '@/components/brand/categories'
import { useAdmin } from '@/components/internal/admin-shell'
import { EmptyState, ErrorNote, PageHeader, Panel } from '@/components/internal/internal-ui'
import { ShopForm, type ShopDraft } from '@/components/internal/admin/shop-form'
import { StatusPill } from '@/components/internal/status-pill'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ShopsPage() {
  const { me, signedOut } = useAdmin()
  const { data, error, reload, setData } = useLoad(() => getJson<Tenant[]>('tenants'), signedOut)
  const [editing, setEditing] = useState<ShopDraft | null>(null)
  const [moveError, setMoveError] = useState('')

  if (editing) {
    return (
      <>
        <PageHeader title={editing.id ? `Edit ${editing.name}` : 'New shop or space'} />
        <ShopForm
          initial={editing}
          setup={me}
          onDone={() => {
            setEditing(null)
            reload()
            window.scrollTo(0, 0)
          }}
        />
      </>
    )
  }

  async function move(i: number, by: -1 | 1) {
    if (!data) return
    const next = [...data]
    ;[next[i], next[i + by]] = [next[i + by], next[i]]
    setData(next)
    setMoveError('')
    try {
      await postJson('tenant-order', { ids: next.map((t) => t.id) })
    } catch (e) {
      setMoveError((e as Error).message)
      reload()
    }
  }

  return (
    <>
      <PageHeader
        title="Shops & Spaces"
        description="The businesses listed on the homepage, in this order."
        actions={
          <Button size="sm" onClick={() => setEditing({ status: 'open', fill: 'teal' })}>
            + Add shop
          </Button>
        }
      />
      <ErrorNote>{error || moveError}</ErrorNote>
      {data && data.length === 0 && <EmptyState>No shops listed yet.</EmptyState>}
      {data && data.length > 0 && (
        <Panel>
          <ul className="divide-y divide-border">
            {data.map((t, i) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5"
                    aria-label={`Move ${t.name} up`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5"
                    aria-label={`Move ${t.name} down`}
                    disabled={i === data.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ChevronDown />
                  </Button>
                </div>
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded blob URL, any host
                  <img src={t.photo} alt="" className="size-12 shrink-0 rounded-md border border-border object-cover" />
                ) : (
                  <span
                    aria-hidden
                    className={cn('size-12 shrink-0 rounded-md border border-border', fillClass[t.fill ?? 'teal'])}
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="min-w-0 flex-1 basis-48">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t.name}</span>
                      <StatusPill status={t.status}>{t.status === 'open' ? 'Open' : 'Coming soon'}</StatusPill>
                    </div>
                    <div className="text-meta text-ink-2">
                      {[t.type, t.unit, t.hours ? hourLines(t.hours).join('; ') : t.hoursNote].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditing(t)}>
                    Edit
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  )
}
