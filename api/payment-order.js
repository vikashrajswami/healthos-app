// Vercel serverless function — POST /api/payment-order
// Creates a Razorpay order (server-side, keys stay secret)
import { createRazorpayOrder } from '../server/lib/payments.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
  const { uid, billing, region } = body

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
