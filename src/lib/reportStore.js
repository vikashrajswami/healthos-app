const KEY = 'healthos_reports'

export function getAllReports() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function normalizeBiomarker(b) {
  // Already in display format
  if (b.name) return b
  // Convert from labNormalizer format (canonical, stdValue, stdUnit, flag, ref)
  const normalRange = b.normalRange
    || (b.ref ? `${b.ref.low}–${b.ref.high} ${b.stdUnit || ''}`.trim() : '')
  return {
    name:        b.canonical || b.biomarkerId || 'Unknown',
    value:       b.stdValue ?? b.rawValue,
    unit:        b.stdUnit  || b.rawUnit || '',
    status:      b.flag     || 'NORMAL',
    normalRange,
    canonical:   b.canonical,
    category:    b.category,
    icon:        b.icon,
  }
}

export function addReport(report) {
  const existing = getAllReports()
  const entry = {
    id: `r_${Date.now()}`,
    date: report.date || new Date().toISOString().split('T')[0],
    addedAt: new Date().toISOString(),
    ...report,
    biomarkers: (report.biomarkers || []).map(normalizeBiomarker),
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
      const key = b.name || b.canonical
      if (!key) return
      const val = parseFloat(b.stdValue ?? b.value)
      if (isNaN(val)) return
      if (!trends[key]) trends[key] = []
      trends[key].push({
        date: report.date,
        value: val,
        unit: b.unit || b.stdUnit || b.rawUnit || '',
        status: b.status || b.flag || '',
        normalRange: b.normalRange || (b.ref ? `${b.ref.low}–${b.ref.high}` : ''),
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
