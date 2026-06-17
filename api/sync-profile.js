import { getSupabase } from '../server/lib/payments.js'

// POST → push all local data to cloud
// GET  → pull all cloud data for a uid
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const db = getSupabase()
  if (!db) return res.status(500).json({ error: 'Database not configured' })

  // ── PULL: restore data from cloud to device ──────────────────────────────
  if (req.method === 'GET') {
    const uid = req.query?.uid
    if (!uid) return res.status(400).json({ error: 'uid required' })

    try {
      const [{ data: profile }, { data: reports }] = await Promise.all([
        db.from('profiles').select('*').eq('uid', uid).single(),
        db.from('lab_reports').select('*').eq('uid', uid).order('created_at', { ascending: false }),
      ])
      return res.json({ profile: profile || null, reports: reports || [] })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  // ── PUSH: save all device data to cloud ──────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { uid, profile = {}, reports = [] } = req.body || {}
      if (!uid) return res.status(400).json({ error: 'uid required' })

      // Upsert profile row (creates it if first time, updates if returning)
      const profileRow = {
        uid,
        name:          profile.name          || null,
        phone:         profile.phone         || null,
        email:         profile.email         || null,
        bioage:        profile.bioage        ? parseInt(profile.bioage)    : null,
        actual_age:    profile.actual_age    ? parseInt(profile.actual_age): null,
        quiz_done:     profile.quiz_done     ?? false,
        quiz_answers:  profile.quiz_answers  || null,
        weight_kg:     profile.weight_kg     ? parseFloat(profile.weight_kg) : null,
        theme:         profile.theme         || 'teal',
        lang:          profile.lang          || 'en',
        habits:        profile.habits        || {},
        streak_dates:  profile.streak_dates  || [],
        best_streak:   profile.best_streak   ? parseInt(profile.best_streak) : 0,
        first_open:    profile.first_open    ? parseInt(profile.first_open)  : null,
        updated_at:    new Date().toISOString(),
      }

      await db.from('profiles').upsert(profileRow, { onConflict: 'uid' })

      // Sync lab reports — upsert each by its local id
      if (reports.length > 0) {
        const reportRows = reports.map(r => ({
          id:         r.id,          // local uuid like r_1234567890
          uid,
          filename:   r.name || r.filename || 'report',
          biomarkers: r.biomarkers || [],
          raw_text:   null,
          created_at: r.addedAt || r.created_at || new Date().toISOString(),
        }))

        // lab_reports.id is uuid — local ids are like "r_123" (text), so we
        // store in a separate jsonb column on profiles to avoid type mismatch
        await db.from('profiles')
          .update({ quiz_answers: profileRow.quiz_answers })  // already upserted
          .eq('uid', uid)

        // Store reports as jsonb blob on profile row (simpler, avoids id type issues)
        await db.from('profiles')
          .update({ habits: profileRow.habits, streak_dates: profileRow.streak_dates })
          .eq('uid', uid)

        // Actually upsert into lab_reports using a text id column workaround:
        // We store all reports as a single jsonb array in profiles.quiz_answers companion
        // Instead, just insert new ones that don't exist yet
        for (const r of reportRows) {
          const { data: existing } = await db
            .from('lab_reports')
            .select('id')
            .eq('uid', uid)
            .eq('filename', r.filename)
            .eq('created_at', r.created_at)
            .maybeSingle()

          if (!existing) {
            await db.from('lab_reports').insert({
              uid,
              filename:   r.filename,
              biomarkers: r.biomarkers,
              created_at: r.created_at,
            })
          }
        }
      }

      return res.json({ ok: true })
    } catch (e) {
      console.error('sync-profile error:', e)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
