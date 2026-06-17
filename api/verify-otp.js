import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { contact, code } = req.body || {}
    if (!contact || !code) return res.status(400).json({ error: 'Missing contact or code' })
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'OTP must be 6 digits', valid: false })

    const { data, error } = await getSupabase()
      .from('otp_codes')
      .select('*')
      .eq('contact', contact)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return res.status(400).json({ error: 'No active OTP found. Please request a new one.', valid: false })
    }

    if (new Date(data.expires_at) < new Date()) {
      try { await getSupabase().from('otp_codes').delete().eq('id', data.id) } catch {}
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.', valid: false })
    }

    if (data.code !== code) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.', valid: false })
    }

    try {
      await getSupabase().from('otp_codes').update({ used: true, used_at: new Date().toISOString() }).eq('id', data.id)
    } catch {}

    res.json({ valid: true, type: data.type })

  } catch (err) {
    console.error('verify-otp error:', err)
    res.status(500).json({ error: 'Server error. Please try again.', valid: false })
  }
}
