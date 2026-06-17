import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildReport } from '../lib/reportGenerator'

const ALL_PANELS = buildReport([]).panels

const TIME_SLOTS = [
  '7:00 AM – 8:00 AM',
  '8:00 AM – 9:00 AM',
  '9:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
]

const PRIORITY_LABEL = {
  1: { tag: 'CORE',     bg: '#fee2e2', color: '#dc2626' },
  2: { tag: 'ADVANCED', bg: '#f5f3ff', color: '#7c3aed' },
  3: { tag: 'PREMIUM',  bg: '#fdf4ff', color: '#9333ea' },
}

function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function LabDoorstepScreen() {
  const nav = useNavigate()
  const [expandedPanel, setExpandedPanel] = useState(null)
  const [selectedPanels, setSelectedPanels] = useState(
    new Set(ALL_PANELS.filter(p => p.priority === 1).map(p => p.id))
  )
  const [form, setForm] = useState({
    name: '', mobile: '', address: '', city: '', pincode: '',
    date: tomorrow(), slot: '',
  })
  const [step, setStep]         = useState('browse') // browse | form | confirm
  const [submitted, setSubmitted] = useState(false)

  const chosen = ALL_PANELS.filter(p => selectedPanels.has(p.id))
  const totalTests = chosen.reduce((s, p) => s + p.tests.length, 0)
  const costMin = chosen.reduce((s, p) => {
    const m = p.costRange.match(/₹([\d,]+)/)
    return s + (m ? parseInt(m[1].replace(',', '')) : 0)
  }, 0)
  const costMax = chosen.reduce((s, p) => {
    const all = [...p.costRange.matchAll(/₹([\d,]+)/g)]
    const last = all[all.length - 1]
    return s + (last ? parseInt(last[1].replace(',', '')) : 0)
  }, 0)

  function togglePanel(id) {
    setSelectedPanels(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setStep('confirm')
  }

  const formValid = form.name && form.mobile.length >= 10 && form.address && form.city && form.pincode && form.date && form.slot && chosen.length > 0

  return (
    <div className="ld-root">

      {/* ── Medical disclaimer ── */}
      <div className="ld-edu-banner">
        ⚕️ <strong>For educational awareness.</strong> This panel is a suggested guide to discuss with your doctor — not a medical prescription. Always consult your doctor before ordering tests.
      </div>

      {/* ── Top bar ── */}
      <div className="ld-topbar">
        <button className="ld-back" onClick={() => nav('/upload')}>← Back</button>
        <span className="ld-topbar-title">Lab at Your Doorstep</span>
        <span className="ld-topbar-badge">Coming soon</span>
      </div>

      {/* ── Hero ── */}
      <div className="ld-hero">
        <div className="ld-hero-icon">🏠🔬</div>
        <div className="ld-hero-title">Home Sample Collection</div>
        <div className="ld-hero-sub">
          A certified phlebotomist visits your home · collects blood samples ·
          results uploaded directly to your AROGYOS BioAge score
        </div>
        <div className="ld-hero-stats">
          <div className="ld-stat"><span className="ld-stat-n">30 min</span><span className="ld-stat-l">Visit time</span></div>
          <div className="ld-stat-div"/>
          <div className="ld-stat"><span className="ld-stat-n">5–8</span><span className="ld-stat-l">Tubes drawn</span></div>
          <div className="ld-stat-div"/>
          <div className="ld-stat"><span className="ld-stat-n">24–48 h</span><span className="ld-stat-l">Results</span></div>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="ld-steps">
        <div className={`ld-step-item ${step === 'browse' || step === 'form' || step === 'confirm' ? 'done' : ''}`}>
          <span className="ld-step-dot">1</span>
          <span className="ld-step-label">Select Tests</span>
        </div>
        <div className="ld-step-line"/>
        <div className={`ld-step-item ${step === 'form' || step === 'confirm' ? 'done' : ''}`}>
          <span className="ld-step-dot">2</span>
          <span className="ld-step-label">Your Details</span>
        </div>
        <div className="ld-step-line"/>
        <div className={`ld-step-item ${step === 'confirm' ? 'done' : ''}`}>
          <span className="ld-step-dot">3</span>
          <span className="ld-step-label">Confirm</span>
        </div>
      </div>

      {/* ══════ STEP 1 — SELECT TESTS ══════ */}
      {step === 'browse' && (
        <>
          <div className="ld-section-title">
            📋 Choose Your Test Panels
            <span className="ld-section-sub">{chosen.length} panel{chosen.length !== 1 ? 's' : ''} · {totalTests} tests selected</span>
          </div>

          {ALL_PANELS.map(panel => {
            const pri = PRIORITY_LABEL[panel.priority]
            const isSelected = selectedPanels.has(panel.id)
            const isOpen = expandedPanel === panel.id
            return (
              <div key={panel.id} className={`ld-panel ${isSelected ? 'ld-panel-on' : 'ld-panel-off'}`} style={{ borderLeftColor: panel.color }}>
                <div className="ld-panel-header">
                  <label className="ld-panel-check">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePanel(panel.id)}
                    />
                    <span className="ld-checkmark" style={{ '--c': panel.color }} />
                  </label>
                  <div className="ld-panel-icon" style={{ background: `${panel.color}22`, color: panel.color }}>
                    {panel.icon}
                  </div>
                  <div className="ld-panel-meta">
                    <div className="ld-panel-name">{panel.name}</div>
                    <div className="ld-panel-info">
                      <span className="ld-pri-tag" style={{ background: pri.bg, color: pri.color }}>{pri.tag}</span>
                      <span className="ld-panel-count">{panel.tests.length} tests</span>
                      <span className="ld-panel-cost">{panel.costRange}</span>
                    </div>
                  </div>
                  <button className="ld-expand-btn" onClick={() => setExpandedPanel(isOpen ? null : panel.id)}>
                    {isOpen ? '▲' : '▼'}
                  </button>
                </div>

                {isOpen && (
                  <div className="ld-panel-body">
                    <div className="ld-panel-why">{panel.whyCore}</div>
                    <div className="ld-panel-sample">
                      <span className="ld-sample-tag">{panel.fasting ? '🍽️ Fasting required' : '✓ No fasting needed'}</span>
                      <span className="ld-sample-type">{panel.sampleType}</span>
                    </div>
                    <div className="ld-test-list">
                      {panel.tests.map((t, i) => (
                        <div key={i} className="ld-test-row">
                          <span className="ld-test-dot" style={{ background: panel.color }} />
                          <span className="ld-test-name">{t.name}</span>
                          <span className="ld-test-code">{t.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Cost bar + Next */}
          <div className="ld-cost-bar">
            <div>
              <div className="ld-cb-label">Estimated cost</div>
              <div className="ld-cb-range">₹{costMin.toLocaleString('en-IN')} – ₹{costMax.toLocaleString('en-IN')}</div>
              <div className="ld-cb-note">{totalTests} tests · home collection included</div>
            </div>
            <button
              className="ld-next-btn"
              disabled={chosen.length === 0}
              onClick={() => setStep('form')}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* ══════ STEP 2 — ORDER DETAILS ══════ */}
      {step === 'form' && (
        <>
          <div className="ld-section-title">
            📝 Delivery & Schedule Details
          </div>

          {/* Summary chips */}
          <div className="ld-order-summary">
            <div className="ld-os-title">Your selected panels:</div>
            <div className="ld-os-chips">
              {chosen.map(p => (
                <span key={p.id} className="ld-os-chip" style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}44` }}>
                  {p.icon} {p.name}
                </span>
              ))}
            </div>
            <div className="ld-os-totals">
              <span>{totalTests} tests total</span>
              <span>·</span>
              <span>₹{costMin.toLocaleString('en-IN')} – ₹{costMax.toLocaleString('en-IN')}</span>
              <button className="ld-edit-link" onClick={() => setStep('browse')}>Edit ✏️</button>
            </div>
          </div>

          <form className="ld-form" onSubmit={handleSubmit}>
            <div className="ld-field">
              <label className="ld-label">Full Name</label>
              <input className="ld-input" placeholder="As on ID proof" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="ld-field">
              <label className="ld-label">Mobile Number</label>
              <input className="ld-input" type="tel" placeholder="10-digit mobile" maxLength={10} value={form.mobile}
                onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))} />
            </div>

            <div className="ld-field">
              <label className="ld-label">Home Address</label>
              <textarea className="ld-textarea" placeholder="Flat / house no., street, landmark" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>

            <div className="ld-row">
              <div className="ld-field" style={{ flex: 1 }}>
                <label className="ld-label">City</label>
                <input className="ld-input" placeholder="City" value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="ld-field" style={{ width: 110 }}>
                <label className="ld-label">Pincode</label>
                <input className="ld-input" placeholder="6 digits" maxLength={6} value={form.pincode}
                  onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))} />
              </div>
            </div>

            <div className="ld-field">
              <label className="ld-label">Preferred Date</label>
              <input className="ld-input" type="date" min={tomorrow()} value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>

            <div className="ld-field">
              <label className="ld-label">Preferred Time Slot</label>
              <div className="ld-slots">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button"
                    className={`ld-slot ${form.slot === slot ? 'ld-slot-on' : ''}`}
                    onClick={() => setForm(f => ({ ...f, slot }))}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="ld-fasting-note">
              ⏰ <strong>Fasting reminder:</strong> {chosen.some(p => p.fasting)
                ? 'Some of your selected tests require 10–12 hours fasting. Stop eating by 9 PM the night before.'
                : 'None of your selected tests require fasting.'}
            </div>

            <button type="submit" className="ld-submit-btn" disabled={!formValid}>
              📅 Confirm Order
            </button>

            <button type="button" className="ld-back-link" onClick={() => setStep('browse')}>
              ← Back to test selection
            </button>
          </form>
        </>
      )}

      {/* ══════ STEP 3 — CONFIRMATION ══════ */}
      {step === 'confirm' && (
        <div className="ld-confirm">
          <div className="ld-confirm-icon">🎉</div>
          <div className="ld-confirm-title">You're on the list!</div>
          <div className="ld-confirm-body">
            Home sample collection is launching soon. We've saved your order details and will notify you on
            <strong> {form.mobile}</strong> as soon as this service goes live in <strong>{form.city || 'your city'}</strong>.
          </div>

          <div className="ld-confirm-card">
            <div className="ld-cc-row"><span className="ld-cc-l">Name</span><span className="ld-cc-v">{form.name}</span></div>
            <div className="ld-cc-row"><span className="ld-cc-l">Address</span><span className="ld-cc-v">{form.address}, {form.city} – {form.pincode}</span></div>
            <div className="ld-cc-row"><span className="ld-cc-l">Date</span><span className="ld-cc-v">{new Date(form.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span></div>
            <div className="ld-cc-row"><span className="ld-cc-l">Slot</span><span className="ld-cc-v">{form.slot}</span></div>
            <div className="ld-cc-row"><span className="ld-cc-l">Panels</span><span className="ld-cc-v">{chosen.length} panels · {totalTests} tests</span></div>
            <div className="ld-cc-row"><span className="ld-cc-l">Est. Cost</span><span className="ld-cc-v">₹{costMin.toLocaleString('en-IN')} – ₹{costMax.toLocaleString('en-IN')}</span></div>
          </div>

          <div className="ld-confirm-chips">
            {chosen.map(p => (
              <span key={p.id} className="ld-os-chip" style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}44` }}>
                {p.icon} {p.name}
              </span>
            ))}
          </div>

          <div className="ld-confirm-note">
            While you wait — upload any existing lab reports to AROGYOS. Every biomarker you already have fills your BioAge score right now.
          </div>

          <button className="ld-confirm-cta" onClick={() => nav('/upload')}>
            Upload Existing Reports →
          </button>
          <button className="ld-confirm-home" onClick={() => nav('/')}>
            Back to Home
          </button>
        </div>
      )}

      <div style={{ height: 90 }} />
    </div>
  )
}
