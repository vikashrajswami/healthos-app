// Vercel serverless function — POST /api/payment-order
// Creates a Razorpay order (server-side, keys stay secret)
import { createRazorpayOrder } from '../server/lib/payments.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uid, billing, region } = req.body
  if (!uid || !billing || !region) {
    return res.status(400).json({ error: 'uid, billing, region required' })
  }
  try {
    const order = await createRazorpayOrder({ uid, billing, region })
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
