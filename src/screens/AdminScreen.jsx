import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const V = {
  bg: '#070c14', card: '#0f1923', card2: '#111827', border: '#1e2d3d',
  teal: '#14b8a6', blue: '#3b82f6', purple: '#a78bfa', red: '#ef4444',
  green: '#22c55e', yellow: '#eab308', orange: '#f97316',
  text: '#f1f5f9', sub: '#94a3b8', muted: '#475569',
}

const SESSION_KEY  = 'arogyos_admin_key'
const SESSION_USER = 'arogyos_admin_user'
const API = '/api/admin'
const BLOG_API = '/api/sync-profile?resource=blog'

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Stat({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 14, padding: '18px 20px', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: color || V.text, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: V.muted, marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: V.sub, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function Inp({ label, value, onChange, placeholder, multiline, rows = 3, type = 'text', style = {} }) {
  const base = { width: '100%', padding: '11px 14px', background: '#070c14', border: `1px solid ${V.border}`, borderRadius: 10, color: V.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: multiline ? 'vertical' : 'none', ...style }
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 10, fontWeight: 700, color: V.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      }
    </div>
  )
}

function Badge({ label, color = V.sub, bg }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, background: bg || color + '18', border: `1px solid ${color}30`, borderRadius: 20, padding: '2px 9px' }}>
      {label}
    </span>
  )
}

function Btn({ children, onClick, color = V.teal, outline, small, disabled, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: outline ? 'none' : color,
        border: `1px solid ${color}`,
        color: outline ? color : '#fff',
        borderRadius: 8, padding: small ? '6px 12px' : '9px 18px',
        fontSize: small ? 11 : 13, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit', opacity: disabled ? 0.5 : 1, ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── Mini bar chart ─────────────────────────────────────────────────────────────
function MiniBar({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48, marginTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} title={`${d.date}: ${d.count}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: '100%', background: V.teal, borderRadius: 3, height: Math.max(3, (d.count / max) * 44), opacity: 0.8 }} />
          <div style={{ fontSize: 8, color: V.muted }}>{d.date.slice(5)}</div>
        </div>
      ))}
    </div>
  )
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function OverviewTab({ auth }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}?action=overview&adminKey=${encodeURIComponent(auth.key)}&adminUser=${encodeURIComponent(auth.user)}`)
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [auth])

  if (loading) return <div style={{ color: V.sub, padding: 40, textAlign: 'center' }}>Loading…</div>
  if (!data)   return <div style={{ color: V.red, padding: 40, textAlign: 'center' }}>Failed to load overview.</div>

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: V.text, marginBottom: 20 }}>Platform Overview</div>

      {/* Top stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat icon="👥" label="Total Users"       value={data.totalUsers}   sub={`+${data.newWeek} this week`} />
        <Stat icon="🆕" label="New Today"         value={data.newToday}     color={V.teal} />
        <Stat icon="💳" label="Active Paid"        value={data.activeSubs}   color={V.green} />
        <Stat icon="⏳" label="Trialling"          value={data.trialSubs}    color={V.yellow} />
        <Stat icon="₹"  label="Est. Revenue"      value={`₹${data.revenue.toLocaleString('en-IN')}`} color={V.purple} sub="active subs only" />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <Stat icon="🧪" label="Lab Reports"       value={data.totalReports} />
        <Stat icon="🔔" label="Push Subscribers"  value={data.pushSubs} />
        <Stat icon="📝" label="Published Posts"   value={data.pubPosts} />
        <Stat icon="👁" label="Total Blog Views"  value={data.totalViews?.toLocaleString()} />
      </div>

      {/* Signup trend */}
      {data.signupTrend?.length > 0 && (
        <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 14, padding: 20, maxWidth: 460 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Signups — Last 7 Days</div>
          <MiniBar data={data.signupTrend} />
        </div>
      )}
    </div>
  )
}

