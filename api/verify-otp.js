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

  const { contact, code } = req.body || {}
  if (!contact || !code) return res.status(400).json({ error: 'Missing contact or code' })
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'OTP must be 6 digits', valid: false })

  // Fetch the most recent unused OTP for this contact
  const { data, error } = await supabase
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

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('otp_codes').delete().eq('id', data.id)
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.', valid: false })
  }

  // Check code
  if (data.code !== code) {
    return res.status(400).json({ error: 'Incorrect OTP. Please try again.', valid: false })
  }

  // Mark as used (don't delete — keep for audit trail, auto-cleaned after 24h)
  await supabase.from('otp_codes').update({ used: true, used_at: new Date().toISOString() }).eq('id', data.id)

  res.json({ valid: true, type: data.type })
}
