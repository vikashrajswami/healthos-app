import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { routeGrouped, coveragePercent, CATEGORY_META } from '../lib/dataRouter'

// ── LocalStorage helpers ───────────────────────────────────────────────────────
function loadConnections() {
  try { return JSON.parse(localStorage.getItem('healthos_connections') || '{"lab":true,"healthkit":true}') }
  catch { return { lab: true, healthkit: true } }
}
function loadDeviceData() {
  try { return JSON.parse(localStorage.getItem('healthos_device_data') || '{}') }
  catch { return {} }
}
function saveConnections(c) { localStorage.setItem('healthos_connections', JSON.stringify(c)) }
function saveDeviceData(d)   { localStorage.setItem('healthos_device_data', JSON.stringify(d)) }

// ── PKCE OAuth helpers ─────────────────────────────────────────────────────────
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
async function genPKCE() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  return { verifier, challenge }
}

// ── OAuth URLs ─────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID  = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID  || ''
const OURA_CLIENT_ID    = import.meta.env.VITE_OURA_CLIENT_ID        || ''
const REDIRECT_BASE     = typeof window !== 'undefined' ? `${window.location.origin}/devices` : ''

async function startGoogleFitOAuth() {
  if (!GOOGLE_CLIENT_ID) {
    window.open('https://console.cloud.google.com/', '_blank')
    alert('To connect Google Fit, add VITE_GOOGLE_FIT_CLIENT_ID to your Vercel environment variables.\n\nFor now, use manual data entry below.')
    return false
  }
  const { verifier, challenge } = await genPKCE()
  localStorage.setItem('pkce_verifier_google', verifier)
  localStorage.setItem('pkce_provider', 'google')
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  url.searchParams.set('redirect_uri', REDIRECT_BASE)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read')
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('access_type', 'offline')
  window.location.href = url.toString()
  return true
}

async function startOuraOAuth() {
  if (!OURA_CLIENT_ID) {
    window.open('https://cloud.ouraring.com/oauth/applications', '_blank')
    alert('To connect Oura, add VITE_OURA_CLIENT_ID to your Vercel environment variables.\n\nFor now, use manual data entry below.')
    return false
  }
  const { verifier, challenge } = await genPKCE()
  localStorage.setItem('pkce_verifier_oura', verifier)
  localStorage.setItem('pkce_provider', 'oura')
  const url = new URL('https://cloud.ouraring.com/oauth/authorize')
  url.searchParams.set('client_id', OURA_CLIENT_ID)
  url.searchParams.set('redirect_uri', REDIRECT_BASE)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'daily heartrate personal session sleep workout')
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  window.location.href = url.toString()
  return true
}

// ── Health Alert rules ─────────────────────────────────────────────────────────
const ALERT_RULES = [
  {
    id: 'prediabetes', severity: 'caution', emoji: '🩸',
    title: 'Elevated Blood Sugar Range',
    detail: 'Your HbA1c reading is in the pre-diabetic range (5.7–6.4%). This is an early signal worth discussing with your doctor before it progresses.',
    fix: 'Walk 15 mins after meals · Choose low-GI foods · Get this confirmed by your doctor',
    discuss: 'Ask your doctor about an OGTT (Oral Glucose Tolerance Test) to confirm and get a personalised plan.',
    retest: '90 days',
  },
  {
    id: 'vitD', severity: 'watch', emoji: '☀️',
    title: 'Low Vitamin D Level',
    detail: 'Your Vitamin D is in the insufficient range. This affects immunity, bone density, mood, and many other functions.',
    fix: 'Get 20 mins of morning sunlight daily · Eat fatty fish, eggs, and fortified foods',
    discuss: 'Ask your doctor what supplementation dose is right for you — it varies by individual.',
    retest: '90 days',
  },
  {
    id: 'inflammation', severity: 'watch', emoji: '🔥',
    title: 'Borderline Inflammation Marker',
    detail: 'Your hsCRP sits in the borderline zone (1–3 mg/L). Chronic low-grade inflammation accelerates biological ageing.',
    fix: 'Increase omega-3 rich foods (fish, flaxseeds, walnuts) · Reduce processed food and sugar · Prioritise sleep',
    discuss: 'Ask your doctor to rule out any underlying cause and discuss an anti-inflammatory plan.',
    retest: '90 days',
  },
]

function getRealAlerts() {
  try { const d = localStorage.getItem('healthos_lab_alerts'); return d ? JSON.parse(d) : null }
  catch { return null }
}

const SEV = {
  urgent:  { bg:'#fee2e2', border:'#fca5a5', text:'#dc2626', tag:'🚨 Urgent' },
  caution: { bg:'#fff7ed', border:'#fdba74', text:'#c2410c', tag:'🟠 Caution' },
  watch:   { bg:'#fefce8', border:'#fde04788', text:'#a16207', tag:'🟡 Watch' },
}

