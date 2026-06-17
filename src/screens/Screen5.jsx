import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/userProfile'
import { pushToCloud } from '../lib/sync'

const HABITS = [
  {
    category: '🏃 Exercise', impact: '~ −0.8 to −1.5 yrs',
    items: [
      { t: '2× HIIT or cardio sessions per week (20–30 min)',    s: '8 weeks of HIIT measurably reduces DunedinPACE in clinical trials' },
      { t: '2× resistance/strength training sessions per week',  s: 'Linked to younger epigenetic profiles and better muscle preservation' },
      { t: 'Daily 7,000–10,000 steps or equivalent movement',   s: 'VO2 max — the #1 longevity predictor — improves with consistent walking' },
    ],
  },
  {
    category: '😴 Sleep', impact: '~ −0.6 to −1.2 yrs',
    items: [
      { t: '7–9 hours, consistent sleep and wake time',          s: 'Sleep is when cellular repair, GH release and brain detox happen' },
      { t: 'Reduce screen light 1 hr before bed',               s: 'Blue light delays melatonin — pushes back deep sleep stages' },
      { t: 'Keep bedroom cool (18–20°C / 64–68°F)',             s: 'Core body temperature must drop for deep sleep to begin' },
    ],
  },
  {
    category: '🥗 Nutrition', impact: '~ −0.5 to −1.0 yrs',
    items: [
      { t: 'Eat within a 8–10 hour window (time-restricted eating)', s: 'TRE reduces insulin resistance and inflammation markers in trials' },
      { t: 'Target 1.6–2g protein per kg bodyweight daily',        s: 'Muscle protein synthesis declines after 30 — must be offset with intake' },
      { t: 'Minimise ultra-processed foods and added sugar',       s: 'Processed food raises hsCRP and accelerates epigenetic ageing' },
    ],
  },
  {
    category: '🧘 Stress', impact: '~ −0.3 to −0.8 yrs',
    items: [
      { t: '10–20 min daily mindfulness or breathwork',           s: 'Lowers cortisol — high cortisol degrades telomeres and suppresses testosterone' },
      { t: 'Cold exposure (cold shower or bath, 2–3 min)',        s: 'Activates brown fat, lowers inflammation, boosts norepinephrine' },
    ],
  },
  {
    category: '💊 Nutrition Gaps to Discuss with Your Doctor', impact: 'Supportive',
    items: [
      { t: 'Vitamin D — get a blood test first',                  s: 'Many Indians are deficient · your doctor will advise the right dose based on your level' },
      { t: 'Omega-3 rich foods — fish, walnuts, flaxseeds',       s: 'Food-first approach · discuss supplementation with your doctor if diet is insufficient' },
      { t: 'Magnesium-rich foods — nuts, seeds, dark greens',     s: 'Supports sleep and stress response · talk to your doctor before supplementing' },
    ],
  },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function calcStreak(dates) {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort().reverse()
  let streak = 0
  let d = new Date()
  for (let i = 0; i < 365; i++) {
    const s = d.toISOString().slice(0, 10)
    if (sorted.includes(s)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else if (i === 0) {
      // Today not yet done — check from yesterday
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default function Screen5() {
  const nav     = useNavigate()
  const profile = getProfile()
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('healthos_habits') || '{}') } catch { return {} }
  })
  const [streakDates, setStreakDates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('healthos_streak_dates') || '[]') } catch { return [] }
  })

  const totalHabits = HABITS.reduce((s, h) => s + h.items.length, 0)
  const doneCount   = Object.values(checked).filter(Boolean).length
  const streak      = calcStreak(streakDates)
  const bestStreak  = parseInt(localStorage.getItem('healthos_best_streak') || '0')

  function toggle(key) {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem('healthos_habits', JSON.stringify(next)) } catch {}

      // Update streak dates if >50% done
      const done = Object.values(next).filter(Boolean).length
      const today = todayStr()
      if (done / totalHabits >= 0.5) {
        const newDates = [...new Set([...streakDates, today])]
        setStreakDates(newDates)
        try { localStorage.setItem('healthos_streak_dates', JSON.stringify(newDates)) } catch {}
        const newStreak = calcStreak(newDates)
        const best = parseInt(localStorage.getItem('healthos_best_streak') || '0')
        if (newStreak > best) {
          try { localStorage.setItem('healthos_best_streak', String(newStreak)) } catch {}
        }
      }

      pushToCloud()
      return next
    })
  }

  return (
    <div className="screen">
      <button className="nav-back">← Your Longevity Protocol</button>

      {/* Header card */}
      <div className="proj-card">
        <div className="lbl">Science-Backed Age Reversal Protocol</div>
        <div className="big" style={{fontSize:22}}>
          {profile?.quizDone ? `BioAge ${profile.bioage}` : 'Start Your Protocol'}
        </div>
        <div className="desc2">
          {profile?.quizDone
            ? `Based on clinical research (CALERIE, DunedinPACE trials). Upload lab reports to personalise this for your exact biomarkers.`
            : 'These habits are proven by clinical trials to reduce biological age. Complete your BioAge quiz on the Home screen to personalise them.'}
        </div>
      </div>

      {/* Progress row */}
      <div className="day-row">
        <span>Today's habits</span>
        <span className="of">{doneCount} of {totalHabits} checked</span>
      </div>
      <div className="proto-progress-bar">
        <div className="proto-progress-fill" style={{ width: `${Math.round((doneCount / totalHabits) * 100)}%` }} />
      </div>

      {/* Streak display */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{
          flex: 1, background: streak > 0 ? 'linear-gradient(135deg,#ff8c00,#ff5f00)' : '#f1f5f9',
          borderRadius: 14, padding: '14px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, marginBottom: 2 }}>{streak > 0 ? '🔥' : '💤'}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: streak > 0 ? '#fff' : '#94a3b8' }}>{streak}</div>
          <div style={{ fontSize: 11, color: streak > 0 ? 'rgba(255,255,255,0.8)' : '#94a3b8', fontWeight: 600 }}>day streak</div>
        </div>
        <div style={{
          flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: 14, padding: '14px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, marginBottom: 2 }}>🏆</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{Math.max(streak, bestStreak)}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>best streak</div>
        </div>
        <div style={{
          flex: 1, background: doneCount === totalHabits ? 'linear-gradient(135deg,#14b8a6,#059669)' : '#f8fafc',
          border: doneCount === totalHabits ? 'none' : '1px solid #e2e8f0',
          borderRadius: 14, padding: '14px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 26, marginBottom: 2 }}>{doneCount === totalHabits ? '✅' : '⭕'}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: doneCount === totalHabits ? '#fff' : '#0f172a' }}>{doneCount}</div>
          <div style={{ fontSize: 11, color: doneCount === totalHabits ? 'rgba(255,255,255,0.8)' : '#94a3b8', fontWeight: 600 }}>today</div>
        </div>
      </div>
      {streak >= 7 && (
        <div style={{ background: 'linear-gradient(90deg,#fff7ed,#fef3c7)', border: '1px solid #fcd34d', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#92400e', fontWeight: 600 }}>
          🔥 {streak}-day streak! You're in the top 8% of AROGYOS users this month.
        </div>
      )}

      {/* Diet plan link */}
      <div className="card diet-link">
        <div>
          <div className="t">Your Age-Reversal Diet Plan</div>
          <div className="s">Personalized meal guidance — tap to view</div>
        </div>
        <button className="view" onClick={() => nav('/diet')}>View →</button>
      </div>

      {/* Habits */}
      {HABITS.map(h => (
        <div key={h.category}>
          <div className="habit-head">
            <span>{h.category}</span>
            <span className="hv">{h.impact}</span>
          </div>
          {h.items.map((item, i) => {
            const key = `${h.category}-${i}`
            return (
              <div key={key} className="habit-item" onClick={() => toggle(key)} style={{cursor:'pointer'}}>
                <div className={`chk ${checked[key] ? 'on' : ''}`}>{checked[key] ? '✓' : ''}</div>
                <div className="tx">
                  <span className="t">{item.t}</span>
                  <span className="s">{item.s}</span>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {!profile?.quizDone && (
        <div className="proto-cta-card">
          <div className="proto-cta-text">
            Get your personalised BioAge estimate to understand which of these habits will have the highest impact for you.
          </div>
          <button className="proto-cta-btn" onClick={() => nav('/')}>
            Get My BioAge →
          </button>
        </div>
      )}

      <div style={{height:20}}/>
    </div>
  )
}
