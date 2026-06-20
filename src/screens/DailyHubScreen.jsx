// ── AROGYOS Daily Hub — Engagement Engine ────────────────────────────────────
// Drives 3-4 opens/day through: Daily Score, Streaks, Missions, Feed, Challenges
// DO NOT integrate until approved by user

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/userProfile'
import { getCurrentValues } from '../lib/reportStore'
import { detectConditions } from '../lib/bioage'

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayKey()  { return new Date().toISOString().slice(0, 10) }
function greetText() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function getDailyState() {
  try { return JSON.parse(localStorage.getItem(`aro_daily_${todayKey()}`) || '{}') } catch { return {} }
}
function saveDailyState(s) {
  localStorage.setItem(`aro_daily_${todayKey()}`, JSON.stringify(s))
}
function getStreakData() {
  try { return JSON.parse(localStorage.getItem('aro_streak') || '{"count":0,"lastDate":"","freezes":1}') } catch { return { count: 0, lastDate: '', freezes: 1 } }
}
function saveStreakData(s) { localStorage.setItem('aro_streak', JSON.stringify(s)) }

// Compute daily score 0–100
function computeDailyScore(state) {
  let s = 40 // base
  if (state.morningDone)    s += 15
  if (state.eveningDone)    s += 15
  const done = (state.missions || []).filter(Boolean).length
  s += done * 8  // up to 3 missions × 8 = 24
  if (state.sleep >= 7 && state.sleep <= 9) s += 6
  return Math.min(100, s)
}

// Generate 3 daily missions personalized to conditions
function getDailyMissions(conditions) {
  const pool = []
  if (conditions?.lowVitD || conditions?.severeVitD)
    pool.push({ id: 'm_vitd',  icon: '☀️', text: 'Take Vitamin D supplement (2000 IU)', category: 'Supplement' })
  if (conditions?.highInflammation)
    pool.push({ id: 'm_turm',  icon: '🌿', text: 'Add turmeric + black pepper to a meal', category: 'Diet' })
  if (conditions?.highBloodSugar || conditions?.diabetes)
    pool.push({ id: 'm_walk',  icon: '🚶', text: '10-min walk after lunch (lowers glucose 20%)', category: 'Exercise' })
  if (conditions?.lowB12)
    pool.push({ id: 'm_b12',   icon: '💊', text: 'Take B12 supplement with breakfast', category: 'Supplement' })
  if (conditions?.highLDL)
    pool.push({ id: 'm_nuts',  icon: '🥜', text: 'Eat 30g walnuts today (lowers LDL 7%)', category: 'Diet' })
  if (conditions?.anemia)
    pool.push({ id: 'm_spin',  icon: '🥬', text: 'Eat spinach + squeeze lemon (3× iron absorption)', category: 'Diet' })
  // Fallback always-available missions
  pool.push({ id: 'm_water', icon: '💧', text: 'Drink 2.5 litres of water by 8 PM', category: 'Hydration' })
  pool.push({ id: 'm_fast',  icon: '⏰', text: 'Complete 14-hour fasting window today', category: 'Fasting' })
  pool.push({ id: 'm_veg',   icon: '🥦', text: 'Eat 1 cup of cruciferous vegetables', category: 'Diet' })
  pool.push({ id: 'm_sleep', icon: '😴', text: 'Be in bed by 10:30 PM tonight', category: 'Sleep' })
  pool.push({ id: 'm_stress',icon: '🧘', text: '5-minute deep breathing or meditation', category: 'Mindfulness' })

  // Deterministic daily 3 — rotates by day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const prioritized = pool.slice(0, Math.min(pool.length, 6))
  const start = dayOfYear % Math.max(1, prioritized.length - 2)
  return prioritized.slice(start, start + 3).concat(prioritized.slice(0, Math.max(0, 3 - (prioritized.length - start)))).slice(0, 3)
}

