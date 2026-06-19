// Combined webhook handler — Razorpay (x-razorpay-signature) + Paddle Billing (paddle-signature)
import crypto from 'crypto'
import { saveSubscription } from '../server/lib/payments.js'

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    if (req.headers['x-razorpay-signature']) return await handleRazorpay(req, res)
    if (req.headers['paddle-signature'] || req.body.event_type) return await handlePaddle(req, res)
    res.status(400).json({ error: 'Unknown webhook source' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