// ── USERS TAB ────────────────────────────────────────────────────────────────
function UsersTab({ auth }) {
  const [users, setUsers]     = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(0)
  const [search, setSearch]   = useState('')
  const [plan, setPlan]       = useState('')
  const [loading, setLoading] = useState(false)
  const [acting, setActing]   = useState(null)
  const timer = useRef(null)

  const load = useCallback((p = 0, s = search, pl = plan) => {
    setLoading(true)
    const q = new URLSearchParams({ action: 'users', adminKey: auth.key, adminUser: auth.user, page: p, search: s, plan: pl })
    fetch(`${API}?${q}`).then(r => r.json()).then(d => {
      setUsers(d.users || [])
      setTotal(d.total || 0)
    }).catch(console.error).finally(() => setLoading(false))
  }, [auth, search, plan])

  useEffect(() => { load(0) }, [auth])

  function onSearch(v) {
    setSearch(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { setPage(0); load(0, v, plan) }, 400)
  }

  async function toggleDelete(uid, isDeleted) {
    setActing(uid)
    await fetch(API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isDeleted ? 'restore_user' : 'delete_user', adminKey: auth.key, adminUser: auth.user, uid }),
    })
    setActing(null)
    load(page)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: V.text, flex: 1 }}>Users <span style={{ fontSize: 13, fontWeight: 500, color: V.sub }}>({total})</span></div>
        <input
          value={search} onChange={e => onSearch(e.target.value)}
          placeholder="Search name, phone, email…"
          style={{ padding: '8px 14px', background: V.card, border: `1px solid ${V.border}`, borderRadius: 8, color: V.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 220 }}
        />
        <select value={plan} onChange={e => { setPlan(e.target.value); setPage(0); load(0, search, e.target.value) }}
          style={{ padding: '8px 12px', background: V.card, border: `1px solid ${V.border}`, borderRadius: 8, color: V.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
          <option value="">All plans</option>
          <option value="paid">Paid</option>
          <option value="trial">Trial</option>
          <option value="free">Free</option>
        </select>
      </div>

      {loading && <div style={{ color: V.sub, padding: 20 }}>Loading…</div>}

      {!loading && users.length === 0 && (
        <div style={{ color: V.muted, padding: '40px 0', textAlign: 'center' }}>No users found.</div>
      )}

      {users.map(u => {
        const sub = u.subscription
        const isDeleted = !!u.deleted_at
        return (
          <div key={u.uid} style={{ background: isDeleted ? '#0d0a0a' : V.card, border: `1px solid ${isDeleted ? V.red + '30' : V.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, opacity: isDeleted ? 0.6 : 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: V.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
              {(u.name || '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: V.text }}>{u.name || 'Unnamed'}</span>
                {sub?.status === 'active'   && <Badge label="PAID"    color={V.green}  />}
                {sub?.status === 'trialing' && <Badge label="TRIAL"   color={V.yellow} />}
                {!sub                       && <Badge label="FREE"    color={V.muted}  />}
                {isDeleted                  && <Badge label="DELETED" color={V.red}    />}
                {u.quiz_done                && <Badge label="QUIZ ✓"  color={V.teal}   />}
              </div>
              <div style={{ fontSize: 11, color: V.sub }}>
                {u.phone || '—'} {u.email ? `· ${u.email}` : ''} · lang: {u.lang || 'en'} · bioage: {u.bioage || '—'}
              </div>
              {sub && (
                <div style={{ fontSize: 10, color: V.muted, marginTop: 2 }}>
                  {sub.billing_cycle} · {sub.region} · expires {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'}
                </div>
              )}
            </div>
            <div style={{ fontSize: 10, color: V.muted, textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
              {u.updated_at ? new Date(u.updated_at).toLocaleDateString() : '—'}
            </div>
            <Btn
              small outline
              color={isDeleted ? V.green : V.red}
              onClick={() => toggleDelete(u.uid, isDeleted)}
              disabled={acting === u.uid}
            >
              {acting === u.uid ? '…' : isDeleted ? 'Restore' : 'Delete'}
            </Btn>
          </div>
        )
      })}

      {/* Pagination */}
      {total > 50 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <Btn small outline disabled={page === 0} onClick={() => { const p = page - 1; setPage(p); load(p) }}>← Prev</Btn>
          <span style={{ fontSize: 12, color: V.sub }}>Page {page + 1} of {Math.ceil(total / 50)}</span>
          <Btn small outline disabled={(page + 1) * 50 >= total} onClick={() => { const p = page + 1; setPage(p); load(p) }}>Next →</Btn>
        </div>
      )}
    </div>
  )
}

// ── SUBSCRIPTIONS TAB ────────────────────────────────────────────────────────
function SubscriptionsTab({ auth }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}?action=subscriptions&adminKey=${encodeURIComponent(auth.key)}&adminUser=${encodeURIComponent(auth.user)}`)
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [auth])

  if (loading) return <div style={{ color: V.sub, padding: 40, textAlign: 'center' }}>Loading…</div>

  const subs = data?.subscriptions || []
  const STATUS_COLOR = { active: V.green, trialing: V.yellow, superseded: V.muted, expired: V.red }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat icon="✅" label="Active Paid"  value={data?.activeSubs}    color={V.green} />
        <Stat icon="⏳" label="Trialling"    value={data?.trialSubs}     color={V.yellow} />
        <Stat icon="₹"  label="Est. Revenue" value={`₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`} color={V.purple} sub="active only" />
        <Stat icon="🗂" label="Total Records" value={subs.length} />
      </div>

      <div style={{ fontSize: 16, fontWeight: 800, color: V.text, marginBottom: 14 }}>All Subscriptions</div>

      {subs.length === 0 && <div style={{ color: V.muted, padding: '40px 0', textAlign: 'center' }}>No subscriptions yet.</div>}

      {subs.map((s, i) => (
        <div key={i} style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: V.text }}>{s.user?.name || 'Unknown'}</span>
              <Badge label={s.status?.toUpperCase()} color={STATUS_COLOR[s.status] || V.sub} />
              <Badge label={s.billing_cycle || '—'} color={V.blue} />
              <Badge label={s.region || '—'} color={V.purple} />
            </div>
            <div style={{ fontSize: 11, color: V.sub }}>
              {s.user?.phone || s.uid?.slice(0, 12) + '…'} · expires {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}
              {s.razorpay_payment_id ? ` · ${s.razorpay_payment_id.slice(0, 14)}…` : ''}
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: s.status === 'active' ? V.green : V.muted, flexShrink: 0 }}>
            {s.status === 'active' ? `₹${s.estimated_revenue}` : '—'}
          </div>
          <div style={{ fontSize: 10, color: V.muted, flexShrink: 0 }}>
            {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── PUSH NOTIFICATIONS TAB ────────────────────────────────────────────────────
function PushTab({ auth }) {
  const [title, setTitle]     = useState('')
  const [msg, setMsg]         = useState('')
  const [url, setUrl]         = useState('/')
  const [sending, setSending] = useState(false)
  const [result, setResult]   = useState(null)
  const [count, setCount]     = useState(null)

  useEffect(() => {
    fetch(`${API}?action=push_count&adminKey=${encodeURIComponent(auth.key)}&adminUser=${encodeURIComponent(auth.user)}`)
      .then(r => r.json()).then(d => setCount(d.count)).catch(() => {})
  }, [auth])

  async function sendPush() {
    if (!title.trim() || !msg.trim()) return
    setSending(true); setResult(null)
    try {
      const r = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_push', adminKey: auth.key, adminUser: auth.user, title: title.trim(), body: msg.trim(), url }),
      })
      const d = await r.json()
      if (d.error) setResult({ ok: false, msg: d.error })
      else setResult({ ok: true, msg: `Sent to ${d.sent} devices · ${d.failed} failed` })
    } catch (e) {
      setResult({ ok: false, msg: e.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: V.text, marginBottom: 4 }}>Push Notifications</div>
      <div style={{ fontSize: 12, color: V.sub, marginBottom: 20 }}>
        {count !== null ? <><span style={{ color: V.teal, fontWeight: 700 }}>{count}</span> devices subscribed</> : 'Loading…'}
      </div>

      <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 14, padding: 24, maxWidth: 520 }}>
        <Inp label="Notification Title *" value={title} onChange={setTitle} placeholder="e.g. New feature: Morning Briefing" />
        <Inp label="Message *" value={msg} onChange={setMsg} placeholder="What do you want to tell your users?" multiline rows={3} />
        <Inp label="URL (where to go on tap)" value={url} onChange={setUrl} placeholder="/" />

        {result && (
          <div style={{ background: result.ok ? '#0a1a12' : '#1a0a0a', border: `1px solid ${result.ok ? V.green : V.red}`, color: result.ok ? V.green : V.red, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
            {result.msg}
          </div>
        )}

        <Btn onClick={sendPush} disabled={sending || !title.trim() || !msg.trim()}>
          {sending ? 'Sending…' : `Send to All ${count !== null ? `(${count})` : ''} →`}
        </Btn>
        <div style={{ fontSize: 10, color: V.muted, marginTop: 10 }}>
          Requires VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables to be set in Vercel.
        </div>
      </div>
    </div>
  )
}

// ── FEATURE FLAGS TAB ─────────────────────────────────────────────────────────
function FlagsTab({ auth }) {
  const [flags, setFlags]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [tableExists, setExists]  = useState(true)
  const [toggling, setToggling]   = useState(null)

  function load() {
    setLoading(true)
    fetch(`${API}?action=flags&adminKey=${encodeURIComponent(auth.key)}&adminUser=${encodeURIComponent(auth.user)}`)
      .then(r => r.json()).then(d => { setFlags(d.flags || []); setExists(d.tableExists !== false) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [auth])

  async function toggle(key, current) {
    setToggling(key)
    await fetch(API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_flag', adminKey: auth.key, adminUser: auth.user, key, value: !current }),
    })
    setToggling(null)
    load()
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: V.text, marginBottom: 4 }}>Feature Flags</div>
      <div style={{ fontSize: 12, color: V.sub, marginBottom: 20 }}>Toggle features on/off without redeploying.</div>

      {!tableExists && (
        <div style={{ background: '#1a0f00', border: `1px solid ${V.yellow}40`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: V.yellow }}>
          ⚠️ The <code>feature_flags</code> table doesn't exist yet in Supabase. Run this SQL first:
          <pre style={{ marginTop: 8, background: '#070c14', padding: 10, borderRadius: 6, fontSize: 11, color: V.sub, overflowX: 'auto' }}>
{`CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  value BOOLEAN DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);`}
          </pre>
        </div>
      )}

      {loading && <div style={{ color: V.sub, padding: 20 }}>Loading…</div>}

      {flags.map(f => (
        <div key={f.key} style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: V.text, marginBottom: 3 }}>
              <code style={{ background: V.border, padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>{f.key}</code>
            </div>
            <div style={{ fontSize: 11, color: V.sub }}>{f.description}</div>
          </div>
          <div
            onClick={() => !toggling && toggle(f.key, f.value)}
            style={{
              width: 44, height: 24, borderRadius: 12, cursor: toggling ? 'default' : 'pointer',
              background: f.value ? V.teal : V.muted, position: 'relative', transition: 'background .2s', flexShrink: 0,
              opacity: toggling === f.key ? 0.5 : 1,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: f.value ? 22 : 3, width: 18, height: 18,
              borderRadius: '50%', background: '#fff', transition: 'left .2s',
            }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: f.value ? V.teal : V.muted, width: 30, flexShrink: 0 }}>
            {f.value ? 'ON' : 'OFF'}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── BLOG TAB ──────────────────────────────────────────────────────────────────
const BLOG_EMPTY = { title: '', slug: '', excerpt: '', content: '', cover_image: '', category: 'Health', tags: '', author: 'AROGYOS Team', published: false, og_title: '', og_description: '', og_image: '', keywords: '' }
const CATS = ['Health', 'Longevity', 'Nutrition', 'Exercise', 'Mental Health', 'Research', 'Product']

function FocusKWAnalyzer({ kw, title, slug, excerpt, content, ogTitle }) {
  if (!kw.trim()) return <div style={{ fontSize: 11, color: V.muted, background: '#070c14', borderRadius: 8, padding: '9px 12px', marginBottom: 12 }}>Enter your focus keyword to see live SEO analysis.</div>
  const k = kw.trim().toLowerCase(), slugK = k.replace(/\s+/g, '-')
  const intro = content.slice(0, 250), words = content.trim().split(/\s+/).filter(Boolean)
  const regex = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  const matches = (content.match(regex) || []).length
  const density = words.length > 0 ? (matches / words.length) * 100 : 0
  const densityOk = density >= 0.5 && density <= 2.5
  const checks = [
    { label: 'Keyword in title',              pass: title.toLowerCase().includes(k) },
    { label: 'Keyword in slug',               pass: slug.toLowerCase().includes(slugK) },
    { label: 'Keyword in excerpt',            pass: excerpt.toLowerCase().includes(k) },
    { label: 'Keyword in intro (first 250)',  pass: intro.toLowerCase().includes(k) },
    { label: 'Keyword in OG title',           pass: (ogTitle || title).toLowerCase().includes(k) },
    { label: `Density ${density.toFixed(1)}% (ideal 0.5–2.5%)`, pass: densityOk },
  ]
  const score = Math.round((checks.filter(c => c.pass).length / checks.length) * 100)
  const grade = score >= 80 ? { label: 'Strong', color: V.green } : score >= 50 ? { label: 'Average', color: V.yellow } : { label: 'Needs Work', color: V.red }
  return (
    <div style={{ background: '#070c14', border: `1px solid ${grade.color}30`, borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: V.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Keyword Analysis</div>
        <div style={{ fontSize: 11, fontWeight: 900, color: grade.color }}>{grade.label} · {score}%</div>
      </div>
      {checks.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, fontSize: 11, color: c.pass ? V.sub : V.muted }}>
          <span style={{ flexShrink: 0 }}>{c.pass ? '✅' : '❌'}</span>{c.label}
        </div>
      ))}
    </div>
  )
}

function BlogTab({ auth }) {
  const nav = useNavigate()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView]       = useState('list')
  const [form, setForm]       = useState(BLOG_EMPTY)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [deleting, setDeleting] = useState(null)
  const [preview, setPreview] = useState(false)
  const f = k => v => setForm(p => ({ ...p, [k]: v }))

  const loadPosts = useCallback(() => {
    setLoading(true)
    fetch(`${BLOG_API}&admin=${encodeURIComponent(auth.key)}&user=${encodeURIComponent(auth.user)}`)
      .then(r => r.json()).then(d => setPosts(d.posts || [])).catch(console.error).finally(() => setLoading(false))
  }, [auth])

  useEffect(loadPosts, [loadPosts])

  async function savePost(action) {
    if (!form.title.trim()) return setMsg('Title is required')
    if (!form.slug.trim())  return setMsg('Slug is required')
    setSaving(true); setMsg('')
    const payload = { action, adminKey: auth.key, adminUser: auth.user, ...form, id: form.id, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      const d = await fetch(BLOG_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(r => r.json())
      if (d.error) { setMsg('Error: ' + d.error); return }
      setMsg(action === 'create' ? 'Post created!' : 'Saved!')
      loadPosts()
      setTimeout(() => setView('list'), 700)
    } catch { setMsg('Network error') } finally { setSaving(false) }
  }

  async function deletePost(id) {
    if (deleting !== id) { setDeleting(id); return }
    await fetch(BLOG_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', adminKey: auth.key, adminUser: auth.user, id }) })
    setDeleting(null); loadPosts()
  }

  if (view === 'list') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: V.text, flex: 1 }}>Blog Posts</div>
        <Btn small onClick={() => nav('/blog')} outline>Public Blog ↗</Btn>
        <Btn small onClick={() => { setForm(BLOG_EMPTY); setMsg(''); setView('new') }}>+ New Post</Btn>
      </div>
      {loading && <div style={{ color: V.sub, padding: 20 }}>Loading…</div>}
      {!loading && posts.length === 0 && <div style={{ color: V.muted, padding: '40px 0', textAlign: 'center' }}>No posts yet.</div>}
      {posts.map(p => (
        <div key={p.id} style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
              <Badge label={p.published ? 'Published' : 'Draft'} color={p.published ? V.green : V.yellow} />
              <span style={{ fontSize: 11, color: V.muted }}>{p.category}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: V.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
            <div style={{ fontSize: 11, color: V.muted, marginTop: 2 }}>/blog/{p.slug} · {p.views || 0} views · {new Date(p.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {p.published && <Btn small outline onClick={() => nav(`/blog/${p.slug}`)}>View</Btn>}
            <Btn small outline color={V.teal} onClick={() => { setForm({ ...p, tags: (p.tags || []).join(', ') }); setMsg(''); setView('edit') }}>Edit</Btn>
            <Btn small outline color={V.red} onClick={() => deletePost(p.id)}>{deleting === p.id ? 'Confirm?' : '×'}</Btn>
          </div>
        </div>
      ))}
    </div>
  )

  const isNew = view === 'new'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: V.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>← Posts</button>
        <div style={{ fontSize: 16, fontWeight: 800, color: V.text, flex: 1 }}>{isNew ? 'New Post' : 'Edit Post'}</div>
        <Btn small outline onClick={() => setPreview(p => !p)}>{preview ? 'Edit' : 'Preview'}</Btn>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.published} onChange={e => f('published')(e.target.checked)} style={{ width: 15, height: 15, accentColor: V.teal }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: form.published ? V.green : V.sub }}>Published</span>
        </label>
        <Btn small onClick={() => savePost(isNew ? 'create' : 'update')} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
      </div>
      {msg && <div style={{ background: msg.startsWith('Error') ? '#1a0a0a' : '#0a1a12', border: `1px solid ${msg.startsWith('Error') ? V.red : V.green}`, color: msg.startsWith('Error') ? V.red : V.green, padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{msg}</div>}
      {preview ? (
        <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 14, padding: '28px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: V.teal, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{form.category}</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: V.text, margin: '0 0 16px', lineHeight: 1.25 }}>{form.title || 'Untitled'}</h1>
          {form.excerpt && <p style={{ fontSize: 15, color: V.sub, borderLeft: `3px solid ${V.teal}`, paddingLeft: 14, marginBottom: 24 }}>{form.excerpt}</p>}
          <div style={{ fontSize: 15, color: V.sub, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: form.content.split('\n\n').map(b => b.startsWith('## ') ? `<h2 style="font-size:20px;font-weight:800;color:#f1f5f9;margin:20px 0 10px">${b.slice(3)}</h2>` : b.startsWith('### ') ? `<h3 style="font-size:16px;font-weight:700;color:#14b8a6;margin:16px 0 8px">${b.slice(4)}</h3>` : `<p style="margin:0 0 16px">${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>')}</p>`).join('') }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 20 }}>
          <div>
            <Inp label="Title *" value={form.title} onChange={v => { f('title')(v); if (isNew && !form.slug) f('slug')(slugify(v)) }} placeholder="Your article title…" />
            <Inp label="Slug *" value={form.slug} onChange={f('slug')} placeholder="url-friendly-slug" />
            <Inp label="Excerpt" value={form.excerpt} onChange={f('excerpt')} placeholder="One-paragraph summary…" multiline rows={3} />
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: V.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Content (Markdown)</div>
              <textarea value={form.content} onChange={e => f('content')(e.target.value)} rows={22} placeholder={'Write here...\n\n## Heading\n\n**bold** *italic* - list'} style={{ width: '100%', padding: '12px 14px', background: '#070c14', border: `1px solid ${V.border}`, borderRadius: 10, color: V.text, fontSize: 13, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7 }} />
            </div>
          </div>
          <div>
            <Inp label="Cover Image URL" value={form.cover_image} onChange={f('cover_image')} placeholder="https://…" />
            {form.cover_image && <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', height: 110, background: V.border }}><img src={form.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /></div>}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: V.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</div>
              <select value={form.category} onChange={e => f('category')(e.target.value)} style={{ width: '100%', padding: '11px 14px', background: '#070c14', border: `1px solid ${V.border}`, borderRadius: 10, color: V.text, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Inp label="Tags (comma separated)" value={form.tags} onChange={f('tags')} placeholder="longevity, supplements" />
            <Inp label="Author" value={form.author} onChange={f('author')} />
            <div style={{ background: '#070c14', border: `1px solid ${V.border}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: V.teal, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>🔍 SEO</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: V.text, marginBottom: 5 }}>Focus Keyword</div>
              <input value={form.keywords} onChange={e => f('keywords')(e.target.value)} placeholder="e.g. biological age test" style={{ width: '100%', padding: '9px 12px', background: '#0a1020', border: `2px solid ${form.keywords.trim() ? V.teal : V.border}`, borderRadius: 8, color: V.text, fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
              <FocusKWAnalyzer kw={form.keywords} title={form.title} slug={form.slug} excerpt={form.excerpt} content={form.content} ogTitle={form.og_title} />
              <Inp label="OG Title" value={form.og_title} onChange={f('og_title')} placeholder={form.title || 'Defaults to title'} style={{ fontSize: 12 }} />
              <Inp label="OG Description" value={form.og_description} onChange={f('og_description')} placeholder={form.excerpt || 'Defaults to excerpt'} multiline rows={2} style={{ fontSize: 12 }} />
              <Inp label="OG Image URL" value={form.og_image} onChange={f('og_image')} placeholder={form.cover_image || 'Defaults to cover'} style={{ fontSize: 12 }} />
              <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', marginTop: 4 }}>
                <div style={{ fontSize: 12, color: '#1558d6', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.og_title || form.title || 'Post Title'} — AROGYOS</div>
                <div style={{ fontSize: 11, color: '#006621' }}>arogyos.com › blog › {form.slug || 'slug'}</div>
                <div style={{ fontSize: 11, color: '#4d5156', lineHeight: 1.5, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', display: '-webkit-box', overflow: 'hidden' }}>{form.og_description || form.excerpt || 'Meta description'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN ADMIN SCREEN ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: '📊 Overview' },
  { id: 'users',     label: '👥 Users' },
  { id: 'subs',      label: '💳 Subscriptions' },
  { id: 'blog',      label: '📝 Blog' },
  { id: 'push',      label: '🔔 Push' },
  { id: 'flags',     label: '🚩 Flags' },
]

export default function AdminScreen() {
  const [user,   setUser]   = useState(() => sessionStorage.getItem(SESSION_USER) || '')
  const [key,    setKey]    = useState(() => sessionStorage.getItem(SESSION_KEY)  || '')
  const [authed, setAuthed] = useState(false)
  const [authErr, setAuthErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('overview')

  useEffect(() => { document.title = 'Admin — AROGYOS' }, [])

  function handleAuth(e) {
    e.preventDefault()
    if (!user.trim() || !key.trim()) return
    setAuthErr(''); setLoading(true)
    fetch(`${API}?action=overview&adminKey=${encodeURIComponent(key.trim())}&adminUser=${encodeURIComponent(user.trim())}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setAuthErr('Invalid credentials'); setLoading(false); return }
        sessionStorage.setItem(SESSION_KEY, key.trim())
        sessionStorage.setItem(SESSION_USER, user.trim())
        setAuthed(true); setLoading(false)
      })
      .catch(() => { setAuthErr('Network error'); setLoading(false) })
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_USER)
    setKey(''); setUser(''); setAuthed(false)
  }

  const auth = { key, user }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: V.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 18, padding: '36px 28px', width: '100%', maxWidth: 360 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: V.teal, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>AROGYOS</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: V.text, marginBottom: 4 }}>Admin Panel</div>
          <div style={{ fontSize: 12, color: V.muted, marginBottom: 24 }}>Sign in to manage the platform.</div>
          <form onSubmit={handleAuth}>
            <div style={{ fontSize: 10, fontWeight: 700, color: V.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Username</div>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="Username" autoComplete="username" style={{ width: '100%', padding: '12px 14px', background: '#070c14', border: `1px solid ${V.border}`, borderRadius: 10, color: V.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: V.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</div>
            <input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="Password" autoComplete="current-password" style={{ width: '100%', padding: '12px 14px', background: '#070c14', border: `1px solid ${V.border}`, borderRadius: 10, color: V.text, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
            {authErr && <div style={{ color: V.red, fontSize: 13, marginBottom: 10 }}>{authErr}</div>}
            <button type="submit" disabled={loading || !user.trim() || !key.trim()} style={{ width: '100%', padding: 12, background: V.teal, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: (!user.trim() || !key.trim()) ? 0.5 : 1 }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Main panel ─────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: V.bg, minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 200, flexShrink: 0, background: V.card, borderRight: `1px solid ${V.border}`, padding: '24px 12px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: V.teal, letterSpacing: '-0.02em', marginBottom: 28, paddingLeft: 8 }}>AROGYOS Admin</div>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ textAlign: 'left', padding: '10px 12px', background: tab === t.id ? V.teal + '18' : 'none', border: 'none', borderRadius: 8, color: tab === t.id ? V.teal : V.sub, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 2, borderLeft: `3px solid ${tab === t.id ? V.teal : 'transparent'}` }}>
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={handleLogout} style={{ padding: '9px 12px', background: 'none', border: `1px solid ${V.red}30`, borderRadius: 8, color: V.red, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginTop: 16 }}>
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', minWidth: 0 }}>
        {tab === 'overview' && <OverviewTab auth={auth} />}
        {tab === 'users'    && <UsersTab    auth={auth} />}
        {tab === 'subs'     && <SubscriptionsTab auth={auth} />}
        {tab === 'blog'     && <BlogTab     auth={auth} />}
        {tab === 'push'     && <PushTab     auth={auth} />}
        {tab === 'flags'    && <FlagsTab    auth={auth} />}
      </div>
    </div>
  )
}
