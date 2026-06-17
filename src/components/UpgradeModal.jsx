import { useNavigate } from 'react-router-dom'
import { markUpgradePromptSeen } from '../lib/planStatus'

const REASONS = {
  quiz: {
    icon: '🧬',
    title: 'Unlock Your Full Health Picture',
    body: 'Your BioAge estimate is ready. Upgrade to get unlimited lab report analysis, family tracking, personalised diet plan, and lifetime Health Vault — free for 30 days.',
    cta: 'Start 30-Day Free Trial →',
  },
  upload: {
    icon: '📄',
    title: 'Free Upload Limit Reached',
    body: 'You have used your 1 free upload this month. Upgrade to AROGYOS Plus for unlimited lab report uploads, AI biomarker extraction, and trend tracking.',
    cta: 'Unlock Unlimited Uploads →',
  },
  chat: {
    icon: '💬',
    title: 'Free Chat Limit Reached',
    body: 'You have used your 5 free Health Guide messages this month. Upgrade for unlimited priority responses — always instant, always personalised.',
    cta: 'Unlock Unlimited Chats →',
  },
  family: {
    icon: '👨‍👩‍👧',
    title: 'Family Tracker is a Plus Feature',
    body: `Track your whole family's biological age — parents, spouse, kids — all in one dashboard. Upgrade to invite up to 6 family members.`,
    cta: 'Unlock Family Tracker →',
  },
}

export default function UpgradeModal({ reason = 'quiz', onClose }) {
  const nav = useNavigate()
  const r   = REASONS[reason] || REASONS.quiz

  function goUpgrade() {
    markUpgradePromptSeen()
    onClose?.()
    nav('/subscribe')
  }
  function dismiss() {
    markUpgradePromptSeen()
    onClose?.()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={dismiss}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '28px 24px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        animation: 'slideUp .25s ease-out',
      }} onClick={e => e.stopPropagation()}>

        {/* Pull handle */}
        <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 4, margin: '0 auto 20px' }}/>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 44 }}>{r.icon}</div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 10 }}>
          {r.title}
        </div>

        {/* Body */}
        <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 1.7, marginBottom: 20 }}>
          {r.body}
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {['Unlimited uploads', 'Family tracker', 'Diet plan', 'Health Vault', '30-day free trial'].map(f => (
            <span key={f} style={{ fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', borderRadius: 20, padding: '4px 10px' }}>
              ✓ {f}
            </span>
          ))}
        </div>

        {/* Pricing note */}
        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
          ₹399/year in India · $99/year internationally · Cancel anytime
        </div>

        {/* CTA */}
        <button onClick={goUpgrade} style={{
          width: '100%', padding: 17,
          background: 'linear-gradient(90deg,#14b8a6,#059669)',
          color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800,
          cursor: 'pointer', boxShadow: '0 6px 20px rgba(20,184,166,0.35)',
        }}>
          {r.cta}
        </button>

        {/* Dismiss */}
        <button onClick={dismiss} style={{
          width: '100%', marginTop: 12, padding: 12, background: 'none',
          border: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          Maybe later
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
