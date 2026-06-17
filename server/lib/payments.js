import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

// ── Clients ──────────────────────────────────────────────────────────────────

export function getRazorpay() {
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret || keyId.includes('YOUR')) return null
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key || url.includes('YOUR') || key.includes('YOUR')) return null
  return createClient(url, key)
}

// ── Razorpay helpers ─────────────────────────────────────────────────────────

const AMOUNTS = {
  india: { monthly: 9900, halfyear: 29900, annual: 39900 },  // paise
  intl:  { monthly: 2000, halfyear: 4900,  annual: 9900  },  // cents
}
const CURRENCIES = { india: 'INR', intl: 'USD' }

export async function createRazorpayOrder({ uid, billing, region }) {
  const rzp = getRazorpay()
  if (!rzp) throw new Error('Razorpay not configured')

  const amount   = AMOUNTS[region]?.[billing]
  const currency = CURRENCIES[region]
  if (!amount) throw new Error('Invalid billing cycle')

  const order = await rzp.orders.create({
    amount,
    currency,
    receipt:  `aro_${uid.slice(-8)}_${Date.now()}`,
    notes:    { uid, billing, region },
  })
  return { orderId: order.id, amount, currency, keyId: process.env.RAZORPAY_KEY_ID }
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return expected === signature
}

// ── Supabase helpers ─────────────────────────────────────────────────────────

export async function upsertProfile(uid, data) {
  const sb = getSupabase()
  if (!sb) return
  await sb.from('profiles').upsert(
    { uid, ...data, updated_at: new Date().toISOString() },
    { onConflict: 'uid' }
  )
}

export async function saveSubscription(uid, data) {
  const sb = getSupabase()
  if (!sb) return

  // Deactivate any old subscriptions for this user first
  await sb.from('subscriptions').update({ status: 'superseded' }).eq('uid', uid)

  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  await sb.from('subscriptions').insert({
    uid,
    plan:             'plus',
    status:           'trialing',
    trial_ends_at:    trialEnd,
    current_period_end: trialEnd,
    updated_at:       new Date().toISOString(),
    ...data,
  })
}

export async function getSubscription(uid) {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb
    .from('subscriptions')
    .select('*')
    .eq('uid', uid)
    .in('status', ['trialing', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}
