// Central plan/gate helpers — used across all screens

export function isPlusMember() {
  return localStorage.getItem('healthos_plan') === 'plus'
}

export function setPlusMember() {
  localStorage.setItem('healthos_plan', 'plus')
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
