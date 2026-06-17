import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── App colour themes (exact tokens from global.css) ──────────────────────────
const APP_THEMES = [
  {
    id: 'teal',  label: 'Clinical Teal',    dot: '#14b8a6',
    accent: '#14b8a6', dark: '#0d9488',
    light: '#cfeee8',  tint: '#e6f7f5',
    heroFrom: '#0f3a3a', heroTo: '#0a2424', heroLabel: '#9fd9cf',
  },
  {
    id: 'gold',  label: 'Performance Gold', dot: '#e0b341',
    accent: '#e0b341', dark: '#a9791f',
    light: '#f5e7c0',  tint: '#fdf6e3',
    heroFrom: '#3a2f0f', heroTo: '#241c08', heroLabel: '#f0dca0',
  },
  {
    id: 'amber', label: 'Calm Wellness',    dot: '#e08c3b',
    accent: '#e08c3b', dark: '#c2691a',
    light: '#f7ddbf',  tint: '#fdf0e3',
    heroFrom: '#3a230f', heroTo: '#241608', heroLabel: '#f5cda3',
  },
]

// ── Shared validation ─────────────────────────────────────────────────────────
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
const validatePhone = (p, c) => c.pattern.test(p.replace(/\D/g,''))

// ── Shared OTP boxes ──────────────────────────────────────────────────────────
function OtpBoxes({ value, onChange, boxStyle, activeStyle }) {
  const refs = useRef([])
  const arr  = value.length === 6 ? value : Array(6).fill('')
  function onInput(i, e) {
    const v = e.target.value.replace(/\D/g,'').slice(-1)
    const next = [...arr]; next[i] = v; onChange(next)
    if (v && i < 5) refs.current[i+1]?.focus()
    if (!v && e.nativeEvent.inputType === 'deleteContentBackward' && i > 0) refs.current[i-1]?.focus()
  }
  function onPaste(e) {
    const t = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (t.length===6) onChange(t.split(''))
    e.preventDefault()
  }
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
      {arr.map((v,i) => (
        <input key={i} ref={el => refs.current[i]=el}
          type="text" inputMode="numeric" maxLength={1} value={v}
          onChange={e => onInput(i,e)} onPaste={onPaste}
          style={{ ...boxStyle, ...(v ? activeStyle : {}) }}
        />
      ))}
    </div>
  )
}

function Timer({ secs, color }) {
  const [s, setS] = useState(secs)
  useEffect(() => {
    if (s<=0) return
    const t = setTimeout(() => setS(s-1), 1000)
    return () => clearTimeout(t)
  }, [s])
  return s > 0
    ? <span style={{ color, fontSize:12 }}>Resend in <b>{Math.floor(s/60)}:{String(s%60).padStart(2,'0')}</b></span>
    : <button onClick={() => setS(secs)} style={{ background:'none', border:'none', color, cursor:'pointer', fontWeight:700, fontSize:12, textDecoration:'underline' }}>Resend code</button>
}

