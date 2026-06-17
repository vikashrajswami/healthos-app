import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAIResponse } from '../lib/healthAI'
import { getProfile, saveProfile, calcBioAge } from '../lib/userProfile'
import UpgradeModal from '../components/UpgradeModal'
import DailyInsightCard from '../components/DailyInsightCard'
import InstallPrompt from '../components/InstallPrompt'
import {
  isPlusMember, hasSeenUpgradePrompt, markUpgradePromptSeen,
  getMonthlyChatCount, recordChat,
} from '../lib/planStatus'

const QUIZ_STEPS = [
  {
    key: 'name', type: 'text', q: "What's your name?", placeholder: 'Your first name',
  },
  {
    key: 'age', type: 'number', q: 'What is your current age?', placeholder: 'e.g. 35',
  },
  {
    key: 'exercise', q: 'How physically active are you?',
    opts: [
      { v: 'high',  icon: '🏃', label: 'Very active',    sub: '5+ days/week exercise' },
      { v: 'mid',   icon: '🚶', label: 'Moderately active', sub: '2–4 days/week' },
      { v: 'low',   icon: '🛋️', label: 'Mostly sedentary', sub: 'Little movement daily' },
    ],
  },
  {
    key: 'smoke', q: 'Do you smoke or use tobacco?',
    opts: [
      { v: 'no',   icon: '✅', label: 'Non-smoker',  sub: 'Never or quit long ago' },
      { v: 'past', icon: '🚭', label: 'Ex-smoker',   sub: 'Quit within last year' },
      { v: 'yes',  icon: '🚬', label: 'Current smoker', sub: 'Daily or occasionally' },
    ],
  },
  {
    key: 'sleep', q: 'How is your sleep quality?',
    opts: [
      { v: 'great', icon: '😴', label: 'Good sleep',    sub: '7–9 hrs, wake refreshed' },
      { v: 'ok',    icon: '😐', label: 'Average sleep', sub: '5–6 hrs or inconsistent' },
      { v: 'poor',  icon: '😩', label: 'Poor sleep',    sub: 'Tired most mornings' },
    ],
  },
  {
    key: 'diet', q: 'How would you describe your daily diet?',
    opts: [
      { v: 'good',  icon: '🥗', label: 'Mostly healthy', sub: 'Whole foods, low sugar' },
      { v: 'mixed', icon: '🍱', label: 'Mixed',          sub: 'Some healthy, some not' },
      { v: 'poor',  icon: '🍔', label: 'Unhealthy',      sub: 'Processed, high sugar' },
    ],
  },
  {
    key: 'stress', q: 'What is your daily stress level?',
    opts: [
      { v: 'low',  icon: '😌', label: 'Low stress',    sub: 'Mostly calm and rested' },
      { v: 'mid',  icon: '😐', label: 'Moderate',      sub: 'Some pressure, manageable' },
      { v: 'high', icon: '😤', label: 'High stress',   sub: 'Chronically stressed or anxious' },
    ],
  },
]

