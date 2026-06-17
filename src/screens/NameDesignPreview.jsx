import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

// ── 8 logo + name design variants ─────────────────────────────────────────────

function V1() {
  // Bold teal "OS" accent — AROGYO in dark, S in brand teal
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <Logo size={34}/>
      <span style={{ fontSize:17, fontWeight:800, letterSpacing:-0.4, color:'#0f172a', lineHeight:1 }}>
        AROGYO<span style={{ color:'#14b8a6' }}>S</span>
      </span>
    </div>
  )
}

function V2() {
  // Full gradient text — teal-to-emerald sweep across the word
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <Logo size={34}/>
      <span style={{
        fontSize:17, fontWeight:900, letterSpacing:-0.3, lineHeight:1,
        background:'linear-gradient(90deg,#14b8a6,#059669)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
      }}>
        AROGYOS
      </span>
    </div>
  )
}

function V3() {
  // Stacked: name bold on top, tagline tiny below
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <Logo size={34}/>
      <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
        <span style={{ fontSize:15, fontWeight:800, color:'#0f172a', letterSpacing:0.5, lineHeight:1 }}>AROGYOS</span>
        <span style={{ fontSize:9, fontWeight:500, color:'#14b8a6', letterSpacing:1.2, lineHeight:1, textTransform:'uppercase' }}>Your Biological Age</span>
      </div>
    </div>
  )
}

function V4() {
  // Split weight: "AROGY" light + "OS" heavy
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <Logo size={34}/>
      <span style={{ fontSize:17, letterSpacing:-0.2, lineHeight:1, color:'#0f172a' }}>
        <span style={{ fontWeight:300 }}>AROGY</span><span style={{ fontWeight:900 }}>OS</span>
      </span>
    </div>
  )
}

function V5() {
  // Dot divider · pill badge style for "OS"
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <Logo size={34}/>
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <span style={{ fontSize:16, fontWeight:700, color:'#0f172a', letterSpacing:0.3 }}>AROGYO</span>
        <span style={{
          fontSize:11, fontWeight:800, color:'white', letterSpacing:0.5,
          background:'linear-gradient(135deg,#14b8a6,#059669)',
          borderRadius:6, padding:'2px 7px', lineHeight:'18px',
        }}>OS</span>
      </div>
    </div>
  )
}

function V6() {
  // Spaced capitals with teal underline accent bar
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <Logo size={34}/>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:3 }}>
        <span style={{ fontSize:14, fontWeight:800, color:'#0f172a', letterSpacing:3, lineHeight:1 }}>AROGYOS</span>
        <div style={{ width:'100%', height:2, background:'linear-gradient(90deg,#14b8a6,#059669)', borderRadius:2 }}/>
      </div>
    </div>
  )
}

function V7() {
  // Thin separator line between logo and name
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <Logo size={34}/>
      <div style={{ width:1.5, height:28, background:'linear-gradient(to bottom,transparent,#14b8a6,transparent)', borderRadius:2 }}/>
      <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
        <span style={{ fontSize:16, fontWeight:900, color:'#0f172a', letterSpacing:-0.5, lineHeight:1 }}>AROGYOS</span>
        <span style={{ fontSize:8.5, fontWeight:500, color:'#94a3b8', letterSpacing:1.5, lineHeight:1 }}>HEALTH · INTELLIGENCE</span>
      </div>
    </div>
  )
}

function V8() {
  // Full pill/capsule: logo + name inside one rounded container
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      background:'linear-gradient(135deg,#f0fdfa,#ecfdf5)',
      border:'1.5px solid #99f6e4',
      borderRadius:40, padding:'5px 14px 5px 6px',
    }}>
      <Logo size={28}/>
      <span style={{ fontSize:14, fontWeight:800, color:'#0f172a', letterSpacing:0.2 }}>AROGYOS</span>
    </div>
  )
}

const VARIANTS = [
  { id:1, Comp:V1, name:'Teal "S" Accent',       desc:'AROGYO in dark, the S in brand teal — subtle, clean, memorable' },
  { id:2, Comp:V2, name:'Gradient Name',          desc:'Full teal→green gradient sweep across the word — vibrant, modern' },
  { id:3, Comp:V3, name:'Stacked + Tagline',      desc:'Name bold on top, "Your Biological Age" in tiny teal below' },
  { id:4, Comp:V4, name:'Split Weight',           desc:'"AROGY" light weight, "OS" heavy black — typographic contrast' },
  { id:5, Comp:V5, name:'"OS" Badge Pill',        desc:'"AROGYO" plain + "OS" in a teal-green pill badge — tech feel' },
  { id:6, Comp:V6, name:'Spaced Caps + Underline',desc:'Wide letter-spacing + teal gradient underline bar — editorial' },
  { id:7, Comp:V7, name:'Divider + Sub-label',    desc:'Thin teal line separator + "HEALTH · INTELLIGENCE" micro-text' },
  { id:8, Comp:V8, name:'Capsule Wrap',           desc:'Logo + name inside one teal-tinted pill container — premium app feel' },
]

export default function NameDesignPreview() {
  const nav = useNavigate()

  return (
    <div style={{
      minHeight:'100vh', background:'#f8fafc',
      fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      paddingBottom:40,
    }}>
      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg,#0f172a,#1e293b)',
        padding:'20px 16px 18px', color:'white',
      }}>
        <button onClick={() => nav(-1)} style={{
          background:'rgba(255,255,255,0.12)', border:'none', color:'white',
          borderRadius:10, padding:'7px 14px', cursor:'pointer', fontSize:13,
          fontWeight:600, marginBottom:14,
        }}>← Back</button>
        <div style={{ fontSize:20, fontWeight:800, letterSpacing:-0.3 }}>Brand Name Designs</div>
        <div style={{ fontSize:12, color:'#94a3b8', marginTop:3 }}>
          8 ways to display AROGYOS next to the logo
        </div>
      </div>

      {/* Live preview strip — shows exactly how it looks in the top bar */}
      <div style={{ padding:'16px 16px 0' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1, marginBottom:8 }}>
          HOW IT LOOKS IN THE APP TOP BAR
        </div>

        {VARIANTS.map(({ id, Comp, name, desc }) => (
          <div key={id} style={{
            background:'white', borderRadius:14, marginBottom:12,
            overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.07)',
          }}>
            {/* Simulated top bar */}
            <div style={{
              background:'rgba(255,255,255,0.96)',
              borderBottom:'1px solid rgba(0,0,0,0.07)',
              padding:'10px 16px',
              display:'flex', alignItems:'center',
            }}>
              <Comp/>
              {/* Spacer then dummy theme dots + gear to simulate full bar */}
              <div style={{ flex:1 }}/>
              <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                {['#14b8a6','#e0b341','#e08c3b'].map(c => (
                  <div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }}/>
                ))}
                <div style={{
                  width:18, height:18, marginLeft:6, borderRadius:4,
                  background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Card info */}
            <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{
                background:'linear-gradient(135deg,#14b8a6,#059669)',
                color:'white', borderRadius:7, padding:'3px 9px',
                fontSize:11, fontWeight:800, flexShrink:0,
              }}>#{id}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{name}</div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>{desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{
        margin:'8px 16px 0',
        background:'linear-gradient(135deg,#14b8a6,#059669)',
        borderRadius:14, padding:'16px 18px', color:'white',
      }}>
        <div style={{ fontSize:14, fontWeight:700 }}>Tell me the number (#1–#8)</div>
        <div style={{ fontSize:12, opacity:0.85, marginTop:3 }}>
          I'll apply that design to the app's top bar and redeploy instantly.
        </div>
      </div>
    </div>
  )
}
