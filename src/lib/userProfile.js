const KEY = 'healthos_profile'

export function getProfile() {
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function saveProfile(profile) {
  try { localStorage.setItem(KEY, JSON.stringify(profile)) } catch {}
}

export function clearProfile() {
  try { localStorage.removeItem(KEY) } catch {}
}

/* Calculate BioAge from quiz answers + actual age */
export function calcBioAge(actualAge, answers) {
  const SCORES = {
    exercise: { high: -3, mid: -1, low: 3 },
    smoke:    { no: 0, past: 1, yes: 5 },
    sleep:    { great: -2, ok: 1, poor: 3 },
    diet:     { good: -2, mixed: 1, poor: 3 },
    stress:   { low: -1, mid: 1, high: 3 },
  }
  let delta = 0
  for (const [key, opts] of Object.entries(SCORES)) {
    if (answers[key] !== undefined) delta += opts[answers[key]] ?? 0
  }
  return Math.max(18, Math.round(actualAge + delta))
}
