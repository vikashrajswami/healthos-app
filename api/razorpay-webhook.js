import crypto from 'crypto'
import { saveSubscription } from '../server/lib/payments.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' })

  // Verify Razorpay signature
  const signature = req.headers['x-razorpay-signature']
  const body      = JSON.stringify(req.body)
  const expected  = crypto.createHmac('sha256', secret).update(body).digest('hex')

  if (signature !== expected) {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const event   = req.body.event
  const payment = req.body.payload?.payment?.entity

  if (event !== 'payment.captured' || !payment) {
    return res.json({ received: true })
  }

  try {
    const notes = payment.notes || {}
    const uid   = notes.uid

    if (!uid) return res.json({ received: true, skipped: 'no uid in notes' })

    await saveSubscription(uid, {
      region:           notes.region   || 'india',
      billing_cycle:    notes.billing  || 'annual',
      payment_provider: 'razorpay',
      payment_id:       payment.id,
      order_id:         payment.order_id,
      amount:           payment.amount,
      currency:         payment.currency,
    })

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
