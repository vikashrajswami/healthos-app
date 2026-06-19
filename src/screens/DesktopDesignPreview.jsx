import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const A = '#14b8a6'
const AD = '#0d9488'

// ── Shared mock data ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '📈', label: 'Trends' },
  { icon: '📋', label: 'Reports' },
  { icon: '⌚', label: 'Devices' },
  { icon: '⚡', label: 'Protocol' },
]

const BIOMARKERS = [
  { name: 'Vitamin D', val: '32 ng/mL', status: 'low', color: '#f59e0b' },
  { name: 'HbA1c', val: '5.4%', status: 'optimal', color: '#10b981' },
  { name: 'LDL', val: '112 mg/dL', status: 'borderline', color: '#f97316' },
  { name: 'TSH', val: '2.1 mIU/L', status: 'optimal', color: '#10b981' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 1 — Dark Sidebar + Card Grid (Classic Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════
function Design1() {
  const [active, setActive] = useState(0)
  return (
    <div style={{ display: 'flex', height: 560, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

      {/* Dark Sidebar */}
      <div style={{ width: 220, background: '#0f1e1e', display: 'flex', flexDirection: 'column', padding: '28px 0 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 32px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: A, opacity: 0.4 }}/>
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>AROGY<span style={{ color: A }}>OS</span></span>
        </div>

        {NAV_ITEMS.map((n, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 20px', border: 'none', cursor: 'pointer',
            background: active === i ? `${A}20` : 'none',
            borderLeft: active === i ? `3px solid ${A}` : '3px solid transparent',
            color: active === i ? A : 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: active === i ? 700 : 400,
          }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
          </button>
        ))}

        <div style={{ flex: 1 }}/>
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: `${A}15`, border: `1px solid ${A}30`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: A, fontWeight: 700, marginBottom: 4 }}>⭐ PLUS TRIAL</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>28 days remaining</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>V</div>
          <div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Vikash Kumar</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>BioAge: 28 yrs</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #eef1f6', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Good morning, Vikash 👋</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Thursday, 19 June 2026</div>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: 10, padding: '8px 16px', fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
            🔍 Search...
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${A}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔔</div>
        </div>

        {/* Content Grid */}
        <div style={{ flex: 1, padding: '24px 28px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hero row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', borderRadius: 16, padding: 20, color: '#fff', gridColumn: '1' }}>
              <div style={{ fontSize: 11, color: A, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>BIOLOGICAL AGE</div>
              <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>28</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Actual age: 32 · <span style={{ color: '#4ade80' }}>4 yrs younger</span></div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eef1f6' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>STREAK</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a' }}>14 🔥</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>days in a row</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eef1f6' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>REPORTS</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a' }}>7</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>lab reports uploaded</div>
            </div>
          </div>

          {/* Biomarkers */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eef1f6' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 14 }}>KEY BIOMARKERS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              {BIOMARKERS.map((b, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${b.color}` }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{b.val}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: b.color, marginTop: 3, textTransform: 'uppercase' }}>{b.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 2 — Top Navigation Bar (Modern SaaS)
// ═══════════════════════════════════════════════════════════════════════════════
function Design2() {
  const [active, setActive] = useState(0)
  return (
    <div style={{ height: 560, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'system-ui,sans-serif', background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}>

      {/* Top Nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eef1f6', padding: '0 32px', display: 'flex', alignItems: 'center', height: 60, gap: 32, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${A}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: A, opacity: 0.4 }}/>
          </div>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>AROGY<span style={{ color: A }}>OS</span></span>
        </div>

        {NAV_ITEMS.map((n, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: active === i ? 700 : 500,
            color: active === i ? A : '#64748b',
            borderBottom: active === i ? `2px solid ${A}` : '2px solid transparent',
            padding: '0 2px', height: 60, display: 'flex', alignItems: 'center',
          }}>
            {n.label}
          </button>
        ))}

        <div style={{ flex: 1 }}/>
        <div style={{ background: '#f1f5f9', borderRadius: 10, padding: '7px 14px', fontSize: 13, color: '#64748b' }}>🔍 Search</div>
        <div style={{ background: `linear-gradient(90deg,${A},${AD})`, borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 800, color: '#fff', cursor: 'pointer' }}>⭐ Plus</div>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>V</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, background: '#f8fafc', padding: '28px 40px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Health Dashboard</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Last updated: Today, 9:41 AM</div>
          </div>
          <button style={{ background: A, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Upload Report</button>
        </div>

        {/* Wide hero card */}
        <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#134e4a)', borderRadius: 20, padding: '24px 32px', color: '#fff', display: 'flex', alignItems: 'center', gap: 48 }}>
          <div>
            <div style={{ fontSize: 11, color: A, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>YOUR BIOLOGICAL AGE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>28</span>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>years</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Chronological: 32 · <span style={{ color: '#4ade80', fontWeight: 700 }}>4 years younger ↓</span></div>
          </div>
          <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.1)' }}/>
          <div style={{ display: 'flex', gap: 40 }}>
            {[['14 🔥', 'Day Streak'], ['7', 'Reports'], ['23', 'Biomarkers']].map(([v, l], i) => (
              <div key={i}>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eef1f6' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 12 }}>BIOMARKERS</div>
            {BIOMARKERS.slice(0, 3).map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ fontSize: 13, color: '#334155' }}>{b.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #eef1f6' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 12 }}>TODAY'S HABITS</div>
            {[['💧', 'Water intake', true], ['🏃', 'Exercise', true], ['😴', 'Sleep 8hrs', false], ['🥗', 'Clean diet', false]].map(([ic, l, done], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ fontSize: 14 }}>{ic}</span>
                <span style={{ flex: 1, fontSize: 13, color: '#334155' }}>{l}</span>
                <span style={{ fontSize: 16 }}>{done ? '✅' : '⬜'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 3 — Icon Sidebar + Data-Rich (Analytics Pro)
// ═══════════════════════════════════════════════════════════════════════════════
function Design3() {
  const [active, setActive] = useState(0)
  return (
    <div style={{ display: 'flex', height: 560, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

      {/* Icon-only sidebar */}
      <div style={{ width: 64, background: '#fff', borderRight: '1px solid #eef1f6', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 4, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, fontSize: 16, color: '#fff', fontWeight: 900 }}>A</div>
        {NAV_ITEMS.map((n, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: active === i ? `${A}15` : 'none',
            color: active === i ? A : '#94a3b8',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} title={n.label}>{n.icon}</button>
        ))}
        <div style={{ flex: 1 }}/>
        <button style={{ width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'none', fontSize: 18 }} title="Settings">⚙️</button>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>V</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top */}
        <div style={{ background: '#fff', borderBottom: '1px solid #eef1f6', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Health Overview</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Thursday, 19 June 2026</div>
          <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '7px 14px', fontSize: 12, color: '#64748b' }}>🔍 Search biomarkers...</div>
        </div>

        {/* Three column grid */}
        <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>

          {/* Left: BioAge + Biomarkers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', borderRadius: 16, padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: 24 }}>
              <div>
                <div style={{ fontSize: 10, color: A, fontWeight: 700, letterSpacing: 2 }}>BIOLOGICAL AGE</div>
                <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1 }}>28</div>
                <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>4 yrs younger than actual</div>
              </div>
              {/* Mini chart bars */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                {[40, 55, 45, 60, 50, 65, 52].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? A : `${A}40`, borderRadius: 4 }}/>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #eef1f6' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 12 }}>BIOMARKERS OVERVIEW</div>
              {BIOMARKERS.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }}/>
                  <span style={{ flex: 1, fontSize: 13, color: '#334155' }}>{b.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{b.val}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: b.color, background: `${b.color}15`, borderRadius: 6, padding: '2px 8px' }}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Habits + Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['🔥', '14', 'Day Streak'], ['📊', '7', 'Reports'], ['💊', '23', 'Biomarkers'], ['🎯', '92%', 'Score']].map(([ic, v, l], i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #eef1f6' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{ic}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{v}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #eef1f6', flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 12 }}>TODAY'S PROTOCOL</div>
              {[['💧', 'Water 2L', true], ['🏃', 'Walk 30 min', true], ['😴', 'Sleep 8hr', false], ['🧘', 'Meditation', false]].map(([ic, l, done], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none' }}>
                  <span style={{ fontSize: 14 }}>{ic}</span>
                  <span style={{ flex: 1, fontSize: 13, color: done ? '#334155' : '#94a3b8', textDecoration: done ? 'none' : 'none' }}>{l}</span>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: done ? A : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' }}>
                    {done ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 4 — Premium Minimal (Light + Elegant)
// ═══════════════════════════════════════════════════════════════════════════════
function Design4() {
  const [active, setActive] = useState(0)
  return (
    <div style={{ display: 'flex', height: 560, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'system-ui,sans-serif', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>

      {/* Clean minimal sidebar */}
      <div style={{ width: 200, background: '#fafafa', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', padding: '24px 16px 20px', gap: 2, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 28, paddingLeft: 12 }}>
          AROGY<span style={{ color: A }}>OS</span>
        </div>

        {NAV_ITEMS.map((n, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', border: 'none', borderRadius: 10, cursor: 'pointer',
            background: active === i ? '#fff' : 'none',
            boxShadow: active === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            color: active === i ? '#0f172a' : '#94a3b8',
            fontSize: 13, fontWeight: active === i ? 600 : 400,
          }}>
            <span style={{ fontSize: 15 }}>{n.icon}</span> {n.label}
          </button>
        ))}

        <div style={{ flex: 1 }}/>

        <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#134e4a)', borderRadius: 14, padding: '14px 14px' }}>
          <div style={{ fontSize: 10, color: A, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>BIO AGE</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>28</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>4 yrs younger ↓</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px 0' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>V</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Vikash Kumar</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>Plus member</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, background: '#fff', padding: '28px 36px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Good morning, Vikash</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Your health is trending positively this week.</div>
          </div>
          <button style={{ background: A, color: '#fff', border: 'none', borderRadius: 12, padding: '11px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px ${A}40` }}>
            + Upload Lab Report
          </button>
        </div>

        {/* Metric strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          {[['🔥', '14 days', 'Current streak', '#f97316'], ['📋', '7 reports', 'Uploaded', A], ['🧬', '23', 'Biomarkers tracked', '#8b5cf6'], ['📈', '+3 yrs', 'Improvement', '#10b981']].map(([ic, v, l, c], i) => (
            <div key={i} style={{ padding: '16px', border: '1px solid #f1f5f9', borderRadius: 14, borderTop: `3px solid ${c}` }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{ic}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{v}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Two panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 14 }}>BIOMARKERS</div>
            {BIOMARKERS.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: b.color }}/>
                  <span style={{ fontSize: 13, color: '#334155' }}>{b.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{b.val}</div>
                  <div style={{ fontSize: 10, color: b.color }}>{b.status}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginBottom: 14 }}>TODAY'S HABITS</div>
            {[['💧', 'Water 2L', true], ['🏃', 'Exercise', true], ['😴', 'Sleep 8hr', false], ['🥗', 'Clean diet', false]].map(([ic, l, done], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none' }}>
                <span style={{ fontSize: 16 }}>{ic}</span>
                <span style={{ flex: 1, fontSize: 13, color: '#334155' }}>{l}</span>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: done ? A : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>
                  {done ? '✓' : ''}
                </div>
              </div>
            ))}
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
  { id: 1, name: 'Dark Sidebar', desc: 'Dark teal sidebar · Card grid · Classic dashboard', component: Design1 },
  { id: 2, name: 'Top Navigation', desc: 'Full-width top nav · Wide hero · Modern SaaS', component: Design2 },
  { id: 3, name: 'Icon Sidebar', desc: 'Compact icon nav · Two-column analytics · Data-rich', component: Design3 },
  { id: 4, name: 'Premium Minimal', desc: 'Clean sidebar · Elegant spacing · Premium feel', component: Design4 },
]

export default function DesktopDesignPreview() {
  const nav = useNavigate()
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,sans-serif', padding: '40px 32px' }}>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto 40px' }}>
        <button onClick={() => nav('/home')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontWeight: 600, marginBottom: 16, padding: 0 }}>← Back</button>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Desktop Design Options</div>
        <div style={{ fontSize: 15, color: '#64748b' }}>Pick the layout you want for the desktop version of AROGYOS.</div>
      </div>

      {/* Design cards */}
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 48 }}>
        {DESIGNS.map(({ id, name, desc, component: Component }) => (
          <div key={id}>
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ background: '#0f172a', color: '#fff', borderRadius: 8, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>Option {id}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{name}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{desc}</div>
              </div>
              <button
                onClick={() => setSelected(id)}
                style={{
                  padding: '11px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: selected === id ? A : '#0f172a',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  boxShadow: selected === id ? `0 4px 20px ${A}50` : 'none',
                  transform: selected === id ? 'scale(1.04)' : 'scale(1)',
                  transition: 'all .15s',
                }}
              >
                {selected === id ? '✓ Selected' : 'Choose This'}
              </button>
            </div>

            {/* Preview */}
            <div style={{ borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelected(id)}>
              <Component />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      {selected && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #eef1f6', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 100 }}>
          <div style={{ fontSize: 15, color: '#0f172a' }}>
            <strong>Option {selected}</strong> selected — <span style={{ color: '#64748b' }}>tell me which one and I'll build it.</span>
          </div>
        </div>
      )}
    </div>
  )
}
