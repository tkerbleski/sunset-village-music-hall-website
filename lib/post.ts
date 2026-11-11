/** POST JSON to one of the site's /api endpoints. Resolves true on 2xx. */
export async function postJson(url: string, body: unknown): Promise<boolean> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null)
  return Boolean(res?.ok)
}
