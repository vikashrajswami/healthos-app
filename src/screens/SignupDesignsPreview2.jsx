import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Shared validation ─────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'IN', dial: '+91',  flag: '🇮🇳', name: 'India',        min: 10, max: 10, pattern: /^[6-9]\d{9}$/ },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'USA',          min: 10, max: 10, pattern: /^\d{10}$/ },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'UK',           min: 10, max: 11, pattern: /^\d{10,11}$/ },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE',          min: 9,  max: 9,  pattern: /^[0-9]\d{8}$/ },
  { code: 'SG', dial: '+65',  flag: '🇸🇬', name: 'Singapore',    min: 8,  max: 8,  pattern: /^\d{8}$/ },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canada',       min: 10, max: 10, pattern: /^\d{10}$/ },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Australia',    min: 9,  max: 10, pattern: /^\d{9,10}$/ },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Germany',      min: 10, max: 12, pattern: /^\d{10,12}$/ },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia', min: 9,  max: 9,  pattern: /^[15]\d{8}$/ },
  { code: 'MY', dial: '+60',  flag: '🇲🇾', name: 'Malaysia',     min: 9,  max: 10, pattern: /^\d{9,10}$/ },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'Qatar',        min: 8,  max: 8,  pattern: /^\d{8}$/ },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', name: 'Netherlands',  min: 9,  max: 10, pattern: /^\d{9,10}$/ },
]
const validateEmail = e => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e)
const validatePhone = (p, c) => c.pattern.test(p.replace(/\D/g, ''))

// ── Shared: OTP boxes ─────────────────────────────────────────────────────────
function OtpBoxes({ value, onChange, boxStyle, activeStyle }) {
  const refs = useRef([])
  const arr  = value.length === 6 ? value : Array(6).fill('')

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
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {arr.map((v, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={v}
          onChange={e => onInput(i, e)} onPaste={onPaste}
          style={{ ...boxStyle, ...(v ? activeStyle : {}) }}
        />
      ))}
    </div>
  )
}

