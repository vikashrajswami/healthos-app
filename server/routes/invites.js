import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

/* ── Supabase (optional — falls back to in-memory Map) ── */
const sb = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null

/* In-memory fallback (resets on server restart) */
const MEM_INVITES = new Map()
const MEM_MEMBERS = new Map()   // key: inviterId → array

function randCode() {
  return Math.random().toString(36).substring(2, 9).toUpperCase()
}

function bioAgeFrom(actual, quiz) {
  const map = {
    exercise: { high: -3, mid: -1, low: 3 },
    smoke:    { no: 0, past: 1, yes: 5 },
    sleep:    { great: -2, ok: 1, poor: 3 },
    diet:     { good: -2, mixed: 1, poor: 3 },
  }
  let bio = actual
  for (const [key, opts] of Object.entries(map)) {
    bio += opts[quiz[key]] ?? 0
  }
  return Math.max(1, Math.round(bio))
}

const BASE = process.env.APP_URL || 'https://healthos-app-two.vercel.app'

/* ────────────────────────────────────────────────
   POST /api/invites   — create invite
──────────────────────────────────────────────── */
router.post('/', async (req, res) => {
  const { inviterId, inviterName = 'Someone', phone, relation } = req.body
  if (!inviterId) return res.status(400).json({ error: 'inviterId required' })

  const code      = randCode()
  const inviteUrl = `${BASE}/join/${code}`
  const invite    = { code, inviterId, inviterName, phone, relation, status: 'pending', createdAt: new Date().toISOString() }

  if (sb) {
    const { error } = await sb.from('invites').insert(invite)
    if (error) return res.status(500).json({ error: error.message })
  } else {
    MEM_INVITES.set(code, invite)
  }

  res.json({ code, inviteUrl })
})

/* ────────────────────────────────────────────────
   GET /api/invites/:code   — get invite details
──────────────────────────────────────────────── */
router.get('/:code', async (req, res) => {
  const { code } = req.params

  if (sb) {
    const { data, error } = await sb.from('invites').select('*').eq('code', code).single()
    if (error || !data) return res.status(404).json({ error: 'Invite not found' })
    return res.json(data)
  }

  const invite = MEM_INVITES.get(code)
  if (!invite) return res.status(404).json({ error: 'Invite not found' })
  res.json(invite)
})

/* ────────────────────────────────────────────────
   POST /api/invites/:code/accept   — family member submits their data
──────────────────────────────────────────────── */
router.post('/:code/accept', async (req, res) => {
  const { code } = req.params
  const { name, actualAge, quizData } = req.body

  let invite
  if (sb) {
    const { data } = await sb.from('invites').select('*').eq('code', code).single()
    invite = data
  } else {
    invite = MEM_INVITES.get(code)
  }
  if (!invite) return res.status(404).json({ error: 'Invite not found or expired' })

  const bioage = bioAgeFrom(parseInt(actualAge), quizData || {})
  const member = {
    id:          Date.now(),
    inviteCode:  code,
    inviterId:   invite.inviterId,
    name,
    relation:    invite.relation,
    phone:       invite.phone,
    actualAge:   parseInt(actualAge),
    bioage,
    quizData,
    joinedAt:    new Date().toISOString(),
  }

  if (sb) {
    await sb.from('family_members').insert({
      invite_code: code,
      inviter_id:  invite.inviterId,
      name,
      relation:    invite.relation,
      actual_age:  parseInt(actualAge),
      bioage,
      quiz_data:   quizData,
    })
    await sb.from('invites').update({ status: 'accepted' }).eq('code', code)
  } else {
    const list = MEM_MEMBERS.get(invite.inviterId) || []
    list.push(member)
    MEM_MEMBERS.set(invite.inviterId, list)
    MEM_INVITES.set(code, { ...invite, status: 'accepted' })
  }

  res.json({ success: true, bioage, member })
})

/* ────────────────────────────────────────────────
   GET /api/invites/family/:inviterId   — all family members + pending invites
──────────────────────────────────────────────── */
router.get('/family/:inviterId', async (req, res) => {
  const { inviterId } = req.params

  if (sb) {
    const [{ data: members }, { data: pending }] = await Promise.all([
      sb.from('family_members').select('*').eq('inviter_id', inviterId).order('joined_at', { ascending: false }),
      sb.from('invites').select('*').eq('inviter_id', inviterId).eq('status', 'pending'),
    ])
    return res.json({ members: members || [], pending: pending || [] })
  }

  const members = MEM_MEMBERS.get(inviterId) || []
  const pending = [...MEM_INVITES.values()].filter(i => i.inviterId === inviterId && i.status === 'pending')
  res.json({ members, pending })
})

export default router
