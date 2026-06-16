import { useState } from 'react'
import { routeGrouped, coveragePercent, CATEGORY_META } from '../lib/dataRouter'

/* ─── Simulated live data (will come from real integrations) ─── */
const LIVE = {
  hscrp: 2.1, hba1c: 5.8, ldl: 142, vitaminD: 22,
  testosterone: 520, hrv: 58, restingHR: 72, sleep: 6.8,
  glucose: 94, bodyFat: 22.4, muscleMass: 61.2, steps: 8240,
  spO2: 97, deepSleep: 18, bioAge: 34, actualAge: 41,
}

/* ─── Disease detection rules ─── */
const ALERTS = [
  {
    id: 'prediabetes', severity: 'caution', emoji: '🩸',
    title: 'Pre-Diabetes Risk Detected',
    detail: 'HbA1c 5.8% is in the pre-diabetic range (5.7–6.4%). Left untreated, this progresses to Type 2 Diabetes in 3–5 years.',
    markers: ['HbA1c: 5.8%', 'LDL: 142 mg/dL'],
    fix: 'Walk 15 mins after every meal · Low-GI diet · Berberine 500mg 2x/day',
    retest: '90 days',
  },
  {
    id: 'vitD', severity: 'watch', emoji: '☀️',
    title: 'Vitamin D Deficiency',
    detail: 'At 22 ng/mL you are in the insufficient range. Affects 200+ genes including testosterone, immunity and bone density.',
    markers: ['Vitamin D: 22 ng/mL'],
    fix: 'Vitamin D3 5000 IU + K2 200mcg daily with your fattiest meal',
    retest: '90 days',
  },
  {
    id: 'inflammation', severity: 'watch', emoji: '🔥',
    title: 'Borderline Inflammation',
    detail: 'hsCRP 2.1 mg/L sits in the borderline zone (1–3). Chronic low-grade inflammation accelerates every hallmark of ageing.',
    markers: ['hsCRP: 2.1 mg/L'],
    fix: 'Omega-3 3g/day · Turmeric + black pepper · Cut sugar & processed food',
    retest: '90 days',
  },
]

const SEV = {
  urgent:  { bg:'#fee2e2', border:'#fca5a5', text:'#dc2626', tag:'🚨 Urgent' },
  caution: { bg:'#fff7ed', border:'#fdba74', text:'#c2410c', tag:'🟠 Caution' },
  watch:   { bg:'#fefce8', border:'#fde04788', text:'#a16207', tag:'🟡 Watch' },
}

