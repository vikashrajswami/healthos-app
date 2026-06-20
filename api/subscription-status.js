// Vercel serverless function — GET /api/subscription-status?uid=xxx
import { getSubscription } from '../server/lib/payments.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const uid = req.query.uid
  if (!uid) return res.status(400).json({ error: 'uid required' })

  try {
    const sub = await getSubscription(uid)
    if (!sub) return res.json({ plan: 'free', status: 'free' })

    // Check if subscription period has expired
    const now = new Date()
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null
    if (periodEnd && periodEnd < now) {
      return res.json({ plan: 'free', status: 'expired' })
    }

    res.json({
      plan:               sub.plan,
      status:             sub.status,
      billing_cycle:      sub.billing_cycle,
      region:             sub.region,
      trial_ends_at:      sub.trial_ends_at,
      current_period_end: sub.current_period_end,
    })
  } catch (e) {
    // On DB error, don't revoke access — fail open
    res.json({ plan: 'free', status: 'free' })
  }
}
