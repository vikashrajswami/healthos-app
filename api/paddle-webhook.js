// Vercel serverless function — POST /api/paddle-webhook
// Receives Paddle payment_succeeded / subscription_created webhooks
import { saveSubscription } from '../server/lib/payments.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body

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
    res.status(500).json({ error: e.message })
  }
}
