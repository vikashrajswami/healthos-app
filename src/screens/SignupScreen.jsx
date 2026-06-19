import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sanitizeName, isSuspiciousInput, recordOtpAttempt, isOtpBlocked } from '../lib/security'
import { pushToCloud, pullFromCloud } from '../lib/sync'

const APP_THEMES = [
  { id: 'teal',  label: 'Clinical Teal',    dot: '#14b8a6', accent: '#14b8a6', dark: '#0d9488' },
  { id: 'gold',  label: 'Performance Gold', dot: '#e0b341', accent: '#e0b341', dark: '#a9791f' },
  { id: 'amber', label: 'Calm Wellness',    dot: '#e08c3b', accent: '#e08c3b', dark: '#c2691a' },
]

const COUNTRIES = [
  { code:'IN', dial:'+91',  flag:'🇮🇳', name:'India',        min:10, max:10, pattern:/^[6-9]\d{9}$/ },
  { code:'US', dial:'+1',   flag:'🇺🇸', name:'USA',          min:10, max:10, pattern:/^\d{10}$/ },
  { code:'GB', dial:'+44',  flag:'🇬🇧', name:'UK',           min:10, max:11, pattern:/^\d{10,11}$/ },
  { code:'AE', dial:'+971', flag:'🇦🇪', name:'UAE',          min:9,  max:9,  pattern:/^[0-9]\d{8}$/ },
  { code:'SG', dial:'+65',  flag:'🇸🇬', name:'Singapore',    min:8,  max:8,  pattern:/^\d{8}$/ },
  { code:'CA', dial:'+1',   flag:'🇨🇦', name:'Canada',       min:10, max:10, pattern:/^\d{10}$/ },
  { code:'AU', dial:'+61',  flag:'🇦🇺', name:'Australia',    min:9,  max:10, pattern:/^\d{9,10}$/ },
  { code:'DE', dial:'+49',  flag:'🇩🇪', name:'Germany',      min:10, max:12, pattern:/^\d{10,12}$/ },
  { code:'SA', dial:'+966', flag:'🇸🇦', name:'Saudi Arabia', min:9,  max:9,  pattern:/^[15]\d{8}$/ },
  { code:'MY', dial:'+60',  flag:'🇲🇾', name:'Malaysia',     min:9,  max:10, pattern:/^\d{9,10}$/ },
  { code:'QA', dial:'+974', flag:'🇶🇦', name:'Qatar',        min:8,  max:8,  pattern:/^\d{8}$/ },
  { code:'NL', dial:'+31',  flag:'🇳🇱', name:'Netherlands',  min:9,  max:10, pattern:/^\d{9,10}$/ },
]

const validateEmail = e => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e)
const validatePhone = (p, c) => c.pattern.test(p.replace(/\D/g, ''))

function OtpBoxes({ value, onChange, A, light }) {
  const refs = useRef([])
  const arr = value.length === 6 ? value : Array(6).fill('')
  function onInput(i, e) {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...arr]; next[i] = v; onChange(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
    if (!v && e.nativeEvent.inputType === 'deleteContentBackward' && i > 0) refs.current[i - 1]?.focus()
  }
  function onPaste(e) {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (t.length === 6) onChange(t.split(''))
    e.preventDefault()
  }
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {arr.map((v, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={v}
          onChange={e => onInput(i, e)} onPaste={onPaste}
          style={{
            width: 46, height: 58, textAlign: 'center', fontSize: 22, fontWeight: 700,
            background: light ? (v ? `${A}10` : '#f8fafc') : (v ? `${A}10` : '#2a2a2a'),
            border: v ? `1.5px solid ${A}` : light ? '1.5px solid #e2e8f0' : '1.5px solid #383838',
            borderRadius: 10,
            color: light ? (v ? A : '#64748b') : (v ? A : '#fff'),
            outline: 'none', boxSizing: 'border-box', cursor: 'text',
            transition: 'all .15s',
          }}
        />
      ))}
    </div>
  )
}

