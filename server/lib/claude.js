import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a precise medical lab report parser.
Extract every biomarker from the provided report and return ONLY valid JSON — no markdown, no explanation.

Required format:
{
  "biomarkers": [
    {
      "name": "display name",
      "key": "camelCase key e.g. hsCRP",
      "value": 3.1,
      "unit": "mg/L",
      "status": "NORMAL | HIGH | LOW | BORDERLINE",
      "normalRange": "0–1.0 mg/L"
    }
  ],
  "reportDate": "YYYY-MM-DD or null",
  "labName": "string or null",
  "patientName": "string or null",
  "summary": "2-sentence plain-English summary of the most important findings"
}`

export async function extractBiomarkers(base64Data, mediaType) {
  const isImage = mediaType.startsWith('image/')

  const content = isImage
    ? [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
        { type: 'text',  text: 'Extract all biomarkers from this lab report image.' },
      ]
    : [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64Data },
        },
        { type: 'text', text: 'Extract all biomarkers from this lab report PDF.' },
      ]

  const msg = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 2048,
    system:     SYSTEM,
    messages:   [{ role: 'user', content }],
  })

  const raw = msg.content[0].text.trim()
  return JSON.parse(raw)
}