// ── Country dropdown shared ───────────────────────────────────────────────────
function CcDropdown({ cc, onSelect, open, onToggle, accentColor, dark }) {
  return (
    <div style={{ position:'relative' }}>
      <button onClick={onToggle} style={{
        padding:'12px 12px', background: dark ? 'rgba(255,255,255,0.06)' : '#f8fafb',
        border: dark ? '1.5px solid rgba(255,255,255,0.12)' : '1.5px solid #e2e8f0',
        borderRadius:12, color: dark ? '#fff' : '#0f172a', cursor:'pointer',
        fontSize:13, fontWeight:700, whiteSpace:'nowrap',
      }}>
        {cc.flag} {cc.dial} ▾
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'100%', left:0, zIndex:99,
          background: dark ? '#1a1a2e' : '#fff',
          border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
          borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
          width:215, maxHeight:210, overflowY:'auto', marginTop:4,
        }}>
          {COUNTRIES.map(c => (
            <div key={c.code} onClick={() => onSelect(c)}
              style={{
                padding:'10px 14px', cursor:'pointer', fontSize:13,
                color: c.code===cc.code ? accentColor : dark ? '#d1d5db' : '#334155',
                background: c.code===cc.code ? `${accentColor}12` : 'none',
                display:'flex', gap:8, alignItems:'center', fontWeight: c.code===cc.code ? 700 : 400,
              }}>
              {c.flag} {c.name} <span style={{ fontSize:11, opacity:.5, marginLeft:'auto' }}>{c.dial}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// DESIGN 1 — ZERO · Whoop-inspired · Black + theme accent
// ════════════════════════════════════════════════════════════════════
function Design1({ theme }) {
  const A = theme.accent
  const [tab,  setTab]  = useState('mobile')
  const [cc,   setCc]   = useState(COUNTRIES[0])
  const [ph,   setPh]   = useState('')
  const [em,   setEm]   = useState('')
  const [nm,   setNm]   = useState('')
  const [st,   setSt]   = useState('form')
  const [otp,  setOtp]  = useState(Array(6).fill(''))
  const [err,  setErr]  = useState('')
  const [showCC, setShowCC] = useState(false)

  const line = { width:'100%', background:'none', border:'none', borderBottom:'1.5px solid rgba(255,255,255,0.15)', color:'#fff', fontSize:16, padding:'13px 0', outline:'none', fontFamily:'inherit', caretColor:A }

  function go() {
    if (nm.trim().length < 2) return setErr('Enter your full name')
    if (tab==='mobile' && !validatePhone(ph,cc)) return setErr(`Invalid ${cc.name} number`)
    if (tab==='email'  && !validateEmail(em))    return setErr('Enter a valid email')
    setErr(''); setSt('otp')
  }
  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setSt('done')
  }

  if (st==='done') return (
    <div style={{ height:660, background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ width:70, height:70, borderRadius:'50%', background:A, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, marginBottom:20, color:'#000' }}>✓</div>
      <div style={{ fontSize:26, fontWeight:900, color:'#fff', letterSpacing:-0.5, marginBottom:8 }}>YOU'RE IN.</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>Welcome, {nm.split(' ')[0].toUpperCase()}.<br/>Your biological age journey starts now.</div>
      <button style={{ marginTop:32, padding:'16px 32px', background:A, color:'#000', border:'none', borderRadius:4, fontSize:13, fontWeight:900, letterSpacing:1.5, cursor:'pointer' }}>BEGIN →</button>
    </div>
  )

  return (
    <div style={{ height:660, background:'#000', display:'flex', flexDirection:'column', padding:'32px 26px', overflowY:'auto', position:'relative' }}>
      <svg style={{ position:'absolute', top:0, right:0, opacity:.08 }} width="200" height="200" viewBox="0 0 200 200">
        <circle cx="160" cy="40" r="120" fill="none" stroke={A} strokeWidth="40"/>
      </svg>

      <div style={{ marginBottom:44, position:'relative' }}>
        <div style={{ fontSize:11, fontWeight:900, letterSpacing:4, color:'rgba(255,255,255,0.3)' }}>HEALTHOS</div>
        <div style={{ width:24, height:2, background:A, marginTop:6 }}/>
      </div>

      {st==='form' && <>
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:30, fontWeight:900, color:'#fff', lineHeight:1.15, letterSpacing:-1 }}>
            KNOW YOUR<br/><span style={{ color:A }}>BIOLOGICAL</span><br/>AGE.
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:12, letterSpacing:1 }}>SCIENCE-BACKED · AI-POWERED · PERSONALISED</div>
        </div>

        <div style={{ display:'flex', marginBottom:26, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          {['mobile','email'].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
              flex:1, background:'none', border:'none', padding:'10px 0',
              fontSize:11, fontWeight:900, letterSpacing:2, cursor:'pointer',
              color: tab===t ? '#fff' : 'rgba(255,255,255,0.25)',
              borderBottom: tab===t ? `2px solid ${A}` : '2px solid transparent', marginBottom:-1,
            }}>
              {t==='mobile' ? '📱 MOBILE' : '✉️ EMAIL'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:9, letterSpacing:2, color:'rgba(255,255,255,0.3)', marginBottom:6 }}>FULL NAME</div>
          <input style={line} placeholder="Your name" value={nm} onChange={e => setNm(e.target.value)}/>
        </div>

        {tab==='mobile' ? (
          <div style={{ marginBottom:22, position:'relative' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'rgba(255,255,255,0.3)', marginBottom:6 }}>MOBILE NUMBER</div>
            <div style={{ display:'flex', gap:12, alignItems:'flex-end' }}>
              <button onClick={() => setShowCC(!showCC)} style={{ background:'none', border:'none', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', padding:0, paddingBottom:13, borderBottom:'1.5px solid rgba(255,255,255,0.15)' }}>
                {cc.flag} {cc.dial} ▾
              </button>
              <input style={{ ...line, flex:1 }} type="tel" placeholder={`${cc.min}-digit number`} value={ph} onChange={e => setPh(e.target.value.replace(/\D/g,'').slice(0,cc.max))}/>
            </div>
            {showCC && (
              <div style={{ position:'absolute', top:'100%', left:0, zIndex:99, background:'#111', border:'1px solid #222', borderRadius:8, width:210, maxHeight:200, overflowY:'auto', marginTop:4 }}>
                {COUNTRIES.map(c => (
                  <div key={c.code} onClick={() => { setCc(c); setShowCC(false); setPh('') }}
                    style={{ padding:'10px 14px', cursor:'pointer', fontSize:13, color:c.code===cc.code?A:'#ccc', display:'flex', gap:8, alignItems:'center' }}>
                    {c.flag} {c.name} <span style={{ color:'#555', fontSize:11 }}>{c.dial}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'rgba(255,255,255,0.3)', marginBottom:6 }}>EMAIL ADDRESS</div>
            <input style={line} type="email" placeholder="you@example.com" value={em} onChange={e => setEm(e.target.value)}/>
          </div>
        )}

        {err && <div style={{ fontSize:12, color:A, marginBottom:10, fontWeight:700 }}>⚠ {err}</div>}
        <button onClick={go} style={{ width:'100%', padding:16, background:A, color:'#000', border:'none', borderRadius:4, fontSize:13, fontWeight:900, letterSpacing:2, cursor:'pointer', marginTop:6 }}>
          GET STARTED →
        </button>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.18)', textAlign:'center', marginTop:14, letterSpacing:0.5 }}>
          256-BIT ENCRYPTED · DPDP COMPLIANT · ZERO DATA SELLING
        </div>
      </>}

      {st==='otp' && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:11, letterSpacing:3, color:A, marginBottom:8 }}>STEP 2 OF 2</div>
            <div style={{ fontSize:26, fontWeight:900, color:'#fff', lineHeight:1.2, letterSpacing:-0.5 }}>ENTER<br/>YOUR CODE.</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:8 }}>Sent to {tab==='mobile'?`${cc.dial} ${ph}`:em}</div>
            <div style={{ marginTop:10, display:'inline-block', background:`${A}18`, border:`1px solid ${A}44`, borderRadius:6, padding:'6px 12px', fontSize:11, color:A, fontWeight:700 }}>Demo: 000000</div>
          </div>

          <OtpBoxes value={otp} onChange={setOtp}
            boxStyle={{ width:38, height:52, textAlign:'center', fontSize:22, fontWeight:900, background:'#111', border:'2px solid #333', borderRadius:4, color:'#fff', outline:'none', boxSizing:'border-box', fontFamily:'monospace' }}
            activeStyle={{ borderColor:A, background:`${A}12`, color:A }}
          />
          {err && <div style={{ fontSize:12, color:A, marginTop:12, fontWeight:700, textAlign:'center' }}>⚠ {err}</div>}
          <button onClick={verify} style={{ width:'100%', padding:16, background:A, color:'#000', border:'none', borderRadius:4, fontSize:13, fontWeight:900, letterSpacing:2, cursor:'pointer', marginTop:24 }}>VERIFY →</button>
          <div style={{ textAlign:'center', marginTop:14 }}><Timer secs={45} color="rgba(255,255,255,0.28)"/></div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// DESIGN 2 — AURUM · Oura-inspired · Dark charcoal + theme accent
// ════════════════════════════════════════════════════════════════════
function Design2({ theme }) {
  const A = theme.accent
  const [tab,   setTab]   = useState('mobile')
  const [cc,    setCc]    = useState(COUNTRIES[0])
  const [ph,    setPh]    = useState('')
  const [em,    setEm]    = useState('')
  const [nm,    setNm]    = useState('')
  const [st,    setSt]    = useState('form')
  const [otp,   setOtp]   = useState(Array(6).fill(''))
  const [err,   setErr]   = useState('')
  const [showCC,setShowCC]= useState(false)

  const DARK = '#141414'
  const inp = { width:'100%', padding:'13px 14px', background:'#2a2a2a', border:'1px solid #333', borderRadius:10, color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }

  function go() {
    if (nm.trim().length < 2) return setErr('Full name required')
    if (tab==='mobile' && !validatePhone(ph,cc)) return setErr(`Invalid ${cc.name} number`)
    if (tab==='email'  && !validateEmail(em))    return setErr('Invalid email')
    setErr(''); setSt('otp')
  }
  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setSt('done')
  }

  if (st==='done') return (
    <div style={{ height:660, background:DARK, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ position:'relative', marginBottom:24 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke={A} strokeWidth="4"/>
          <circle cx="40" cy="40" r="20" fill="none" stroke={A} strokeWidth="2" strokeOpacity=".35"/>
        </svg>
        <span style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:22 }}>✓</span>
      </div>
      <div style={{ fontSize:22, fontWeight:300, color:A, letterSpacing:2, marginBottom:8 }}>WELCOME</div>
      <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:6 }}>{nm}</div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', lineHeight:1.7 }}>Your health profile is active.<br/>Begin your biological age assessment.</div>
      <button style={{ marginTop:28, padding:'13px 30px', background:'transparent', color:A, border:`1.5px solid ${A}`, borderRadius:28, fontSize:13, fontWeight:600, letterSpacing:1.5, cursor:'pointer' }}>EXPLORE →</button>
    </div>
  )

  return (
    <div style={{ height:660, background:DARK, overflowY:'auto', position:'relative' }}>
      <svg style={{ position:'absolute', top:-30, right:-30, opacity:.14 }} width="220" height="220" viewBox="0 0 220 220">
        <circle cx="150" cy="80" r="100" fill="none" stroke={A} strokeWidth="48"/>
      </svg>

      <div style={{ padding:'28px 24px', position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="11" fill="none" stroke={A} strokeWidth="2.5"/>
            <circle cx="14" cy="14" r="5" fill="none" stroke={A} strokeWidth="1.5" strokeOpacity=".4"/>
          </svg>
          <span style={{ fontSize:15, fontWeight:300, color:'#fff', letterSpacing:3 }}>AROGYOS</span>
        </div>

        {st==='form' && <>
          <div style={{ marginBottom:26 }}>
            <div style={{ fontSize:28, fontWeight:300, color:'#fff', lineHeight:1.3 }}>
              Know<br/><span style={{ fontWeight:700, color:A }}>yourself.</span>
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:10, lineHeight:1.6 }}>50+ biomarkers. One biological age score.<br/>Personalised to you, every 90 days.</div>
          </div>

          <div style={{ display:'flex', gap:6, marginBottom:18, background:'#222', borderRadius:10, padding:3 }}>
            {['mobile','email'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                flex:1, padding:'9px 0', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
                background: tab===t ? A : 'none', color: tab===t ? '#000' : 'rgba(255,255,255,0.3)',
              }}>
                {t==='mobile' ? '📱 Mobile' : '✉️ Email'}
              </button>
            ))}
          </div>

          <div style={{ marginBottom:12 }}>
            <input style={inp} placeholder="Full name" value={nm} onChange={e => setNm(e.target.value)}/>
          </div>

          {tab==='mobile' ? (
            <div style={{ position:'relative', marginBottom:12 }}>
              <div style={{ display:'flex', gap:8 }}>
                <CcDropdown cc={cc} onSelect={c => { setCc(c); setShowCC(false); setPh('') }} open={showCC} onToggle={() => setShowCC(!showCC)} accentColor={A} dark={true}/>
                <input style={{ ...inp, flex:1 }} type="tel" placeholder={`${cc.min} digits`} value={ph} onChange={e => setPh(e.target.value.replace(/\D/g,'').slice(0,cc.max))}/>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom:12 }}>
              <input style={inp} type="email" placeholder="you@email.com" value={em} onChange={e => setEm(e.target.value)}/>
            </div>
          )}

          {err && <div style={{ fontSize:12, color:'#f87171', marginBottom:10, fontWeight:600 }}>⚠ {err}</div>}
          <button onClick={go} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${A},${theme.dark})`, color:'#000', border:'none', borderRadius:12, fontSize:14, fontWeight:800, cursor:'pointer', marginBottom:12 }}>
            Continue →
          </button>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.18)', textAlign:'center', lineHeight:1.6 }}>🔒 End-to-end encrypted · DPDP Act 2023</div>
        </>}

        {st==='otp' && (
          <div style={{ paddingTop:12 }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ marginBottom:14 }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke={A} strokeWidth="3"/>
                <circle cx="28" cy="28" r="12" fill="none" stroke={A} strokeWidth="1.5" strokeOpacity=".35"/>
              </svg>
              <div style={{ fontSize:18, fontWeight:300, color:'#fff', letterSpacing:1 }}>VERIFICATION</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:6 }}>Sent to {tab==='mobile'?`${cc.dial} ${ph}`:em}</div>
              <div style={{ marginTop:10, display:'inline-block', background:`${A}18`, border:`1px solid ${A}44`, borderRadius:8, padding:'6px 14px', fontSize:11, color:A, fontWeight:700 }}>Demo: 000000</div>
            </div>
            <OtpBoxes value={otp} onChange={setOtp}
              boxStyle={{ width:38, height:52, textAlign:'center', fontSize:20, fontWeight:700, background:'#2a2a2a', border:'1.5px solid #333', borderRadius:8, color:'#fff', outline:'none', boxSizing:'border-box' }}
              activeStyle={{ borderColor:A, color:A, background:`${A}12` }}
            />
            {err && <div style={{ fontSize:12, color:'#f87171', marginTop:12, fontWeight:600, textAlign:'center' }}>⚠ {err}</div>}
            <button onClick={verify} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${A},${theme.dark})`, color:'#000', border:'none', borderRadius:12, fontSize:14, fontWeight:800, cursor:'pointer', margin:'20px 0 12px' }}>Verify →</button>
            <div style={{ textAlign:'center' }}><Timer secs={50} color="rgba(255,255,255,0.25)"/></div>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// DESIGN 3 — SIGNAL · Levels-inspired · White + theme accent
