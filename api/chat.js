// Chat is handled entirely in-app (src/lib/healthAI.js) — no server needed.
export default function handler(req, res) {
  res.status(410).json({ error: 'Chat is now handled in-app. No server call needed.' })
}
