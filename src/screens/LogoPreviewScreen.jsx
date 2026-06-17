import { useNavigate } from 'react-router-dom'

// ── 8 logo variants — all 100×100 viewBox, teal gradient rounded-square + ECG ──

function LogoV1({ size = 80 }) {
  // V1: Trefoil — 3 overlapping circles (closest to original reference)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#62e6c0" />
          <stop offset="100%" stopColor="#12a870" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g1)" />
      {/* 3 overlapping circles — trefoil lotus */}
      <circle cx="50" cy="40" r="16" fill="rgba(255,255,255,0.22)" />
      <circle cx="38" cy="60" r="16" fill="rgba(255,255,255,0.22)" />
      <circle cx="62" cy="60" r="16" fill="rgba(255,255,255,0.22)" />
      {/* center glow where 3 overlap */}
      <circle cx="50" cy="53" r="8" fill="rgba(255,255,255,0.18)" />
      {/* ECG line */}
      <polyline points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoV2({ size = 80 }) {
  // V2: 6-petal mandala — classic lotus, each petal a filled ellipse rotated around center
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#5ee0ba" />
          <stop offset="100%" stopColor="#0e9c6e" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g2)" />
      {/* 6 petals — each ellipse at cx=50, cy=37 rotated around (50,53) */}
      {[0,60,120,180,240,300].map(d => (
        <ellipse key={d} cx="50" cy="37" rx="7" ry="14"
          fill="rgba(255,255,255,0.26)"
          transform={`rotate(${d}, 50, 53)`} />
      ))}
      <circle cx="50" cy="53" r="5" fill="rgba(255,255,255,0.35)" />
      {/* ECG line */}
      <polyline points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoV3({ size = 80 }) {
  // V3: Droplet petals — 5 teardrop shapes pointing INWARD to center
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#58ddb6" />
          <stop offset="100%" stopColor="#148a62" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g3)" />
      {/* 5 droplets — circle at top, pointed tip at bottom toward center */}
      {[0,72,144,216,288].map(d => (
        <g key={d} transform={`rotate(${d}, 50, 52)`}>
          <path d="M50,36 C55,36 59,42 59,50 C59,58 54,62 50,62 C46,62 41,58 41,50 C41,42 45,36 50,36Z"
            fill="rgba(255,255,255,0.22)" />
        </g>
      ))}
      <circle cx="50" cy="52" r="5" fill="rgba(255,255,255,0.32)" />
      <polyline points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoV4({ size = 80 }) {
  // V4: Water-lily flat view — overlapping arcs like petals seen from above
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#6ae8c4" />
          <stop offset="100%" stopColor="#10a066" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g4)" />
      {/* 4 large petals — wide arcs */}
      {[0,45,90,135].map(d => (
        <ellipse key={d} cx="50" cy="36" rx="10" ry="17"
          fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="3"
          transform={`rotate(${d}, 50, 52)`} />
      ))}
      {/* inner filled bloom */}
      <circle cx="50" cy="52" r="12" fill="rgba(255,255,255,0.18)" />
      <circle cx="50" cy="52" r="6" fill="rgba(255,255,255,0.28)" />
      <polyline points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoV5({ size = 80 }) {
  // V5: Bubble cluster — 4 circles arranged like lotus from top (original-feel + variation)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g5" x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%"  stopColor="#70eaca" />
          <stop offset="100%" stopColor="#0d9460" />
        </linearGradient>
        <filter id="blur5">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g5)" />
      {/* Soft background glow for bloom */}
      <circle cx="50" cy="54" r="22" fill="rgba(255,255,255,0.12)" filter="url(#blur5)" />
      {/* 4 overlapping blobs — top, left, right, center-bottom */}
      <circle cx="50" cy="39" r="13" fill="rgba(255,255,255,0.24)" />
      <circle cx="37" cy="57" r="13" fill="rgba(255,255,255,0.24)" />
      <circle cx="63" cy="57" r="13" fill="rgba(255,255,255,0.24)" />
      <circle cx="50" cy="60" r="9"  fill="rgba(255,255,255,0.20)" />
      <polyline points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoV6({ size = 80 }) {
  // V6: Sacred geometry — 6 circles forming "flower of life" partial pattern
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#56d9b0" />
          <stop offset="100%" stopColor="#118c62" />
        </linearGradient>
        <clipPath id="roundsq6">
          <rect width="100" height="100" rx="22" />
        </clipPath>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g6)" />
      {/* Flower of life: center circle + 6 surrounding at r=11 from center */}
      <g clipPath="url(#roundsq6)" opacity="0.95">
        <circle cx="50" cy="52" r="11" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" />
        {[0,60,120,180,240,300].map(d => {
          const rad = (d * Math.PI) / 180
          const cx = 50 + 11 * Math.sin(rad)
          const cy = 52 - 11 * Math.cos(rad)
          return <circle key={d} cx={cx} cy={cy} r="11" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />
        })}
        <circle cx="50" cy="52" r="5" fill="rgba(255,255,255,0.35)" />
      </g>
      <polyline points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoV7({ size = 80 }) {
  // V7: Bold filled lotus — opaque white petals, more visible, vibrant
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g7" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%"  stopColor="#60e6bf" />
          <stop offset="100%" stopColor="#0e9263" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g7)" />
      {/* 3 main inner petals (front layer, more visible) */}
      {[0,120,240].map(d => (
        <ellipse key={d} cx="50" cy="38" rx="8.5" ry="15"
          fill="rgba(255,255,255,0.32)"
          transform={`rotate(${d}, 50, 53)`} />
      ))}
      {/* 3 back petals offset */}
      {[60,180,300].map(d => (
        <ellipse key={d} cx="50" cy="38" rx="7" ry="13"
          fill="rgba(255,255,255,0.20)"
          transform={`rotate(${d}, 50, 53)`} />
      ))}
      <circle cx="50" cy="53" r="5.5" fill="rgba(255,255,255,0.40)" />
      <polyline points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoV8({ size = 80 }) {
  // V8: Glowing 3-circle trefoil with soft blur glow — premium feel
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g8" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#68e8c6" />
          <stop offset="100%" stopColor="#109a68" />
        </linearGradient>
        <filter id="glow8">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="sq8"><rect width="100" height="100" rx="22" /></clipPath>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#g8)" />
      <g clipPath="url(#sq8)">
        {/* glowing trefoil */}
        <circle cx="50" cy="39" r="15" fill="rgba(255,255,255,0.28)" filter="url(#glow8)" />
        <circle cx="37" cy="59" r="15" fill="rgba(255,255,255,0.28)" filter="url(#glow8)" />
        <circle cx="63" cy="59" r="15" fill="rgba(255,255,255,0.28)" filter="url(#glow8)" />
        {/* crisp center */}
        <circle cx="50" cy="53" r="7" fill="rgba(255,255,255,0.30)" />
      </g>
      <polyline points="8,50 20,50 26,34 34,66 41,37 48,61 55,50 92,50"
        fill="none" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const VARIANTS = [
  { id: 1, Comp: LogoV1, name: 'Trefoil Bloom',      desc: '3 overlapping circles — matches original reference most closely' },
  { id: 2, Comp: LogoV2, name: '6-Petal Mandala',    desc: 'Classic lotus: 6 filled ellipse petals radiating from center' },
  { id: 3, Comp: LogoV3, name: 'Droplet Petals',     desc: '5 water-droplet shapes pointing to center, soft floral feel' },
  { id: 4, Comp: LogoV4, name: 'Water Lily Outline', desc: '4 overlapping ellipse rings + filled inner circle, elegant line art' },
  { id: 5, Comp: LogoV5, name: 'Bubble Cluster',     desc: '4 blobs (top + 2 sides + base) with soft glow — closest to original image style' },
  { id: 6, Comp: LogoV6, name: 'Sacred Geometry',    desc: 'Flower of Life pattern: 7 circles in hexagonal arrangement' },
  { id: 7, Comp: LogoV7, name: 'Double-Layer Lotus', desc: '6 inner + 6 outer petals, layered for depth and richness' },
  { id: 8, Comp: LogoV8, name: 'Glowing Trefoil',    desc: '3-circle trefoil with CSS blur glow — premium, soft, medical feel' },
]

export default function LogoPreviewScreen() {
  const nav = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', background: '#f0fdf9',
      padding: '0 0 40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #14b8a6, #059669)',
        padding: '24px 20px 20px',
        color: 'white',
      }}>
        <button onClick={() => nav(-1)} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
          borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, marginBottom: 16,
        }}>← Back</button>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Logo Variants</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
          K — LOTUS PULSE · 8 designs to choose from
        </div>
        <div style={{
          marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 10,
          padding: '10px 14px', fontSize: 12, opacity: 0.9,
        }}>
          Tap any card to see the logo larger · Tell me the number of your favourite
        </div>
      </div>

      {/* Reference strip */}
      <div style={{
        margin: '16px 16px 0', background: 'white', borderRadius: 14,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}>
        <div style={{ fontSize: 12, color: '#64748b', flex: 1 }}>
          <strong style={{ color: '#0f172a' }}>Your brand reference:</strong><br />
          Lotus petals (chakra bloom) + pulse line · Teal gradient rounded-square icon
        </div>
        <div style={{
          background: 'linear-gradient(135deg,#62e6c0,#12a870)',
          borderRadius: 10, width: 44, height: 44, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>🪷</div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 14, padding: '16px 16px 0',
      }}>
        {VARIANTS.map(({ id, Comp, name, desc }) => (
          <div key={id} style={{
            background: 'white', borderRadius: 18,
            padding: '20px 14px 16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            cursor: 'default',
          }}>
            {/* Large logo */}
            <Comp size={100} />

            {/* Badge + name */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  background: 'linear-gradient(135deg,#14b8a6,#059669)',
                  color: 'white', borderRadius: 6, padding: '2px 7px',
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                }}>#{id}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{name}</span>
              </div>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.4 }}>{desc}</p>
            </div>

            {/* Small row of logo at different sizes */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 4, borderTop: '1px solid #f1f5f9', width: '100%', justifyContent: 'center' }}>
              <Comp size={24} />
              <Comp size={36} />
              <Comp size={48} />
              <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>24 · 36 · 48px</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{
        margin: '20px 16px 0', background: 'linear-gradient(135deg,#0f172a,#1e293b)',
        borderRadius: 16, padding: '18px 20px', color: 'white',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Pick your favourite</div>
        <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
          Tell me the variant number (#1–#8) and I'll replace the logo across the entire app and redeploy.
        </div>
      </div>
    </div>
  )
}
