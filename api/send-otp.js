import crypto from 'crypto'

const SECRET = process.env.OTP_SECRET || process.env.SUPABASE_SERVICE_KEY || 'arogyos-otp-secret-2026'

function generate6Digit() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Sign OTP into a token so verify-otp can check it without DB
function signOtp(contact, otp) {
  const ts  = Date.now()
  const msg = `${contact}:${otp}:${ts}`
  const sig = crypto.createHmac('sha256', SECRET).update(msg).digest('hex')
  return Buffer.from(JSON.stringify({ contact, otp, ts, sig })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Email via Resend ──────────────────────────────────────────────────────────
async function sendEmailOTP(email, otp) {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('Email service not configured')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    process.env.RESEND_FROM_EMAIL || 'AROGYOS <onboarding@resend.dev>',
      to:      [email],
      subject: `${otp} is your AROGYOS verification code`,
      html: `
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
            Do not share this code with anyone.
          </p>
          <div style="text-align:center;margin-top:24px;font-size:11px;color:#cbd5e1">
            AROGYOS Intelligence · support@arogyos.com
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

// ── SMS via MSG91 ─────────────────────────────────────────────────────────────
async function sendSMSOTP(phone, otp) {
  const cleanPhone = phone.replace(/\D/g, '')
  const res = await fetch('https://api.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authkey:     process.env.MSG91_AUTH_KEY,
      mobile:      cleanPhone,
      template_id: process.env.MSG91_TEMPLATE_ID,
      sender:      process.env.MSG91_SENDER_ID || 'ARGYOS',
      otp,
      otp_expiry:  10,
    }),
  })
  const body = await res.text()
  if (!res.ok) throw new Error('MSG91 error: ' + body)
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { contact, type } = req.body || {}
    if (!contact || !type) return res.status(400).json({ error: 'Missing contact or type' })

    const otp   = generate6Digit()
    const token = signOtp(contact, otp)

    console.log('[send-otp] contact:', contact, 'type:', type, 'otp:', otp)

    if (type === 'email') {
      try {
        await sendEmailOTP(contact, otp)
        return res.json({ ok: true, token, message: 'OTP sent to your email' })
      } catch (e) {
        console.error('[send-otp] email failed:', e.message)
        return res.json({ ok: true, token, dev_otp: otp, message: 'Email unavailable — OTP shown on screen' })
      }
    }

    // SMS
    if (!process.env.MSG91_TEMPLATE_ID) {
      // DLT not approved yet — show OTP on screen
      return res.json({ ok: true, token, dev_otp: otp, message: 'SMS pending DLT approval' })
    }

    try {
      await sendSMSOTP(contact, otp)
      return res.json({ ok: true, token, message: 'OTP sent via SMS' })
    } catch (e) {
      console.error('[send-otp] SMS failed:', e.message)
      return res.json({ ok: true, token, dev_otp: otp, message: 'SMS unavailable — OTP shown on screen' })
    }

  } catch (err) {
    console.error('[send-otp] unhandled error:', err.message)
    return res.status(500).json({ error: 'Server error. Please try again.' })
  }
}
