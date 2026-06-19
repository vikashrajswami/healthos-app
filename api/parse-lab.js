import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
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
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { fileBase64 } = req.body || {}
    if (!fileBase64) return res.status(400).json({ error: 'No file data provided' })
    if (fileBase64.length > 10_000_000) {
      return res.status(413).json({ error: 'File too large (max ~7MB)' })
    }

    const buffer = Buffer.from(fileBase64, 'base64')
    const data = new Uint8Array(buffer)

    console.log('[parse-lab] PDF size:', buffer.length, 'bytes')

    const pdf = await pdfjsLib.getDocument({
      data,
      disableFontFace: true,
      verbosity: 0,
      useWorkerFetch: false,
      isEvalSupported: false,
    }).promise

    console.log('[parse-lab] Pages:', pdf.numPages)

    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = pdfItemsToText(content.items)
      fullText += pageText + '\n'
      console.log(`[parse-lab] Page ${i} chars:`, pageText.length)
    }

    console.log('[parse-lab] Total text length:', fullText.length)
    console.log('[parse-lab] Text sample:', fullText.slice(0, 500))

    const rows = extractRowsFromText(fullText)
    console.log('[parse-lab] Rows extracted:', rows.length)

    const biomarkers = parseLabReport(rows)
    console.log('[parse-lab] Biomarkers found:', biomarkers.length, biomarkers.map(b => b.canonical))

    if (biomarkers.length === 0) {
      console.warn('[parse-lab] No biomarkers matched. Sample rows:', rows.slice(0, 20))
    }

    return res.status(200).json({ biomarkers, pages: pdf.numPages, textLength: fullText.length, rowsFound: rows.length })
  } catch (err) {
    console.error('[parse-lab] Error:', err.message, err.stack?.slice(0, 500))
    return res.status(500).json({ error: err?.message || String(err) })
  }
}
