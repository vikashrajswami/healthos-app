import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const QUIZ = [
  {
    key: 'exercise', q: 'How active are you?',
    opts: [
      { v: 'high',  icon: '🏃', label: 'Very active',  sub: '5+ days/week',   score: -3 },
      { v: 'mid',   icon: '🚶', label: 'Moderate',      sub: '2–4 days/week',  score: -1 },
      { v: 'low',   icon: '🛋️', label: 'Rarely move',  sub: 'Mostly sitting', score:  3 },
    ],
  },
  {
    key: 'smoke', q: 'Do you smoke?',
    opts: [
      { v: 'no',   icon: '✅', label: 'Non-smoker', sub: 'Never / quit',   score: 0 },
      { v: 'past', icon: '🚭', label: 'Ex-smoker',  sub: 'Quit >1 yr ago', score: 1 },
      { v: 'yes',  icon: '🚬', label: 'Smoker',     sub: 'Currently',      score: 5 },
    ],
  },
  {
    key: 'sleep', q: 'How well do you sleep?',
    opts: [
      { v: 'great', icon: '😴', label: 'Great',   sub: '7–8 hrs solid',    score: -2 },
      { v: 'ok',    icon: '😐', label: 'Average', sub: '5–6 hrs, varies',  score:  1 },
      { v: 'poor',  icon: '😩', label: 'Poor',    sub: '<5 hrs or broken', score:  3 },
    ],
  },
  {
    key: 'diet', q: "How's your diet?",
    opts: [
      { v: 'good',  icon: '🥗', label: 'Healthy',   sub: 'Whole foods, low sugar',  score: -2 },
      { v: 'mixed', icon: '🍱', label: 'Mixed',      sub: 'Some good, some not',     score:  1 },
      { v: 'poor',  icon: '🍔', label: 'Unhealthy', sub: 'Processed, high sugar',   score:  3 },
    ],
  },
]

function statusOf(delta) {
  if (delta <= -3) return { label: '🌟 Thriving',        color: '#0d9488', bg: '#e6f7f5' }
  if (delta <= 0)  return { label: '✅ On track',         color: '#16a34a', bg: '#dcf5ec' }
  if (delta <= 3)  return { label: '💛 Room to improve', color: '#d97706', bg: '#fef3c7' }
  return             { label: '⚠️ Needs attention',       color: '#dc2626', bg: '#fee2e2' }
}

