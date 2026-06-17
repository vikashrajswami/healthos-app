import { useState } from 'react'

const BIOAGE = 34
const REAL_AGE = 41
const GAP = REAL_AGE - BIOAGE

/* ── Canvas card 1080×1920 ── */
function drawTransformCard(canvas) {
  const W = 1080, H = 1920
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0f3a3a')
  bg.addColorStop(0.55, '#091e1e')
  bg.addColorStop(1, '#040d0d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const gl = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, 640)
  gl.addColorStop(0, 'rgba(20,184,166,0.26)')
  gl.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gl
  ctx.fillRect(0, 0, W, H)

  const cx = W / 2

  ctx.fillStyle = '#9fd9cf'
  ctx.font = '700 58px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('HEALTHOS', cx, 196)

  ctx.fillStyle = 'rgba(159,217,207,0.55)'
  ctx.font = '400 38px Arial'
  ctx.fillText('Biological Age Transformation', cx, 265)

  const ry = H * 0.40, rr = 300
  ctx.beginPath()
  ctx.arc(cx, ry, rr, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(20,184,166,0.13)'
  ctx.lineWidth = 5
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, ry, rr, -Math.PI / 2, Math.PI * 1.35)
  const ag = ctx.createLinearGradient(cx - rr, ry, cx + rr, ry)
  ag.addColorStop(0, '#0d9488')
  ag.addColorStop(1, '#5eead4')
  ctx.strokeStyle = ag
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 268px Arial'
  ctx.fillText(String(BIOAGE), cx, ry + 92)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '600 42px Arial'
  ctx.fillText('MY BIOLOGICAL AGE', cx, ry + 178)

  ctx.fillStyle = 'rgba(255,255,255,0.30)'
  ctx.font = '38px Arial'
  ctx.fillText(`Actual age: ${REAL_AGE}`, cx, ry + 238)

  ctx.fillStyle = '#14b8a6'
  ctx.font = '800 80px Arial'
  ctx.fillText(`${GAP} YEARS YOUNGER`, cx, H * 0.593)

  ctx.strokeStyle = 'rgba(255,255,255,0.09)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(W * 0.10, H * 0.635)
  ctx.lineTo(W * 0.90, H * 0.635)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.font = '600 30px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('BIOMARKER', W * 0.10, H * 0.658)
  ctx.textAlign = 'center'
  ctx.fillText('BEFORE', W * 0.56, H * 0.658)
  ctx.textAlign = 'center'
  ctx.fillText('NOW', W * 0.84, H * 0.658)

  const rows = [
    ['Inflammation (hsCRP)', '3.1 HIGH', '1.2 ✓'],
    ['Blood Sugar (HbA1c)', '5.9% pre', '5.3% ✓'],
    ['Diet Adherence', '—', '94% ✓'],
    ['Sleep Quality', '62%', '82% ✓'],
  ]
  let sy = H * 0.678
  rows.forEach(([label, from, to]) => {
    ctx.font = '400 34px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.48)'
    ctx.textAlign = 'left'
    ctx.fillText(label, W * 0.10, sy)
    ctx.fillStyle = '#f87171'
    ctx.textAlign = 'center'
    ctx.fillText(from, W * 0.57, sy)
    ctx.fillStyle = '#5eead4'
    ctx.textAlign = 'center'
    ctx.fillText(to, W * 0.85, sy)
    sy += 76
  })

  const bx = W * 0.13, by = H * 0.842, bw = W * 0.74, bh = 100, br = 50
  ctx.beginPath()
  ctx.moveTo(bx + br, by)
  ctx.lineTo(bx + bw - br, by)
  ctx.arcTo(bx + bw, by, bx + bw, by + br, br)
  ctx.lineTo(bx + bw, by + bh - br)
  ctx.arcTo(bx + bw, by + bh, bx + bw - br, by + bh, br)
  ctx.lineTo(bx + br, by + bh)
  ctx.arcTo(bx, by + bh, bx, by + bh - br, br)
  ctx.lineTo(bx, by + br)
  ctx.arcTo(bx, by, bx + br, by, br)
  ctx.closePath()
  ctx.fillStyle = 'rgba(252,211,77,0.12)'
  ctx.fill()

  ctx.fillStyle = '#fcd34d'
  ctx.font = '700 42px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('🔥  Top 15% for my age group', cx, H * 0.842 + 66)

  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.font = '400 36px Arial'
  ctx.fillText('Start your reversal →  arogyos.app', cx, H * 0.932)
}

/* ── Build blob URL ── */
function buildBlobUrl() {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    drawTransformCard(canvas)
    canvas.toBlob(blob => {
      resolve({ blob, url: URL.createObjectURL(blob) })
    }, 'image/png')
  })
}

