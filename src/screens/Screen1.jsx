import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAIResponse } from '../lib/healthAI'

const INSIGHT_TEXT = 'Your hsCRP (inflammation) is improving, but LDL is still high. Sleep consistency is your highest-leverage habit this month.'

const QUICK_QUESTIONS = [
  { emoji: '🔬', text: 'What does my BioAge score mean?' },
  { emoji: '📄', text: 'How do I upload a lab report?' },
  { emoji: '🥗', text: 'Which diet plan is best for me?' },
  { emoji: '🔥', text: 'What does high LDL or hsCRP mean?' },
  { emoji: '👨‍👩‍👧', text: 'How does the family tracker work?' },
  { emoji: '💊', text: 'What supplements should I take?' },
  { emoji: '😴', text: 'How does sleep affect biological age?' },
  { emoji: '⌚', text: 'How do I connect my device?' },
]

function buildUserContext(bioage, actualAge, insight, dietPref) {
  const lines = []
  if (bioage)     lines.push(`User's current BioAge: ${bioage}`)
  if (actualAge)  lines.push(`User's actual calendar age: ${actualAge}`)
  if (insight)    lines.push(`Current AI insight shown: "${insight}"`)
  if (dietPref)   lines.push(`User's selected diet type: ${dietPref}`)
  lines.push(`App version: HealthOS web app`)
  return lines.join('\n')
}

