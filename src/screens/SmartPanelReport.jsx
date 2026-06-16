import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildReport, buildWhatsAppText, buildClipboardText } from '../lib/reportGenerator'

/* ─── Connected sources come from localStorage in real app.
       For now default to lab + healthkit to demo the gap detection. ─── */
function getConnectedSources() {
  try {
    const stored = localStorage.getItem('healthos_connections')
    return stored ? JSON.parse(stored) : ['lab', 'healthkit']
  } catch { return ['lab', 'healthkit'] }
}

const LABS = [
  { name: 'Any NABL-Certified Lab',     icon: '🔴', note: 'Search for NABL-accredited labs in your city' },
  { name: 'Home Collection Service',    icon: '🟠', note: 'Many labs offer home blood draw — ask when booking' },
  { name: 'Government Hospital Lab',    icon: '🔵', note: 'AIIMS, civil hospital labs are trusted and affordable' },
  { name: 'Walk-In Diagnostic Centre',  icon: '⚪', note: 'Show them this panel list at the counter' },
]

const PRIORITY_META = {
  1: { label: 'CORE — Every 90 days',     bg: '#fef2f2', border: '#fca5a5', dot: '#dc2626' },
  2: { label: 'ADVANCED — Every 6 months', bg: '#f5f3ff', border: '#c4b5fd', dot: '#7c3aed' },
  3: { label: 'PREMIUM — Annual',          bg: '#fdf4ff', border: '#e9d5ff', dot: '#9333ea' },
}

function Copied({ show }) {
  if (!show) return null
  return (
    <div style={{
      position:'fixed', bottom:100, left:'50%', transform:'translateX(-50%)',
      background:'#0f172a', color:'#fff', padding:'10px 20px', borderRadius:30,
      fontSize:13, fontWeight:600, zIndex:999, pointerEvents:'none',
      animation:'fadeInUp 0.3s ease',
    }}>
      ✓ Copied to clipboard
    </div>
  )
}

