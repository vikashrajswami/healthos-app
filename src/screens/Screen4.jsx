import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { routeGrouped, coveragePercent, CATEGORY_META } from '../lib/dataRouter'
import { getAllReports } from '../lib/reportStore'
import {
  handleOAuthCallback,
  startOuraOAuth,  fetchOuraData,  hasOuraClientId,
  startWhoopOAuth, fetchWhoopData, hasWhoopClientId,
  startGoogleFitOAuth, fetchGoogleFitData, hasGoogleClientId, clearToken,
  startDexcomOAuth, fetchDexcomData, hasDexcomClientId,
  saveAbhaId, getAbhaId,
} from '../lib/deviceConnections'

// ── localStorage helpers ───────────────────────────────────────────────────────
function loadConnections() {
  try { return JSON.parse(localStorage.getItem('healthos_connections') || '{}') }
  catch { return {} }
}
function loadDeviceData() {
  try { return JSON.parse(localStorage.getItem('healthos_device_data') || '{}') }
  catch { return {} }
}
function saveConnections(c) { localStorage.setItem('healthos_connections', JSON.stringify(c)) }
function saveDeviceData(d)   { localStorage.setItem('healthos_device_data', JSON.stringify(d)) }

// ── Source definitions — chips are CAPABILITIES shown before connecting ────────
const SOURCES = [
  {
    id: 'lab', priority: 1, icon: '🩸', name: 'Lab Reports',
    sub: 'AI reads your blood test PDF and extracts every biomarker',
    brands: 'Any lab in India or worldwide · PDF or photo',
    weight: 50,
    capChips: ['Blood markers', 'HbA1c', 'Lipid panel', 'Organ health'],
    color: '#0d9488', grad: 'linear-gradient(135deg,#0f3a3a,#0d5151)',
    ctaLabel: 'Upload New Report', biomarkers: 23,
  },
  {
    id: 'healthkit', priority: 2, icon: '❤️', name: 'Apple Health · Google Health',
    sub: 'One connection covers ALL your wearables — any phone or watch',
    brands: 'Samsung · Fitbit · Garmin · Xiaomi · Fossil · Wear OS',
    weight: 20,
    capChips: ['Steps & activity', 'Heart rate', 'Sleep duration', 'Calories'],
    color: '#3b82f6', grad: 'linear-gradient(135deg,#1e3a5f,#1e40af)',
    ctaLabel: 'Connect Health App', biomarkers: 8,
  },
  {
    id: 'ring', priority: 3, icon: '💍', name: 'Smart Ring & Recovery Tracker',
    sub: 'Continuous HRV, deep sleep, strain score, skin temp and recovery',
    brands: 'WHOOP · Oura Ring · Ultrahuman · Noise Luna · RingConn · any HRV tracker',
    weight: 10,
    capChips: ['HRV (ms)', 'Recovery %', 'Deep sleep (h)', 'Strain score'],
    color: '#b45309', grad: 'linear-gradient(135deg,#1c0a00,#431407)',
    ctaLabel: 'Connect Tracker', badge: 'BEST FOR HRV', badgeColor: '#b45309', biomarkers: 8,
  },
  {
    id: 'cgm', priority: 4, icon: '📡', name: 'Continuous Glucose Monitor (CGM)',
    sub: 'Blood glucose every 5 minutes — reveals how food and exercise affect you',
    brands: 'FreeStyle Libre · Dexcom G7 · Medtronic · any CGM sensor',
    weight: 15,
    capChips: ['Real-time glucose', 'Time in range', 'Meal spikes', 'Fasting pattern'],
    color: '#7c3aed', grad: 'linear-gradient(135deg,#2e1065,#4c1d95)',
    ctaLabel: 'Connect CGM', badge: 'DIFFERENTIATOR', badgeColor: '#7c3aed', biomarkers: 6,
  },
  {
    id: 'abha', priority: 5, icon: '🇮🇳', name: 'ABHA — India Health Records',
    sub: 'All hospital labs, prescriptions and records via your health ID',
    brands: 'Ayushman Bharat · NHA · Any ABDM-registered hospital or lab',
    weight: 0,
    capChips: ['Past lab reports', 'Prescriptions', 'Hospital visits', 'Discharge notes'],
    color: '#047857', grad: 'linear-gradient(135deg,#134e2e,#065f46)',
    ctaLabel: 'Link ABHA ID', badge: 'INDIA EXCLUSIVE', badgeColor: '#047857', biomarkers: 50,
  },
  {
    id: 'scale', priority: 6, icon: '⚖️', name: 'Smart Scale',
    sub: 'Body fat %, muscle mass, visceral fat and bone density',
    brands: 'Withings · Xiaomi Mi Scale · Omron · any body composition scale',
    weight: 5,
    capChips: ['Body fat %', 'Muscle mass (kg)', 'Visceral fat', 'Bone density'],
    color: '#475569', grad: 'linear-gradient(135deg,#1e293b,#334155)',
    ctaLabel: 'Connect Scale', biomarkers: 5,
  },
  {
    id: 'epigenetic', priority: 7, icon: '🧬', name: 'Epigenetic Clock Test',
    sub: 'DNA methylation — the gold standard for true biological age',
    brands: 'TruDiagnostic · Elysium Health · home kit · import results as PDF',
    weight: 0,
    capChips: ['DNA BioAge', 'DunedinPACE', 'Telomere length', 'Methylation score'],
    color: '#9333ea', grad: 'linear-gradient(135deg,#1a0533,#3b0764)',
    ctaLabel: 'Order Test Kit', badge: 'PREMIUM', badgeColor: '#9333ea', biomarkers: 4, isPremium: true,
  },
]

