export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    const { contact, type } = body
    if (!contact || !type) return res.status(400).json({ error: 'Missing contact or type' })

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const ts  = Date.now()
    const token = Buffer.from(contact + '|' + otp + '|' + ts).toString('base64')

    console.log('[send-otp] contact:', contact, 'type:', type, 'otp:', otp)

    // SMS via MSG91 (only when DLT is approved and template ID is set)
    if (type === 'sms' && process.env.MSG91_TEMPLATE_ID && process.env.MSG91_AUTH_KEY) {
      try {
        const cleanPhone = contact.replace(/\D/g, '')
        const smsRes = await fetch('https://api.msg91.com/api/v5/otp', {
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
        const smsBody = await smsRes.text()
        console.log('[send-otp] MSG91 response:', smsBody)
        let smsJson = {}
        try { smsJson = JSON.parse(smsBody) } catch {}
        // MSG91 returns type:"success" only when SMS was actually queued
        if (smsRes.ok && smsJson.type === 'success') {
          return res.status(200).json({ ok: true, token, message: 'OTP sent via SMS' })
        }
        console.error('[send-otp] MSG91 did not deliver — showing OTP on screen:', smsBody)
      } catch (smsErr) {
        console.error('[send-otp] SMS fetch error:', smsErr.message)
      }
    }

    // Email via Resend
    if (type === 'email' && process.env.RESEND_API_KEY) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from:    process.env.RESEND_FROM_EMAIL || 'AROGYOS <onboarding@resend.dev>',
            to:      [contact],
            subject: otp + ' is your AROGYOS verification code',
            html:    '<div style="font-family:sans-serif;text-align:center;padding:40px"><h2>Your OTP is <b style="font-size:32px;letter-spacing:8px">' + otp + '</b></h2><p>Expires in 10 minutes</p></div>',
          }),
        })
        if (emailRes.ok) {
          return res.status(200).json({ ok: true, token, message: 'OTP sent to your email' })
        }
      } catch (emailErr) {
        console.error('[send-otp] email error:', emailErr.message)
      }
    }

    // Fallback: show OTP on screen (DLT not approved yet or SMS/email failed)
    return res.status(200).json({ ok: true, token, dev_otp: otp, message: 'OTP ready' })

  } catch (err) {
    console.error('[send-otp] unhandled error:', err.message)
    return res.status(500).json({ error: 'Server error. Please try again.' })
  }
}