export default function JoinScreen() {
  const { code } = useParams()

  const [invite,   setInvite]   = useState(null)    // invite details from API
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [step,     setStep]     = useState(0)        // 0=welcome 1=name 2=age 3=quiz 4=done
  const [name,     setName]     = useState('')
  const [age,      setAge]      = useState('')
  const [answers,  setAnswers]  = useState({})
  const [qIdx,     setQIdx]     = useState(0)
  const [result,   setResult]   = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/invites/${code}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setInvite(data); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [code])

  async function submitQuiz(finalAnswers) {
    setSubmitting(true)
    try {
      const res  = await fetch(`/api/invites/${code}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, actualAge: parseInt(age), quizData: finalAnswers }),
      })
      const data = await res.json()
      setResult(data)
      setStep(4)
    } catch {
      // Calculate locally if API is down
      let bio = parseInt(age)
      QUIZ.forEach(q => { const o = q.opts.find(x => x.v === finalAnswers[q.key]); if (o) bio += o.score })
      setResult({ bioage: Math.max(1, Math.round(bio)) })
      setStep(4)
    }
    setSubmitting(false)
  }

  function answerQ(key, val) {
    const next = { ...answers, [key]: val }
    setAnswers(next)
    if (qIdx < QUIZ.length - 1) setQIdx(qIdx + 1)
    else submitQuiz(next)
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="join-center">
      <div className="join-spinner">⏳</div>
      <div className="join-loading">Loading your invite…</div>
    </div>
  )

  /* ── Not found ── */
  if (notFound) return (
    <div className="join-center">
      <div style={{ fontSize: 48 }}>🔍</div>
      <div className="join-nf-title">Invite not found</div>
      <div className="join-nf-sub">This link may have expired or already been used. Ask your family member to send a new one.</div>
    </div>
  )

  const inviterName = invite?.inviterName || invite?.inviter_name || 'Your family member'
  const relation    = invite?.relation || 'Family'

  /* ── Step 0: Welcome ── */
  if (step === 0) return (
    <div className="join-screen">
      <div className="join-hero">
        <div className="jh-emoji">👨‍👩‍👧‍👦</div>
        <div className="jh-tag">Family BioAge Invite</div>
        <div className="jh-title">{inviterName} wants to track your biological age together</div>
        <div className="jh-sub">
          BioAge shows how old your body actually is — not just your birth year.
          Takes 2 minutes to find out yours.
        </div>
      </div>

      <div className="join-card">
        <div className="jc-row">
          <span className="jc-icon">🧬</span>
          <span className="jc-text"><b>Discover your real biological age</b> based on your lifestyle</span>
        </div>
        <div className="jc-row">
          <span className="jc-icon">👨‍👩‍👧</span>
          <span className="jc-text"><b>Join {inviterName}'s family tracker</b> — compare and motivate each other</span>
        </div>
        <div className="jc-row">
          <span className="jc-icon">🔒</span>
          <span className="jc-text"><b>Your data is private</b> — only your BioAge score is shared</span>
        </div>
      </div>

      <button className="join-btn-primary" onClick={() => setStep(1)}>
        Accept Invite & Find My BioAge →
      </button>
      <div className="join-footer">Free · No account needed · 2 minutes</div>
    </div>
  )

  /* ── Step 1: Name ── */
  if (step === 1) return (
    <div className="join-screen">
      <div className="join-progress"><div className="jp-bar" style={{ width: '25%' }} /></div>
      <div className="join-q-head">What's your name? 👋</div>
      <div className="join-q-sub">So {inviterName} can recognise you in their family tracker</div>
      <input
        className="join-name-input"
        placeholder="Your first name…"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      <button
        className="join-btn-primary"
        disabled={!name.trim()}
        onClick={() => setStep(2)}
      >
        Continue →
      </button>
    </div>
  )

  /* ── Step 2: Age ── */
  if (step === 2) return (
    <div className="join-screen">
      <div className="join-progress"><div className="jp-bar" style={{ width: '50%' }} /></div>
      <div className="join-q-head">How old are you, {name}? 🎂</div>
      <div className="join-q-sub">We'll compare your biological age against this</div>
      <div className="join-age-wrap">
        <input
          type="number"
          className="join-age-input"
          placeholder="–"
          min="1" max="110"
          value={age}
          onChange={e => setAge(e.target.value)}
          autoFocus
        />
        <span className="join-age-unit">years old</span>
      </div>
      <button
        className="join-btn-primary"
        disabled={!age || parseInt(age) < 1}
        onClick={() => setStep(3)}
      >
        Continue →
      </button>
      <button className="join-back" onClick={() => setStep(1)}>← Back</button>
    </div>
  )

  /* ── Step 3: Quiz ── */
  if (step === 3) {
    const q    = QUIZ[qIdx]
    const pct  = Math.round(((qIdx + 2) / (QUIZ.length + 2)) * 100)
    return (
      <div className="join-screen">
        <div className="join-progress"><div className="jp-bar" style={{ width: `${pct}%` }} /></div>
        <div className="join-q-num">Question {qIdx + 1} of {QUIZ.length}</div>
        <div className="join-q-head">{q.q}</div>
        <div className="join-q-sub">Quick honest answer — it affects your BioAge calculation</div>

        {submitting
          ? <div className="join-calculating">⏳ Calculating your biological age…</div>
          : (
            <div className="join-opts">
              {q.opts.map(o => (
                <button key={o.v} className="join-opt" onClick={() => answerQ(q.key, o.v)}>
                  <span className="jo-icon">{o.icon}</span>
                  <span className="jo-body">
                    <span className="jo-label">{o.label}</span>
                    <span className="jo-sub">{o.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          )
        }
        {!submitting && (
          <button className="join-back" onClick={() => {
            if (qIdx > 0) setQIdx(qIdx - 1)
            else setStep(2)
          }}>← Back</button>
        )}
      </div>
    )
  }

  /* ── Step 4: Result ── */
  if (step === 4 && result) {
    const delta  = result.bioage - parseInt(age)
    const status = statusOf(delta)
    return (
      <div className="join-screen">
        <div className="join-result-top" style={{ background: status.bg }}>
          <div className="jr-name">{name}'s Biological Age</div>
          <div className="jr-num" style={{ color: status.color }}>{result.bioage}</div>
          <div className="jr-vs">vs actual age {age}</div>
          <div className="jr-delta">
            {delta === 0 && 'Right on track 🎉'}
            {delta < 0  && `${Math.abs(delta)} years YOUNGER than your actual age 🎉`}
            {delta > 0  && `${delta} year${delta > 1 ? 's' : ''} older than your actual age`}
          </div>
        </div>

        <div className="jr-status" style={{ color: status.color }}>{status.label}</div>

        <div className="jr-message">
          {delta <= 0
            ? `Amazing ${name}! Your lifestyle is keeping you biologically young. ${inviterName} will love seeing this!`
            : `Don't worry ${name} — biological age is reversible. Small daily habits in sleep, diet and movement can turn this around fast.`}
        </div>

        <div className="jr-sent">
          ✅ Your BioAge has been sent to <b>{inviterName}'s</b> family tracker
        </div>

        <button className="join-btn-primary" onClick={() => window.location.href = '/'}>
          Open My AROGYOS Dashboard →
        </button>

        <div className="join-footer">
          Share this with your own family members too ❤️
        </div>
      </div>
    )
  }

  return null
}