/* ─── 7 Data Sources ─── */
const SOURCES = [
  {
    id: 'lab',
    priority: 1,
    icon: '🩸',
    name: 'Lab Reports',
    sub: 'AI reads your blood test PDF and extracts every biomarker',
    brands: '',
    weight: 50,
    connected: true,
    dataChips: ['hsCRP 2.1', 'HbA1c 5.8%', 'Vit D 22', 'LDL 142'],
    lastSync: 'Uploaded Jun 12',
    color: '#0d9488',
    grad: 'linear-gradient(135deg,#0f3a3a,#0d5151)',
    ctaLabel: 'Upload New Report',
    ctaPath: '/upload',
    biomarkers: 23,
  },
  {
    id: 'healthkit',
    priority: 2,
    icon: '❤️',
    name: 'Apple Health · Google Health',
    sub: 'One connection covers ALL your wearables instantly',
    brands: 'Apple Watch · Garmin · Fitbit · Samsung · Polar · Whoop',
    weight: 20,
    connected: true,
    dataChips: ['HRV 58ms', 'Sleep 6.8h', '8,240 steps', 'RHR 72'],
    lastSync: 'Synced 4m ago',
    color: '#3b82f6',
    grad: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
    ctaLabel: 'Manage Permissions',
    biomarkers: 8,
  },
  {
    id: 'cgm',
    priority: 3,
    icon: '📡',
    name: 'CGM — Abbott FreeStyle Libre',
    sub: 'Real-time blood glucose every 5 minutes, 24/7 for 14 days',
    brands: 'FreeStyle Libre 2 · Libre 3 · LibreView app',
    weight: 15,
    connected: false,
    dataChips: ['Glucose 24/7', 'Time in Range', 'Meal Spikes', 'Fasting Pattern'],
    lastSync: null,
    color: '#7c3aed',
    grad: 'linear-gradient(135deg,#2e1065,#4c1d95)',
    ctaLabel: 'Connect LibreView',
    badge: 'DIFFERENTIATOR',
    badgeColor: '#7c3aed',
    biomarkers: 6,
  },
  {
    id: 'ring',
    priority: 4,
    icon: '💍',
    name: 'Smart Ring',
    sub: 'Continuous HRV, deep sleep, skin temperature and recovery',
    brands: 'Ultrahuman Ring Air · Oura Ring Gen 3',
    weight: 10,
    connected: false,
    dataChips: ['HRV trend', 'Deep sleep %', 'Skin temp', 'Recovery score'],
    lastSync: null,
    color: '#b45309',
    grad: 'linear-gradient(135deg,#1c0a00,#431407)',
    ctaLabel: 'Connect Ring',
    badge: 'BEST FOR HRV',
    badgeColor: '#b45309',
    biomarkers: 7,
  },
  {
    id: 'abha',
    priority: 5,
    icon: '🇮🇳',
    name: 'ABHA — India Health Records',
    sub: 'Auto-imports all hospital labs, prescriptions and records via your health ID',
    brands: 'Ayushman Bharat · NHA · Any ABDM-registered hospital or lab',
    weight: 0,
    connected: false,
    dataChips: ['All past labs', 'Prescriptions', 'Hospital visits', 'Discharge notes'],
    lastSync: null,
    color: '#047857',
    grad: 'linear-gradient(135deg,#134e2e,#065f46)',
    ctaLabel: 'Link ABHA ID',
    badge: 'INDIA EXCLUSIVE',
    badgeColor: '#047857',
    biomarkers: 50,
  },
  {
    id: 'scale',
    priority: 6,
    icon: '⚖️',
    name: 'Smart Scale',
    sub: 'Body fat %, muscle mass, visceral fat score and bone mass',
    brands: 'Withings Body+ · Xiaomi Mi Scale · Garmin Index',
    weight: 5,
    connected: false,
    dataChips: ['Body fat %', 'Muscle mass', 'Visceral fat', 'Bone mass'],
    lastSync: null,
    color: '#475569',
    grad: 'linear-gradient(135deg,#1e293b,#334155)',
    ctaLabel: 'Connect Scale',
    biomarkers: 5,
  },
  {
    id: 'epigenetic',
    priority: 7,
    icon: '🧬',
    name: 'Epigenetic Clock Test',
    sub: 'DNA methylation analysis — the gold standard for true biological age',
    brands: 'TruDiagnostic · TruMe · Chronomics · Elysium',
    weight: 0,
    connected: false,
    dataChips: ['DNA BioAge', 'DunedinPACE', 'Telomere length', 'Methylation score'],
    lastSync: null,
    color: '#9333ea',
    grad: 'linear-gradient(135deg,#1a0533,#3b0764)',
    ctaLabel: 'Order Test Kit',
    badge: 'PREMIUM',
    badgeColor: '#9333ea',
    biomarkers: 4,
    isPremium: true,
  },
]

/* ─── Modal content per source ─── */
function LabModal({ onClose }) {
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🩸</div>
      <div className="dh-modal-title">Lab Report Upload</div>
      <div className="dh-modal-desc">Upload any blood test PDF or photo. HealthOS AI reads every biomarker automatically — works with any lab in India or worldwide.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ Dr Lal PathLabs, SRL, Thyrocare, Apollo, Metropolis</div>
        <div className="dh-ml-item">✓ Any government hospital report</div>
        <div className="dh-ml-item">✓ International labs (NHS, Quest, LabCorp)</div>
        <div className="dh-ml-item">✓ PDF files and phone photos accepted</div>
      </div>
      <button className="dh-modal-cta" onClick={onClose} style={{ background: '#0d9488' }}>
        Go to Upload Screen →
      </button>
    </div>
  )
}

