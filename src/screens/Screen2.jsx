import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, saveProfile } from '../lib/userProfile'
import { getAllReports, getBiomarkerTrends, getCurrentValues } from '../lib/reportStore'
import { calcBioAgeFromBiomarkers, INDIAN_REFS } from '../lib/bioage'

// ── SVG Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#14b8a6', w = 88, h = 32 }) {
  const vals = data.map(d => parseFloat(d.value)).filter(v => !isNaN(v))
  if (vals.length < 2) return <div style={{ width: w, height: h }} />
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * (w - 8) + 4
    const y = h - 4 - ((v - min) / range) * (h - 8)
    return [x, y]
  })
  const ptStr  = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lx, ly] = pts[pts.length - 1]
  const [fx, fy] = pts[0]
  const areaBot = h - 1
  const areaPts = `${fx.toFixed(1)},${areaBot} ${ptStr} ${lx.toFixed(1)},${areaBot}`

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={ptStr} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx.toFixed(1)} cy={ly.toFixed(1)} r={3} fill={color} stroke="#fff" strokeWidth={1.5} />
    </svg>
  )
}

// ── BioAge History Line Chart ─────────────────────────────────────────────────
function BioAgeChart({ data }) {
  // data: [{date, bioage, actualAge}]
  if (!data || data.length < 2) return null
  const W = 300, H = 100, PAD = { t: 12, r: 8, b: 28, l: 32 }
  const bios = data.map(d => d.bioage)
  const ages = data.map(d => d.actualAge)
  const allVals = [...bios, ...ages]
  const minY = Math.min(...allVals) - 2
  const maxY = Math.max(...allVals) + 2
  const range = maxY - minY || 1

  function toXY(idx, val) {
    const x = PAD.l + (idx / (data.length - 1)) * (W - PAD.l - PAD.r)
    const y = PAD.t + (1 - (val - minY) / range) * (H - PAD.t - PAD.b)
    return [x, y]
  }

  const bioLine = data.map((d, i) => toXY(i, d.bioage))
  const ageLine = data.map((d, i) => toXY(i, d.actualAge))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* Y grid lines */}
      {[0, 0.5, 1].map(pct => {
        const y = PAD.t + pct * (H - PAD.t - PAD.b)
        const val = Math.round(maxY - pct * range)
        return (
          <g key={pct}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#e2e8f0" strokeWidth={0.8} />
            <text x={PAD.l - 4} y={y + 4} fontSize={8} fill="#94a3b8" textAnchor="end">{val}</text>
          </g>
        )
      })}
      {/* Actual age line (dashed) */}
      <polyline points={ageLine.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4,3" strokeLinecap="round" />
      {/* BioAge line */}
      <polyline points={bioLine.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="#14b8a6" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points */}
      {bioLine.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#14b8a6" stroke="#fff" strokeWidth={1.5} />
      ))}
      {/* X axis dates */}
      {data.map((d, i) => {
        const [x] = toXY(i, 0)
        const label = new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        return (
          <text key={i} x={x} y={H - 8} fontSize={8} fill="#94a3b8" textAnchor="middle">{label}</text>
        )
      })}
      {/* Legend */}
      <g transform={`translate(${W - PAD.r - 80}, ${PAD.t})`}>
        <line x1={0} y1={5} x2={12} y2={5} stroke="#14b8a6" strokeWidth={2} />
        <text x={16} y={9} fontSize={8} fill="#14b8a6" fontWeight="600">BioAge</text>
        <line x1={0} y1={17} x2={12} y2={17} stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4,3" />
        <text x={16} y={21} fontSize={8} fill="#94a3b8">Actual Age</text>
      </g>
    </svg>
  )
}

// ── Category grade pill ───────────────────────────────────────────────────────
function GradeBadge({ grade, color }) {
  const bg = color + '18'
  return (
    <span style={{ background: bg, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, letterSpacing: 0.3 }}>
      {grade}
    </span>
  )
}

