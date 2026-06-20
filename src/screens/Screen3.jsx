import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildReport } from '../lib/reportGenerator'
import { addReport, getAllReports, getCurrentValues } from '../lib/reportStore'
import { pushToCloud } from '../lib/sync'
import { extractRowsFromText, parseLabReport, parseBiomarkerRow } from '../lib/labNormalizer'
import UpgradeModal from '../components/UpgradeModal'
import { isPlusMember, getMonthlyUploads, recordUpload } from '../lib/planStatus'
import { getProfile } from '../lib/userProfile'
import { calcBioAgeFromBiomarkers, detectConditions, getAyurvedaProfile, INDIAN_REFS } from '../lib/bioage'


const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp'

const STATUS_COLOR = {
  HIGH:       '#dc2626',
  LOW:        '#2563eb',
  BORDERLINE: '#d97706',
  NORMAL:     '#16a34a',
}

function fileIcon(name = '') {
  return name.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'
}

const PRI_COLOR = { 1: '#dc2626', 2: '#7c3aed', 3: '#9333ea' }
const PRI_TAG   = { 1: 'CORE',    2: 'ADVANCED', 3: 'PREMIUM' }

// ── Research-backed category data ────────────────────────────────────────────
const BIOAGE_IMPACTS = [
  {
    icon: '🔥', category: 'Inflammation', color: '#dc2626', bg: '#fef2f2',
    biomarkers: ['hsCRP', 'ESR', 'LDH'],
    impact: '±3.2 yrs',
    why: 'hsCRP is the #1 silent ager — most people never test it',
    research: 'CALERIE trial: reducing inflammation reversed DunedinPACE clock by 2.9 yrs',
    retestDays: 90,
  },
  {
    icon: '🫀', category: 'Cardiovascular', color: '#e11d48', bg: '#fff1f2',
    biomarkers: ['LDL', 'HDL', 'ApoB', 'Triglycerides'],
    impact: '±2.4 yrs',
    why: 'ApoB is 3× more predictive of heart age than standard LDL',
    research: 'Framingham Heart Study: lipid panel predicts 10-yr cardiovascular risk',
    retestDays: 90,
  },
  {
    icon: '⚡', category: 'Hormones', color: '#7c3aed', bg: '#f5f3ff',
    biomarkers: ['Testosterone', 'DHEA-S', 'TSH', 'Cortisol'],
    impact: '±1.8 yrs',
    why: 'Testosterone declines 1%/year after 30 — tracking it lets you act early',
    research: 'Low DHEA-S correlates with 2+ yrs faster epigenetic ageing (multiple cohorts)',
    retestDays: 180,
  },
  {
    icon: '🌿', category: 'Nutrient Status', color: '#16a34a', bg: '#f0fdf4',
    biomarkers: ['Vitamin D', 'B12', 'Folate', 'Iron'],
    impact: '±1.5 yrs',
    why: '70–80% of Indians are Vitamin D deficient — each 10 ng/mL drop ages you faster',
    research: 'Vitamin D deficiency linked to 1.5-yr higher epigenetic age (Horvath et al.)',
    retestDays: 90,
  },
  {
    icon: '🫘', category: 'Organ Longevity', color: '#0891b2', bg: '#ecfeff',
    biomarkers: ['ALT', 'Creatinine', 'eGFR', 'HbA1c'],
    impact: '±1.2 yrs',
    why: 'Liver and kidney function predict lifespan better than most biomarkers',
    research: 'HbA1c above 5.7% accelerates glycation damage across all organs (ADA data)',
    retestDays: 90,
  },
]

// ── 90-day reversal window milestones ────────────────────────────────────────
const RETEST_MILESTONES = [
  { day: 1,  label: 'Baseline captured — your BioAge reference point' },
  { day: 14, label: 'First inflammation shift (hsCRP begins to respond)' },
  { day: 30, label: 'Blood sugar trend forming (HbA1c trending)' },
  { day: 60, label: 'Cardiovascular markers stabilising (LDL, HDL, ApoB)' },
  { day: 90, label: '🎯 Full retest due → BioAge score update' },
]