function HealthKitModal({ onClose }) {
  const isIOS = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">{isIOS ? '🍎' : '🤖'}</div>
      <div className="dh-modal-title">{isIOS ? 'Apple Health' : 'Google Health Connect'}</div>
      <div className="dh-modal-desc">One permission gives HealthOS access to all your health data — from any device or app that syncs to {isIOS ? 'Apple Health' : 'Google Health Connect'}.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ HRV, resting heart rate, ECG</div>
        <div className="dh-ml-item">✓ Sleep stages (deep, REM, light)</div>
        <div className="dh-ml-item">✓ VO2 max, steps, active calories</div>
        <div className="dh-ml-item">✓ Blood oxygen (SpO2)</div>
        <div className="dh-ml-item">✓ Works with ALL your connected devices</div>
      </div>
      <div className="dh-connected-badge">● Already connected and syncing</div>
    </div>
  )
}

function CGMModal({ onClose }) {
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">📡</div>
      <div className="dh-modal-title">Abbott FreeStyle Libre</div>
      <div className="dh-modal-desc">Wear a small sensor on your upper arm for 14 days. It reads your blood sugar every 5 minutes — revealing how every meal, sleep and workout affects your metabolism.</div>
      <div className="dh-modal-steps">
        <div className="dh-step"><span className="dh-snum">1</span><span>Buy FreeStyle Libre 2 or 3 sensor (available at any pharmacy, ~₹2000)</span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Download the LibreLink app and scan to activate</span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Create a free LibreView account and enable data sharing</span></div>
        <div className="dh-step"><span className="dh-snum">4</span><span>Connect your LibreView account to HealthOS below</span></div>
      </div>
      <button className="dh-modal-cta" style={{ background: '#7c3aed' }}>
        Connect LibreView Account
      </button>
      <div className="dh-modal-note">Why CGM? Lab HbA1c is a 3-month average. CGM shows the actual spikes after each meal — the real driver of glycation and accelerated ageing.</div>
    </div>
  )
}

function RingModal({ onClose }) {
  const [brand, setBrand] = useState(null)
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">💍</div>
      <div className="dh-modal-title">Connect Smart Ring</div>
      <div className="dh-modal-desc">Smart rings are the most accurate continuous health trackers — worn 24/7 including sleep. Choose your ring brand:</div>
      <div className="dh-brand-row">
        <button className={`dh-brand-btn ${brand==='ultrahuman'?'sel':''}`} onClick={() => setBrand('ultrahuman')}>
          <span style={{fontSize:24}}>🇮🇳</span>
          <div className="dh-brand-name">Ultrahuman</div>
          <div className="dh-brand-sub">Ring Air · Made in India</div>
        </button>
        <button className={`dh-brand-btn ${brand==='oura'?'sel':''}`} onClick={() => setBrand('oura')}>
          <span style={{fontSize:24}}>⭕</span>
          <div className="dh-brand-name">Oura Ring</div>
          <div className="dh-brand-sub">Gen 3 · Global leader</div>
        </button>
      </div>
      {brand && (
        <div className="dh-modal-list" style={{marginTop:12}}>
          <div className="dh-ml-item">✓ HRV — most accurate of any wearable form factor</div>
          <div className="dh-ml-item">✓ Sleep stages: deep, REM, light, awake</div>
          <div className="dh-ml-item">✓ Skin temperature (tracks illness, ovulation, inflammation)</div>
          <div className="dh-ml-item">✓ Resting heart rate, SpO2, respiratory rate</div>
          <div className="dh-ml-item">✓ Recovery score: tells you if your body is ready to train</div>
        </div>
      )}
      <button className="dh-modal-cta" style={{ background: '#b45309', opacity: brand?1:0.5 }}>
        {brand ? `Connect ${brand === 'ultrahuman' ? 'Ultrahuman' : 'Oura'} Account` : 'Select a ring brand above'}
      </button>
    </div>
  )
}

