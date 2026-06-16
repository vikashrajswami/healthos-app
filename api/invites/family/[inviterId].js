import { createClient } from '@supabase/supabase-js'

const sb = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const { inviterId } = req.query

  if (!sb) {
    /* No database — return empty (localStorage on client holds pending state) */
    return res.json({ members: [], pending: [] })
  }

  const [{ data: members }, { data: pending }] = await Promise.all([
    sb.from('family_members').select('*').eq('inviter_id', inviterId).order('joined_at', { ascending: false }),
    sb.from('invites').select('*').eq('inviter_id', inviterId).eq('status', 'pending'),
  ])

  return res.json({ members: members || [], pending: pending || [] })
}
