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

  // GET /api/webhook?action=jtoken&uid=USER_UID
  // Returns link_token + junction user_id
  if (action === 'jtoken') {
    if (!uid) return res.status(400).json({ error: 'uid required' })

    // Try to get existing user first
    let jUser = await jFetch(`/v2/user/${encodeURIComponent(uid)}`, KEY)

    // Create if not found
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

  // GET /api/webhook?action=jdata&juid=JUNCTION_USER_ID
  // Returns latest activity, sleep, body data
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
async function handleRazorpay(req, res) {
  const secret    = process.env.RAZORPAY_WEBHOOK_SECRET
  const signature = req.headers['x-razorpay-signature']
  const body      = JSON.stringify(req.body)
  const expected  = crypto.createHmac('sha256', secret).update(body).digest('hex')

  if (signature !== expected) return res.status(400).json({ error: 'Invalid Razorpay signature' })

  const event   = req.body.event
  const payment = req.body.payload?.payment?.entity
  if (event !== 'payment.captured' || !payment) return res.json({ received: true })

  const notes = payment.notes || {}
  const uid   = notes.uid
  if (!uid) return res.json({ received: true, skipped: 'no uid' })

  await saveSubscription(uid, {
    region:           notes.region  || 'india',
    billing_cycle:    notes.billing || 'annual',
    payment_provider: 'razorpay',
    payment_id:       payment.id,
    order_id:         payment.order_id,
    amount:           payment.amount,
    currency:         payment.currency,
  })
  res.json({ success: true })
}

// ── Paddle Billing ────────────────────────────────────────────────────────────
async function handlePaddle(req, res) {
  const secret    = process.env.PADDLE_WEBHOOK_SECRET
  const signature = req.headers['paddle-signature']

  if (secret && signature) {
    const ts    = signature.match(/ts=(\d+)/)?.[1]
    const h1    = signature.match(/h1=([a-f0-9]+)/)?.[1]
    const body  = JSON.stringify(req.body)
    const check = crypto.createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex')
    if (check !== h1) return res.status(400).json({ error: 'Invalid Paddle signature' })
  }

  const event = req.body.event_type
  const data  = req.body.data

  if (event !== 'transaction.completed' || !data) return res.json({ received: true })

  const custom = data.custom_data || {}
  const uid    = custom.uid
  if (!uid) return res.json({ received: true, skipped: 'no uid' })

  const item     = data.items?.[0]
  const priceId  = item?.price?.id || ''
  const billing  = priceId === process.env.PADDLE_PRICE_MONTHLY  ? 'monthly'
                 : priceId === process.env.PADDLE_PRICE_HALFYEAR ? 'halfyear'
                 : 'annual'

  await saveSubscription(uid, {
    region:           'intl',
    billing_cycle:    billing,
    payment_provider: 'paddle',
    payment_id:       data.id,
    amount:           Math.round(parseFloat(data.details?.totals?.grand_total || 0) * 100),
    currency:         data.currency_code || 'USD',
  })
  res.json({ success: true })
}

// ── Router ────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Junction device API proxy
  if (req.method === 'GET') {
    try { return await handleJunction(req, res) }
    catch (e) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    if (req.headers['x-razorpay-signature']) return await handleRazorpay(req, res)
    if (req.headers['paddle-signature'] || req.body.event_type) return await handlePaddle(req, res)
    res.status(400).json({ error: 'Unknown webhook source' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