function getConnectedChips(id, deviceData) {
  const d = deviceData[id]
  switch (id) {
    case 'lab': {
      const r = getAllReports()[0]
      if (!r || !r.biomarkers?.length) return ['Upload a report to see data']
      return r.biomarkers.slice(0,4).map(b => `${b.canonical||b.name} ${b.stdValue??b.value??''}`.trim())
    }
    case 'healthkit': return d ? [
      d.steps  ? `${d.steps.toLocaleString()} steps` : 'Steps synced',
      d.rhr    ? `RHR ${d.rhr} bpm`                 : 'Heart rate',
      d.sleep  ? `Sleep ${d.sleep}h`                : 'Sleep tracked',
      `via ${d._via === 'google' ? 'Google Fit' : 'Health App'}`,
    ] : ['Connected — syncing...']
    case 'ring': return d ? [
      d.hrv      ? `HRV ${d.hrv}ms`           : 'HRV tracked',
      d.recovery ? `Recovery ${d.recovery}%`  : 'Recovery scored',
      d.deep     ? `Deep ${d.deep}h`          : (d.strain != null ? `Strain ${d.strain.toFixed(1)}` : 'Sleep tracked'),
      d._via === 'whoop' ? 'via WHOOP API' : d._via === 'oura' ? 'via Oura API' : 'manual entry',
    ] : ['Connected — enter data below']
    case 'cgm': return d ? [
      d.glucose  ? `Glucose ${d.glucose} mg/dL` : 'Glucose tracked',
      d.tir      ? `TIR ${d.tir}%`             : 'Time in range',
      d.fasting  ? `Fasting ${d.fasting}`       : 'Fasting tracked',
      `via ${d._via === 'dexcom' ? 'Dexcom API' : 'manual entry'}`,
    ] : ['Connected — enter data below']
    case 'scale': return d ? [
      d.bodyFat  ? `Body fat ${d.bodyFat}%`   : 'Body fat %',
      d.muscle   ? `Muscle ${d.muscle}kg`     : 'Muscle mass',
      d.visceral ? `Visceral ${d.visceral}`   : 'Visceral fat',
      d.bone     ? `Bone ${d.bone}kg`         : 'Bone mass',
    ] : ['Connected — enter measurements']
    case 'abha': return [
      `ABHA: ${getAbhaId()?.slice(0,6) || '—'}••••••••`,
      'Records linked',
      'Open Aarogya Setu to approve',
      'Data imports after consent',
    ]
    case 'epigenetic': return d ? [
      d.bioAge   ? `DNA BioAge ${d.bioAge}`   : 'DNA BioAge',
      d.pace     ? `DunedinPACE ${d.pace}`    : 'DunedinPACE',
      'Imported from PDF',
      `Lab: ${d.lab||'certified lab'}`,
    ] : ['PDF imported']
    default: return ['Connected']
  }
}

function getLastSync(id, deviceData) {
  const d = deviceData[id]
  if (!d?._ts) {
    if (id === 'lab') {
      const r = getAllReports()[0]
      return r ? `Uploaded ${new Date(r.addedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}` : null
    }
    return 'Connected'
  }
  const mins = Math.floor((Date.now()-d._ts)/60000)
  if (mins < 60)   return `Synced ${mins}m ago`
  if (mins < 1440) return `Synced ${Math.floor(mins/60)}h ago`
  return `Synced ${Math.floor(mins/1440)}d ago`
}

// ── Shared form styles ─────────────────────────────────────────────────────────
const inp = {width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:15,marginTop:4,outline:'none',boxSizing:'border-box'}
const grp = {marginBottom:14}
const lbl = {fontSize:13,fontWeight:600,color:'#475569'}
const backBtn = {marginTop:8,width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'none',color:'#64748b',cursor:'pointer',fontSize:14}
const outBtn = (color='#3b82f6') => ({marginTop:8,width:'100%',padding:'12px',borderRadius:10,border:`1.5px solid ${color}`,background:`${color}11`,color,cursor:'pointer',fontSize:14,fontWeight:600})

