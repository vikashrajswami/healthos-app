export default function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY
  res.json({
    keyExists:  key !== undefined,
    keyLength:  key ? key.length : 0,
    keyPreview: key ? key.slice(0, 10) + '...' : 'MISSING',
  })
}