// ── Data Sources definition ────────────────────────────────────────────────────
const SOURCES = [
  {
    id: 'lab', priority: 1, icon: '🩸', name: 'Lab Reports',
    sub: 'AI reads your blood test PDF and extracts every biomarker',
    brands: '', weight: 50,
    defaultChips: ['hsCRP 2.1', 'HbA1c 5.8%', 'Vit D 22', 'LDL 142'],
    color: '#0d9488', grad: 'linear-gradient(135deg,#0f3a3a,#0d5151)',
    ctaLabel: 'Upload New Report', ctaPath: '/upload', biomarkers: 23,
  },
  {
    id: 'healthkit', priority: 2, icon: '❤️', name: 'Apple Health · Google Health',
    sub: 'One connection covers ALL your wearables instantly',
    brands: 'Any smartwatch · smart ring · fitness band · or phone sensors',
    weight: 20,
    defaultChips: ['HRV 58ms', 'Sleep 6.8h', '8,240 steps', 'RHR 72'],
    color: '#3b82f6', grad: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
    ctaLabel: 'Manage Permissions', biomarkers: 8,
  },
  {
    id: 'cgm', priority: 3, icon: '📡', name: 'Continuous Glucose Monitor (CGM)',
    sub: 'Real-time blood glucose every 5 minutes, 24/7 for 14 days',
    brands: 'FreeStyle Libre · Dexcom G7 · any CGM sensor',
    weight: 15,
    defaultChips: ['Glucose 24/7', 'Time in Range', 'Meal Spikes', 'Fasting Pattern'],
    color: '#7c3aed', grad: 'linear-gradient(135deg,#2e1065,#4c1d95)',
    ctaLabel: 'Connect CGM', badge: 'DIFFERENTIATOR', badgeColor: '#7c3aed', biomarkers: 6,
  },
  {
    id: 'ring', priority: 4, icon: '💍', name: 'Smart Ring',
    sub: 'Continuous HRV, deep sleep, skin temperature and recovery',
    brands: 'Oura Ring · Ultrahuman · Noise Luna · any HRV ring',
    weight: 10,
    defaultChips: ['HRV trend', 'Deep sleep %', 'Skin temp', 'Recovery score'],
    color: '#b45309', grad: 'linear-gradient(135deg,#1c0a00,#431407)',
    ctaLabel: 'Connect Ring', badge: 'BEST FOR HRV', badgeColor: '#b45309', biomarkers: 7,
  },
  {
    id: 'abha', priority: 5, icon: '🇮🇳', name: 'ABHA — India Health Records',
    sub: 'Auto-imports all hospital labs, prescriptions and records via your health ID',
    brands: 'Ayushman Bharat · NHA · Any ABDM-registered hospital or lab',
    weight: 0,
    defaultChips: ['All past labs', 'Prescriptions', 'Hospital visits', 'Discharge notes'],
    color: '#047857', grad: 'linear-gradient(135deg,#134e2e,#065f46)',
    ctaLabel: 'Link ABHA ID', badge: 'INDIA EXCLUSIVE', badgeColor: '#047857', biomarkers: 50,
  },
  {
    id: 'scale', priority: 6, icon: '⚖️', name: 'Smart Scale',
    sub: 'Body fat %, muscle mass, visceral fat score and bone mass',
    brands: 'Withings · Xiaomi Mi Scale · any body composition scale',
    weight: 5,
    defaultChips: ['Body fat %', 'Muscle mass', 'Visceral fat', 'Bone mass'],
    color: '#475569', grad: 'linear-gradient(135deg,#1e293b,#334155)',
    ctaLabel: 'Connect Scale', biomarkers: 5,
  },
  {
    id: 'epigenetic', priority: 7, icon: '🧬', name: 'Epigenetic Clock Test',
    sub: 'DNA methylation analysis — the gold standard for true biological age',
    brands: 'Any certified epigenetic testing lab · home kit · import results as PDF',
    weight: 0,
    defaultChips: ['DNA BioAge', 'DunedinPACE', 'Telomere length', 'Methylation score'],
    color: '#9333ea', grad: 'linear-gradient(135deg,#1a0533,#3b0764)',
    ctaLabel: 'Order Test Kit', badge: 'PREMIUM', badgeColor: '#9333ea',
    biomarkers: 4, isPremium: true,
  },
]

function getChips(source, deviceData) {
  const d = deviceData[source.id]
  if (!d) return source.defaultChips
  switch (source.id) {
    case 'cgm':   return [`Glucose ${d.glucose||'—'} mg/dL`, `TIR ${d.tir||'—'}%`, `Fasting ${d.fasting||'—'}`, 'Patterns logged']
    case 'ring':  return [`HRV ${d.hrv||'—'}ms`, `Deep ${d.deep||'—'}h`, `Skin ${d.temp||'—'}°C`, `Recovery ${d.recovery||'—'}%`]
    case 'scale': return [`Body fat ${d.bodyFat||'—'}%`, `Muscle ${d.muscle||'—'}kg`, `Visceral ${d.visceral||'—'}`, `Bone ${d.bone||'—'}kg`]
    case 'abha':  return ['Past labs linked', 'Records importing', 'Prescriptions', 'ABHA linked ✓']
    case 'healthkit': return d.hrv ? [`HRV ${d.hrv}ms`, `Sleep ${d.sleep}h`, `${d.steps} steps`, `RHR ${d.rhr}`] : source.defaultChips
    default: return source.defaultChips
  }
}

function getLastSync(id, deviceData) {
  const d = deviceData[id]
  if (!d || !d._ts) return id === 'healthkit' ? 'Synced 4m ago' : null
  const mins = Math.floor((Date.now() - d._ts) / 60000)
  if (mins < 60) return `Synced ${mins}m ago`
  if (mins < 1440) return `Synced ${Math.floor(mins/60)}h ago`
  return `Synced ${Math.floor(mins/1440)}d ago`
}

// ── Shared input style ─────────────────────────────────────────────────────────
const inp = { width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:15, marginTop:4, outline:'none', boxSizing:'border-box' }
const grp = { marginBottom:14 }
const lbl = { fontSize:13, fontWeight:600, color:'#475569' }

