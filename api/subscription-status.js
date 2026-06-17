// Vercel serverless function — GET /api/subscription-status?uid=xxx
// Returns current subscription status for a user
import { getSubscription } from '../server/lib/payments.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const uid = req.query.uid
  if (!uid) return res.status(400).json({ error: 'uid required' })

  try {
    const sub = await getSubscription(uid)
    if (!sub) return res.json({ plan: 'free', status: 'free' })
    res.json({
      plan:               sub.plan,
      status:             sub.status,
      billing_cycle:      sub.billing_cycle,
      region:             sub.region,
      trial_ends_at:      sub.trial_ends_at,
      current_period_end: sub.current_period_end,
    })
  } catch (e) {
    res.json({ plan: 'free', status: 'free' })
  }
}