// ── Shared: Resend timer ──────────────────────────────────────────────────────
function Timer({ secs, color, onResend }) {
  const [s, setS] = useState(secs)
  useEffect(() => {
    if (s <= 0) return
    const t = setTimeout(() => setS(s - 1), 1000)
    return () => clearTimeout(t)
  }, [s])
  return s > 0
    ? <span style={{ color, fontSize: 12 }}>Resend in <b>{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</b></span>
    : <button onClick={() => { setS(secs); onResend?.() }} style={{ background: 'none', border: 'none', color, cursor: 'pointer', fontWeight: 700, fontSize: 12, textDecoration: 'underline' }}>Resend code</button>
}

// ════════════════════════════════════════════════════════════════════
// DESIGN 1 — "ZERO" · Whoop-inspired · Pure black, athletic red
// ════════════════════════════════════════════════════════════════════
function Design1() {
  const [tab,   setTab]   = useState('mobile')
  const [cc,    setCc]    = useState(COUNTRIES[0])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [name,  setName]  = useState('')
  const [stage, setStage] = useState('form')
  const [otp,   setOtp]   = useState(Array(6).fill(''))
  const [err,   setErr]   = useState('')
  const [showCC,setShowCC]= useState(false)

  const RED  = '#e63946'
  const line = { width:'100%', background:'none', border:'none', borderBottom:'1.5px solid rgba(255,255,255,0.2)', color:'#fff', fontSize:16, padding:'14px 0', outline:'none', fontFamily:'inherit', caretColor: RED }

  function go() {
    if (name.trim().length < 2) return setErr('Enter your full name')
    if (tab === 'mobile' && !validatePhone(phone, cc)) return setErr(`Invalid ${cc.name} mobile number`)
    if (tab === 'email' && !validateEmail(email)) return setErr('Enter a valid email address')
    setErr(''); setStage('otp')
  }
  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setStage('done')
  }

  if (stage === 'done') return (
    <div style={{ height:660, background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:RED, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:20 }}>✓</div>
      <div style={{ fontSize:26, fontWeight:900, color:'#fff', letterSpacing:-0.5, marginBottom:8 }}>YOU'RE IN.</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>Welcome, {name.split(' ')[0].toUpperCase()}.<br/>Your biological age journey starts now.</div>
      <button style={{ marginTop:32, padding:'16px 32px', background:RED, color:'#fff', border:'none', borderRadius:4, fontSize:14, fontWeight:900, letterSpacing:1.5, cursor:'pointer' }}>
        BEGIN →
      </button>
    </div>
  )

  return (
    <div style={{ height:660, background:'#000', display:'flex', flexDirection:'column', padding:'32px 28px', overflowY:'auto', position:'relative' }}>
      {/* Decorative arc */}
      <svg style={{ position:'absolute', top:0, right:0, opacity:.07 }} width="200" height="200" viewBox="0 0 200 200">
        <circle cx="160" cy="40" r="120" fill="none" stroke={RED} strokeWidth="40" />
      </svg>

      {/* Logo */}
      <div style={{ marginBottom:48, position:'relative' }}>
        <div style={{ fontSize:11, fontWeight:900, letterSpacing:4, color:'rgba(255,255,255,0.35)' }}>HEALTHOS</div>
        <div style={{ width:24, height:2, background:RED, marginTop:6 }} />
      </div>

      {stage === 'form' && (
        <>
          <div style={{ marginBottom:40 }}>
            <div style={{ fontSize:32, fontWeight:900, color:'#fff', lineHeight:1.15, letterSpacing:-1 }}>
              KNOW YOUR<br/>
              <span style={{ color:RED }}>BIOLOGICAL</span><br/>
              AGE.
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:12, letterSpacing:0.5 }}>
              SCIENCE-BACKED · AI-POWERED · PERSONALISED
            </div>
          </div>

          {/* Tab */}
          <div style={{ display:'flex', marginBottom:28, borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            {['mobile','email'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                flex:1, background:'none', border:'none', padding:'10px 0',
                fontSize:11, fontWeight:900, letterSpacing:2, cursor:'pointer', textTransform:'uppercase',
                color: tab===t ? '#fff' : 'rgba(255,255,255,0.3)',
                borderBottom: tab===t ? `2px solid ${RED}` : '2px solid transparent',
                marginBottom:-1,
              }}>
                {t === 'mobile' ? '📱 Mobile' : '✉️ Email'}
              </button>
            ))}
          </div>

          {/* Name */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:10, letterSpacing:2, color:'rgba(255,255,255,0.35)', marginBottom:6 }}>FULL NAME</div>
            <input style={line} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </div>

          {tab === 'mobile' ? (
            <div style={{ marginBottom:24, position:'relative' }}>
              <div style={{ fontSize:10, letterSpacing:2, color:'rgba(255,255,255,0.35)', marginBottom:6 }}>MOBILE NUMBER</div>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                <button onClick={() => setShowCC(!showCC)} style={{ background:'none', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', padding:0, paddingBottom:14, borderBottom:'1.5px solid rgba(255,255,255,0.2)' }}>
                  {cc.flag} {cc.dial} ▾
                </button>
                <input style={{ ...line, flex:1 }} type="tel" placeholder={`${cc.min}-digit number`}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,cc.max))} />
              </div>
              {showCC && (
                <div style={{ position:'absolute', top:'100%', left:0, zIndex:99, background:'#111', border:'1px solid #222', borderRadius:8, width:210, maxHeight:200, overflowY:'auto', marginTop:4 }}>
                  {COUNTRIES.map(c => (
                    <div key={c.code} onClick={() => { setCc(c); setShowCC(false); setPhone('') }}
                      style={{ padding:'10px 14px', cursor:'pointer', fontSize:13, color:c.code===cc.code?RED:'#ccc', display:'flex', gap:8, alignItems:'center' }}>
                      {c.flag} {c.name} <span style={{ color:'#555', fontSize:11 }}>{c.dial}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:10, letterSpacing:2, color:'rgba(255,255,255,0.35)', marginBottom:6 }}>EMAIL ADDRESS</div>
              <input style={line} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          )}

          {err && <div style={{ fontSize:12, color:RED, marginBottom:10, fontWeight:700 }}>⚠ {err}</div>}

          <button onClick={go} style={{ width:'100%', padding:16, background:RED, color:'#fff', border:'none', borderRadius:4, fontSize:13, fontWeight:900, letterSpacing:2, cursor:'pointer', marginTop:8 }}>
            GET STARTED →
          </button>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:14, letterSpacing:0.5 }}>
            256-BIT ENCRYPTED · DPDP COMPLIANT · ZERO DATA SELLING
          </div>
        </>
      )}

      {stage === 'otp' && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:11, letterSpacing:3, color:RED, marginBottom:8 }}>STEP 2 OF 2</div>
            <div style={{ fontSize:26, fontWeight:900, color:'#fff', lineHeight:1.2, letterSpacing:-0.5 }}>ENTER<br/>YOUR CODE.</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:8 }}>
              Sent to {tab==='mobile' ? `${cc.dial} ${phone}` : email}
            </div>
            <div style={{ marginTop:10, display:'inline-block', background:'rgba(230,57,70,0.15)', border:`1px solid ${RED}44`, borderRadius:6, padding:'6px 12px', fontSize:11, color:RED, fontWeight:700 }}>
              Demo code: 000000
            </div>
          </div>

          <OtpBoxes value={otp} onChange={setOtp}
            boxStyle={{ width:38, height:52, textAlign:'center', fontSize:22, fontWeight:900, background:'#111', border:'2px solid #333', borderRadius:4, color:'#fff', outline:'none', boxSizing:'border-box', fontFamily:'monospace' }}
            activeStyle={{ borderColor:RED, background:'rgba(230,57,70,0.1)', color:RED }}
          />

          {err && <div style={{ fontSize:12, color:RED, marginTop:12, fontWeight:700, textAlign:'center' }}>⚠ {err}</div>}

          <button onClick={verify} style={{ width:'100%', padding:16, background:RED, color:'#fff', border:'none', borderRadius:4, fontSize:13, fontWeight:900, letterSpacing:2, cursor:'pointer', marginTop:24 }}>
            VERIFY →
          </button>
          <div style={{ textAlign:'center', marginTop:14 }}>
            <Timer secs={45} color="rgba(255,255,255,0.3)" />
          </div>
          <button onClick={() => { setStage('form'); setOtp(Array(6).fill('')) }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', fontSize:11, letterSpacing:1, cursor:'pointer', marginTop:10, textDecoration:'underline' }}>
            BACK
          </button>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// DESIGN 2 — "AURUM" · Oura Ring-inspired · Dark charcoal + gold
// ════════════════════════════════════════════════════════════════════
function Design2() {
  const [tab,   setTab]   = useState('mobile')
  const [cc,    setCc]    = useState(COUNTRIES[0])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [name,  setName]  = useState('')
  const [stage, setStage] = useState('form')
  const [otp,   setOtp]   = useState(Array(6).fill(''))
  const [err,   setErr]   = useState('')
  const [showCC,setShowCC]= useState(false)

  const GOLD  = '#c9a84c'
  const DARK  = '#141414'
  const CARD  = '#1e1e1e'

  function go() {
    if (name.trim().length < 2) return setErr('Please enter your full name')
    if (tab === 'mobile' && !validatePhone(phone, cc)) return setErr(`Invalid ${cc.name} number`)
    if (tab === 'email' && !validateEmail(email)) return setErr('Enter a valid email')
    setErr(''); setStage('otp')
  }
  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setStage('done')
  }

  const inp = { width:'100%', padding:'13px 14px', background:'#2a2a2a', border:'1px solid #333', borderRadius:10, color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }

  if (stage === 'done') return (
    <div style={{ height:660, background:DARK, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ position:'relative', marginBottom:24 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke={GOLD} strokeWidth="4" />
          <circle cx="40" cy="40" r="20" fill="none" stroke={GOLD} strokeWidth="2" strokeOpacity=".4" />
        </svg>
        <span style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:22 }}>✓</span>
      </div>
      <div style={{ fontSize:22, fontWeight:300, color:GOLD, letterSpacing:2, marginBottom:8 }}>WELCOME</div>
      <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:6 }}>{name}</div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.7 }}>Your health profile has been created.<br/>Begin your biological age assessment.</div>
      <button style={{ marginTop:28, padding:'14px 32px', background:'transparent', color:GOLD, border:`1.5px solid ${GOLD}`, borderRadius:28, fontSize:13, fontWeight:600, letterSpacing:1.5, cursor:'pointer' }}>
        EXPLORE →
      </button>
    </div>
  )

  return (
    <div style={{ height:660, background:DARK, overflowY:'auto', position:'relative' }}>
      {/* Gold ring decoration */}
      <svg style={{ position:'absolute', top:-30, right:-30, opacity:.15 }} width="220" height="220" viewBox="0 0 220 220">
        <circle cx="150" cy="80" r="100" fill="none" stroke={GOLD} strokeWidth="48" />
      </svg>

      <div style={{ padding:'28px 24px', position:'relative' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="11" fill="none" stroke={GOLD} strokeWidth="2.5" />
            <circle cx="14" cy="14" r="5" fill="none" stroke={GOLD} strokeWidth="1.5" strokeOpacity=".5" />
          </svg>
          <span style={{ fontSize:15, fontWeight:300, color:'#fff', letterSpacing:3, textTransform:'uppercase' }}>HealthOS</span>
        </div>

        {stage === 'form' && (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:28, fontWeight:300, color:'#fff', lineHeight:1.3, letterSpacing:-0.5 }}>
                Know<br/>
                <span style={{ fontWeight:700, color:GOLD }}>yourself.</span>
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:10, lineHeight:1.6 }}>
                50+ biomarkers. One biological age score.<br/>Personalised to you, every 90 days.
              </div>
            </div>

            {/* Tab */}
            <div style={{ display:'flex', gap:6, marginBottom:20, background:'#222', borderRadius:10, padding:3 }}>
              {['mobile','email'].map(t => (
                <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                  flex:1, padding:'9px 0', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
                  background: tab===t ? GOLD : 'none',
                  color: tab===t ? '#000' : 'rgba(255,255,255,0.35)',
                }}>
                  {t === 'mobile' ? '📱 Mobile' : '✉️ Email'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom:14 }}>
              <input style={inp} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            {tab === 'mobile' ? (
              <div style={{ position:'relative', marginBottom:14 }}>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setShowCC(!showCC)} style={{ padding:'12px 12px', background:'#2a2a2a', border:'1px solid #333', borderRadius:10, color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>
                    {cc.flag} {cc.dial} ▾
                  </button>
                  <input style={{ ...inp, flex:1 }} type="tel" placeholder={`${cc.min} digits`}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,cc.max))} />
                </div>
                {showCC && (
                  <div style={{ position:'absolute', top:'100%', left:0, zIndex:99, background:'#1e1e1e', border:'1px solid #333', borderRadius:12, width:210, maxHeight:200, overflowY:'auto', marginTop:4 }}>
                    {COUNTRIES.map(c => (
                      <div key={c.code} onClick={() => { setCc(c); setShowCC(false); setPhone('') }}
                        style={{ padding:'10px 14px', cursor:'pointer', fontSize:13, color:c.code===cc.code?GOLD:'#ccc', display:'flex', gap:8, alignItems:'center' }}>
                        {c.flag} {c.name} <span style={{ color:'#555', fontSize:11 }}>{c.dial}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom:14 }}>
                <input style={inp} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            )}

            {err && <div style={{ fontSize:12, color:'#f87171', marginBottom:10, fontWeight:600 }}>⚠ {err}</div>}

            <button onClick={go} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${GOLD},#e8c46e)`, color:'#000', border:'none', borderRadius:12, fontSize:14, fontWeight:800, cursor:'pointer', marginBottom:14 }}>
              Continue →
            </button>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', textAlign:'center', lineHeight:1.6 }}>
              🔒 End-to-end encrypted · DPDP Act 2023 · GDPR compliant
            </div>
          </>
        )}

        {stage === 'otp' && (
          <div style={{ paddingTop:16 }}>
            <div style={{ marginBottom:28, textAlign:'center' }}>
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ marginBottom:14 }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke={GOLD} strokeWidth="3" />
                <circle cx="28" cy="28" r="12" fill="none" stroke={GOLD} strokeWidth="1.5" strokeOpacity=".4" />
              </svg>
              <div style={{ fontSize:18, fontWeight:300, color:'#fff', letterSpacing:1 }}>VERIFICATION</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:6 }}>
                Code sent to {tab==='mobile' ? `${cc.dial} ${phone}` : email}
              </div>
              <div style={{ marginTop:10, display:'inline-block', background:`${GOLD}18`, border:`1px solid ${GOLD}44`, borderRadius:8, padding:'6px 14px', fontSize:11, color:GOLD, fontWeight:700 }}>
                Demo: 000000
              </div>
            </div>

            <OtpBoxes value={otp} onChange={setOtp}
              boxStyle={{ width:38, height:52, textAlign:'center', fontSize:20, fontWeight:700, background:'#2a2a2a', border:'1.5px solid #333', borderRadius:8, color:'#fff', outline:'none', boxSizing:'border-box' }}
              activeStyle={{ borderColor:GOLD, color:GOLD, background:`${GOLD}12` }}
            />

            {err && <div style={{ fontSize:12, color:'#f87171', marginTop:12, fontWeight:600, textAlign:'center' }}>⚠ {err}</div>}

            <button onClick={verify} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${GOLD},#e8c46e)`, color:'#000', border:'none', borderRadius:12, fontSize:14, fontWeight:800, cursor:'pointer', margin:'20px 0 12px' }}>
              Verify →
            </button>
            <div style={{ textAlign:'center' }}><Timer secs={50} color="rgba(255,255,255,0.25)" /></div>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// DESIGN 3 — "SIGNAL" · Levels Health-inspired · White + electric green
