import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Shared data ───────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'IN', dial: '+91',  flag: '🇮🇳', name: 'India',         min: 10, max: 10, pattern: /^[6-9]\d{9}$/ },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'USA',           min: 10, max: 10, pattern: /^\d{10}$/ },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'UK',            min: 10, max: 11, pattern: /^\d{10,11}$/ },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE',           min: 9,  max: 9,  pattern: /^[0-9]\d{8}$/ },
  { code: 'SG', dial: '+65',  flag: '🇸🇬', name: 'Singapore',     min: 8,  max: 8,  pattern: /^\d{8}$/ },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canada',        min: 10, max: 10, pattern: /^\d{10}$/ },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Australia',     min: 9,  max: 10, pattern: /^\d{9,10}$/ },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Germany',       min: 10, max: 12, pattern: /^\d{10,12}$/ },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', name: 'Netherlands',   min: 9,  max: 10, pattern: /^\d{9,10}$/ },
  { code: 'MY', dial: '+60',  flag: '🇲🇾', name: 'Malaysia',      min: 9,  max: 10, pattern: /^\d{9,10}$/ },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia',  min: 9,  max: 9,  pattern: /^[15]\d{8}$/ },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'Qatar',         min: 8,  max: 8,  pattern: /^\d{8}$/ },
]

function validateEmail(e) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e)
}
function validatePhone(phone, country) {
  const digits = phone.replace(/\D/g, '')
  return country.pattern.test(digits)
}

// ── Shared OTP boxes ──────────────────────────────────────────────────────────
function OtpBoxes({ otp, onChange, accent }) {
  const refs = useRef([])
  function handleKey(i, e) {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = v
    onChange(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
    if (!v && e.nativeEvent.inputType === 'deleteContentBackward' && i > 0) refs.current[i - 1]?.focus()
  }
  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) onChange(text.split(''))
    e.preventDefault()
  }
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {otp.map((v, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 40, height: 48, textAlign: 'center', fontSize: 20, fontWeight: 800,
            border: `2px solid ${v ? accent : '#e2e8f0'}`,
            borderRadius: 10, background: v ? `${accent}10` : '#f8fafc',
            color: accent, outline: 'none', transition: 'all 0.2s',
          }}
        />
      ))}
    </div>
  )
}