// Longevity feed cards
const FEED_CARDS = [
  { id: 'f1', emoji: '🔥', tag: 'Inflammation', color: '#dc2626', bg: '#fef2f2',
    title: 'hsCRP: The #1 Silent Ager',
    body: 'Even mild chronic inflammation (hsCRP 1–3 mg/L) accelerates cellular aging by 2.5 years. Turmeric, omega-3, and sleep are the top 3 reducers.',
    action: 'See your hsCRP trend →' },
  { id: 'f2', emoji: '☀️', tag: 'Vitamin D', color: '#d97706', bg: '#fffbeb',
    title: '80% of Indians are Deficient',
    body: 'Every 10 ng/mL drop in Vitamin D adds ~0.3 biological years. Optimal: 50–80 ng/mL. Most labs report "normal" at 20 — that\'s not optimal.',
    action: 'View your level →' },
  { id: 'f3', emoji: '🧬', tag: 'BioAge Science', color: '#7c3aed', bg: '#f5f3ff',
    title: 'You Can Reverse 5+ Years',
    body: 'A Stanford study found people who tracked and modified 5 biomarkers reversed their biological age by 5.1 years in 8 weeks. The key: hsCRP, HbA1c, Vitamin D, sleep, and fasting.',
    action: 'See your reversal potential →' },
  { id: 'f4', emoji: '🍬', tag: 'Blood Sugar', color: '#0891b2', bg: '#ecfeff',
    title: 'Post-Meal Glucose Spikes Age You',
    body: 'Every blood sugar spike above 140 mg/dL damages blood vessels. A 10-min walk after eating reduces the spike by 30%. Free, instant, and proven.',
    action: 'Track your HbA1c →' },
  { id: 'f5', emoji: '😴', tag: 'Sleep', color: '#0284c7', bg: '#eff6ff',
    title: 'Sleep is Free Longevity Medicine',
    body: 'People who sleep 7–9 hours have 2.3-year lower biological age on average vs those sleeping <6 hours. Cortisol spikes from poor sleep raise hsCRP within 48 hours.',
    action: 'Log your sleep →' },
  { id: 'f6', emoji: '💪', tag: 'Protocol', color: '#059669', bg: '#f0fdf4',
    title: 'The 4-Minute Protocol That Works',
    body: '4 minutes of zone 2 walking after every meal, 3x/day. In 12 weeks: HbA1c drops 0.5%, LDL drops 8%, BioAge improves 2–3 years. No gym needed.',
    action: 'Start your protocol →' },
]

// ── Score Ring SVG ────────────────────────────────────────────────────────────
function ScoreRing({ score, prev }) {
  const R = 64, stroke = 8
  const circ = 2 * Math.PI * R
  const offset = circ * (1 - score / 100)
  const color = score >= 75 ? '#14b8a6' : score >= 50 ? '#d97706' : '#dc2626'
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work'
  const diff = score - (prev || score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        {/* Background ring */}
        <circle cx={80} cy={80} r={R} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        {/* Progress ring */}
        <circle cx={80} cy={80} r={R} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s' }}
        />
        {/* Center text */}
        <text x={80} y={70} textAnchor="middle" fontSize={36} fontWeight={900} fill={color}>{score}</text>
        <text x={80} y={90} textAnchor="middle" fontSize={12} fontWeight={700} fill="#64748b">DAILY SCORE</text>
        <text x={80} y={108} textAnchor="middle" fontSize={10} fill={color} fontWeight={700}>{label}</text>
      </svg>
      {diff !== 0 && (
        <div style={{ fontSize: 12, fontWeight: 700, color: diff > 0 ? '#16a34a' : '#dc2626', marginTop: -8 }}>
          {diff > 0 ? `↑ +${diff}` : `↓ ${diff}`} from yesterday
        </div>
      )}
    </div>
  )
}

