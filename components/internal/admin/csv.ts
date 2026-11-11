// Spreadsheet downloads for admin lists.

/** Quote every cell so commas, quotes and newlines survive. */
export const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`

export function downloadCsv(filename: string, rows: string[][], quote = true) {
  const text = rows.map((r) => (quote ? r.map(csvCell) : r).join(',')).join('\n')
  const blob = new Blob([text], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 0)
}
