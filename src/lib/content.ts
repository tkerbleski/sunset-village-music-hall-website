// Events and shops come from the database via /api/content (edited in
// /admin). The files in src/data/ are the fallback: used in local dev, where
// there is no API, and if the API is unreachable.

import { useSyncExternalStore } from 'react'
import { events as bundledEvents, type VillageEvent } from '../data/events'
import { tenants as bundledTenants, type Tenant } from '../data/tenants'

export interface Content {
  ready: boolean
  events: VillageEvent[]
  tenants: Tenant[]
}

let state: Content = { ready: false, events: [], tenants: [] }
const listeners = new Set<() => void>()
let started = false

function load() {
  if (started) return
  started = true
  fetch('/api/content')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((d: { events: VillageEvent[]; tenants: Tenant[] }) => {
      state = { ready: true, events: d.events, tenants: d.tenants }
    })
    .catch(() => {
      state = { ready: true, events: bundledEvents, tenants: bundledTenants }
    })
    .finally(() => listeners.forEach((l) => l()))
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  load()
  return () => listeners.delete(l)
}

export const useContent = () => useSyncExternalStore(subscribe, () => state)
