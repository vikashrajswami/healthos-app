import express from 'express'
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  saveSubscription,
  getSubscription,
  upsertProfile,
} from '../lib/payments.js'

const router = express.Router()

/* ────────────────────────────────────────────────
   POST /api/payment/create-order
   Creates a Razorpay order and returns orderId + keyId to frontend
──────────────────────────────────────────────── */
router.post('/create-order', async (req, res) => {
  const { uid, billing, region } = req.body
  if (!uid || !billing || !region) {
    return res.status(400).json({ error: 'uid, billing, region required' })
  }
  try {
    const order = await createRazorpayOrder({ uid, billing, region })
    res.json(order)
  } catch (e) {
    console.error('create-order error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

/* ────────────────────────────────────────────────
   POST /api/payment/verify
   Verifies Razorpay signature, stores subscription in Supabase
──────────────────────────────────────────────── */
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uid, billing, region, amount, currency } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing Razorpay fields' })
  }

  const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!valid) {
    return res.status(400).json({ error: 'Payment verification failed' })
  }

  try {
    await saveSubscription(uid, {
      region,
      billing_cycle:    billing,
      payment_provider: 'razorpay',
      payment_id:       razorpay_payment_id,
      order_id:         razorpay_order_id,
      amount,
      currency,
    })
    res.json({ success: true })
  } catch (e) {
    console.error('verify error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

/* ────────────────────────────────────────────────
   POST /api/payment/paddle-webhook
   Handles Paddle payment_succeeded webhook
──────────────────────────────────────────────── */
router.post('/paddle-webhook', express.urlencoded({ extended: true }), async (req, res) => {
  const body = req.body

  // Only process payment_succeeded and subscription_created events
  if (!['payment_succeeded', 'subscription_created'].includes(body.alert_name)) {
    return res.json({ received: true })
  }

  try {
    const passthrough = JSON.parse(body.passthrough || '{}')
    const { uid, billing, region } = passthrough

    if (uid) {
      await saveSubscription(uid, {
        region:           region || 'intl',
        billing_cycle:    billing || 'annual',
        payment_provider: 'paddle',
        payment_id:       body.order_id || body.subscription_id,
        amount:           Math.round(parseFloat(body.sale_gross || 0) * 100),
        currency:         body.currency || 'USD',
      })
    }

    res.json({ success: true })
  } catch (e) {
    console.error('paddle-webhook error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

/* ────────────────────────────────────────────────
   GET /api/payment/status/:uid
   Returns subscription status for a user
──────────────────────────────────────────────── */
router.get('/status/:uid', async (req, res) => {
  const { uid } = req.params
  try {
    const sub = await getSubscription(uid)
    if (!sub) return res.json({ plan: 'free', status: 'free' })
    res.json({
      plan:             sub.plan,
      status:           sub.status,
      billing_cycle:    sub.billing_cycle,
      region:           sub.region,
      trial_ends_at:    sub.trial_ends_at,
      current_period_end: sub.current_period_end,
    })
  } catch (e) {
    res.json({ plan: 'free', status: 'free' })
  }
})

/* ────────────────────────────────────────────────
   POST /api/payment/sync-profile
   Saves user profile to Supabase (called after BioAge quiz)
──────────────────────────────────────────────── */
router.post('/sync-profile', async (req, res) => {
  const { uid, name, phone, email, bioage, actual_age, quiz_done, quiz_answers } = req.body
  if (!uid) return res.status(400).json({ error: 'uid required' })
  try {
    await upsertProfile(uid, { name, phone, email, bioage, actual_age, quiz_done, quiz_answers })
    res.json({ success: true })
  } catch (e) {
    console.error('sync-profile error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

export default router
