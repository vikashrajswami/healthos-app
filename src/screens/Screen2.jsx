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
            Upload lab reports over time and HealthOS will automatically track how your biological age changes.
          </div>
          <button className="es-cta" onClick={() => nav('/')}>Go to Home →</button>
        </div>
      </div>
    )
  }

  const delta = profile.actualAge - profile.bioage

  return (
    <div className="screen">
      <button className="nav-back">← Your BioAge Trends</button>

      <div className="ring-wrap">
        <div className="ring">
          <div className="n">{profile.bioage}</div>
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
      <div style={{textAlign:'center',fontSize:11,color:'#94a3b8',marginTop:4,marginBottom:8}}>
        Connect a wearable device to see live recovery, sleep and activity data
      </div>

      <div className="card-title">BioAge Trend</div>
      <div className="trend-empty-chart">
        <div className="tec-icon">📊</div>
        <div className="tec-text">
          Only 1 data point so far (your quiz estimate).
          Upload a lab report to start building your trend line.
        </div>
        <button className="tec-btn" onClick={() => nav('/upload')}>Upload Lab Report →</button>
      </div>

      <div className="card-title" style={{marginTop:6}}>What's Moving Your BioAge</div>
      <div className="move-empty">
        <div style={{fontSize:12,color:'#94a3b8',lineHeight:1.6,padding:'10px 0'}}>
          Upload a blood panel to see which biomarkers are ageing you faster — and which habits are helping.
          We track hsCRP, HbA1c, cholesterol, testosterone, Vitamin D, sleep quality, and 20+ more markers.
        </div>
      </div>

      <div className="card">
        <div className="coach-badge">AI Coach</div>
        <div className="insight-text">
          Your quiz-based BioAge estimate is <b>{profile.bioage}</b> vs your actual age of <b>{profile.actualAge}</b>.
          This is a lifestyle estimate. Upload your blood test report to get a biomarker-precise score and a personalised action plan.
        </div>
        <span className="coach-link" onClick={() => nav('/upload')}>→ Upload a lab report</span>
      </div>

      <button className="share-bioage-btn" onClick={() => nav('/share')}>Share My BioAge Card</button>
    </div>
  )
}
