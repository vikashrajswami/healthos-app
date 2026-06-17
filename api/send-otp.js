import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

function generate6Digit() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ── Email via Resend ──────────────────────────────────────────────────────────
async function sendEmailOTP(email, otp) {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('Email service not configured')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    process.env.RESEND_FROM_EMAIL || 'AROGYOS <onboarding@resend.dev>',
      to:      [email],
      subject: `${otp} is your AROGYOS verification code`,
      html:    `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="font-size:28px;font-weight:900;color:#0f172a">AROGY<span style="color:#14b8a6">OS</span></div>
          </div>
          <h2 style="color:#0f172a;margin:0 0 8px">Your verification code</h2>
          <p style="color:#64748b;margin:0 0 24px">Enter this code in the AROGYOS app to verify your account.</p>
          <div style="background:#fff;border:2px solid #14b8a6;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#0f172a">${otp}</div>
            <div style="font-size:13px;color:#94a3b8;margin-top:8px">Expires in 10 minutes</div>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center">
            If you did not request this code, please ignore this email.<br/>
            Do not share this code with anyone — AROGYOS will never ask for it.
          </p>
          <div style="text-align:center;margin-top:24px;font-size:11px;color:#cbd5e1">
            AROGYOS Intelligence · support@arogyos.in
          </div>
        </div>
      `,
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to send email')
  }
}

// ── SMS via MSG91 (India) or Twilio (international) ───────────────────────────
async function sendSMSOTP(phone, otp) {
  // MSG91 — best for India
  if (process.env.MSG91_AUTH_KEY) {
    const cleanPhone = phone.replace(/\D/g, '')
    // MSG91 OTP Send API
    const res = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authkey:     process.env.MSG91_AUTH_KEY,
        mobile:      cleanPhone,
        template_id: process.env.MSG91_TEMPLATE_ID,
        otp,
        otp_expiry: 10,
      }),
    })
    if (!res.ok) throw new Error('Failed to send SMS via MSG91')
    return
  }

  // Twilio fallback
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const sid  = process.env.TWILIO_ACCOUNT_SID
    const auth = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_FROM_NUMBER

    const body = new URLSearchParams({
      To:   phone,
      From: from,
      Body: `${otp} is your AROGYOS verification code. Valid for 10 minutes. Do not share.`,
    })

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${auth}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
    if (!res.ok) throw new Error('Failed to send SMS via Twilio')
    return
  }

  throw new Error('SMS service not configured. Please add MSG91_AUTH_KEY or Twilio credentials.')
}

// ── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { contact, type } = req.body || {}
  if (!contact || !type) return res.status(400).json({ error: 'Missing contact or type' })
  if (!['email', 'sms'].includes(type)) return res.status(400).json({ error: 'Invalid type' })

  // Rate limit: max 3 OTP requests per contact per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('otp_codes')
    .select('id', { count: 'exact', head: true })
    .eq('contact', contact)
    .gte('created_at', oneHourAgo)

  if (count >= 3) {
    return res.status(429).json({ error: 'Too many OTP requests. Try again in 1 hour.' })
  }

  const otp       = generate6Digit()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Delete old unused OTPs for this contact
  await supabase.from('otp_codes').delete().eq('contact', contact).eq('used', false)

  // Store new OTP
  const { error: dbErr } = await supabase.from('otp_codes').insert({
    contact,
    code:       otp,
    expires_at: expiresAt,
    type,
  })
  if (dbErr) return res.status(500).json({ error: 'Database error. Try again.' })

  try {
    if (type === 'email') {
      await sendEmailOTP(contact, otp)
    } else {
      await sendSMSOTP(contact, otp)
    }
    res.json({ ok: true, message: type === 'email' ? 'OTP sent to your email' : 'OTP sent via SMS' })
  } catch (e) {
    // Clean up stored OTP if send failed
    await supabase.from('otp_codes').delete().eq('contact', contact).eq('code', otp)
    res.status(500).json({ error: e.message || 'Failed to send OTP. Try again.' })
  }
}
