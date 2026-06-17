import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const PRICING = {
  india: {
    monthly:  { price: '₹99',  amount: 99,  period: '/month',    billingLabel: 'Billed monthly',        save: null        },
    halfyear: { price: '₹299', amount: 299, period: '/6 months', billingLabel: 'Billed every 6 months', save: 'Save ₹295' },
    annual:   { price: '₹399', amount: 399, period: '/year',     billingLabel: 'Billed annually',       save: 'Save ₹789' },
  },
  intl: {
    monthly:  { price: '$20', amount: 20,  period: '/month',    billingLabel: 'Billed monthly',        save: null       },
    halfyear: { price: '$49', amount: 49,  period: '/6 months', billingLabel: 'Billed every 6 months', save: 'Save $71' },
    annual:   { price: '$99', amount: 99,  period: '/year',     billingLabel: 'Billed annually',       save: 'Save $141'},
  },
}

const FEATURES = [
  'Unlimited lab report uploads & AI biomarker extraction',
  'Full biological age analysis and tracking',
  'Family BioAge dashboard (up to 6 members)',
  'Personalised age-reversal diet plan',
  'Health Vault — lifetime history',
  'Priority Health Guide responses',
  'Cancel anytime during trial — pay nothing',
]

function fmtCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function fmtExp(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d
}

