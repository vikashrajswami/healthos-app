import { useNavigate } from 'react-router-dom'

export default function Screen2() {
  const nav = useNavigate()
  return (
    <div className="screen">
      <div className="status-bar"><span>9:41</span><span>●●●● 100%</span></div>
      <button className="nav-back">← Your BioAge</button>

      <div className="ring-wrap">
        <div className="ring">
          <div className="n">34</div>
          <div className="s">BIOAGE · 7Y YOUNGER</div>
        </div>
      </div>

      <div className="stat-row">
        <div className="s"><div className="v">82</div><div className="l">Recovery Score</div></div>
        <div className="s"><div className="v">7.2h</div><div className="l">Avg Sleep</div></div>
        <div className="s"><div className="v">5/7</div><div className="l">Active Days</div></div>
      </div>

      <div className="card-title">BioAge — Last 6 Months</div>
      <div className="bars">
        <div style={{height:'80%'}}/>
        <div style={{height:'70%'}}/>
        <div style={{height:'62%'}}/>
        <div className="hi" style={{height:'50%'}}/>
        <div className="hi" style={{height:'42%'}}/>
        <div className="hi" style={{height:'32%'}}/>
      </div>
      <div className="bar-lbls"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>

      <div className="card-title" style={{marginTop:6}}>What's Moving Your BioAge</div>
      <div className="move-row"><span>Sleep consistency</span><span className="tag">-1.2 yrs</span></div>
      <div className="move-row"><span>Daily activity</span><span className="tag">-0.8 yrs</span></div>
      <div className="move-row"><span>Blood pressure trend</span><span className="tag bad">+0.5 yrs</span></div>

      <div className="card">
        <div className="coach-badge">+ AI Coach</div>
        <div className="insight-text">
          Your BioAge improved by 0.4 years this month — mainly from better sleep consistency. Your blood pressure trend is slightly elevated though.
        </div>
        <span className="coach-link">— See your 2-week action plan</span>
      </div>

      <button className="share-bioage-btn" onClick={() => nav('/share')}>Share My BioAge Card</button>
    </div>
  )
}