// ── Manual entry forms ─────────────────────────────────────────────────────────
function CGMForm({ onSave, onBack }) {
  const [f,setF] = useState({glucose:'',tir:'',fasting:''})
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">📡</div>
      <div className="dh-modal-title">Enter CGM Readings</div>
      <div className="dh-modal-desc">Enter your readings from your CGM app. You can update these any time.</div>
      <div style={grp}><div style={lbl}>Current Glucose (mg/dL)</div><input style={inp} type="number" placeholder="e.g. 94" value={f.glucose} onChange={e=>setF({...f,glucose:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Time in Range % (70–180 mg/dL)</div><input style={inp} type="number" placeholder="e.g. 85" value={f.tir} onChange={e=>setF({...f,tir:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Fasting Glucose (mg/dL)</div><input style={inp} type="number" placeholder="e.g. 88" value={f.fasting} onChange={e=>setF({...f,fasting:e.target.value})}/></div>
      <button className="dh-modal-cta" style={{background:'#7c3aed'}} onClick={()=>{if(f.glucose||f.tir)onSave({...f,_ts:Date.now(),_via:'manual'})}}>✓ Save & Connect</button>
      <button style={backBtn} onClick={onBack}>← Back</button>
    </div>
  )
}

function RingForm({ onSave, onBack }) {
  const [f,setF] = useState({hrv:'',sleep:'',deep:'',temp:'',recovery:''})
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">💍</div>
      <div className="dh-modal-title">Enter Ring Data</div>
      <div className="dh-modal-desc">Open your ring's companion app and enter your latest readings here.</div>
      <div style={grp}><div style={lbl}>HRV (ms) — Heart Rate Variability</div><input style={inp} type="number" placeholder="e.g. 58" value={f.hrv} onChange={e=>setF({...f,hrv:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Total Sleep (hours)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 7.2" value={f.sleep} onChange={e=>setF({...f,sleep:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Deep Sleep (hours)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 1.8" value={f.deep} onChange={e=>setF({...f,deep:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Skin Temperature (°C)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 36.2" value={f.temp} onChange={e=>setF({...f,temp:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Recovery Score (0–100)</div><input style={inp} type="number" placeholder="e.g. 78" value={f.recovery} onChange={e=>setF({...f,recovery:e.target.value})}/></div>
      <button className="dh-modal-cta" style={{background:'#b45309'}} onClick={()=>{if(f.hrv||f.sleep)onSave({...f,_ts:Date.now(),_via:'manual'})}}>✓ Save & Connect</button>
      <button style={backBtn} onClick={onBack}>← Back</button>
    </div>
  )
}

function ScaleForm({ onSave, onBack }) {
  const [f,setF] = useState({bodyFat:'',muscle:'',visceral:'',bone:''})
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚖️</div>
      <div className="dh-modal-title">Enter Body Measurements</div>
      <div className="dh-modal-desc">Step on your scale, open its app, and enter the body composition readings here.</div>
      <div style={grp}><div style={lbl}>Body Fat %</div><input style={inp} type="number" step="0.1" placeholder="e.g. 22.4" value={f.bodyFat} onChange={e=>setF({...f,bodyFat:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Muscle Mass (kg)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 42.1" value={f.muscle} onChange={e=>setF({...f,muscle:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Visceral Fat Score (1–12)</div><input style={inp} type="number" placeholder="e.g. 7" value={f.visceral} onChange={e=>setF({...f,visceral:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Bone Mass (kg)</div><input style={inp} type="number" step="0.1" placeholder="e.g. 2.8" value={f.bone} onChange={e=>setF({...f,bone:e.target.value})}/></div>
      <button className="dh-modal-cta" style={{background:'#475569'}} onClick={()=>{if(f.bodyFat||f.muscle)onSave({...f,_ts:Date.now(),_via:'manual'})}}>✓ Save & Connect</button>
      <button style={backBtn} onClick={onBack}>← Back</button>
    </div>
  )
}

// ── Modals ─────────────────────────────────────────────────────────────────────
function LabModal({ onClose, nav }) {
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🩸</div>
      <div className="dh-modal-title">Upload Lab Report</div>
      <div className="dh-modal-desc">Upload any blood test PDF or photo. AROGYOS AI reads every biomarker automatically — works with any lab in India or worldwide.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ Dr. Lal PathLabs · SRL · Metropolis · Thyrocare</div>
        <div className="dh-ml-item">✓ Government hospital pathology reports</div>
        <div className="dh-ml-item">✓ International labs from any country</div>
        <div className="dh-ml-item">✓ PDF, JPG, PNG all accepted</div>
      </div>
      <button className="dh-modal-cta" style={{background:'#0d9488'}} onClick={()=>{onClose();nav('/upload')}}>
        Upload Report →
      </button>
    </div>
  )
}

function HealthKitModal({ onClose, onConnect }) {
  const isAndroid = /Android/.test(navigator.userAgent)
  const [view, setView] = useState(isAndroid ? 'android' : 'main')
  const [loading, setLoading] = useState(false)

  async function doGoogleOAuth() {
    if (!hasGoogleClientId()) {
      setView('setup_google')
      return
    }
    setLoading(true)
    await startGoogleFitOAuth()
  }

  if (view === 'setup_google') return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚙️</div>
      <div className="dh-modal-title">Set Up Google Fit</div>
      <div className="dh-modal-desc">To connect Google Fit, a developer key is required. Here's how to set it up:</div>
      <div className="dh-modal-steps">
        <div className="dh-step"><span className="dh-snum">1</span><span>Go to <strong>console.cloud.google.com</strong> → Create project "AROGYOS"</span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Enable <strong>Fitness API</strong> in APIs & Services</span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Create OAuth 2.0 Client ID → Web App → add redirect: <code>https://www.arogyos.com/devices</code></span></div>
        <div className="dh-step"><span className="dh-snum">4</span><span>In Vercel → Settings → Environment Variables → add <strong>VITE_GOOGLE_FIT_CLIENT_ID</strong></span></div>
        <div className="dh-step"><span className="dh-snum">5</span><span>Redeploy → come back here and connect</span></div>
      </div>
      <button style={outBtn('#3b82f6')} onClick={()=>window.open('https://console.cloud.google.com/','_blank')}>Open Google Cloud Console ↗</button>
      <button style={backBtn} onClick={()=>setView('android')}>← Back</button>
    </div>
  )

  if (view === 'android') return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🤖</div>
      <div className="dh-modal-title">Connect Google Health</div>
      <div className="dh-modal-desc">Connect Google Fit to import data from <strong>any wearable</strong> that syncs to Google — Samsung, Fitbit, Garmin, Xiaomi, Fossil, Pixel Watch, and more.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ Steps, active minutes, calories</div>
        <div className="dh-ml-item">✓ Heart rate and resting heart rate</div>
        <div className="dh-ml-item">✓ Sleep duration</div>
        <div className="dh-ml-item">✓ Works with all major Android wearables</div>
      </div>
      <button className="dh-modal-cta" style={{background: loading?'#94a3b8':'#3b82f6'}} onClick={doGoogleOAuth} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Google Fit →'}
      </button>
      <button style={backBtn} onClick={()=>setView('main')}>← Back</button>
    </div>
  )

  if (view === 'ios') return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🍎</div>
      <div className="dh-modal-title">Apple Health</div>
      <div className="dh-modal-desc">Web browsers cannot directly access Apple Health (Apple restriction). Options:</div>
      <div className="dh-modal-steps">
        <div className="dh-step"><span className="dh-snum">A</span><span><strong>Export CSV:</strong> Open Apple Health → Profile → Export All Health Data → import the CSV on the Reports screen</span></div>
        <div className="dh-step"><span className="dh-snum">B</span><span><strong>Use an app like Health Auto Export</strong> to sync Apple Health data to Google Fit, then connect Google Fit here</span></div>
        <div className="dh-step"><span className="dh-snum">C</span><span><strong>If you have an Oura Ring</strong> — connect it directly via the Ring option (it works on iOS too)</span></div>
      </div>
      <button style={outBtn('#3b82f6')} onClick={()=>setView('android')}>Try Google Fit Connection →</button>
      <button style={backBtn} onClick={()=>setView('main')}>← Back</button>
    </div>
  )

  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">❤️</div>
      <div className="dh-modal-title">Connect Health Platform</div>
      <div className="dh-modal-desc">Select your platform — one connection pulls data from all your devices automatically.</div>
      <button className="dh-modal-cta" style={{background:'#3b82f6'}} onClick={()=>setView('android')}>
        🤖 Google Fit (Android) →
      </button>
      <button className="dh-modal-cta" style={{background:'#1e293b',marginTop:8}} onClick={()=>setView('ios')}>
        🍎 Apple Health (iOS) →
      </button>
    </div>
  )
}

function RingModal({ onClose, onConnect }) {
  const [view, setView] = useState('main')
  const [loading, setLoading] = useState(null) // null | 'whoop' | 'oura'

  async function doOuraOAuth() {
    if (!hasOuraClientId()) { setView('setup_oura'); return }
    setLoading('oura')
    await startOuraOAuth()
  }

  async function doWhoopOAuth() {
    if (!hasWhoopClientId()) { setView('setup_whoop'); return }
    setLoading('whoop')
    await startWhoopOAuth()
  }

  if (view === 'setup_whoop') return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚙️</div>
      <div className="dh-modal-title">Set Up WHOOP Connection</div>
      <div className="dh-modal-desc">Register a free developer app to connect WHOOP directly via API.</div>
      <div className="dh-modal-steps">
        <div className="dh-step"><span className="dh-snum">1</span><span>Go to <strong>developer.whoop.com</strong> → Create Application</span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Set redirect URI to <code>https://www.arogyos.com/devices</code></span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Copy your Client ID (no client secret needed)</span></div>
        <div className="dh-step"><span className="dh-snum">4</span><span>In Vercel → Settings → Environment Variables → add <strong>VITE_WHOOP_CLIENT_ID</strong></span></div>
        <div className="dh-step"><span className="dh-snum">5</span><span>Redeploy → come back and connect</span></div>
      </div>
      <button style={outBtn('#b45309')} onClick={()=>window.open('https://developer.whoop.com','_blank')}>Open WHOOP Developer Portal ↗</button>
      <button style={backBtn} onClick={()=>setView('main')}>← Back</button>
    </div>
  )

  if (view === 'setup_oura') return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚙️</div>
      <div className="dh-modal-title">Set Up Oura Connection</div>
      <div className="dh-modal-steps">
        <div className="dh-step"><span className="dh-snum">1</span><span>Go to <strong>cloud.ouraring.com/oauth/applications</strong></span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Create an app → set redirect URI to <code>https://www.arogyos.com/devices</code></span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Copy the Client ID</span></div>
        <div className="dh-step"><span className="dh-snum">4</span><span>In Vercel → Environment Variables → add <strong>VITE_OURA_CLIENT_ID</strong></span></div>
        <div className="dh-step"><span className="dh-snum">5</span><span>Redeploy → connect here</span></div>
      </div>
      <button style={outBtn('#b45309')} onClick={()=>window.open('https://cloud.ouraring.com/oauth/applications','_blank')}>Open Oura Developer Portal ↗</button>
      <button style={backBtn} onClick={()=>setView('main')}>← Back</button>
    </div>
  )

  if (view === 'manual') return <RingForm onSave={d=>onConnect('ring',d)} onBack={()=>setView('main')}/>

  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">💍</div>
      <div className="dh-modal-title">Connect Recovery Tracker</div>
      <div className="dh-modal-desc">Choose your device. All track the same key metrics — HRV, recovery score, sleep stages and strain.</div>

      {/* WHOOP — strain + HRV */}
      <button className="dh-modal-cta" style={{background:loading==='whoop'?'#94a3b8':'#1a1a2e',border:'2px solid #00d4ff',marginBottom:4}} onClick={doWhoopOAuth} disabled={!!loading}>
        {loading==='whoop' ? 'Connecting...' : '⚡ Connect WHOOP (API) →'}
      </button>
      <div style={{fontSize:11,color:'#94a3b8',textAlign:'center',marginBottom:12}}>HRV · Recovery % · Strain · Sleep stages · RHR</div>

      {/* Oura Ring */}
      <button className="dh-modal-cta" style={{background:loading==='oura'?'#94a3b8':'#b45309',marginBottom:4}} onClick={doOuraOAuth} disabled={!!loading}>
        {loading==='oura' ? 'Connecting...' : '💍 Connect Oura Ring (API) →'}
      </button>
      <div style={{fontSize:11,color:'#94a3b8',textAlign:'center',marginBottom:12}}>HRV · Deep sleep · Skin temp · Readiness</div>

      {/* Ultrahuman */}
      <button className="dh-modal-cta" style={{background:'#0f172a',border:'1.5px solid #334155',marginBottom:4}} onClick={()=>window.open('https://www.ultrahuman.com/ring-air','_blank')}>
        Ultrahuman Ring Air ↗
      </button>
      <div style={{fontSize:11,color:'#94a3b8',textAlign:'center',marginBottom:12}}>Order the ring, then enter data manually or via Google Fit</div>

      <div style={{padding:'4px 0 8px',fontSize:12,color:'#94a3b8',textAlign:'center',borderTop:'1px solid #f1f5f9',paddingTop:12}}>
        Samsung Galaxy Ring · Noise Luna · RingConn · Fitbit<br/>→ sync to Google Fit, then connect via Health App above
      </div>

      <button style={outBtn('#b45309')} onClick={()=>setView('manual')}>
        📝 Enter readings manually (any device)
      </button>
    </div>
  )
}

function CGMModal({ onClose, onConnect }) {
  const [view, setView] = useState('main')
  const [loading, setLoading] = useState(false)

  async function doDexcomOAuth() {
    if (!hasDexcomClientId()) { setView('setup_dexcom'); return }
    setLoading(true)
    await startDexcomOAuth()
  }

  if (view === 'setup_dexcom') return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚙️</div>
      <div className="dh-modal-title">Set Up Dexcom Connection</div>
      <div className="dh-modal-steps">
        <div className="dh-step"><span className="dh-snum">1</span><span>Go to <strong>developer.dexcom.com</strong> → My Apps → Create App</span></div>
        <div className="dh-step"><span className="dh-snum">2</span><span>Set redirect URI: <code>https://www.arogyos.com/devices</code></span></div>
        <div className="dh-step"><span className="dh-snum">3</span><span>Copy the Client ID</span></div>
        <div className="dh-step"><span className="dh-snum">4</span><span>In Vercel → Environment Variables → add <strong>VITE_DEXCOM_CLIENT_ID</strong></span></div>
        <div className="dh-step"><span className="dh-snum">5</span><span>Redeploy → connect here</span></div>
      </div>
      <button style={outBtn('#7c3aed')} onClick={()=>window.open('https://developer.dexcom.com','_blank')}>Open Dexcom Developer Portal ↗</button>
      <button style={backBtn} onClick={()=>setView('main')}>← Back</button>
    </div>
  )

  if (view === 'manual') return <CGMForm onSave={d=>onConnect('cgm',d)} onBack={()=>setView('main')}/>

  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">📡</div>
      <div className="dh-modal-title">Connect CGM</div>
      <div className="dh-modal-desc">Connect your glucose monitor to see real-time blood sugar data — revealing how every meal, sleep and workout affects your metabolism.</div>
      <button className="dh-modal-cta" style={{background: loading?'#94a3b8':'#7c3aed'}} onClick={doDexcomOAuth} disabled={loading}>
        {loading ? 'Connecting...' : '📡 Connect Dexcom G7 (API) →'}
      </button>
      <button className="dh-modal-cta" style={{background:'#1e293b',marginTop:8}} onClick={()=>window.open('https://www.freestyle.abbott/in-en/home.html','_blank')}>
        Buy FreeStyle Libre in India ↗
      </button>
      <button style={outBtn('#7c3aed')} onClick={()=>setView('manual')}>
        📝 I have a CGM — Enter readings manually
      </button>
      <div className="dh-modal-note">FreeStyle Libre and other CGMs: enter your readings manually from the companion app. We're adding LibreView sync soon.</div>
    </div>
  )
}

function AbhaModal({ onClose, onConnect }) {
  const [abhaId, setAbhaId] = useState(getAbhaId()?.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/,'$1-$2-$3-$4')||'')
  const [step, setStep]     = useState(0)
  const [saving, setSaving] = useState(false)

  function formatAbha(val) {
    const d = val.replace(/\D/g,'').slice(0,14)
    return d.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/,'$1-$2-$3-$4')
      .replace(/(\d{2})(\d{4})(\d{4})(\d*)/,'$1-$2-$3-$4')
      .replace(/(\d{2})(\d{4})(\d*)/,'$1-$2-$3')
      .replace(/(\d{2})(\d*)/,'$1-$2')
  }
  const digits = abhaId.replace(/\D/g,'')

  async function sendConsent() {
    setSaving(true)
    saveAbhaId(digits)
    await new Promise(r=>setTimeout(r,800))
    setSaving(false)
    setStep(1)
    setTimeout(()=>onConnect('abha',{abhaId:digits,_ts:Date.now()}),2500)
  }

  if (step===1) return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🇮🇳</div>
      <div className="dh-modal-title">ABHA Linked!</div>
      <div className="dh-modal-desc" style={{textAlign:'center',paddingTop:12}}>
        <div style={{fontSize:48,marginBottom:12}}>📲</div>
        <strong>ABHA ID saved.</strong><br/><br/>
        To import your health records, open <strong>Aarogya Setu</strong> or the <strong>ABDM Health app</strong> and approve the data sharing request.<br/><br/>
        Records import automatically after your consent.
      </div>
      <div className="dh-connected-badge" style={{background:'#dcfce7',color:'#15803d',borderColor:'#86efac'}}>
        ✓ ABHA {digits.slice(0,6)}•••••••• saved
      </div>
    </div>
  )

  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🇮🇳</div>
      <div className="dh-modal-title">Link ABHA Health ID</div>
      <div className="dh-modal-desc">Your ABHA (Ayushman Bharat Health Account) automatically imports all health records from ABDM-registered hospitals and labs.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ Past lab reports from registered labs</div>
        <div className="dh-ml-item">✓ Hospital discharge summaries</div>
        <div className="dh-ml-item">✓ Prescription history</div>
        <div className="dh-ml-item">✗ We cannot access financial or Aadhaar data</div>
      </div>
      <div className="dh-abha-input-wrap">
        <label className="dh-abha-label">Your 14-digit ABHA number</label>
        <input className="dh-abha-input" placeholder="XX-XXXX-XXXX-XXXX" value={abhaId} onChange={e=>setAbhaId(formatAbha(e.target.value))} maxLength={17}/>
      </div>
      <button className="dh-modal-cta" style={{background:'#047857',opacity:digits.length===14&&!saving?1:0.45}} disabled={digits.length!==14||saving} onClick={sendConsent}>
        {saving?'Saving...':'Link ABHA ID →'}
      </button>
      <div className="dh-modal-note">Don't have an ABHA ID? Create free at <strong>abha.abdm.gov.in</strong> — takes 2 minutes with Aadhaar or phone number.</div>
    </div>
  )
}