// ════════════════════════════════════════════════════════════════════
function Design3() {
  const [tab,   setTab]   = useState('mobile')
  const [cc,    setCc]    = useState(COUNTRIES[0])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [name,  setName]  = useState('')
  const [stage, setStage] = useState('form')
  const [otp,   setOtp]   = useState(Array(6).fill(''))
  const [err,   setErr]   = useState('')
  const [showCC,setShowCC]= useState(false)

  const GREEN = '#00c27c'
  const DARK  = '#0a0f0d'

  function go() {
    if (name.trim().length < 2) return setErr('Name required')
    if (tab === 'mobile' && !validatePhone(phone, cc)) return setErr(`Invalid ${cc.name} number — ${cc.min} digits required`)
    if (tab === 'email' && !validateEmail(email)) return setErr('Invalid email format')
    setErr(''); setStage('otp')
  }
  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setStage('done')
  }

  const inp = { width:'100%', padding:'13px 16px', background:'#f8fafb', border:'1.5px solid #e5e7eb', borderRadius:12, color:'#0a0f0d', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }

  if (stage === 'done') return (
    <div style={{ height:660, background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ width:80, height:80, background:GREEN, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:20, color:'#fff' }}>✓</div>
      <div style={{ fontSize:22, fontWeight:900, color:DARK, marginBottom:8 }}>You're metabolically aware.</div>
      <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>Account ready, {name.split(' ')[0]}. Time to run your first biomarker analysis.</div>
      <button style={{ marginTop:28, padding:'14px 28px', background:GREEN, color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:800, cursor:'pointer' }}>
        Start Analysis →
      </button>
    </div>
  )

  return (
    <div style={{ height:660, background:'#fff', overflowY:'auto' }}>
      {/* Green top bar */}
      <div style={{ height:4, background:`linear-gradient(90deg,${GREEN},#00e5a0)` }} />

      <div style={{ padding:'24px 22px' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, background:GREEN, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🧬</div>
            <span style={{ fontSize:16, fontWeight:800, color:DARK }}>HealthOS</span>
          </div>
          <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600 }}>Free account</div>
        </div>

        {stage === 'form' && (
          <>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:24, fontWeight:900, color:DARK, lineHeight:1.25, marginBottom:8 }}>
                What's your<br/>
                <span style={{ color:GREEN }}>biological age?</span>
              </div>
              <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.6 }}>
                Track 50+ biomarkers. See what's ageing you. Reverse it.
              </div>
            </div>

            {/* Data trust row */}
            <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
              {['🔬 Science-backed','🔒 DPDP compliant','📊 AI analysis'].map(tag => (
                <span key={tag} style={{ fontSize:10, fontWeight:700, padding:'4px 9px', background:`${GREEN}12`, color:GREEN, borderRadius:20, border:`1px solid ${GREEN}30` }}>{tag}</span>
              ))}
            </div>

            {/* Tab */}
            <div style={{ display:'flex', gap:6, marginBottom:18, background:'#f3f4f6', borderRadius:10, padding:3 }}>
              {['mobile','email'].map(t => (
                <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                  flex:1, padding:'9px 0', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer',
                  background: tab===t ? '#fff' : 'none',
                  color: tab===t ? DARK : '#9ca3af',
                  boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                  {t === 'mobile' ? '📱 Mobile' : '✉️ Email'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom:12 }}>
              <input style={inp} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            {tab === 'mobile' ? (
              <div style={{ position:'relative', marginBottom:12 }}>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setShowCC(!showCC)} style={{ padding:'12px 12px', background:'#f8fafb', border:'1.5px solid #e5e7eb', borderRadius:12, color:DARK, cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>
                    {cc.flag} {cc.dial} ▾
                  </button>
                  <input style={{ ...inp, flex:1 }} type="tel" placeholder={`${cc.min}-digit number`}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,cc.max))} />
                </div>
                {/* Validation */}
                {phone.length >= cc.min && (
                  <div style={{ fontSize:11, marginTop:4, color: validatePhone(phone,cc) ? GREEN : '#ef4444', fontWeight:600 }}>
                    {validatePhone(phone,cc) ? '✓ Valid number' : `✗ Must be ${cc.min} digits for ${cc.name}`}
                  </div>
                )}
                {showCC && (
                  <div style={{ position:'absolute', top:'100%', left:0, zIndex:99, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.1)', width:210, maxHeight:200, overflowY:'auto', marginTop:4 }}>
                    {COUNTRIES.map(c => (
                      <div key={c.code} onClick={() => { setCc(c); setShowCC(false); setPhone('') }}
                        style={{ padding:'10px 14px', cursor:'pointer', fontSize:13, color:c.code===cc.code?GREEN:DARK, display:'flex', gap:8, alignItems:'center', background:c.code===cc.code?`${GREEN}08`:'none' }}>
                        {c.flag} {c.name} <span style={{ color:'#9ca3af', fontSize:11 }}>{c.dial}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom:12 }}>
                <input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                {email && (
                  <div style={{ fontSize:11, marginTop:4, color: validateEmail(email) ? GREEN : '#ef4444', fontWeight:600 }}>
                    {validateEmail(email) ? '✓ Valid email' : '✗ Invalid format'}
                  </div>
                )}
              </div>
            )}

            {err && <div style={{ fontSize:12, color:'#ef4444', marginBottom:10, fontWeight:700 }}>⚠ {err}</div>}

            <button onClick={go} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${GREEN},#00a868)`, color:'#fff', border:'none', borderRadius:13, fontSize:15, fontWeight:800, cursor:'pointer', marginTop:4 }}>
              Get Started →
            </button>
            <div style={{ fontSize:10.5, color:'#9ca3af', textAlign:'center', marginTop:12 }}>
              No credit card · Cancel anytime · DPDP Act 2023 compliant
            </div>
          </>
        )}

        {stage === 'otp' && (
          <div style={{ paddingTop:8 }}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ width:56, height:56, background:`${GREEN}15`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 14px' }}>📊</div>
              <div style={{ fontSize:18, fontWeight:900, color:DARK }}>Confirm your account</div>
              <div style={{ fontSize:12, color:'#6b7280', marginTop:5 }}>6-digit code sent to {tab==='mobile'?`${cc.dial} ${phone}`:email}</div>
              <div style={{ marginTop:10, display:'inline-block', background:`${GREEN}12`, border:`1px solid ${GREEN}40`, borderRadius:8, padding:'6px 14px', fontSize:12, color:GREEN, fontWeight:700 }}>
                Demo code: 000000
              </div>
            </div>

            <OtpBoxes value={otp} onChange={setOtp}
              boxStyle={{ width:38, height:52, textAlign:'center', fontSize:20, fontWeight:800, background:'#f8fafb', border:'1.5px solid #e5e7eb', borderRadius:10, color:DARK, outline:'none', boxSizing:'border-box' }}
              activeStyle={{ borderColor:GREEN, background:`${GREEN}0a`, color:GREEN }}
            />

            {err && <div style={{ fontSize:12, color:'#ef4444', marginTop:10, fontWeight:600, textAlign:'center' }}>⚠ {err}</div>}

            <button onClick={verify} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${GREEN},#00a868)`, color:'#fff', border:'none', borderRadius:13, fontSize:15, fontWeight:800, cursor:'pointer', margin:'20px 0 12px' }}>
              Verify →
            </button>
            <div style={{ textAlign:'center' }}><Timer secs={60} color="#9ca3af" /></div>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// DESIGN 4 — "DEEP ICE" · Eight Sleep-inspired · Navy + electric cyan
// ════════════════════════════════════════════════════════════════════
function Design4() {
  const [tab,   setTab]   = useState('mobile')
  const [cc,    setCc]    = useState(COUNTRIES[0])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [name,  setName]  = useState('')
  const [stage, setStage] = useState('form')
  const [otp,   setOtp]   = useState(Array(6).fill(''))
  const [err,   setErr]   = useState('')
  const [showCC,setShowCC]= useState(false)
  const [focused,setFocused] = useState('')

  const CYAN = '#00d4f5'
  const NAVY = '#070e1f'

  function go() {
    if (name.trim().length < 2) return setErr('Full name required')
    if (tab === 'mobile' && !validatePhone(phone, cc)) return setErr(`Invalid ${cc.name} number`)
    if (tab === 'email' && !validateEmail(email)) return setErr('Invalid email address')
    setErr(''); setStage('otp')
  }
  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setStage('done')
  }

  const inp = (field) => ({
    width:'100%', padding:'13px 16px',
    background: focused===field ? 'rgba(0,212,245,0.05)' : 'rgba(255,255,255,0.04)',
    border: focused===field ? `1.5px solid ${CYAN}` : '1.5px solid rgba(255,255,255,0.1)',
    borderRadius:12, color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none',
    boxSizing:'border-box', transition:'all .2s',
  })

  if (stage === 'done') return (
    <div style={{ height:660, background:NAVY, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ position:'relative', marginBottom:20 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', border:`3px solid ${CYAN}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>✓</div>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', boxShadow:`0 0 40px ${CYAN}44` }} />
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Welcome aboard.</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>{name.split(' ')[0]}, your health intelligence<br/>dashboard is ready.</div>
      <button style={{ marginTop:28, padding:'14px 28px', background:CYAN, color:NAVY, border:'none', borderRadius:12, fontSize:14, fontWeight:900, cursor:'pointer' }}>
        Open Dashboard →
      </button>
    </div>
  )

  return (
    <div style={{ height:660, background:NAVY, overflowY:'auto', position:'relative' }}>
      {/* Animated gradient orbs */}
      <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, background:`radial-gradient(circle,${CYAN}18,transparent 70%)`, borderRadius:'50%' }} />
      <div style={{ position:'absolute', bottom:80, left:-60, width:200, height:200, background:'radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)', borderRadius:'50%' }} />

      <div style={{ padding:'28px 22px', position:'relative' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
          <div style={{ width:32, height:32, borderRadius:8, border:`1.5px solid ${CYAN}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, background:`${CYAN}12` }}>🧬</div>
          <div>
            <span style={{ fontSize:15, fontWeight:800, color:'#fff', letterSpacing:0.5 }}>HealthOS</span>
            <div style={{ fontSize:9, color:CYAN, fontWeight:700, letterSpacing:2 }}>INTELLIGENCE</div>
          </div>
        </div>

        {stage === 'form' && (
          <>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:26, fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:10, letterSpacing:-0.5 }}>
                Your health,<br/>
                intelligently<br/>
                <span style={{ color:CYAN }}>monitored.</span>
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>
                Biological age tracking powered by clinical biomarkers and AI.
              </div>
            </div>

            {/* Tab */}
            <div style={{ display:'flex', gap:6, marginBottom:18, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:3, border:'1px solid rgba(255,255,255,0.06)' }}>
              {['mobile','email'].map(t => (
                <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                  flex:1, padding:'9px 0', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer',
                  background: tab===t ? `${CYAN}20` : 'none',
                  color: tab===t ? CYAN : 'rgba(255,255,255,0.3)',
                  outline: tab===t ? `1px solid ${CYAN}44` : 'none',
                }}>
                  {t === 'mobile' ? '📱 Mobile' : '✉️ Email'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom:12 }}>
              <input style={inp('name')} placeholder="Full name"
                value={name} onChange={e => setName(e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')} />
            </div>

            {tab === 'mobile' ? (
              <div style={{ position:'relative', marginBottom:12 }}>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setShowCC(!showCC)} style={{
                    padding:'12px 12px', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)',
                    borderRadius:12, color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap',
                  }}>
                    {cc.flag} {cc.dial} ▾
                  </button>
                  <input style={{ ...inp('phone'), flex:1 }} type="tel" placeholder={`${cc.min} digits`}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,cc.max))}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused('')} />
                </div>
                {showCC && (
                  <div style={{ position:'absolute', top:'100%', left:0, zIndex:99, background:'#111827', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, width:210, maxHeight:200, overflowY:'auto', marginTop:4 }}>
                    {COUNTRIES.map(c => (
                      <div key={c.code} onClick={() => { setCc(c); setShowCC(false); setPhone('') }}
                        style={{ padding:'10px 14px', cursor:'pointer', fontSize:13, color:c.code===cc.code?CYAN:'#94a3b8', display:'flex', gap:8, alignItems:'center' }}>
                        {c.flag} {c.name} <span style={{ color:'#4b5563', fontSize:11 }}>{c.dial}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom:12 }}>
                <input style={{ ...inp('email'), width:'100%' }} type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
              </div>
            )}

            {err && <div style={{ fontSize:12, color:'#f87171', marginBottom:10, fontWeight:600 }}>⚠ {err}</div>}

            <button onClick={go} style={{
              width:'100%', padding:15, background:`linear-gradient(90deg,${CYAN},#0080ff)`,
              color:NAVY, border:'none', borderRadius:13, fontSize:15, fontWeight:900, cursor:'pointer', marginTop:4,
              boxShadow:`0 4px 24px ${CYAN}44`,
            }}>
              Create Account →
            </button>

            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:14, lineHeight:1.7 }}>
              🔐 256-bit AES encrypted · DPDP Act 2023 · Zero data selling
            </div>
          </>
        )}

        {stage === 'otp' && (
          <div style={{ paddingTop:12 }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ position:'relative', display:'inline-block', marginBottom:14 }}>
                <div style={{ width:60, height:60, borderRadius:'50%', border:`2px solid ${CYAN}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>📲</div>
                <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:`1px solid ${CYAN}30` }} />
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:5 }}>Identity verification</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                Secure code sent to<br/><span style={{ color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{tab==='mobile'?`${cc.dial} ${phone}`:email}</span>
              </div>
              <div style={{ marginTop:12, display:'inline-block', background:`${CYAN}12`, border:`1px solid ${CYAN}30`, borderRadius:8, padding:'7px 14px', fontSize:12, color:CYAN, fontWeight:700 }}>
                Demo: 000000
              </div>
            </div>

            <OtpBoxes value={otp} onChange={setOtp}
              boxStyle={{ width:38, height:54, textAlign:'center', fontSize:22, fontWeight:800, background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', outline:'none', boxSizing:'border-box' }}
              activeStyle={{ borderColor:CYAN, color:CYAN, background:`${CYAN}10`, boxShadow:`0 0 12px ${CYAN}30` }}
            />

            {err && <div style={{ fontSize:12, color:'#f87171', marginTop:12, fontWeight:600, textAlign:'center' }}>⚠ {err}</div>}

            <button onClick={verify} style={{
              width:'100%', padding:15, background:`linear-gradient(90deg,${CYAN},#0080ff)`,
              color:NAVY, border:'none', borderRadius:13, fontSize:15, fontWeight:900, cursor:'pointer', margin:'22px 0 12px',
              boxShadow:`0 4px 24px ${CYAN}44`,
            }}>
              Verify →
            </button>
            <div style={{ textAlign:'center' }}><Timer secs={50} color="rgba(255,255,255,0.25)" /></div>
            <button onClick={() => { setStage('form'); setOtp(Array(6).fill('')) }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.2)', fontSize:11, cursor:'pointer', display:'block', margin:'10px auto 0', textDecoration:'underline' }}>
              ← Change details
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Phone frame ───────────────────────────────────────────────────────────────
function Frame({ label, sub, badge, bColor, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, flexShrink:0 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:4 }}>
          <span style={{ fontSize:16, fontWeight:900, color:'#0f172a' }}>{label}</span>
          <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${bColor}18`, color:bColor, border:`1px solid ${bColor}33` }}>{badge}</span>
        </div>
        <div style={{ fontSize:12, color:'#94a3b8' }}>{sub}</div>
      </div>
      <div style={{
        width:360, height:660,
        border:'10px solid #0f172a', borderRadius:40,
        overflow:'hidden',
        boxShadow:'0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.05)',
        position:'relative', flexShrink:0,
      }}>
        {/* Notch */}
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:90, height:20, background:'#0f172a', borderRadius:'0 0 12px 12px', zIndex:99 }} />
        <div style={{ height:'100%', overflowY:'auto', paddingTop:8 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Main preview page ─────────────────────────────────────────────────────────
export default function SignupDesignsPreview2() {
  const nav = useNavigate()

  const DESIGNS = [
    { label:'Design 1',  badge:'ZERO',      bColor:'#e63946', sub:'Whoop-inspired · Athletic black + red',     comp:<Design1 /> },
    { label:'Design 2',  badge:'AURUM',      bColor:'#c9a84c', sub:'Oura Ring-inspired · Dark charcoal + gold', comp:<Design2 /> },
    { label:'Design 3',  badge:'SIGNAL',     bColor:'#00c27c', sub:'Levels Health-inspired · Clean white + green', comp:<Design3 /> },
    { label:'Design 4',  badge:'DEEP ICE',   bColor:'#00d4f5', sub:'Eight Sleep-inspired · Navy + electric cyan', comp:<Design4 /> },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      {/* Top bar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'16px 28px', display:'flex', alignItems:'center', gap:20 }}>
        <button onClick={() => nav('/signup-preview')} style={{ background:'none', border:'none', color:'#64748b', fontSize:13, cursor:'pointer', fontWeight:600, padding:0 }}>← V1 Designs</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:900, color:'#0f172a' }}>Signup Designs V2 — Premium Edition</div>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>Inspired by Whoop · Oura Ring · Levels Health · Eight Sleep</div>
        </div>
        <button onClick={() => nav('/')} style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 14px', color:'#64748b', fontSize:13, cursor:'pointer', fontWeight:600 }}>Back to App</button>
      </div>

      {/* Feature chips */}
      <div style={{ padding:'16px 28px', display:'flex', flexWrap:'wrap', gap:8, borderBottom:'1px solid #f1f5f9' }}>
        {['✓ Country code selector (12 countries)','✓ Real-time phone validation per country','✓ Email format validation','✓ In-frame OTP · no SMS required','✓ Auto-advance OTP boxes','✓ Resend countdown','✓ Complete signup flow','✓ Use demo OTP: 000000'].map(f => (
          <span key={f} style={{ fontSize:11.5, fontWeight:600, padding:'5px 12px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, color:'#334155' }}>{f}</span>
        ))}
      </div>

      {/* Frames */}
      <div style={{ display:'flex', gap:36, overflowX:'auto', padding:'32px 28px 40px', alignItems:'flex-start', scrollSnapType:'x mandatory' }}>
        {DESIGNS.map(d => (
          <div key={d.label} style={{ scrollSnapAlign:'start', display:'flex', flexDirection:'column', gap:0 }}>
            <Frame label={d.label} badge={d.badge} bColor={d.bColor} sub={d.sub}>
              {d.comp}
            </Frame>
          </div>
        ))}
      </div>

      <div style={{ textAlign:'center', padding:'0 24px 32px', fontSize:14, color:'#64748b' }}>
        Like a specific design? Tell us which one (1/2/3/4) or mix-and-match elements — we'll integrate it fully.
      </div>
    </div>
  )
}
