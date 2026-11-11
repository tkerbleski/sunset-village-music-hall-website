import Image from 'next/image'

// The Sunset Village building with three storefronts, and the wordmark on its sign.
export function BuildingIllustration() {
  const star = 'M0 -14 L2 -2 L14 0 L2 2 L0 14 L-2 2 L-14 0 L-2 -2Z'
  return (
    <div className="relative leading-none">
      <svg
        viewBox="0 0 520 360"
        role="img"
        aria-label="Illustration of the Sunset Village building with several storefronts, one of them the music hall"
        className="block h-auto w-full"
      >
        <rect x="20" y="40" width="480" height="300" rx="10" className="fill-fog" />
        <rect x="20" y="30" width="480" height="76" rx="10" className="fill-paper stroke-ink" strokeWidth="3" />
        <rect x="44" y="124" width="200" height="194" rx="8" className="fill-sun stroke-ink" strokeWidth="4" />
        <rect x="72" y="186" width="144" height="132" rx="70" className="fill-ink" />
        <text x="144" y="160" textAnchor="middle" letterSpacing="3" fontSize="14" fontWeight="700" className="fill-ink font-label">
          MUSIC HALL
        </text>
        <rect x="266" y="124" width="102" height="194" rx="8" className="fill-teal stroke-ink" strokeWidth="4" />
        <rect x="290" y="210" width="54" height="108" className="fill-ink" />
        <rect x="390" y="124" width="86" height="194" rx="8" className="fill-pink stroke-ink" strokeWidth="4" />
        <rect x="410" y="210" width="46" height="108" className="fill-ink" />
        <rect x="0" y="336" width="520" height="8" rx="4" className="fill-mist" />
        <g transform="translate(486 14)" className="fill-yellow">
          <path d={star} />
          <path d={star} transform="rotate(45) scale(.5)" />
        </g>
      </svg>
      <Image
        src="/brand/wordmark-on-light.svg"
        alt=""
        width={167}
        height={72}
        unoptimized
        className="absolute top-[18.9%] left-1/2 h-[16%] w-auto max-w-none -translate-1/2"
      />
    </div>
  )
}
