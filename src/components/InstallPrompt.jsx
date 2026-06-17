import { useState, useEffect } from 'react'
import { hasInstallPromptBeenDismissed, markInstallPromptDismissed } from '../lib/insights'

// Android: intercepts beforeinstallprompt event for native install
// iOS: detects Safari and shows "Add to Home Screen" instructions
// Shows only once per device (remembered in localStorage)

export default function InstallPrompt() {
  const [show, setShow]         = useState(false)
  const [deferredPrompt, setDP] = useState(null)
  const [isIOS, setIsIOS]       = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (hasInstallPromptBeenDismissed()) return

    // Already installed as PWA — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }
    if (navigator.standalone) {
      setIsInstalled(true)
      return
    }

    // iOS Safari detection
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (ios && isSafari) {
      setIsIOS(true)
      setTimeout(() => setShow(true), 5000) // Show after 5 seconds
      return
    }

    // Android Chrome: listen for beforeinstallprompt
    function onPrompt(e) {
      e.preventDefault()
      setDP(e)
      setTimeout(() => setShow(true), 8000) // Show after 8 seconds
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!show || isInstalled) return null

  function dismiss() {
    markInstallPromptDismissed()
    setShow(false)
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') markInstallPromptDismissed()
      setDP(null)
      setShow(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(90deg,#0c4a4a,#0d9488)',
      borderRadius: 16, margin: '0 0 14px',
      padding: '14px 16px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 4px 16px rgba(20,184,166,0.25)',
      animation: 'slideDown .3s ease-out',
    }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>📱</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 3 }}>
          Add AROGYOS to your home screen
        </div>
        {isIOS ? (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            Tap <strong style={{ color: '#5eead4' }}>Share</strong> then{' '}
            <strong style={{ color: '#5eead4' }}>Add to Home Screen</strong> for offline access and daily reminders
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            Install for offline access, daily health reminders, and faster loading
          </div>
        )}
        {!isIOS && (
          <button onClick={install} style={{
            marginTop: 10, padding: '7px 16px',
            background: '#fff', border: 'none',
            borderRadius: 20, fontSize: 12, fontWeight: 800,
            color: '#0d9488', cursor: 'pointer',
          }}>
            Install App →
          </button>
        )}
      </div>
      <button onClick={dismiss} style={{
        background: 'none', border: 'none',
        color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer',
        padding: '0 0 0 4px', flexShrink: 0, lineHeight: 1,
      }}>
        ✕
      </button>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-16px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  )
}
