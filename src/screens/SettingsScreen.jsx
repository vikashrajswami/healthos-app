import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LANGUAGES, useLang, useT } from '../lib/i18n'
import Logo from '../components/Logo'
import { requestNotificationPermission, getNotificationPermission, subscribeToPush } from '../lib/notifications'
import { pushToCloud } from '../lib/sync'

const validateEmail = e => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e)
const validatePhone = p => /^[+]?[\d\s\-()]{7,15}$/.test(p)

// ── OTP mini-flow ─────────────────────────────────────────────────────────────
function OtpFlow({ title, current, type, accent, onDone, onClose }) {
  const [step,    setStep]    = useState('input')  // input | otp | done
  const [val,     setVal]     = useState('')
  const [otp,     setOtp]     = useState(Array(6).fill(''))
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const refs = useRef([])

  async function submit() {
    const ok = type === 'email' ? validateEmail(val) : validatePhone(val)
    if (!ok) return setErr(type === 'email' ? 'Enter a valid email' : 'Enter a valid phone number')
    setErr('')
    setLoading(true)
    try {
      const res  = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: val, type: type === 'email' ? 'email' : 'sms' }),
      })
      const text = await res.text()
      const data = (() => { try { return JSON.parse(text) } catch { return { error: text || 'Server error. Try again.' } } })()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
      setStep('otp')
    } catch (e) {
      setErr(e.message)
    }
    setLoading(false)
  }

  async function verify() {
    if (otp.join('').length < 6) return setErr('Enter all 6 digits')
    setLoading(true)
    setErr('')
    try {
      const res  = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: val, code: otp.join('') }),
      })
      const text = await res.text()
      const data = (() => { try { return JSON.parse(text) } catch { return { error: text || 'Server error. Try again.' } } })()
      if (!res.ok || !data.valid) throw new Error(data.error || 'Incorrect OTP. Please try again.')
      onDone(val)
      setStep('done')
    } catch (e) {
      setErr(e.message)
    }
    setLoading(false)
  }
  function onInput(i, e) {
    const v = e.target.value.replace(/\D/g,'').slice(-1)
    const next = [...otp]; next[i] = v; setOtp(next)
    if (v && i < 5) refs.current[i+1]?.focus()
    if (!v && e.nativeEvent.inputType === 'deleteContentBackward' && i > 0) refs.current[i-1]?.focus()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'28px 24px', width:'100%', maxWidth:360, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ fontWeight:800, fontSize:16, color:'#0f172a', marginBottom:6 }}>{title}</div>
        <div style={{ fontSize:12, color:'#94a3b8', marginBottom:20 }}>Current: {current}</div>

        {step === 'input' && (
          <>
            <input value={val} onChange={e => setVal(e.target.value)} type={type === 'email' ? 'email' : 'tel'}
              placeholder={type === 'email' ? 'new@email.com' : '+91 9876543210'}
              style={{ width:'100%', padding:'13px 14px', border:'1.5px solid #e2e8f0', borderRadius:12, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
            {err && <div style={{ color:'#ef4444', fontSize:12, marginTop:6 }}>{err}</div>}
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button onClick={onClose} style={{ flex:1, padding:13, border:'1.5px solid #e2e8f0', borderRadius:12, background:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Cancel</button>
              <button onClick={submit} disabled={loading} style={{ flex:2, padding:13, background:`linear-gradient(90deg,${accent},${accent}bb)`, border:'none', borderRadius:12, color:'#fff', fontWeight:800, cursor: loading ? 'wait' : 'pointer', fontSize:14, opacity: loading ? 0.75 : 1 }}>{loading ? 'Sending…' : 'Send OTP'}</button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:16, lineHeight:1.6 }}>
              OTP sent to <strong>{val}</strong><br/>
              <span style={{ fontSize:12, color:'#94a3b8' }}>Check your messages or inbox for the code</span>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:16 }}>
              {otp.map((v,i) => (
                <input key={i} ref={el => refs.current[i]=el} maxLength={1} inputMode="numeric" value={v} onChange={e => onInput(i,e)}
                  style={{ width:42, height:52, textAlign:'center', fontSize:20, fontWeight:700, border:`1.5px solid ${v?accent:'#e2e8f0'}`, borderRadius:10, background:v?`${accent}08`:'#f8fafb', color:v?accent:'#0f172a', outline:'none', boxSizing:'border-box' }}/>
              ))}
            </div>
            {err && <div style={{ color:'#ef4444', fontSize:12, marginBottom:10, textAlign:'center' }}>{err}</div>}
            <button onClick={verify} disabled={loading} style={{ width:'100%', padding:13, background:`linear-gradient(90deg,${accent},${accent}bb)`, border:'none', borderRadius:12, color:'#fff', fontWeight:800, cursor: loading ? 'wait' : 'pointer', fontSize:14, opacity: loading ? 0.75 : 1 }}>{loading ? 'Verifying…' : 'Verify →'}</button>
            <button onClick={() => setStep('input')} style={{ width:'100%', marginTop:8, padding:10, border:'none', background:'none', color:'#94a3b8', fontSize:12, cursor:'pointer' }}>← Change {type}</button>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
            <div style={{ fontWeight:800, color:'#0f172a', marginBottom:6 }}>Updated successfully</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:20 }}>Your {type} has been changed to<br/><strong>{val}</strong></div>
            <button onClick={onClose} style={{ padding:'12px 28px', background:`linear-gradient(90deg,${accent},${accent}bb)`, border:'none', borderRadius:12, color:'#fff', fontWeight:800, cursor:'pointer', fontSize:14 }}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:11, fontWeight:800, color:'#94a3b8', letterSpacing:1.2, padding:'0 4px', marginBottom:8 }}>{title.toUpperCase()}</div>
      <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', border:'1px solid #f1f5f9' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ icon, label, value, onClick, danger, toggle, toggled, last }) {
  return (
    <div onClick={!toggle ? onClick : undefined} style={{
      display:'flex', alignItems:'center', padding:'15px 18px', gap:14, cursor: onClick && !toggle ? 'pointer' : 'default',
      borderBottom: last ? 'none' : '1px solid #f8fafc',
      background: danger ? '#fff5f5' : '#fff',
    }}>
      <span style={{ fontSize:20, width:24, textAlign:'center', flexShrink:0 }}>{icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color: danger ? '#ef4444' : '#0f172a' }}>{label}</div>
        {value && <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{value}</div>}
      </div>
      {toggle ? (
        <div onClick={onClick} style={{ width:44, height:26, borderRadius:13, background: toggled ? '#14b8a6' : '#e2e8f0', cursor:'pointer', position:'relative', transition:'all .2s', flexShrink:0 }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: toggled ? 21 : 3, transition:'all .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }}/>
        </div>
      ) : (
        onClick && <span style={{ color:'#cbd5e1', fontSize:16 }}>›</span>
      )}
    </div>
  )
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ onConfirm, onClose }) {
  const [typed, setTyped] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:20, padding:'28px 24px', width:'100%', maxWidth:360 }}>
        <div style={{ fontSize:36, marginBottom:12, textAlign:'center' }}>⚠️</div>
        <div style={{ fontWeight:900, fontSize:17, color:'#0f172a', marginBottom:10, textAlign:'center' }}>Delete Account?</div>
        <div style={{ fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:20, textAlign:'center' }}>
          This will permanently delete all your health data, reports, vault entries, and subscription. <strong>This cannot be undone.</strong>
        </div>
        <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>Type <strong>DELETE</strong> to confirm:</div>
        <input value={typed} onChange={e => setTyped(e.target.value.toUpperCase())} placeholder="DELETE"
          style={{ width:'100%', padding:'13px 14px', border:'1.5px solid #fca5a5', borderRadius:12, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', color:'#ef4444', fontWeight:700 }}/>
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <button onClick={onClose} style={{ flex:1, padding:13, border:'1.5px solid #e2e8f0', borderRadius:12, background:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>Cancel</button>
          <button onClick={() => typed === 'DELETE' && onConfirm()} disabled={typed !== 'DELETE'}
            style={{ flex:2, padding:13, background: typed === 'DELETE' ? '#ef4444' : '#fee2e2', border:'none', borderRadius:12, color: typed === 'DELETE' ? '#fff' : '#fca5a5', fontWeight:800, cursor: typed === 'DELETE' ? 'pointer' : 'default', fontSize:14 }}>
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Language picker ───────────────────────────────────────────────────────────
function LangPicker({ onClose }) {
  const { lang, setLang } = useLang()
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, maxHeight:'80vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'18px 20px 12px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontWeight:800, fontSize:16 }}>Choose Language</div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#94a3b8' }}>✕</button>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {LANGUAGES.map(l => (
            <div key={l.code} onClick={() => { setLang(l.code); onClose() }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:'1px solid #f8fafc', cursor:'pointer', background: lang === l.code ? '#f0fdf4' : '#fff' }}>
              <span style={{ fontSize:22 }}>{l.flag}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight: lang === l.code ? 800 : 600, color:'#0f172a', fontSize:14 }}>{l.native}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>{l.name} {l.dir === 'rtl' ? '· RTL' : ''}</div>
              </div>
              {lang === l.code && <span style={{ color:'#14b8a6', fontWeight:900, fontSize:16 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Settings screen ──────────────────────────────────────────────────────
export default function SettingsScreen() {
  const nav    = useNavigate()
  const t      = useT()
  const { lang } = useLang()
  const curLang  = LANGUAGES.find(l => l.code === lang)

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('healthos_profile') || '{}') } catch { return {} }
  })
  const [notif, setNotif] = useState({
    push: true, email: true, healthAlerts: true, weeklyReport: true, retest: true, marketing: false,
    ...JSON.parse(localStorage.getItem('healthos_notif') || '{}'),
  })

  const [modal,    setModal]    = useState(null)  // 'email' | 'mobile' | 'lang' | 'delete' | 'logout'
  const [deleted,  setDeleted]  = useState(false)
  const [pushPerm, setPushPerm] = useState(() => getNotificationPermission())
  const accent = '#14b8a6'

  async function handleEnablePush() {
    const result = await requestNotificationPermission()
    setPushPerm(result)
    if (result === 'granted') {
      const uid = localStorage.getItem('healthos_uid')
      await subscribeToPush(uid)
    }
  }

  function saveNotif(key, val) {
    const updated = { ...notif, [key]: val }
    setNotif(updated)
    localStorage.setItem('healthos_notif', JSON.stringify(updated))
  }
  function handleProfileUpdate(key, val) {
    const updated = { ...profile, [key]: val }
    setProfile(updated)
    localStorage.setItem('healthos_profile', JSON.stringify(updated))
    setModal(null)
    pushToCloud()
  }
  function handleDelete() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('healthos_'))
    keys.forEach(k => localStorage.removeItem(k))
    sessionStorage.clear()
    setDeleted(true)
    setTimeout(() => nav('/signup'), 2000)
  }
  function handleLogout() {
    Object.keys(localStorage).filter(k => k.startsWith('healthos_')).forEach(k => localStorage.removeItem(k))
    sessionStorage.clear()
    window.location.replace('/')
  }

  if (deleted) return (
    <div style={{ minHeight:'100vh', background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:20 }}>🗑️</div>
      <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', marginBottom:8 }}>Account deleted</div>
      <div style={{ fontSize:14, color:'#94a3b8' }}>All your data has been removed. Redirecting…</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif', paddingBottom:80 }}>

      {/* Modals */}
      {modal === 'email'  && <OtpFlow title="Change Email" type="email" current={profile.email||'Not set'} accent={accent} onDone={v => handleProfileUpdate('email', v)} onClose={() => setModal(null)}/>}
      {modal === 'mobile' && <OtpFlow title="Change Mobile" type="mobile" current={profile.mobile||'Not set'} accent={accent} onDone={v => handleProfileUpdate('mobile', v)} onClose={() => setModal(null)}/>}
      {modal === 'lang'   && <LangPicker onClose={() => setModal(null)}/>}
      {modal === 'delete' && <DeleteModal onConfirm={handleDelete} onClose={() => setModal(null)}/>}

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f3a3a,#0a2424)', padding:'44px 22px 28px' }}>
        <button onClick={() => nav(-1)} style={{ background:'none', border:'none', color:'#9fd9cf', fontSize:13, fontWeight:600, cursor:'pointer', padding:0, marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>
          ← {t('back')}
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Logo size={44}/>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:'#fff' }}>{t('settings')}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>AROGYOS Intelligence</div>
          </div>
        </div>

        {/* Profile card */}
        <div style={{ marginTop:22, background:'rgba(255,255,255,0.07)', borderRadius:16, padding:'18px 18px', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#14b8a6,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            {profile.name ? profile.name[0].toUpperCase() : '👤'}
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>{profile.name || 'Your Name'}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{profile.email || profile.mobile || 'No contact set'}</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'20px 16px' }}>

        {/* Profile */}
        <Section title={t('profile')}>
          <Row icon="✏️" label="Full Name"      value={profile.name   || 'Tap to set'} onClick={() => { const n=prompt('Enter full name'); if(n) handleProfileUpdate('name',n) }}/>
          <Row icon="📱" label="Mobile Number"  value={profile.mobile || 'Not set'}    onClick={() => setModal('mobile')}/>
          <Row icon="✉️" label="Email Address"  value={profile.email  || 'Not set'}    onClick={() => setModal('email')}/>
          <Row icon="🎂" label="Date of Birth"  value={profile.dob    || 'Not set'}    onClick={() => { const d=prompt('Enter DOB (YYYY-MM-DD)'); if(d) handleProfileUpdate('dob',d) }} last/>
        </Section>

        {/* Notifications */}
        <Section title={t('notifications')}>
          <Row icon="🔔" label="Push Notifications"  value="Health alerts on your device"    toggle toggled={notif.push}         onClick={() => saveNotif('push',         !notif.push)}/>
          <Row icon="📧" label="Email Reports"        value="Weekly summary to your inbox"   toggle toggled={notif.email}        onClick={() => saveNotif('email',        !notif.email)}/>
          <Row icon="🚨" label="Critical Health Alerts" value="Flagged biomarkers"           toggle toggled={notif.healthAlerts}  onClick={() => saveNotif('healthAlerts', !notif.healthAlerts)}/>
          <Row icon="📅" label="Retest Reminders"    value="90-day protocol reminders"      toggle toggled={notif.retest}        onClick={() => saveNotif('retest',       !notif.retest)}/>
          <Row icon="📊" label="Weekly Health Report" value="Progress summary every Monday" toggle toggled={notif.weeklyReport}  onClick={() => saveNotif('weeklyReport', !notif.weeklyReport)}/>
          <Row icon="📣" label="Offers & Updates"     value="Optional marketing (can opt out)"  toggle toggled={notif.marketing} onClick={() => saveNotif('marketing', !notif.marketing)} last/>
        </Section>

        {/* Language */}
        <Section title={t('language')}>
          <Row icon={curLang?.flag || '🌍'} label={t('language')} value={`${curLang?.native} — ${curLang?.name}`} onClick={() => setModal('lang')} last/>
        </Section>

        {/* Privacy & Security */}
        <Section title={t('privacy')}>
          <Row icon="📋" label="Terms & Conditions"   onClick={() => nav('/terms')}/>
          <Row icon="🔒" label="Privacy Policy"       onClick={() => nav('/privacy')}/>
          <Row icon="📦" label="Download My Data"     value="Export all your health records" onClick={() => alert('Data export will be emailed to you within 24 hours.')}/>
          <Row icon="💳" label="Subscription & Billing" value="Manage your plan"            onClick={() => nav('/payment')} last/>
        </Section>

        {/* Notifications */}
        <Section title="Push Notifications">
          {pushPerm === 'granted' ? (
            <Row icon="🔔" label="Push Notifications Enabled" value="Daily reminders are active" last/>
          ) : pushPerm === 'denied' ? (
            <Row icon="🔕" label="Notifications Blocked" value="Enable in your browser settings → Site permissions" last/>
          ) : (
            <Row icon="🔔" label="Enable Push Notifications" value="Get daily health reminders" onClick={handleEnablePush} last/>
          )}
        </Section>

        {/* Help */}
        <Section title={t('help')}>
          <Row icon="💬" label="Contact Support"     value="support@arogyos.com"   onClick={() => alert('Email: support@arogyos.com')}/>
          <Row icon="ℹ️" label="About AROGYOS"      value="Version 1.0.0 · Build 2026.06" onClick={() => {}} last/>
        </Section>

        {/* Account actions */}
        <Section title="Account">
          <Row icon="🚪" label={t('logout')} onClick={handleLogout}/>
          <Row icon="🗑️" label={t('delete_acct')} danger onClick={() => setModal('delete')} last/>
        </Section>

        {/* Follow us */}
        <div style={{ textAlign:'center', marginTop:24, marginBottom:8 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', marginBottom:12, letterSpacing:1, textTransform:'uppercase' }}>Follow AROGYOS</div>
          <div style={{ display:'flex', justifyContent:'center', gap:16 }}>
            {[
              { label:'Instagram', href:'https://www.instagram.com/arogyos/', color:'#e1306c', svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
              { label:'LinkedIn',  href:'https://www.linkedin.com/company/arogyos/', color:'#0077b5', svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
              { label:'YouTube',   href:'https://www.youtube.com/@arogyos', color:'#ff0000', svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg> },
              { label:'Reddit',    href:'https://www.reddit.com/user/EfficiencyBitter9874/', color:'#ff4500', svg:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.72 10A2 2 0 0 1 20 11.5a2 2 0 0 1-1 1.74"/><path d="M7.28 10A2 2 0 0 0 4 11.5a2 2 0 0 0 1 1.74"/><path d="M12 8c-1.5-2-4-2-4-2s.5 2 1 3"/><path d="M12 8c1.5-2 4-2 4-2s-.5 2-1 3"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M9.5 16a4 4 0 0 0 5 0"/></svg> },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, textDecoration:'none', color: s.color }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.06)', border:`1.5px solid ${s.color}33`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {s.svg}
                </div>
                <span style={{ fontSize:10, fontWeight:600, color:'#94a3b8' }}>{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div style={{ textAlign:'center', fontSize:11, color:'#cbd5e1', marginTop:16, lineHeight:1.8 }}>
          AROGYOS Intelligence Pvt. Ltd.<br/>
          DPDP Act 2023 · GDPR · v1.0.0
        </div>
      </div>
    </div>
  )
}
