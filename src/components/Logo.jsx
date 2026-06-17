// HealthOS icon: teal gradient rounded-square + 6-petal lotus chakra bloom + ECG pulse line
// Based on "K — LOTUS PULSE" brand: lotus petals (chakra bloom) + pulse, grounding + vitality
export default function Logo({ size = 36, style }) {
  // Lotus bloom: 6 almond/vesica-piscis petals rotated 60° each around bloom center
  // Each petal points outward from (50,54), shaped as a leaf from center to tip
  const bloomCx = 50
  const bloomCy = 54
  const petalPath = 'M 50,54 C 43,48 43,37 50,33 C 57,37 57,48 50,54 Z'
  const petals = [0, 60, 120, 180, 240, 300]

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="hos-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#52ddb5" />
          <stop offset="100%" stopColor="#16a87c" />
        </linearGradient>
        <linearGradient id="hos-g2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#5fe3bb" />
          <stop offset="100%" stopColor="#0e9a6e" />
        </linearGradient>
      </defs>

      {/* Rounded-square background */}
      <rect width="100" height="100" rx="20" fill="url(#hos-g)" />
      <rect width="100" height="100" rx="20" fill="url(#hos-g2)" opacity="0.45" />

      {/* 6-petal lotus bloom — each petal is an almond shape rotated around bloom center */}
      <g opacity="1">
        {petals.map(deg => (
          <path
            key={deg}
            d={petalPath}
            fill="rgba(255,255,255,0.22)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.5"
            transform={`rotate(${deg}, ${bloomCx}, ${bloomCy})`}
          />
        ))}
        {/* Bloom center circle */}
        <circle cx={bloomCx} cy={bloomCy} r="4.5" fill="rgba(255,255,255,0.28)" />
      </g>

      {/* ECG / heartbeat pulse line — runs horizontally through icon center */}
      <polyline
        points="8,48 22,48 28,33 36,64 43,36 50,60 57,48 92,48"
        fill="none"
        stroke="white"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.96"
      />
    </svg>
  )
}
