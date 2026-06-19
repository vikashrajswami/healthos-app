import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { setPlusMember } from '../lib/planStatus'

const PRICING = {
  india: {
    monthly:  { price: '₹99',  amount: 9900,  period: '/month',    billingLabel: 'Billed monthly',        save: null        },
    halfyear: { price: '₹299', amount: 29900, period: '/6 months', billingLabel: 'Billed every 6 months', save: 'Save ₹295' },
    annual:   { price: '₹399', amount: 39900, period: '/year',     billingLabel: 'Billed annually',       save: 'Save ₹789' },
  },
  intl: {
    monthly:  { price: '$20', amount: 2000,  period: '/month',    billingLabel: 'Billed monthly',        save: null       },
    halfyear: { price: '$49', amount: 4900,  period: '/6 months', billingLabel: 'Billed every 6 months', save: 'Save $71' },
    annual:   { price: '$99', amount: 9900,  period: '/year',     billingLabel: 'Billed annually',       save: 'Save $141'},
  },
}

const PADDLE_PRICES = {
  monthly:  import.meta.env.VITE_PADDLE_PRICE_MONTHLY  || 'pri_01kvfpm2vbdayzq7shd05emeb2',
  halfyear: import.meta.env.VITE_PADDLE_PRICE_HALFYEAR || 'pri_01kvfpqd1xbz1ddhn6mnnv8kv5',
  annual:   import.meta.env.VITE_PADDLE_PRICE_ANNUAL   || 'pri_01kvfpswdyf69qeynr269pfjv7',
}
const PADDLE_TOKEN = import.meta.env.VITE_PADDLE_TOKEN

const FEATURES = [
  'Unlimited lab report uploads & AI biomarker extraction',
  'Full biological age analysis and tracking',
  'Family BioAge dashboard (up to 6 members)',
  'Personalised age-reversal diet plan',
  'Health Vault — lifetime history',
  'Priority Health Guide responses',
  'Cancel anytime during trial — pay nothing',
]

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function getUid() {
  return localStorage.getItem('healthos_uid') || ''
}

export default function PaymentScreen() {
  const nav      = useNavigate()
  const location = useLocation()

  const st = location.state || {}

  // Auto-detect region from timezone — India = INR, everything else = USD
  const detectedRegion = (() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      return (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') ? 'india' : 'intl'
    } catch { return 'india' }
  })()

  const [region,  setRegion]  = useState(st.region  || detectedRegion)
  const [billing, setBilling] = useState(st.billing || 'annual')

  const plan = PRICING[region][billing]
  const isIN = region === 'india'

  const [step,    setStep]    = useState('form')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  // ── India: Razorpay checkout ────────────────────────────────────────────────
  async function payWithRazorpay() {
    setErr('')
    setLoading(true)
    try {
      const uid = getUid()

      // 1. Create order on server
      const orderRes = await fetch('/api/payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, billing, region }),
      })
      const { orderId, amount, currency, keyId, error: orderErr } = await orderRes.json()
      if (orderErr) throw new Error(orderErr)

      // 2. Load Razorpay SDK
      await loadScript('https://checkout.razorpay.com/v1/checkout.js')

      // 3. Open Razorpay checkout modal
      const rzp = new window.Razorpay({
        key:         keyId,
        order_id:    orderId,
        amount,
        currency,
        name:        'AROGYOS',
        description: 'AROGYOS Plus — 30-day free trial',
        image:       '/logo192.png',
        handler: async (resp) => {
          // 4. Verify on server + store subscription
          const verifyRes = await fetch('/api/payment-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature:  resp.razorpay_signature,
              uid, billing, region, amount, currency,
            }),
          })
          const { success, error: verifyErr } = await verifyRes.json()
          if (!success) { setErr(verifyErr || 'Verification failed'); setLoading(false); return }
          setPlusMember()
          setStep('success')
        },
        modal: {
          ondismiss: () => { setLoading(false) },
        },
        theme: { color: '#14b8a6' },
      })
      rzp.on('payment.failed', (resp) => {
        setErr(resp.error?.description || 'Payment failed. Please try again.')
        setLoading(false)
      })
      rzp.open()
    } catch (e) {
      setErr(e.message || 'Could not initiate payment. Please try again.')
      setLoading(false)
    }
  }

  // ── International: Paddle Billing v2 ─────────────────────────────────────
  async function payWithPaddle() {
    setErr('')
    setLoading(true)
    try {
      const uid     = getUid()
      const priceId = PADDLE_PRICES[billing]
      if (!priceId || !PADDLE_TOKEN) throw new Error('International payments not configured yet')

      await loadScript('https://cdn.paddle.com/paddle/v2/paddle.js')

      window.Paddle.Initialize({
        token: PADDLE_TOKEN,
        eventCallback(data) {
          if (data.name === 'checkout.completed') {
            setPlusMember()
            setStep('success')
          }
          if (data.name === 'checkout.closed') {
            setLoading(false)
          }
        },
      })

      window.Paddle.Checkout.open({
        items:      [{ priceId, quantity: 1 }],
        customData: { uid, billing, region },
      })
    } catch (e) {
      setErr(e.message || 'Could not initiate payment. Please try again.')
      setLoading(false)
    }
  }

  const handlePay = isIN ? payWithRazorpay : payWithPaddle

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#14b8a6,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24, color: '#fff', fontWeight: 800 }}>✓</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>You're in — 30 days free!</div>
      <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, maxWidth: 320, marginBottom: 8 }}>
        <strong>AROGYOS Plus</strong> trial is now active.<br/>
        A confirmation will be sent to your registered contact.
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 32 }}>Powered by {isIN ? 'Razorpay' : 'Paddle'} · PCI DSS compliant</div>
      <button onClick={() => nav('/home')} style={{ padding: '15px 36px', background: 'linear-gradient(90deg,#14b8a6,#0d9488)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
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
              <button key={id} onClick={() => { setRegion(id); setErr('') }} style={{
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
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{plan.billingLabel}{isIN ? ' · GST inclusive' : ''}</div>
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

        {/* Pay button */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '22px 18px', marginBottom: 18 }}>
          {isIN ? (
            <>
              <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
                Pay securely via <strong>Razorpay</strong> — UPI, Cards, Net Banking, Wallets all supported
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                {['PhonePe', 'GPay', 'Paytm', 'UPI', 'Visa', 'Mastercard'].map(b => (
                  <span key={b} style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px', fontWeight: 600 }}>{b}</span>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
              Pay securely via <strong>Paddle</strong> — all major cards, PayPal, local methods.<br/>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>All taxes handled automatically for your country</span>
            </div>
          )}

          {err && (
            <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 14, fontWeight: 600, textAlign: 'center' }}>⚠ {err}</div>
          )}

          <button onClick={handlePay} disabled={loading} style={{
            width: '100%', padding: 17,
            background: 'linear-gradient(90deg,#14b8a6,#059669)',
            color: '#fff', border: 'none', borderRadius: 13, fontSize: 16, fontWeight: 800,
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 6px 24px rgba(20,184,166,0.35)',
            opacity: loading ? .7 : 1, transition: 'opacity .15s',
          }}>
            {loading ? 'Opening payment…' : `Start 30-Day Free Trial · ${plan.price}${plan.period}`}
          </button>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            {['🔒 SSL Encrypted', '✅ PCI DSS', isIN ? '⚡ Razorpay' : '🌍 Paddle MoR', '↩️ 30-day Refund'].map(b => (
              <span key={b} style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{b}</span>
            ))}
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
