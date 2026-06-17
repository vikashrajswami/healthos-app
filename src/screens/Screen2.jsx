import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/userProfile'

function MiniChart({ points, color = '#14b8a6', label }) {
  const W = 240, H = 60, pad = 8
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (W - 2 * pad))
  const min = Math.min(...points) - 1
  const max = Math.max(...points) + 1
  const ys = points.map(v => H - pad - ((v - min) / (max - min)) * (H - 2 * pad))
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
        <defs>
          <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={`${d} L${xs[xs.length-1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`} fill={`url(#g-${color.replace('#','')})`}/>
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="3.5" fill={color}/>
        ))}
      </svg>
    </div>
  )
}

export default function Screen2() {
  const nav     = useNavigate()
  const profile = getProfile()

  if (!profile?.quizDone) {
    return (
      <div className="screen">
        <button className="nav-back">← Your BioAge Trends</button>
        <div className="empty-state">
          <div className="es-icon">📈</div>
          <div className="es-title">No trend data yet</div>
          <div className="es-body">
            Complete your BioAge quiz on the Home screen to get your baseline score.
            Upload lab reports over time and AROGYOS will automatically track how your biological age changes.
          </div>
          <button className="es-cta" onClick={() => nav('/')}>Go to Home →</button>
        </div>
      </div>
    )
  }

  const { bioage, actualAge } = profile
  const delta = actualAge - bioage

  // Demo trend: simulate 6 months of improvement
  const months  = ['Jan','Feb','Mar','Apr','May','Jun']
  const bioTrend = [bioage + 2, bioage + 1.5, bioage + 1, bioage + 0.5, bioage, bioage - 0.5].map(Math.round)
  const actTrend = months.map(() => actualAge)

  const BIOMARKERS = [
    { name: 'hsCRP',    unit: 'mg/L', trend: [3.1, 2.8, 2.4, 2.0, 1.6, 1.2], good: 'down', ref: '<1.0', flag: 'warn' },
    { name: 'HbA1c',   unit: '%',    trend: [5.9, 5.8, 5.7, 5.6, 5.5, 5.3],  good: 'down', ref: '<5.7', flag: 'ok' },
    { name: 'LDL',     unit: 'mg/dL',trend: [142, 138, 130, 124, 118, 112],   good: 'down', ref: '<100',flag: 'warn' },
    { name: 'Vitamin D',unit:'ng/mL', trend: [18, 22, 26, 32, 38, 44],        good: 'up',   ref: '40–60',flag: 'ok' },
  ]

  return (
    <div className="screen">
      <button className="nav-back">← Your BioAge Trends</button>

      <div className="ring-wrap">
        <div className="ring">
          <div className="n">{bioage}</div>
          <div className="s">
            BIOAGE · {delta > 0 ? `${delta}Y YOUNGER` : delta < 0 ? `${Math.abs(delta)}Y OLDER` : 'ON TRACK'}
          </div>
        </div>
      </div>

      <div className="stat-row">
        <div className="s"><div className="v">—</div><div className="l">Recovery Score</div></div>
        <div className="s"><div className="v">—</div><div className="l">Avg Sleep</div></div>
        <div className="s"><div className="v">—</div><div className="l">Active Days</div></div>
      </div>
      <div style={{textAlign:'center',fontSize:11,color:'#94a3b8',marginTop:4,marginBottom:8}}>
        Connect a wearable to see live recovery, sleep & activity data
      </div>

      {/* BioAge trend chart */}
      <div className="card-title">BioAge Trend · Last 6 Months</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>
          Sample data · Upload lab reports to see your real trend
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {months.map((m, i) => (
            <div key={m} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#14b8a6' }}>{bioTrend[i]}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{m}</div>
            </div>
          ))}
        </div>
        <MiniChart points={bioTrend} color="#14b8a6"/>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 3, background: '#14b8a6', borderRadius: 2 }}/>
            <span style={{ fontSize: 11, color: '#64748b' }}>BioAge</span>
          </div>
          {delta !== 0 && (
            <div style={{ fontSize: 11, color: delta > 0 ? '#0d9488' : '#e08c3b' }}>
              {delta > 0 ? `↓ ${delta} yrs younger than actual` : `↑ ${Math.abs(delta)} yrs older than actual`}
            </div>
          )}
        </div>
      </div>

      {/* Biomarker trends */}
      <div className="card-title" style={{marginTop:6}}>Biomarker Trends · Sample Data</div>
      <div style={{ background: '#fff8f0', border: '1px solid #fed7aa', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: '#92400e' }}>
        📊 Upload your blood test to replace this with real biomarker data
      </div>

      {BIOMARKERS.map(bm => (
        <div key={bm.name} className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{bm.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Ref: {bm.ref} {bm.unit}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: bm.flag === 'ok' ? '#0d9488' : '#d97706' }}>
                {bm.trend[bm.trend.length - 1]}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{bm.unit} now</div>
            </div>
          </div>
          <MiniChart points={bm.trend} color={bm.flag === 'ok' ? '#14b8a6' : '#e0b341'}/>
          <div style={{ fontSize: 11, color: bm.flag === 'ok' ? '#0d9488' : '#d97706', marginTop: 6, fontWeight: 600 }}>
            {bm.good === 'down'
              ? `↓ ${bm.trend[0] - bm.trend[bm.trend.length-1]} ${bm.unit} improvement over 6 months`
              : `↑ +${bm.trend[bm.trend.length-1] - bm.trend[0]} ${bm.unit} improvement over 6 months`}
          </div>
        </div>
      ))}

      <div className="card">
        <div className="coach-badge">Health Guide</div>
        <div className="insight-text">
          Your quiz-based BioAge estimate is <b>{bioage}</b> vs your actual age of <b>{actualAge}</b>.
          Upload your blood test report to get a biomarker-precise score and a personalised action plan.
        </div>
        <span className="coach-link" onClick={() => nav('/upload')}>→ Upload a lab report</span>
      </div>

      <button className="share-bioage-btn" onClick={() => nav('/share')}>Share My BioAge Card</button>
    </div>
  )
}
