import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uid, subscription } = req.body || {}
  if (!uid || !subscription) return res.status(400).json({ error: 'Missing uid or subscription' })

  try {
    await supabase.from('push_subscriptions').upsert({
      uid,
      endpoint:   subscription.endpoint,
      p256dh:     subscription.keys?.p256dh,
      auth:       subscription.keys?.auth,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'uid' })

    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