function Timer({ secs, A, onResend, light }) {
  const [s, setS] = useState(secs)
  useEffect(() => {
    if (s <= 0) return
    const t = setTimeout(() => setS(s - 1), 1000)
    return () => clearTimeout(t)
  }, [s])

  async function handleResend() {
    if (onResend) await onResend()
    setS(secs)
  }

  const muted = light ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)'
  const semi  = light ? 'rgba(0,0,0,0.6)'  : 'rgba(255,255,255,0.6)'

  return s > 0
    ? <span style={{ color: muted, fontSize: 13 }}>Resend in <b style={{ color: semi }}>{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</b></span>
    : <button onClick={handleResend} style={{ background: 'none', border: 'none', color: A, cursor: 'pointer', fontWeight: 700, fontSize: 13, textDecoration: 'underline', padding: 0 }}>Resend OTP</button>
}

// ── Desktop left panel ────────────────────────────────────────────────────────
function LeftPanel({ A }) {
  return (
    <div style={{
      width: '52%', background: 'linear-gradient(145deg,#0a1a1a,#0f3a3a)',
      display: 'flex', flexDirection: 'column', padding: '52px 48px',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* BG circles */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 340, height: 340, borderRadius: '50%', background: `${A}08`, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: `${A}06`, pointerEvents: 'none' }}/>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke={A} strokeWidth="2.5"/>
          <circle cx="18" cy="18" r="7"  fill="none" stroke={A} strokeWidth="1.5" strokeOpacity=".3"/>
        </svg>
        <div>
          <div style={{ fontSize: 17, fontWeight: 300, color: '#fff', letterSpacing: 3 }}>AROGYOS</div>
          <div style={{ fontSize: 9, color: A, fontWeight: 700, letterSpacing: 2 }}>HEALTH INTELLIGENCE</div>
        </div>
      </div>

      {/* Headline */}
      <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
        Know your true<br/>
        <span style={{ color: A }}>biological age.</span>
      </div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 44, maxWidth: 300 }}>
        Upload a lab report and get your BioAge score in 60 seconds. Backed by science, built for India.
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '🧬', val: '23+',      label: 'Biomarkers tracked per report' },
          { icon: '👨‍👩‍👧', val: '6 members', label: 'Family BioAge dashboard'       },
          { icon: '⚡', val: '60 sec',   label: 'AI lab report analysis'          },
          { icon: '🔒', val: 'DPDP 2023',label: 'Compliant & encrypted'           },
        ].map(s => (
          <div key={s.val} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '13px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}/>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 32, lineHeight: 1.8 }}>
        Trusted by 10,000+ users · 256-bit AES encrypted · GDPR & DPDP Act 2023 compliant
      </div>
      {/* Social icons — left panel */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Follow Us</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { href: 'https://www.instagram.com/arogyos/', color: '#e1306c', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
            { href: 'https://www.linkedin.com/company/arogyos/', color: '#0ea5e9', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
            { href: 'https://www.youtube.com/@arogyos', color: '#ff0000', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg> },
            { href: 'https://www.reddit.com/r/Arogyos/', color: '#ff4500', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.72 10A2 2 0 0 1 20 11.5a2 2 0 0 1-1 1.74"/><path d="M7.28 10A2 2 0 0 0 4 11.5a2 2 0 0 0 1 1.74"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M9.5 16a4 4 0 0 0 5 0"/></svg> },
          ].map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{
              width: 34, height: 34, borderRadius: 9, border: `1px solid ${s.color}44`,
              background: `${s.color}11`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, textDecoration: 'none',
            }}>{s.svg}</a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main signup screen ────────────────────────────────────────────────────────
export default function SignupScreen() {
  if (localStorage.getItem('healthos_uid')) {
    window.location.replace('/home')
    return null
  }

  const nav = useNavigate()
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const [tid,     setTid]     = useState('teal')
  const [tab,     setTab]     = useState('mobile')
  const [cc,      setCc]      = useState(COUNTRIES[0])
  const [ph,      setPh]      = useState('')
  const [em,      setEm]      = useState('')
  const [nm,      setNm]      = useState('')
  const [st,      setSt]      = useState('form')
  const [otp,     setOtp]     = useState(Array(6).fill(''))
  const [err,     setErr]     = useState('')
  const [sending, setSending] = useState(false)
  const [showCC,  setShowCC]  = useState(false)
  const [consent, setConsent] = useState({ terms: false, privacy: false, health: false, marketing: false })
  const [devOtp,  setDevOtp]  = useState('')

  const theme = APP_THEMES.find(t => t.id === tid)
  const A     = theme.accent

  // Input styles — dark on mobile, light on desktop right panel
  const inp = isDesktop ? {
    width: '100%', padding: '13px 16px', background: '#f8fafc',
    border: '1.5px solid #e2e8f0', borderRadius: 12, color: '#0f172a',
    fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  } : {
    width: '100%', padding: '14px 16px', background: '#2a2a2a',
    border: '1px solid #383838', borderRadius: 12, color: '#fff',
    fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  const fg      = isDesktop ? '#0f172a'              : '#fff'
  const fgSub   = isDesktop ? '#64748b'              : 'rgba(255,255,255,0.32)'
  const fgMuted = isDesktop ? 'rgba(0,0,0,0.2)'      : 'rgba(255,255,255,0.18)'
  const panelBg = isDesktop ? '#fff'                 : '#141414'
  const ccBg    = isDesktop ? '#f8fafc'              : '#2a2a2a'
  const ccBord  = isDesktop ? '#e2e8f0'              : '#383838'

  const allRequired = consent.terms && consent.privacy && consent.health
  const contactValue = tab === 'mobile' ? `${cc.dial}${ph.replace(/\D/g, '')}` : em

  async function sendOTP() {
    setSending(true); setErr('')
    try {
      const res  = await fetch('/api/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contactValue, type: tab === 'mobile' ? 'sms' : 'email' }),
      })
      const text = await res.text()
      const data = (() => { try { return JSON.parse(text) } catch { return { error: text || 'Server error. Try again.' } } })()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
      if (data.dev_otp) { setDevOtp(data.dev_otp); setOtp(data.dev_otp.split('')) }
      setSt('otp')
    } catch (e) { setErr(e.message) }
    setSending(false)
  }

  async function go() {
    const cleanName = sanitizeName(nm)
    if (cleanName.length < 2)         return setErr('Full name is required')
    if (isSuspiciousInput(cleanName)) return setErr('Invalid characters in name')
    if (tab === 'mobile' && !validatePhone(ph, cc)) return setErr(`Invalid ${cc.name} number`)
    if (tab === 'email'  && !validateEmail(em))     return setErr('Enter a valid email address')
    if (!allRequired)                 return setErr('Please accept all required agreements to continue')
    setErr('')
    await sendOTP()
  }

  async function verify() {
    if (isOtpBlocked(contactValue)) return setErr('Too many attempts. Try again in 15 minutes.')
    recordOtpAttempt(contactValue)
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setSending(true); setErr('')
    try {
      const res  = await fetch('/api/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contactValue, code: otp.join('') }),
      })
      const text = await res.text()
      const data = (() => { try { return JSON.parse(text) } catch { return { error: text || 'Server error. Try again.' } } })()
      if (!res.ok || !data.valid) throw new Error(data.error || 'Incorrect OTP. Please try again.')

      let uid = localStorage.getItem('healthos_uid')
      if (!uid) {
        uid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
        localStorage.setItem('healthos_uid', uid)
      }
      const cleanName = sanitizeName(nm)
      const existing  = JSON.parse(localStorage.getItem('healthos_profile') || '{}')
      localStorage.setItem('healthos_profile', JSON.stringify({
        ...existing,
        name:  cleanName,
        phone: tab === 'mobile' ? contactValue : (existing.phone || ''),
        email: tab === 'email'  ? em           : (existing.email || ''),
      }))
      localStorage.setItem('healthos_username', cleanName)
      await pullFromCloud(uid)
      pushToCloud()
      setSt('done')
    } catch (e) { setErr(e.message) }
    setSending(false)
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (st === 'done') return (
    <div style={{ minHeight: '100vh', background: isDesktop ? 'linear-gradient(145deg,#0a1a1a,#0f3a3a)' : '#141414', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke={A} strokeWidth="3"/>
          <circle cx="50" cy="50" r="26" fill="none" stroke={A} strokeWidth="1.5" strokeOpacity=".25"/>
        </svg>
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 32, color: A }}>✓</span>
        <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', boxShadow: `0 0 48px ${A}30` }}/>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: A, marginBottom: 10 }}>WELCOME</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{nm}</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>
        Your health profile is active.<br/>Begin your biological age assessment.
      </div>
      <button onClick={() => nav('/home')} style={{ marginTop: 36, padding: '16px 40px', background: 'transparent', color: A, border: `1.5px solid ${A}`, borderRadius: 32, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer' }}>
        OPEN AROGYOS →
      </button>
    </div>
  )

  // ── Form content (shared mobile + desktop) ──────────────────────────────────
  const FormContent = (
    <div style={{ width: '100%', maxWidth: isDesktop ? 400 : 440, margin: '0 auto' }}>

      {/* Brand row — mobile only (desktop has left panel) */}
      {!isDesktop && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="34" height="34" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="13" fill="none" stroke={A} strokeWidth="2.5"/>
              <circle cx="17" cy="17" r="7"  fill="none" stroke={A} strokeWidth="1.5" strokeOpacity=".3"/>
            </svg>
            <div>
              <div style={{ fontSize: 16, fontWeight: 300, color: '#fff', letterSpacing: 3 }}>AROGYOS</div>
              <div style={{ fontSize: 9, color: A, fontWeight: 700, letterSpacing: 2 }}>INTELLIGENCE</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {APP_THEMES.map(t => (
              <button key={t.id} onClick={() => setTid(t.id)} title={t.label} style={{
                width: 22, height: 22, borderRadius: '50%', background: t.dot, border: 'none', cursor: 'pointer',
                outline: tid === t.id ? `2.5px solid #fff` : '2.5px solid transparent',
                outlineOffset: 2, transform: tid === t.id ? 'scale(1.2)' : 'scale(1)', transition: 'all .15s',
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* Desktop header inside right panel */}
      {isDesktop && st === 'form' && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {APP_THEMES.map(t => (
              <button key={t.id} onClick={() => setTid(t.id)} title={t.label} style={{
                width: 20, height: 20, borderRadius: '50%', background: t.dot, border: 'none', cursor: 'pointer',
                outline: tid === t.id ? `2.5px solid #0f172a` : '2.5px solid transparent',
                outlineOffset: 2, transform: tid === t.id ? 'scale(1.2)' : 'scale(1)', transition: 'all .15s',
              }}/>
            ))}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: 10 }}>Get started free</div>
          <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>
            Enter your number to receive an OTP.<br/>No email required. No credit card.
          </div>
        </div>
      )}

      {/* ── FORM ── */}
      {st === 'form' && (
        <>
          {!isDesktop && (
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 34, fontWeight: 300, color: '#fff', lineHeight: 1.25, marginBottom: 12 }}>
                Know<br/><span style={{ fontWeight: 800, color: A }}>yourself.</span>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.32)', lineHeight: 1.7 }}>
                50+ biomarkers. One biological age score.<br/>Personalised to you, every 90 days.
              </div>
            </div>
          )}

          {/* Mobile/Email tab */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: isDesktop ? '#f1f5f9' : '#1e1e1e', borderRadius: 12, padding: 4 }}>
            {['mobile', 'email'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                flex: 1, padding: '11px 0', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: tab === t ? A : 'none',
                color: tab === t ? '#fff' : isDesktop ? '#94a3b8' : 'rgba(255,255,255,0.3)',
                transition: 'all .18s',
              }}>
                {t === 'mobile' ? '📱 Mobile' : '✉️ Email'}
              </button>
            ))}
          </div>

          {/* Name */}
          <div style={{ marginBottom: 12 }}>
            <input style={inp} placeholder="Full name" value={nm} onChange={e => setNm(e.target.value)}/>
          </div>

          {/* Phone or Email */}
          {tab === 'mobile' ? (
            <div style={{ marginBottom: 12, position: 'relative' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCC(!showCC)} style={{
                  padding: '13px 12px', background: ccBg, border: `1px solid ${ccBord}`,
                  borderRadius: 12, color: fg, cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
                }}>
                  {cc.flag} {cc.dial} ▾
                </button>
                <input style={{ ...inp, flex: 1 }} type="tel" placeholder={`${cc.min}-digit number`}
                  value={ph} onChange={e => setPh(e.target.value.replace(/\D/g, '').slice(0, cc.max))}/>
              </div>
              {showCC && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: isDesktop ? '#fff' : '#1a1a1a', border: isDesktop ? '1px solid #e2e8f0' : '1px solid #2a2a2a', borderRadius: 12, width: 230, maxHeight: 230, overflowY: 'auto', marginTop: 6, boxShadow: '0 8px 28px rgba(0,0,0,0.18)' }}>
                  {COUNTRIES.map(c => (
                    <div key={c.code} onClick={() => { setCc(c); setShowCC(false); setPh('') }}
                      style={{ padding: '11px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center', color: c.code === cc.code ? A : isDesktop ? '#334155' : '#ccc', background: c.code === cc.code ? `${A}10` : 'none', fontWeight: c.code === cc.code ? 700 : 400 }}>
                      {c.flag} {c.name} <span style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto' }}>{c.dial}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <input style={inp} type="email" placeholder="you@example.com" value={em} onChange={e => setEm(e.target.value)}/>
            </div>
          )}

          {/* Consent */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: 'terms',     required: true,  text: 'I agree to the ',  link: 'Terms & Conditions', plain: null },
              { key: 'privacy',   required: true,  text: 'I have read the ', link: 'Privacy Policy',     plain: null },
              { key: 'health',    required: true,  text: null, link: null, plain: 'I consent to processing of my health/sensitive data for biological age analysis (GDPR Art. 9 / DPDP Act 2023)' },
              { key: 'marketing', required: false, text: null, link: null, plain: 'Send me health tips, feature updates, and personalised offers (optional)' },
            ].map(({ key, required, text, link, plain }) => (
              <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  onClick={() => setConsent(c => ({ ...c, [key]: !c[key] }))}
                  style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    border: consent[key] ? 'none' : isDesktop ? '1.5px solid #cbd5e1' : '1.5px solid #666',
                    background: consent[key] ? A : isDesktop ? '#f8fafc' : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                >
                  {consent[key] && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                </div>
                <span
                  onClick={() => setConsent(c => ({ ...c, [key]: !c[key] }))}
                  style={{ fontSize: 12, color: fgSub, lineHeight: 1.6, cursor: 'pointer', userSelect: 'none' }}
                >
                  {plain ?? (
                    <>
                      {text}
                      <span
                        onClick={e => { e.stopPropagation(); window.open('/terms', '_blank') }}
                        style={{ color: A, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        {link}
                      </span>
                    </>
                  )}
                  {required && <span style={{ color: A, fontWeight: 700 }}> *</span>}
                </span>
              </div>
            ))}
          </div>

          {err && <div style={{ fontSize: 13, color: '#ef4444', marginTop: 12, fontWeight: 600 }}>⚠ {err}</div>}

          <button onClick={go} disabled={!allRequired || sending} style={{
            width: '100%', padding: 17, marginTop: 16,
            background: allRequired ? `linear-gradient(90deg,${A},${theme.dark})` : isDesktop ? '#e2e8f0' : '#2a2a2a',
            color: allRequired ? '#fff' : isDesktop ? '#94a3b8' : '#555',
            border: 'none', borderRadius: 13, fontSize: 16, fontWeight: 800,
            cursor: allRequired && !sending ? 'pointer' : 'default',
            boxShadow: allRequired ? `0 6px 24px ${A}36` : 'none',
            transition: 'all .2s', opacity: sending ? 0.75 : 1,
          }}>
            {sending ? 'Sending OTP…' : 'Continue →'}
          </button>

          <div style={{ fontSize: 11, color: fgMuted, textAlign: 'center', marginTop: 14, lineHeight: 1.8 }}>
            🔒 256-bit AES encrypted · DPDP Act 2023 · GDPR compliant
          </div>
          {/* Social icons — signup form bottom */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: fgMuted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Follow Us</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {[
                { href: 'https://www.instagram.com/arogyos/', color: '#e1306c', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
                { href: 'https://www.linkedin.com/company/arogyos/', color: '#0ea5e9', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
                { href: 'https://www.youtube.com/@arogyos', color: '#ff0000', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg> },
                { href: 'https://www.reddit.com/r/Arogyos/', color: '#ff4500', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.72 10A2 2 0 0 1 20 11.5a2 2 0 0 1-1 1.74"/><path d="M7.28 10A2 2 0 0 0 4 11.5a2 2 0 0 0 1 1.74"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M9.5 16a4 4 0 0 0 5 0"/></svg> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                  width: 34, height: 34, borderRadius: 9, border: `1px solid ${s.color}44`,
                  background: `${s.color}11`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: s.color, textDecoration: 'none',
                }}>{s.svg}</a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── OTP ── */}
      {st === 'otp' && (
        <div style={{ paddingTop: isDesktop ? 0 : 16 }}>
          {isDesktop && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Verify your number</div>
              <div style={{ fontSize: 14, color: '#64748b' }}>
                Code sent to <strong style={{ color: '#0f172a' }}>{tab === 'mobile' ? `${cc.dial} ${ph}` : em}</strong>
              </div>
            </div>
          )}

          {!isDesktop && (
            <div style={{ textAlign: 'center', marginBottom: 38 }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}>
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke={A} strokeWidth="2.5"/>
                  <circle cx="36" cy="36" r="15" fill="none" stroke={A} strokeWidth="1.5" strokeOpacity=".25"/>
                </svg>
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 22 }}>🔑</span>
                <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', boxShadow: `0 0 28px ${A}28` }}/>
              </div>
              <div style={{ fontSize: 22, fontWeight: 300, color: '#fff', letterSpacing: 2, marginBottom: 8 }}>VERIFICATION</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)', lineHeight: 1.7 }}>
                Code sent to<br/>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                  {tab === 'mobile' ? `${cc.dial} ${ph}` : em}
                </span>
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                Check your {tab === 'mobile' ? 'messages' : 'inbox'} for the code
              </div>
            </div>
          )}

          {devOtp && (
            <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: 12, padding: '14px 18px', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', letterSpacing: 1, marginBottom: 6 }}>SMS NOT ACTIVE YET — YOUR OTP IS</div>
              <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 10, color: '#92400e' }}>{devOtp}</div>
              <div style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>Will switch to SMS automatically after DLT approval</div>
            </div>
          )}

          <OtpBoxes value={otp} onChange={setOtp} A={A} light={isDesktop}/>

          {err && <div style={{ fontSize: 13, color: '#ef4444', marginTop: 16, fontWeight: 600, textAlign: 'center' }}>⚠ {err}</div>}

          <button onClick={verify} disabled={sending} style={{
            width: '100%', padding: 17,
            background: `linear-gradient(90deg,${A},${theme.dark})`,
            color: '#fff', border: 'none', borderRadius: 13, fontSize: 16, fontWeight: 800,
            cursor: sending ? 'wait' : 'pointer', margin: '26px 0 16px',
            boxShadow: `0 6px 24px ${A}36`, opacity: sending ? 0.75 : 1,
          }}>
            {sending ? 'Verifying…' : 'Verify →'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Timer secs={55} A={A} onResend={sendOTP} light={isDesktop}/>
          </div>
          <button onClick={() => setSt('form')} style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: isDesktop ? '#94a3b8' : 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer' }}>
            ← Change number / email
          </button>
        </div>
      )}
    </div>
  )

  // ── DESKTOP layout: split screen ──────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <LeftPanel A={A}/>
        <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 52px', overflowY: 'auto' }}>
          {FormContent}
        </div>
      </div>
    )
  }

  // ── MOBILE layout: full dark screen ──────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#141414', fontFamily: 'system-ui,-apple-system,sans-serif', position: 'relative', overflowX: 'hidden' }}>
      <svg style={{ position: 'absolute', top: -60, right: -60, opacity: .1, pointerEvents: 'none' }} width="320" height="320" viewBox="0 0 320 320">
        <circle cx="220" cy="110" r="140" fill="none" stroke={A} strokeWidth="64"/>
      </svg>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 260, height: 180, background: `radial-gradient(ellipse,${A}10,transparent 70%)`, pointerEvents: 'none' }}/>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '44px 28px 48px', position: 'relative' }}>
        {FormContent}
      </div>
    </div>
  )
}
