import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PRICING = {
  india: {
    monthly:   { price: '₹99',  period: '/month',    save: null,         badge: null },
    halfyear:  { price: '₹299', period: '/6 months', save: 'Save ₹295',  badge: 'Popular' },
    annual:    { price: '₹399', period: '/year',     save: 'Save ₹789',  badge: 'Best Value' },
  },
  intl: {
    monthly:   { price: '$20',  period: '/month',    save: null,         badge: null },
    halfyear:  { price: '$49',  period: '/6 months', save: 'Save $71',   badge: 'Popular' },
    annual:    { price: '$99',  period: '/year',     save: 'Save $141',  badge: 'Best Value' },
  },
}

export default function Screen9() {
  const [region, setRegion]   = useState('india')
  const [billing, setBilling] = useState('annual')
  const [payMethod, setPayMethod] = useState('upi')
  const nav = useNavigate()

  const p   = PRICING[region][billing]
  const isIndia = region === 'india'

  return (
    <div className="screen">
      <div className="sub-title">Unlock Full AROGYOS</div>
      <p className="sub-desc">Unlimited reports · Family BioAge · Health Guide · Personalised diet · All devices</p>

      {/* Region toggle */}
      <div className="region-row">
        <div className={`r ${region==='india'?'active':''}`} onClick={() => { setRegion('india'); setPayMethod('upi') }}>🇮🇳 India</div>
        <div className={`r ${region==='intl'?'active':''}`}  onClick={() => { setRegion('intl');  setPayMethod('card') }}>🌍 International</div>
      </div>

      {/* Billing cycle */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[['monthly','Monthly'],['halfyear','6 Months'],['annual','Annual']].map(([key,label]) => {
          const meta = PRICING[region][key]
          return (
            <button key={key} onClick={() => setBilling(key)} style={{
              flex:1, padding:'10px 4px', borderRadius:12, border:'none', cursor:'pointer',
              background: billing===key ? 'linear-gradient(135deg,#14b8a6,#059669)' : '#f1f5f9',
              color: billing===key ? 'white' : '#64748b',
              fontWeight: billing===key ? 700 : 500, fontSize:12,
              position:'relative', transition:'all .15s',
            }}>
              {meta.badge && billing!==key && (
                <span style={{
                  position:'absolute', top:-7, left:'50%', transform:'translateX(-50%)',
                  background:'#e0b341', color:'white', fontSize:8, fontWeight:800,
                  borderRadius:4, padding:'1px 5px', whiteSpace:'nowrap',
                }}>{meta.badge}</span>
              )}
              {label}
              {meta.save && <div style={{ fontSize:9, opacity: billing===key ? 0.85 : 0.7, marginTop:1 }}>{meta.save}</div>}
            </button>
          )
        })}
      </div>

      {/* Plan card */}
      <div className="plus-card" style={{ position:'relative' }}>
        <div className="days-badge">30 DAYS FREE</div>
        <div className="pname">AROGYOS Plus</div>
        <div className="price">
          {p.price}
          <small>{p.period}</small>
        </div>
        {p.save && (
          <div style={{
            display:'inline-block', background:'rgba(255,255,255,0.18)',
            borderRadius:8, padding:'3px 10px', fontSize:11, fontWeight:700, marginBottom:8,
          }}>{p.save}</div>
        )}
        <div className="feat">
          ✓ Unlimited lab report uploads & AI analysis<br/>
          ✓ Full family BioAge dashboard (up to 6 members)<br/>
          ✓ Personalised age-reversal diet plan<br/>
          ✓ All device connections (rings, wearables, CGM)<br/>
          ✓ Health Vault — lifetime history<br/>
          ✓ Priority Health Guide responses<br/>
          ✓ Cancel anytime during trial — pay nothing
        </div>
      </div>

      {/* Payment method */}
      <div className="pay-title">Payment Method</div>
      <div className="pay-row">
        {isIndia && (
          <div className={`p ${payMethod==='upi'?'active':''}`} onClick={() => setPayMethod('upi')}>UPI</div>
        )}
        <div className={`p ${payMethod==='card'?'active':''}`} onClick={() => setPayMethod('card')}>Credit / Debit Card</div>
      </div>

      <div className="fine-print">
        🔒 Free for 30 days · then {p.price}{p.period} · billed automatically unless cancelled ·
        Secure payment via {isIndia ? 'Razorpay' : 'Paddle'} · PCI-DSS certified
      </div>

      <button className="start-trial-btn" onClick={() => nav('/payment', { state: { region, billing } })}>
        Start 30-Day Free Trial →
      </button>

      {/* Free tier */}
      <div className="free-card">
        <div className="pname">Free Forever</div>
        <div className="price">₹0</div>
        <div className="feat">
          ✓ BioAge estimate from quiz<br/>
          ✓ 1 report upload / month<br/>
          ✓ 5 Health Guide chats / month<br/>
          ✓ Basic habit protocol
        </div>
        <button className="continue-btn" onClick={() => nav('/home')}>Continue Free</button>
      </div>

      <div style={{ textAlign:'center', padding:'16px 0 8px', fontSize:11, color:'#94a3b8' }}>
        30-day money-back guarantee · Cancel anytime · No hidden charges
      </div>
    </div>
  )
}
