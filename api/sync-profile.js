// Vercel serverless function — POST /api/sync-profile
// Saves user profile to Supabase after BioAge quiz completion
import { upsertProfile } from '../server/lib/payments.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uid, name, phone, email, bioage, actual_age, quiz_done, quiz_answers } = req.body
  if (!uid) return res.status(400).json({ error: 'uid required' })

  try {
    await upsertProfile(uid, { name, phone, email, bioage, actual_age, quiz_done, quiz_answers })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
