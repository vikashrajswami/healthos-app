import 'dotenv/config'
import express from 'express'
import cors    from 'cors'
import uploadRouter      from './routes/upload.js'
import biomarkersRouter  from './routes/biomarkers.js'
import invitesRouter     from './routes/invites.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/upload',      uploadRouter)
app.use('/api/biomarkers',  biomarkersRouter)
app.use('/api/invites',     invitesRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`HealthOS server running on http://localhost:${PORT}`))
