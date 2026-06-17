// HealthOS logo — teal gradient rounded square + ECG pulse line + lotus bloom
// Usage: <Logo size={36} /> — no text, icon only

export default function Logo({ size = 36, style }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="hos-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#58ddb8"/>
          <stop offset="100%" stopColor="#11a87c"/>
        </linearGradient>
      </defs>

      {/* Rounded-square background */}
      <rect width="100" height="100" rx="22" fill="url(#hos-grad)"/>

      {/* Lotus bloom — two translucent ellipses */}
      <ellipse cx="50" cy="63" rx="29" ry="16" fill="rgba(255,255,255,0.11)"/>
      <ellipse cx="50" cy="60" rx="19" ry="10" fill="rgba(255,255,255,0.09)"/>

      {/* ECG / heartbeat line */}
      <polyline
        points="10,50 26,50 32,32 40,68 47,37 54,63 60,50 90,50"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