/* ── AI Chat Modal ── */
function AIChatModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm HealthOS AI 🧬\n\nI know everything about this app — biomarkers, diet plans, how to upload reports, the family tracker, protocols, supplement advice, and all the science behind biological age reversal.\n\nWhat would you like to know?`,
    },
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showAll,  setShowAll]  = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')

    const nextMessages = [...messages, { role: 'user', content: userText }]
    setMessages(nextMessages)
    setLoading(true)

    // Simulate a brief thinking delay so it feels natural
    await new Promise(r => setTimeout(r, 480))

    const reply = getAIResponse(userText)
    setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const visibleQs = showAll ? QUICK_QUESTIONS : QUICK_QUESTIONS.slice(0, 4)

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-sheet" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">🧬</div>
            <div>
              <div className="chat-title">HealthOS AI</div>
              <div className="chat-status">● Online · Built-in AI · Always free</div>
            </div>
          </div>
          <button className="chat-close" onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble-wrap ${m.role}`}>
              {m.role === 'assistant' && <div className="chat-ai-icon">🧬</div>}
              <div className={`chat-bubble ${m.role}`}>
                {m.content.split('\n').map((line, j) => (
                  <span key={j}>
                    {line.startsWith('*') && line.endsWith('*')
                      ? <em style={{ fontStyle: 'italic', color: '#4a5568' }}>{line.slice(1, -1)}</em>
                      : line}
                    {j < m.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-wrap assistant">
              <div className="chat-ai-icon">🧬</div>
              <div className="chat-bubble assistant chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick questions (only show at start) */}
        {messages.length === 1 && !loading && (
          <div className="chat-quick-list">
            {visibleQs.map(q => (
              <button key={q.text} className="chat-quick-btn" onClick={() => sendMessage(q.text)}>
                <span className="cqb-emoji">{q.emoji}</span> {q.text}
              </button>
            ))}
            {!showAll && (
              <button className="chat-quick-more" onClick={() => setShowAll(true)}>
                More questions ↓
              </button>
            )}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-row">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask anything about your health…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className="chat-send-btn"
            disabled={!input.trim() || loading}
            onClick={() => sendMessage()}
          >
            ↑
          </button>
        </div>
        <div className="chat-disclaimer">AI guidance only · Not a substitute for medical advice</div>
      </div>
    </div>
  )
}

/* ── Constants ── */
const AVATAR_COLORS = ['#14b8a6','#6366f1','#e0b341','#ec4899','#10b981','#e08c3b','#3b82f6']

const RELATIONS = [
  { id: 'mom',      emoji: '👩',  label: 'Mom'      },
  { id: 'dad',      emoji: '👨',  label: 'Dad'      },
  { id: 'spouse',   emoji: '💑',  label: 'Spouse'   },
  { id: 'son',      emoji: '👦',  label: 'Son'      },
  { id: 'daughter', emoji: '👧',  label: 'Daughter' },
  { id: 'grandpa',  emoji: '👴',  label: 'Grandpa'  },
  { id: 'grandma',  emoji: '👵',  label: 'Grandma'  },
  { id: 'brother',  emoji: '🧑',  label: 'Brother'  },
  { id: 'sister',   emoji: '👩‍🦱', label: 'Sister'   },
  { id: 'friend',   emoji: '🤝',  label: 'Friend'   },
]

function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function statusOf(delta) {
  if (delta <= -3) return { label: '🌟 Thriving',          color: '#0d9488', bg: '#e6f7f5' }
  if (delta <= 0)  return { label: '✅ On track',           color: '#16a34a', bg: '#dcf5ec' }
  if (delta <= 3)  return { label: '💛 Needs some care',   color: '#d97706', bg: '#fef3c7' }
  return             { label: '⚠️ Needs attention',         color: '#dc2626', bg: '#fee2e2' }
}

function familyInsight(members) {
  if (!members.length) return null
  const avgActual = members.reduce((s, m) => s + (m.actual_age ?? m.actual ?? 0), 0) / members.length
  const avgBio    = members.reduce((s, m) => s + (m.bioage ?? 0), 0) / members.length
  const diff      = Math.round(avgActual - avgBio)
  if (diff > 0) return `Your family is ${diff} yr${diff > 1 ? 's' : ''} younger than their actual age — together you're defying time 💚`
  if (diff < 0) return `Your family's average BioAge is ${Math.abs(diff)} yr${Math.abs(diff) > 1 ? 's' : ''} older than actual. Small daily habits can turn this around.`
  return "Your family is ageing right on track — keep building healthy habits together."
}

/* ── getUserId: stable UUID stored in localStorage ── */
function getUserId() {
  let uid = localStorage.getItem('healthos_uid')
  if (!uid) {
    uid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('healthos_uid', uid)
  }
  return uid
}

function getUserName() {
  return localStorage.getItem('healthos_username') || 'You'
}

/* ── Invite Modal ── */
function InviteModal({ onClose, userId, userName }) {
  const [relation, setRelation] = useState(null)
  const [phone,    setPhone]    = useState('')
  const [step,     setStep]     = useState(1)   // 1=pick relation, 2=phone, 3=sent
  const [code,     setCode]     = useState('')
  const [link,     setLink]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [err,      setErr]      = useState('')

  const rel = RELATIONS.find(r => r.id === relation)

  async function createInvite() {
    setSending(true)
    setErr('')
    try {
      const res  = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviterId:   userId,
          inviterName: userName,
          phone:       phone.trim(),
          relation:    rel?.label || 'Family',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setCode(data.code)
      setLink(data.inviteUrl)
      setStep(3)
    } catch (e) {
      setErr('Could not create invite. Check your connection and try again.')
    }
    setSending(false)
  }

  function openWhatsApp() {
    const msg = encodeURIComponent(
      `👋 ${userName} wants to track your Biological Age together on HealthOS!\n\n` +
      `HealthOS tracks how old your body *actually* is — not just your birth year.\n\n` +
      `Click to find your BioAge & join ${userName}'s family tracker:\n${link}\n\n` +
      `Takes 2 minutes. Free, no app download needed. 🧬`
    )
    const url = phone.trim()
      ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`
      : `https://wa.me/?text=${msg}`
    window.open(url, '_blank')
  }

  function copyLink() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fm-overlay" onClick={onClose}>
      <div className="fm-modal" onClick={e => e.stopPropagation()}>
        <button className="fm-close-x" onClick={onClose}>✕</button>

        {step === 1 && <>
          <div className="fm-heading">Invite a family member 💌</div>
          <div className="fm-sub">Who would you like to track BioAge with?</div>
          <div className="rel-grid">
            {RELATIONS.map(r => (
              <button
                key={r.id}
                className={`rel-chip ${relation === r.id ? 'active' : ''}`}
                onClick={() => setRelation(r.id)}
              >
                <span className="rel-emoji">{r.emoji}</span>
                <span className="rel-label">{r.label}</span>
              </button>
            ))}
          </div>
          <button
            className="fm-submit"
            disabled={!relation}
            onClick={() => setStep(2)}
          >
            Continue →
          </button>
        </>}

        {step === 2 && <>
          <div className="fm-heading">Send invite to {rel?.label} {rel?.emoji}</div>
          <div className="fm-sub">Enter their phone number to send via WhatsApp, or skip to get a link</div>
          <div className="invite-phone-wrap">
            <span className="invite-phone-icon">📱</span>
            <input
              className="invite-phone-input"
              type="tel"
              placeholder="+91 98765 43210 (optional)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoFocus
            />
          </div>
          {err && <div className="invite-err">{err}</div>}
          <button
            className="fm-submit"
            disabled={sending}
            onClick={createInvite}
          >
            {sending ? 'Creating invite…' : 'Generate Invite Link →'}
          </button>
          <button className="fm-back" onClick={() => setStep(1)}>← Back</button>
        </>}

        {step === 3 && <>
          <div className="invite-success-icon">🎉</div>
          <div className="fm-heading">Invite ready!</div>
          <div className="fm-sub">Share this link with {rel?.label || 'your family member'}</div>

          <div className="invite-link-box">
            <div className="invite-link-text">{link}</div>
          </div>

          <button className="fm-submit invite-wa-btn" onClick={openWhatsApp}>
            <span>📱</span> Send via WhatsApp
          </button>

          <button className="fm-back invite-copy-btn" onClick={copyLink}>
            {copied ? '✅ Copied!' : '📋 Copy Link'}
          </button>

          <div className="invite-note">
            When {rel?.label || 'they'} click this link, they'll fill a quick 2-min quiz and their BioAge will appear in your family tracker automatically.
          </div>
        </>}
      </div>
    </div>
  )
}

/* ── Member detail sheet ── */
function MemberSheet({ m, onClose, onDelete }) {
  const actualAge = m.actual_age ?? m.actual ?? '?'
  const delta     = (m.bioage ?? 0) - (typeof actualAge === 'number' ? actualAge : parseInt(actualAge) || 0)
  const status    = statusOf(delta)
  const answers   = m.quiz_data ?? m.answers

  return (
    <div className="fm-overlay" onClick={onClose}>
      <div className="fm-modal" onClick={e => e.stopPropagation()}>
        <button className="fm-close-x" onClick={onClose}>✕</button>

        <div className="ms-top">
          <div className="ms-av" style={{ background: avatarColor(m.name) }}>
            {m.name[0].toUpperCase()}
          </div>
          <div className="ms-info">
            <div className="ms-name">{m.name}</div>
            <div className="ms-rel">{m.relation}</div>
          </div>
        </div>

        <div className="ms-score-row">
          <div className="ms-score-box">
            <div className="msb-v">{m.bioage}</div>
            <div className="msb-l">Biological Age</div>
          </div>
          <div className="ms-score-box">
            <div className="msb-v">{actualAge}</div>
            <div className="msb-l">Actual Age</div>
          </div>
          <div className="ms-score-box">
            <div className="msb-v" style={{ color: delta > 0 ? '#dc2626' : '#0d9488' }}>
              {delta > 0 ? `+${delta}` : delta}
            </div>
            <div className="msb-l">Difference</div>
          </div>
        </div>

        <div className="ms-badge" style={{ background: status.bg, color: status.color }}>
          {status.label}
        </div>

        {answers && (
          <>
            <div className="fm-label" style={{ marginTop: 4 }}>Health Snapshot</div>
            <div className="ms-habits">
              {[
                { key: 'exercise', icons: { high:'🏃 Very active', mid:'🚶 Moderate', low:'🛋️ Rarely active' } },
                { key: 'smoke',    icons: { no:'✅ Non-smoker', past:'🚭 Ex-smoker', yes:'🚬 Smoker' } },
                { key: 'sleep',    icons: { great:'😴 Great sleep', ok:'😐 Average sleep', poor:'😩 Poor sleep' } },
                { key: 'diet',     icons: { good:'🥗 Healthy diet', mixed:'🍱 Mixed diet', poor:'🍔 Unhealthy diet' } },
              ].map(h => (
                <div key={h.key} className="ms-habit-row">
                  {h.icons[answers[h.key]] || '—'}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ms-tip">
          {delta <= 0
            ? `🎉 ${m.name} is ageing ${Math.abs(delta)} year${Math.abs(delta) !== 1 ? 's' : ''} slower than their body clock — encourage them to keep it up!`
            : `💡 Small changes in ${m.name}'s daily habits — better sleep, movement, and diet — could reverse ${delta} year${delta > 1 ? 's' : ''} of biological ageing.`}
        </div>

        <div className="ms-meta">Joined {new Date(m.joinedAt || m.joined_at || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>

        {onDelete && (
          <button className="ms-delete" onClick={() => { onDelete(m.id); onClose() }}>Remove from family</button>
        )}
      </div>
    </div>
  )
}

/* ── Main Screen ── */
export default function Screen1() {
  const nav = useNavigate()

  const userId   = getUserId()
  const userName = getUserName()

  const [members,   setMembers]   = useState([])
  const [pending,   setPending]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [showAsk,   setShowAsk]   = useState(false)
  const [selected,  setSelected]  = useState(null)

  const loadFamily = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/invites/family/${userId}`)
      const data = await res.json()
      setMembers(data.members || [])
      setPending(data.pending || [])
    } catch {
      /* server not running — show empty state */
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadFamily()
    const id = setInterval(loadFamily, 30_000)   // poll every 30s for accepted invites
    return () => clearInterval(id)
  }, [loadFamily])

  const insight = familyInsight(members)

  return (
    <div className="screen">
      <div className="status-bar"><span>9:41</span><span>●●●● 100%</span></div>

      {/* Hero */}
      <div className="hero">
        <div className="lbl">Your Biological Age</div>
        <div className="big">34 <span className="big-sub">vs actual age 41</span></div>
        <div className="delta">↓ 7 years younger · improved 0.4 this month</div>
        <div className="btns">
          <button className="b1" onClick={() => nav('/trends')}>View Trends</button>
          <button className="b2" onClick={() => nav('/share')}>Share Card</button>
        </div>
      </div>

      {/* AI Insight */}
      <div className="card">
        <div className="insight-text">{INSIGHT_TEXT}</div>
        <div className="ask-row">
          <div className="ask-row-label">
            <span>Not sure what this means?</span>
            <span className="ask-row-sub">Ask our AI health guide — instant answers</span>
          </div>
          <button className="ask-btn" onClick={() => setShowAsk(true)}>Ask →</button>
        </div>
      </div>

      {/* ── Family BioAge ── */}
      <div className="fam-section-head">
        <div>
          <div className="fam-title">Family BioAge Tracker</div>
          <div className="fam-count">
            {loading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''}${pending.length ? ` · ${pending.length} pending` : ''}`}
          </div>
        </div>
        {(members.length > 0 || pending.length > 0) && (
          <button className="fam-add-mini" onClick={() => setShowInvite(true)}>+ Invite</button>
        )}
      </div>

      {/* Family insight banner */}
      {insight && members.length > 0 && (
        <div className="fam-insight">{insight}</div>
      )}

      {/* Pending invites */}
      {pending.length > 0 && (
        <div className="fam-pending-list">
          {pending.map(inv => (
            <div key={inv.code} className="fam-pending-item">
              <span className="fpi-icon">⏳</span>
              <span className="fpi-text">
                Invite sent to <b>{inv.relation}</b>
                {inv.phone && ` (${inv.phone})`} · Awaiting response
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Member cards */}
      {!loading && members.length === 0 && pending.length === 0 ? (
        <div className="fam-empty" onClick={() => setShowInvite(true)}>
          <div className="fe-icon">👨‍👩‍👧‍👦</div>
          <div className="fe-title">Track your whole family's BioAge</div>
          <div className="fe-sub">Send a WhatsApp invite — when they join, their real BioAge appears here automatically. No manual entry.</div>
          <div className="fe-btn">Invite a family member →</div>
        </div>
      ) : (
        <div className="fam-cards-list">
          {members.map(m => {
            const actualAge = m.actual_age ?? m.actual ?? 0
            const delta     = (m.bioage ?? 0) - actualAge
            const status    = statusOf(delta)
            return (
              <div key={m.id} className="fam-card-rich" onClick={() => setSelected(m)}>
                <div className="fcr-left">
                  <div className="fcr-av" style={{ background: avatarColor(m.name) }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="fcr-info">
                    <div className="fcr-name">{m.name} <span className="fcr-rel">· {m.relation}</span></div>
                    <div className="fcr-ages">
                      BioAge <b>{m.bioage}</b> · Actual {actualAge}
                    </div>
                    <div className="fcr-status" style={{ color: status.color }}>
                      {status.label}
                    </div>
                  </div>
                </div>
                <div className="fcr-right">
                  <div className="fcr-delta" style={{ color: delta > 0 ? '#dc2626' : '#0d9488' }}>
                    {delta > 0 ? `+${delta}` : delta === 0 ? '±0' : delta} yrs
                  </div>
                  <div className="fcr-arr">›</div>
                </div>
              </div>
            )
          })}

          <button className="fam-card-add" onClick={() => setShowInvite(true)}>
            + Invite another family member
          </button>
        </div>
      )}

      {/* Build BioAge */}
      <div className="build-title">Build Your BioAge</div>
      <div className="action-card" onClick={() => nav('/upload')}>
        <div className="ic3">📄</div>
        <div className="meta">
          <div className="t">Upload a Lab Report</div>
          <div className="s">PDF or photo — AI reads your biomarkers</div>
        </div>
        <span className="go">Upload →</span>
      </div>
      <div className="action-card" onClick={() => nav('/devices')}>
        <div className="ic3">⌚</div>
        <div className="meta">
          <div className="t">Connect a Device</div>
          <div className="s">Ring, smartwatch, or phone sensors</div>
        </div>
        <span className="go">Connect →</span>
      </div>

      <div className="why-title">Why HealthOS Plus</div>
      <div className="why-row"><span className="c">✓</span><span><b>Bring your own reports</b> — works with any diagnostic center</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>Your data is always yours</b> — BioAge history stays even if you cancel</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>No surprise renewals</b> — reminder 7 days before any charge, 30 days free first</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>Available worldwide</b> — ₹399/yr in India, $99/yr internationally</span></div>

      {showAsk && <AIChatModal onClose={() => setShowAsk(false)} />}

      {showInvite && (
        <InviteModal
          userId={userId}
          userName={userName}
          onClose={() => { setShowInvite(false); loadFamily() }}
        />
      )}
      {selected && (
        <MemberSheet
          m={selected}
          onClose={() => setSelected(null)}
          onDelete={null}
        />
      )}
    </div>
  )
}