// ════════════════════════════════════════════════════════════════════
function Design3({ theme }) {
  const A = theme.accent
  const [tab,   setTab]   = useState('mobile')
  const [cc,    setCc]    = useState(COUNTRIES[0])
  const [ph,    setPh]    = useState('')
  const [em,    setEm]    = useState('')
  const [nm,    setNm]    = useState('')
  const [st,    setSt]    = useState('form')
  const [otp,   setOtp]   = useState(Array(6).fill(''))
  const [err,   setErr]   = useState('')
  const [showCC,setShowCC]= useState(false)

  const DARK = '#0a0f0d'
  const inp = { width:'100%', padding:'13px 16px', background:'#f8fafb', border:'1.5px solid #e5e7eb', borderRadius:12, color:DARK, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }

  function go() {
    if (nm.trim().length < 2) return setErr('Name required')
    if (tab==='mobile' && !validatePhone(ph,cc)) return setErr(`Invalid ${cc.name} number`)
    if (tab==='email'  && !validateEmail(em))    return setErr('Invalid email format')
    setErr(''); setSt('otp')
  }
  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setSt('done')
  }

  if (st==='done') return (
    <div style={{ height:660, background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ width:80, height:80, background:A, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:20, color:'#fff' }}>✓</div>
      <div style={{ fontSize:22, fontWeight:900, color:DARK, marginBottom:8 }}>You're in, {nm.split(' ')[0]}!</div>
      <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>Your health account is ready. Let's run your first biomarker analysis.</div>
      <button style={{ marginTop:28, padding:'14px 28px', background:A, color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:800, cursor:'pointer' }}>Start Analysis →</button>
    </div>
  )

  return (
    <div style={{ height:660, background:'#fff', overflowY:'auto' }}>
      <div style={{ height:4, background:`linear-gradient(90deg,${A},${theme.dark})` }}/>

      <div style={{ padding:'22px 22px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:26 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, background:A, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🧬</div>
            <span style={{ fontSize:16, fontWeight:800, color:DARK }}>AROGYOS</span>
          </div>
          <div style={{ fontSize:11, color:'#9ca3af', fontWeight:600 }}>Free account</div>
        </div>

        {st==='form' && <>
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:24, fontWeight:900, color:DARK, lineHeight:1.25, marginBottom:8 }}>
              What's your<br/><span style={{ color:A }}>biological age?</span>
            </div>
            <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.6 }}>Track 50+ biomarkers. See what's ageing you. Reverse it.</div>
          </div>

          <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
            {['🔬 Science-backed','🔒 DPDP compliant','📊 AI analysis'].map(tag => (
              <span key={tag} style={{ fontSize:10, fontWeight:700, padding:'4px 9px', background:`${A}12`, color:A, borderRadius:20, border:`1px solid ${A}30` }}>{tag}</span>
            ))}
          </div>

          <div style={{ display:'flex', gap:6, marginBottom:18, background:'#f3f4f6', borderRadius:10, padding:3 }}>
            {['mobile','email'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                flex:1, padding:'9px 0', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer',
                background: tab===t ? '#fff' : 'none',
                color: tab===t ? DARK : '#9ca3af',
                boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
                {t==='mobile' ? '📱 Mobile' : '✉️ Email'}
              </button>
            ))}
          </div>

          <div style={{ marginBottom:12 }}>
            <input style={inp} placeholder="Full name" value={nm} onChange={e => setNm(e.target.value)}/>
          </div>

          {tab==='mobile' ? (
            <div style={{ position:'relative', marginBottom:8 }}>
              <div style={{ display:'flex', gap:8 }}>
                <CcDropdown cc={cc} onSelect={c => { setCc(c); setShowCC(false); setPh('') }} open={showCC} onToggle={() => setShowCC(!showCC)} accentColor={A} dark={false}/>
                <input style={{ ...inp, flex:1 }} type="tel" placeholder={`${cc.min}-digit number`} value={ph} onChange={e => setPh(e.target.value.replace(/\D/g,'').slice(0,cc.max))}/>
              </div>
              {ph.length >= cc.min && <div style={{ fontSize:11, marginTop:4, color: validatePhone(ph,cc) ? A : '#ef4444', fontWeight:600 }}>{validatePhone(ph,cc)?'✓ Valid number':`✗ Must be ${cc.min} digits`}</div>}
            </div>
          ) : (
            <div style={{ marginBottom:8 }}>
              <input style={inp} type="email" placeholder="you@example.com" value={em} onChange={e => setEm(e.target.value)}/>
              {em && <div style={{ fontSize:11, marginTop:4, color: validateEmail(em) ? A : '#ef4444', fontWeight:600 }}>{validateEmail(em)?'✓ Valid email':'✗ Invalid format'}</div>}
            </div>
          )}

          {err && <div style={{ fontSize:12, color:'#ef4444', marginBottom:10, fontWeight:700 }}>⚠ {err}</div>}
          <button onClick={go} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${A},${theme.dark})`, color:'#fff', border:'none', borderRadius:13, fontSize:15, fontWeight:800, cursor:'pointer', marginTop:8 }}>
            Get Started →
          </button>
          <div style={{ fontSize:10.5, color:'#9ca3af', textAlign:'center', marginTop:12 }}>No credit card · DPDP Act 2023 compliant</div>
        </>}

        {st==='otp' && (
          <div style={{ paddingTop:8 }}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ width:56, height:56, background:`${A}15`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 14px' }}>📊</div>
              <div style={{ fontSize:18, fontWeight:900, color:DARK }}>Confirm your account</div>
              <div style={{ fontSize:12, color:'#6b7280', marginTop:5 }}>Code sent to {tab==='mobile'?`${cc.dial} ${ph}`:em}</div>
              <div style={{ marginTop:10, display:'inline-block', background:`${A}12`, border:`1px solid ${A}40`, borderRadius:8, padding:'6px 14px', fontSize:12, color:A, fontWeight:700 }}>Demo: 000000</div>
            </div>
            <OtpBoxes value={otp} onChange={setOtp}
              boxStyle={{ width:38, height:52, textAlign:'center', fontSize:20, fontWeight:800, background:'#f8fafb', border:'1.5px solid #e5e7eb', borderRadius:10, color:DARK, outline:'none', boxSizing:'border-box' }}
              activeStyle={{ borderColor:A, background:`${A}0a`, color:A }}
            />
            {err && <div style={{ fontSize:12, color:'#ef4444', marginTop:10, fontWeight:600, textAlign:'center' }}>⚠ {err}</div>}
            <button onClick={verify} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${A},${theme.dark})`, color:'#fff', border:'none', borderRadius:13, fontSize:15, fontWeight:800, cursor:'pointer', margin:'20px 0 12px' }}>Verify →</button>
            <div style={{ textAlign:'center' }}><Timer secs={60} color="#9ca3af"/></div>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// DESIGN 4 — DEEP ICE · Eight Sleep-inspired · Dark hero + theme accent