function BioAgeQuizModal({ onDone }) {
  const [step, setStep]       = useState(0)
  const [name, setName]       = useState('')
  const [age, setAge]         = useState('')
  const [answers, setAnswers] = useState({})

  const current = QUIZ_STEPS[step]

  function next() {
    if (step < QUIZ_STEPS.length - 1) setStep(s => s + 1)
    else finish()
  }

  function pickOpt(key, v) {
    const next = { ...answers, [key]: v }
    setAnswers(next)
    if (step < QUIZ_STEPS.length - 1) setStep(s => s + 1)
    else finishWith(next)
  }

  function finish() { finishWith(answers) }

  function finishWith(ans) {
    const actualAge = parseInt(age) || 30
    const bioage    = calcBioAge(actualAge, ans)
    const profile   = { name: name.trim() || 'You', actualAge, bioage, answers: ans, quizDone: true, doneAt: Date.now() }
    saveProfile(profile)
    localStorage.setItem('healthos_username', profile.name)

    // Fire-and-forget: sync profile to Supabase (non-blocking)
    const uid = localStorage.getItem('healthos_uid')
    if (uid) {
      fetch('/api/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          name:         profile.name,
          bioage:       profile.bioage,
          actual_age:   profile.actualAge,
          quiz_done:    true,
          quiz_answers: profile.answers,
        }),
      }).catch(() => {}) // silently ignore network errors
    }

    onDone(profile)
  }

  const progress = Math.round(((step + 1) / QUIZ_STEPS.length) * 100)

  return (
    <div className="quiz-overlay">
      <div className="quiz-sheet">
        <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${progress}%` }} /></div>
        <div className="quiz-step-label">{step + 1} of {QUIZ_STEPS.length}</div>
        <div className="quiz-q">{current.q}</div>

        {current.type === 'text' && (
          <div className="quiz-text-wrap">
            <input className="quiz-text-input" placeholder={current.placeholder}
              value={name} onChange={e => setName(e.target.value)}
              autoFocus onKeyDown={e => e.key === 'Enter' && name.trim() && next()} />
            <button className="quiz-next-btn" disabled={!name.trim()} onClick={next}>Continue →</button>
          </div>
        )}

        {current.type === 'number' && (
          <div className="quiz-text-wrap">
            <input className="quiz-text-input" type="number" placeholder={current.placeholder} min={10} max={110}
              value={age} onChange={e => setAge(e.target.value)}
              autoFocus onKeyDown={e => e.key === 'Enter' && age && next()} />
            <button className="quiz-next-btn" disabled={!age || parseInt(age) < 10} onClick={next}>Continue →</button>
          </div>
        )}

        {current.opts && (
          <div className="quiz-opts">
            {current.opts.map(o => (
              <button key={o.v} className={`quiz-opt ${answers[current.key] === o.v ? 'selected' : ''}`}
                onClick={() => pickOpt(current.key, o.v)}>
                <span className="quiz-opt-icon">{o.icon}</span>
                <div className="quiz-opt-text">
                  <div className="quiz-opt-label">{o.label}</div>
                  <div className="quiz-opt-sub">{o.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="quiz-disclaimer">
          This estimate is based on lifestyle factors. Upload a lab report for precise BioAge measurement.
        </div>
      </div>
    </div>
  )
}

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
  lines.push(`App version: AROGYOS web app`)
  return lines.join('\n')
}

/* ── AI Chat Modal ── */
function AIChatModal({ onClose }) {
  const nav = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AROGYOS Health Guide 🌿\n\nI know everything about this app — biomarkers, diet plans, how to upload reports, the family tracker, protocols, supplement advice, and all the science behind biological age reversal.\n\nWhat would you like to know?`,
    },
  ])

  // Auto-send if opened from DailyInsightCard "Ask about this" button
  useEffect(() => {
    const pending = window._pendingAskTopic
    if (pending) {
      window._pendingAskTopic = null
      setTimeout(() => sendMessage(pending), 400)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [input,       setInput]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showAll,     setShowAll]     = useState(false)
  const [showGate,    setShowGate]    = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userText = (text || input).trim()
    if (!userText || loading) return

    // Gate: 5 free messages/month for non-Plus users
    if (!isPlusMember() && getMonthlyChatCount() >= 5) {
      setShowGate(true)
      return
    }

    setInput('')
    recordChat()

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
    <>
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-sheet" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">🌿</div>
            <div>
              <div className="chat-title">Health Guide</div>
              <div className="chat-status">● Online · Always here for you</div>
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
              <div className="chat-ai-icon">🌿</div>
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
        {!isPlusMember() && (
          <div style={{ padding: '4px 16px 8px', textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
            {Math.max(0, 5 - getMonthlyChatCount())} free messages remaining this month
          </div>
        )}
      </div>
    </div>
    {showGate && <UpgradeModal reason="chat" onClose={() => setShowGate(false)} />}
    </>
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
      `👋 ${userName} wants to track your Biological Age together on AROGYOS!\n\n` +
      `AROGYOS tracks how old your body *actually* is — not just your birth year.\n\n` +
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

  const [profile,      setProfile]      = useState(() => getProfile())
  const [showQuiz,     setShowQuiz]     = useState(false)
  const [showUpgrade,  setShowUpgrade]  = useState(false)
  const [upgradeReason,setUpgradeReason]= useState('quiz')
  const [members,      setMembers]      = useState([])
  const [pending,      setPending]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showInvite,   setShowInvite]   = useState(false)
  const [showAsk,      setShowAsk]      = useState(false)
  const [selected,     setSelected]     = useState(null)
  const [water,     setWater]     = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('healthos_daily') || '{}')
      const today = new Date().toDateString()
      return s.date === today ? (s.water || 0) : 0
    } catch { return 0 }
  })
  const [weight,    setWeight]    = useState(() => {
    try { return localStorage.getItem('healthos_weight') || '' } catch { return '' }
  })

  function saveWater(v) {
    const today = new Date().toDateString()
    try { localStorage.setItem('healthos_daily', JSON.stringify({ date: today, water: v })) } catch {}
    setWater(v)
  }
  function saveWeight(v) {
    try { localStorage.setItem('healthos_weight', v) } catch {}
    setWeight(v)
  }

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

      {/* Add to home screen banner — shows once on mobile browsers */}
      <InstallPrompt />

      {/* Hero */}
      {profile?.quizDone ? (
        <div className="hero">
          <div className="lbl">Your Biological Age · {profile.name}</div>
          <div className="big">
            {profile.bioage} <span className="big-sub">vs actual age {profile.actualAge}</span>
          </div>
          {profile.bioage < profile.actualAge ? (
            <div className="delta">↓ {profile.actualAge - profile.bioage} years biologically younger</div>
          ) : profile.bioage > profile.actualAge ? (
            <div className="delta" style={{color:'#f97316'}}>↑ {profile.bioage - profile.actualAge} years older than ideal · reversible</div>
          ) : (
            <div className="delta">Biological age matches actual — room to improve</div>
          )}
          <div className="hero-source-note">Based on lifestyle quiz · Upload a lab report for precise measurement</div>
          <div className="btns">
            <button className="b1" onClick={() => nav('/upload')}>Upload Lab Report</button>
            <button className="b2" onClick={() => nav('/devices')}>Connect Device</button>
          </div>
        </div>
      ) : (
        <div className="hero hero-empty">
          <div className="lbl">Your Biological Age</div>
          <div className="big-empty">—</div>
          <div className="hero-empty-text">Answer 7 quick questions to get your estimated BioAge in under 2 minutes</div>
          <button className="hero-quiz-btn" onClick={() => setShowQuiz(true)}>
            🧬 Get My BioAge Estimate →
          </button>
          <div className="hero-empty-sub">Or upload a lab report for precise measurement</div>
        </div>
      )}

      {/* AI Insight */}
      <div className="card">
        <div className="insight-text">
          {profile?.quizDone
            ? `Hi ${profile.name}! Your BioAge estimate is ${profile.bioage}. Upload a blood panel to get biomarker-level insights — we'll analyse hsCRP, HbA1c, cholesterol, vitamins, hormones, and more.`
            : 'Complete your BioAge quiz above, then upload a lab report. AROGYOS reads every biomarker automatically and shows exactly what is ageing you faster — and what to do about it.'}
        </div>
        <div className="ask-row">
          <div className="ask-row-label">
            <span>Have a question about your health?</span>
            <span className="ask-row-sub">Ask Health Guide — instant answers, always free</span>
          </div>
          <button className="ask-btn" onClick={() => setShowAsk(true)}>Ask →</button>
        </div>
      </div>

      {/* Daily rotating health insight */}
      <DailyInsightCard
        quizAnswers={profile?.answers}
        onAskAbout={topic => { setShowAsk(true); window._pendingAskTopic = topic }}
      />

      {/* ── Family BioAge ── */}
      <div className="fam-section-head">
        <div>
          <div className="fam-title">Family BioAge Tracker</div>
          <div className="fam-count">
            {loading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''}${pending.length ? ` · ${pending.length} pending` : ''}`}
          </div>
        </div>
        {(members.length > 0 || pending.length > 0) && (
          <button className="fam-add-mini" onClick={() => {
            if (!isPlusMember() && (members.length + pending.length) >= 1) {
              setUpgradeReason('family'); setShowUpgrade(true)
            } else {
              setShowInvite(true)
            }
          }}>+ Invite</button>
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
        <div className="fam-empty" onClick={() => {
          if (!isPlusMember() && !profile?.quizDone) {
            setUpgradeReason('family'); setShowUpgrade(true)
          } else {
            setShowInvite(true)
          }
        }}>
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

      {/* Daily Quick Tracker */}
      <div className="build-title">Today's Vitals</div>
      <div className="card" style={{ marginBottom: 12 }}>
        {/* Water */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>💧 Water intake</span>
            <span style={{ fontSize: 12, color: water >= 8 ? '#0d9488' : '#94a3b8', fontWeight: 600 }}>{water}/8 glasses</span>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {[1,2,3,4,5,6,7,8].map(n => (
              <button key={n} onClick={() => saveWater(water === n && n > 0 ? n - 1 : n)} style={{
                flex: 1, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: n <= water ? '#14b8a6' : '#f1f5f9',
                transition: 'background .15s',
              }}/>
            ))}
          </div>
          {water >= 8 && <div style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, marginTop: 5 }}>✓ Daily goal met!</div>}
        </div>
        {/* Weight */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>⚖️ Weight</span>
          <input
            type="number"
            placeholder="kg"
            value={weight}
            onChange={e => saveWeight(e.target.value)}
            style={{
              flex: 1, padding: '8px 12px', background: '#f8fafb',
              border: '1.5px solid #e2e8f0', borderRadius: 10,
              fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#0f172a',
            }}
          />
          {weight && <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>kg · logged today</span>}
        </div>
      </div>


      <div className="why-title">Why AROGYOS Plus</div>
      <div className="why-row"><span className="c">✓</span><span><b>Bring your own reports</b> — works with any diagnostic center</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>Your data is always yours</b> — BioAge history stays even if you cancel</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>No surprise renewals</b> — reminder 7 days before any charge, 30 days free first</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>Available worldwide</b> — ₹399/yr in India, $99/yr internationally</span></div>

      {showQuiz && (
        <BioAgeQuizModal onDone={p => {
          setProfile(p)
          setShowQuiz(false)
          // Show upgrade prompt once after quiz if not already Plus
          if (!isPlusMember() && !hasSeenUpgradePrompt()) {
            setUpgradeReason('quiz')
            setShowUpgrade(true)
          }
        }} />
      )}

      {showAsk && <AIChatModal onClose={() => setShowAsk(false)} />}

      {showInvite && (
        <InviteModal
          userId={userId}
          userName={userName}
          onClose={() => { setShowInvite(false); loadFamily() }}
        />
      )}

      {showUpgrade && (
        <UpgradeModal reason={upgradeReason} onClose={() => setShowUpgrade(false)} />
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