function AbhaModal({ onClose }) {
  const [abhaId, setAbhaId] = useState('')
  const [step, setStep] = useState(0)

  function formatAbha(val) {
    const digits = val.replace(/\D/g, '').slice(0, 14)
    return digits.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4')
      .replace(/(\d{2})(\d{4})(\d{4})(\d*)/, '$1-$2-$3-$4')
      .replace(/(\d{2})(\d{4})(\d*)/, '$1-$2-$3')
      .replace(/(\d{2})(\d*)/, '$1-$2')
  }

  const digits = abhaId.replace(/\D/g, '')

  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🇮🇳</div>
      <div className="dh-modal-title">Link ABHA Health ID</div>
      {step === 0 ? (
        <>
          <div className="dh-modal-desc">Your ABHA (Ayushman Bharat Health Account) ID links all your health records from any hospital, clinic or lab registered with ABDM — imported automatically, no uploading needed.</div>
          <div className="dh-modal-list">
            <div className="dh-ml-item">✓ All past lab reports from registered labs</div>
            <div className="dh-ml-item">✓ Hospital discharge summaries</div>
            <div className="dh-ml-item">✓ Prescription history</div>
            <div className="dh-ml-item">✓ Doctor visit records</div>
            <div className="dh-ml-item">✗ We cannot access: financial records or Aadhaar details</div>
          </div>
          <div className="dh-abha-input-wrap">
            <label className="dh-abha-label">Your 14-digit ABHA ID</label>
            <input
              className="dh-abha-input"
              placeholder="XX-XXXX-XXXX-XXXX"
              value={abhaId}
              onChange={e => setAbhaId(formatAbha(e.target.value))}
              maxLength={17}
            />
          </div>
          <button
            className="dh-modal-cta"
            style={{ background: '#047857', opacity: digits.length === 14 ? 1 : 0.45 }}
            disabled={digits.length !== 14}
            onClick={() => setStep(1)}
          >
            Send Consent Request →
          </button>
          <div className="dh-modal-note">Don't have an ABHA ID? Create one free at abha.abdm.gov.in · Takes 2 minutes with your Aadhaar or phone number.</div>
        </>
      ) : (
        <>
          <div className="dh-modal-desc" style={{textAlign:'center',paddingTop:12}}>
            <div style={{fontSize:48,marginBottom:12}}>📲</div>
            <strong>Consent Request Sent!</strong><br/><br/>
            Open your <strong>ABDM Health app or Aarogya Setu</strong> and approve the request from HealthOS to share your health records.<br/><br/>
            Once you approve, your records will import automatically in 2–5 minutes.
          </div>
          <div className="dh-connected-badge" style={{background:'#dcfce7',color:'#15803d',borderColor:'#86efac'}}>
            Waiting for your approval in ABDM app...
          </div>
        </>
      )}
    </div>
  )
}

function ScaleModal({ onClose }) {
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚖️</div>
      <div className="dh-modal-title">Connect Smart Scale</div>
      <div className="dh-modal-desc">A smart scale measures body fat %, muscle mass, visceral fat, and bone density — data that directly tracks whether your longevity protocol is working at the body composition level.</div>
      <div className="dh-brand-row">
        <button className="dh-brand-btn">
          <span style={{fontSize:24}}>🔵</span>
          <div className="dh-brand-name">Withings</div>
          <div className="dh-brand-sub">Body+ / Body Scan</div>
        </button>
        <button className="dh-brand-btn">
          <span style={{fontSize:24}}>🔴</span>
          <div className="dh-brand-name">Xiaomi</div>
          <div className="dh-brand-sub">Mi Scale 2 / S400</div>
        </button>
      </div>
      <div className="dh-modal-list" style={{marginTop:12}}>
        <div className="dh-ml-item">✓ Body fat % — ideal for longevity: 10–20% (men), 18–28% (women)</div>
        <div className="dh-ml-item">✓ Muscle mass — preserving this is anti-ageing priority #1</div>
        <div className="dh-ml-item">✓ Visceral fat score — fat around organs drives inflammation</div>
        <div className="dh-ml-item">✓ Bone mass — declines from age 35 without strength training</div>
      </div>
      <button className="dh-modal-cta" style={{ background: '#475569' }}>
        Connect Scale Account
      </button>
    </div>
  )
}