// ════════════════════════════════════════════════════════════════════
function Design4({ theme }) {
  const A = theme.accent
  const [tab,    setTab]    = useState('mobile')
  const [cc,     setCc]     = useState(COUNTRIES[0])
  const [ph,     setPh]     = useState('')
  const [em,     setEm]     = useState('')
  const [nm,     setNm]     = useState('')
  const [st,     setSt]     = useState('form')
  const [otp,    setOtp]    = useState(Array(6).fill(''))
  const [err,    setErr]    = useState('')
  const [showCC, setShowCC] = useState(false)
  const [focus,  setFocus]  = useState('')

  const NAVY = '#070e1f'
  const inp = (f) => ({
    width:'100%', padding:'13px 16px',
    background: focus===f ? `${A}08` : 'rgba(255,255,255,0.04)',
    border: focus===f ? `1.5px solid ${A}` : '1.5px solid rgba(255,255,255,0.1)',
    borderRadius:12, color:'#fff', fontSize:14, fontFamily:'inherit',
    outline:'none', boxSizing:'border-box', transition:'all .2s',
  })

  function go() {
    if (nm.trim().length < 2) return setErr('Full name required')
    if (tab==='mobile' && !validatePhone(ph,cc)) return setErr(`Invalid ${cc.name} number`)
    if (tab==='email'  && !validateEmail(em))    return setErr('Invalid email address')
    setErr(''); setSt('otp')
  }
  function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setErr(''); setSt('done')
  }

  if (st==='done') return (
    <div style={{ height:660, background:NAVY, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ position:'relative', marginBottom:20 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', border:`3px solid ${A}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>✓</div>
        <div style={{ position:'absolute', inset:-4, borderRadius:'50%', boxShadow:`0 0 40px ${A}44` }}/>
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Welcome aboard.</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>{nm.split(' ')[0]}, your health intelligence<br/>dashboard is ready.</div>
      <button style={{ marginTop:28, padding:'14px 28px', background:A, color:'#000', border:'none', borderRadius:12, fontSize:14, fontWeight:900, cursor:'pointer' }}>Open Dashboard →</button>
    </div>
  )

  return (
    <div style={{ height:660, background:NAVY, overflowY:'auto', position:'relative' }}>
      <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, background:`radial-gradient(circle,${A}18,transparent 70%)`, borderRadius:'50%', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:80, left:-60, width:200, height:200, background:`radial-gradient(circle,${A}0c,transparent 70%)`, borderRadius:'50%', pointerEvents:'none' }}/>

      <div style={{ padding:'28px 22px', position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:30 }}>
          <div style={{ width:32, height:32, borderRadius:8, border:`1.5px solid ${A}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, background:`${A}12` }}>🧬</div>
          <div>
            <span style={{ fontSize:15, fontWeight:800, color:'#fff', letterSpacing:0.5 }}>AROGYOS</span>
            <div style={{ fontSize:9, color:A, fontWeight:700, letterSpacing:2 }}>INTELLIGENCE</div>
          </div>
        </div>

        {st==='form' && <>
          <div style={{ marginBottom:26 }}>
            <div style={{ fontSize:26, fontWeight:800, color:'#fff', lineHeight:1.2, letterSpacing:-0.5, marginBottom:10 }}>
              Your health,<br/>intelligently<br/><span style={{ color:A }}>monitored.</span>
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>Biological age tracking powered by clinical biomarkers and AI.</div>
          </div>

          <div style={{ display:'flex', gap:6, marginBottom:16, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:3, border:'1px solid rgba(255,255,255,0.06)' }}>
            {['mobile','email'].map(t => (
              <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
                flex:1, padding:'9px 0', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer',
                background: tab===t ? `${A}20` : 'none',
                color: tab===t ? A : 'rgba(255,255,255,0.3)',
                outline: tab===t ? `1px solid ${A}44` : 'none',
              }}>
                {t==='mobile' ? '📱 Mobile' : '✉️ Email'}
              </button>
            ))}
          </div>

          <div style={{ marginBottom:12 }}>
            <input style={inp('name')} placeholder="Full name" value={nm} onChange={e => setNm(e.target.value)} onFocus={() => setFocus('name')} onBlur={() => setFocus('')}/>
          </div>

          {tab==='mobile' ? (
            <div style={{ position:'relative', marginBottom:12 }}>
              <div style={{ display:'flex', gap:8 }}>
                <CcDropdown cc={cc} onSelect={c => { setCc(c); setShowCC(false); setPh('') }} open={showCC} onToggle={() => setShowCC(!showCC)} accentColor={A} dark={true}/>
                <input style={{ ...inp('phone'), flex:1 }} type="tel" placeholder={`${cc.min} digits`} value={ph} onChange={e => setPh(e.target.value.replace(/\D/g,'').slice(0,cc.max))} onFocus={() => setFocus('phone')} onBlur={() => setFocus('')}/>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom:12 }}>
              <input style={inp('email')} type="email" placeholder="you@example.com" value={em} onChange={e => setEm(e.target.value)} onFocus={() => setFocus('email')} onBlur={() => setFocus('')}/>
            </div>
          )}

          {err && <div style={{ fontSize:12, color:'#f87171', marginBottom:10, fontWeight:600 }}>⚠ {err}</div>}
          <button onClick={go} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${A},${theme.dark})`, color:'#000', border:'none', borderRadius:13, fontSize:15, fontWeight:900, cursor:'pointer', marginTop:4, boxShadow:`0 4px 24px ${A}44` }}>
            Create Account →
          </button>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.18)', textAlign:'center', marginTop:14, lineHeight:1.7 }}>🔐 256-bit AES encrypted · DPDP Act 2023</div>
        </>}

        {st==='otp' && (
          <div style={{ paddingTop:12 }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ position:'relative', display:'inline-block', marginBottom:14 }}>
                <div style={{ width:60, height:60, borderRadius:'50%', border:`2px solid ${A}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>📲</div>
                <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:`1px solid ${A}30` }}/>
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:5 }}>Identity verification</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>Sent to<br/><span style={{ color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{tab==='mobile'?`${cc.dial} ${ph}`:em}</span></div>
              <div style={{ marginTop:12, display:'inline-block', background:`${A}12`, border:`1px solid ${A}30`, borderRadius:8, padding:'7px 14px', fontSize:12, color:A, fontWeight:700 }}>Demo: 000000</div>
            </div>
            <OtpBoxes value={otp} onChange={setOtp}
              boxStyle={{ width:38, height:54, textAlign:'center', fontSize:22, fontWeight:800, background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', outline:'none', boxSizing:'border-box' }}
              activeStyle={{ borderColor:A, color:A, background:`${A}10`, boxShadow:`0 0 12px ${A}30` }}
            />
            {err && <div style={{ fontSize:12, color:'#f87171', marginTop:12, fontWeight:600, textAlign:'center' }}>⚠ {err}</div>}
            <button onClick={verify} style={{ width:'100%', padding:15, background:`linear-gradient(90deg,${A},${theme.dark})`, color:'#000', border:'none', borderRadius:13, fontSize:15, fontWeight:900, cursor:'pointer', margin:'22px 0 12px', boxShadow:`0 4px 24px ${A}44` }}>Verify →</button>
            <div style={{ textAlign:'center' }}><Timer secs={50} color="rgba(255,255,255,0.25)"/></div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Phone frame ───────────────────────────────────────────────────────────────
function Frame({ children }) {
  return (
    <div style={{
      width:340, height:640,
      border:'10px solid #0f172a', borderRadius:38,
      overflow:'hidden',
      boxShadow:'0 28px 70px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.12)',
      position:'relative', flexShrink:0,
    }}>
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:80, height:18, background:'#0f172a', borderRadius:'0 0 10px 10px', zIndex:99 }}/>
      <div style={{ height:'100%', overflowY:'auto', paddingTop:8 }}>{children}</div>
    </div>
  )
}

// ── Per-design wrapper with theme switcher ────────────────────────────────────
const DESIGNS = [
  { id:1, label:'ZERO',     sub:'Whoop · Black + accent',     Comp:Design1 },
  { id:2, label:'AURUM',    sub:'Oura · Dark charcoal + accent', Comp:Design2 },
  { id:3, label:'SIGNAL',   sub:'Levels · White + accent',    Comp:Design3 },
  { id:4, label:'DEEP ICE', sub:'Eight Sleep · Navy + accent', Comp:Design4 },
]

function DesignCard({ Comp, label, sub }) {
  const [tid, setTid] = useState('teal')
  const theme = APP_THEMES.find(t => t.id === tid)

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, flexShrink:0 }}>
      {/* Labels */}
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:15, fontWeight:900, color:'#0f172a', marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:11.5, color:'#94a3b8' }}>{sub}</div>
      </div>

      {/* Phone */}
      <Frame><Comp theme={theme}/></Frame>

      {/* Theme switcher dots */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:1 }}>COLOUR THEME</div>
        <div style={{ display:'flex', gap:10 }}>
          {APP_THEMES.map(t => (
            <button key={t.id} onClick={() => setTid(t.id)} title={t.label} style={{
              width:28, height:28, borderRadius:'50%', background:t.dot, border:'none', cursor:'pointer',
              outline: tid===t.id ? `3px solid #0f172a` : '3px solid transparent',
              outlineOffset: tid===t.id ? 2 : 0,
              boxShadow: tid===t.id ? `0 0 0 1px ${t.dot}` : 'none',
              transition:'all .15s',
              transform: tid===t.id ? 'scale(1.15)' : 'scale(1)',
            }}/>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {APP_THEMES.map(t => (
            <div key={t.id} style={{ width:28, textAlign:'center', fontSize:9, color: tid===t.id ? '#0f172a' : '#cbd5e1', fontWeight: tid===t.id ? 800 : 400, transition:'all .15s' }}>
              {t.id === 'teal' ? 'Teal' : t.id === 'gold' ? 'Gold' : 'Amber'}
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:'#64748b', fontWeight:600 }}>{theme.label}</div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SignupDesignsPreview3() {
  const nav = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'16px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:8 }}>
          <button onClick={() => nav('/signup-preview-2')} style={{ background:'none', border:'none', color:'#64748b', fontSize:13, cursor:'pointer', fontWeight:600, padding:0 }}>← V2 Designs</button>
          <button onClick={() => nav('/')} style={{ marginLeft:'auto', background:'none', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 14px', color:'#64748b', fontSize:13, cursor:'pointer', fontWeight:600 }}>Back to App</button>
        </div>
        <div style={{ fontSize:20, fontWeight:900, color:'#0f172a', marginBottom:4 }}>Signup Designs V3 — All App Colours</div>
        <div style={{ fontSize:13, color:'#64748b' }}>Each design adapts to all 3 AROGYOS themes · Click the dots below each phone to switch colour</div>
        <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
          {APP_THEMES.map(t => (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:7, background:`${t.dot}14`, border:`1px solid ${t.dot}40`, borderRadius:20, padding:'5px 12px' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:t.dot }}/>
              <span style={{ fontSize:12, fontWeight:700, color:'#334155' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions banner */}
      <div style={{ background:`linear-gradient(90deg,#0f3a3a,#0a2424)`, padding:'12px 28px', display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:16 }}>💡</span>
        <span style={{ fontSize:13, color:'#9fd9cf' }}>
          Try the full flow — enter any name, valid mobile/email, then use OTP <strong style={{ color:'#fff' }}>000000</strong> to reach the success screen.
          Click the coloured dots below each phone to switch themes live.
        </span>
      </div>

      {/* Design frames */}
      <div style={{ display:'flex', gap:40, overflowX:'auto', padding:'36px 32px 48px', scrollSnapType:'x mandatory', alignItems:'flex-start' }}>
        {DESIGNS.map(d => (
          <div key={d.id} style={{ scrollSnapAlign:'start' }}>
            <DesignCard Comp={d.Comp} label={d.label} sub={d.sub}/>
          </div>
        ))}
      </div>

      <div style={{ textAlign:'center', padding:'0 24px 40px', fontSize:13, color:'#94a3b8' }}>
        Pick a design + colour theme → we'll integrate it as the real AROGYOS signup screen with email OTP.
      </div>
    </div>
  )
}