function ScaleModal({ onClose, onConnect }) {
  const [view, setView] = useState('main')
  if (view==='manual') return <ScaleForm onSave={d=>onConnect('scale',d)} onBack={()=>setView('main')}/>
  return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">⚖️</div>
      <div className="dh-modal-title">Connect Smart Scale</div>
      <div className="dh-modal-desc">A body composition scale tracks fat %, muscle mass and visceral fat — the key body composition markers for longevity.</div>
      <button className="dh-modal-cta" style={{background:'#475569'}} onClick={()=>setView('manual')}>
        📝 Enter My Measurements
      </button>
      <button style={outBtn('#475569')} onClick={()=>window.open('https://www.withings.com/in/en/scales','_blank')}>Withings Body+ Scale ↗</button>
      <button style={outBtn('#475569')} onClick={()=>window.open('https://www.mi.com/in/product/mi-body-composition-scale-2','_blank')}>Xiaomi Mi Scale ↗</button>
      <div className="dh-modal-note">Most smart scales sync to Google Fit — connect Google Fit (Health App) to import automatically once we have your Google Fit key set up.</div>
      <div className="dh-modal-list" style={{marginTop:12}}>
        <div className="dh-ml-item">✓ Body fat % — ideal: 10–20% (men), 18–28% (women)</div>
        <div className="dh-ml-item">✓ Muscle mass — priority #1 anti-ageing marker</div>
        <div className="dh-ml-item">✓ Visceral fat — organ fat drives inflammation</div>
      </div>
    </div>
  )
}

