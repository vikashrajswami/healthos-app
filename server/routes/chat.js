import express from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = express.Router()
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null

const SYSTEM_PROMPT = `You are HealthOS AI — a knowledgeable, friendly health guide specialising in biological age, longevity science, and preventive health.

You help users understand:
- What their biomarkers mean (hsCRP, LDL, HbA1c, testosterone, cortisol, etc.)
- How sleep, diet, exercise, and stress affect biological age
- Evidence-based longevity habits and protocols
- How to interpret lab reports
- Nutrition science for age reversal

Rules:
- Keep answers clear, concise, and actionable — no jargon without explanation
- Always mention when something needs a real doctor (symptoms, medication, diagnosis)
- Base advice on peer-reviewed science (cite studies briefly when relevant)
- Be warm and encouraging — people are trying to improve their health
- Never diagnose or prescribe
- If asked something outside health/longevity, politely redirect to health topics`

/* POST /api/chat */
router.post('/', async (req, res) => {
  const { messages, context } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' })
  }

  /* If no API key, return a helpful fallback */
  if (!client) {
    return res.json({
      reply: "I'm your HealthOS AI guide! To activate me, the app needs an Anthropic API key configured. Ask your app administrator to add ANTHROPIC_API_KEY to the server environment."
    })
  }

  try {
    /* Prepend the user's current health insight as extra context */
    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nThe user's current HealthOS insight is: "${context}"\nUse this as context when answering their questions.`
      : SYSTEM_PROMPT

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 600,
      system:     systemWithContext,
      messages:   messages.map(m => ({ role: m.role, content: m.content })),
    })

    res.json({ reply: response.content[0].text })
  } catch (err) {
    console.error('Chat error:', err.message)
    res.status(500).json({ error: 'AI unavailable — please try again.' })
  }
})

export default router