// ── Single biomarker trend row ────────────────────────────────────────────────
function BiomarkerRow({ canonical, trendData, currentVal }) {
  const ref = INDIAN_REFS[canonical]
  if (!ref || !currentVal) return null

  const val = parseFloat(currentVal.value)
  if (isNaN(val)) return null

  function getDelta(r, v) {
    if (r.reverse) {
      const sorted = [...r.ranges].sort((a, b) => (b.min ?? 0) - (a.min ?? 0))
      for (const row of sorted) if (v >= row.min) return row
    } else {
      for (const row of r.ranges) if (v <= row.max) return row
    }
    return ref.ranges[ref.ranges.length - 1]
  }

  const match = getDelta(ref, val)
  const trend = trendData[canonical] || []

  const changeText = () => {
    if (trend.length < 2) return null
    const prev = parseFloat(trend[trend.length - 2]?.value)
    const curr = parseFloat(trend[trend.length - 1]?.value)
    if (isNaN(prev) || isNaN(curr)) return null
    const diff = curr - prev
    if (Math.abs(diff) < 0.01) return { txt: 'Stable', color: '#64748b' }
    const pct = Math.abs(Math.round((diff / prev) * 100))
    return diff < 0
      ? (ref.reverse ? { txt: `↓ ${pct}% ▲`, color: '#dc2626' } : { txt: `↓ ${pct}%`, color: '#16a34a' })
      : (ref.reverse ? { txt: `↑ ${pct}%`, color: '#16a34a' } : { txt: `↑ ${pct}% ▲`, color: '#dc2626' })
  }

  const chg = changeText()

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{ref.label}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          {val} {ref.unit}
          {chg && <span style={{ color: chg.color, marginLeft: 8, fontWeight: 600 }}>{chg.txt}</span>}
        </div>
      </div>
      {trend.length >= 2 && (
        <Sparkline data={trend} color={match.color} w={72} h={28} />
      )}
      <GradeBadge grade={match.grade} color={match.color} />
    </div>
  )
}

