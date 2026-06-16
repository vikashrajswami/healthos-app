import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllReports, deleteReport, getBiomarkerTrends } from '../lib/reportStore'
import { getProfile } from '../lib/userProfile'

// ── Biomarker category groupings ─────────────────────────────────────────────
const BM_CATS = {
  'Inflammation':   { color: '#dc2626', bg: '#fef2f2', icon: '🔥', keys: ['hscrp', 'hs-crp', 'crp', 'esr', 'ldh', 'ferritin'] },
  'Cardiovascular': { color: '#e11d48', bg: '#fff1f2', icon: '🫀', keys: ['ldl', 'hdl', 'triglycerides', 'total cholesterol', 'cholesterol', 'vldl', 'apob', 'non-hdl'] },
  'Blood Sugar':    { color: '#d97706', bg: '#fffbeb', icon: '🍬', keys: ['hba1c', 'fasting glucose', 'fasting blood sugar', 'fbs', 'blood glucose', 'insulin', 'homa-ir'] },
  'Hormones':       { color: '#7c3aed', bg: '#f5f3ff', icon: '⚡', keys: ['testosterone', 'dhea', 'tsh', 't4', 't3', 'cortisol', 'lh', 'fsh', 'estradiol', 'prolactin'] },
  'Nutrients':      { color: '#16a34a', bg: '#f0fdf4', icon: '🌿', keys: ['vitamin d', '25-oh', 'vitamin b12', 'b12', 'folate', 'folic acid', 'iron', 'serum iron', 'tibc', 'transferrin'] },
  'Organ Health':   { color: '#0891b2', bg: '#ecfeff', icon: '🫘', keys: ['alt', 'ast', 'creatinine', 'egfr', 'uric acid', 'bilirubin', 'alkaline phosphatase', 'ggt', 'bun', 'urea'] },
  'Blood Count':    { color: '#64748b', bg: '#f8fafc', icon: '🩸', keys: ['hemoglobin', 'hb', 'wbc', 'rbc', 'platelets', 'mcv', 'mch', 'mchc', 'neutrophil', 'lymphocyte', 'hematocrit'] },
}

function catFor(name) {
  const n = name.toLowerCase()
  for (const [cat, meta] of Object.entries(BM_CATS)) {
    if (meta.keys.some(k => n.includes(k))) return { cat, ...meta }
  }
  return { cat: 'Other', color: '#64748b', bg: '#f8fafc', icon: '📊' }
}

const STATUS_COLOR = { HIGH: '#dc2626', LOW: '#2563eb', BORDERLINE: '#d97706', NORMAL: '#16a34a' }
const STATUS_ICON  = { HIGH: '↑', LOW: '↓', BORDERLINE: '~', NORMAL: '✓' }

