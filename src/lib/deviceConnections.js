// ── PKCE helpers ──────────────────────────────────────────────────────────────
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
}
export async function genPKCE() {
  const verifier  = b64url(crypto.getRandomValues(new Uint8Array(32)))
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  return { verifier, challenge }
}

// ── Token storage ──────────────────────────────────────────────────────────────
export function storeToken(provider, token) {
  localStorage.setItem(`healthos_token_${provider}`, JSON.stringify({ ...token, _ts: Date.now() }))
}
export function getToken(provider) {
  try {
    const t = JSON.parse(localStorage.getItem(`healthos_token_${provider}`))
    if (!t) return null
    if (t.expires_in && Date.now() > t._ts + t.expires_in * 1000 - 60000) {
      localStorage.removeItem(`healthos_token_${provider}`)
      return null
    }
    return t
  } catch { return null }
}
export function clearToken(provider) {
  localStorage.removeItem(`healthos_token_${provider}`)
}

// ── Generic OAuth start ───────────────────────────────────────────────────────
export async function startOAuth(provider, { authUrl, clientId, redirectUri, scope, extra = {} }) {
  const { verifier, challenge } = await genPKCE()
  localStorage.setItem(`healthos_pkce_${provider}`, verifier)
  localStorage.setItem('healthos_oauth_pending', provider)
  const url = new URL(authUrl)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scope)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  Object.entries(extra).forEach(([k,v]) => url.searchParams.set(k,v))
  window.location.href = url.toString()
}

// ── Generic token exchange (PKCE — no client_secret needed) ───────────────────
export async function exchangeCode(code, provider, { tokenUrl, clientId, redirectUri }) {
  const verifier = localStorage.getItem(`healthos_pkce_${provider}`)
  if (!verifier) throw new Error('PKCE verifier missing')
  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type:'authorization_code', code, client_id:clientId, redirect_uri:redirectUri, code_verifier:verifier }),
  })
  if (!resp.ok) { const e = await resp.text(); throw new Error(e) }
  const token = await resp.json()
  storeToken(provider, token)
  localStorage.removeItem(`healthos_pkce_${provider}`)
  return token
}

// ── Redirect URI ───────────────────────────────────────────────────────────────
export const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/devices` : ''

// ═══════════════════════════════════════════════════════════════════════════════
// OURA RING
// Register at: https://cloud.ouraring.com/oauth/applications
// Env var: VITE_OURA_CLIENT_ID
// ═══════════════════════════════════════════════════════════════════════════════
const OURA_ID = import.meta.env.VITE_OURA_CLIENT_ID || ''

export function hasOuraClientId() { return !!OURA_ID }

export async function startOuraOAuth() {
  await startOAuth('oura', {
    authUrl:     'https://cloud.ouraring.com/oauth/authorize',
    clientId:    OURA_ID,
    redirectUri: REDIRECT_URI,
    scope:       'daily heartrate personal session sleep workout tag',
  })
}

export async function handleOuraCallback(code) {
  return exchangeCode(code, 'oura', {
    tokenUrl:    'https://api.ouraring.com/oauth/token',
    clientId:    OURA_ID,
    redirectUri: REDIRECT_URI,
  })
}

export async function fetchOuraData() {
  const token = getToken('oura')
  if (!token) return null
  const h = { Authorization: `Bearer ${token.access_token}` }
  const today   = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now()-7*86400000).toISOString().split('T')[0]
  try {
    const [sleepR, readR, actR] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${weekAgo}&end_date=${today}`,{headers:h}).then(r=>r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${weekAgo}&end_date=${today}`,{headers:h}).then(r=>r.json()),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${weekAgo}&end_date=${today}`,{headers:h}).then(r=>r.json()),
    ])
    const sl = sleepR.data?.[sleepR.data.length-1]
    const rd = readR.data?.[readR.data.length-1]
    const ac = actR.data?.[actR.data.length-1]
    return {
      hrv:      sl?.average_hrv        ? Math.round(sl.average_hrv)          : null,
      sleep:    sl?.total_sleep_duration ? +(sl.total_sleep_duration/3600).toFixed(1) : null,
      deep:     sl?.deep_sleep_duration  ? +(sl.deep_sleep_duration/3600).toFixed(1)  : null,
      recovery: rd?.score               ?? null,
      steps:    ac?.steps               ?? null,
      temp:     sl?.average_breath      ? null : null, // skin temp needs personal endpoint
      _ts: Date.now(), _via: 'oura',
    }
  } catch { return null }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE FIT (covers: Samsung, Fitbit, Garmin, Xiaomi, Fossil, any Android wearable)
// Register at: https://console.cloud.google.com → Fitness API → OAuth 2.0
// Env var: VITE_GOOGLE_FIT_CLIENT_ID
// ═══════════════════════════════════════════════════════════════════════════════
const GOOGLE_ID = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID || ''

export function hasGoogleClientId() { return !!GOOGLE_ID }

