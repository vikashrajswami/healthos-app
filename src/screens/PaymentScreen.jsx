import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Pricing data ──────────────────────────────────────────────────────────────
// Research basis: Whoop ($30/mo), Oura ($6/mo app), InsideTracker ($499/yr),
// HealthifyMe Pro (₹999-₹2499/mo), SRL/Lal Pathlabs tests (₹2000-₹8000),
// Thriva UK (£45/mo), Function Health ($499/yr).
// HealthOS includes AI analysis + lab service + vault — premium positioning.

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: '🌱',
    tagline: 'Begin your health journey',
    priceIN: { monthly: 999,  annual: 9590  },
    priceUS: { monthly: 12.99, annual: 124.70 },
    annualSaving: { IN: '₹2,398', US: '$31.18' },
    color: '#14b8a6',
    features: [
      'Upload & analyse 1 report/month',
      'Biological age score',
      '15 biomarker tracking',
      'Health Vault (1-year history)',
      'Basic AI insights',
      'Monthly health summary',
    ],
    excluded: ['Lab doorstep service', 'Doctor consultation', 'Family sharing', 'Priority support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '🔬',
    tagline: 'Science-backed optimisation',
    badge: 'Most Popular',
    priceIN: { monthly: 2499, annual: 23990 },
    priceUS: { monthly: 29.99, annual: 287.90 },
    annualSaving: { IN: '₹5,998', US: '$71.98' },
    color: '#e0b341',
    features: [
      '1 doorstep lab test/month (60+ biomarkers)',
      'Unlimited report uploads',
      'Full biological age tracking',
      'Health Vault (5-year history)',
      '90-day retest protocol & countdown',
      'AI personalised supplement guide',
      'Shareable doctor report',
    ],
    excluded: ['Doctor consultation', 'Family sharing'],
  },
  {
    id: 'elite',
    name: 'Elite',
    icon: '🧬',
    tagline: 'Total health intelligence',
    priceIN: { monthly: 4999, annual: 47990 },
    priceUS: { monthly: 59.99, annual: 575.90 },
    annualSaving: { IN: '₹11,998', US: '$143.88' },
    color: '#e08c3b',
    features: [
      '2 doorstep lab tests/month (comprehensive)',
      'Priority same-day booking',
      'Doctor consultation (1 per month)',
      'Health Vault (unlimited history)',
      'Family sharing (up to 3 members)',
      'Personalised protocol + diet plan',
      'Dedicated health coach (WhatsApp)',
      '24/7 priority support',
    ],
    excluded: [],
  },
]

const APP_THEMES = [
  { id: 'teal',  accent: '#14b8a6', dark: '#0d9488' },
  { id: 'gold',  accent: '#e0b341', dark: '#a9791f' },
  { id: 'amber', accent: '#e08c3b', dark: '#c2691a' },
]

