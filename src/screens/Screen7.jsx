import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/userProfile'

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
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
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

      {/* Stats row — only real data */}
      {profile?.quizDone && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'BioAge',    val: `${bioage}`,  sub: `vs ${actualAge} actual`,  color: '#14b8a6' },
            { label: 'Difference', val: delta > 0 ? `−${delta}` : delta < 0 ? `+${Math.abs(delta)}` : '±0', sub: 'years from actual', color: delta > 0 ? '#0d9488' : '#e08c3b' },
            { label: 'Reports',   val: '0',          sub: 'uploaded so far',         color: '#6366f1' },
          ].map(c => (
            <div key={c.label} style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: c.color }}>{c.val}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload CTA */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>BioAge Progress Tracking</div>
        <div className="trend-empty-chart">
          <div className="tec-icon">📊</div>
          <div className="tec-text">
            Upload your first lab report to start tracking real biomarker changes.
            After 2 uploads your progress trend — hsCRP, HbA1c, LDL, Vitamin D and more — appears here automatically.
          </div>
          <button className="tec-btn" onClick={() => nav('/upload')}>Upload Lab Report →</button>
        </div>
      </div>

      {/* Biomarker before/after — empty state */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Biomarker Before vs After</div>
        <div style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🧬</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            No comparison data yet
          </div>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            Once you upload two or more lab reports over time, AROGYOS will show you the exact before vs after
            change for every biomarker — automatically.
          </div>
        </div>
      </div>

      <div className="share-notice">
        <span>📤</span>
        <span>Once you have real progress data, you can share your transformation card on WhatsApp or Instagram.</span>
      </div>

      <div style={{ height: 20 }} />
    </div>
  )
}