/* ── WhatsApp ── */
function openWhatsApp() {
  const text = encodeURIComponent(
    `🧬 *My AROGYOS Transformation*\n\n` +
    `Biological Age: *${BIOAGE} yrs* ✅  (actual: ${REAL_AGE})\n` +
    `Result: *${GAP} YEARS YOUNGER* 🔥\n\n` +
    `📊 *Before → Now:*\n` +
    `• Inflammation (hsCRP): 3.1 HIGH → 1.2 ✓\n` +
    `• Blood Sugar (HbA1c): 5.9% → 5.3% ✓\n` +
    `• Sleep Quality: 62% → 82% ✓\n` +
    `• Diet Adherence: — → 94% ✓\n\n` +
    `🌱 Personalised anti-inflammatory diet\n` +
    `💪 Strength + Zone 2 cardio protocol\n\n` +
    `Start your age reversal 👉 *arogyos.app*`
  )
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

/* ── Modal overlay ── */
function ShareModal({ imgUrl, blob, onClose }) {
  function saveImage() {
    const a = document.createElement('a')
    a.download = 'arogyos-transformation.png'
    a.href = imgUrl
    a.click()
  }

  async function tryNativeShare() {
    if (!blob) return
    const file = new File([blob], 'arogyos-transformation.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My AROGYOS Transformation' })
        onClose()
        return
      } catch (e) { /* fall through */ }
    }
    saveImage()
  }

  return (
    <div className="sm-overlay" onClick={onClose}>
      <div className="sm-box" onClick={e => e.stopPropagation()}>
        <div className="sm-topbar">
          <span className="sm-heading">Your Transformation Card</span>
          <button className="sm-close" onClick={onClose}>✕</button>
        </div>

        <img src={imgUrl} className="sm-preview" alt="Transformation card" />

        <div className="sm-steps">
          <div className="sm-step"><span className="sm-num">1</span>Save image to your phone</div>
          <div className="sm-step"><span className="sm-num">2</span>Open Instagram → tap <b>+</b> → <b>Story</b> → pick saved image</div>
          <div className="sm-step"><span className="sm-num">3</span>Add stickers, tag friends & post 🔥</div>
        </div>

        <button className="sm-save-btn" onClick={saveImage}>↓ Save Image</button>

        <button className="sm-share-native" onClick={tryNativeShare}>
          Share via phone (iOS / Android)
        </button>

        <a href="instagram://" className="sm-open-ig">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/>
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
          </svg>
          Open Instagram App →
        </a>
      </div>
    </div>
  )
}

/* ── Screen ── */
export default function Screen8() {
  const [loading, setLoading] = useState(false)
  const [modal, setModal]   = useState(null)   // { imgUrl, blob }

  async function handleInstagram() {
    setLoading(true)
    const { blob, url } = await buildBlobUrl()
    setLoading(false)

    // On mobile browsers the OS share sheet includes Instagram
    const file = new File([blob], 'arogyos-transformation.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My AROGYOS Transformation' })
        return
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }

    // Desktop / fallback → show modal with card preview + steps
    setModal({ imgUrl: url, blob })
  }

  return (
    <div className="screen">
      <button className="nav-back">← Share Your Transformation</button>

      <div className="share-hero">
        <div className="brand">HEALTHOS</div>
        <div className="lbl">My Biological Age</div>
        <div className="num">{BIOAGE}</div>
        <div className="sub">vs actual age {REAL_AGE} · {GAP} years younger</div>
        <div className="share-metrics">
          {[['hsCRP','3.1→1.2'],['HbA1c','5.9→5.3%'],['Sleep','62→82%']].map(([k,v]) => (
            <div key={k} className="share-metric-pill">
              <span className="smk">{k}</span>
              <span className="smv">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="share-rank">🔥 Top 15% for my age group</div>
      <div className="share-cta">arogyos.app</div>

      <div className="card-title">Share to</div>

      {/* Instagram */}
      <button className="platform-btn ig-btn" onClick={handleInstagram} disabled={loading}>
        <span className="pb-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="#fff" strokeWidth="1.8"/>
            <circle cx="12" cy="12" r="4.5" stroke="#fff" strokeWidth="1.8"/>
            <circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/>
          </svg>
        </span>
        <span className="pb-text">
          <span className="pb-title">{loading ? 'Generating card…' : 'Instagram Story / Post'}</span>
          <span className="pb-sub">Beautiful 1080×1920 transformation card</span>
        </span>
        <span className="pb-arr">›</span>
      </button>

      {/* WhatsApp */}
      <button className="platform-btn wa-btn" onClick={openWhatsApp}>
        <span className="pb-icon">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#25d366"/>
            <path d="M23 9.1A9.8 9.8 0 0 0 16.1 6C10.6 6 6.1 10.5 6.1 16a9.8 9.8 0 0 0 1.3 4.9L6 26l5.2-1.4A9.9 9.9 0 0 0 16 26c5.5 0 10-4.5 10-10a9.9 9.9 0 0 0-3-6.9z" fill="#25d366"/>
            <path d="M22.9 19.7c-.3-.1-1.7-.8-1.9-1-.2-.1-.4-.1-.6.1-.2.3-.7 1-.8 1.1-.2.2-.3.2-.5.1-.3-.1-1.2-.5-2.2-1.4-.8-.7-1.4-1.7-1.5-1.9-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.5-.8-2.1-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1 2.7c.1.2 1.8 2.8 4.4 3.8 2.5 1 2.5.7 2.9.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.5-.3z" fill="#fff"/>
          </svg>
        </span>
        <span className="pb-text">
          <span className="pb-title">WhatsApp Status or Chat</span>
          <span className="pb-sub">Send to a friend · or post to your Status</span>
        </span>
        <span className="pb-arr">›</span>
      </button>

      <button className="save-btn" onClick={async () => {
        const { url } = await buildBlobUrl()
        const a = document.createElement('a')
        a.download = 'arogyos-transformation.png'
        a.href = url
        a.click()
      }}>
        ↓ Save Transformation Image
      </button>

      {modal && (
        <ShareModal
          imgUrl={modal.imgUrl}
          blob={modal.blob}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
