import { useNavigate } from 'react-router-dom'

export default function Screen1() {
  const nav = useNavigate()
  return (
    <div className="screen">
      <div className="status-bar"><span>9:41</span><span>●●●● 100%</span></div>
      <div className="hero">
        <div className="lbl">Your Biological Age</div>
        <div className="big">34 <span className="big-sub">vs actual age 41</span></div>
        <div className="delta">↓ 7 years younger · improved 0.4 this month</div>
        <div className="btns">
          <button className="b1" onClick={() => nav('/trends')}>View Trends</button>
          <button className="b2" onClick={() => nav('/share')}>Share Card</button>
        </div>
      </div>

      <div className="card">
        <div className="insight-text">
          Your hsCRP (inflammation) is improving, but LDL is still high. Sleep consistency is your highest-leverage habit this month.
        </div>
        <div className="ask-row">
          <div className="ask-row-label">
            <span>Not sure what this means?</span>
            <span className="ask-row-sub">Ask a real doctor — replies within 24h</span>
          </div>
          <button className="ask-btn">Ask →</button>
        </div>
      </div>

      <div className="fam-title">Your Family's BioAge</div>
      <div className="fam-row">
        <div className="fam-card">
          <div className="av">M</div>
          <div className="nm">Mom</div>
          <div className="ag">52</div>
          <div className="dl up">+3 yrs</div>
        </div>
        <div className="fam-card">
          <div className="av">D</div>
          <div className="nm">Dad</div>
          <div className="ag">58</div>
          <div className="dl dn">-2 yrs</div>
        </div>
        <div className="fam-card fam-add">+ Add member</div>
      </div>

      <div className="build-title">Build Your BioAge</div>
      <div className="action-card" onClick={() => nav('/upload')}>
        <div className="ic3">📄</div>
        <div className="meta">
          <div className="t">Upload a Lab Report</div>
          <div className="s">PDF or photo — AI reads your biomarkers</div>
        </div>
        <span className="go">Upload →</span>
      </div>
      <div className="action-card" onClick={() => nav('/devices')}>
        <div className="ic3">⌚</div>
        <div className="meta">
          <div className="t">Connect a Device</div>
          <div className="s">Oura, WHOOP, Apple Watch, Fitbit & more</div>
        </div>
        <span className="go">Connect →</span>
      </div>

      <div className="why-title">Why HealthOS Plus</div>
      <div className="why-row"><span className="c">✓</span><span><b>Bring your own reports</b> — no lab tie-up needed, works with any diagnostic center</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>Your data is always yours</b> — BioAge history stays accessible even if you cancel</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>No surprise renewals</b> — reminder 7 days before any charge, 30 days free first</span></div>
      <div className="why-row"><span className="c">✓</span><span><b>Available worldwide</b> — ₹399/yr in India, $99/yr internationally</span></div>
    </div>
  )
}
