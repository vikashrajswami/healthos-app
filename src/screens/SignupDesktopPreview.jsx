import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const A  = '#14b8a6'
const AD = '#0d9488'

// ── Shared fake form ──────────────────────────────────────────────────────────
function FakeForm({ dark }) {
  const fg   = dark ? '#fff'              : '#0f172a'
  const sub  = dark ? 'rgba(255,255,255,0.5)' : '#64748b'
  const inp  = dark ? 'rgba(255,255,255,0.08)' : '#f8fafc'
  const bord = dark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 11, color: sub, fontWeight: 700, marginBottom: -6 }}>MOBILE NUMBER</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ background: inp, border: `1.5px solid ${bord}`, borderRadius: 10, padding: '13px 14px', fontSize: 14, color: sub, width: 64, flexShrink: 0 }}>🇮🇳 +91</div>
        <div style={{ flex: 1, background: inp, border: `1.5px solid ${A}`, borderRadius: 10, padding: '13px 14px', fontSize: 14, color: fg }}>98765 43210</div>
      </div>
      <button style={{ background: `linear-gradient(90deg,${A},${AD})`, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 20px ${A}40` }}>
        Continue →
      </button>
      <div style={{ textAlign: 'center', fontSize: 11, color: sub }}>By continuing you agree to our Terms & Privacy Policy</div>
    </div>
  )
}

function StatPill({ icon, val, label, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(20,184,166,0.08)', borderRadius: 12, padding: '10px 14px' }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: dark ? '#fff' : '#0f172a' }}>{val}</div>
        <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.45)' : '#64748b' }}>{label}</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 1 — Split Screen (Dark Left + White Right)
// ═══════════════════════════════════════════════════════════════════════════════
function Design1() {
  return (
    <div style={{ display: 'flex', height: 580, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}>

      {/* LEFT — branding */}
      <div style={{ width: '52%', background: 'linear-gradient(145deg,#0a1a1a,#0f3a3a)', display: 'flex', flexDirection: 'column', padding: '48px 44px', position: 'relative', overflow: 'hidden' }}>
        {/* BG circle */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: `${A}08` }}/>
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: `${A}06` }}/>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: A, opacity: 0.4 }}/>
          </div>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: 1 }}>AROGY<span style={{ color: A }}>OS</span></span>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
          Know your true<br/>
          <span style={{ color: A }}>biological age</span>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 36, maxWidth: 280 }}>
          Upload a lab report and get your BioAge score in 60 seconds. Backed by science, built for India.
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <StatPill icon="🧬" val="23+" label="Biomarkers tracked" dark />
          <StatPill icon="👨‍👩‍👧" val="6 members" label="Family BioAge dashboard" dark />
          <StatPill icon="⚡" val="60 sec" label="AI lab report analysis" dark />
        </div>

        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 24 }}>
          Trusted by 10,000+ users · HIPAA compliant
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 48px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Get started free</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>Enter your number to receive an OTP. No email required.</div>
          <FakeForm dark={false} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }}/>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }}/>
          </div>

          <button style={{ width: '100%', padding: '13px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
            📧 Continue with Email
          </button>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
            Already have an account? <span style={{ color: A, fontWeight: 700, cursor: 'pointer' }}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 2 — Full Dark with Centered Glass Card
// ═══════════════════════════════════════════════════════════════════════════════
function Design2() {
  return (
    <div style={{ height: 580, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 40px rgba(0,0,0,0.14)', background: 'linear-gradient(135deg,#060f0f,#0a2424,#091414)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: `${A}12`, filter: 'blur(60px)' }}/>
      <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: '#6366f120', filter: 'blur(50px)' }}/>

      {/* Logo row at top */}
      <div style={{ position: 'absolute', top: 28, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: A, opacity: 0.4 }}/>
        </div>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: 1 }}>AROGY<span style={{ color: A }}>OS</span></span>
      </div>

      {/* Glass card */}
      <div style={{ width: 420, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '40px 36px', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Welcome to AROGYOS</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>Your personal health intelligence platform</div>
        </div>

        <FakeForm dark={true} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
        </div>

        <button style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600, cursor: 'pointer' }}>
          📧 Continue with Email
        </button>
      </div>

      {/* Bottom stat pills */}
      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {[['🧬','BioAge AI'],['📊','Lab Analysis'],['👨‍👩‍👧','Family Health']].map(([ic, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '7px 14px', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            <span>{ic}</span><span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 3 — App Preview Left + Form Right
// ═══════════════════════════════════════════════════════════════════════════════
function Design3() {
  return (
    <div style={{ display: 'flex', height: 580, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}>

      {/* LEFT — app dashboard mockup */}
      <div style={{ width: '54%', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px', overflow: 'hidden', position: 'relative' }}>
        {/* browser chrome */}
        <div style={{ width: '100%', background: '#fff', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
          {/* browser bar */}
          <div style={{ background: '#f1f5f9', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fc6058' }}/>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffc130' }}/>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c940' }}/>
            <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 6, padding: '4px 10px', fontSize: 10, color: '#94a3b8', marginLeft: 8 }}>arogyos.app/home</div>
          </div>
          {/* app UI */}
          <div style={{ display: 'flex', height: 400 }}>
            {/* mini dark sidebar */}
            <div style={{ width: 52, background: '#0f1e1e', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${A}` }}/>
              {['🏠','📈','📋','⌚','⚡'].map((ic, i) => (
                <div key={i} style={{ fontSize: 12, opacity: i === 0 ? 1 : 0.4 }}>{ic}</div>
              ))}
            </div>
            {/* mini content */}
            <div style={{ flex: 1, background: '#f8fafc', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>Good morning, Vikash 👋</div>
              {/* mini BioAge card */}
              <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', borderRadius: 10, padding: '12px', color: '#fff' }}>
                <div style={{ fontSize: 8, color: A, fontWeight: 700, letterSpacing: 1 }}>BIOLOGICAL AGE</div>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>28</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Actual: 32 · <span style={{ color: '#4ade80' }}>4 yrs younger</span></div>
              </div>
              {/* mini biomarkers */}
              <div style={{ background: '#fff', borderRadius: 8, padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[['Vit D','32','low','#f59e0b'],['HbA1c','5.4%','ok','#10b981'],['LDL','112','border','#f97316'],['TSH','2.1','ok','#10b981']].map(([n,v,s,c]) => (
                  <div key={n} style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 8px', borderLeft: `2px solid ${c}` }}>
                    <div style={{ fontSize: 8, color: '#94a3b8' }}>{n}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>{v}</div>
                    <div style={{ fontSize: 7, color: c }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* overlay label */}
        <div style={{ position: 'absolute', bottom: 36, left: 36, right: 36, background: 'rgba(15,30,30,0.9)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 2 }}>See your BioAge dashboard</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Sign up in 30 seconds — no email needed</div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px', borderLeft: '1px solid #f1f5f9' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: A, opacity: 0.4 }}/>
          </div>
          <span style={{ fontWeight: 900, fontSize: 15, color: '#0f172a' }}>AROGY<span style={{ color: A }}>OS</span></span>
        </div>

        <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Create your account</div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
          Free forever · No credit card · No email required
        </div>

        <FakeForm dark={false} />

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['✓ 30-day Plus trial included', '✓ AI lab report analysis', '✓ Family BioAge dashboard'].map(f => (
            <div key={f} style={{ fontSize: 12, color: '#64748b' }}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 4 — Teal Gradient Left + Minimal White Right
// ═══════════════════════════════════════════════════════════════════════════════
function Design4() {
  return (
    <div style={{ display: 'flex', height: 580, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 40px rgba(0,0,0,0.14)' }}>

      {/* LEFT — teal gradient panel */}
      <div style={{ width: '45%', background: `linear-gradient(160deg,${A},${AD},#065f46)`, display: 'flex', flexDirection: 'column', padding: '44px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚕️</div>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 17, letterSpacing: 1 }}>AROGY<span style={{ color: 'rgba(255,255,255,0.7)' }}>OS</span></span>
        </div>

        {/* Big number */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>YOUR BIOLOGICAL AGE</div>
          <div style={{ fontSize: 80, fontWeight: 900, color: '#fff', lineHeight: 1 }}>28</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>vs chronological age: 32</div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#fff', fontWeight: 700, marginTop: 10 }}>
            4 years younger ↓
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[['🧬','AI biomarker analysis'],['📈','Trend tracking'],['👨‍👩‍👧','Family health dashboard']].map(([ic, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              <span style={{ fontSize: 16 }}>{ic}</span>{l}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — minimal white form */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 44px' }}>
        <div style={{ width: '100%', maxWidth: 340 }}>
          <div style={{ width: 52, height: 4, background: A, borderRadius: 2, marginBottom: 28 }}/>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8, lineHeight: 1.2 }}>
            Start for free.<br/>No card needed.
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>Join 10,000+ users optimising their health.</div>

          <FakeForm dark={false} />

          <div style={{ marginTop: 28, padding: '16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', flexShrink: 0 }}>V</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>"My BioAge dropped by 6 years in 4 months"</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Vikash K. · Delhi · Verified user</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PREVIEW PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const DESIGNS = [
  { id: 1, name: 'Split Screen Dark',     desc: 'Dark branding left · White form right · Classic SaaS', component: Design1 },
  { id: 2, name: 'Full Dark Glass Card',  desc: 'Dark full-screen · Glassmorphism card · Premium feel', component: Design2 },
  { id: 3, name: 'App Preview + Form',    desc: 'Live app mockup left · Form right · Shows what you get', component: Design3 },
  { id: 4, name: 'Teal Gradient Split',   desc: 'Bold teal left · Clean white form · High energy', component: Design4 },
]

export default function SignupDesktopPreview() {
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui,sans-serif', padding: '32px 48px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <button onClick={() => nav('/home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontWeight: 600, marginBottom: 12, padding: 0 }}>← Back</button>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Signup Page Designs</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Choose the signup experience you want for desktop users.</div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
        {DESIGNS.map(({ id, name, desc, component: Component }) => (
          <div key={id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ background: A, color: '#fff', borderRadius: 8, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>Option {id}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{name}</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{desc}</div>
              </div>
              <button
                onClick={() => setSelected(id)}
                style={{
                  padding: '11px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: selected === id ? A : 'rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  boxShadow: selected === id ? `0 4px 20px ${A}60` : 'none',
                  transform: selected === id ? 'scale(1.04)' : 'scale(1)',
                  transition: 'all .15s',
                }}
              >
                {selected === id ? '✓ Selected' : 'Choose This'}
              </button>
            </div>

            <div style={{ borderRadius: 20, overflow: 'hidden', cursor: 'pointer', border: selected === id ? `2px solid ${A}` : '2px solid transparent', transition: 'border .15s' }} onClick={() => setSelected(id)}>
              <Component />
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom CTA */}
      {selected && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 100 }}>
          <div style={{ fontSize: 15, color: '#fff' }}>
            <strong style={{ color: A }}>Option {selected}</strong> selected —{' '}
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>tell me which one and I'll build it.</span>
          </div>
        </div>
      )}
    </div>
  )
}
