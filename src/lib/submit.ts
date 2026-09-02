// POST JSON to an api endpoint. In local dev there is no backend, so we
// short-circuit to success after a beat (same pattern as the other sites).
export async function submitJson(url: string, body: unknown): Promise<void> {
  if (import.meta.env.DEV) {
    await new Promise((r) => setTimeout(r, 600))
    console.log(`[dev] would POST ${url}`, body)
    return
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
}
