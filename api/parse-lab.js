// Server-side lab report parser — runs pdfjs-dist in Node.js (no browser issues)
import { extractRowsFromText, parseLabReport } from '../src/lib/labNormalizer.js'

function pdfItemsToText(items) {
  const ti = items.filter(it => typeof it.str === 'string' && it.str.trim())
  if (!ti.length) return ''
  const groups = []
  for (const item of ti) {
    const y = item.transform[5]
    let g = groups.find(g => Math.abs(g.y - y) <= 8)
    if (!g) { g = { y, items: [] }; groups.push(g) }
    g.items.push(item)
  }
  groups.sort((a, b) => b.y - a.y)
  return groups
    .map(g => g.items.sort((a, b) => a.transform[4] - b.transform[4]).map(i => i.str).join(' '))
    .join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { fileBase64 } = req.body
    if (!fileBase64) return res.status(400).json({ error: 'No file data' })

    // Enforce 6MB base64 limit (~4.5MB raw file)
    if (fileBase64.length > 8_000_000) {
      return res.status(413).json({ error: 'File too large for server parsing' })
    }

    const buffer = Buffer.from(fileBase64, 'base64')
    const data = new Uint8Array(buffer)

    // pdfjs-dist legacy build — no worker needed in Node.js
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const pdf = await pdfjsLib.getDocument({ data }).promise

    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      fullText += pdfItemsToText(content.items) + '\n'
    }

    const rows = extractRowsFromText(fullText)
    const biomarkers = parseLabReport(rows)

    return res.status(200).json({ biomarkers, text: fullText.slice(0, 500) })
  } catch (e) {
    console.error('parse-lab error:', e)
    return res.status(500).json({ error: String(e?.message || e) })
  }
}
