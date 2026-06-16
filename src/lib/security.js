// ── Input sanitization ────────────────────────────────────────────────────────
export function sanitizeText(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/[<>'"&]/g, c => ({ '<':'&lt;', '>':'&gt;', "'":"&#39;", '"':'&quot;', '&':'&amp;' }[c]))
    .trim()
    .slice(0, 500)
}

export function sanitizeName(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[^a-zA-Z\sऀ-ॿ؀-ۿ'-]/g, '').trim().slice(0, 100)
}

// ── OTP rate limiter (in-memory, resets on refresh) ───────────────────────────
const _attempts = {}
export function recordOtpAttempt(key) {
  const now = Date.now()
  if (!_attempts[key]) _attempts[key] = []
  _attempts[key] = _attempts[key].filter(t => now - t < 15 * 60 * 1000)
  _attempts[key].push(now)
}
export function isOtpBlocked(key) {
  const now = Date.now()
  const recent = (_attempts[key] || []).filter(t => now - t < 15 * 60 * 1000)
  return recent.length >= 5
}
export function otpBlockedUntil(key) {
  const list = _attempts[key] || []
  if (list.length < 5) return null
  return new Date(list[0] + 15 * 60 * 1000)
}

// ── Secure localStorage wrapper ───────────────────────────────────────────────
// Uses a session key (generated once per browser session) for AES-GCM encryption.
// Data is unreadable without the in-memory key, which clears on tab close.

let _sessionKey = null

async function getSessionKey() {
  if (_sessionKey) return _sessionKey
  const raw = sessionStorage.getItem('_hsk')
  if (raw) {
    const keyData = Uint8Array.from(atob(raw), c => c.charCodeAt(0))
    _sessionKey = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt', 'decrypt'])
    return _sessionKey
  }
  _sessionKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const exported = await crypto.subtle.exportKey('raw', _sessionKey)
  sessionStorage.setItem('_hsk', btoa(String.fromCharCode(...new Uint8Array(exported))))
  return _sessionKey
}

export async function secureSet(key, value) {
  try {
    const k = await getSessionKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(JSON.stringify(value))
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, encoded)
    const payload = btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(cipher)))
    localStorage.setItem(key, payload)
  } catch {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export async function secureGet(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const k = await getSessionKey()
    const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0))
    const iv = bytes.slice(0, 12)
    const cipher = bytes.slice(12)
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, cipher)
    return JSON.parse(new TextDecoder().decode(plain))
  } catch {
    try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
  }
}

export function secureClear() {
  const preserve = ['healthos_theme']
  const keys = Object.keys(localStorage).filter(k => k.startsWith('healthos_'))
  keys.filter(k => !preserve.includes(k)).forEach(k => localStorage.removeItem(k))
  sessionStorage.clear()
  _sessionKey = null
}

// ── Data integrity check ──────────────────────────────────────────────────────
export async function hashValue(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}

// ── Detect suspicious patterns ────────────────────────────────────────────────
export function isSuspiciousInput(str) {
  const patterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /\beval\b/i, /document\./i, /window\./i, /union\s+select/i, /drop\s+table/i]
  return patterns.some(p => p.test(str))
}
