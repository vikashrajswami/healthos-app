const KEY = 'healthos_reports'

export function getAllReports() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function addReport(report) {
  const existing = getAllReports()
  const entry = {
    id: `r_${Date.now()}`,
    date: report.date || new Date().toISOString().split('T')[0],
    addedAt: new Date().toISOString(),
    ...report,
  }
  const updated = [entry, ...existing]
  try { localStorage.setItem(KEY, JSON.stringify(updated)) } catch {}
  return entry
}

export function deleteReport(id) {
  const updated = getAllReports().filter(r => r.id !== id)
  try { localStorage.setItem(KEY, JSON.stringify(updated)) } catch {}
  return updated
}

export function getBiomarkerTrends() {
  const reports = getAllReports()
  const trends = {}
  reports.forEach(report => {
    if (!report.biomarkers?.length) return
    report.biomarkers.forEach(b => {
      if (!b.name) return
      const val = parseFloat(b.value)
      if (isNaN(val)) return
      if (!trends[b.name]) trends[b.name] = []
      trends[b.name].push({
        date: report.date,
        value: val,
        unit: b.unit || '',
        status: b.status || '',
        normalRange: b.normalRange || '',
        reportId: report.id,
      })
    })
  })
  Object.keys(trends).forEach(k =>
    trends[k].sort((a, b) => new Date(a.date) - new Date(b.date))
  )
  return trends
}

export function getCurrentValues() {
  // Most recent value for each biomarker
  const trends = getBiomarkerTrends()
  const current = {}
  Object.entries(trends).forEach(([name, arr]) => {
    current[name] = arr[arr.length - 1]
  })
  return current
}
