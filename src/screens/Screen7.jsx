import { useNavigate } from 'react-router-dom'

const BIOMARKERS = [
  { name: 'hsCRP (inflammation)', before: '3.1', after: '1.2', unit: 'mg/L' },
  { name: 'HbA1c',                before: '5.9', after: '5.5', unit: '%'    },
  { name: 'LDL Cholesterol',      before: '142', after: '118', unit: 'mg/dL'},
  { name: 'VO2 Max (est.)',        before: '31',  after: '36',  unit: 'ml/kg/min'},
]

export default function Screen7() {
  const nav = useNavigate()
  return (
    <div className="screen">
      <div className="status-bar"><span>9:41</span><span>●●●● 100%</span></div>
      <button className="nav-back">← Your Progress</button>

      <div className="years-card">
        <div className="lbl">Years Reversed Since You Started</div>
        <div className="big">2.1 yrs</div>
        <div className="desc2">BioAge 36.2 → 34.1 over 4 months · Top 20% improvement this month</div>
      </div>

      <div className="card">
        <div className="card-title">BioAge vs Actual Age</div>
        <div className="chart-legend"><span className="a">Actual age</span><span className="b">BioAge</span></div>
        <div className="line-chart"></div>
        <div className="bar-lbls"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span></div>
        <span className="top-badge">Top 15% for my age group</span>
        <div className="cta-link">Check yours at healthos.app</div>
      </div>

      <div className="card-title">Biomarker Changes</div>
      {BIOMARKERS.map(b => (
        <div key={b.name} className="bio-row">
          <span className="name">{b.name}</span>
          <span className="vals">{b.before} → <b>{b.after}</b> {b.unit}</span>
        </div>
      ))}

      <div className="share-notice">
        <span>📤</span>
        <span><b>Share your transformation</b> — Post your "2.1 years reversed" card to Instagram or WhatsApp.</span>
      </div>
    </div>
  )
}
