export default function StatusTag({
  status,
  openNow,
}: {
  status: 'open' | 'coming-soon'
  openNow?: boolean
}) {
  if (openNow) {
    return (
      <span className="inline-block bg-sunset px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
        Open now
      </span>
    )
  }
  if (status === 'open') {
    return (
      <span className="inline-block bg-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bg">
        Open
      </span>
    )
  }
  return (
    <span className="inline-block border border-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
      Coming soon
    </span>
  )
}