function trendDir(arr) {
  if (arr.length < 2) return null
  const first = arr[0].value, last = arr[arr.length - 1].value
  const pct = ((last - first) / Math.abs(first || 1)) * 100
  if (Math.abs(pct) < 3) return { dir: 'stable', label: 'Stable', color: '#64748b', icon: '→' }
  // For "good direction" we check status of latest
  const latestStatus = arr[arr.length - 1].status
  const improving = (latestStatus === 'NORMAL' && arr[0].status !== 'NORMAL')
    || (pct < 0 && ['HIGH', 'BORDERLINE'].includes(arr[0].status))
    || (pct > 0 && arr[0].status === 'LOW')
  if (improving) return { dir: 'improving', label: `↓ ${Math.abs(pct).toFixed(1)}% improving`, color: '#16a34a', icon: '↓' }
  return { dir: 'worsening', label: `↑ ${Math.abs(pct).toFixed(1)}% change`, color: '#dc2626', icon: '↑' }
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color, w = 140, h = 52 }) {
  if (!data || data.length === 0) return null
  if (data.length === 1) return (
    <div style={{ fontSize: 13, fontWeight: 800, color }}>{data[0].value}</div>
  )

  const values = data.map(d => d.value)
  const minV = Math.min(...values) * 0.9
  const maxV = Math.max(...values) * 1.1
  const range = (maxV - minV) || 1
  const pad = { x: 10, y: 8 }
  const cw = w - pad.x * 2, ch = h - pad.y * 2

  const pts = data.map((d, i) => ({
    x: pad.x + (i / (data.length - 1)) * cw,
    y: pad.y + ch - ((d.value - minV) / range) * ch,
    ...d,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${h} L ${pts[0].x.toFixed(1)} ${h} Z`
  const gradId = `sg${color.replace('#', '')}`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" fill={STATUS_COLOR[p.status] || color} stroke="#fff" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  )
}

// ── Tab: Records ──────────────────────────────────────────────────────────────
function RecordsTab({ reports, onDelete, onAdd }) {
  const [expanded, setExpanded] = useState(null)

  if (reports.length === 0) return (
    <div className="hv-empty">
      <div className="hv-empty-icon">📁</div>
      <div className="hv-empty-title">No reports yet</div>
      <div className="hv-empty-body">Upload your first lab report to start tracking your health journey. Every biomarker you add fills your BioAge score.</div>
      <button className="hv-empty-cta" onClick={onAdd}>+ Upload Your First Report</button>
    </div>
  )

  return (
    <div className="hv-records">
      {reports.map(r => {
        const flagged = (r.biomarkers || []).filter(b => b.status && b.status !== 'NORMAL')
        const isOpen  = expanded === r.id
        return (
          <div key={r.id} className="hv-report-card">
            <div className="hv-rc-header" onClick={() => setExpanded(isOpen ? null : r.id)}>
              <div className="hv-rc-left">
                <div className="hv-rc-icon">🧪</div>
                <div>
                  <div className="hv-rc-date">{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div className="hv-rc-name">{r.name || 'Lab Report'}</div>
                  <div className="hv-rc-meta">
                    {r.biomarkers?.length ? `${r.biomarkers.length} biomarkers` : 'No biomarkers extracted'}
                    {r.source && <span className="hv-source-badge">{r.source}</span>}
                  </div>
                </div>
              </div>
              <div className="hv-rc-right">
                {flagged.length > 0 && (
                  <span className="hv-flag-badge">{flagged.length} flagged</span>
                )}
                <span className="hv-chevron">{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>

            {flagged.length > 0 && !isOpen && (
              <div className="hv-rc-flags">
                {flagged.slice(0, 3).map(b => (
                  <span key={b.name} className="hv-flag-chip" style={{ color: STATUS_COLOR[b.status] || '#64748b', background: `${STATUS_COLOR[b.status]}14` }}>
                    {STATUS_ICON[b.status]} {b.name}: {b.value} {b.unit}
                  </span>
                ))}
                {flagged.length > 3 && <span className="hv-flag-more">+{flagged.length - 3} more</span>}
              </div>
            )}

            {isOpen && r.biomarkers?.length > 0 && (
              <div className="hv-bio-table">
                {r.biomarkers.map(b => (
                  <div key={b.name} className="hv-bio-row">
                    <div className="hv-bio-name">{b.name}</div>
                    <div className="hv-bio-val">{b.value}<span className="hv-bio-unit"> {b.unit}</span></div>
                    <div className="hv-bio-status" style={{ color: STATUS_COLOR[b.status] || '#94a3b8' }}>
                      {STATUS_ICON[b.status] || '·'} {b.status || '—'}
                    </div>
                    <div className="hv-bio-range">{b.normalRange || ''}</div>
                  </div>
                ))}
              </div>
            )}

            {isOpen && (
              <div className="hv-rc-actions">
                <button className="hv-del-btn" onClick={() => { onDelete(r.id) }}>🗑 Delete report</button>
              </div>
            )}
          </div>
        )
      })}

      <button className="hv-add-btn" onClick={onAdd}>+ Add New Report</button>
    </div>
  )
}

// ── Tab: Trends ───────────────────────────────────────────────────────────────
function TrendsTab({ trends }) {
  const grouped = useMemo(() => {
    const groups = {}
    Object.entries(trends).forEach(([name, arr]) => {
      const { cat, color, bg, icon } = catFor(name)
      if (!groups[cat]) groups[cat] = { color, bg, icon, markers: [] }
      groups[cat].markers.push({ name, arr })
    })
    return groups
  }, [trends])

  const hasAny = Object.keys(grouped).length > 0

  if (!hasAny) return (
    <div className="hv-empty">
      <div className="hv-empty-icon">📈</div>
      <div className="hv-empty-title">No trend data yet</div>
      <div className="hv-empty-body">Upload 2 or more lab reports from different dates. Each biomarker will then show a trend line — improving or declining over time.</div>
      <div className="hv-trend-guide">
        <div className="hv-tg-item"><span style={{ color: '#16a34a' }}>↓</span> Improving — moving toward normal range</div>
        <div className="hv-tg-item"><span style={{ color: '#dc2626' }}>↑</span> Worsening — moving away from normal</div>
        <div className="hv-tg-item"><span style={{ color: '#64748b' }}>→</span> Stable — less than 3% change</div>
      </div>
    </div>
  )

  return (
    <div className="hv-trends">
      {Object.entries(grouped).map(([cat, { color, bg, icon, markers }]) => (
        <div key={cat} className="hv-trend-group">
          <div className="hv-tg-header" style={{ background: bg, borderColor: `${color}44` }}>
            <span className="hv-tg-icon" style={{ color }}>{icon}</span>
            <span className="hv-tg-label" style={{ color }}>{cat}</span>
            <span className="hv-tg-count" style={{ color: `${color}99` }}>{markers.length} markers</span>
          </div>

          {markers.map(({ name, arr }) => {
            const trend    = trendDir(arr)
            const latest   = arr[arr.length - 1]
            const previous = arr.length > 1 ? arr[arr.length - 2] : null
            const hasMulti = arr.length > 1

            return (
              <div key={name} className="hv-trend-card">
                <div className="hv-tc-top">
                  <div className="hv-tc-left">
                    <div className="hv-tc-name">{name}</div>
                    <div className="hv-tc-val-row">
                      <span className="hv-tc-val" style={{ color: STATUS_COLOR[latest.status] || '#0f172a' }}>
                        {latest.value}
                      </span>
                      <span className="hv-tc-unit">{latest.unit}</span>
                      <span className="hv-tc-status" style={{ color: STATUS_COLOR[latest.status] || '#94a3b8' }}>
                        {STATUS_ICON[latest.status] || ''} {latest.status || ''}
                      </span>
                    </div>
                    {latest.normalRange && (
                      <div className="hv-tc-range">Normal: {latest.normalRange}</div>
                    )}
                    {previous && (
                      <div className="hv-tc-prev">
                        Prev: {previous.value} {previous.unit}
                        <span className="hv-tc-date-lbl"> ({new Date(previous.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</span>
                      </div>
                    )}
                  </div>

                  <div className="hv-tc-right">
                    {hasMulti && trend && (
                      <div className="hv-tc-trend-badge" style={{ background: `${trend.color}14`, color: trend.color }}>
                        {trend.label}
                      </div>
                    )}
                    <Sparkline data={arr} color={trend?.color || color} w={130} h={50} />
                    <div className="hv-tc-dates">
                      {arr.length > 1 && (
                        <>
                          <span>{new Date(arr[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span>{new Date(arr[arr.length - 1].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Tab: Doctor View ──────────────────────────────────────────────────────────
function DoctorTab({ reports, trends }) {
  const profile  = getProfile()
  const current  = getCurrentValues()
  const today    = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const [copied, setCopied] = useState(false)

  const flagged  = Object.entries(current).filter(([, v]) => v.status && v.status !== 'NORMAL')
  const normal   = Object.entries(current).filter(([, v]) => !v.status || v.status === 'NORMAL')

  function handlePrint() { window.print() }

  function handleCopy() {
    const lines = [
      `HealthOS Health Summary — ${today}`,
      profile?.name ? `Patient: ${profile.name}` : '',
      profile?.age  ? `Age: ${profile.age}${profile.quizDone ? ` | BioAge: ${profile.bioage}` : ''}` : '',
      '',
      '── FLAGGED BIOMARKERS ──',
      ...flagged.map(([name, v]) => `${name}: ${v.value} ${v.unit} [${v.status}] | Normal: ${v.normalRange}`),
      '',
      '── NORMAL RANGE ──',
      ...normal.map(([name, v]) => `${name}: ${v.value} ${v.unit} [NORMAL]`),
      '',
      `Total reports on file: ${reports.length}`,
      'Generated by HealthOS — for medical reference only. Consult a qualified physician before any treatment decisions.',
    ].filter(Boolean).join('\n')
    navigator.clipboard?.writeText(lines).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function handleWhatsApp() {
    const short = [
      `🏥 *HealthOS Health Summary*`,
      `📅 Date: ${today}`,
      profile?.name ? `👤 ${profile.name}, Age ${profile.age}${profile.quizDone ? `, BioAge ${profile.bioage}` : ''}` : '',
      '',
      flagged.length > 0 ? `*⚠️ Values outside range (${flagged.length}):*` : '',
      ...flagged.map(([name, v]) => `• ${name}: ${v.value} ${v.unit} [${v.status}]`),
      '',
      `✅ ${normal.length} biomarkers in normal range`,
      `📊 ${reports.length} lab report${reports.length !== 1 ? 's' : ''} on file`,
      '',
      '_For educational reference. Consult a qualified physician._',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(short)}`, '_blank')
  }

  const hasData = Object.keys(current).length > 0

  return (
    <div className="hv-doctor">
      {/* Share actions */}
      <div className="hv-doc-actions">
        <button className="hv-doc-btn hv-doc-print" onClick={handlePrint}>🖨️ Print / PDF</button>
        <button className="hv-doc-btn hv-doc-copy" onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy Summary'}
        </button>
        <button className="hv-doc-btn hv-doc-wa" onClick={handleWhatsApp}>💬 WhatsApp</button>
      </div>

      {/* Medical document */}
      <div className="hv-doc-paper" id="hv-print-area">
        {/* Header */}
        <div className="hv-dp-header">
          <div className="hv-dp-logo">🧬 HealthOS</div>
          <div className="hv-dp-subtitle">Personal Health Record</div>
          <div className="hv-dp-date">Generated: {today}</div>
        </div>

        {/* Patient info */}
        <div className="hv-dp-section">
          <div className="hv-dp-sec-title">Patient Information</div>
          <div className="hv-dp-info-grid">
            <div className="hv-dp-info-row"><span className="hv-dp-il">Name</span><span className="hv-dp-iv">{profile?.name || '—'}</span></div>
            <div className="hv-dp-info-row"><span className="hv-dp-il">Chronological Age</span><span className="hv-dp-iv">{profile?.age ? `${profile.age} years` : '—'}</span></div>
            {profile?.quizDone && <div className="hv-dp-info-row"><span className="hv-dp-il">Biological Age (est.)</span><span className="hv-dp-iv" style={{ color: '#0d9488', fontWeight: 800 }}>{profile.bioage} years</span></div>}
            <div className="hv-dp-info-row"><span className="hv-dp-il">Reports on file</span><span className="hv-dp-iv">{reports.length}</span></div>
            <div className="hv-dp-info-row"><span className="hv-dp-il">Biomarkers tracked</span><span className="hv-dp-iv">{Object.keys(current).length}</span></div>
            {reports.length > 0 && (
              <div className="hv-dp-info-row">
                <span className="hv-dp-il">Monitoring since</span>
                <span className="hv-dp-iv">{new Date(reports[reports.length - 1].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Flagged values */}
        {hasData ? (
          <>
            {flagged.length > 0 && (
              <div className="hv-dp-section">
                <div className="hv-dp-sec-title" style={{ color: '#dc2626' }}>⚠️ Values Outside Normal Range</div>
                <div className="hv-dp-disclaimer">For clinical review — not a diagnosis. Please interpret in full clinical context.</div>
                <div className="hv-dp-bm-table">
                  <div className="hv-dp-bm-head">
                    <span>Biomarker</span><span>Value</span><span>Status</span><span>Normal Range</span><span>Trend</span>
                  </div>
                  {flagged.map(([name, v]) => {
                    const arr   = trends[name] || []
                    const trend = trendDir(arr)
                    return (
                      <div key={name} className="hv-dp-bm-row hv-dp-bm-flagged">
                        <span className="hv-dp-bm-name">{name}</span>
                        <span className="hv-dp-bm-val" style={{ color: STATUS_COLOR[v.status] }}>{v.value} {v.unit}</span>
                        <span className="hv-dp-bm-status" style={{ color: STATUS_COLOR[v.status] }}>{v.status}</span>
                        <span className="hv-dp-bm-range">{v.normalRange || '—'}</span>
                        <span className="hv-dp-bm-trend" style={{ color: trend?.color || '#94a3b8' }}>{trend?.icon || '—'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Normal values */}
            {normal.length > 0 && (
              <div className="hv-dp-section">
                <div className="hv-dp-sec-title" style={{ color: '#16a34a' }}>✓ Within Normal Range</div>
                <div className="hv-dp-bm-table">
                  <div className="hv-dp-bm-head">
                    <span>Biomarker</span><span>Value</span><span>Status</span><span>Normal Range</span><span>Trend</span>
                  </div>
                  {normal.map(([name, v]) => {
                    const arr   = trends[name] || []
                    const trend = trendDir(arr)
                    return (
                      <div key={name} className="hv-dp-bm-row">
                        <span className="hv-dp-bm-name">{name}</span>
                        <span className="hv-dp-bm-val">{v.value} {v.unit}</span>
                        <span className="hv-dp-bm-status" style={{ color: '#16a34a' }}>NORMAL</span>
                        <span className="hv-dp-bm-range">{v.normalRange || '—'}</span>
                        <span className="hv-dp-bm-trend" style={{ color: trend?.color || '#94a3b8' }}>{trend?.icon || '—'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="hv-dp-section">
            <div className="hv-dp-no-data">No biomarker data on file. Upload a lab report to populate this health summary.</div>
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="hv-dp-footer">
          <strong>⚕️ Medical Disclaimer:</strong> This document is generated by HealthOS for educational reference and health tracking. It is not a medical diagnosis, prescription, or clinical report. All values should be interpreted by a qualified healthcare professional in the full clinical context of the patient. HealthOS is not a medical device.
        </div>
      </div>
    </div>
  )
}

// ── Main HealthVaultScreen ────────────────────────────────────────────────────
export default function HealthVaultScreen() {
  const nav    = useNavigate()
  const [tab,     setTab]     = useState('records')
  const [reports, setReports] = useState(() => getAllReports())
  const trends  = useMemo(() => getBiomarkerTrends(), [reports])

  const totalBiomarkers = useMemo(() => {
    const names = new Set()
    reports.forEach(r => r.biomarkers?.forEach(b => names.add(b.name)))
    return names.size
  }, [reports])

  const oldestDate = reports.length > 0
    ? new Date(reports[reports.length - 1].date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null

  function handleDelete(id) {
    const updated = deleteReport(id)
    setReports(updated)
  }

  const TABS = [
    { id: 'records', label: '📋 Records' },
    { id: 'trends',  label: '📈 Trends' },
    { id: 'doctor',  label: '👨‍⚕️ Doctor View' },
  ]

  return (
    <div className="hv-root">
      {/* Top bar */}
      <div className="hv-topbar">
        <button className="hv-back" onClick={() => nav('/upload')}>← Back</button>
        <span className="hv-topbar-title">Health Vault</span>
        <button className="hv-add-report-btn" onClick={() => nav('/upload')}>+ Add</button>
      </div>

      {/* Hero summary */}
      <div className="hv-hero">
        <div className="hv-hero-icon">🗃️</div>
        <div className="hv-hero-title">Your Health Repository</div>
        <div className="hv-hero-sub">All your lab data in one place — track trends, share with your doctor, monitor your reversal progress</div>
        <div className="hv-hero-stats">
          <div className="hv-hs">
            <div className="hv-hs-n">{reports.length}</div>
            <div className="hv-hs-l">Reports</div>
          </div>
          <div className="hv-hs-div" />
          <div className="hv-hs">
            <div className="hv-hs-n">{totalBiomarkers}</div>
            <div className="hv-hs-l">Biomarkers</div>
          </div>
          <div className="hv-hs-div" />
          <div className="hv-hs">
            <div className="hv-hs-n">{Object.keys(trends).filter(k => trends[k].length > 1).length}</div>
            <div className="hv-hs-l">Trends tracked</div>
          </div>
          <div className="hv-hs-div" />
          <div className="hv-hs">
            <div className="hv-hs-n">{oldestDate || '—'}</div>
            <div className="hv-hs-l">Since</div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="hv-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`hv-tab ${tab === t.id ? 'hv-tab-on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'records' && (
        <RecordsTab
          reports={reports}
          onDelete={handleDelete}
          onAdd={() => nav('/upload')}
        />
      )}
      {tab === 'trends' && <TrendsTab trends={trends} />}
      {tab === 'doctor' && <DoctorTab reports={reports} trends={trends} />}

      <div style={{ height: 90 }} />
    </div>
  )
}

// helper used in DoctorTab — re-export from store for local use
function getCurrentValues() {
  try {
    const reports = getAllReports()
    const current = {}
    reports.forEach(r => {
      if (!r.biomarkers?.length) return
      r.biomarkers.forEach(b => {
        if (!b.name) return
        if (!current[b.name] || new Date(r.date) > new Date(current[b.name]._date)) {
          current[b.name] = { ...b, _date: r.date }
        }
      })
    })
    return current
  } catch { return {} }
}
