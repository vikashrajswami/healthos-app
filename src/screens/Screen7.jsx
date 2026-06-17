import { useNavigate } from 'react-router-dom'
import { getProfile } from '../lib/userProfile'

export default function Screen7() {
  const nav     = useNavigate()
  const profile = getProfile()

  return (
    <div className="screen">
      <button className="nav-back">← Your Progress</button>

      {profile?.quizDone ? (
        <div className="years-card">
          <div className="lbl">Current BioAge · {profile.name}</div>
          <div className="big">{profile.bioage} yrs</div>
          <div className="desc2">
            Actual age: {profile.actualAge} ·
            {profile.bioage < profile.actualAge
              ? ` ${profile.actualAge - profile.bioage} years biologically younger`
              : profile.bioage > profile.actualAge
              ? ` ${profile.bioage - profile.actualAge} years above ideal — reversible`
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

      {/* Trend chart — needs 2+ data points */}
      <div className="card">
        <div className="card-title">BioAge vs Actual Age Trend</div>
        <div className="trend-empty-chart">
          <div className="tec-icon">📊</div>
          <div className="tec-text">
            Upload your first lab report to start tracking biomarker changes over time.
            After 2 uploads, your progress trend will appear here automatically.
          </div>
          <button className="tec-btn" onClick={() => nav('/upload')}>Upload Lab Report →</button>
        </div>
      </div>

      {/* Biomarker changes — needs real lab data */}
      <div className="card-title">Biomarker Changes</div>
      <div className="bm-empty-card">
        <div className="bm-empty-icon">🩸</div>
        <div className="bm-empty-title">No biomarker data yet</div>
        <div className="bm-empty-body">
          Upload two lab reports (before and after) and AROGYOS will automatically show how your key markers changed — hsCRP, HbA1c, LDL, testosterone, vitamins, and more.
        </div>
        <button className="bm-empty-btn" onClick={() => nav('/upload')}>Upload First Report →</button>
      </div>

      <div className="share-notice">
        <span>📤</span>
        <span>Once you have real progress data, you can share your transformation card on WhatsApp or Instagram.</span>
      </div>
    </div>
  )
}
