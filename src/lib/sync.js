// Cloud sync — pushes all localStorage data to Supabase and restores it on login
// Zero dependency on any paid API. Uses /api/sync-profile (backend with service key).

function safeGet(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function safeGetRaw(key, fallback = null) {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)) } catch {}
}

// ── Push everything to cloud ──────────────────────────────────────────────────
export async function pushToCloud() {
  const uid = safeGetRaw('healthos_uid')
  if (!uid) return

  const profile   = safeGet('healthos_profile', {})
  const reports   = safeGet('healthos_reports',  [])
  const answers   = safeGet('healthos_answers',  null)
  const habits    = safeGet('healthos_habits',   {})
  const streakDates = safeGet('healthos_streak_dates', [])

  // Map camelCase (Screen1/Screen2) to snake_case expected by the API
  const payload = {
    uid,
    profile: {
      name:         profile.name         || null,
      phone:        profile.phone        || null,
      email:        profile.email        || null,
      bioage:       profile.bioage       || safeGetRaw('healthos_bioage') || null,
      actual_age:   profile.actualAge    || profile.actual_age || null,
      quiz_done:    profile.quizDone     ?? profile.quiz_done ?? false,
      quiz_answers: answers              || profile.answers   || null,
      weight_kg:    safeGetRaw('healthos_weight') || null,
      theme:        safeGetRaw('healthos_theme')  || 'teal',
      lang:         safeGetRaw('healthos_lang')   || 'en',
      habits,
      streak_dates: streakDates,
      best_streak:  safeGetRaw('healthos_best_streak') || 0,
      first_open:   safeGetRaw('healthos_first_open')  || null,
    },
    reports,
  }

  try {
    await fetch('/api/sync-profile', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
  } catch {}  // never block the UI for a sync failure
}

// ── Pull everything from cloud and restore localStorage ───────────────────────
export async function pullFromCloud(uid) {
  if (!uid) return false

  try {
    const res = await fetch(`/api/sync-profile?uid=${encodeURIComponent(uid)}`)
    if (!res.ok) return false

    const { profile, reports } = await res.json()
    if (!profile) return false  // new user, nothing to restore

    // Restore profile — use camelCase keys so app screens read correctly
    const localProfile = {
      name:      profile.name       || '',
      phone:     profile.phone      || '',
      email:     profile.email      || '',
      bioage:    profile.bioage     || null,
      actualAge: profile.actual_age || null,
      quizDone:  profile.quiz_done  || false,
      answers:   profile.quiz_answers || null,
      dob:       profile.dob        || '',
    }
    safeSet('healthos_profile', localProfile)

    if (profile.quiz_answers) safeSet('healthos_answers',  profile.quiz_answers)
    if (profile.bioage)       safeSet('healthos_bioage',   String(profile.bioage))
    if (profile.weight_kg)    safeSet('healthos_weight',   String(profile.weight_kg))
    if (profile.theme)        safeSet('healthos_theme',    profile.theme)
    if (profile.lang)         safeSet('healthos_lang',     profile.lang)
    if (profile.habits && Object.keys(profile.habits).length)
                              safeSet('healthos_habits',   profile.habits)
    if (profile.streak_dates?.length)
                              safeSet('healthos_streak_dates', profile.streak_dates)
    if (profile.best_streak)  safeSet('healthos_best_streak',  String(profile.best_streak))
    if (profile.first_open)   safeSet('healthos_first_open',   String(profile.first_open))

    // Restore lab reports (merge: cloud + local, deduplicate by filename+date)
    if (reports?.length) {
      const local  = safeGet('healthos_reports', [])
      const merged = mergeReports(local, reports)
      safeSet('healthos_reports', merged)
      if (merged.length) safeSet('healthos_last_report_date', merged[0].addedAt || merged[0].created_at)
    }

    return true
  } catch {
    return false
  }
}

// Merge local + cloud reports, newest first, no duplicates
function mergeReports(local, cloud) {
  const seen = new Set()
  const all  = [...local, ...cloud.map(r => ({
    id:         r.id || `r_${Date.now()}_${Math.random()}`,
    name:       r.filename || 'Report',
    date:       (r.created_at || '').split('T')[0],
    addedAt:    r.created_at,
    source:     'Upload',
    biomarkers: r.biomarkers || [],
  }))]
  return all.filter(r => {
    const key = `${r.name}|${r.date}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => new Date(b.addedAt || b.date) - new Date(a.addedAt || a.date))
}
