import { useState } from 'react'
import { markRatingPromptShown } from '../lib/insights'

// Shows after 7 days of usage + quiz completed
// 4-5 stars → redirect to app store (or open feedback form for now)
// 1-3 stars → open email feedback

export default function RatingPrompt({ onClose }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [step, setStep] = useState('rate') // 'rate' | 'thanks' | 'feedback'
  const [feedback, setFeedback] = useState('')

  function handleRate(star) {
    setRating(star)
    markRatingPromptShown()
    if (star >= 4) {
      setStep('thanks')
      // Give a moment then redirect to Play Store / App Store
      setTimeout(() => {
        // Opens app store page once the app is listed — placeholder URL for now
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
        const storeUrl = isIOS
          ? 'https://apps.apple.com/app/arogyos'
          : 'https://play.google.com/store/apps/details?id=com.arogyos.app'
        window.open(storeUrl, '_blank')
        onClose?.()
      }, 1800)
    } else {
      setStep('feedback')
    }
  }

  function submitFeedback() {
    const subject = encodeURIComponent('AROGYOS Feedback')
    const body = encodeURIComponent(
      `Rating: ${rating}/5 stars\n\nFeedback:\n${feedback}\n\n---\nSent from AROGYOS app`
    )
    window.open(`mailto:support@arogyos.in?subject=${subject}&body=${body}`, '_blank')
    markRatingPromptShown()
    onClose?.()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={() => { markRatingPromptShown(); onClose?.() }}>
      <div style={{
        width: '100%', maxWidth: 360,
        background: '#fff', borderRadius: 24,
        padding: '32px 24px 28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        animation: 'scaleIn .2s ease-out',
      }} onClick={e => e.stopPropagation()}>

        {step === 'rate' && <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Loving AROGYOS?
            </div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              Your rating helps others discover how to reverse their biological age.
              It takes 5 seconds.
            </div>
          </div>

          {/* Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => handleRate(star)}
                style={{
                  fontSize: 38, background: 'none', border: 'none',
                  cursor: 'pointer', padding: '4px 2px',
                  transform: (hovered || rating) >= star ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform .15s',
                  filter: (hovered || rating) >= star ? 'none' : 'grayscale(1)',
                }}
              >
                ⭐
              </button>
            ))}
          </div>

          <button onClick={() => { markRatingPromptShown(); onClose?.() }} style={{
            width: '100%', padding: 13, background: 'none', border: 'none',
            color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Maybe later
          </button>
        </>}

        {step === 'thanks' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Thank you so much!
            </div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              Opening the app store now…
            </div>
          </div>
        )}

        {step === 'feedback' && <>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💙</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              We want to improve
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Tell us what we could do better:
            </div>
          </div>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="What can we improve? We read every message..."
            rows={4}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid #e2e8f0', borderRadius: 12,
              fontSize: 13, fontFamily: 'inherit', outline: 'none',
              resize: 'none', boxSizing: 'border-box', color: '#0f172a',
              lineHeight: 1.6,
            }}
          />
          <button onClick={submitFeedback} disabled={!feedback.trim()} style={{
            width: '100%', marginTop: 14, padding: 15,
            background: feedback.trim() ? 'linear-gradient(90deg,#14b8a6,#059669)' : '#f1f5f9',
            color: feedback.trim() ? '#fff' : '#94a3b8',
            border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800,
            cursor: feedback.trim() ? 'pointer' : 'default',
          }}>
            Send Feedback →
          </button>
          <button onClick={() => { markRatingPromptShown(); onClose?.() }} style={{
            width: '100%', marginTop: 10, padding: 12, background: 'none',
            border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer',
          }}>
            Skip
          </button>
        </>}
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
