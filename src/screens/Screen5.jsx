import { useNavigate } from 'react-router-dom'

export default function Screen5() {
  const nav = useNavigate()
  return (
    <div className="screen">
      <div className="status-bar"><span>9:41</span><span>●●●● 100%</span></div>
      <button className="nav-back">← Your Longevity Protocol</button>

      <div className="proj-card">
        <div className="lbl">12-Week Projection</div>
        <div className="big">-2.4 yrs BioAge</div>
        <div className="desc2">Based on your latest panel and clinical trial data (CALERIE, Helfgott Protocol) for adults with your profile.</div>
      </div>

      <div className="day-row">
        <span>Day 23 <span className="of">of 84</span></span>
        <span className="of">4 active habits · 12 day streak</span>
      </div>

      <div className="three-stat">
        <div className="b"><div className="v">12</div><div className="l">DAY STREAK</div></div>
        <div className="b"><div className="v">7.4h</div><div className="l">AVG SLEEP</div></div>
        <div className="b"><div className="v">5/7</div><div className="l">ACTIVE DAYS</div></div>
      </div>

      <div className="card diet-link">
        <div>
          <div className="t">Your Diet Plan</div>
          <div className="s">Personalized for age-reversal — tap to view today's meals</div>
        </div>
        <button className="view" onClick={() => nav('/diet')}>View →</button>
      </div>

      <div className="habit-head"><span>🏃 Exercise</span><span className="hv">~ -0.8 yrs</span></div>
      <div className="habit-item">
        <div className="chk on">✓</div>
        <div className="tx">
          <span className="t">2x HIIT sessions (20 min) this week</span>
          <span className="s">8 weeks of HIIT measurably reduced DunedinPACE in trials</span>
        </div>
      </div>
      <div className="habit-item">
        <div className="chk"></div>
        <div className="tx">
          <span className="t">2x resistance training sessions</span>
          <span className="s">Independently linked to younger epigenetic profiles</span>
        </div>
      </div>

      <div className="habit-head"><span>😴 Sleep</span><span className="hv">~ -0.6 yrs</span></div>
      <div className="habit-item">
        <div className="chk on">✓</div>
        <div className="tx">
          <span className="t">7-9 hrs sleep, consistent bedtime</span>
          <span className="s">Sleep is when core repair & maintenance happens</span>
        </div>
      </div>
    </div>
  )
}