function PlanCard({ plan, billing, isIN, selected, onSelect }) {
  const price = isIN ? plan.priceIN : plan.priceUS
  const curr  = isIN ? '₹' : '$'
  const shown = billing === 'annual'
    ? (isIN ? Math.round(price.annual / 12) : (price.annual / 12).toFixed(2))
    : price[billing]
  const saving = billing === 'annual' ? plan.annualSaving[isIN ? 'IN' : 'US'] : null

  return (
    <div onClick={() => onSelect(plan.id)} style={{
      borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
      border: selected ? `2.5px solid ${plan.color}` : '2px solid #e2e8f0',
      boxShadow: selected ? `0 0 0 5px ${plan.color}18, 0 8px 32px rgba(0,0,0,0.1)` : '0 2px 12px rgba(0,0,0,0.06)',
      transform: selected ? 'translateY(-4px)' : 'none',
      transition: 'all .22s',
      background: '#fff', position: 'relative',
    }}>
      {plan.badge && (
        <div style={{ position: 'absolute', top: 14, right: 14, background: plan.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
          {plan.badge}
        </div>
      )}

      {/* Colour top bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg,${plan.color},${plan.color}88)` }}/>

      <div style={{ padding: '20px 20px 22px' }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>{plan.icon}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{plan.name}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>{plan.tagline}</div>

        {/* Price */}
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: '#0f172a' }}>{curr}{shown}</span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>/month</span>
        </div>
        {billing === 'annual' && (
          <div style={{ fontSize: 12, color: plan.color, fontWeight: 700, marginBottom: 4 }}>
            Save {saving}/year · billed {curr}{price.annual} annually
          </div>
        )}
        {billing === 'monthly' && (
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>billed monthly</div>
        )}

        <div style={{ height: 1, background: '#f1f5f9', margin: '14px 0' }}/>

        {/* Features */}
        {plan.features.map(f => (
          <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={{ color: plan.color, fontWeight: 700, fontSize: 13, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
        {plan.excluded.map(f => (
          <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start', opacity: .38 }}>
            <span style={{ color: '#94a3b8', fontSize: 13, marginTop: 1 }}>✗</span>
            <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}

        <div style={{ marginTop: 18, padding: '12px 0', border: `2px solid ${selected ? plan.color : '#e2e8f0'}`, borderRadius: 12, textAlign: 'center', fontSize: 14, fontWeight: 800, color: selected ? plan.color : '#94a3b8', transition: 'all .18s' }}>
          {selected ? '✓ Selected' : 'Select Plan'}
        </div>
      </div>
    </div>
  )
}

function PaymentForm({ plan, billing, isIN, onSuccess }) {
  const price   = isIN ? plan.priceIN : plan.priceUS
  const curr    = isIN ? '₹' : '$'
  const amount  = billing === 'annual' ? price.annual : price.monthly
  const A       = plan.color

  const [method,  setMethod]  = useState(isIN ? 'upi' : 'card')
  const [upi,     setUpi]     = useState('')
  const [card,    setCard]    = useState({ num: '', exp: '', cvv: '', name: '' })
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  function fmtCard(v) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  function fmtExp(v) {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d
  }

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
    setTimeout(() => { setLoading(false); onSuccess() }, 1800)
  }

  const inpStyle = { width: '100%', padding: '13px 14px', background: '#f8fafb', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }

  return (
    <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ height: 5, background: `linear-gradient(90deg,${A},${A}88)` }}/>
      <div style={{ padding: '22px 22px 26px' }}>
        {/* Order summary */}
        <div style={{ background: '#f8fafb', borderRadius: 12, padding: '14px 16px', marginBottom: 22 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Order summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>HealthOS {plan.name} </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>({billing})</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: A }}>{curr}{amount}</span>
          </div>
          {isIN && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Inclusive of 18% GST</div>}
        </div>

        {/* Payment method tabs (India only shows all 3) */}
        {isIN && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
            {[['upi','⚡ UPI'],['card','💳 Card/Debit']].map(([id, label]) => (
              <button key={id} onClick={() => { setMethod(id); setErr('') }} style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: method === id ? '#fff' : 'none',
                color: method === id ? '#0f172a' : '#94a3b8',
                boxShadow: method === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>{label}</button>
            ))}
          </div>
        )}
        {!isIN && <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 16 }}>💳 Credit / Debit Card</div>}

        {/* UPI form */}
        {method === 'upi' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>UPI ID</div>
            <input style={inpStyle} placeholder="yourname@upi / @paytm / @ybl" value={upi} onChange={e => setUpi(e.target.value.toLowerCase())}/>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>Supported: PhonePe, Google Pay, Paytm, BHIM, and all UPI apps</div>
          </div>
        )}

        {/* Card form */}
        {method === 'card' && (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Card Number</div>
              <input style={inpStyle} placeholder="1234 5678 9012 3456" inputMode="numeric"
                value={card.num} onChange={e => setCard(c => ({ ...c, num: fmtCard(e.target.value) }))}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Expiry (MM/YY)</div>
                <input style={inpStyle} placeholder="MM/YY" inputMode="numeric"
                  value={card.exp} onChange={e => setCard(c => ({ ...c, exp: fmtExp(e.target.value) }))}/>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>CVV</div>
                <input style={{ ...inpStyle }} placeholder="•••" inputMode="numeric" maxLength={4} type="password"
                  value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}/>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Name on Card</div>
              <input style={inpStyle} placeholder="As printed on card" value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))}/>
            </div>
          </>
        )}

        {err && <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 14, fontWeight: 600 }}>⚠ {err}</div>}

        <button onClick={pay} disabled={loading} style={{
          width: '100%', padding: 17, background: `linear-gradient(90deg,${A},${A}bb)`,
          color: '#fff', border: 'none', borderRadius: 13, fontSize: 16, fontWeight: 800,
          cursor: loading ? 'wait' : 'pointer', boxShadow: `0 6px 24px ${A}40`,
          opacity: loading ? .7 : 1,
        }}>
          {loading ? 'Processing…' : `Pay ${curr}${amount} →`}
        </button>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
          {['🔒 SSL Encrypted', '✅ PCI DSS', isIN ? '⚡ Razorpay' : '💳 Stripe', '↩️ 7-day Refund'].map(b => (
            <span key={b} style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PaymentScreen() {
  const nav = useNavigate()
  const [billing,  setBilling]  = useState('monthly')
  const [selected, setSelected] = useState('pro')
  const [step,     setStep]     = useState('plans')
  const [isIN,     setIsIN]     = useState(true)

  const plan = PLANS.find(p => p.id === selected)

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24 }}>✓</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>You're subscribed!</div>
      <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, maxWidth: 320, marginBottom: 8 }}>
        <strong>HealthOS {plan.name}</strong> is now active.<br/>
        A confirmation has been sent to your registered email.
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 32 }}>Powered by {isIN ? 'Razorpay' : 'Stripe'} · PCI DSS compliant</div>
      <button onClick={() => nav('/')} style={{ padding: '15px 36px', background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
        Open HealthOS →
      </button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', padding: '36px 24px 28px' }}>
        <button onClick={() => step === 'pay' ? setStep('plans') : nav(-1)} style={{ background: 'none', border: 'none', color: '#9fd9cf', fontSize: 13, cursor: 'pointer', fontWeight: 600, marginBottom: 16, padding: 0 }}>
          ← {step === 'pay' ? 'Back to plans' : 'Back'}
        </button>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          {step === 'pay' ? `Complete payment — ${plan.name}` : 'Choose your plan'}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Cancel anytime · 7-day refund guarantee</div>

        {/* Currency toggle */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            {[['IN', '🇮🇳 INR'], ['US', '🌍 USD']].map(([id, label]) => (
              <button key={id} onClick={() => setIsIN(id === 'IN')} style={{
                padding: '6px 14px', border: 'none', borderRadius: 18, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: (id === 'IN') === isIN ? '#fff' : 'none',
                color: (id === 'IN') === isIN ? '#0f172a' : 'rgba(255,255,255,0.45)',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 18px 48px' }}>

        {step === 'plans' && (
          <>
            {/* Billing toggle */}
            <div style={{ display: 'flex', gap: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 4, marginBottom: 22 }}>
              {[['monthly','Monthly'],['annual','Annual (Save 20%)']].map(([id, label]) => (
                <button key={id} onClick={() => setBilling(id)} style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  background: billing === id ? 'linear-gradient(90deg,#0f3a3a,#0a2424)' : 'none',
                  color: billing === id ? '#14b8a6' : '#94a3b8',
                }}>{label}</button>
              ))}
            </div>

            {/* Plan cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {PLANS.map(p => (
                <PlanCard key={p.id} plan={p} billing={billing} isIN={isIN} selected={selected === p.id} onSelect={setSelected}/>
              ))}
            </div>

            {/* Compare CTA */}
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                💡 All plans include a <strong>7-day free trial</strong>. No charge until trial ends. Cancel anytime from Settings.
                {isIN ? ' Indian users: GST invoice provided for every billing cycle.' : ' International: Invoiced in USD. Local taxes may apply.'}
              </div>
            </div>

            <button onClick={() => setStep('pay')} style={{
              width: '100%', padding: 17, background: `linear-gradient(90deg,${plan.color},${plan.color}bb)`,
              color: '#fff', border: 'none', borderRadius: 13, fontSize: 16, fontWeight: 800, cursor: 'pointer',
              boxShadow: `0 6px 24px ${plan.color}36`,
            }}>
              Continue with {plan.name} →
            </button>
          </>
        )}

        {step === 'pay' && (
          <PaymentForm plan={plan} billing={billing} isIN={isIN} onSuccess={() => setStep('success')}/>
        )}
      </div>
    </div>
  )
}
