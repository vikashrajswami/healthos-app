const CACHE = 'arogyos-v4'
const STATIC = ['/']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/api')) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      return cached || network
    })
  )
})

// ── Push notifications ────────────────────────────────────────────────────────

self.addEventListener('push', e => {
  let data = { title: 'AROGYOS', body: 'Your daily health insight is ready.', url: '/' }
  try {
    if (e.data) data = { ...data, ...e.data.json() }
  } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/logo192.png',
      badge:   '/logo192.png',
      data:    { url: data.url || '/' },
      actions: [
        { action: 'open',    title: 'Open AROGYOS' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      requireInteraction: false,
      silent: false,
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  if (e.action === 'dismiss') return

  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})

// ── Periodic background sync (daily reminder) ─────────────────────────────────
// Fires once per day when the device is online — shows a nudge if user has not
// opened the app today. Supported on Chrome for Android with installed PWA.

self.addEventListener('periodicsync', e => {
  if (e.tag === 'daily-reminder') {
    e.waitUntil(maybeSendDailyReminder())
  }
})

async function maybeSendDailyReminder() {
  // Check if any window of the app is currently open and focused
  const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true })
  const appOpen = allClients.some(c => c.focused)
  if (appOpen) return // User is actively using the app

  const REMINDERS = [
    'Check in with your BioAge today — what\'s one healthy choice you can make?',
    'Your daily health insight is waiting. One small action today compounds over years.',
    'Track your water intake and check today\'s longevity tip.',
    'How are your habits this week? Open AROGYOS to see your progress.',
    'Your biological age is not fixed — daily habits move it. Open to see today\'s insight.',
  ]
  const body = REMINDERS[Math.floor(Math.random() * REMINDERS.length)]

  return self.registration.showNotification('AROGYOS Daily Check-in', {
    body,
    icon:  '/logo192.png',
    badge: '/logo192.png',
    data:  { url: '/' },
    actions: [
      { action: 'open', title: 'Open App' },
    ],
  })
}

// ── Background sync (retry failed API calls) ──────────────────────────────────

self.addEventListener('sync', e => {
  if (e.tag === 'sync-profile') {
    e.waitUntil(syncPendingProfile())
  }
})

async function syncPendingProfile() {
  // If a profile sync was queued while offline, retry it now
  const pending = await self.registration.storage?.get('pending-sync')
  if (!pending) return
  try {
    await fetch('/api/sync-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pending),
    })
  } catch {}
}
