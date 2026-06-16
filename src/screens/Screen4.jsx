import { useState } from 'react'

const DEVICE_TYPES = [
  {
    icon: '💍',
    name: 'Smart Ring',
    sub: 'Sleep, HRV, readiness & recovery from any ring device',
  },
  {
    icon: '⌚',
    name: 'Smartwatch',
    sub: 'Activity, heart rate, ECG & workout tracking from any watch',
  },
  {
    icon: '📿',
    name: 'Fitness Band / Wristband',
    sub: 'Steps, calories, sleep & heart rate from any wristband',
  },
  {
    icon: '📱',
    name: 'Phone Sensors',
    sub: 'Steps & activity from your phone — no extra device needed',
  },
]

const PLATFORMS = [
  {
    icon: '🍎',
    name: 'Apple Health',
    sub: 'iPhone: syncs all compatible devices automatically',
  },
  {
    icon: '🤖',
    name: 'Google Fit / Health Connect',
    sub: 'Android: one connection covers all your devices',
  },
]

export default function Screen4() {
  const [connected, setConnected] = useState({ 'Apple Health': true })

  const toggle = (name) =>
    setConnected(prev => ({ ...prev, [name]: !prev[name] }))

  return (
    <div className="screen">
      <div className="status-bar"><span>9:41</span><span>●●●● 100%</span></div>
      <button className="nav-back">← Connect Your Devices</button>

      <p className="desc">
        HealthOS reads from your phone's health hub — connect once and all compatible devices sync automatically. Works with <b>any</b> ring, watch, or wristband.
      </p>

      <div className="card-title">Connect by Device Type</div>
      {DEVICE_TYPES.map(d => (
        <div key={d.name} className="dev-item">
          <div className="ic2">{d.icon}</div>
          <div className="meta">
            <div className="t">{d.name}</div>
            <div className="s">{d.sub}</div>
          </div>
          <button
            className={`conn-pill ${connected[d.name] ? 'connected' : 'connect'}`}
            onClick={() => toggle(d.name)}
          >
            {connected[d.name] ? 'Connected' : 'Connect'}
          </button>
        </div>
      ))}

      <div className="card-title" style={{ marginTop: 4 }}>Connect via Health Platform</div>
      {PLATFORMS.map(p => (
        <div key={p.name} className="dev-item">
          <div className="ic2">{p.icon}</div>
          <div className="meta">
            <div className="t">{p.name}</div>
            <div className="s">{p.sub}</div>
          </div>
          <button
            className={`conn-pill ${connected[p.name] ? 'connected' : 'connect'}`}
            onClick={() => toggle(p.name)}
          >
            {connected[p.name] ? 'Connected' : 'Connect'}
          </button>
        </div>
      ))}

      <div className="world-note">
        ✓ Works with any device that syncs to Apple Health or Google Fit / Health Connect — no brand restrictions
      </div>
      <div className="world-note">
        ✓ Your data stays private — we only read what you explicitly allow
      </div>
    </div>
  )
}
