// Vercel serverless function — POST /api/payment-verify
// Verifies Razorpay HMAC signature and stores subscription
import { verifyRazorpaySignature, saveSubscription } from '../server/lib/payments.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    uid, billing, region, amount, currency,
  } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing Razorpay fields' })
  }

  const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!valid) return res.status(400).json({ error: 'Payment verification failed' })

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
    res.status(500).json({ error: e.message })
  }
}
