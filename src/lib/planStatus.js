// Central plan/gate helpers — used across all screens

export function isPlusMember() {
  return localStorage.getItem('healthos_plan') === 'plus'
}

export function setPlusMember() {
  localStorage.setItem('healthos_plan', 'plus')
  localStorage.setItem('healthos_plan_verified_at', Date.now().toString())
}

export function clearPlusMember() {
  localStorage.removeItem('healthos_plan')
  localStorage.removeItem('healthos_plan_verified_at')
}

// Verify subscription status from server once per session (or every 6h)
// Call this on app load — silently corrects stale local state
export async function syncSubscriptionStatus() {
  const uid = localStorage.getItem('healthos_uid')
  if (!uid) return

  // Throttle: only re-verify every 6 hours
  const lastChecked = parseInt(localStorage.getItem('healthos_plan_verified_at') || '0')
  const SIX_HOURS   = 6 * 60 * 60 * 1000
  if (Date.now() - lastChecked < SIX_HOURS) return

  try {
    const res = await fetch(`/api/subscription-status?uid=${encodeURIComponent(uid)}`)
    if (!res.ok) return
    const { plan, status } = await res.json()

    if ((plan === 'plus' || plan === 'pro') && (status === 'active' || status === 'trialing')) {
      setPlusMember()
    } else {
      clearPlusMember()
    }
  } catch {
    // Network failure — keep current local state, try again next session
  }
}

function monthKey() {
  return new Date().toISOString().slice(0, 7) // "YYYY-MM"
}

// ── Upload gate (1 upload/month free) ─────────────────────────────────────────
export function getMonthlyUploads() {
  return parseInt(localStorage.getItem(`healthos_uploads_${monthKey()}`) || '0')
}
export function recordUpload() {
  const k = `healthos_uploads_${monthKey()}`
  localStorage.setItem(k, parseInt(localStorage.getItem(k) || '0') + 1)
}

// ── Chat gate (5 messages/month free) ─────────────────────────────────────────
export function getMonthlyChatCount() {
  return parseInt(localStorage.getItem(`healthos_chats_${monthKey()}`) || '0')
}
export function recordChat() {
  const k = `healthos_chats_${monthKey()}`
  localStorage.setItem(k, parseInt(localStorage.getItem(k) || '0') + 1)
}

// ── Quiz upgrade prompt (show once) ───────────────────────────────────────────
export function hasSeenUpgradePrompt() {
  return !!localStorage.getItem('healthos_upgrade_seen')
}
export function markUpgradePromptSeen() {
  localStorage.setItem('healthos_upgrade_seen', '1')
}