export default function PaymentScreen() {
  const nav      = useNavigate()
  const location = useLocation()

  const st = location.state || {}
  const [region,  setRegion]  = useState(st.region  || 'india')
  const [billing, setBilling] = useState(st.billing || 'annual')

  const plan = PRICING[region][billing]
  const isIN = region === 'india'

  const [step,    setStep]    = useState('form')
  const [method,  setMethod]  = useState(isIN ? 'upi' : 'card')
  const [upi,     setUpi]     = useState('')
  const [card,    setCard]    = useState({ num: '', exp: '', cvv: '', name: '' })
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    if (method === 'upi') {
      if (!/^[\w.\-]+@[\w]+$/.test(upi)) return 'Enter a valid UPI ID (e.g. name@upi)'
    } else {
      const raw = card.num.replace(/\s/g, '')
      if (raw.length < 16) return 'Enter a valid 16-digit card number'
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) return 'Enter expiry as MM/YY'
      const [m, y] = card.exp.split('/').map(Number)
      const now = new Date()
      if (m < 1 || m > 12 || (y + 2000) < now.getFullYear() || ((y + 2000) === now.getFullYear() && m < now.getMonth() + 1)) return 'Card has expired'
      if (card.cvv.length < 3) return 'Enter a valid CVV'
      if (card.name.trim().length < 2) return 'Enter the name on card'
    }
    return null
  }

  function pay() {
    const e = validate()
    if (e) return setErr(e)
    setErr('')
    setLoading(true)
    // Simulated payment — replace with Razorpay (India) or Stripe (International) SDK call
    setTimeout(() => { setLoading(false); setStep('success') }, 1800)
  }

  const inp = {
    width: '100%', padding: '13px 14px',
    background: '#f8fafb', border: '1.5px solid #e2e8f0',
    borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', color: '#0f172a',
  }

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#14b8a6,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24, color: '#fff', fontWeight: 800 }}>✓</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>You're in — 30 days free!</div>
      <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, maxWidth: 320, marginBottom: 8 }}>
        <strong>AROGYOS Plus</strong> trial is now active.<br/>
        A confirmation will be sent to your registered contact.
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 32 }}>Powered by {isIN ? 'Razorpay' : 'Stripe'} · PCI DSS compliant</div>
      <button onClick={() => nav('/')} style={{ padding: '15px 36px', background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
        Open AROGYOS →
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', padding: '36px 24px 24px' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#9fd9cf', fontSize: 13, cursor: 'pointer', fontWeight: 600, marginBottom: 16, padding: 0 }}>
          ← Back
        </button>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Complete Payment</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>30-day free trial · Cancel anytime</div>

        {/* Region toggle */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            {[['india','🇮🇳 INR'],['intl','🌍 USD']].map(([id, label]) => (
              <button key={id} onClick={() => { setRegion(id); setMethod(id === 'india' ? 'upi' : 'card'); setErr('') }} style={{
                padding: '6px 14px', border: 'none', borderRadius: 18, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: region === id ? '#fff' : 'none',
                color: region === id ? '#0f172a' : 'rgba(255,255,255,0.45)',
                transition: 'all .15s',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 18px 60px' }}>

        {/* Billing cycle */}
        <div style={{ display: 'flex', gap: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 4, marginBottom: 18 }}>
          {[['monthly','Monthly'],['halfyear','6 Months'],['annual','Annual']].map(([key, label]) => (
            <button key={key} onClick={() => setBilling(key)} style={{
              flex: 1, padding: '10px 4px', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: billing === key ? 'linear-gradient(135deg,#0f3a3a,#0a2424)' : 'none',
              color: billing === key ? '#14b8a6' : '#94a3b8',
              position: 'relative', transition: 'all .15s',
            }}>
              {key === 'annual' && billing !== 'annual' && (
                <span style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: '#14b8a6', color: '#fff', fontSize: 8, fontWeight: 800, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>BEST</span>
              )}
              {label}
              {PRICING[region][key].save && (
                <div style={{ fontSize: 9, opacity: 0.75, marginTop: 2 }}>{PRICING[region][key].save}</div>
              )}
            </button>
          ))}
        </div>

        {/* Order summary */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg,#14b8a6,#059669)' }}/>
          <div style={{ padding: '18px 18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>AROGYOS Plus</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>30-day free trial included</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{plan.billingLabel}{isIN ? ' · 18% GST inclusive' : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#14b8a6' }}>{plan.price}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{plan.period}</div>
              </div>
            </div>

            {plan.save && (
              <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#059669', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
                {plan.save} vs monthly
              </div>
            )}

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
                  <span style={{ color: '#14b8a6', fontWeight: 700, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 12, color: '#334155', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment form */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ padding: '18px 18px 22px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Payment Method</div>

            {isIN && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
                {[['upi','⚡ UPI'],['card','💳 Card']].map(([id, label]) => (
                  <button key={id} onClick={() => { setMethod(id); setErr('') }} style={{
                    flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: method === id ? '#fff' : 'none',
                    color: method === id ? '#0f172a' : '#94a3b8',
                    boxShadow: method === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all .15s',
                  }}>{label}</button>
                ))}
              </div>
            )}
            {!isIN && (
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 16 }}>💳 Credit / Debit Card</div>
            )}

            {method === 'upi' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>UPI ID</div>
                <input style={inp} placeholder="yourname@upi / @paytm / @ybl"
                  value={upi} onChange={e => setUpi(e.target.value.toLowerCase())}/>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>PhonePe · Google Pay · Paytm · BHIM · All UPI apps</div>
              </div>
            )}

            {method === 'card' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Card Number</div>
                  <input style={inp} placeholder="1234 5678 9012 3456" inputMode="numeric"
                    value={card.num} onChange={e => setCard(c => ({ ...c, num: fmtCard(e.target.value) }))}/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Expiry (MM/YY)</div>
                    <input style={inp} placeholder="MM/YY" inputMode="numeric"
                      value={card.exp} onChange={e => setCard(c => ({ ...c, exp: fmtExp(e.target.value) }))}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>CVV</div>
                    <input style={{ ...inp }} placeholder="•••" inputMode="numeric" maxLength={4} type="password"
                      value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}/>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Name on Card</div>
                  <input style={inp} placeholder="As printed on card"
                    value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))}/>
                </div>
              </>
            )}

            {err && (
              <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 14, fontWeight: 600 }}>⚠ {err}</div>
            )}

            <button onClick={pay} disabled={loading} style={{
              width: '100%', padding: 17,
              background: 'linear-gradient(90deg,#14b8a6,#059669)',
              color: '#fff', border: 'none', borderRadius: 13, fontSize: 16, fontWeight: 800,
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 6px 24px rgba(20,184,166,0.35)',
              opacity: loading ? .7 : 1, transition: 'opacity .15s',
            }}>
              {loading ? 'Processing…' : 'Start 30-Day Free Trial →'}
            </button>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              {['🔒 SSL Encrypted', '✅ PCI DSS', isIN ? '⚡ Razorpay' : '💳 Stripe', '↩️ 30-day Refund'].map(b => (
                <span key={b} style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.7, padding: '0 8px' }}>
          Free for 30 days · then {plan.price}{plan.period} · billed automatically unless cancelled ·
          Reminder sent 7 days before charge · Cancel anytime in Settings
        </div>
      </div>
    </div>
  )
}