// ── Countdown timer ───────────────────────────────────────────────────────────
function Countdown({ seconds, onDone }) {
  const [s, setS] = useState(seconds)
  useEffect(() => {
    if (s <= 0) { onDone?.(); return }
    const t = setTimeout(() => setS(s - 1), 1000)
    return () => clearTimeout(t)
  }, [s])
  return s > 0
    ? <span>Resend OTP in <b>{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</b></span>
    : <button onClick={() => setS(seconds)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit', textDecoration: 'underline' }}>Resend OTP</button>
}

// ════════════════════════════════════════════════════════════
// DESIGN A — "Minimal Teal" (Modern health app, tab-switched)
// ════════════════════════════════════════════════════════════
function DesignA() {
  const [tab,      setTab]     = useState('mobile')  // mobile | email
  const [country,  setCountry] = useState(COUNTRIES[0])
  const [phone,    setPhone]   = useState('')
  const [email,    setEmail]   = useState('')
  const [name,     setName]    = useState('')
  const [stage,    setStage]   = useState('form')    // form | otp | done
  const [otp,      setOtp]     = useState(Array(6).fill(''))
  const [err,      setErr]     = useState('')
  const [showCountry, setShowCountry] = useState(false)

  const ACCENT = '#0d9488'

  const inp = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', background: '#fff',
    color: '#0f172a',
  }

  function validate() {
    if (!name.trim() || name.trim().length < 2) return setErr('Please enter your full name')
    if (tab === 'mobile') {
      if (!validatePhone(phone, country)) return setErr(`Enter a valid ${country.name} mobile number`)
    } else {
      if (!validateEmail(email)) return setErr('Enter a valid email address')
    }
    setErr('')
    setStage('otp')
  }

  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr('')
    setStage('done')
  }

  if (stage === 'done') return (
    <div style={{ minHeight: 660, background: '#f0fdfa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Welcome, {name.split(' ')[0]}!</div>
      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>Your AROGYOS account is ready. Let's find your biological age.</div>
      <div style={{ marginTop: 24, background: ACCENT, color: '#fff', borderRadius: 14, padding: '14px 28px', fontWeight: 800, fontSize: 15 }}>Start My BioAge Quiz →</div>
    </div>
  )

  return (
    <div style={{ minHeight: 660, background: 'linear-gradient(160deg,#0f3a3a 0%,#134e4a 50%,#0f3a3a 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '32px 24px 20px', color: '#fff' }}>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>🧬 AROGYOS</div>
        <div style={{ fontSize: 13, color: '#9fd9cf', marginTop: 4 }}>Your biological age reversal companion</div>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', flex: 1, padding: '24px 20px' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Create your account</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>Sign up free — no credit card needed</div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, marginBottom: 18 }}>
          {['mobile', 'email'].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: tab === t ? '#fff' : 'none',
              color: tab === t ? ACCENT : '#94a3b8',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
              {t === 'mobile' ? '📱 Mobile' : '✉️ Email'}
            </button>
          ))}
        </div>

        {stage === 'form' && (
          <>
            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5 }}>FULL NAME</div>
              <input style={inp} placeholder="e.g. Priya Sharma" value={name} onChange={e => setName(e.target.value)} />
            </div>

            {/* Phone or Email */}
            {tab === 'mobile' ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5 }}>MOBILE NUMBER</div>
                <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                  <button onClick={() => setShowCountry(!showCountry)} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '11px 10px',
                    background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12,
                    cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#334155', whiteSpace: 'nowrap',
                  }}>
                    {country.flag} {country.dial} ▾
                  </button>
                  <input style={{ ...inp, flex: 1 }} type="tel" placeholder={`${country.min}-digit number`}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, country.max))} />
                  {showCountry && (
                    <div style={{
                      position: 'absolute', top: '110%', left: 0, zIndex: 99, background: '#fff',
                      border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      width: 210, maxHeight: 220, overflowY: 'auto',
                    }}>
                      {COUNTRIES.map(c => (
                        <div key={c.code} onClick={() => { setCountry(c); setShowCountry(false); setPhone('') }}
                          style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#334155', display: 'flex', gap: 8, alignItems: 'center',
                            background: c.code === country.code ? '#f0fdfa' : 'none', fontWeight: c.code === country.code ? 700 : 400 }}>
                          {c.flag} {c.name} <span style={{ color: '#94a3b8', fontSize: 11 }}>{c.dial}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5 }}>EMAIL ADDRESS</div>
                <input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            )}

            {err && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 10, fontWeight: 600 }}>⚠ {err}</div>}

            <button onClick={validate} style={{
              width: '100%', padding: 14, background: `linear-gradient(90deg,${ACCENT},#0891b2)`,
              color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 12,
            }}>
              Send OTP →
            </button>
            <div style={{ fontSize: 10.5, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
              🔒 256-bit encrypted · DPDP Act compliant · Your data is never sold
            </div>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📲</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Enter verification code</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                OTP sent to {tab === 'mobile' ? `${country.dial} ${phone}` : email}
              </div>
              <div style={{ marginTop: 8, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '7px 12px', display: 'inline-block', fontSize: 11, color: '#166534' }}>
                Demo OTP: <b>000000</b>
              </div>
            </div>

            <OtpBoxes otp={otp} onChange={setOtp} accent={ACCENT} />

            {err && <div style={{ fontSize: 12, color: '#dc2626', margin: '10px 0', fontWeight: 600, textAlign: 'center' }}>⚠ {err}</div>}

            <button onClick={verify} style={{
              width: '100%', padding: 14, background: `linear-gradient(90deg,${ACCENT},#0891b2)`,
              color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', margin: '16px 0 10px',
            }}>
              Verify & Continue →
            </button>
            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
              <Countdown seconds={45} />
            </div>
            <button onClick={() => { setStage('form'); setOtp(Array(6).fill('')) }} style={{
              background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', display: 'block', margin: '10px auto 0', textDecoration: 'underline',
            }}>← Change number / email</button>
          </>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// DESIGN B — "Night Premium" (Dark, glassmorphism)
// ════════════════════════════════════════════════════════════
function DesignB() {
  const [tab,     setTab]     = useState('mobile')
  const [country, setCountry] = useState(COUNTRIES[0])
  const [phone,   setPhone]   = useState('')
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [stage,   setStage]   = useState('form')
  const [otp,     setOtp]     = useState(Array(6).fill(''))
  const [err,     setErr]     = useState('')
  const [showCC,  setShowCC]  = useState(false)

  const ACCENT = '#14f0d0'
  const DARK   = '#070d1f'

  function validate() {
    if (!name.trim() || name.trim().length < 2) return setErr('Full name required')
    if (tab === 'mobile') {
      if (!validatePhone(phone, country)) return setErr(`Invalid ${country.name} number`)
    } else {
      if (!validateEmail(email)) return setErr('Invalid email address')
    }
    setErr(''); setStage('otp')
  }

  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setStage('done')
  }

  if (stage === 'done') return (
    <div style={{ minHeight: 660, background: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>✨</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>You're in, {name.split(' ')[0]}!</div>
      <div style={{ fontSize: 13, color: '#9fd9cf', lineHeight: 1.6 }}>Your health journey begins now.</div>
      <div style={{ marginTop: 24, background: ACCENT, color: DARK, borderRadius: 14, padding: '14px 28px', fontWeight: 900, fontSize: 15 }}>Begin BioAge Assessment →</div>
    </div>
  )

  const glassInp = {
    width: '100%', padding: '12px 14px', border: `1.5px solid rgba(255,255,255,0.15)`,
    borderRadius: 12, fontSize: 14, background: 'rgba(255,255,255,0.06)',
    color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: 660, background: DARK, padding: '28px 20px', position: 'relative', overflow: 'hidden' }}>
      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: -60, left: -40, width: 180, height: 180, background: 'rgba(20,240,208,0.12)', borderRadius: '50%', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', top: 100, right: -60, width: 160, height: 160, background: 'rgba(99,102,241,0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />

      {/* Logo */}
      <div style={{ marginBottom: 28, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🧬</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>AROGYOS</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Reverse your biological age</div>
      </div>

      {/* Glass card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, backdropFilter: 'blur(20px)', padding: '22px 18px', position: 'relative',
      }}>
        {stage === 'form' && (
          <>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginBottom: 3 }}>Create account</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 18 }}>Join 10,000+ users reversing their age</div>

            {/* Tab */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, marginBottom: 16 }}>
              {['mobile', 'email'].map(t => (
                <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: tab === t ? 'rgba(20,240,208,0.15)' : 'none',
                  color: tab === t ? ACCENT : 'rgba(255,255,255,0.35)',
                }}>
                  {t === 'mobile' ? '📱 Mobile' : '✉️ Email'}
                </button>
              ))}
            </div>

            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 5, letterSpacing: 1 }}>FULL NAME</div>
              <input style={glassInp} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            {tab === 'mobile' ? (
              <div style={{ marginBottom: 12, position: 'relative' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 5, letterSpacing: 1 }}>MOBILE NUMBER</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowCC(!showCC)} style={{
                    padding: '11px 10px', background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 12,
                    color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    {country.flag} {country.dial} ▾
                  </button>
                  <input style={{ ...glassInp, flex: 1 }} type="tel" placeholder={`${country.min} digits`}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, country.max))} />
                </div>
                {showCC && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 99,
                    background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14, width: 210, maxHeight: 200, overflowY: 'auto', marginTop: 4,
                  }}>
                    {COUNTRIES.map(c => (
                      <div key={c.code} onClick={() => { setCountry(c); setShowCC(false); setPhone('') }}
                        style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#e2e8f0', display: 'flex', gap: 8, alignItems: 'center' }}>
                        {c.flag} {c.name} <span style={{ color: '#64748b', fontSize: 11 }}>{c.dial}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 5, letterSpacing: 1 }}>EMAIL ADDRESS</div>
                <input style={glassInp} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            )}

            {err && <div style={{ fontSize: 12, color: '#f87171', marginBottom: 10, fontWeight: 600 }}>⚠ {err}</div>}

            <button onClick={validate} style={{
              width: '100%', padding: 14, background: ACCENT,
              color: DARK, border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 900, cursor: 'pointer', marginBottom: 12,
            }}>
              Get OTP →
            </button>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
              🔐 End-to-end encrypted · Zero data selling policy
            </div>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Verify it's you</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                Code sent to {tab === 'mobile' ? `${country.dial} ${phone}` : email}
              </div>
              <div style={{ marginTop: 8, background: 'rgba(20,240,208,0.1)', border: '1px solid rgba(20,240,208,0.3)', borderRadius: 8, padding: '6px 12px', display: 'inline-block', fontSize: 11, color: ACCENT }}>
                Demo OTP: <b>000000</b>
              </div>
            </div>

            {/* Dark-styled OTP boxes */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
              {otp.map((v, i) => (
                <input key={i} type="text" inputMode="numeric" maxLength={1} value={v}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(-1)
                    const next = [...otp]; next[i] = val; setOtp(next)
                  }}
                  style={{
                    width: 40, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 900,
                    background: v ? 'rgba(20,240,208,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${v ? ACCENT : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12, color: ACCENT, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              ))}
            </div>

            {err && <div style={{ fontSize: 12, color: '#f87171', marginBottom: 10, fontWeight: 600, textAlign: 'center' }}>⚠ {err}</div>}

            <button onClick={verify} style={{
              width: '100%', padding: 14, background: ACCENT,
              color: DARK, border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 900, cursor: 'pointer', marginBottom: 10,
            }}>
              Verify →
            </button>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              <Countdown seconds={45} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// DESIGN C — "Medical Trust" (Clinical white, dual-field)
// ════════════════════════════════════════════════════════════
function DesignC() {
  const [country, setCountry] = useState(COUNTRIES[0])
  const [phone,   setPhone]   = useState('')
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [stage,   setStage]   = useState('form')
  const [otp,     setOtp]     = useState(Array(6).fill(''))
  const [err,     setErr]     = useState('')
  const [showCC,  setShowCC]  = useState(false)

  const ACCENT = '#2563eb'

  function validate() {
    if (!name.trim() || name.trim().length < 2) return setErr('Full name is required')
    if (!validateEmail(email)) return setErr('Please enter a valid email address')
    if (!validatePhone(phone, country)) return setErr(`Enter a valid ${country.min}-digit ${country.name} mobile number`)
    setErr(''); setStage('otp')
  }

  function verify() {
    if (otp.join('').length < 6) return setErr('Enter the 6-digit OTP')
    setErr(''); setStage('done')
  }

  if (stage === 'done') return (
    <div style={{ minHeight: 660, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>✓</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Account verified!</div>
      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>Welcome, {name.split(' ')[0]}. Your health records are ready.</div>
      <div style={{ marginTop: 24, background: ACCENT, color: '#fff', borderRadius: 12, padding: '13px 24px', fontWeight: 800, fontSize: 14 }}>Go to Dashboard →</div>
    </div>
  )

  const inp = {
    width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 14, fontFamily: 'inherit', color: '#0f172a',
    outline: 'none', boxSizing: 'border-box', background: '#fff',
  }

  return (
    <div style={{ minHeight: 660, background: '#fff' }}>
      {/* Step indicator */}
      <div style={{ background: '#f8fafc', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {['Details', 'Verify', 'Done'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i === (stage === 'form' ? 0 : stage === 'otp' ? 1 : 2) ? ACCENT : '#e2e8f0',
              color: i === (stage === 'form' ? 0 : stage === 'otp' ? 1 : 2) ? '#fff' : '#94a3b8',
            }}>{i + 1}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{s}</span>
            {i < 2 && <span style={{ color: '#e2e8f0', fontSize: 12 }}>—</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>🧬</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>AROGYOS</span>
          </div>
          {stage === 'form' && <>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Create your health account</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Both mobile and email are required for account security</div>
          </>}
          {stage === 'otp' && <>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Verify your identity</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>OTP sent to {email} and {country.dial} {phone}</div>
          </>}
        </div>

        {stage === 'form' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>FULL NAME *</label>
              <input style={inp} placeholder="As per government ID" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>EMAIL ADDRESS *</label>
              <input style={inp} type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              {email && !validateEmail(email) && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>✗ Invalid email format</div>}
              {email && validateEmail(email) && <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>✓ Valid email</div>}
            </div>

            <div style={{ marginBottom: 14, position: 'relative' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>MOBILE NUMBER *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowCC(!showCC)} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '10px 10px',
                  background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10,
                  cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#334155', whiteSpace: 'nowrap',
                }}>
                  {country.flag} {country.dial} ▾
                </button>
                <input style={{ ...inp, flex: 1 }} type="tel" placeholder={`${country.min}-digit number`}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, country.max))} />
              </div>
              {phone && !validatePhone(phone, country) && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>✗ Invalid number for {country.name}</div>}
              {phone && validatePhone(phone, country) && <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>✓ Valid number</div>}

              {showCC && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 99, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: 210, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                  {COUNTRIES.map(c => (
                    <div key={c.code} onClick={() => { setCountry(c); setShowCC(false); setPhone('') }}
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#334155', display: 'flex', gap: 8, alignItems: 'center', background: c.code === country.code ? '#eff6ff' : 'none' }}>
                      {c.flag} {c.name} <span style={{ color: '#94a3b8', fontSize: 11 }}>{c.dial}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {err && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626', marginBottom: 12, fontWeight: 600 }}>⚠ {err}</div>}

            <button onClick={validate} style={{
              width: '100%', padding: 14, background: ACCENT,
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 14,
            }}>
              Continue to Verification →
            </button>

            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 13px', fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
              🔒 <strong>Your privacy matters:</strong> Your data is stored encrypted, never sold to third parties, and complies with DPDP Act 2023 and GDPR.
            </div>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 13px', fontSize: 12, color: '#1d4ed8', marginBottom: 20 }}>
              ℹ OTP sent to both your email and mobile. Enter the code from either.
              <div style={{ marginTop: 6, fontWeight: 700 }}>Demo OTP: 000000</div>
            </div>

            <OtpBoxes otp={otp} onChange={setOtp} accent={ACCENT} />

            {err && <div style={{ fontSize: 12, color: '#dc2626', margin: '10px 0', fontWeight: 600, textAlign: 'center' }}>⚠ {err}</div>}

            <button onClick={verify} style={{
              width: '100%', padding: 14, background: ACCENT,
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', margin: '16px 0 10px',
            }}>
              Verify & Activate Account →
            </button>
            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
              <Countdown seconds={60} />
            </div>
            <button onClick={() => { setStage('form'); setOtp(Array(6).fill('')) }} style={{
              background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', display: 'block', margin: '10px auto 0', textDecoration: 'underline',
            }}>← Edit details</button>
          </>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// DESIGN D — "Warm Journey" (Friendly, warm palette, choice cards)
// ════════════════════════════════════════════════════════════
function DesignD() {
  const [step,    setStep]    = useState('choose')   // choose | details | otp | done
  const [method,  setMethod]  = useState(null)       // mobile | email
  const [country, setCountry] = useState(COUNTRIES[0])
  const [phone,   setPhone]   = useState('')
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [otp,     setOtp]     = useState(Array(6).fill(''))
  const [err,     setErr]     = useState('')
  const [showCC,  setShowCC]  = useState(false)

  const ACCENT  = '#d97706'
  const ACCENT2 = '#0d9488'

  function goDetails(m) { setMethod(m); setStep('details'); setErr('') }

  function validate() {
    if (!name.trim() || name.trim().length < 2) return setErr('Name is required')
    if (method === 'mobile') {
      if (!validatePhone(phone, country)) return setErr(`Invalid ${country.name} number (${country.min} digits required)`)
    } else {
      if (!validateEmail(email)) return setErr('Enter a valid email address')
    }
    setErr(''); setStep('otp')
  }

  function verify() {
    if (otp.join('').length < 6) return setErr('Enter the full 6-digit code')
    setErr(''); setStep('done')
  }

  const PROGRESS = { choose: 1, details: 2, otp: 3, done: 4 }

  if (step === 'done') return (
    <div style={{ minHeight: 660, background: 'linear-gradient(160deg,#fef9f0,#fff7ed)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, background: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>🧬</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Journey started, {name.split(' ')[0]}! 🎉</div>
      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>Your health vault is ready. Time to discover your biological age.</div>
      <div style={{ marginTop: 24, background: ACCENT, color: '#fff', borderRadius: 14, padding: '14px 28px', fontWeight: 800, fontSize: 15 }}>Discover My BioAge →</div>
    </div>
  )

  const inp = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 12, fontSize: 14, fontFamily: 'inherit', color: '#0f172a',
    outline: 'none', boxSizing: 'border-box', background: '#fff',
  }

  return (
    <div style={{ minHeight: 660, background: 'linear-gradient(160deg,#fef9f0 0%,#f0fdfa 100%)' }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: '#e2e8f0' }}>
        <div style={{ height: '100%', background: `linear-gradient(90deg,${ACCENT},${ACCENT2})`, width: `${(PROGRESS[step] / 4) * 100}%`, transition: 'width 0.4s' }} />
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <span style={{ fontSize: 22 }}>🧬</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>AROGYOS</span>
        </div>

        {/* STEP: Choose method */}
        {step === 'choose' && (
          <>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: 6 }}>
              Start your age<br/>reversal journey
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 28, lineHeight: 1.5 }}>
              How would you like to sign up?
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <button onClick={() => goDetails('mobile')} style={{
                padding: '18px 20px', background: '#fff', border: `2px solid #e2e8f0`,
                borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'left',
              }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>📱</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Mobile Number</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>India & 10+ countries supported</div>
                </div>
                <span style={{ marginLeft: 'auto', color: ACCENT, fontSize: 18 }}>→</span>
              </button>

              <button onClick={() => goDetails('email')} style={{
                padding: '18px 20px', background: '#fff', border: `2px solid #e2e8f0`,
                borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'left',
              }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>✉️</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Email Address</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Any valid email, worldwide</div>
                </div>
                <span style={{ marginLeft: 'auto', color: ACCENT, fontSize: 18 }}>→</span>
              </button>
            </div>

            {/* Social proof */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>WHAT YOU GET</div>
              {['Personalised BioAge score', 'Health vault for all your reports', 'AI health coach', '90-day reversal protocol'].map(f => (
                <div key={f} style={{ fontSize: 12, color: '#334155', padding: '4px 0', display: 'flex', gap: 7 }}>
                  <span style={{ color: ACCENT2 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP: Details */}
        {step === 'details' && (
          <>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
              {method === 'mobile' ? '📱 Mobile sign up' : '✉️ Email sign up'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>Enter your details — we'll send a one-time code</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>YOUR NAME</label>
              <input style={inp} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            {method === 'mobile' ? (
              <div style={{ marginBottom: 14, position: 'relative' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>MOBILE NUMBER</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowCC(!showCC)} style={{
                    padding: '11px 10px', background: '#fff', border: '1.5px solid #e2e8f0',
                    borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#334155', whiteSpace: 'nowrap',
                  }}>
                    {country.flag} {country.dial} ▾
                  </button>
                  <input style={{ ...inp, flex: 1 }} type="tel" placeholder={`${country.min} digits`}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, country.max))} />
                </div>
                {showCC && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 99, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: 210, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                    {COUNTRIES.map(c => (
                      <div key={c.code} onClick={() => { setCountry(c); setShowCC(false); setPhone('') }}
                        style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#334155', display: 'flex', gap: 8, alignItems: 'center' }}>
                        {c.flag} {c.name} <span style={{ color: '#94a3b8', fontSize: 11 }}>{c.dial}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>EMAIL ADDRESS</label>
                <input style={inp} type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            )}

            {err && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 12, fontWeight: 600 }}>⚠ {err}</div>}

            <button onClick={validate} style={{
              width: '100%', padding: 14, background: `linear-gradient(90deg,${ACCENT},#f59e0b)`,
              color: '#fff', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 10,
            }}>
              Send Verification Code →
            </button>
            <button onClick={() => setStep('choose')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', display: 'block', margin: '0 auto', textDecoration: 'underline' }}>
              ← Choose differently
            </button>
          </>
        )}

        {/* STEP: OTP */}
        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{method === 'mobile' ? '📲' : '📧'}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>
                Check your {method === 'mobile' ? 'phone' : 'inbox'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 5, lineHeight: 1.5 }}>
                6-digit code sent to<br/>
                <strong style={{ color: '#0f172a' }}>{method === 'mobile' ? `${country.dial} ${phone}` : email}</strong>
              </div>
              <div style={{ marginTop: 10, background: '#fef9f0', border: '1.5px solid #fde68a', borderRadius: 10, padding: '8px 14px', display: 'inline-block', fontSize: 12, color: '#92400e', fontWeight: 700 }}>
                Demo OTP: 000000
              </div>
            </div>

            <OtpBoxes otp={otp} onChange={setOtp} accent={ACCENT} />

            {err && <div style={{ fontSize: 12, color: '#dc2626', margin: '10px 0', fontWeight: 600, textAlign: 'center' }}>⚠ {err}</div>}

            <button onClick={verify} style={{
              width: '100%', padding: 14, background: `linear-gradient(90deg,${ACCENT},#f59e0b)`,
              color: '#fff', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 800, cursor: 'pointer', margin: '16px 0 10px',
            }}>
              Verify & Start →
            </button>
            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
              <Countdown seconds={60} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Phone frame wrapper ───────────────────────────────────────────────────────
function PhoneFrame({ children, label, badge, badgeColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>{label}</div>
        <div style={{
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: `${badgeColor}18`, color: badgeColor, border: `1px solid ${badgeColor}44`,
        }}>{badge}</div>
      </div>
      <div style={{
        width: 360, height: 660, border: '10px solid #1e293b', borderRadius: 36,
        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.1)',
        position: 'relative', background: '#fff',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 100, height: 22, background: '#1e293b', borderRadius: '0 0 14px 14px',
          zIndex: 99,
        }} />
        <div style={{ height: '100%', overflowY: 'auto', paddingTop: 10 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Preview page ──────────────────────────────────────────────────────────────
export default function SignupDesignsPreview() {
  const nav = useNavigate()

  const DESIGNS = [
    { label: 'Option A', badge: 'Tab Switch', badgeColor: '#0d9488', comp: <DesignA />, desc: 'Teal gradient hero + white card. Tab toggle between Mobile/Email. Clean and modern.' },
    { label: 'Option B', badge: 'Dark Premium', badgeColor: '#7c3aed', comp: <DesignB />, desc: 'Deep dark background with glassmorphism card. Glow effects. Premium health tech feel.' },
    { label: 'Option C', badge: 'Medical Trust', badgeColor: '#2563eb', comp: <DesignC />, desc: 'Clinical white. Requires BOTH email + mobile for maximum security. Real-time validation.' },
    { label: 'Option D', badge: 'Warm Journey', badgeColor: '#d97706', comp: <DesignD />, desc: 'Warm amber palette. Step-by-step with big choice cards. Most user-friendly flow.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px 0 48px' }}>
      {/* Header */}
      <div style={{ padding: '0 24px 24px', maxWidth: 1600, margin: '0 auto' }}>
        <button onClick={() => nav('/upload')} style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: 0 }}>← Back to App</button>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Signup UI Designs — 4 Options</div>
        <div style={{ fontSize: 14, color: '#64748b', maxWidth: 600, lineHeight: 1.6 }}>
          All designs support domestic (India) + international signup via mobile or email with in-frame OTP. Real-time phone number validation per country. <strong>Try each design interactively</strong> — enter any name, a valid mobile/email, then use <code style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4 }}>000000</code> as the demo OTP.
        </div>

        {/* Validation note */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {['✓ Country code selector (12 countries)', '✓ Phone format validated per country', '✓ Email regex validated', '✓ OTP in-frame, no SMS needed', '✓ Resend countdown timer', '✓ No dummy data accepted'].map(f => (
            <div key={f} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#334155', fontWeight: 600 }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Design frames — horizontal scroll */}
      <div style={{ display: 'flex', gap: 32, overflowX: 'auto', padding: '0 24px 16px', alignItems: 'flex-start', scrollSnapType: 'x mandatory' }}>
        {DESIGNS.map(d => (
          <div key={d.label} style={{ display: 'flex', flexDirection: 'column', gap: 12, scrollSnapAlign: 'start', flexShrink: 0 }}>
            <PhoneFrame label={d.label} badge={d.badge} badgeColor={d.badgeColor}>
              {d.comp}
            </PhoneFrame>
            <div style={{ width: 360, background: '#fff', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#475569', lineHeight: 1.6, border: '1px solid #e2e8f0' }}>
              {d.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '24px 24px 0', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
        Tell us which design (A/B/C/D) you want to integrate → we'll wire it into the app with real OTP via email API.
      </div>
    </div>
  )
}