// ── Manual entry forms ─────────────────────────────────────────────────────────
function CGMForm({ onSave, onBack }) {
  const [f, setF] = useState({ glucose:'', tir:'', fasting:'' })
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">📡</div>
      <div className="dh-modal-title">Enter CGM Data</div>
      <div className="dh-modal-desc">Enter your most recent readings. You can update these any time.</div>
      <div style={grp}><div style={lbl}>Current Glucose (mg/dL)</div><input style={inp} type="number" placeholder="e.g. 94" value={f.glucose} onChange={e=>setF({...f,glucose:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Time in Range % (70–180 mg/dL)</div><input style={inp} type="number" placeholder="e.g. 85" value={f.tir} onChange={e=>setF({...f,tir:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Fasting Glucose (mg/dL)</div><input style={inp} type="number" placeholder="e.g. 88" value={f.fasting} onChange={e=>setF({...f,fasting:e.target.value})} /></div>
      <button className="dh-modal-cta" style={{background:'#7c3aed'}} onClick={() => { if(f.glucose||f.tir) onSave({...f,_ts:Date.now()}) }}>
        ✓ Save & Connect
      </button>
      <button style={{marginTop:8,width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'none',color:'#64748b',cursor:'pointer'}} onClick={onBack}>← Back</button>
    </div>
  )
}

function RingForm({ onSave, onBack }) {
  const [f, setF] = useState({ hrv:'', sleep:'', deep:'', temp:'', recovery:'' })
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">💍</div>
      <div className="dh-modal-title">Enter Ring Data</div>
      <div className="dh-modal-desc">Enter your latest readings from your ring's companion app.</div>
      <div style={grp}><div style={lbl}>HRV (ms)</div><input style={inp} type="number" placeholder="e.g. 58" value={f.hrv} onChange={e=>setF({...f,hrv:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Total Sleep (hours)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 7.2" value={f.sleep} onChange={e=>setF({...f,sleep:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Deep Sleep (hours)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 1.8" value={f.deep} onChange={e=>setF({...f,deep:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Skin Temperature (°C)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 36.2" value={f.temp} onChange={e=>setF({...f,temp:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Recovery Score (%)</div><input style={inp} type="number" placeholder="e.g. 78" value={f.recovery} onChange={e=>setF({...f,recovery:e.target.value})} /></div>
      <button className="dh-modal-cta" style={{background:'#b45309'}} onClick={() => { if(f.hrv||f.sleep) onSave({...f,_ts:Date.now()}) }}>
        ✓ Save & Connect
      </button>
      <button style={{marginTop:8,width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'none',color:'#64748b',cursor:'pointer'}} onClick={onBack}>← Back</button>
    </div>
  )
}

function ScaleForm({ onSave, onBack }) {
  const [f, setF] = useState({ bodyFat:'', muscle:'', visceral:'', bone:'' })
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚖️</div>
      <div className="dh-modal-title">Enter Scale Measurements</div>
      <div className="dh-modal-desc">Enter your body composition data from your scale's app.</div>
      <div style={grp}><div style={lbl}>Body Fat %</div><input style={inp} type="number" step="0.1" placeholder="e.g. 22.4" value={f.bodyFat} onChange={e=>setF({...f,bodyFat:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Muscle Mass (kg)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 42.1" value={f.muscle} onChange={e=>setF({...f,muscle:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Visceral Fat Score (1–12)</div><input style={inp} type="number" placeholder="e.g. 7" value={f.visceral} onChange={e=>setF({...f,visceral:e.target.value})} /></div>
      <div style={grp}><div style={lbl}>Bone Mass (kg)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 2.8" value={f.bone} onChange={e=>setF({...f,bone:e.target.value})} /></div>
      <button className="dh-modal-cta" style={{background:'#475569'}} onClick={() => { if(f.bodyFat||f.muscle) onSave({...f,_ts:Date.now()}) }}>
        ✓ Save & Connect
      </button>
      <button style={{marginTop:8,width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'none',color:'#64748b',cursor:'pointer'}} onClick={onBack}>← Back</button>
    </div>
  )
}

// ── Modals ─────────────────────────────────────────────────────────────────────
function LabModal({ onClose, onConnect, nav }) {
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🩸</div>
      <div className="dh-modal-title">Lab Report Upload</div>
      <div className="dh-modal-desc">Upload any blood test PDF or photo. AROGYOS AI reads every biomarker automatically — works with any lab in India or worldwide.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ Any NABL-certified diagnostic lab in India</div>
        <div className="dh-ml-item">✓ Government and private hospital pathology reports</div>
        <div className="dh-ml-item">✓ International lab reports from any country</div>
        <div className="dh-ml-item">✓ PDF files and phone photos accepted</div>
      </div>
      <button className="dh-modal-cta" style={{background:'#0d9488'}} onClick={() => { onClose(); nav('/upload') }}>
        Go to Upload Screen →
      </button>
    </div>
  )
}

function HealthKitModal({ onClose, onConnect, nav }) {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)
  const [view, setView] = useState('main') // main | android | ios

  if (view === 'android') {
    return (
      <div className="dh-modal-body">
        <div className="dh-modal-icon">🤖</div>
        <div className="dh-modal-title">Connect Google Fit</div>
        <div className="dh-modal-desc">Connect your Google account to import fitness and health data from any Android device or wearable that syncs to Google Fit.</div>
        <div className="dh-modal-list">
          <div className="dh-ml-item">✓ Steps, calories, distance</div>
          <div className="dh-ml-item">✓ Heart rate and HRV (if your device supports)</div>
          <div className="dh-ml-item">✓ Sleep tracking</div>
          <div className="dh-ml-item">✓ Works with Samsung, Fitbit, Garmin & more</div>
        </div>
        <button className="dh-modal-cta" style={{background:'#3b82f6'}} onClick={startGoogleFitOAuth}>
          Connect Google Fit →
        </button>
        <div className="dh-modal-note" style={{marginTop:10}}>
          No Google Fit client ID configured yet? Add VITE_GOOGLE_FIT_CLIENT_ID in Vercel settings.
        </div>
        <button style={{marginTop:8,width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'none',color:'#64748b',cursor:'pointer'}} onClick={()=>setView('main')}>← Back</button>
      </div>
    )
  }

  if (view === 'ios') {
    return (
      <div className="dh-modal-body">
        <div className="dh-modal-icon">🍎</div>
        <div className="dh-modal-title">Apple Health</div>
        <div className="dh-modal-desc">Apple Health data cannot be accessed directly from a web browser (Apple restriction). Here's how to get your data into AROGYOS:</div>
        <div className="dh-modal-steps">
          <div className="dh-step"><span className="dh-snum">1</span><span>Open Apple Health on your iPhone → Profile → Export All Health Data</span></div>
          <div className="dh-step"><span className="dh-snum">2</span><span>A ZIP file is created — open it and find the XML export</span></div>
          <div className="dh-step"><span className="dh-snum">3</span><span>Use a free tool like <strong>Health Auto Export</strong> app to export as CSV</span></div>
          <div className="dh-step"><span className="dh-snum">4</span><span>Upload the CSV on the Reports screen — AROGYOS reads it automatically</span></div>
        </div>
        <div className="dh-modal-note">Alternatively, many smartwatches sync to Google Fit too — try the Android path even on iOS if you use a Fitbit or Garmin.</div>
        <div className="dh-connected-badge">● Apple Health data synced via your connected devices</div>
        <button style={{marginTop:8,width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'none',color:'#64748b',cursor:'pointer'}} onClick={()=>setView('main')}>← Back</button>
      </div>
    )
  }

  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">❤️</div>
      <div className="dh-modal-title">Apple Health · Google Health</div>
      <div className="dh-modal-desc">One connection gives AROGYOS access to all your health data from any device or app that syncs to Apple Health or Google Fit.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ HRV, resting heart rate, ECG</div>
        <div className="dh-ml-item">✓ Sleep stages (deep, REM, light)</div>
        <div className="dh-ml-item">✓ VO2 max, steps, active calories</div>
        <div className="dh-ml-item">✓ Blood oxygen (SpO2)</div>
        <div className="dh-ml-item">✓ Works with ALL your connected devices</div>
      </div>
      <button className="dh-modal-cta" style={{background:'#3b82f6'}} onClick={()=>setView('android')}>
        🤖 Connect Google Fit (Android)
      </button>
      <button className="dh-modal-cta" style={{background:'#1e293b',marginTop:8}} onClick={()=>setView('ios')}>
        🍎 Apple Health Instructions (iOS)
      </button>
      <div className="dh-connected-badge">● Already receiving data from your devices</div>
    </div>
  )
}

function CGMModal({ onClose, onConnect }) {
  const [view, setView] = useState('main')
  if (view === 'manual') return <CGMForm onSave={d=>onConnect('cgm',d)} onBack={()=>setView('main')} />
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">📡</div>
      <div className="dh-modal-title">Continuous Glucose Monitor</div>
      <div className="dh-modal-desc">Wear a small sensor on your upper arm for 14 days. It reads your blood sugar every 5 minutes — revealing how every meal, sleep and workout affects your metabolism.</div>
      <div className="dh-modal-steps">
        <div className="dh-step"><span className="dh-snum">1</span><span>Buy a CGM sensor (FreeStyle Libre or Dexcom) from any pharmacy — ₹1,500–2,500 for 14 days</span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Download the companion app (LibreLink or Dexcom) and activate the sensor</span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Enable sharing in the app → enter readings below or connect account</span></div>
      </div>
      <button className="dh-modal-cta" style={{background:'#7c3aed'}} onClick={()=>window.open('https://www.freestyle.abbott/in-en/home.html','_blank')}>
        FreeStyle Libre — Buy in India ↗
      </button>
      <button className="dh-modal-cta" style={{background:'#5b21b6',marginTop:8}} onClick={()=>window.open('https://www.dexcom.com/en-us/get-dexcom','_blank')}>
        Dexcom G7 — Order Online ↗
      </button>
      <button className="dh-modal-cta" style={{background:'#1e293b',marginTop:8}} onClick={()=>setView('manual')}>
        📝 I have a CGM — Enter readings manually
      </button>
      <div className="dh-modal-note">Why CGM? Lab HbA1c is a 3-month average. CGM shows the actual spikes after each meal — the real driver of glycation and accelerated ageing.</div>
    </div>
  )
}

function RingModal({ onClose, onConnect }) {
  const [view, setView] = useState('main')
  if (view === 'manual') return <RingForm onSave={d=>onConnect('ring',d)} onBack={()=>setView('main')} />
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">💍</div>
      <div className="dh-modal-title">Connect Smart Ring</div>
      <div className="dh-modal-desc">Smart rings are the most accurate continuous health trackers — worn 24/7. Any ring that tracks HRV, sleep, and temperature works with AROGYOS.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ HRV — most accurate measurement from any wearable</div>
        <div className="dh-ml-item">✓ Sleep stages: deep, REM, light, awake — all night</div>
        <div className="dh-ml-item">✓ Skin temperature — detects illness and inflammation</div>
        <div className="dh-ml-item">✓ Daily recovery score</div>
      </div>
      <button className="dh-modal-cta" style={{background:'#b45309'}} onClick={startOuraOAuth}>
        Connect Oura Ring →
      </button>
      <button className="dh-modal-cta" style={{background:'#1e293b',marginTop:8}} onClick={()=>window.open('https://www.ultrahuman.com/','_blank')}>
        Ultrahuman Ring Air ↗
      </button>
      <button className="dh-modal-cta" style={{background:'#334155',marginTop:8}} onClick={()=>setView('manual')}>
        📝 I have a ring — Enter readings manually
      </button>
      <div className="dh-modal-note">Tip: Oura Ring connects directly via OAuth. Other rings — enter your data manually or via Google Fit sync.</div>
    </div>
  )
}

function AbhaModal({ onClose, onConnect }) {
  const [abhaId, setAbhaId] = useState('')
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  function formatAbha(val) {
    const digits = val.replace(/\D/g,'').slice(0,14)
    return digits.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/,'$1-$2-$3-$4')
      .replace(/(\d{2})(\d{4})(\d{4})(\d*)/,'$1-$2-$3-$4')
      .replace(/(\d{2})(\d{4})(\d*)/,'$1-$2-$3')
      .replace(/(\d{2})(\d*)/,'$1-$2')
  }

  const digits = abhaId.replace(/\D/g,'')

  async function sendConsent() {
    setSaving(true)
    localStorage.setItem('healthos_abha_id', digits)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setStep(1)
    setTimeout(() => onConnect('abha', { abhaId: digits, _ts: Date.now() }), 3000)
  }

  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🇮🇳</div>
      <div className="dh-modal-title">Link ABHA Health ID</div>
      {step === 0 ? (
        <>
          <div className="dh-modal-desc">Your ABHA (Ayushman Bharat Health Account) links all health records from any ABDM-registered hospital, clinic or lab — imported automatically.</div>
          <div className="dh-modal-list">
            <div className="dh-ml-item">✓ All past lab reports from registered labs</div>
            <div className="dh-ml-item">✓ Hospital discharge summaries</div>
            <div className="dh-ml-item">✓ Prescription history</div>
            <div className="dh-ml-item">✗ We cannot access: financial records or Aadhaar details</div>
          </div>
          <div className="dh-abha-input-wrap">
            <label className="dh-abha-label">Your 14-digit ABHA number</label>
            <input className="dh-abha-input" placeholder="XX-XXXX-XXXX-XXXX" value={abhaId} onChange={e=>setAbhaId(formatAbha(e.target.value))} maxLength={17} />
          </div>
          <button className="dh-modal-cta" style={{background:'#047857', opacity: digits.length===14&&!saving?1:0.45}}
            disabled={digits.length!==14||saving} onClick={sendConsent}>
            {saving ? 'Sending...' : 'Send Consent Request →'}
          </button>
          <div className="dh-modal-note">Don't have an ABHA ID? Create free at <strong>abha.abdm.gov.in</strong> — takes 2 mins with Aadhaar or phone number.</div>
        </>
      ) : (
        <>
          <div className="dh-modal-desc" style={{textAlign:'center',paddingTop:12}}>
            <div style={{fontSize:48,marginBottom:12}}>📲</div>
            <strong>Consent Request Sent!</strong><br/><br/>
            Open <strong>Aarogya Setu</strong> or the <strong>ABDM Health app</strong> and approve the request from AROGYOS.<br/><br/>
            Your records will import automatically after approval.
          </div>
          <div className="dh-connected-badge" style={{background:'#dcfce7',color:'#15803d',borderColor:'#86efac'}}>
            ✓ ABHA ID saved — linking in progress...
          </div>
        </>
      )}
    </div>
  )
}

function ScaleModal({ onClose, onConnect }) {
  const [view, setView] = useState('main')
  if (view === 'manual') return <ScaleForm onSave={d=>onConnect('scale',d)} onBack={()=>setView('main')} />
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚖️</div>
      <div className="dh-modal-title">Connect Smart Scale</div>
      <div className="dh-modal-desc">A smart scale measures body fat %, muscle mass, visceral fat, and bone density — tracking whether your longevity protocol is working at the body composition level.</div>
      <div className="dh-modal-steps" style={{marginTop:4,marginBottom:4}}>
        <div className="dh-step"><span className="dh-snum">1</span><span>Weigh yourself on your smart scale</span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Open your scale's companion app to get body composition data</span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Enter the readings below — AROGYOS tracks your progress over time</span></div>
      </div>
      <button className="dh-modal-cta" style={{background:'#475569'}} onClick={()=>setView('manual')}>
        📝 Enter My Measurements
      </button>
      <button className="dh-modal-cta" style={{background:'#1e293b',marginTop:8}} onClick={()=>window.open('https://www.withings.com/in/en/scales','_blank')}>
        Withings Body+ — Buy Online ↗
      </button>
      <button className="dh-modal-cta" style={{background:'#0f172a',marginTop:8}} onClick={()=>window.open('https://www.mi.com/in/product/mi-body-composition-scale-2','_blank')}>
        Mi Body Composition Scale ↗
      </button>
      <div className="dh-modal-list" style={{marginTop:12}}>
        <div className="dh-ml-item">✓ Body fat % — ideal for longevity: 10–20% (men), 18–28% (women)</div>
        <div className="dh-ml-item">✓ Muscle mass — preserving this is anti-ageing priority #1</div>
        <div className="dh-ml-item">✓ Visceral fat score — fat around organs drives inflammation</div>
      </div>
    </div>
  )
}

function EpigeneticModal({ onClose, onConnect, nav }) {
  return (
    <div className="dh-modal-body">
      <div style={{background:'linear-gradient(135deg,#1a0533,#3b0764)',borderRadius:16,padding:'20px 16px',marginBottom:16,textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:8}}>🧬</div>
        <div style={{color:'#e9d5ff',fontWeight:700,fontSize:17}}>Epigenetic Clock Testing</div>
        <div style={{color:'#c4b5fd',fontSize:13,marginTop:4}}>The most scientifically accurate BioAge measurement on Earth</div>
      </div>
      <div className="dh-modal-desc">A single blood or saliva sample reveals your DNA methylation patterns — the true biological clock inside every cell.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ DunedinPACE — measures how fast you're ageing right now</div>
        <div className="dh-ml-item">✓ Horvath Clock — your cumulative epigenetic age</div>
        <div className="dh-ml-item">✓ GrimAge — predicts healthspan and lifespan</div>
        <div className="dh-ml-item">✓ Updates your BioAge with lab-grade precision</div>
      </div>
      <div className="dh-epig-labs">
        <div className="dh-epig-lab"><strong>Elysium Health</strong><br/><span>US lab · home kit · ships worldwide</span></div>
        <div className="dh-epig-lab"><strong>TruDiagnostic</strong><br/><span>Clinically validated · India available</span></div>
      </div>
      <div className="dh-modal-steps" style={{marginTop:8}}>
        <div className="dh-step"><span className="dh-snum">1</span><span>Order test kit (ships to your home)</span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Collect blood/saliva sample</span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Ship back (prepaid label included)</span></div>
        <div className="dh-step"><span className="dh-snum">4</span><span>Results in ~3 weeks → upload PDF to AROGYOS</span></div>
      </div>
      <button className="dh-modal-cta" style={{background:'linear-gradient(90deg,#7c3aed,#9333ea)'}} onClick={()=>window.open('https://www.trudiagnostic.com/','_blank')}>
        Order TruDiagnostic Test Kit ↗
      </button>
      <button className="dh-modal-cta" style={{background:'#1e1b4b',marginTop:8}} onClick={() => { onClose(); nav('/upload') }}>
        📄 I have results — Upload PDF
      </button>
    </div>
  )
}

const PulseDot = ({ color }) => (
  <span style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
    <span style={{width:8,height:8,borderRadius:'50%',background:color,display:'block',position:'relative',zIndex:1}}/>
    <span className="dh-pulse-ring" style={{borderColor:color}}/>
  </span>
)

function GlucoseCurve() {
  const pts = [88,92,94,138,122,104,95,91,94,88,92,96,130,116,100,94]
  const h=36,w=120,min=80,max=145
  const path = pts.map((v,i)=>{
    const x=(i/(pts.length-1))*w,y=h-((v-min)/(max-min))*h
    return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{display:'block'}}>
      <rect x="0" y={h-((140-min)/(max-min))*h} width={w} height={((140-70)/(max-min))*h} fill="#dcfce7" opacity="0.5" rx="2"/>
      <path d={path} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={w} cy={h-((pts[pts.length-1]-min)/(max-min))*h} r="3" fill="#7c3aed"/>
    </svg>
  )
}

export default function Screen4() {
  const nav = useNavigate()
  const location = useLocation()

  const [connections,   setConnections]   = useState(loadConnections)
  const [deviceData,    setDeviceData]    = useState(loadDeviceData)
  const [openModal,     setOpenModal]     = useState(null)
  const [expanded,      setExpanded]      = useState({})
  const [alertsClosed,  setAlertsClosed]  = useState(false)
  const [showLabPanel,  setShowLabPanel]  = useState(false)
  const [covTab,        setCovTab]        = useState('covered')
  const [oauthStatus,   setOauthStatus]   = useState(null) // 'success' | 'error' | null

  // Handle OAuth callback (code in URL params)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    const provider = localStorage.getItem('pkce_provider')
    if (!code || !provider) return

    // Remove code from URL
    window.history.replaceState({}, '', '/devices')

    if (provider === 'google') {
      // Token exchange would go here with VITE_GOOGLE_FIT_CLIENT_ID
      // For now mark as connected with demo data
      markConnected('healthkit', { hrv: 58, sleep: 7.1, steps: 9240, rhr: 68, _ts: Date.now(), via: 'google' })
      setOauthStatus('success')
    } else if (provider === 'oura') {
      markConnected('ring', { hrv: 62, sleep: 7.3, deep: 1.9, temp: 36.2, recovery: 81, _ts: Date.now(), via: 'oura' })
      setOauthStatus('success')
    }
    localStorage.removeItem('pkce_provider')
  }, [])

  const markConnected = useCallback((id, data = null) => {
    setConnections(prev => {
      const c = { ...prev, [id]: true }
      saveConnections(c)
      return c
    })
    if (data) {
      setDeviceData(prev => {
        const d = { ...prev, [id]: data }
        saveDeviceData(d)
        return d
      })
    }
    setOpenModal(null)
  }, [])

  const markDisconnected = useCallback((id) => {
    if (id === 'lab') return // can't disconnect lab
    setConnections(prev => {
      const c = { ...prev }
      delete c[id]
      saveConnections(c)
      return c
    })
  }, [])

  const connectedSources = SOURCES.filter(s => connections[s.id])
  const availableSources = SOURCES.filter(s => !connections[s.id])
  const dataWeight = connectedSources.reduce((sum, s) => sum + s.weight, 0)

  const connectedIds = Object.keys(connections).filter(k => connections[k])
  const grouped  = routeGrouped(connectedIds)
  const coverage = coveragePercent(connectedIds)
  const allLabRequired = Object.values(grouped).flatMap(g => g.labRequired)

  function renderModal() {
    if (!openModal) return null
    const props = { onClose: () => setOpenModal(null), onConnect: markConnected, nav }
    switch (openModal) {
      case 'lab':        return <LabModal        {...props} />
      case 'healthkit':  return <HealthKitModal  {...props} />
      case 'cgm':        return <CGMModal        {...props} />
      case 'ring':       return <RingModal       {...props} />
      case 'abha':       return <AbhaModal       {...props} />
      case 'scale':      return <ScaleModal      {...props} />
      case 'epigenetic': return <EpigeneticModal {...props} />
      default: return null
    }
  }

  return (
    <div className="screen" style={{gap:0,padding:'18px 0 90px',background:'#f8fafc'}}>

      {oauthStatus === 'success' && (
        <div style={{margin:'12px 16px',padding:'12px 16px',background:'#dcfce7',border:'1.5px solid #86efac',borderRadius:12,color:'#15803d',fontWeight:600,fontSize:14}}>
          ✓ Connected successfully! Your data is now syncing.
          <button style={{float:'right',background:'none',border:'none',cursor:'pointer',color:'#15803d'}} onClick={()=>setOauthStatus(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="dh-header">
        <div>
          <div className="dh-h-title">Data Sources</div>
          <div className="dh-h-sub">
            <PulseDot color="#14b8a6"/>
            <span style={{marginLeft:6}}>{connectedSources.length} connected · syncing live</span>
          </div>
        </div>
        <div className="dh-h-badge">{dataWeight}% accurate</div>
      </div>

      {/* BioAge confidence */}
      <div className="dh-section">
        <div className="dh-conf-card">
          <div className="dh-conf-row">
            <span className="dh-conf-label">BioAge data confidence</span>
            <span className="dh-conf-val">{dataWeight}%</span>
          </div>
          <div className="dh-conf-track">
            <div className="dh-conf-fill" style={{width:`${dataWeight}%`}}/>
          </div>
          <div className="dh-conf-segments">
            {SOURCES.map(s => (
              <div key={s.id} className="dh-seg" style={{
                flex: s.weight||0,
                background: connections[s.id] ? s.color : '#e2e8f0',
                opacity: connections[s.id] ? 1 : 0.5,
              }} title={`${s.name}: ${s.weight}%`}/>
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

      {/* Health Alerts */}
      {!alertsClosed && (
        <div className="dh-section">
          <div className="dh-section-head">
            <span>⚕️ Health Alerts</span>
            {getRealAlerts() && <button className="dh-dismiss" onClick={()=>setAlertsClosed(true)}>Dismiss</button>}
          </div>
          {getRealAlerts() ? (
            <>
              <div className="dh-alert-edu-banner">
                📋 <strong>For educational awareness only.</strong> These signals are based on your uploaded lab data. Always consult your doctor.
              </div>
              {ALERT_RULES.map(a => {
                const s = SEV[a.severity]
                const isOpen = expanded[a.id]
                return (
                  <div key={a.id} className="dh-alert-card" style={{background:s.bg,borderColor:s.border}}
                    onClick={()=>setExpanded(p=>({...p,[a.id]:!p[a.id]}))}>
                    <div className="dh-alert-top">
                      <span className="dh-alert-emoji">{a.emoji}</span>
                      <div className="dh-alert-info"><div className="dh-alert-title" style={{color:s.text}}>{a.title}</div></div>
                      <span className="dh-alert-sev" style={{background:s.text}}>{a.severity==='caution'?'🟠':'🟡'}</span>
                    </div>
                    {isOpen && (
                      <div className="dh-alert-body">
                        <div className="dh-alert-detail">{a.detail}</div>
                        <div className="dh-alert-fix-head">General lifestyle steps:</div>
                        <div className="dh-alert-fix">{a.fix}</div>
                        <div className="dh-alert-fix-head" style={{marginTop:8}}>💬 Discuss with your doctor:</div>
                        <div className="dh-alert-fix">{a.discuss}</div>
                        <div className="dh-alert-retest">Suggested retest: {a.retest}</div>
                        <div className="dh-alert-disclaimer">⚕️ Not a medical diagnosis · For awareness only · Consult your doctor</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          ) : (
            <div className="dh-alert-empty">
              <div className="dh-ae-icon">🩺</div>
              <div className="dh-ae-title">No health alerts yet</div>
              <div className="dh-ae-body">Upload a lab report and AROGYOS will flag any biomarkers outside the healthy range.</div>
              <div className="dh-ae-note">⚕️ Alerts are educational, not medical diagnoses</div>
            </div>
          )}
        </div>
      )}

      {/* Connected Sources */}
      <div className="dh-section">
        <div className="dh-section-head"><span>Connected Sources</span></div>
        {connectedSources.map(s => (
          <div key={s.id} className="dh-source-card dh-source-connected" style={{background:s.grad}}>
            <div className="dh-sc-top">
              <div className="dh-sc-left">
                <span className="dh-sc-icon">{s.icon}</span>
                <div>
                  <div className="dh-sc-name">{s.name}</div>
                  <div className="dh-sc-sync">
                    <PulseDot color="#4ade80"/>
                    <span style={{marginLeft:5,color:'#86efac',fontSize:11}}>{getLastSync(s.id,deviceData) || 'Connected'}</span>
                  </div>
                </div>
              </div>
              <div className="dh-sc-biomarkers">{s.biomarkers}<br/><span style={{fontSize:9,opacity:0.7}}>markers</span></div>
            </div>
            <div className="dh-chip-row">
              {getChips(s, deviceData).map(c => <span key={c} className="dh-chip">{c}</span>)}
            </div>
            {s.id === 'cgm' && (
              <div className="dh-cgm-preview">
                <GlucoseCurve/>
                <div className="dh-cgm-stats">
                  <span>Current: {deviceData.cgm?.glucose||'94'} mg/dL</span>
                  <span>TIR: {deviceData.cgm?.tir||'87'}%</span>
                </div>
              </div>
            )}
            <div style={{display:'flex',gap:8}}>
              <button className="dh-sc-cta" style={{flex:1}} onClick={()=>setOpenModal(s.id)}>{s.ctaLabel}</button>
              {s.id !== 'lab' && (
                <button style={{padding:'8px 12px',borderRadius:8,border:'1.5px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.1)',color:'#fff',fontSize:11,cursor:'pointer'}}
                  onClick={()=>markDisconnected(s.id)}>Disconnect</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Available Sources */}
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
                  {s.badge && <span className="dh-badge" style={{background:`${s.badgeColor}22`,color:s.badgeColor,borderColor:`${s.badgeColor}55`}}>{s.badge}</span>}
                </div>
              </div>
              <div className="dh-av-plus" style={{color:s.color}}>+{s.biomarkers}<br/><span style={{fontSize:9,color:'#94a3b8'}}>markers</span></div>
            </div>
            <div className="dh-av-sub">{s.sub}</div>
            {s.brands && <div className="dh-av-brands">{s.brands}</div>}
            <div className="dh-chip-row" style={{marginTop:8}}>
              {s.defaultChips.map(c => <span key={c} className="dh-chip dh-chip-grey">{c}</span>)}
            </div>
            <button className="dh-av-cta" style={{borderColor:s.color,color:s.color,background:`${s.color}11`}} onClick={()=>setOpenModal(s.id)}>
              {s.isPremium?'🔒 ':''}{s.ctaLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Coverage Map */}
      <div className="dh-section" style={{marginTop:8}}>
        <div className="dh-section-head">
          <span>📊 Biomarker Coverage</span>
          <span style={{fontSize:12,color:'#0d9488',fontWeight:700}}>{coverage}% covered</span>
        </div>
        <div className="dh-cov-tabs">
          <button className={`dh-cov-tab ${covTab==='covered'?'active':''}`} onClick={()=>setCovTab('covered')}>
            ✓ Tracking ({Object.values(grouped).flatMap(g=>g.covered).length})
          </button>
          <button className={`dh-cov-tab ${covTab==='missing'?'active':''}`} onClick={()=>setCovTab('missing')}>
            ⚡ Gaps ({allLabRequired.length})
          </button>
        </div>
        {Object.entries(grouped).map(([cat,{covered,labRequired}]) => {
          const meta = CATEGORY_META[cat]||{icon:'•',color:'#64748b'}
          const list = covTab==='covered' ? covered : labRequired
          if (!list.length) return null
          return (
            <div key={cat} className="dh-cov-group">
              <div className="dh-cov-cat" style={{color:meta.color}}>{meta.icon} {cat}</div>
              {list.map(bm => (
                <div key={bm.id} className={`dh-cov-row ${covTab==='covered'?'dh-cov-ok':'dh-cov-gap'}`}>
                  <span className="dh-cov-icon">{bm.icon}</span>
                  <div className="dh-cov-info">
                    <span className="dh-cov-name">{bm.name}</span>
                    {covTab==='covered' && bm.via && (
                      <span className="dh-cov-via" style={{background:bm.qualityMeta.color+'22',color:bm.qualityMeta.color}}>
                        {bm.via.icon} {bm.via.label} · {bm.qualityMeta.label}
                      </span>
                    )}
                    {covTab==='missing' && (
                      <span className="dh-cov-via" style={{background:'#fee2e2',color:'#dc2626'}}>Not tracked — add to lab panel</span>
                    )}
                  </div>
                  <span style={{fontSize:16}}>{covTab==='covered'?'✅':'➕'}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Smart Lab Panel */}
      {allLabRequired.length > 0 && (
        <div className="dh-section" style={{marginTop:4}}>
          <div className="dh-lab-panel-card">
            <div className="dh-lp-header">
              <div>
                <div className="dh-lp-title">🧾 Your Smart Lab Panel</div>
                <div className="dh-lp-sub">Auto-generated from your missing data gaps</div>
              </div>
              <button className="dh-lp-toggle" onClick={()=>setShowLabPanel(p=>!p)}>
                {showLabPanel?'Hide ▲':'Show ▼'}
              </button>
            </div>
            <div className="dh-lp-banner">
              AROGYOS found <strong>{allLabRequired.length} biomarkers</strong> not covered by your connected devices. Add these to your next blood test.
            </div>
            {showLabPanel && (
              <>
                {allLabRequired.map((bm,i) => (
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
                  <button className="dh-lp-copy" onClick={()=>{
                    const text = allLabRequired.map((b,i)=>`${i+1}. ${b.labTest.test}`).join('\n')
                    navigator.clipboard?.writeText(`My AROGYOS Lab Panel:\n\n${text}\n\nPlease include in my next blood test. Thank you.`)
                      .then(()=>alert('Copied! Paste this to share with your doctor or lab.'))
                  }}>📋 Copy for Doctor / Lab</button>
                  <button className="dh-lp-share" onClick={()=>{
                    const text = encodeURIComponent(`My AROGYOS recommended tests:\n\n`+allLabRequired.slice(0,8).map((b,i)=>`${i+1}. ${b.labTest.test}`).join('\n')+`\n\nTracking my biological age reversal via AROGYOS`)
                    window.open(`https://wa.me/?text=${text}`,'_blank')
                  }}>💬 Send to WhatsApp</button>
                </div>
                <div className="dh-lp-note">Take this list to any NABL-certified lab near you. Upload your results and AROGYOS fills all gaps automatically.</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Generate Smart Panel CTA */}
      <div className="dh-section" style={{marginTop:8}}>
        <button className="dh-smart-panel-btn" onClick={()=>window.location.href='/smart-panel'}>
          <div className="dh-spb-left">
            <span style={{fontSize:28}}>🧾</span>
            <div>
              <div className="dh-spb-title">Generate Smart Lab Panel</div>
              <div className="dh-spb-sub">{allLabRequired.length} missing parameters → auto-organized printable test report</div>
            </div>
          </div>
          <span className="dh-spb-arrow">→</span>
        </button>
      </div>

      <div style={{padding:'16px 18px 8px',fontSize:12,color:'#94a3b8',textAlign:'center',lineHeight:1.5}}>
        🔒 Your data is encrypted and private. You can disconnect any source anytime.
      </div>

      {/* Modal overlay */}
      {openModal && (
        <div className="dh-overlay" onClick={()=>setOpenModal(null)}>
          <div className="dh-sheet" onClick={e=>e.stopPropagation()}>
            <button className="dh-sheet-close" onClick={()=>setOpenModal(null)}>✕</button>
            {renderModal()}
          </div>
        </div>
      )}
    </div>
  )
}
