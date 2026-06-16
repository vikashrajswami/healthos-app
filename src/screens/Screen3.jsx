import { useState, useRef } from 'react'

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp'

const STATUS_COLOR = {
  HIGH:       '#dc2626',
  LOW:        '#2563eb',
  BORDERLINE: '#d97706',
  NORMAL:     '#16a34a',
}

function fileIcon(name = '') {
  return name.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'
}

export default function Screen3() {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploads,  setUploads]  = useState([
    { id: 1, name: 'CBC_Lipid_Mar2026.pdf',  status: 'done',    info: '22 biomarkers extracted', biomarkers: null },
    { id: 2, name: 'Thyroid_Panel.jpg',       status: 'pending', info: 'Processing…',             biomarkers: null },
  ])
  const [expanded, setExpanded] = useState(null)

  async function processFile(file) {
    const id = Date.now()
    setUploads(prev => [{ id, name: file.name, status: 'processing', info: 'Uploading…', biomarkers: null }, ...prev])

    try {
      const form = new FormData()
      form.append('file', file)

      setUploads(prev => prev.map(u => u.id === id ? { ...u, info: 'Reading with AI…' } : u))

      const res  = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setUploads(prev => prev.map(u => u.id === id
        ? { ...u, status: 'done', info: `${data.count} biomarkers extracted`, biomarkers: data.biomarkers, summary: data.summary }
        : u
      ))
      setExpanded(id)
    } catch (err) {
      // If no backend configured, fall back to demo mode
      const count = Math.floor(Math.random() * 14) + 8
      setUploads(prev => prev.map(u => u.id === id
        ? { ...u, status: 'demo', info: `${count} biomarkers (demo mode — add API key to activate AI)`, biomarkers: null }
        : u
      ))
    }
  }

  function onFileChange(e) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function statusPill(status) {
    if (status === 'done')       return <span className="tag-pill done">Done</span>
    if (status === 'demo')       return <span className="tag-pill pending">Demo</span>
    if (status === 'pending')    return <span className="tag-pill pending">Pending</span>
    if (status === 'processing') return <span className="tag-pill processing">Reading…</span>
    return null
  }

  return (
    <div className="screen">
      <div className="status-bar"><span>9:41</span><span>●●●● 100%</span></div>
      <button className="nav-back">← Add Your Lab Report</button>

      <p className="desc">
        Upload a report from any diagnostic center — PDF or photo — and our AI extracts your biomarkers in seconds.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      <div
        className={`dropzone ${dragging ? 'dropzone-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <span className="ic">⬆</span>
        <div className="t1">{dragging ? 'Drop it here!' : 'Upload PDF or Photo'}</div>
        <div className="t2">Blood test · Lipid panel · CBC · Thyroid · HbA1c & more</div>
        <button onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>
          Choose File
        </button>
      </div>

      {uploads.length > 0 && (
        <>
          <div className="card-title">Recent Uploads</div>
          {uploads.map(u => (
            <div key={u.id}>
              <div
                className="upload-item"
                style={{ cursor: u.biomarkers ? 'pointer' : 'default' }}
                onClick={() => u.biomarkers && setExpanded(expanded === u.id ? null : u.id)}
              >
                <div className="ic2">
                  {u.status === 'done' ? '✅' : u.status === 'processing' ? '⏳' : fileIcon(u.name)}
                </div>
                <div className="meta">
                  <div className="t">{fileIcon(u.name)} {u.name}</div>
                  <div className="s">{u.info}</div>
                  {u.summary && <div className="s" style={{ marginTop: 3, color: '#5a6478' }}>{u.summary}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {statusPill(u.status)}
                  {u.biomarkers && (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{expanded === u.id ? '▲' : '▼'}</span>
                  )}
                </div>
              </div>

              {/* Expanded biomarker table */}
              {expanded === u.id && u.biomarkers && (
                <div className="bio-table">
                  {u.biomarkers.map(b => (
                    <div key={b.key || b.name} className="bio-row-r">
                      <div className="bio-name-r">{b.name}</div>
                      <div className="bio-val-r">
                        {b.value} <span className="bio-unit">{b.unit}</span>
                      </div>
                      <div
                        className="bio-status-r"
                        style={{ color: STATUS_COLOR[b.status] || '#94a3b8' }}
                      >
                        {b.status}
                      </div>
                      <div className="bio-range-r">{b.normalRange}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <div className="notice">
        🔬 <b>Lab at your doorstep — coming soon.</b> Book a home sample collection or walk into any nearby lab, skip the queue, and get results delivered straight to HealthOS.
      </div>
    </div>
  )
}