function EpigeneticModal({ onClose }) {
  return (
    <div className="dh-modal-body">
      <div style={{background:'linear-gradient(135deg,#1a0533,#3b0764)',borderRadius:16,padding:'20px 16px',marginBottom:16,textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:8}}>🧬</div>
        <div style={{color:'#e9d5ff',fontWeight:700,fontSize:17}}>Epigenetic Clock Testing</div>
        <div style={{color:'#c4b5fd',fontSize:13,marginTop:4}}>The most scientifically accurate BioAge measurement on Earth</div>
      </div>
      <div className="dh-modal-desc">A single blood or saliva sample reveals your DNA methylation patterns — the true biological clock inside every cell. Used by longevity researchers including David Sinclair, Peter Attia and the Buck Institute.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ DunedinPACE — measures how fast you're ageing right now</div>
        <div className="dh-ml-item">✓ Horvath Clock — your cumulative epigenetic age</div>
        <div className="dh-ml-item">✓ GrimAge — predicts healthspan and lifespan</div>
        <div className="dh-ml-item">✓ Updates your BioAge with lab-grade precision</div>
      </div>
      <div className="dh-epig-labs">
        <div className="dh-epig-lab"><strong>TruDiagnostic</strong><br/><span>Global leader · ~$299</span></div>
        <div className="dh-epig-lab"><strong>TruMe</strong><br/><span>India-based · ~₹8,999</span></div>
      </div>
      <div className="dh-modal-steps" style={{marginTop:8}}>
        <div className="dh-step"><span className="dh-snum">1</span><span>Order test kit (ships to your home)</span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Collect blood/saliva sample at home</span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Ship the kit back (prepaid label included)</span></div>
        <div className="dh-step"><span className="dh-snum">4</span><span>Results arrive in ~3 weeks · Import PDF to HealthOS</span></div>
      </div>
      <button className="dh-modal-cta" style={{ background:'linear-gradient(90deg,#7c3aed,#9333ea)' }}>
        Order Test Kit →
      </button>
      <button className="dh-modal-cta" style={{ background:'#1e1b4b',marginTop:8 }}>
        I have results — Upload PDF
      </button>
    </div>
  )
}

const MODALS = { lab: LabModal, healthkit: HealthKitModal, cgm: CGMModal, ring: RingModal, abha: AbhaModal, scale: ScaleModal, epigenetic: EpigeneticModal }

/* ─── Pulse dot for connected sources ─── */
function PulseDot({ color }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ width:8, height:8, borderRadius:'50%', background:color, display:'block', position:'relative', zIndex:1 }} />
      <span className="dh-pulse-ring" style={{ borderColor:color }} />
    </span>
  )
}

/* ─── Mini glucose sparkline (fake curve, visual only) ─── */
function GlucoseCurve() {
  const pts = [88,92,94,138,122,104,95,91,94,88,92,96,130,116,100,94]
  const h=36, w=120, min=80, max=145
  const path = pts.map((v,i) => {
    const x = (i/(pts.length-1))*w
    const y = h - ((v-min)/(max-min))*h
    return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{display:'block'}}>
      <rect x="0" y={h-((140-min)/(max-min))*h} width={w} height={((140-70)/(max-min))*h} fill="#dcfce7" opacity="0.5" rx="2"/>
      <path d={path} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={((pts.length-1)/(pts.length-1))*w} cy={h-((pts[pts.length-1]-min)/(max-min))*h} r="3" fill="#7c3aed"/>
    </svg>
  )
}

