// AROGYOS logo — Double-Layer Lotus (6 petals: 3 inner + 3 outer) + ECG pulse line
export default function Logo({ size = 36, style }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="hos-grad" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%"  stopColor="#60e6bf" />
          <stop offset="100%" stopColor="#0e9263" />
        </linearGradient>
      </defs>

      {/* Rounded-square background */}
      <rect width="100" height="100" rx="22" fill="url(#hos-grad)" />

      {/* 3 back petals (offset 60°) */}
      {[60, 180, 300].map(d => (
        <ellipse key={d} cx="50" cy="38" rx="7" ry="13"
          fill="rgba(255,255,255,0.20)"
          transform={`rotate(${d}, 50, 53)`} />
      ))}

      {/* 3 front petals — brighter, larger */}
      {[0, 120, 240].map(d => (
        <ellipse key={d} cx="50" cy="38" rx="8.5" ry="15"
          fill="rgba(255,255,255,0.32)"
          transform={`rotate(${d}, 50, 53)`} />
      ))}

      {/* Bloom centre dot */}
      <circle cx="50" cy="53" r="5.5" fill="rgba(255,255,255,0.40)" />

      {/* ECG / heartbeat pulse line */}
      <polyline
        points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none"
        stroke="white"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
