// Combined handler — Junction device API proxy (GET) + Razorpay + Paddle webhooks (POST)
import crypto from 'crypto'
import { saveSubscription } from '../server/lib/payments.js'

// ── Junction / Vital API proxy ─────────────────────────────────────────────────
const J_BASE = process.env.JUNCTION_API_URL || 'https://api.sandbox.tryvital.io'

async function jFetch(path, apiKey, opts = {}) {
  const r = await fetch(`${J_BASE}${path}`, {
    ...opts,
    headers: { 'x-vital-api-key': apiKey, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })
  return r.ok ? r.json() : null
}

function dStr(daysAgo) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0]
}

async function handleJunction(req, res) {
  const { action, uid, juid } = req.query
  const KEY = process.env.JUNCTION_API_KEY
  if (!KEY) return res.status(500).json({ error: 'JUNCTION_API_KEY not set' })

  if (action === 'jtoken') {
    if (!uid) return res.status(400).json({ error: 'uid required' })
    let jUser = await jFetch(`/v2/user/${encodeURIComponent(uid)}`, KEY)
    if (!jUser?.user_id) {
      jUser = await jFetch('/v2/user', KEY, {
        method: 'POST',
        body: JSON.stringify({ client_user_id: uid }),
      })
    }
    if (!jUser?.user_id) return res.status(500).json({ error: 'Could not create Junction user' })
    const tokenData = await jFetch('/v2/link/token', KEY, {
      method: 'POST',
      body: JSON.stringify({ user_id: jUser.user_id }),
    })
    return res.json({ token: tokenData?.link_token, juid: jUser.user_id })
  }

  if (action === 'jdata') {
    if (!juid) return res.status(400).json({ error: 'juid required' })
    const [today, d1, d7] = [dStr(0), dStr(1), dStr(7)]
    const [act, sl, body] = await Promise.all([
      jFetch(`/v2/activity/${juid}?start_date=${d1}&end_date=${today}`, KEY),
      jFetch(`/v2/sleep/${juid}?start_date=${d1}&end_date=${today}`, KEY),
      jFetch(`/v2/body/${juid}?start_date=${d7}&end_date=${today}`, KEY),
    ])
    const a = act?.activity?.[0]
    const s = sl?.sleep?.[0]
    const b = body?.body?.[0]
    return res.json({
      steps:    a?.steps                              ?? null,
      calories: a?.calories_active                   ?? null,
      hrv:      s?.hrv_rmssd_evening_5min            ?? null,
      rhr:      s?.hr_lowest                         ?? null,
      sleep:    s?.duration   ? +(s.duration   / 3600).toFixed(1) : null,
      deep:     s?.sleep_stages_summary?.deep ? +(s.sleep_stages_summary.deep / 3600).toFixed(1) : null,
      rem:      s?.sleep_stages_summary?.rem  ? +(s.sleep_stages_summary.rem  / 3600).toFixed(1) : null,
      weight:   b?.weight                            ?? null,
      bodyFat:  b?.fat_percentage                    ?? null,
      source:   a?.source?.provider ?? s?.source?.provider ?? null,
      _via: 'junction', _ts: Date.now(),
    })
  }

  return res.status(400).json({ error: 'Unknown action' })
}

// ── Razorpay ──────────────────────────────────────────────────────────────────
// IMPORTANT: Razorpay signs the raw request bytes. We must verify against the
// original body string, not a re-serialized JSON object (key order may differ).
async function handleRazorpay(req, res) {
  const secret    = process.env.RAZORPAY_WEBHOOK_SECRET
  const signature = req.headers['x-razorpay-signature']

  // req.body may be a pre-parsed object (Vercel) or a raw string — normalise both
  const rawBody = typeof req.body === 'string'
    ? req.body
    : JSON.stringify(req.body)   // last resort; fine when Vercel preserves key order

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (signature !== expected) return res.status(400).json({ error: 'Invalid Razorpay signature' })

  const parsed  = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const event   = parsed.event
  const payment = parsed.payload?.payment?.entity
  if (!payment) return res.json({ received: true })

  const notes = payment.notes || {}
  const uid   = notes.uid
  if (!uid) return res.json({ received: true, skipped: 'no uid in notes' })

  if (event === 'payment.captured') {
    // First-time capture → user just started their trial
    await saveSubscription(uid, {
      region:           notes.region  || 'india',
      billing_cycle:    notes.billing || 'annual',
      payment_provider: 'razorpay',
      payment_id:       payment.id,
      order_id:         payment.order_id,
      amount:           payment.amount,
      currency:         payment.currency,
      status:           'trialing',
    })
  } else if (event === 'payment.captured' || event === 'subscription.charged') {
    // Recurring charge after trial → subscription is now fully active
    await saveSubscription(uid, {
      region:           notes.region  || 'india',
      billing_cycle:    notes.billing || 'annual',
      payment_provider: 'razorpay',
      payment_id:       payment.id,
      order_id:         payment.order_id,
      amount:           payment.amount,
      currency:         payment.currency,
      status:           'active',
    })
  }

  res.json({ success: true })
}

// ── Paddle Billing ────────────────────────────────────────────────────────────
async function handlePaddle(req, res) {
  const secret    = process.env.PADDLE_WEBHOOK_SECRET
  const signature = req.headers['paddle-signature']

  if (secret && signature) {
    const ts    = signature.match(/ts=(\d+)/)?.[1]
    const h1    = signature.match(/h1=([a-f0-9]+)/)?.[1]
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const check = crypto.createHmac('sha256', secret).update(`${ts}:${rawBody}`).digest('hex')
    if (check !== h1) return res.status(400).json({ error: 'Invalid Paddle signature' })
  }

  const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const event  = parsed.event_type
  const data   = parsed.data

  if (!data) return res.json({ received: true })

  const custom = data.custom_data || {}
  const uid    = custom.uid
  if (!uid) return res.json({ received: true, skipped: 'no uid in custom_data' })

  // subscription.activated — fires when user starts a trial (card stored, not charged yet)
  // transaction.completed  — fires when an actual payment is collected (trial→paid conversion)
  if (event === 'subscription.activated') {
    await saveSubscription(uid, {
      region:           'intl',
      billing_cycle:    custom.billing || 'annual',
      payment_provider: 'paddle',
      payment_id:       data.id,
      amount:           0,
      currency:         data.currency_code || 'USD',
      status:           'trialing',
    })
    return res.json({ success: true })
  }

  if (event === 'transaction.completed') {
    const item    = data.items?.[0]
    const priceId = item?.price?.id || ''
    const billing = priceId === process.env.PADDLE_PRICE_MONTHLY  ? 'monthly'
                  : priceId === process.env.PADDLE_PRICE_HALFYEAR ? 'halfyear'
                  : custom.billing || 'annual'

    await saveSubscription(uid, {
      region:           'intl',
      billing_cycle:    billing,
      payment_provider: 'paddle',
      payment_id:       data.id,
      amount:           Math.round(parseFloat(data.details?.totals?.grand_total || 0) * 100),
      currency:         data.currency_code || 'USD',
      status:           'active',
    })
    return res.json({ success: true })
  }

  res.json({ received: true })
}

// ── Router ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try { return await handleJunction(req, res) }
    catch (e) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    if (req.headers['x-razorpay-signature']) return await handleRazorpay(req, res)
    const parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    if (req.headers['paddle-signature'] || parsedBody.event_type) return await handlePaddle(req, res)
    res.status(400).json({ error: 'Unknown webhook source' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