export default function Screen4() {
  const [openModal, setOpenModal]     = useState(null)
  const [expanded, setExpanded]       = useState({})
  const [alertsClosed, setAlertsClosed] = useState(false)
  const [connections, setConnections] = useState({ lab: true, healthkit: true })
  const [showLabPanel, setShowLabPanel] = useState(false)
  const [covTab, setCovTab]           = useState('covered')

  const ModalComp = openModal ? MODALS[openModal] : null
  const connectedSources = SOURCES.filter(s => connections[s.id])
  const availableSources = SOURCES.filter(s => !connections[s.id])
  const dataWeight = connectedSources.reduce((sum, s) => sum + s.weight, 0)

  // Smart routing — computed from connected sources
  const connectedIds = Object.keys(connections).filter(k => connections[k])
  const grouped      = routeGrouped(connectedIds)
  const coverage     = coveragePercent(connectedIds)
  const allLabRequired = Object.values(grouped).flatMap(g => g.labRequired)

  return (
    <div className="screen" style={{gap:0,padding:'18px 0 90px',background:'#f8fafc'}}>

      {/* ── Header ── */}
      <div className="dh-header">
        <div>
          <div className="dh-h-title">Data Sources</div>
          <div className="dh-h-sub">
            <PulseDot color="#14b8a6" />
            <span style={{marginLeft:6}}>{connectedSources.length} connected · syncing live</span>
          </div>
        </div>
        <div className="dh-h-badge">{dataWeight}% accurate</div>
      </div>

      {/* ── BioAge confidence bar ── */}
      <div className="dh-section">
        <div className="dh-conf-card">
          <div className="dh-conf-row">
            <span className="dh-conf-label">BioAge data confidence</span>
            <span className="dh-conf-val">{dataWeight}%</span>
          </div>
          <div className="dh-conf-track">
            <div className="dh-conf-fill" style={{width:`${dataWeight}%`}} />
          </div>
          <div className="dh-conf-segments">
            {SOURCES.map(s => (
              <div key={s.id} className="dh-seg" style={{
                flex: s.weight || 0,
                background: connections[s.id] ? s.color : '#e2e8f0',
                opacity: connections[s.id] ? 1 : 0.5,
              }} title={`${s.name}: ${s.weight}%`} />
            ))}
          </div>
          <div className="dh-conf-legend">
            <span>🩸 Labs 50%</span><span>❤️ Wearable 30%</span><span>🧬 DNA 20%</span>
          </div>
          {dataWeight < 70 && (
            <div className="dh-conf-tip">Connect more sources to improve BioAge accuracy</div>
          )}
        </div>
      </div>

      {/* ── Disease Alerts ── */}
      {!alertsClosed && (
        <div className="dh-section">
          <div className="dh-section-head">
            <span>⚕️ Health Alerts <span className="dh-alert-count">{ALERTS.length}</span></span>
            <button className="dh-dismiss" onClick={() => setAlertsClosed(true)}>Dismiss all</button>
          </div>
          {ALERTS.map(a => {
            const s = SEV[a.severity]
            const isOpen = expanded[a.id]
            return (
              <div key={a.id} className="dh-alert-card" style={{background:s.bg,borderColor:s.border}}
                onClick={() => setExpanded(p=>({...p,[a.id]:!p[a.id]}))}>
                <div className="dh-alert-top">
                  <span className="dh-alert-emoji">{a.emoji}</span>
                  <div className="dh-alert-info">
                    <div className="dh-alert-title" style={{color:s.text}}>{a.title}</div>
                    <div className="dh-alert-markers">{a.markers.join(' · ')}</div>
                  </div>
                  <span className="dh-alert-sev" style={{background:s.text}}>{a.severity === 'caution' ? '🟠' : '🟡'}</span>
                </div>
                {isOpen && (
                  <div className="dh-alert-body">
                    <div className="dh-alert-detail">{a.detail}</div>
                    <div className="dh-alert-fix-head">What to do:</div>
                    <div className="dh-alert-fix">{a.fix}</div>
                    <div className="dh-alert-retest">Retest in: {a.retest}</div>
                    <div className="dh-alert-disclaimer">Not a medical diagnosis · Confirm with your doctor</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Connected Sources ── */}
      <div className="dh-section">
        <div className="dh-section-head"><span>Connected Sources</span></div>

        {connectedSources.map(s => (
          <div key={s.id} className="dh-source-card dh-source-connected"
            style={{background:s.grad}}>
            <div className="dh-sc-top">
              <div className="dh-sc-left">
                <span className="dh-sc-icon">{s.icon}</span>
                <div>
                  <div className="dh-sc-name">{s.name}</div>
                  <div className="dh-sc-sync">
                    <PulseDot color="#4ade80" />
                    <span style={{marginLeft:5,color:'#86efac',fontSize:11}}>{s.lastSync}</span>
                  </div>
                </div>
              </div>
              <div className="dh-sc-biomarkers">{s.biomarkers}<br/><span style={{fontSize:9,opacity:0.7}}>markers</span></div>
            </div>

            {/* Live data chips */}
            <div className="dh-chip-row">
              {s.dataChips.map(c => (
                <span key={c} className="dh-chip">{c}</span>
              ))}
            </div>

            {/* Special: CGM glucose curve */}
            {s.id === 'cgm' && (
              <div className="dh-cgm-preview">
                <GlucoseCurve />
                <div className="dh-cgm-stats">
                  <span>Current: 94 mg/dL</span>
                  <span>TIR: 87%</span>
                </div>
              </div>
            )}

            <button className="dh-sc-cta" onClick={() => setOpenModal(s.id)}>
              {s.ctaLabel}
            </button>
          </div>
        ))}
      </div>

      {/* ── Available Sources ── */}
      <div className="dh-section">
        <div className="dh-section-head"><span>Connect More Data</span></div>

        {availableSources.map(s => (
          <div key={s.id} className="dh-source-card dh-source-available">
            <div className="dh-sc-top">
              <div className="dh-sc-left">
                <div className="dh-av-icon-wrap" style={{background:`${s.color}22`,border:`1.5px solid ${s.color}44`}}>
                  <span className="dh-sc-icon">{s.icon}</span>
                </div>
                <div>
                  <div className="dh-av-name">{s.name}</div>
                  {s.badge && (
                    <span className="dh-badge" style={{background:`${s.badgeColor}22`,color:s.badgeColor,borderColor:`${s.badgeColor}55`}}>
                      {s.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="dh-av-plus" style={{color:s.color}}>+{s.biomarkers}<br/><span style={{fontSize:9,color:'#94a3b8'}}>markers</span></div>
            </div>
            <div className="dh-av-sub">{s.sub}</div>
            {s.brands && <div className="dh-av-brands">{s.brands}</div>}
            <div className="dh-chip-row" style={{marginTop:8}}>
              {s.dataChips.map(c => (
                <span key={c} className="dh-chip dh-chip-grey">{c}</span>
              ))}
            </div>
            <button
              className="dh-av-cta"
              style={{borderColor:s.color,color:s.color,background:`${s.color}11`}}
              onClick={() => setOpenModal(s.id)}
            >
              {s.isPremium ? '🔒 ' : ''}{s.ctaLabel}
            </button>
          </div>
        ))}
      </div>

      {/* ── Coverage Map ── */}
      <div className="dh-section" style={{marginTop:8}}>
        <div className="dh-section-head">
          <span>📊 Biomarker Coverage</span>
          <span style={{fontSize:12,color:'#0d9488',fontWeight:700}}>{coverage}% covered</span>
        </div>

        {/* Tab bar */}
        <div className="dh-cov-tabs">
          <button className={`dh-cov-tab ${covTab==='covered'?'active':''}`} onClick={()=>setCovTab('covered')}>
            ✓ Tracking ({Object.values(grouped).flatMap(g=>g.covered).length})
          </button>
          <button className={`dh-cov-tab ${covTab==='missing'?'active':''}`} onClick={()=>setCovTab('missing')}>
            ⚡ Gaps ({allLabRequired.length})
          </button>
        </div>

        {Object.entries(grouped).map(([cat, {covered, labRequired}]) => {
          const meta = CATEGORY_META[cat] || { icon: '•', color: '#64748b' }
          const list = covTab === 'covered' ? covered : labRequired
          if (!list.length) return null
          return (
            <div key={cat} className="dh-cov-group">
              <div className="dh-cov-cat" style={{color: meta.color}}>
                {meta.icon} {cat}
              </div>
              {list.map(bm => (
                <div key={bm.id} className={`dh-cov-row ${covTab==='covered'?'dh-cov-ok':'dh-cov-gap'}`}>
                  <span className="dh-cov-icon">{bm.icon}</span>
                  <div className="dh-cov-info">
                    <span className="dh-cov-name">{bm.name}</span>
                    {covTab==='covered' && bm.via && (
                      <span className="dh-cov-via"
                        style={{background: bm.qualityMeta.color+'22', color: bm.qualityMeta.color}}>
                        {bm.via.icon} {bm.via.label} · {bm.qualityMeta.label}
                      </span>
                    )}
                    {covTab==='missing' && (
                      <span className="dh-cov-via" style={{background:'#fee2e2',color:'#dc2626'}}>
                        Not tracked — add to lab panel below
                      </span>
                    )}
                  </div>
                  <span style={{fontSize:16}}>{covTab==='covered'?'✅':'➕'}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* ── Smart Lab Panel ── */}
      {allLabRequired.length > 0 && (
        <div className="dh-section" style={{marginTop:4}}>
          <div className="dh-lab-panel-card">
            <div className="dh-lp-header">
              <div>
                <div className="dh-lp-title">🧾 Your Smart Lab Panel</div>
                <div className="dh-lp-sub">Auto-generated from your missing data gaps</div>
              </div>
              <button className="dh-lp-toggle" onClick={()=>setShowLabPanel(p=>!p)}>
                {showLabPanel ? 'Hide ▲' : 'Show ▼'}
              </button>
            </div>

            <div className="dh-lp-banner">
              HealthOS found <strong>{allLabRequired.length} biomarkers</strong> not covered by your connected devices.
              Add the tests below to your next blood test to fill the gaps.
            </div>

            {showLabPanel && (
              <>
                {allLabRequired.map((bm, i) => (
                  <div key={bm.id} className="dh-lp-item">
                    <div className="dh-lp-num">{i+1}</div>
                    <div className="dh-lp-content">
                      <div className="dh-lp-test">{bm.icon} {bm.labTest.test}</div>
                      <div className="dh-lp-why">{bm.labTest.why}</div>
                      <div className="dh-lp-interval">Every {bm.labTest.interval}</div>
                    </div>
                  </div>
                ))}

                <div className="dh-lp-actions">
                  <button className="dh-lp-copy" onClick={() => {
                    const text = allLabRequired.map((b,i) => `${i+1}. ${b.labTest.test}`).join('\n')
                    navigator.clipboard?.writeText(`My HealthOS Lab Panel:\n\n${text}\n\nPlease include in my next blood test. Thank you.`)
                      .then(() => alert('Copied! Paste this to share with your doctor or lab.'))
                  }}>
                    📋 Copy for Doctor / Lab
                  </button>
                  <button className="dh-lp-share" onClick={() => {
                    const text = encodeURIComponent(
                      `My HealthOS recommended tests:\n\n` +
                      allLabRequired.slice(0,8).map((b,i) => `${i+1}. ${b.labTest.test}`).join('\n') +
                      `\n\nTracking my biological age reversal via HealthOS`
                    )
                    window.open(`https://wa.me/?text=${text}`, '_blank')
                  }}>
                    💬 Send to WhatsApp
                  </button>
                </div>

                <div className="dh-lp-note">
                  Tip: Take this list to Dr Lal PathLabs, SRL, or Thyrocare. Most panels cost ₹1500–4000 and cover all these markers.
                  Upload your results here and HealthOS fills all the gaps automatically.
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Generate Smart Panel CTA ── */}
      <div className="dh-section" style={{marginTop:8}}>
        <button className="dh-smart-panel-btn" onClick={() => window.location.href = '/smart-panel'}>
          <div className="dh-spb-left">
            <span style={{fontSize:28}}>🧾</span>
            <div>
              <div className="dh-spb-title">Generate Smart Lab Panel</div>
              <div className="dh-spb-sub">
                {allLabRequired.length} missing parameters → auto-organized into a printable test report
              </div>
            </div>
          </div>
          <span className="dh-spb-arrow">→</span>
        </button>
      </div>

      {/* ── Bottom note ── */}
      <div style={{padding:'16px 18px 8px',fontSize:12,color:'#94a3b8',textAlign:'center',lineHeight:1.5}}>
        🔒 Your data is encrypted and private. We only read what you explicitly allow. You can disconnect any source anytime.
      </div>

      {/* ── Modal overlay ── */}
      {ModalComp && (
        <div className="dh-overlay" onClick={() => setOpenModal(null)}>
          <div className="dh-sheet" onClick={e => e.stopPropagation()}>
            <button className="dh-sheet-close" onClick={() => setOpenModal(null)}>✕</button>
            <ModalComp onClose={() => setOpenModal(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
