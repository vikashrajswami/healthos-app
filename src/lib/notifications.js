// Push notification utilities for AROGYOS PWA

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

// ── Permission ────────────────────────────────────────────────────────────────

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

// ── Push subscription ─────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(b64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export async function subscribeToPush(uid) {
  if (!('serviceWorker' in navigator) || !VAPID_PUBLIC) return null
  try {
    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })
    }
    // Save to server
    if (uid && sub) {
      fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, subscription: sub }),
      }).catch(() => {})
    }
    return sub
  } catch {
    return null
  }
}

// ── Periodic background sync (daily reminder) ─────────────────────────────────
// Works on Chrome 80+ Android when app is installed as PWA

export async function registerDailySync() {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    if ('periodicSync' in reg) {
      const tags = await reg.periodicSync.getTags()
      if (!tags.includes('daily-reminder')) {
        await reg.periodicSync.register('daily-reminder', {
          minInterval: 20 * 60 * 60 * 1000, // min 20 hours between syncs
        })
      }
    }
  } catch {
    // PeriodicSync not available — silently skip
  }
}

// ── Show a local notification immediately ─────────────────────────────────────
// Used for testing or in-app reminders when push is not set up

export function showLocalNotification(title, body, url = '/') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (!('serviceWorker' in navigator)) {
    new Notification(title, { body, icon: '/logo192.png' })
    return
  }
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: { url },
      actions: [
        { action: 'open', title: 'Open AROGYOS' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  })
}

// ── Unsubscribe ───────────────────────────────────────────────────────────────

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
  } catch {}
}
