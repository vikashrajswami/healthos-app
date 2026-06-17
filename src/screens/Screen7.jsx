import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/userProfile'

const DEMO_BIOMARKERS = [
  { name: 'hsCRP',     before: 3.1,  after: 1.2,  unit: 'mg/L',  better: 'down', flag: 'ok'   },
  { name: 'HbA1c',     before: 5.9,  after: 5.3,  unit: '%',     better: 'down', flag: 'ok'   },
  { name: 'LDL',       before: 142,  after: 112,   unit: 'mg/dL', better: 'down', flag: 'ok'   },
  { name: 'Vitamin D', before: 18,   after: 44,    unit: 'ng/mL', better: 'up',   flag: 'ok'   },
  { name: 'Vitamin B12',before: 210, after: 380,   unit: 'pg/mL', better: 'up',   flag: 'ok'   },
  { name: 'Triglycerides',before:188,after: 142,   unit: 'mg/dL', better: 'down', flag: 'warn' },
]

export default function Screen7() {
  const nav     = useNavigate()
  const profile = getProfile()

  const bioage    = profile?.bioage    ?? 0
  const actualAge = profile?.actualAge ?? 0
  const delta     = actualAge - bioage

  return (
    <div className="screen">
      <button className="nav-back">← Your Progress</button>

      {profile?.quizDone ? (
        <div className="years-card">
          <div className="lbl">Current BioAge · {profile.name}</div>
          <div className="big">{bioage} yrs</div>
          <div className="desc2">
            Actual age: {actualAge} ·
            {delta > 0
              ? ` ${delta} years biologically younger`
              : delta < 0
              ? ` ${Math.abs(delta)} years above ideal — reversible`
              : ' On track with actual age'}
          </div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:4}}>
            Based on lifestyle quiz · Upload lab report for precise score
          </div>
        </div>
      ) : (
        <div className="years-card">
          <div className="lbl">Years Reversed</div>
          <div className="big">—</div>
          <div className="desc2">Complete your BioAge quiz to establish your baseline</div>
        </div>
      )}

      {/* Progress overview */}
      {profile?.quizDone && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'BioAge', val: `${bioage}`, sub: `vs ${actualAge} actual`, color: '#14b8a6' },
            { label: 'Δ', val: delta > 0 ? `−${delta}` : delta < 0 ? `+${Math.abs(delta)}` : '±0', sub: 'years from actual', color: delta > 0 ? '#0d9488' : '#e08c3b' },
            { label: 'Goal', val: `${bioage - 3}`, sub: 'projected in 90d', color: '#6366f1' },
          ].map(c => (
            <div key={c.label} style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: c.color }}>{c.val}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trend chart placeholder → upload CTA */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>BioAge vs Actual Age Trend</div>
        <div className="trend-empty-chart">
          <div className="tec-icon">📊</div>
          <div className="tec-text">
            Upload your first lab report to start tracking biomarker changes over time.
            After 2 uploads, your real progress trend appears here automatically.
          </div>
          <button className="tec-btn" onClick={() => nav('/upload')}>Upload Lab Report →</button>
        </div>
      </div>

      {/* Sample biomarker progress */}
      <div className="card-title">Biomarker Changes · Sample Data</div>
      <div style={{ background: '#fff8f0', border: '1px solid #fed7aa', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: '#92400e' }}>
        📊 Sample showing what your progress could look like · Upload two lab reports to see your real changes
      </div>

      {DEMO_BIOMARKERS.map(bm => {
        const change   = bm.better === 'down' ? bm.before - bm.after : bm.after - bm.before
        const improved = change > 0
        const pct      = Math.round((Math.abs(bm.after - bm.before) / bm.before) * 100)
        return (
          <div key={bm.name} style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', marginBottom: 10, gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{bm.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {bm.before} → <b style={{ color: improved ? '#0d9488' : '#e08c3b' }}>{bm.after}</b> {bm.unit}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: improved ? '#0d9488' : '#e08c3b' }}>
                {improved ? '↓' : '↑'} {pct}%
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>improvement</div>
            </div>
          </div>
        )
      })}

      <div className="share-notice">
        <span>📤</span>
        <span>Once you have real progress data, you can share your transformation card on WhatsApp or Instagram.</span>
      </div>

      <div style={{height:20}}/>
    </div>
  )
}