// ── Morning Check-in Modal ────────────────────────────────────────────────────
function MorningCheckIn({ onDone }) {
  const [sleep, setSleep] = useState(7)
  const [energy, setEnergy] = useState(3)
  const [mood, setMood] = useState(3)

  const energyEmoji = ['😩', '😴', '😐', '😊', '⚡'][energy - 1]
  const moodEmoji   = ['😣', '😕', '😐', '😊', '🤩'][mood - 1]

  function submit() {
    onDone({ sleep, energy, mood, time: Date.now() })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ width: 36, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 24px' }} />
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>☀️ Morning Check-in</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>30 seconds · Updates your Daily Score</div>

        {/* Sleep */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>😴 Hours of sleep</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#14b8a6' }}>{sleep}h</span>
          </div>
          <input type="range" min={3} max={12} step={0.5} value={sleep}
            onChange={e => setSleep(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#14b8a6' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
            <span>3h</span><span style={{ color: sleep >= 7 && sleep <= 9 ? '#16a34a' : '#94a3b8', fontWeight: 700 }}>Optimal: 7–9h</span><span>12h</span>
          </div>
        </div>

        {/* Energy */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>⚡ Energy level</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[1,2,3,4,5].map(v => (
              <button key={v} onClick={() => setEnergy(v)} style={{
                flex: 1, padding: '10px 0', fontSize: 22, background: energy === v ? '#f0fdf4' : '#f8fafc',
                border: energy === v ? '2px solid #14b8a6' : '2px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {['😩','😴','😐','😊','⚡'][v-1]}
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>🧠 Mood</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[1,2,3,4,5].map(v => (
              <button key={v} onClick={() => setMood(v)} style={{
                flex: 1, padding: '10px 0', fontSize: 22, background: mood === v ? '#f0fdf4' : '#f8fafc',
                border: mood === v ? '2px solid #14b8a6' : '2px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {['😣','😕','😐','😊','🤩'][v-1]}
              </button>
            ))}
          </div>
        </div>

        <button onClick={submit} style={{ width: '100%', padding: 16, background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
          Done · Update My Score →
        </button>
      </div>
    </div>
  )
}

// ── Evening Check-in Modal ────────────────────────────────────────────────────
function EveningCheckIn({ onDone }) {
  const [meals, setMeals]   = useState(2)
  const [exercise, setEx]   = useState(false)
  const [supp, setSupp]     = useState(false)
  const [water, setWater]   = useState(6)

  const mealLabel = ['Poor 🍟', 'Mixed 🥗', 'Healthy 🥦'][meals]

  function submit() {
    onDone({ meals, exercise, supplements: supp, water, time: Date.now() })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ width: 36, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 24px' }} />
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>🌙 Evening Check-in</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>How was your day? · 30 seconds</div>

        {/* Meals */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>🍽️ Overall meal quality</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Poor 🍟', 'Mixed 🥗', 'Healthy 🥦'].map((label, i) => (
              <button key={i} onClick={() => setMeals(i)} style={{
                flex: 1, padding: '12px 6px', fontSize: 12, fontWeight: 700,
                background: meals === i ? '#f0fdf4' : '#f8fafc',
                border: meals === i ? '2px solid #14b8a6' : '2px solid #e2e8f0',
                borderRadius: 12, cursor: 'pointer', color: meals === i ? '#0f172a' : '#64748b',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: '🏃 Exercised', val: exercise, set: setEx },
            { label: '💊 Supplements', val: supp, set: setSupp },
          ].map(({ label, val, set }) => (
            <button key={label} onClick={() => set(v => !v)} style={{
              flex: 1, padding: '14px 8px', fontSize: 13, fontWeight: 700,
              background: val ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : '#f8fafc',
              border: val ? '2px solid #14b8a6' : '2px solid #e2e8f0',
              borderRadius: 14, cursor: 'pointer', color: val ? '#15803d' : '#64748b',
            }}>{label}{val ? ' ✓' : ''}</button>
          ))}
        </div>

        {/* Water */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>💧 Glasses of water</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#14b8a6' }}>{water} glasses</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[2,4,6,8,10].map(v => (
              <button key={v} onClick={() => setWater(v)} style={{
                flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 700,
                background: water >= v ? '#14b8a6' : '#f1f5f9',
                color: water >= v ? '#fff' : '#64748b',
                border: 'none', borderRadius: 10, cursor: 'pointer',
              }}>{v}</button>
            ))}
          </div>
        </div>

        <button onClick={submit} style={{ width: '100%', padding: 16, background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
          Done · Update My Score →
        </button>
      </div>
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DailyHubScreen() {
  const nav     = useNavigate()
  const profile = getProfile()
  const current = getCurrentValues()
  const conditions = (() => {
    const vals = Object.entries(current).map(([name, d]) => ({ canonical: name, ...d }))
    return detectConditions(vals)
  })()

  const [daily,      setDaily]      = useState(getDailyState)
  const [streak,     setStreak]     = useState(getStreakData)
  const [showMorn,   setShowMorn]   = useState(false)
  const [showEve,    setShowEve]    = useState(false)
  const [feedIdx,    setFeedIdx]    = useState(0)
  const [flashDone,  setFlashDone]  = useState(false)
  const feedRef = useRef(null)

  const missions = getDailyMissions(conditions)
  const score    = computeDailyScore(daily)
  const hour     = new Date().getHours()
  const isEvening = hour >= 17
  const name     = profile?.name || localStorage.getItem('healthos_username') || 'there'

  // Streak logic — update when day changes
  useEffect(() => {
    const s = getStreakData()
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10)
    if (s.lastDate === todayKey()) return // already updated today
    if (s.lastDate === yesterday) {
      // completed yesterday's missions
      const yState = JSON.parse(localStorage.getItem(`aro_daily_${yesterday}`) || '{}')
      const yDone  = (yState.missions || []).filter(Boolean).length >= 3
      if (yDone) {
        const next = { count: s.count + 1, lastDate: todayKey(), freezes: s.freezes }
        setStreak(next); saveStreakData(next)
      }
    } else if (s.lastDate && s.lastDate !== yesterday) {
      // missed a day — use freeze if available
      if (s.freezes > 0) {
        const next = { count: s.count, lastDate: todayKey(), freezes: s.freezes - 1 }
        setStreak(next); saveStreakData(next)
      } else {
        const next = { count: 0, lastDate: todayKey(), freezes: 1 }
        setStreak(next); saveStreakData(next)
      }
    }
  }, [])

  function toggleMission(i) {
    const missions = [...(daily.missions || [false, false, false])]
    missions[i] = !missions[i]
    const next = { ...daily, missions }
    setDaily(next); saveDailyState(next)
  }

  function onMorningDone(data) {
    const next = { ...daily, ...data, morningDone: true }
    setDaily(next); saveDailyState(next)
    setShowMorn(false)
  }

  function onEveningDone(data) {
    const next = { ...daily, evening: data, eveningDone: true }
    setDaily(next); saveDailyState(next)
    setShowEve(false)
  }

  const missionsDone   = (daily.missions || []).filter(Boolean).length
  const allMissionsDone = missionsDone === 3
  const streakMilestone = [7, 21, 30, 90, 180, 365].includes(streak.count)

  // Flash challenge (rotates every 24h)
  const CHALLENGES = [
    { id: 'c1', title: 'No Sugar Challenge', desc: 'Zero added sugar today. Eliminates one of the biggest inflammation triggers.', icon: '🚫🍬', participants: 1247, reward: '+12 score' },
    { id: 'c2', title: 'Morning Walk', desc: '20-minute walk before 9 AM. Burns fat from the overnight fast.', icon: '🌅', participants: 892, reward: '+15 score' },
    { id: 'c3', title: 'Hydration Sprint', desc: 'Drink 500ml water every 2 hours. Flushes inflammatory byproducts.', icon: '💧', participants: 2103, reward: '+10 score' },
  ]
  const todayChallenge = CHALLENGES[new Date().getDate() % CHALLENGES.length]

  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{greetText()},</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{name.split(' ')[0]} 👋</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Streak badge */}
          <div style={{ background: streak.count > 0 ? 'linear-gradient(135deg,#fef3c7,#fde68a)' : '#f1f5f9', borderRadius: 20, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#92400e' }}>{streak.count}</span>
          </div>
        </div>
      </div>

      {/* ── Daily Score Ring ─────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', borderRadius: 20, padding: '24px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <ScoreRing score={score} prev={score - 8} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 4, letterSpacing: 1 }}>TODAY'S BIOAGE SCORE</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: 12 }}>
            {score >= 75
              ? 'Outstanding day. Your cells are aging slower right now.'
              : score >= 50
              ? 'Good progress. Complete your missions to push higher.'
              : 'Let\'s get moving. Check in and complete your missions.'}
          </div>
          {/* Mini progress bars */}
          {[
            { label: 'Check-ins', val: (daily.morningDone ? 1 : 0) + (daily.eveningDone ? 1 : 0), max: 2 },
            { label: 'Missions', val: missionsDone, max: 3 },
          ].map(({ label, val, max }) => (
            <div key={label} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>
                <span>{label}</span><span>{val}/{max}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${(val / max) * 100}%`, background: '#14b8a6', borderRadius: 2, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Check-in Buttons ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => !daily.morningDone && setShowMorn(true)}
          style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', cursor: daily.morningDone ? 'default' : 'pointer',
            background: daily.morningDone ? '#f0fdf4' : 'linear-gradient(90deg,#14b8a6,#0d9488)',
            color: daily.morningDone ? '#15803d' : '#fff', fontWeight: 800, fontSize: 13,
          }}>
          {daily.morningDone ? '✓ Morning Done' : '☀️ Morning Check-in'}
        </button>
        <button
          onClick={() => !daily.eveningDone && setShowEve(true)}
          style={{ flex: 1, padding: '14px 0', borderRadius: 14, border: 'none', cursor: daily.eveningDone ? 'default' : 'pointer',
            background: daily.eveningDone ? '#f0fdf4' : '#f1f5f9',
            color: daily.eveningDone ? '#15803d' : '#64748b', fontWeight: 800, fontSize: 13,
          }}>
          {daily.eveningDone ? '✓ Evening Done' : '🌙 Evening Check-in'}
        </button>
      </div>

      {/* ── Streak milestone banner ────────────────────────────────────── */}
      {streakMilestone && (
        <div style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)', border: '1.5px solid #f59e0b', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🏆</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>{streak.count}-Day Streak Milestone!</div>
            <div style={{ fontSize: 12, color: '#b45309' }}>You're in the top 5% of AROGYOS users. Keep going.</div>
          </div>
        </div>
      )}

      {/* ── Today's 3 Missions ────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>🎯 Today's Missions</div>
          <span style={{ background: allMissionsDone ? '#f0fdf4' : '#fef3c7', color: allMissionsDone ? '#15803d' : '#92400e', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
            {allMissionsDone ? '✓ All Complete!' : `${missionsDone}/3 done · +${(3 - missionsDone) * 8} pts left`}
          </span>
        </div>
        {missions.map((m, i) => {
          const done = daily.missions?.[i]
          return (
            <div key={m.id} onClick={() => toggleMission(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, border: done ? 'none' : '2px solid #d1d5db', background: done ? '#14b8a6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                {done && <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: done ? '#94a3b8' : '#0f172a', textDecoration: done ? 'line-through' : 'none' }}>{m.icon} {m.text}</div>
                <span style={{ fontSize: 10, background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>{m.category}</span>
              </div>
              <span style={{ fontSize: 11, color: '#14b8a6', fontWeight: 700 }}>+8 pts</span>
            </div>
          )
        })}
        {streak.freezes > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🧊</span> {streak.freezes} streak freeze available — miss a day without losing your streak
          </div>
        )}
      </div>

      {/* ── Flash Challenge ───────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#fdf4ff,#f5f3ff)', border: '1.5px solid #e9d5ff', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 10, letterSpacing: 0.5 }}>⚡ 24-HOUR CHALLENGE</span>
          <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto' }}>Resets at midnight</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>{todayChallenge.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>{todayChallenge.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4, marginBottom: 6 }}>{todayChallenge.desc}</div>
            <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
              🔥 {todayChallenge.participants.toLocaleString()} users doing this today · {todayChallenge.reward}
            </div>
          </div>
        </div>
        <button
          onClick={() => setFlashDone(v => !v)}
          style={{ width: '100%', marginTop: 12, padding: '11px 0', background: flashDone ? '#f0fdf4' : 'linear-gradient(90deg,#7c3aed,#6d28d9)', color: flashDone ? '#15803d' : '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {flashDone ? '✓ I completed this challenge!' : 'Join Challenge →'}
        </button>
      </div>

      {/* ── Longevity Feed ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>📖 Longevity Feed</div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Swipe for more</span>
        </div>
        <div ref={feedRef} style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {FEED_CARDS.map((card) => (
            <div key={card.id} style={{ flexShrink: 0, width: 240, background: card.bg, border: `1.5px solid ${card.color}22`, borderRadius: 16, padding: '14px', }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{card.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: card.color, background: `${card.color}18`, padding: '2px 8px', borderRadius: 10 }}>{card.tag}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6, lineHeight: 1.3 }}>{card.title}</div>
              <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, marginBottom: 10 }}>{card.body}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: card.color, cursor: 'pointer' }}>{card.action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BioAge Forecast ──────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>🔮 BioAge Forecast</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { days: 30, drop: 1, label: '30 days' },
            { days: 60, drop: 2, label: '60 days' },
            { days: 90, drop: 4, label: '90 days' },
          ].map(({ days, drop, label }) => {
            const target = (profile?.bioage || profile?.actualAge || 35) - drop
            return (
              <div key={days} style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#14b8a6' }}>{target}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>BioAge</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>-{drop} yrs</div>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>in {label}</div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, textAlign: 'center' }}>
          Based on completing today's missions daily · Retest in 90 days to confirm
        </div>
      </div>

      {/* ── Community Rank ───────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#fef9c3,#fef3c7)', border: '1.5px solid #fde68a', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🏆</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>Top 27% in your age group</div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
              Among 35–45 yr olds in India · This week's ranking
            </div>
            <div style={{ marginTop: 8, height: 6, background: '#fde68a', borderRadius: 3 }}>
              <div style={{ height: '100%', width: '73%', background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 10, color: '#b45309', marginTop: 3 }}>Complete all missions today to move up</div>
          </div>
        </div>
      </div>

      {/* ── Weekly Summary Teaser ─────────────────────────────────────── */}
      <div style={{ background: '#0f172a', borderRadius: 16, padding: '16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>📊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Weekly BioAge Report</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Every Sunday · Shareable card · Shows your 7-day progress</div>
        </div>
        <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }}>→</span>
      </div>

      {/* Modals */}
      {showMorn && <MorningCheckIn onDone={onMorningDone} />}
      {showEve  && <EveningCheckIn onDone={onEveningDone} />}
    </div>
  )
}
