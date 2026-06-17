import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/userProfile'

export default function Screen2() {
  const nav     = useNavigate()
  const profile = getProfile()

  if (!profile?.quizDone) {
    return (
      <div className="screen">
        <button className="nav-back">← Your BioAge Trends</button>
        <div className="empty-state">
          <div className="es-icon">📈</div>
          <div className="es-title">No trend data yet</div>
          <div className="es-body">
            Complete your BioAge quiz on the Home screen to get your baseline score.
            Upload lab reports over time and AROGYOS will automatically track how your biological age changes.
          </div>
          <button className="es-cta" onClick={() => nav('/')}>Go to Home →</button>
        </div>
      </div>
    )
  }

  const { bioage, actualAge } = profile
  const delta = actualAge - bioage

  return (
    <div className="screen">
      <button className="nav-back">← Your BioAge Trends</button>

      <div className="ring-wrap">
        <div className="ring">
          <div className="n">{bioage}</div>
          <div className="s">
            BIOAGE · {delta > 0 ? `${delta}Y YOUNGER` : delta < 0 ? `${Math.abs(delta)}Y OLDER` : 'ON TRACK'}
          </div>
        </div>
      </div>

      <div className="stat-row">
        <div className="s"><div className="v">—</div><div className="l">Recovery Score</div></div>
        <div className="s"><div className="v">—</div><div className="l">Avg Sleep</div></div>
        <div className="s"><div className="v">—</div><div className="l">Active Days</div></div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 4, marginBottom: 16 }}>
        Connect a wearable to see live recovery, sleep & activity data
      </div>

      {/* BioAge baseline */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 10 }}>Your BioAge Baseline</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Current BioAge (quiz estimate)</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#14b8a6' }}>{bioage} yrs</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>Actual age</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{actualAge} yrs</div>
          </div>
        </div>
        <div style={{ marginTop: 10, padding: '8px 12px', background: delta > 0 ? '#f0fdf4' : '#fff8f0', borderRadius: 8, fontSize: 12, color: delta > 0 ? '#15803d' : '#92400e', fontWeight: 600 }}>
          {delta > 0
            ? `You are ${delta} years biologically younger than your actual age`
            : delta < 0
            ? `Your BioAge is ${Math.abs(delta)} years above actual — this is reversible`
            : 'Your BioAge matches your actual age — on track'}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
          Based on lifestyle quiz · Upload a lab report for a precise, biomarker-based score
        </div>
      </div>

      {/* Biomarker trends — empty state */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Biomarker Trend Charts</div>
        <div style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧪</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            No biomarker data yet
          </div>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>
            Upload your blood test report and AROGYOS will extract all biomarkers automatically.
            After 2 uploads, your real trends appear here — hsCRP, HbA1c, LDL, Vitamin D and more.
          </div>
          <button
            onClick={() => nav('/upload')}
            style={{ padding: '12px 24px', background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Upload Lab Report →
          </button>
        </div>
      </div>

      <div className="card">
        <div className="coach-badge">Health Guide</div>
        <div className="insight-text">
          Your quiz-based BioAge estimate is <b>{bioage}</b> vs your actual age of <b>{actualAge}</b>.
          Upload your blood test to get a biomarker-precise score and a personalised action plan.
        </div>
        <span className="coach-link" onClick={() => nav('/upload')}>→ Upload a lab report</span>
      </div>

      <button className="share-bioage-btn" onClick={() => nav('/share')}>Share My BioAge Card</button>
    </div>
  )
}
