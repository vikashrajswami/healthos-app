import express        from 'express'
import multer         from 'multer'
import { extractBiomarkers } from '../lib/claude.js'
import { saveReport }        from '../lib/supabase.js'

const router  = express.Router()
const storage = multer.memoryStorage()   // keep file in RAM — no disk writes needed

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },   // 20 MB max
  fileFilter(_req, file, cb) {
    const ok = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
    cb(ok ? null : new Error('Only PDF, JPG, PNG, or WebP allowed'), ok)
  },
})

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file received' })

    const base64    = req.file.buffer.toString('base64')
    const mediaType = req.file.mimetype

    // Claude reads the file and extracts structured biomarkers
    const extracted = await extractBiomarkers(base64, mediaType)

    // Save to Supabase (skip if not configured)
    let saved = null
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      saved = await saveReport({
        fileName:    req.file.originalname,
        biomarkers:  extracted.biomarkers,
        reportDate:  extracted.reportDate,
        labName:     extracted.labName,
        summary:     extracted.summary,
      })
    }

    res.json({
      success:    true,
      fileName:   req.file.originalname,
      reportId:   saved?.id ?? null,
      biomarkers: extracted.biomarkers,
      reportDate: extracted.reportDate,
      labName:    extracted.labName,
      summary:    extracted.summary,
      count:      extracted.biomarkers.length,
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: err.message || 'Processing failed' })
  }
})

export default router
