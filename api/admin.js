import { getSupabase } from '../server/lib/payments.js'
import webpush from 'web-push'

function isAdmin(key, user) {
  const K = process.env.ADMIN_BLOG_KEY  || ''
  const U = process.env.ADMIN_BLOG_USER || ''
  if (!K || key !== K) return false
  if (U && user !== U) return false
  return true
}

function cors(res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

const PLAN_PRICE = {
  monthly_india: 990, halfyear_india: 2990, annual_india: 3990,
  monthly_intl: 20,   halfyear_intl: 49,    annual_intl: 99,
}

function estimateRevenue(billing_cycle, region, status) {
  if (status === 'trialing') return 0
  return PLAN_PRICE[`${billing_cycle}_${region}`] || 0
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const db = getSupabase()
  if (!db) return res.status(500).json({ error: 'DB not configured' })

  // ── GET actions ──────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { action, adminKey, adminUser } = req.query
    if (!isAdmin(adminKey, adminUser)) return res.status(401).json({ error: 'Unauthorized' })

    // ── Overview ──────────────────────────────────────────────────────────
    if (action === 'overview') {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()
      const week = new Date(Date.now() - 7 * 86400000).toISOString()

      const [
        { count: totalUsers },
        { count: newToday },
        { count: newWeek },
        { data: subs },
        { count: totalReports },
        { count: pushSubs },
        { data: blogPosts },
        { data: signupTrend },
      ] = await Promise.all([
        db.from('profiles').select('*', { count: 'exact', head: true }),
        db.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', todayISO),
        db.from('profiles').select('*', { count: 'exact', head: true }).gte('updated_at', week),
        db.from('subscriptions').select('billing_cycle,region,status').in('status', ['trialing', 'active']),
        db.from('lab_reports').select('*', { count: 'exact', head: true }),
        db.from('push_subscriptions').select('*', { count: 'exact', head: true }),
        db.from('blog_posts').select('id,published,views').limit(200),
        db.from('profiles').select('updated_at').gte('updated_at', week).order('updated_at', { ascending: true }),
      ])

      const activeSubs  = (subs || []).filter(s => s.status === 'active').length
      const trialSubs   = (subs || []).filter(s => s.status === 'trialing').length
      const revenue     = (subs || []).reduce((sum, s) => sum + estimateRevenue(s.billing_cycle, s.region, s.status), 0)
      const totalViews  = (blogPosts || []).reduce((s, p) => s + (p.views || 0), 0)
      const pubPosts    = (blogPosts || []).filter(p => p.published).length

      // signup trend: count per day for last 7 days
      const days = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000)
        days[d.toISOString().slice(0, 10)] = 0
      }
      ;(signupTrend || []).forEach(r => {
        const d = (r.updated_at || '').slice(0, 10)
        if (days[d] !== undefined) days[d]++
      })

      return res.json({
        totalUsers:  totalUsers  || 0,
        newToday:    newToday    || 0,
        newWeek:     newWeek     || 0,
        activeSubs,
        trialSubs,
        totalReports: totalReports || 0,
        pushSubs:     pushSubs    || 0,
        revenue,
        totalViews,
        pubPosts,
        signupTrend: Object.entries(days).map(([date, count]) => ({ date, count })),
      })
    }

    // ── Users ─────────────────────────────────────────────────────────────
    if (action === 'users') {
      const page   = parseInt(req.query.page  || '0')
      const search = (req.query.search || '').trim()
      const plan   = req.query.plan || ''
      const PAGE   = 50

      let q = db.from('profiles')
        .select('uid,name,phone,email,bioage,actual_age,quiz_done,lang,theme,status,updated_at,deleted_at', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(page * PAGE, (page + 1) * PAGE - 1)

      if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)

      const { data: users, count } = await q

      // Fetch sub status for this page of users
      const uids = (users || []).map(u => u.uid)
      const { data: subs } = uids.length
        ? await db.from('subscriptions').select('uid,plan,status,billing_cycle,region,current_period_end')
            .in('uid', uids).in('status', ['trialing', 'active'])
        : { data: [] }

      const subMap = {}
      ;(subs || []).forEach(s => { subMap[s.uid] = s })

      let rows = (users || []).map(u => ({ ...u, subscription: subMap[u.uid] || null }))

      // Client-side plan filter (simpler than a join)
      if (plan === 'paid')  rows = rows.filter(u => u.subscription?.status === 'active')
      if (plan === 'trial') rows = rows.filter(u => u.subscription?.status === 'trialing')
      if (plan === 'free')  rows = rows.filter(u => !u.subscription)

      return res.json({ users: rows, total: count || 0, page, pageSize: PAGE })
    }

    // ── Subscriptions ─────────────────────────────────────────────────────
    if (action === 'subscriptions') {
      const { data: subs } = await db.from('subscriptions')
        .select('uid,plan,status,billing_cycle,region,trial_ends_at,current_period_end,razorpay_payment_id,created_at')
        .order('created_at', { ascending: false })
        .limit(200)

      const { data: profiles } = subs?.length
        ? await db.from('profiles').select('uid,name,phone').in('uid', subs.map(s => s.uid))
        : { data: [] }

      const profMap = {}
      ;(profiles || []).forEach(p => { profMap[p.uid] = p })

      const rows = (subs || []).map(s => ({
        ...s,
        user: profMap[s.uid] || null,
        estimated_revenue: estimateRevenue(s.billing_cycle, s.region, s.status),
      }))

      const totalRevenue   = rows.filter(s => s.status === 'active').reduce((sum, s) => sum + s.estimated_revenue, 0)
      const activeSubs     = rows.filter(s => s.status === 'active').length
      const trialSubs      = rows.filter(s => s.status === 'trialing').length
      const supersededSubs = rows.filter(s => s.status === 'superseded').length

      return res.json({ subscriptions: rows, totalRevenue, activeSubs, trialSubs, supersededSubs })
    }

    // ── Feature Flags ──────────────────────────────────────────────────────
    if (action === 'flags') {
      const { data, error } = await db.from('feature_flags').select('*').order('key')
      if (error && error.code === '42P01') {
        // Table doesn't exist yet — return defaults
        return res.json({ flags: DEFAULT_FLAGS, tableExists: false })
      }
      const flags = DEFAULT_FLAGS.map(d => {
        const found = (data || []).find(r => r.key === d.key)
        return found ? { ...d, value: found.value, description: found.description || d.description } : d
      })
      return res.json({ flags, tableExists: true })
    }

    // ── Push subscriber count ──────────────────────────────────────────────
    if (action === 'push_count') {
      const { count } = await db.from('push_subscriptions').select('*', { count: 'exact', head: true })
      return res.json({ count: count || 0 })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  // ── POST actions ─────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    const { action, adminKey, adminUser } = body
    if (!isAdmin(adminKey, adminUser)) return res.status(401).json({ error: 'Unauthorized' })

    // ── Delete / restore user ──────────────────────────────────────────────
    if (action === 'delete_user') {
      const { uid } = body
      await db.from('profiles').update({ deleted_at: new Date().toISOString(), status: 'deleted' }).eq('uid', uid)
      return res.json({ ok: true })
    }
    if (action === 'restore_user') {
      const { uid } = body
      await db.from('profiles').update({ deleted_at: null, status: null }).eq('uid', uid)
      return res.json({ ok: true })
    }

    // ── Toggle feature flag ────────────────────────────────────────────────
    if (action === 'toggle_flag') {
      const { key, value } = body
      await db.from('feature_flags').upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      return res.json({ ok: true })
    }

    // ── Broadcast push notification ────────────────────────────────────────
    if (action === 'send_push') {
      const { title, body: msg, url, segment } = body

      const VAPID_PUB = process.env.VAPID_PUBLIC_KEY
      const VAPID_PRV = process.env.VAPID_PRIVATE_KEY
      if (!VAPID_PUB || !VAPID_PRV) return res.status(500).json({ error: 'VAPID keys not configured' })

      webpush.setVapidDetails(`mailto:${process.env.ADMIN_EMAIL || 'admin@arogyos.com'}`, VAPID_PUB, VAPID_PRV)

      const { data: subs } = await db.from('push_subscriptions').select('uid,endpoint,p256dh,auth')
      if (!subs?.length) return res.json({ sent: 0, failed: 0 })

      const payload = JSON.stringify({ title, body: msg, url: url || '/', icon: '/icons.svg', badge: '/icons.svg' })
      let sent = 0, failed = 0

      await Promise.allSettled(subs.map(async s => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
          sent++
        } catch {
          failed++
        }
      }))

      // Log the notification
      await db.from('push_log').insert({
        title, body: msg, url: url || '/', segment: segment || 'all',
        sent, failed, sent_at: new Date().toISOString(),
        sent_by: adminUser,
      }).catch(() => {})

      return res.json({ sent, failed })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

const DEFAULT_FLAGS = [
  { key: 'lab_booking',        value: false, description: 'Enable Thyrocare lab booking flow' },
  { key: 'vital_sync',         value: false, description: 'Enable wearable sync via Vital API' },
  { key: 'family_plans',       value: true,  description: 'Show Family Plans section on pricing' },
  { key: 'blog_visible',       value: true,  description: 'Show blog in main navigation' },
  { key: 'ai_protocols',       value: true,  description: 'Show AI-generated supplement protocols' },
  { key: 'morning_briefing',   value: true,  description: 'Enable Morning Briefing screen' },
  { key: 'cgm_connect',        value: false, description: 'Enable CGM Bluetooth connection flow' },
  { key: 'referral_program',   value: false, description: 'Enable referral invite system' },
  { key: 'abha_import',        value: false, description: 'Enable ABHA health record auto-import' },
  { key: 'maintenance_mode',   value: false, description: 'Show maintenance banner to all users' },
]
