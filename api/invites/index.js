import { createClient } from '@supabase/supabase-js'

const sb = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null

function randCode() {
  return Math.random().toString(36).substring(2, 9).toUpperCase()
}

const BASE = process.env.APP_URL || 'https://arogyos.com'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { inviterId, inviterName = 'Someone', phone, relation } = req.body || {}
  if (!inviterId) return res.status(400).json({ error: 'inviterId required' })

  /* Encode invite data into the code itself so join page works without DB */
  const payload = btoa(JSON.stringify({ inviterId, inviterName, phone: phone || '', relation: relation || 'Family' }))
  const code = payload.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const inviteUrl = `${BASE}/join/${code}`

  /* Persist to Supabase if configured */
  if (sb) {
    await sb.from('invites').insert({
      code, inviter_id: inviterId, inviter_name: inviterName,
      phone, relation, status: 'pending', created_at: new Date().toISOString(),
    }).throwOnError().catch(() => {})
  }

  return res.json({ code, inviteUrl })
}
