import crypto from 'crypto'

const SECRET = process.env.OTP_SECRET || process.env.SUPABASE_SERVICE_KEY || 'arogyos-otp-secret-2026'
const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

function verifyToken(token, contact, code) {
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/')
    const { contact: c, otp, ts, sig } = JSON.parse(Buffer.from(b64, 'base64').toString())
    if (c !== contact) return { ok: false, reason: 'contact mismatch' }
    if (otp !== code)  return { ok: false, reason: 'wrong code' }
    if (Date.now() - ts > OTP_TTL_MS) return { ok: false, reason: 'expired' }
    const expected = crypto.createHmac('sha256', SECRET).update(`${c}:${otp}:${ts}`).digest('hex')
    if (sig !== expected) return { ok: false, reason: 'invalid signature' }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'invalid token' }
  }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { contact, code, token } = req.body || {}
    if (!contact || !code) return res.status(400).json({ error: 'Missing contact or code', valid: false })
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'OTP must be 6 digits', valid: false })

    // Primary: verify via signed token (no DB needed)
    if (token) {
      const result = verifyToken(token, contact, code)
      if (result.ok) return res.json({ valid: true })
      if (result.reason === 'expired') return res.status(400).json({ error: 'OTP has expired. Please request a new one.', valid: false })
      if (result.reason === 'wrong code') return res.status(400).json({ error: 'Incorrect OTP. Please try again.', valid: false })
    }

    return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.', valid: false })

  } catch (err) {
    console.error('verify-otp error:', err)
    return res.status(500).json({ error: 'Server error. Please try again.', valid: false })
  }
}
