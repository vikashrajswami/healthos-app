import express from 'express'
import { getLatestBiomarkers } from '../lib/supabase.js'

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const reports = await getLatestBiomarkers()
    res.json({ reports })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