// ── Biomarker category section ────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Inflammation',    icon: '🔥', color: '#dc2626', markers: ['hsCRP', 'CRP', 'ESR', 'Uric Acid'] },
  { name: 'Metabolic',       icon: '🍬', color: '#d97706', markers: ['HbA1c', 'Fasting Glucose', 'Triglycerides'] },
  { name: 'Cardiovascular',  icon: '❤️', color: '#e11d48', markers: ['LDL', 'HDL', 'ApoB'] },
  { name: 'Liver',           icon: '🟤', color: '#b45309', markers: ['ALT', 'AST'] },
  { name: 'Kidney',          icon: '🔵', color: '#0284c7', markers: ['Creatinine', 'eGFR'] },
  { name: 'Nutrients',       icon: '💊', color: '#7c3aed', markers: ['Vitamin D', 'B12', 'Folate', 'Hemoglobin'] },
  { name: 'Hormones',        icon: '⚡', color: '#0891b2', markers: ['TSH', 'Testosterone'] },
]

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function Screen2() {
  const nav      = useNavigate()
  const profile  = getProfile()
  const [tab, setTab] = useState('overview')

  const reports = useMemo(() => getAllReports(), [])
  const trends  = useMemo(() => getBiomarkerTrends(), [])
  const current = useMemo(() => getCurrentValues(), [])

  // Compute biomarker-based BioAge from latest report
  const bioAgeResult = useMemo(() => {
    if (!reports.length || !profile?.actualAge) return null
    const latest = reports[reports.length - 1]
    const result = calcBioAgeFromBiomarkers(profile.actualAge, latest.biomarkers || [])
    if (result && result.bioage) {
      // Update profile with biomarker-based BioAge
      const updated = { ...profile, bioage: result.bioage, bioageSource: 'biomarkers', bioageResult: result }
      saveProfile(updated)
    }
    return result
  }, [reports, profile?.actualAge])

  // Build BioAge history from all reports
  const bioAgeHistory = useMemo(() => {
    if (!profile?.actualAge || reports.length < 2) return []
    return reports
      .filter(r => r.biomarkers?.length > 0)
      .map(r => {
        const res = calcBioAgeFromBiomarkers(profile.actualAge, r.biomarkers)
        return res ? { date: r.date, bioage: res.bioage, actualAge: profile.actualAge } : null
      })
      .filter(Boolean)
  }, [reports, profile?.actualAge])

  const hasReports = reports.length > 0
  const hasTrends  = Object.keys(trends).length > 0

  // BioAge to display
  const displayBioAge   = bioAgeResult?.bioage ?? profile?.bioage
  const displayActual   = profile?.actualAge ?? '—'
  const bioageDelta     = displayActual && displayBioAge ? displayActual - displayBioAge : null
  const bioageSource    = bioAgeResult ? 'biomarkers' : 'quiz'

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
          <button className="es-cta" onClick={() => nav('/home')}>Go to Home →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <button className="nav-back">← Your BioAge Trends</button>

      {/* ── BioAge Ring ─────────────────────────────────────────────── */}
      <div className="ring-wrap">
        <div className="ring">
          <div className="n">{displayBioAge ?? '—'}</div>
          <div className="s">
            {bioageDelta > 0
              ? `${bioageDelta}Y YOUNGER`
              : bioageDelta < 0
              ? `${Math.abs(bioageDelta)}Y OLDER`
              : 'ON TRACK'}
          </div>
        </div>
      </div>

      {/* Source badge */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        {bioAgeResult ? (
          <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
            ✅ Biomarker-based · {bioAgeResult.markersUsed} markers · {bioAgeResult.confidence}% confidence
          </span>
        ) : (
          <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
            📝 Quiz estimate — upload lab report for precise BioAge
          </span>
        )}
      </div>

      {/* ── Stat Row ────────────────────────────────────────────────── */}
      <div className="stat-row">
        <div className="s">
          <div className="v">{displayActual}</div>
          <div className="l">Actual Age</div>
        </div>
        <div className="s">
          <div className="v">{displayBioAge ?? '—'}</div>
          <div className="l">BioAge</div>
        </div>
        <div className="s">
          <div className="v">{bioAgeResult?.score ?? '—'}{bioAgeResult ? '' : ''}</div>
          <div className="l">Health Score</div>
        </div>
      </div>

      {/* ── Tab selector ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
        {[
          { id: 'overview',    label: 'Overview' },
          { id: 'biomarkers',  label: 'Biomarkers' },
          { id: 'history',     label: 'History' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 700,
            border: 'none', borderRadius: 8, cursor: 'pointer',
            background: tab === t.id ? '#fff' : 'transparent',
            color: tab === t.id ? '#0f172a' : '#64748b',
            boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ─────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <>
          {/* BioAge interpretation card */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Your BioAge Baseline</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Biological Age</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#14b8a6', lineHeight: 1 }}>{displayBioAge ?? '—'}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{bioageSource === 'biomarkers' ? 'From lab biomarkers' : 'Quiz estimate'}</div>
              </div>
              <div style={{ width: 1, height: 52, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#64748b' }}>Actual Age</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{displayActual}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Calendar years</div>
              </div>
            </div>
            {bioageDelta !== null && (
              <div style={{ padding: '8px 12px', background: bioageDelta > 0 ? '#f0fdf4' : bioageDelta < 0 ? '#fff8f0' : '#f8fafc', borderRadius: 8, fontSize: 13, color: bioageDelta > 0 ? '#15803d' : bioageDelta < 0 ? '#92400e' : '#475569', fontWeight: 600 }}>
                {bioageDelta > 0
                  ? `🎉 You are ${bioageDelta} years biologically younger than your actual age`
                  : bioageDelta < 0
                  ? `⚠️ Your BioAge is ${Math.abs(bioageDelta)} years above actual — this is reversible with targeted interventions`
                  : '✓ Your BioAge matches your actual age — maintain your habits'}
              </div>
            )}
          </div>

          {/* Top insights from biomarker analysis */}
          {bioAgeResult?.insights?.length > 0 && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 10 }}>🎯 Biggest BioAge Drivers</div>
              {bioAgeResult.insights.slice(0, 4).map((ins, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: ins.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 16 }}>
                      {ins.delta > 2 ? '🔴' : ins.delta > 0 ? '🟡' : '🟢'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{ins.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{ins.insight}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ins.color }}>
                      {ins.delta > 0 ? '+' : ''}{ins.delta.toFixed(1)} yrs
                    </div>
                    <GradeBadge grade={ins.grade} color={ins.color} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload CTA if no reports */}
          {!hasReports && (
            <div className="card" style={{ marginBottom: 12, textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🧪</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Get your biomarker-precise BioAge
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
                Upload one blood test report and AROGYOS will calculate your real biological age using 20+ Indian-calibrated biomarkers.
              </div>
              <button onClick={() => nav('/upload')} style={{ padding: '12px 24px', background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Upload Lab Report →
              </button>
            </div>
          )}

          {/* AI coach card */}
          <div className="card">
            <div className="coach-badge">Health Guide</div>
            <div className="insight-text">
              {bioAgeResult
                ? <>Your lab-based BioAge is <b>{displayBioAge}</b> vs your actual age of <b>{displayActual}</b>.
                  {bioageDelta > 0
                    ? ` Great work — your biomarkers show ${bioageDelta} years of biological advantage. Keep your inflammation low and nutrient levels optimal.`
                    : ` The gap is reversible. Focus on your top-flagged biomarkers — reducing them can shift your BioAge by ${Math.abs(bioageDelta)+2}+ years within 90 days.`}
                </>
                : <>Your quiz-based BioAge estimate is <b>{displayBioAge}</b> vs your actual age of <b>{displayActual}</b>.
                  Upload your blood test to get a biomarker-precise score and a personalised action plan.</>}
            </div>
            <span className="coach-link" onClick={() => nav('/upload')}>→ Upload a lab report</span>
          </div>
        </>
      )}

      {/* ── Biomarkers Tab ───────────────────────────────────────────── */}
      {tab === 'biomarkers' && (
        <>
          {!hasTrends ? (
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔬</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No biomarker data yet</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
                Upload your blood test report and AROGYOS will extract all biomarkers automatically.
                After 2+ uploads, trend arrows and sparklines appear here.
              </div>
              <button onClick={() => nav('/upload')} style={{ padding: '12px 24px', background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Upload Lab Report →
              </button>
            </div>
          ) : (
            CATEGORIES.map(cat => {
              const catMarkers = cat.markers.filter(m => current[m])
              if (!catMarkers.length) return null
              return (
                <div key={cat.name} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{cat.name}</div>
                  </div>
                  {catMarkers.map(m => (
                    <BiomarkerRow key={m} canonical={m} trendData={trends} currentVal={current[m]} />
                  ))}
                </div>
              )
            })
          )}
        </>
      )}

      {/* ── History Tab ──────────────────────────────────────────────── */}
      {tab === 'history' && (
        <>
          {bioAgeHistory.length >= 2 ? (
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>BioAge Over Time</div>
              <BioAgeChart data={bioAgeHistory} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {bioAgeHistory.map((d, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
                    <div style={{ color: '#94a3b8' }}>{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    <div style={{ fontWeight: 800, color: '#14b8a6', fontSize: 16 }}>{d.bioage}</div>
                    <div style={{ color: '#64748b' }}>BioAge</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📈</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                {reports.length === 0 ? 'No reports yet' : 'Need 2+ reports to show trend'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
                {reports.length === 0
                  ? 'Upload your first blood test report to start tracking.'
                  : `You have ${reports.length} report. Upload another in 90 days to see how your BioAge changes over time.`}
              </div>
              <button onClick={() => nav('/upload')} style={{ padding: '12px 24px', background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Upload Lab Report →
              </button>
            </div>
          )}

          {/* Report history list */}
          {reports.length > 0 && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-title" style={{ marginBottom: 10 }}>Report History</div>
              {[...reports].reverse().map((r, i) => {
                const res = r.biomarkers?.length ? calcBioAgeFromBiomarkers(profile?.actualAge, r.biomarkers) : null
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < reports.length - 1 ? '1px solid #f1f5f9' : 'none', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🧬</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.name || 'Lab Report'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {r.biomarkers?.length ? ` · ${r.biomarkers.length} biomarkers` : ''}
                      </div>
                    </div>
                    {res && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#14b8a6' }}>{res.bioage}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>BioAge</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <button className="share-bioage-btn" onClick={() => nav('/share')}>Share My BioAge Card</button>
    </div>
  )
}
