import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Screen9() {
  const [region, setRegion] = useState('india')
  const [payMethod, setPayMethod] = useState('upi')
  const nav = useNavigate()
  return (
    <div className="screen">
      <div className="status-bar"><span>9:41</span><span>●●●● 100%</span></div>
      <div className="sub-title">Unlock Full BioAge Insights</div>
      <p className="sub-desc">Track your whole family's biological age, get unlimited AI coaching, and a personalized age-reversal meal plan.</p>

      <div className="region-row">
        <div className={`r ${region==='india'?'active':''}`} onClick={() => setRegion('india')}>🇮🇳 India</div>
        <div className={`r ${region==='intl'?'active':''}`}  onClick={() => setRegion('intl')}>🌍 International</div>
      </div>

      <div className="plus-card">
        <div className="days-badge">30 DAYS FREE</div>
        <div className="pname">HealthOS Plus</div>
        <div className="price">{region==='india'?'₹399':'$99'} <small>/ year</small></div>
        <div className="feat">
          ✓ Full family BioAge dashboard<br/>
          ✓ <b>Unlimited AI coach</b> + doctor escalation<br/>
          ✓ Unlimited report uploads & analysis<br/>
          ✓ Personalized age-reversal diet plan<br/>
          ✓ Unlimited device connections (smart rings, wearables, CGM, scales...)<br/>
          ✓ Cancel anytime during trial — pay nothing
        </div>
      </div>

      <div className="pay-title">Payment Method</div>
      <div className="pay-row">
        <div className={`p ${payMethod==='upi'?'active':''}`} onClick={() => setPayMethod('upi')}>UPI</div>
        <div className={`p ${payMethod==='card'?'active':''}`} onClick={() => setPayMethod('card')}>Credit / Debit Card</div>
      </div>

      <div className="fine-print">
        🔒 Free for 30 days, then {region==='india'?'₹399':'$99'}/year — billed automatically unless you cancel. A valid {payMethod==='upi'?'UPI ID or card':'card'} is required to start (no test/dummy details — real payment info only).
      </div>

      <button className="start-trial-btn">Start 30-Day Free Trial</button>

      <div className="free-card">
        <div className="pname">Free</div>
        <div className="price">₹0</div>
        <div className="feat">
          ✓ Basic BioAge estimate, always visible<br/>
          ✓ 1 family member<br/>
          ✓ 5 AI chats / month
        </div>
        <button className="continue-btn" onClick={() => nav('/')}>Continue Free</button>
      </div>
    </div>
  )
}
