// Illustrated Outer Sunset street grid with a sparkle pin at the hall. The
// design's accepted fallback until a styled static map is set up. Colors are
// palette tokens via currentColor-style classes.
export function MapIllustration() {
  const rows = [40, 100, 160, 220]
  const cols = [70, 170, 270, 370, 470]
  return (
    <svg
      viewBox="0 0 600 260"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Map of the Outer Sunset street grid, with the hall on Judah St near Ocean Beach"
      className="block size-full"
    >
      <rect width="600" height="260" className="fill-map" />
      <rect x="520" width="80" height="260" className="fill-teal" />
      <rect x="500" width="20" height="260" className="fill-sand" />
      <g className="stroke-paper" strokeWidth="10">
        {rows.map((y) => (
          <line key={`r${y}`} x1="0" y1={y} x2="500" y2={y} />
        ))}
        {cols.map((x) => (
          <line key={`c${x}`} x1={x} y1="0" x2={x} y2="260" />
        ))}
      </g>
      <g transform="translate(320 130)">
        <path d="M0 -30 L4 -4 L30 0 L4 4 L0 30 L-4 4 L-30 0 L-4 -4Z" className="fill-sun stroke-ink" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -15 L2.5 -2.5 L15 0 L2.5 2.5 L0 15 L-2.5 2.5 L-15 0 L-2.5 -2.5Z" className="fill-ink" transform="rotate(45)" />
      </g>
    </svg>
  )
}
