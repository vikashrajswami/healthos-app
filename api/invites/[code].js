import { createClient } from '@supabase/supabase-js'

const sb = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null

function decodeInvite(code) {
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}

function bioAgeFrom(actual, quiz) {
  const map = {
    exercise: { high: -3, mid: -1, low: 3 },
    smoke:    { no: 0, past: 1, yes: 5 },
    sleep:    { great: -2, ok: 1, poor: 3 },
    diet:     { good: -2, mixed: 1, poor: 3 },
  }
  let bio = actual
  for (const [key, opts] of Object.entries(map)) bio += opts[quiz[key]] ?? 0
  return Math.max(1, Math.round(bio))
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { code } = req.query

  /* GET /api/invites/:code — fetch invite details */
  if (req.method === 'GET') {
    /* Try Supabase first */
    if (sb) {
      const { data } = await sb.from('invites').select('*').eq('code', code).single()
      if (data) return res.json({ inviterName: data.inviter_name, relation: data.relation, inviterId: data.inviter_id })
    }
    /* Fall back to decoding the code itself */
    const invite = decodeInvite(code)
    if (!invite) return res.status(404).json({ error: 'Invite not found' })
    return res.json({ inviterName: invite.inviterName, relation: invite.relation, inviterId: invite.inviterId })
  }

  /* POST /api/invites/:code/accept — family member submits quiz */
  if (req.method === 'POST') {
    const { name, actualAge, quizData } = req.body || {}
    const invite = decodeInvite(code)
    if (!invite) return res.status(404).json({ error: 'Invite not found or expired' })

    const bioage = bioAgeFrom(parseInt(actualAge) || 0, quizData || {})

    if (sb) {
      await sb.from('family_members').insert({
        invite_code: code,
        inviter_id:  invite.inviterId,
        name,
        relation:    invite.relation,
        actual_age:  parseInt(actualAge),
        bioage,
        quiz_data:   quizData,
        joined_at:   new Date().toISOString(),
      }).throwOnError().catch(() => {})

      await sb.from('invites').update({ status: 'accepted' }).eq('code', code).catch(() => {})
    }

    return res.json({ success: true, bioage })
  }

  return res.status(405).end()
}
