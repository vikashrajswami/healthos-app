import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sanitizeName, isSuspiciousInput, recordOtpAttempt, isOtpBlocked } from '../lib/security'

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

function OtpBoxes({ value, onChange, A }) {
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
            background: v ? `${A}10` : '#2a2a2a',
            border: v ? `1.5px solid ${A}` : '1.5px solid #383838',
            borderRadius: 10, color: v ? A : '#fff',
            outline: 'none', boxSizing: 'border-box', cursor: 'text',
            transition: 'all .15s',
          }}
        />
      ))}
    </div>
  )
}

function Timer({ secs, A }) {
  const [s, setS] = useState(secs)
  useEffect(() => {
    if (s <= 0) return
    const t = setTimeout(() => setS(s - 1), 1000)
    return () => clearTimeout(t)
  }, [s])
  return s > 0
    ? <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Resend in <b style={{ color: 'rgba(255,255,255,0.6)' }}>{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</b></span>
    : <button onClick={() => setS(secs)} style={{ background: 'none', border: 'none', color: A, cursor: 'pointer', fontWeight: 700, fontSize: 13, textDecoration: 'underline', padding: 0 }}>Resend OTP</button>
}

export default function SignupScreen() {
  const nav = useNavigate()
  const [tid,    setTid]    = useState('teal')
  const [tab,    setTab]    = useState('mobile')
  const [cc,     setCc]     = useState(COUNTRIES[0])
  const [ph,     setPh]     = useState('')
  const [em,     setEm]     = useState('')
  const [nm,     setNm]     = useState('')
  const [st,     setSt]     = useState('form')
  const [otp,    setOtp]    = useState(Array(6).fill(''))
  const [err,    setErr]    = useState('')
  const [showCC, setShowCC] = useState(false)
  const [consent, setConsent] = useState({ terms: false, privacy: false, health: false, marketing: false })

  const theme = APP_THEMES.find(t => t.id === tid)
  const A = theme.accent

  const inp = {
    width: '100%', padding: '14px 16px', background: '#2a2a2a',
    border: '1px solid #383838', borderRadius: 12, color: '#fff',
    fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }
  const allRequired = consent.terms && consent.privacy && consent.health

  function go() {
    const cleanName = sanitizeName(nm)
    if (cleanName.length < 2) return setErr('Full name is required')
    if (isSuspiciousInput(cleanName)) return setErr('Invalid characters in name')
    if (tab === 'mobile' && !validatePhone(ph, cc)) return setErr(`Invalid ${cc.name} number`)
    if (tab === 'email'  && !validateEmail(em))     return setErr('Enter a valid email address')
    if (!allRequired) return setErr('Please accept all required agreements to continue')
    setErr(''); setSt('otp')
  }
  function verify() {
    const otpKey = tab === 'mobile' ? `${cc.dial}${ph}` : em
    if (isOtpBlocked(otpKey)) return setErr('Too many attempts. Try again in 15 minutes.')
    recordOtpAttempt(otpKey)
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    // Demo: accept 000000 — replace with real OTP verification
    if (otp.join('') !== '000000') return setErr('Incorrect OTP. Use 000000 for demo.')
    setErr(''); setSt('done')
  }

  // ── Success ───────────────────────────────────────────────────────────────────
  if (st === 'done') return (
    <div style={{ minHeight: '100vh', background: '#141414', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
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
      <button onClick={() => nav('/')} style={{ marginTop: 36, padding: '16px 40px', background: 'transparent', color: A, border: `1.5px solid ${A}`, borderRadius: 32, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer' }}>
        OPEN HEALTHOS →
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#141414', fontFamily: 'system-ui,-apple-system,sans-serif', position: 'relative', overflowX: 'hidden' }}>

      {/* Decorative ring */}
      <svg style={{ position: 'absolute', top: -60, right: -60, opacity: .1, pointerEvents: 'none' }} width="320" height="320" viewBox="0 0 320 320">
        <circle cx="220" cy="110" r="140" fill="none" stroke={A} strokeWidth="64"/>
      </svg>
      {/* Bottom glow */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 260, height: 180, background: `radial-gradient(ellipse,${A}10,transparent 70%)`, pointerEvents: 'none' }}/>

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '44px 28px 48px', position: 'relative' }}>

        {/* Brand + colour picker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="34" height="34" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="13" fill="none" stroke={A} strokeWidth="2.5"/>
              <circle cx="17" cy="17" r="7"  fill="none" stroke={A} strokeWidth="1.5" strokeOpacity=".3"/>
            </svg>
            <div>
              <div style={{ fontSize: 16, fontWeight: 300, color: '#fff', letterSpacing: 3 }}>HealthOS</div>
              <div style={{ fontSize: 9, color: A, fontWeight: 700, letterSpacing: 2 }}>INTELLIGENCE</div>
            </div>
          </div>

          {/* 3-dot theme picker */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {APP_THEMES.map(t => (
              <button key={t.id} onClick={() => setTid(t.id)} title={t.label} style={{
                width: 22, height: 22, borderRadius: '50%', background: t.dot, border: 'none', cursor: 'pointer',
                outline: tid === t.id ? `2.5px solid #fff` : '2.5px solid transparent',
                outlineOffset: 2,
                transform: tid === t.id ? 'scale(1.2)' : 'scale(1)',
                transition: 'all .15s',
              }}/>
            ))}
          </div>
        </div>

        {/* ── FORM ─────────────────────────────────────────────────────────── */}
        {st === 'form' && (
          <>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 34, fontWeight: 300, color: '#fff', lineHeight: 1.25, marginBottom: 12 }}>
                Know<br/><span style={{ fontWeight: 800, color: A }}>yourself.</span>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.32)', lineHeight: 1.7 }}>
                50+ biomarkers. One biological age score.<br/>Personalised to you, every 90 days.
              </div>
            </div>

            {/* Mobile / Email tab */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 22, background: '#1e1e1e', borderRadius: 12, padding: 4 }}>
              {['mobile', 'email'].map(t => (
                <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                  flex: 1, padding: '11px 0', border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: tab === t ? A : 'none',
                  color: tab === t ? '#000' : 'rgba(255,255,255,0.3)',
                  transition: 'all .18s',
                }}>
                  {t === 'mobile' ? '📱 Mobile' : '✉️ Email'}
                </button>
              ))}
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <input style={inp} placeholder="Full name" value={nm} onChange={e => setNm(e.target.value)}/>
            </div>

            {/* Mobile */}
            {tab === 'mobile' ? (
              <div style={{ marginBottom: 14, position: 'relative' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowCC(!showCC)} style={{
                    padding: '14px 12px', background: '#2a2a2a', border: '1px solid #383838',
                    borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    {cc.flag} {cc.dial} ▾
                  </button>
                  <input style={{ ...inp, flex: 1 }} type="tel" placeholder={`${cc.min}-digit number`}
                    value={ph} onChange={e => setPh(e.target.value.replace(/\D/g, '').slice(0, cc.max))}/>
                </div>
                {showCC && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 200, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, width: 230, maxHeight: 230, overflowY: 'auto', marginTop: 6, boxShadow: '0 8px 28px rgba(0,0,0,0.4)' }}>
                    {COUNTRIES.map(c => (
                      <div key={c.code} onClick={() => { setCc(c); setShowCC(false); setPh('') }}
                        style={{ padding: '11px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center', color: c.code === cc.code ? A : '#ccc', background: c.code === cc.code ? `${A}10` : 'none', fontWeight: c.code === cc.code ? 700 : 400 }}>
                        {c.flag} {c.name} <span style={{ fontSize: 11, color: '#555', marginLeft: 'auto' }}>{c.dial}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 14 }}>
                <input style={inp} type="email" placeholder="you@example.com" value={em} onChange={e => setEm(e.target.value)}/>
              </div>
            )}

            {/* Consent checkboxes */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'terms',     required: true,  text: 'I agree to the ', link: 'Terms & Conditions', plain: null },
                { key: 'privacy',   required: true,  text: 'I have read the ', link: 'Privacy Policy', plain: null },
                { key: 'health',    required: true,  text: null, link: null, plain: 'I consent to processing of my health/sensitive data for biological age analysis (GDPR Art. 9 / DPDP Act 2023)' },
                { key: 'marketing', required: false, text: null, link: null, plain: 'Send me health tips, feature updates, and personalised offers (optional)' },
              ].map(({ key, required, text, link, plain }) => (
                <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* Checkbox box — click only toggles, nothing else */}
                  <div
                    onClick={() => setConsent(c => ({ ...c, [key]: !c[key] }))}
                    style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      border: consent[key] ? 'none' : '1.5px solid #666',
                      background: consent[key] ? A : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    {consent[key] && <span style={{ color: '#000', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </div>

                  {/* Text — clicking text also toggles; link opens new tab */}
                  <span
                    onClick={() => setConsent(c => ({ ...c, [key]: !c[key] }))}
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, cursor: 'pointer', userSelect: 'none' }}
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

            {err && <div style={{ fontSize: 13, color: '#f87171', marginBottom: 14, marginTop: 10, fontWeight: 600 }}>⚠ {err}</div>}

            <button onClick={go} disabled={!allRequired} style={{ width: '100%', padding: 17, background: allRequired ? `linear-gradient(90deg,${A},${theme.dark})` : '#2a2a2a', color: allRequired ? '#000' : '#555', border: 'none', borderRadius: 13, fontSize: 16, fontWeight: 800, cursor: allRequired ? 'pointer' : 'default', marginTop: 14, boxShadow: allRequired ? `0 6px 24px ${A}36` : 'none', transition: 'all .2s' }}>
              Continue →
            </button>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', textAlign: 'center', marginTop: 14, lineHeight: 1.8 }}>
              🔒 256-bit AES encrypted · DPDP Act 2023 · GDPR compliant
            </div>
          </>
        )}

        {/* ── OTP ──────────────────────────────────────────────────────────── */}
        {st === 'otp' && (
          <div style={{ paddingTop: 16 }}>
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
              <div style={{ marginTop: 14, display: 'inline-block', background: `${A}14`, border: `1px solid ${A}40`, borderRadius: 10, padding: '8px 18px', fontSize: 13, color: A, fontWeight: 700 }}>
                Demo OTP: 000000
              </div>
            </div>

            <OtpBoxes value={otp} onChange={setOtp} A={A}/>

            {err && <div style={{ fontSize: 13, color: '#f87171', marginTop: 16, fontWeight: 600, textAlign: 'center' }}>⚠ {err}</div>}

            <button onClick={verify} style={{ width: '100%', padding: 17, background: `linear-gradient(90deg,${A},${theme.dark})`, color: '#000', border: 'none', borderRadius: 13, fontSize: 16, fontWeight: 800, cursor: 'pointer', margin: '26px 0 16px', boxShadow: `0 6px 24px ${A}36` }}>
              Verify →
            </button>
            <div style={{ textAlign: 'center' }}><Timer secs={55} A={A}/></div>

            <button onClick={() => setSt('form')} style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer' }}>
              ← Change number / email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