// ── Retest Countdown ─────────────────────────────────────────────────────────
function RetestCountdown({ onBook }) {
  const lastDate = localStorage.getItem('healthos_last_report_date')
  if (!lastDate) return null

  const uploaded   = new Date(lastDate)
  const now        = new Date()
  const daysPassed = Math.max(0, Math.floor((now - uploaded) / 86400000))
  const TOTAL      = 90
  const daysLeft   = Math.max(0, TOTAL - daysPassed)
  const progress   = Math.min(1, daysPassed / TOTAL)

  const R            = 36
  const circumference = 2 * Math.PI * R
  const dashoffset   = circumference * (1 - progress)

  const retestDate = new Date(uploaded)
  retestDate.setDate(retestDate.getDate() + TOTAL)
  const retestStr = retestDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const ringColor = daysPassed >= 90 ? '#16a34a'
    : daysPassed >= 60 ? '#0891b2'
    : daysPassed >= 30 ? '#d97706'
    : '#7c3aed'

  return (
    <div className="rtc-card">
      <div className="rtc-title">📅 Your 90-Day Reversal Window</div>
      <div className="rtc-sub">Each biomarker changes at a different pace — here's when to read the next chapter</div>

      <div className="rtc-body">
        {/* SVG Progress Ring */}
        <div className="rtc-ring-wrap">
          <svg width="92" height="92" viewBox="0 0 92 92">
            <circle cx="46" cy="46" r={R} fill="none" stroke="#f1f5f9" strokeWidth="7" />
            <circle
              cx="46" cy="46" r={R}
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 46 46)"
            />
          </svg>
          <div className="rtc-ring-center">
            <div className="rtc-day-num" style={{ color: ringColor }}>
              {daysPassed >= 90 ? '✓' : daysPassed}
            </div>
            <div className="rtc-day-lbl">{daysPassed >= 90 ? 'done' : 'of 90'}</div>
          </div>
        </div>

        {/* Info panel */}
        <div className="rtc-info">
          <div className="rtc-info-row">
            <span className="rtc-il">Last report</span>
            <span className="rtc-iv">{uploaded.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="rtc-info-row">
            <span className="rtc-il">Next retest</span>
            <span className="rtc-iv" style={{ color: ringColor, fontWeight: 700 }}>{retestStr}</span>
          </div>
          <div className="rtc-info-row">
            <span className="rtc-il">Days left</span>
            <span className="rtc-iv" style={{ color: ringColor }}>
              {daysLeft === 0 ? '🎯 Retest now!' : `${daysLeft} days`}
            </span>
          </div>
        </div>
      </div>

      {/* Milestone timeline */}
      <div className="rtc-milestones">
        {RETEST_MILESTONES.map((m, idx) => {
          const done    = daysPassed >= m.day
          const current = !done && daysPassed >= (RETEST_MILESTONES[idx - 1]?.day ?? 0)
          return (
            <div key={m.day} className={`rtc-ms ${done ? 'rtc-ms-done' : ''} ${current ? 'rtc-ms-current' : ''}`}>
              <div className="rtc-ms-left">
                <div
                  className="rtc-ms-dot"
                  style={{
                    background: done ? ringColor : current ? '#fff' : '#f1f5f9',
                    border: current ? `2px solid ${ringColor}` : done ? `2px solid ${ringColor}` : '2px solid #e2e8f0',
                    color: done ? '#fff' : 'transparent',
                  }}
                >
                  {done ? '✓' : ''}
                </div>
                {idx < RETEST_MILESTONES.length - 1 && (
                  <div className="rtc-ms-line" style={{ background: done ? ringColor : '#e2e8f0' }} />
                )}
              </div>
              <div className="rtc-ms-info">
                <span className="rtc-ms-day" style={{ color: done ? ringColor : current ? '#1e293b' : '#94a3b8' }}>
                  Day {m.day}
                </span>
                <span className="rtc-ms-label" style={{ color: done ? '#334155' : current ? '#475569' : '#94a3b8' }}>
                  {m.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {daysLeft > 0 && daysLeft <= 14 && (
        <div className="rtc-due-soon">
          ⏰ Retest in {daysLeft} day{daysLeft !== 1 ? 's' : ''} — book now to stay on schedule
        </div>
      )}
      {daysLeft === 0 && (
        <div className="rtc-due-alert">
          🎯 90-day window complete! Book your retest to get an updated BioAge score.
        </div>
      )}

      {daysLeft <= 14 && (
        <button className="rtc-book-btn" onClick={onBook}>
          📅 Book Retest Now →
        </button>
      )}
    </div>
  )
}

// ── Why Test Section ──────────────────────────────────────────────────────────
function WhyTestSection({ onBook }) {
  const [flipped, setFlipped] = useState(null)
  const totalImpact = BIOAGE_IMPACTS.reduce((s, c) => s + parseFloat(c.impact.replace('±', '')), 0).toFixed(1)

  return (
    <div className="wts-section">
      <div className="wts-header">
        <div className="wts-title">🎯 Tests Recommended for Accurate Age Reversal Tracking</div>
        <div className="wts-sub">
          Without lab data, BioAge is an estimate. With these 5 panels, it becomes your <strong>real biological score</strong> — and each retest shows your reversal progress.
        </div>
      </div>

      {/* Horizontally scrollable impact cards */}
      <div className="wts-scroll">
        {BIOAGE_IMPACTS.map(cat => (
          <div
            key={cat.category}
            className={`wts-card ${flipped === cat.category ? 'wts-card-flip' : ''}`}
            style={{ borderTopColor: cat.color }}
            onClick={() => setFlipped(flipped === cat.category ? null : cat.category)}
          >
            {/* Front */}
            <div className="wts-front">
              <div className="wts-card-top">
                <span className="wts-card-icon" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</span>
                <div>
                  <div className="wts-card-cat">{cat.category}</div>
                  <div className="wts-card-impact" style={{ color: cat.color }}>{cat.impact}</div>
                  <div className="wts-card-impact-lbl">BioAge impact</div>
                </div>
              </div>
              <div className="wts-card-markers">
                {cat.biomarkers.map(m => (
                  <span key={m} className="wts-marker" style={{ background: cat.bg, color: cat.color, borderColor: `${cat.color}33` }}>{m}</span>
                ))}
              </div>
              <div className="wts-card-why">{cat.why}</div>
              <div className="wts-card-retest">
                <span className="wts-retest-label">Retest every</span>
                <span className="wts-retest-val" style={{ color: cat.color }}>{cat.retestDays} days</span>
              </div>
              <div className="wts-card-hint">Tap for research →</div>
            </div>
            {/* Back (research) */}
            <div className="wts-back" style={{ background: cat.bg }}>
              <div className="wts-back-icon" style={{ color: cat.color }}>{cat.icon}</div>
              <div className="wts-back-title" style={{ color: cat.color }}>{cat.category}</div>
              <div className="wts-back-research">📚 {cat.research}</div>
              <div className="wts-back-hint">Tap to flip back</div>
            </div>
          </div>
        ))}
      </div>

      {/* Total impact callout */}
      <div className="wts-total-row">
        <div className="wts-total-left">
          <div className="wts-total-label">Total trackable BioAge impact</div>
          <div className="wts-total-note">across all 5 categories, based on clinical literature</div>
        </div>
        <div className="wts-total-val">~{totalImpact} yrs</div>
      </div>

      {/* Retest frequency guide */}
      <div className="wts-freq-card">
        <div className="wts-freq-title">🔁 How Often to Retest</div>
        <div className="wts-freq-row">
          <span className="wts-freq-tag" style={{ background: '#fef2f2', color: '#dc2626' }}>Every 90 days</span>
          <span className="wts-freq-desc">Inflammation · Blood sugar · Lipids · Nutrients · Organ health</span>
        </div>
        <div className="wts-freq-row">
          <span className="wts-freq-tag" style={{ background: '#f5f3ff', color: '#7c3aed' }}>Every 6 months</span>
          <span className="wts-freq-desc">Hormones (Testosterone, DHEA-S, TSH, Cortisol)</span>
        </div>
        <div className="wts-freq-row">
          <span className="wts-freq-tag" style={{ background: '#fdf4ff', color: '#9333ea' }}>Annually</span>
          <span className="wts-freq-desc">Epigenetic age · Telomere length (advanced panels)</span>
        </div>
      </div>

      <button className="wts-cta-btn" onClick={onBook}>
        🏠 Book Complete Panel at Home →
      </button>
      <div className="wts-cta-note">All 5 categories · home sample collection · results in 24–48 hrs</div>
    </div>
  )
}

// ── Compact Lab Order Card ────────────────────────────────────────────────────
function LabOrderCard({ onOrder }) {
  const report  = buildReport([])
  const panels  = report.panels
  const [open, setOpen] = useState(false)
  const totalTests = panels.reduce((s, p) => s + p.tests.length, 0)

  return (
    <div className="loc-card">
      <div className="loc-header">
        <span className="loc-icon">🔬</span>
        <div className="loc-header-text">
          <div className="loc-title">Lab at Your Doorstep</div>
          <div className="loc-sub">Home sample collection · results auto-uploaded to AROGYOS</div>
        </div>
        <span className="loc-cs-badge">Coming soon</span>
      </div>

      <div className="loc-stats">
        <div className="loc-stat"><span className="loc-sn">{panels.length}</span><span className="loc-sl">Panels</span></div>
        <div className="loc-sdiv"/>
        <div className="loc-stat"><span className="loc-sn">{totalTests}</span><span className="loc-sl">Tests</span></div>
        <div className="loc-sdiv"/>
        <div className="loc-stat"><span className="loc-sn">₹{report.costMin.toLocaleString('en-IN')}+</span><span className="loc-sl">Est. cost</span></div>
        <div className="loc-sdiv"/>
        <div className="loc-stat"><span className="loc-sn">24–48h</span><span className="loc-sl">Results</span></div>
      </div>

      <div className="loc-panels">
        {(open ? panels : panels.slice(0, 3)).map(p => (
          <div key={p.id} className="loc-panel-row">
            <span className="loc-panel-icon" style={{ background: `${p.color}18`, color: p.color }}>{p.icon}</span>
            <div className="loc-panel-info">
              <span className="loc-panel-name">{p.name}</span>
              <span className="loc-panel-tests">{p.tests.length} tests</span>
            </div>
            <span className="loc-pri-tag" style={{ color: PRI_COLOR[p.priority] }}>{PRI_TAG[p.priority]}</span>
            <span className="loc-panel-cost">{p.costRange}</span>
          </div>
        ))}
      </div>

      {panels.length > 3 && (
        <button className="loc-show-more" onClick={() => setOpen(o => !o)}>
          {open ? '▲ Show less' : `▼ +${panels.length - 3} more panels`}
        </button>
      )}

      <div className="loc-fasting">
        ⏰ Core panels require <strong>10–12 hrs fasting</strong> · Draw time: 7–10 AM preferred
      </div>

      <button className="loc-cta" onClick={onOrder}>
        🏠 Book Home Sample Collection →
      </button>
      <div className="loc-cta-note">Select panels · enter address · get collected at home</div>
    </div>
  )
}

// ── Doctor Share Card ─────────────────────────────────────────────────────────
function DoctorShareCard() {
  const [copied, setCopied] = useState(false)
  const profile  = getProfile()
  const reports  = getAllReports()
  const current  = getCurrentValues()

  const summary = useMemo(() => {
    if (!reports.length) return null
    const latest = reports[reports.length - 1]
    const res    = profile?.actualAge && latest.biomarkers?.length
      ? calcBioAgeFromBiomarkers(profile.actualAge, latest.biomarkers)
      : null
    const date   = new Date(latest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

    const lines = ['🧬 *AROGYOS Health Report*', '']
    if (res) lines.push(`*Biological Age:* ${res.bioage} yrs (Actual: ${profile.actualAge})`)
    lines.push(`*Tested on:* ${date}`)
    if (latest.biomarkers?.length) lines.push(`*Biomarkers:* ${latest.biomarkers.length} extracted`)
    lines.push('')
    lines.push('*📊 Key Values:*')

    const KEY_MARKERS = ['hsCRP', 'HbA1c', 'LDL', 'HDL', 'Vitamin D', 'B12', 'TSH', 'Creatinine', 'Hemoglobin']
    for (const name of KEY_MARKERS) {
      const val = current[name]
      if (!val) continue
      const ref = INDIAN_REFS[name]
      const unit = val.unit || ref?.unit || ''
      lines.push(`• *${name}:* ${val.value} ${unit} (${val.status || '—'})`)
    }

    lines.push('')
    lines.push('_Analysed by AROGYOS — India\'s BioAge Platform_')
    lines.push('https://healthos-app-two.vercel.app')
    return lines.join('\n')
  }, [reports, current, profile])

  if (!summary) return null

  function shareWhatsApp() {
    const url = 'https://wa.me/?text=' + encodeURIComponent(summary)
    window.open(url, '_blank', 'noopener')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>👨‍⚕️</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Share with Your Doctor</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>One-tap send your biomarker summary</div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 11, color: '#64748b', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 100, overflow: 'hidden', position: 'relative' }}>
        {summary.slice(0, 280)}…
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, background: 'linear-gradient(transparent, #f8fafc)' }} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={shareWhatsApp}
          style={{ flex: 1, padding: '11px 0', background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share on WhatsApp
        </button>
        <button
          onClick={copyLink}
          style={{ padding: '11px 14px', background: copied ? '#f0fdf4' : '#f1f5f9', color: copied ? '#15803d' : '#64748b', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
    </div>
  )
}

// ── Ayurveda Correlation Section ──────────────────────────────────────────────
function AyurvedaSection() {
  const [expanded, setExpanded] = useState(null)
  const profile  = getProfile()
  const reports  = getAllReports()

  const { profile: ayurProfiles, conditions } = useMemo(() => {
    if (!reports.length || !profile?.actualAge) return { profile: [], conditions: {} }
    const latest = reports[reports.length - 1]
    const matched = (latest.biomarkers || []).map(bm => {
      const val = parseFloat(bm.value || bm.stdValue)
      const name = bm.canonical || bm.name
      return { canonical: name, value: val }
    }).filter(m => !isNaN(m.value))
    const cond = detectConditions(matched)
    return { profile: getAyurvedaProfile(cond), conditions: cond }
  }, [reports, profile])

  if (!ayurProfiles.length) {
    return (
      <div style={{ background: '#fdf4ff', border: '1.5px solid #e9d5ff', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>🌿</span>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>Ayurveda + Modern Biomarkers</div>
        </div>
        <div style={{ fontSize: 12, color: '#6b21a8', lineHeight: 1.6 }}>
          Upload a lab report to see your Ayurvedic dosha analysis — matched to your biomarkers with clinical evidence for each herb.
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🌿</span> Ayurveda + Biomarker Correlation
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>
        Your lab markers mapped to Ayurvedic doshas. Each herb below has published clinical evidence.
      </div>

      {ayurProfiles.map((dosha, di) => (
        <div key={di} style={{ background: dosha.bg, border: `1.5px solid ${dosha.color}33`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>{dosha.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: dosha.color }}>{dosha.label}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>{dosha.description}</div>
            </div>
          </div>

          {/* Affected biomarkers */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {dosha.biomarkers.map(m => (
              <span key={m} style={{ background: dosha.color + '18', color: dosha.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>{m}</span>
            ))}
          </div>

          {/* Herbs */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Evidence-Based Herbs</div>
          {dosha.herbs.map((herb, hi) => (
            <div key={hi} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', marginBottom: 8, cursor: 'pointer', borderLeft: `3px solid ${dosha.color}` }}
              onClick={() => setExpanded(expanded === `${di}-${hi}` ? null : `${di}-${hi}`)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{herb.icon} {herb.name}</div>
                <span style={{ background: dosha.color + '18', color: dosha.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>{expanded === `${di}-${hi}` ? '▲' : '▼ Evidence'}</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>Dose: {herb.dose}</div>
              {expanded === `${di}-${hi}` && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: dosha.bg, borderRadius: 8, fontSize: 11, color: '#374151', lineHeight: 1.6 }}>
                  📚 {herb.why}
                </div>
              )}
            </div>
          ))}

          {/* Diet recommendation */}
          <div style={{ background: dosha.color + '0d', borderRadius: 10, padding: '10px 12px', marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: dosha.color, marginBottom: 4 }}>🍽️ Dietary Approach</div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{dosha.diet}</div>
          </div>
        </div>
      ))}

      <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
        Always consult a qualified Ayurvedic practitioner. Herbs may interact with medications.
      </div>
    </div>
  )
}

// ── PDF text extraction — two strategies, best one wins ──────────────────────
// Strategy A: group by y-coordinate (reading order for table PDFs)
function pdfItemsToTextPositional(items, yTol = 8) {
  const ti = items.filter(it => typeof it.str === 'string' && it.str.trim())
  if (!ti.length) return ''
  const groups = []
  for (const item of ti) {
    const y = item.transform[5]
    let g = groups.find(g => Math.abs(g.y - y) <= yTol)
    if (!g) { g = { y, items: [] }; groups.push(g) }
    g.items.push(item)
  }
  groups.sort((a, b) => b.y - a.y)
  return groups
    .map(g => g.items.sort((a, b) => a.transform[4] - b.transform[4]).map(i => i.str).join(' '))
    .join('\n')
}

// Strategy B: sort all items top→bottom then left→right (stream-order safe)
function pdfItemsToTextSorted(items) {
  const ti = items.filter(it => typeof it.str === 'string' && it.str.trim())
  if (!ti.length) return ''
  ti.sort((a, b) => {
    const dy = b.transform[5] - a.transform[5]
    if (Math.abs(dy) > 8) return dy
    return a.transform[4] - b.transform[4]
  })
  const lines = []
  let curY = null
  let curLine = []
  for (const item of ti) {
    const y = item.transform[5]
    if (curY === null || Math.abs(curY - y) > 8) {
      if (curLine.length) lines.push(curLine.join(' '))
      curLine = [item.str]
      curY = y
    } else {
      curLine.push(item.str)
    }
  }
  if (curLine.length) lines.push(curLine.join(' '))
  return lines.join('\n')
}

function pdfItemsToText(items) {
  const a = pdfItemsToTextPositional(items)
  const b = pdfItemsToTextSorted(items)
  // pick whichever produces more parseable biomarkers (proxy: count lines with a digit)
  const score = t => (t.match(/\d/g) || []).length
  return score(a) >= score(b) ? a : b
}

// ── Tesseract OCR (self-hosted ESM, lazy-loaded, cached) ─────────────────────
let _tsmod = null
async function getTesseract() {
  if (!_tsmod) {
    const m = await new Function('return import("/tesseract.esm.min.js")')()
    _tsmod = m.default   // ESM build only has a default export
  }
  return _tsmod
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function Screen3() {
  const nav     = useNavigate()
  const inputRef = useRef(null)
  const [dragging,     setDragging]     = useState(false)
  const [uploads,      setUploads]      = useState([])
  const [expanded,     setExpanded]     = useState(null)
  const [showGate,     setShowGate]     = useState(false)
  const [hasReport,    setHasReport]    = useState(
    () => !!localStorage.getItem('healthos_last_report_date')
  )
  const vaultCount = getAllReports().length

  async function processFile(file) {
    if (!isPlusMember() && getMonthlyUploads() >= 1) { setShowGate(true); return }
    recordUpload()

    const id = Date.now()
    setUploads(prev => [{ id, name: file.name, status: 'processing', info: 'Reading file…', biomarkers: null }, ...prev])
    localStorage.setItem('healthos_last_report_date', new Date().toISOString())
    setHasReport(true)

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
    const isImg = /\.(jpe?g|png|webp|bmp|tiff?)$/i.test(file.name) || file.type.startsWith('image/')

    const upd = info => setUploads(prev => prev.map(u => u.id === id ? { ...u, info } : u))
    const err = info => setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'error', info } : u))

    let text = ''
    let serverErr = ''

    try {
      if (isPdf) {
        upd('Reading PDF…')

        // ── Server-side parse (Node.js pdfjs — reliable) ──────────────────
        let serverBiomarkers = null
        try {
          const base64 = await new Promise(resolve => {
            const reader = new FileReader()
            reader.onload = e => resolve(e.target.result.split(',')[1])
            reader.readAsDataURL(file)
          })
          upd('Analysing with server…')
          const resp = await fetch('/api/parse-lab', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileBase64: base64 }),
          })
          const json = await resp.json()
          if (resp.ok && json.biomarkers && json.biomarkers.length > 0) {
            serverBiomarkers = json.biomarkers
          } else {
            serverErr = json.error || `Server returned ${json.biomarkers?.length ?? 0} biomarkers`
          }
        } catch (e) {
          serverErr = e?.message || String(e)
        }
        console.log('[HealthOS] Server parse:', serverBiomarkers ? serverBiomarkers.length + ' biomarkers' : 'failed: ' + serverErr)

        if (serverBiomarkers) {
          // Server parsed successfully — skip all client-side processing
          addReport({ name: file.name, source: 'Upload', biomarkers: serverBiomarkers })
          pushToCloud()
          setUploads(prev => prev.map(u => u.id === id
            ? { ...u, status: 'done', info: `${serverBiomarkers.length} biomarkers extracted`, biomarkers: serverBiomarkers }
            : u
          ))
          setExpanded(id)
          return
        }

        // ── Client-side fallback: load pdfjs directly (new Function bypasses rolldown) ─────
        upd('Extracting text locally…')
        const pdfjsLib = await new Function('return import("/pdf.min.mjs")')()
        const pdfjs = pdfjsLib.default ?? pdfjsLib
        ;(pdfjs.GlobalWorkerOptions ?? pdfjsLib.GlobalWorkerOptions).workerSrc = '/pdf.worker.min.mjs'
        const getDoc = pdfjs.getDocument ?? pdfjsLib.getDocument
        const pdf = await getDoc({ data: await file.arrayBuffer(), disableFontFace: true, verbosity: 0 }).promise

        const pdfPages = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          pdfPages.push({ page, text: pdfItemsToText(content.items) })
        }
        text = pdfPages.map(p => p.text).join('\n')

        const quickBio = text.trim().length >= 20
          ? parseLabReport(extractRowsFromText(text)) : []

        if (quickBio.length < 3) {
          upd(`OCR starting (${pdf.numPages} pages)…`)
          const { createWorker } = await getTesseract()
          const worker = await createWorker('eng', 1, {
            workerPath: '/tesseract-worker.min.js',
            workerBlobURL: false,
          })
          const ocrTexts = []
          for (let i = 0; i < pdfPages.length; i++) {
            upd(`OCR page ${i + 1}/${pdf.numPages}…`)
            const vp = pdfPages[i].page.getViewport({ scale: 2.0 })
            const canvas = document.createElement('canvas')
            canvas.width = vp.width; canvas.height = vp.height
            await pdfPages[i].page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
            const { data: { text: t } } = await worker.recognize(canvas)
            ocrTexts.push(t)
          }
          await worker.terminate()
          const ocrText = ocrTexts.join('\n')
          const ocrBio = parseLabReport(extractRowsFromText(ocrText))
          if (ocrBio.length > quickBio.length) text = ocrText
        }

      } else if (isImg) {
        // Images always need OCR — readAsText on binary gives garbage
        upd('Reading image with OCR…')
        const { createWorker } = await getTesseract()
        const worker = await createWorker('eng', 1, {
          workerPath: '/tesseract-worker.min.js',
          workerBlobURL: false,
          logger: m => { if (m.status === 'recognizing text') upd(`OCR ${Math.round(m.progress * 100)}%…`) },
        })
        const { data: { text: t } } = await worker.recognize(file)
        await worker.terminate()
        text = t

      } else {
        text = await new Promise(resolve => {
          const r = new FileReader()
          r.onload = e => resolve(e.target?.result || '')
          r.onerror = () => resolve('')
          r.readAsText(file)
        })
      }
    } catch (e) {
      console.error('File processing error:', e)
      err(`Could not read this file: ${e?.message || e}`)
      return
    }

    if (!text || text.trim().length < 20) {
      err('No data found. Try uploading a clearer photo or a different file.')
      return
    }

    upd('Analyzing biomarkers…')
    console.log('[HealthOS] Extracted text sample:', text.slice(0, 2000))
    const rows = extractRowsFromText(text)
    console.log('[HealthOS] Rows found:', rows.length, rows.slice(0, 30))
    const biomarkers = parseLabReport(rows)
    console.log('[HealthOS] Biomarkers matched:', biomarkers.length, biomarkers)

    if (!biomarkers || biomarkers.length === 0) {
      err(`No biomarkers found (${rows.length} rows parsed, server: ${serverErr || 'ok'}). Make sure this is a blood test PDF.`)
      return
    }

    addReport({ name: file.name, source: 'Upload', biomarkers })
    pushToCloud()
    setUploads(prev => prev.map(u => u.id === id
      ? { ...u, status: 'done', info: `${biomarkers.length} biomarkers extracted`, biomarkers }
      : u
    ))
    setExpanded(id)
  }

  function onFileChange(e) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function statusPill(status) {
    if (status === 'done')       return <span className="tag-pill done">Done</span>
    if (status === 'error')      return <span className="tag-pill pending" style={{ background: '#fef2f2', color: '#dc2626' }}>Error</span>
    if (status === 'pending')    return <span className="tag-pill pending">Pending</span>
    if (status === 'processing') return <span className="tag-pill processing">Reading…</span>
    return null
  }

  return (
    <div className="screen">
      <button className="nav-back">← Add Your Lab Report</button>

      <p className="desc">
        Upload a report from any diagnostic center — PDF or photo — and our AI extracts your biomarkers in seconds.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      <div
        className={`dropzone ${dragging ? 'dropzone-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <span className="ic">⬆</span>
        <div className="t1">{dragging ? 'Drop it here!' : 'Upload PDF or Photo'}</div>
        <div className="t2">Blood test · Lipid panel · CBC · Thyroid · HbA1c & more</div>
        <button onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
          Choose File
        </button>
      </div>

      {uploads.length > 0 && (
        <>
          <div className="card-title">Recent Uploads</div>
          {uploads.map(u => (
            <div key={u.id}>
              <div
                className="upload-item"
                style={{ cursor: u.biomarkers ? 'pointer' : 'default' }}
                onClick={() => u.biomarkers && setExpanded(expanded === u.id ? null : u.id)}
              >
                <div className="ic2">
                  {u.status === 'done' ? '✅' : u.status === 'processing' ? '⏳' : fileIcon(u.name)}
                </div>
                <div className="meta">
                  <div className="t">{fileIcon(u.name)} {u.name}</div>
                  <div className="s">{u.info}</div>
                  {u.summary && <div className="s" style={{ marginTop: 3, color: '#5a6478' }}>{u.summary}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {statusPill(u.status)}
                  {u.biomarkers && <span style={{ fontSize: 12, color: '#94a3b8' }}>{expanded === u.id ? '▲' : '▼'}</span>}
                </div>
              </div>

              {expanded === u.id && u.biomarkers && (
                <div className="bio-table">
                  {u.biomarkers.map(b => {
                    const displayName  = b.canonical  || b.name        || '—'
                    const displayValue = b.stdValue    ?? b.value       ?? '—'
                    const displayUnit  = b.stdUnit     || b.unit        || ''
                    const displayFlag  = b.flag        || b.status      || ''
                    const displayRef   = b.ref         || b.normalRange || ''
                    return (
                      <div key={b.biomarkerId || b.canonical || b.name} className="bio-row-r">
                        <div className="bio-name-r">{displayName}</div>
                        <div className="bio-val-r">{displayValue} <span className="bio-unit">{displayUnit}</span></div>
                        <div className="bio-status-r" style={{ color: STATUS_COLOR[displayFlag] || '#94a3b8' }}>{displayFlag}</div>
                        <div className="bio-range-r">{displayRef}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Doctor sharing — only after first upload */}
      {hasReport && <DoctorShareCard />}

      {/* Health Vault entry banner */}
      <div className="s3-vault-banner" onClick={() => nav('/vault')}>
        <div className="s3-vb-left">
          <span className="s3-vb-icon">🗃️</span>
          <div>
            <div className="s3-vb-title">Health Vault</div>
            <div className="s3-vb-sub">
              {vaultCount > 0
                ? `${vaultCount} report${vaultCount !== 1 ? 's' : ''} stored · View trends & share with doctor`
                : 'Your health records depository — trends, charts, doctor sharing'}
            </div>
          </div>
        </div>
        <span className="s3-vb-arrow">→</span>
      </div>

      {/* 90-day countdown — only visible after first report upload */}
      {hasReport && <RetestCountdown onBook={() => nav('/lab-doorstep')} />}

      {/* Why test section — always visible */}
      <WhyTestSection onBook={() => nav('/lab-doorstep')} />

      {/* Ayurveda correlation — always rendered, biomarker content conditional */}
      <AyurvedaSection />

      {/* Compact lab order card */}
      <LabOrderCard onOrder={() => nav('/lab-doorstep')} />

      {showGate && <UpgradeModal reason="upload" onClose={() => setShowGate(false)} />}
    </div>
  )
}
