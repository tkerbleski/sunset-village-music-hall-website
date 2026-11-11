'use client'

import { useEffect, useState } from 'react'
import { SignedOut } from './api'

/**
 * Load data for a screen. `reload` refetches; a SignedOut error calls
 * `onSignedOut` so the shell can show the sign-in screen.
 */
export function useLoad<T>(fn: () => Promise<T>, onSignedOut: () => void) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    fn()
      .then((d) => {
        if (live) {
          setData(d)
          setError('')
        }
      })
      .catch((e) => {
        if (!live) return
        if (e instanceof SignedOut) onSignedOut()
        else setError(e.message)
      })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])
  return { data, error, reload: () => setTick((t) => t + 1), setData }
}

export const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