export default function SmartPanelReport() {
  const nav = useNavigate()
  const [copied, setCopied] = useState(false)
  const [printMode, setPrintMode] = useState(false)
  const [expandedPanels, setExpandedPanels] = useState({ metabolic:true, cardiovascular:true, inflammation:true, nutrition:true, organ:true })

  const connected = getConnectedSources()
  const report    = buildReport(connected)

  function togglePanel(id) {
    setExpandedPanels(p => ({ ...p, [id]: !p[id] }))
  }

  function handleCopy() {
    const text = buildClipboardText(report)
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(buildWhatsAppText(report))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="spr-root">
      <Copied show={copied} />

      {/* ── Medical disclaimer ── */}
      <div className="spr-edu-banner">
        ⚕️ <strong>Educational purposes only.</strong> This panel is a suggested starting point for a conversation with your doctor — not a medical prescription. Always consult a qualified doctor before ordering any tests or acting on results.
      </div>

      {/* ── Top bar ── */}
      <div className="spr-topbar">
        <button className="spr-back" onClick={() => nav('/devices')}>← Back</button>
        <span className="spr-topbar-title">Smart Lab Panel</span>
        <button className="spr-print-btn" onClick={handlePrint}>🖨️ Print</button>
      </div>

      {/* ── Document header ── */}
      <div className="spr-doc-header">
        <div className="spr-logo-row">
          <span className="spr-logo">🧬</span>
          <div>
            <div className="spr-brand">HealthOS</div>
            <div className="spr-brand-sub">Smart Lab Panel Report</div>
          </div>
        </div>
        <div className="spr-meta-row">
          <div className="spr-meta-item"><span className="spr-ml">Date</span><span className="spr-mv">{report.today}</span></div>
          <div className="spr-meta-item"><span className="spr-ml">Ref No.</span><span className="spr-mv">{report.refNo}</span></div>
        </div>
        <div className="spr-meta-row" style={{marginTop:4}}>
          <div className="spr-meta-item"><span className="spr-ml">Data Sources</span><span className="spr-mv">{report.connectedCount} connected</span></div>
          <div className="spr-meta-item"><span className="spr-ml">Tests Included</span><span className="spr-mv">{report.totalTests} parameters</span></div>
        </div>
      </div>

      {/* ── Why this report ── */}
      <div className="spr-why-card">
        <div className="spr-why-title">Why This Panel?</div>
        <div className="spr-why-body">
          HealthOS analysed your <strong>{report.connectedCount} connected data source{report.connectedCount !== 1 ? 's' : ''}</strong> and
          found <strong>{report.missingCount} biomarkers</strong> not yet being tracked by any device or previous lab report.
          This panel fills every gap so your BioAge score is based on complete, accurate data — not estimates.
        </div>
        <div className="spr-chips-row">
          <span className="spr-chip red">{report.corePanels.length} Core panels</span>
          {report.advancedPanels.length > 0 && <span className="spr-chip purple">{report.advancedPanels.length} Advanced panels</span>}
          {report.premiumPanels.length > 0 && <span className="spr-chip grape">{report.premiumPanels.length} Premium panels</span>}
          <span className="spr-chip green">Est. ₹{report.costMin.toLocaleString('en-IN')}–{report.costMax.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* ── Instructions box ── */}
      <div className="spr-instructions">
        <div className="spr-instr-title">📋 What to Tell Your Lab</div>
        <div className="spr-instr-quote">
          "Please include all tests from my HealthOS Smart Panel. The list is below."
        </div>
        <div className="spr-instr-grid">
          <div className="spr-instr-item"><span className="spr-ii">⏰</span><div><strong>Fast 10–12 hours</strong><br/>Water, plain tea/coffee (no sugar) allowed</div></div>
          <div className="spr-instr-item"><span className="spr-ii">☀️</span><div><strong>Go 7–10 AM</strong><br/>Morning sample is essential for hormones</div></div>
          <div className="spr-instr-item"><span className="spr-ii">💊</span><div><strong>Mention medications</strong><br/>Tell the phlebotomist all current medicines</div></div>
          <div className="spr-instr-item"><span className="spr-ii">🩸</span><div><strong>~5–8 small tubes</strong><br/>All from a single arm draw, takes 5 minutes</div></div>
        </div>
      </div>

      {/* ── PRIORITY 1 — Core Panels ── */}
      {report.corePanels.length > 0 && (
        <div className="spr-priority-group">
          <div className="spr-pg-header" style={{background:'#fef2f2',borderColor:'#fca5a5'}}>
            <span className="spr-pg-dot" style={{background:'#dc2626'}} />
            <span className="spr-pg-label">PRIORITY 1 — CORE PANEL</span>
            <span className="spr-pg-freq">Every 90 days</span>
          </div>
          {report.corePanels.map(panel => (
            <PanelCard
              key={panel.id} panel={panel}
              expanded={expandedPanels[panel.id] !== false}
              onToggle={() => togglePanel(panel.id)}
            />
          ))}
        </div>
      )}

      {/* ── PRIORITY 2 — Advanced ── */}
      {report.advancedPanels.length > 0 && (
        <div className="spr-priority-group">
          <div className="spr-pg-header" style={{background:'#f5f3ff',borderColor:'#c4b5fd'}}>
            <span className="spr-pg-dot" style={{background:'#7c3aed'}} />
            <span className="spr-pg-label">PRIORITY 2 — ADVANCED PANEL</span>
            <span className="spr-pg-freq">Every 6 months</span>
          </div>
          {report.advancedPanels.map(panel => (
            <PanelCard
              key={panel.id} panel={panel}
              expanded={expandedPanels[panel.id] !== false}
              onToggle={() => togglePanel(panel.id)}
            />
          ))}
        </div>
      )}

      {/* ── PRIORITY 3 — Premium ── */}
      {report.premiumPanels.length > 0 && (
        <div className="spr-priority-group">
          <div className="spr-pg-header" style={{background:'#fdf4ff',borderColor:'#e9d5ff'}}>
            <span className="spr-pg-dot" style={{background:'#9333ea'}} />
            <span className="spr-pg-label">PRIORITY 3 — PREMIUM PANEL</span>
            <span className="spr-pg-freq">Annual</span>
          </div>
          {report.premiumPanels.map(panel => (
            <PanelCard
              key={panel.id} panel={panel}
              expanded={expandedPanels[panel.id] !== false}
              onToggle={() => togglePanel(panel.id)}
            />
          ))}
        </div>
      )}

      {/* ── Cost summary ── */}
      <div className="spr-cost-card">
        <div className="spr-cost-title">Estimated Total Cost</div>
        <div className="spr-cost-range">
          ₹{report.costMin.toLocaleString('en-IN')} – ₹{report.costMax.toLocaleString('en-IN')}
        </div>
        <div className="spr-cost-note">
          Cost varies by lab and city. Home collection adds ₹150–300. Compare prices across NABL-certified labs in your city for best rates.
        </div>
        <div className="spr-cost-breakdown">
          {report.panels.map(p => (
            <div key={p.id} className="spr-cost-row">
              <span style={{color:p.color}}>{p.icon} {p.name}</span>
              <span className="spr-cost-val">{p.costRange}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Where to get tested ── */}
      <div className="spr-labs-card">
        <div className="spr-labs-title">🏥 Where to Get Tested</div>
        <div className="spr-labs-note">Visit any NABL-certified diagnostic lab. Show them this panel list at the counter — they will run each test on the list.</div>
        {LABS.map(lab => (
          <div key={lab.name} className="spr-lab-row">
            <span className="spr-lab-icon">{lab.icon}</span>
            <div className="spr-lab-info">
              <div className="spr-lab-name">{lab.name}</div>
              <div className="spr-lab-note">{lab.note}</div>
            </div>
            <span className="spr-coming-soon-btn">Book your test<br/><small>Coming soon</small></span>
          </div>
        ))}
      </div>

      {/* ── After testing ── */}
      <div className="spr-after-card">
        <div className="spr-after-icon">📤</div>
        <div className="spr-after-title">After Your Blood Test</div>
        <div className="spr-after-body">
          Upload your PDF report to HealthOS.<br/>
          Every biomarker is read automatically and all your data gaps fill instantly.
          Your BioAge score updates to full accuracy.
        </div>
        <button className="spr-upload-btn" onClick={() => nav('/upload')}>
          Upload Report →
        </button>
      </div>

      {/* ── Share actions ── */}
      <div className="spr-actions">
        <button className="spr-action-btn spr-copy" onClick={handleCopy}>
          📋 Copy Full Panel
        </button>
        <button className="spr-action-btn spr-wa" onClick={handleWhatsApp}>
          💬 Send to Doctor
        </button>
        <button className="spr-action-btn spr-print-full" onClick={handlePrint}>
          🖨️ Print / Save PDF
        </button>
      </div>

      <div style={{height:32}}/>
    </div>
  )
}

function PanelCard({ panel, expanded, onToggle }) {
  return (
    <div className="spr-panel" style={{borderLeftColor: panel.color}}>
      <button className="spr-panel-header" onClick={onToggle}>
        <div className="spr-ph-left">
          <div className="spr-panel-icon" style={{background:`${panel.color}22`,color:panel.color}}>
            {panel.icon}
          </div>
          <div>
            <div className="spr-panel-name">{panel.name}</div>
            <div className="spr-panel-count">{panel.tests.length} tests · {panel.costRange}</div>
          </div>
        </div>
        <div className="spr-ph-right">
          <span className="spr-fasting-tag" style={{
            background: panel.fasting ? '#fee2e2' : '#f0fdf4',
            color: panel.fasting ? '#dc2626' : '#16a34a',
          }}>
            {panel.fasting ? '🍽️ Fasting' : '✓ No fast'}
          </span>
          <span className="spr-chevron">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="spr-panel-body">
          <div className="spr-panel-sample">
            <span className="spr-sample-label">Sample type:</span> {panel.sampleType}
          </div>
          <div className="spr-why-note">{panel.whyCore}</div>
          <div className="spr-test-list">
            {panel.tests.map((t, i) => (
              <div key={i} className="spr-test-row">
                <span className="spr-test-bullet" style={{background:panel.color}} />
                <div className="spr-test-name">{t.name}</div>
                <span className="spr-test-code">{t.code}</span>
              </div>
            ))}
          </div>
          <button className="spr-book-btn" disabled>
            📅 Book your test &nbsp;·&nbsp; <span className="spr-book-cs">Coming soon</span>
          </button>
        </div>
      )}
    </div>
  )
}