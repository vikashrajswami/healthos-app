import Anthropic from '@anthropic-ai/sdk'

// Allow up to 10 MB JSON bodies (base64 PDFs can be large)
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { pdfBase64, fileName } = req.body || {}
    if (!pdfBase64) return res.status(400).json({ error: 'No PDF data provided' })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'AI service not configured. Add ANTHROPIC_API_KEY to Vercel env vars.' })

    const anthropic = new Anthropic({ apiKey })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            type: 'text',
            text: `You are a medical lab report analyzer. Extract every biomarker test result from this report.

Return ONLY valid JSON — no markdown, no explanation, nothing else:
{
  "biomarkers": [
    { "name": "Hemoglobin", "value": "14.5", "unit": "g/dL", "range": "13.5-17.5", "status": "normal" },
    { "name": "Glucose", "value": "110", "unit": "mg/dL", "range": "70-100", "status": "high" }
  ],
  "summary": "One sentence summary of key findings."
}

Rules:
- status must be exactly "normal", "high", or "low"
- Include every test that has a numeric result
- If reference range is not shown, omit the range field
- Return ONLY the JSON object`,
          },
        ],
      }],
    })

    const raw = message.content[0]?.text || ''
    let parsed
    try {
      const match = raw.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(match?.[0] || raw)
    } catch {
      console.error('Claude response was not JSON:', raw.slice(0, 200))
      return res.status(500).json({ error: 'AI returned unexpected format. Try again.' })
    }

    const biomarkers = parsed.biomarkers || []
    res.json({
      biomarkers,
      summary: parsed.summary || '',
      count:   biomarkers.length,
    })

  } catch (err) {
    console.error('chat.js error:', err.message)
    res.status(500).json({ error: err.message || 'Analysis failed. Try again.' })
  }
}