export async function startGoogleFitOAuth() {
  await startOAuth('google', {
    authUrl:     'https://accounts.google.com/o/oauth2/v2/auth',
    clientId:    GOOGLE_ID,
    redirectUri: REDIRECT_URI,
    scope:       'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read',
    extra:       { access_type: 'offline', prompt: 'consent' },
  })
}

export async function handleGoogleCallback(code) {
  return exchangeCode(code, 'google', {
    tokenUrl:    'https://oauth2.googleapis.com/token',
    clientId:    GOOGLE_ID,
    redirectUri: REDIRECT_URI,
  })
}

export async function fetchGoogleFitData() {
  const token = getToken('google')
  if (!token) return null
  const h = { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }
  const now = Date.now(), dayAgo = now - 86400000
  try {
    const r = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST', headers: h,
      body: JSON.stringify({
        aggregateBy: [
          { dataTypeName:'com.google.step_count.delta' },
          { dataTypeName:'com.google.heart_rate.bpm' },
          { dataTypeName:'com.google.activity.segment' },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: dayAgo, endTimeMillis: now,
      }),
    })
    if (!r.ok) return null
    const data = await r.json()
    const bucket = data.bucket?.[0]
    let steps=null, rhr=null
    for (const ds of bucket?.dataset||[]) {
      const pts = ds.point||[]
      if (ds.dataSourceId.includes('step_count') && pts[0])
        steps = pts[0].value?.[0]?.intVal ?? null
      if (ds.dataSourceId.includes('heart_rate') && pts.length) {
        const vals = pts.map(p=>p.value?.[0]?.fpVal).filter(Boolean)
        if (vals.length) rhr = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)
      }
    }
    return { steps, rhr, _ts: Date.now(), _via: 'google' }
  } catch { return null }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEXCOM CGM
// Register at: https://developer.dexcom.com → My Apps → Create App
// Env var: VITE_DEXCOM_CLIENT_ID
// ═══════════════════════════════════════════════════════════════════════════════
const DEXCOM_ID = import.meta.env.VITE_DEXCOM_CLIENT_ID || ''

export function hasDexcomClientId() { return !!DEXCOM_ID }

export async function startDexcomOAuth() {
  await startOAuth('dexcom', {
    authUrl:     'https://api.dexcom.com/v2/oauth2/login',
    clientId:    DEXCOM_ID,
    redirectUri: REDIRECT_URI,
    scope:       'offline_access egv events calibrations statistics',
  })
}

export async function handleDexcomCallback(code) {
  return exchangeCode(code, 'dexcom', {
    tokenUrl:    'https://api.dexcom.com/v2/oauth2/token',
    clientId:    DEXCOM_ID,
    redirectUri: REDIRECT_URI,
  })
}

export async function fetchDexcomData() {
  const token = getToken('dexcom')
  if (!token) return null
  const now = new Date(), h24 = new Date(now-86400000)
  const fmt = d => d.toISOString().replace('.000','')
  try {
    const r = await fetch(`https://api.dexcom.com/v3/users/self/egvs?startDate=${fmt(h24)}&endDate=${fmt(now)}`, {
      headers: { Authorization: `Bearer ${token.access_token}` }
    })
    if (!r.ok) return null
    const data = await r.json()
    const recs = data.records||[]
    if (!recs.length) return null
    const vals = recs.map(r=>r.value)
    const inRange = vals.filter(v=>v>=70&&v<=180).length
    return {
      glucose: recs[recs.length-1].value,
      tir:     Math.round(inRange/vals.length*100),
      fasting: vals[0],
      trend:   recs[recs.length-1].trend,
      _ts: Date.now(), _via: 'dexcom',
    }
  } catch { return null }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABHA — Ayushman Bharat Health Account
// Real ABDM integration requires NHA HIU registration (government process).
// This stores the ABHA number locally and provides instructions.
// ═══════════════════════════════════════════════════════════════════════════════
export function saveAbhaId(abhaNumber) {
  localStorage.setItem('healthos_abha_id', abhaNumber)
}
export function getAbhaId() {
  return localStorage.getItem('healthos_abha_id') || null
}

// ═══════════════════════════════════════════════════════════════════════════════
// Handle any OAuth callback (call this on /devices page load)
// Returns: { provider, data } or null
// ═══════════════════════════════════════════════════════════════════════════════
export async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const error = params.get('error')
  const provider = localStorage.getItem('healthos_oauth_pending')

  if (!code && !error) return null
  if (error) {
    localStorage.removeItem('healthos_oauth_pending')
    window.history.replaceState({}, '', '/devices')
    return { provider, error }
  }
  if (!provider) return null

  window.history.replaceState({}, '', '/devices')
  localStorage.removeItem('healthos_oauth_pending')

  try {
    let data = null
    if (provider === 'oura') {
      await handleOuraCallback(code)
      data = await fetchOuraData()
    } else if (provider === 'google') {
      await handleGoogleCallback(code)
      data = await fetchGoogleFitData()
    } else if (provider === 'dexcom') {
      await handleDexcomCallback(code)
      data = await fetchDexcomData()
    }
    return { provider, data }
  } catch (e) {
    return { provider, error: e.message }
  }
}
