import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './styles/global.css'
import Screen1 from './screens/Screen1'
import Screen2 from './screens/Screen2'
import Screen3 from './screens/Screen3'
import Screen4 from './screens/Screen4'
import Screen5 from './screens/Screen5'
import Screen6 from './screens/Screen6'
import Screen7 from './screens/Screen7'
import Screen8 from './screens/Screen8'
import Screen9 from './screens/Screen9'
import JoinScreen from './screens/JoinScreen'
import SmartPanelReport from './screens/SmartPanelReport'
import LabDoorstepScreen from './screens/LabDoorstepScreen'
import HealthVaultScreen from './screens/HealthVaultScreen'
import SignupDesignsPreview from './screens/SignupDesignsPreview'
import SignupDesignsPreview2 from './screens/SignupDesignsPreview2'
import SignupDesignsPreview3 from './screens/SignupDesignsPreview3'
import SignupScreen from './screens/SignupScreen'
import TermsScreen from './screens/TermsScreen'
import PaymentScreen from './screens/PaymentScreen'

const THEMES = [
  { id: 'teal',  label: '1 · Clinical Trust', dot: '#14b8a6' },
  { id: 'gold',  label: '2 · Performance Gold', dot: '#e0b341' },
  { id: 'amber', label: '3 · Calm Wellness', dot: '#e08c3b' },
]

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ICONS = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...S}>
      <path d="M3 11L12 3l9 8v10h-5v-6h-8v6H3z" />
    </svg>
  ),
  trends: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...S}>
      <polyline points="3,18 9,11 13,15 21,6" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  ),
  reports: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...S}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
  devices: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...S}>
      <rect x="7" y="7" width="10" height="10" rx="2.5" />
      <path d="M9 7V5h6v2" />
      <path d="M9 17v2h6v-2" />
      <polyline points="11.5,11 11.5,12.5 13,12.5" />
    </svg>
  ),
  protocol: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...S}>
      <polyline points="2,12 6,12 8,6 11,18 14,9 16,14 18,12 22,12" />
    </svg>
  ),
}

const NAV = [
  { path: '/',         icon: ICONS.home,     label: 'Home' },
  { path: '/trends',   icon: ICONS.trends,   label: 'Trends' },
  { path: '/upload',   icon: ICONS.reports,  label: 'Reports' },
  { path: '/devices',  icon: ICONS.devices,  label: 'Devices' },
  { path: '/protocol', icon: ICONS.protocol, label: 'Protocol' },
]

function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <nav className="bottom-nav">
      {NAV.map(n => (
        <button key={n.path} className={`nav-item ${pathname === n.path ? 'active' : ''}`}
          onClick={() => navigate(n.path)}>
          <span className="ni">{n.icon}</span>{n.label}
        </button>
      ))}
    </nav>
  )
}

function MedicalDisclaimer() {
  const { pathname } = useLocation()
  const fullPage = ['/smart-panel', '/lab-doorstep', '/vault', '/signup-preview', '/signup-preview-2', '/signup-preview-3', '/signup', '/terms', '/payment'].includes(pathname)
  if (fullPage) return null
  return (
    <div className="global-disclaimer">
      ⚕️ HealthOS is for health education only · Not a substitute for medical advice · Consult your doctor for diagnosis or treatment
    </div>
  )
}

function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div className="theme-switcher">
      {THEMES.map(t => (
        <button key={t.id}
          className={`theme-pill ${theme === t.id ? 'selected' : ''}`}
          onClick={() => setTheme(t.id)}>
          <span className="dot" style={{ background: t.dot }} />
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState('teal')
  return (
    <BrowserRouter>
      <div data-theme={theme} className="app-shell">
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
        <MedicalDisclaimer />
        <div style={{ paddingTop: 40 }}>
          <Routes>
            <Route path="/"          element={<Screen1 />} />
            <Route path="/trends"    element={<Screen2 />} />
            <Route path="/upload"    element={<Screen3 />} />
            <Route path="/devices"   element={<Screen4 />} />
            <Route path="/protocol"  element={<Screen5 />} />
            <Route path="/diet"      element={<Screen6 />} />
            <Route path="/progress"  element={<Screen7 />} />
            <Route path="/share"     element={<Screen8 />} />
            <Route path="/subscribe" element={<Screen9 />} />
            <Route path="/join/:code" element={<JoinScreen />} />
            <Route path="/smart-panel" element={<SmartPanelReport />} />
            <Route path="/lab-doorstep" element={<LabDoorstepScreen />} />
            <Route path="/vault" element={<HealthVaultScreen />} />
            <Route path="/signup-preview" element={<SignupDesignsPreview />} />
            <Route path="/signup-preview-2" element={<SignupDesignsPreview2 />} />
            <Route path="/signup-preview-3" element={<SignupDesignsPreview3 />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/terms" element={<TermsScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
