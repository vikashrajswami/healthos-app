const TTL = 10 * 60 * 1000 // 10 minutes

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    const { contact, code, token } = body

    if (!contact || !code) return res.status(400).json({ error: 'Missing contact or code', valid: false })
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'OTP must be 6 digits', valid: false })
    if (!token) return res.status(400).json({ error: 'Session expired. Request a new OTP.', valid: false })

    const parts = Buffer.from(token, 'base64').toString().split('|')
    if (parts.length !== 3) return res.status(400).json({ error: 'Invalid session.', valid: false })

    const [c, otp, ts] = parts
    if (c !== contact) return res.status(400).json({ error: 'Contact mismatch.', valid: false })
    if (otp !== code)  return res.status(400).json({ error: 'Incorrect OTP. Please try again.', valid: false })
    if (Date.now() - Number(ts) > TTL) return res.status(400).json({ error: 'OTP has expired. Request a new one.', valid: false })

    return res.status(200).json({ valid: true })

  } catch (err) {
    console.error('[verify-otp] error:', err.message)
    return res.status(400).json({ error: 'Invalid request. Please try again.', valid: false })
  }
}