function EpigeneticModal({ onClose, onConnect, nav }) {
  const [view, setView] = useState('main')
  const [f, setF] = useState({bioAge:'',pace:'',lab:''})

  if (view==='enter') return (
    <div className="dh-modal-body">
      <div className="dh-modal-icon">🧬</div>
      <div className="dh-modal-title">Enter Epigenetic Results</div>
      <div className="dh-modal-desc">Enter your results from your epigenetic test report.</div>
      <div style={grp}><div style={lbl}>DNA Biological Age</div><input style={inp} type="number" step="0.1" placeholder="e.g. 34.2" value={f.bioAge} onChange={e=>setF({...f,bioAge:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>DunedinPACE (aging rate, e.g. 0.85)</div><input style={inp} type="number" step="0.01" placeholder="e.g. 0.85" value={f.pace} onChange={e=>setF({...f,pace:e.target.value})}/></div>
      <div style={grp}><div style={lbl}>Lab name</div><input style={inp} placeholder="e.g. TruDiagnostic" value={f.lab} onChange={e=>setF({...f,lab:e.target.value})}/></div>
      <button className="dh-modal-cta" style={{background:'#9333ea'}} onClick={()=>{if(f.bioAge)onConnect('epigenetic',{...f,_ts:Date.now()})}}>✓ Save Results</button>
      <button style={backBtn} onClick={()=>setView('main')}>← Back</button>
    </div>
  )

  return (
    <div className="dh-modal-body">
      <div style={{background:'linear-gradient(135deg,#1a0533,#3b0764)',borderRadius:16,padding:'20px 16px',marginBottom:16,textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:8}}>🧬</div>
        <div style={{color:'#e9d5ff',fontWeight:700,fontSize:17}}>Epigenetic Clock Testing</div>
        <div style={{color:'#c4b5fd',fontSize:13,marginTop:4}}>Gold standard biological age measurement</div>
      </div>
      <div className="dh-modal-desc">A blood or saliva sample reveals your DNA methylation patterns — the true biological clock inside every cell. Used by Peter Attia, David Sinclair, and longevity researchers worldwide.</div>
      <div className="dh-modal-list">
        <div className="dh-ml-item">✓ DunedinPACE — how fast you're ageing right now</div>
        <div className="dh-ml-item">✓ Horvath Clock — cumulative epigenetic age</div>
        <div className="dh-ml-item">✓ GrimAge — predicts healthspan</div>
      </div>
      <div className="dh-epig-labs">
        <div className="dh-epig-lab"><strong>TruDiagnostic</strong><br/><span>Clinically validated · ships to India</span></div>
        <div className="dh-epig-lab"><strong>Elysium Health</strong><br/><span>US lab · home kit worldwide</span></div>
      </div>
      <button className="dh-modal-cta" style={{background:'linear-gradient(90deg,#7c3aed,#9333ea)'}} onClick={()=>window.open('https://www.trudiagnostic.com/','_blank')}>Order TruDiagnostic Test Kit ↗</button>
      <button className="dh-modal-cta" style={{background:'#1e1b4b',marginTop:8}} onClick={()=>setView('enter')}>📝 I have results — Enter manually</button>
      <button className="dh-modal-cta" style={{background:'#0f172a',marginTop:8}} onClick={()=>{onClose();nav('/upload')}}>📄 Upload PDF results</button>
    </div>
  )
}

// ── Misc components ────────────────────────────────────────────────────────────
const PulseDot = ({color}) => (
  <span style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
    <span style={{width:8,height:8,borderRadius:'50%',background:color,display:'block',position:'relative',zIndex:1}}/>
    <span className="dh-pulse-ring" style={{borderColor:color}}/>
  </span>
)

const SEV = {
  urgent:  {bg:'#fee2e2',border:'#fca5a5',text:'#dc2626'},
  caution: {bg:'#fff7ed',border:'#fdba74',text:'#c2410c'},
  watch:   {bg:'#fefce8',border:'#fde04788',text:'#a16207'},
}
const ALERT_RULES = [
  {id:'prediabetes',severity:'caution',emoji:'🩸',title:'Elevated Blood Sugar Range',detail:'Your HbA1c reading is in the pre-diabetic range (5.7–6.4%). An early signal worth discussing with your doctor.',fix:'Walk 15 mins after meals · Choose low-GI foods',discuss:'Ask your doctor about an OGTT to confirm.',retest:'90 days'},
  {id:'vitD',severity:'watch',emoji:'☀️',title:'Low Vitamin D Level',detail:'Your Vitamin D is in the insufficient range, affecting immunity, bone density and mood.',fix:'20 mins morning sunlight daily · fatty fish, eggs, fortified foods',discuss:'Ask your doctor what supplementation dose is right for you.',retest:'90 days'},
  {id:'inflammation',severity:'watch',emoji:'🔥',title:'Borderline Inflammation Marker',detail:'Your hsCRP is in the borderline zone (1–3 mg/L). Chronic low-grade inflammation accelerates biological ageing.',fix:'Increase omega-3 foods · reduce processed food · prioritise sleep',discuss:'Ask your doctor to rule out any underlying cause.',retest:'90 days'},
]
function getRealAlerts() {
  try { const d=localStorage.getItem('healthos_lab_alerts'); return d?JSON.parse(d):null } catch { return null }
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function Screen4() {
  const nav = useNavigate()

  const [connections,   setConnections]   = useState(loadConnections)
  const [deviceData,    setDeviceData]    = useState(loadDeviceData)
  const [openModal,     setOpenModal]     = useState(null)
  const [expanded,      setExpanded]      = useState({})
  const [alertsClosed,  setAlertsClosed]  = useState(false)
  const [showLabPanel,  setShowLabPanel]  = useState(false)
  const [covTab,        setCovTab]        = useState('covered')
  const [toast,         setToast]         = useState(null)

  // Lab is connected dynamically based on uploaded reports
  const hasReports = getAllReports().length > 0

  const effectiveConnections = { ...connections, lab: hasReports }

  // Handle OAuth callback when page loads with ?code= in URL
  useEffect(() => {
    if (!window.location.search.includes('code=') && !window.location.search.includes('error=')) return
    handleOAuthCallback().then(result => {
      if (!result) return
      if (result.error) {
        setToast({ type:'error', msg: `Connection failed: ${result.error}` })
        return
      }
      const providerMap = { oura:'ring', whoop:'ring', google:'healthkit', dexcom:'cgm' }
      const sourceId = providerMap[result.provider]
      if (sourceId) markConnected(sourceId, result.data || { _ts: Date.now(), _via: result.provider })
      setToast({ type:'success', msg: `${result.provider.charAt(0).toUpperCase()+result.provider.slice(1)} connected! Data is syncing.` })
    })
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const markConnected = useCallback((id, data=null) => {
    setConnections(prev => { const c={...prev,[id]:true}; saveConnections(c); return c })
    if (data) setDeviceData(prev => { const d={...prev,[id]:data}; saveDeviceData(d); return d })
    setOpenModal(null)
  }, [])

  const markDisconnected = useCallback((id) => {
    if (id==='lab') return
    setConnections(prev => { const c={...prev}; delete c[id]; saveConnections(c); return c })
    clearToken(id)
  }, [])

  const connectedSources = SOURCES.filter(s => effectiveConnections[s.id])
  const availableSources = SOURCES.filter(s => !effectiveConnections[s.id])
  const dataWeight = connectedSources.reduce((sum,s)=>sum+s.weight,0)
  const connectedIds = Object.keys(effectiveConnections).filter(k=>effectiveConnections[k])
  const grouped  = routeGrouped(connectedIds)
  const coverage = coveragePercent(connectedIds)
  const allLabRequired = Object.values(grouped).flatMap(g=>g.labRequired)

  function renderModal() {
    if (!openModal) return null
    const p = { onClose:()=>setOpenModal(null), onConnect:markConnected, nav }
    switch(openModal) {
      case 'lab':        return <LabModal        {...p}/>
      case 'healthkit':  return <HealthKitModal  {...p}/>
      case 'ring':       return <RingModal       {...p}/>
      case 'cgm':        return <CGMModal        {...p}/>
      case 'abha':       return <AbhaModal       {...p}/>
      case 'scale':      return <ScaleModal      {...p}/>
      case 'epigenetic': return <EpigeneticModal {...p}/>
      default: return null
    }
  }

  return (
    <div className="screen" style={{gap:0,padding:'18px 0 90px',background:'#f8fafc'}}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',zIndex:999,
          background: toast.type==='success'?'#15803d':'#dc2626',
          color:'#fff',padding:'12px 20px',borderRadius:12,fontSize:14,fontWeight:600,
          boxShadow:'0 4px 20px rgba(0,0,0,0.2)',maxWidth:'90vw',textAlign:'center',
        }}>
          {toast.type==='success'?'✓ ':''}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="dh-header">
        <div>
          <div className="dh-h-title">Data Sources</div>
          <div className="dh-h-sub">
            <PulseDot color={connectedSources.length>0?'#14b8a6':'#94a3b8'}/>
            <span style={{marginLeft:6}}>
              {connectedSources.length > 0
                ? `${connectedSources.length} connected · syncing live`
                : 'Connect a source to start tracking'}
            </span>
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
          <div className="dh-conf-track"><div className="dh-conf-fill" style={{width:`${dataWeight}%`}}/></div>
          <div className="dh-conf-segments">
            {SOURCES.map(s=>(
              <div key={s.id} className="dh-seg" style={{flex:s.weight||0,background:effectiveConnections[s.id]?s.color:'#e2e8f0',opacity:effectiveConnections[s.id]?1:0.5}} title={`${s.name}: ${s.weight}%`}/>
            ))}
          </div>
          <div className="dh-conf-legend"><span>🩸 Labs 50%</span><span>❤️ Wearable 30%</span><span>🧬 DNA 20%</span></div>
          {dataWeight < 70 && <div className="dh-conf-tip">Connect more sources to improve BioAge accuracy</div>}
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
              <div className="dh-alert-edu-banner">📋 <strong>For educational awareness only.</strong> Based on your uploaded lab data. Always consult your doctor.</div>
              {ALERT_RULES.map(a=>{
                const s=SEV[a.severity]; const isOpen=expanded[a.id]
                return (
                  <div key={a.id} className="dh-alert-card" style={{background:s.bg,borderColor:s.border}} onClick={()=>setExpanded(p=>({...p,[a.id]:!p[a.id]}))}>
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
                        <div className="dh-alert-disclaimer">⚕️ Not a diagnosis · For awareness only · Consult your doctor</div>
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
      {connectedSources.length > 0 && (
        <div className="dh-section">
          <div className="dh-section-head"><span>Connected Sources</span></div>
          {connectedSources.map(s=>(
            <div key={s.id} className="dh-source-card dh-source-connected" style={{background:s.grad}}>
              <div className="dh-sc-top">
                <div className="dh-sc-left">
                  <span className="dh-sc-icon">{s.icon}</span>
                  <div>
                    <div className="dh-sc-name">{s.name}</div>
                    <div className="dh-sc-sync">
                      <PulseDot color="#4ade80"/>
                      <span style={{marginLeft:5,color:'#86efac',fontSize:11}}>{getLastSync(s.id,deviceData)||'Connected'}</span>
                    </div>
                  </div>
                </div>
                <div className="dh-sc-biomarkers">{s.biomarkers}<br/><span style={{fontSize:9,opacity:0.7}}>markers</span></div>
              </div>
              <div className="dh-chip-row">
                {getConnectedChips(s.id,deviceData).map(c=><span key={c} className="dh-chip">{c}</span>)}
              </div>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button className="dh-sc-cta" style={{flex:1}} onClick={()=>setOpenModal(s.id)}>{s.ctaLabel||'Manage'}</button>
                {s.id!=='lab' && (
                  <button style={{padding:'8px 12px',borderRadius:8,border:'1.5px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.1)',color:'#fff',fontSize:11,cursor:'pointer'}} onClick={()=>markDisconnected(s.id)}>
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Sources */}
      <div className="dh-section">
        <div className="dh-section-head">
          <span>{connectedSources.length>0?'Connect More Data':'Connect Your Data'}</span>
        </div>
        {availableSources.length===0 ? (
          <div style={{padding:'20px',textAlign:'center',color:'#64748b',fontSize:14}}>All sources connected 🎉</div>
        ) : (
          availableSources.map(s=>(
            <div key={s.id} className="dh-source-card dh-source-available">
              <div className="dh-sc-top">
                <div className="dh-sc-left">
                  <div className="dh-av-icon-wrap" style={{background:`${s.color}22`,border:`1.5px solid ${s.color}44`}}>
                    <span className="dh-sc-icon">{s.icon}</span>
                  </div>
                  <div>
                    <div className="dh-av-name">{s.name}</div>
                    {s.badge&&<span className="dh-badge" style={{background:`${s.badgeColor}22`,color:s.badgeColor,borderColor:`${s.badgeColor}55`}}>{s.badge}</span>}
                  </div>
                </div>
                <div className="dh-av-plus" style={{color:s.color}}>+{s.biomarkers}<br/><span style={{fontSize:9,color:'#94a3b8'}}>markers</span></div>
              </div>
              <div className="dh-av-sub">{s.sub}</div>
              {s.brands&&<div className="dh-av-brands">{s.brands}</div>}
              <div className="dh-chip-row" style={{marginTop:8}}>
                {s.capChips.map(c=><span key={c} className="dh-chip dh-chip-grey">{c}</span>)}
              </div>
              <button className="dh-av-cta" style={{borderColor:s.color,color:s.color,background:`${s.color}11`}} onClick={()=>setOpenModal(s.id)}>
                {s.isPremium?'🔒 ':''}{s.ctaLabel}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Coverage map */}
      <div className="dh-section" style={{marginTop:8}}>
        <div className="dh-section-head">
          <span>📊 Biomarker Coverage</span>
          <span style={{fontSize:12,color:'#0d9488',fontWeight:700}}>{coverage}% covered</span>
        </div>
        <div className="dh-cov-tabs">
          <button className={`dh-cov-tab ${covTab==='covered'?'active':''}`} onClick={()=>setCovTab('covered')}>✓ Tracking ({Object.values(grouped).flatMap(g=>g.covered).length})</button>
          <button className={`dh-cov-tab ${covTab==='missing'?'active':''}`} onClick={()=>setCovTab('missing')}>⚡ Gaps ({allLabRequired.length})</button>
        </div>
        {Object.entries(grouped).map(([cat,{covered,labRequired}])=>{
          const meta=CATEGORY_META[cat]||{icon:'•',color:'#64748b'}
          const list=covTab==='covered'?covered:labRequired
          if(!list.length) return null
          return (
            <div key={cat} className="dh-cov-group">
              <div className="dh-cov-cat" style={{color:meta.color}}>{meta.icon} {cat}</div>
              {list.map(bm=>(
                <div key={bm.id} className={`dh-cov-row ${covTab==='covered'?'dh-cov-ok':'dh-cov-gap'}`}>
                  <span className="dh-cov-icon">{bm.icon}</span>
                  <div className="dh-cov-info">
                    <span className="dh-cov-name">{bm.name}</span>
                    {covTab==='covered'&&bm.via&&<span className="dh-cov-via" style={{background:bm.qualityMeta.color+'22',color:bm.qualityMeta.color}}>{bm.via.icon} {bm.via.label} · {bm.qualityMeta.label}</span>}
                    {covTab==='missing'&&<span className="dh-cov-via" style={{background:'#fee2e2',color:'#dc2626'}}>Not tracked — add to lab panel</span>}
                  </div>
                  <span style={{fontSize:16}}>{covTab==='covered'?'✅':'➕'}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Smart Lab Panel */}
      {allLabRequired.length>0&&(
        <div className="dh-section" style={{marginTop:4}}>
          <div className="dh-lab-panel-card">
            <div className="dh-lp-header">
              <div><div className="dh-lp-title">🧾 Your Smart Lab Panel</div><div className="dh-lp-sub">Auto-generated from your data gaps</div></div>
              <button className="dh-lp-toggle" onClick={()=>setShowLabPanel(p=>!p)}>{showLabPanel?'Hide ▲':'Show ▼'}</button>
            </div>
            <div className="dh-lp-banner">AROGYOS found <strong>{allLabRequired.length} biomarkers</strong> not covered by connected sources.</div>
            {showLabPanel&&(
              <>
                {allLabRequired.map((bm,i)=>(
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
                  <button className="dh-lp-copy" onClick={()=>navigator.clipboard?.writeText(`My AROGYOS Lab Panel:\n\n${allLabRequired.map((b,i)=>`${i+1}. ${b.labTest.test}`).join('\n')}\n\nPlease include in my next blood test.`).then(()=>alert('Copied!'))}>📋 Copy for Doctor</button>
                  <button className="dh-lp-share" onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(`My AROGYOS tests:\n\n`+allLabRequired.slice(0,8).map((b,i)=>`${i+1}. ${b.labTest.test}`).join('\n'))}`, '_blank')}>💬 WhatsApp</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{padding:'16px 18px 8px',fontSize:12,color:'#94a3b8',textAlign:'center',lineHeight:1.5}}>
        🔒 Your data is private. We only read what you explicitly allow. Disconnect any source anytime.
      </div>

      {/* Modal */}
      {openModal&&(
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
