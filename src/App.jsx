import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './styles/global.css'
import Logo from './components/Logo'
import { LangProvider, useT } from './lib/i18n'
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
import SettingsScreen from './screens/SettingsScreen'

const THEMES = [
  { id: 'teal',  label: '1', dot: '#14b8a6' },
  { id: 'gold',  label: '2', dot: '#e0b341' },
  { id: 'amber', label: '3', dot: '#e08c3b' },
]

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ICONS = {
  home:     <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M3 11L12 3l9 8v10h-5v-6h-8v6H3z"/></svg>,
  trends:   <svg width="22" height="22" viewBox="0 0 24 24" {...S}><polyline points="3,18 9,11 13,15 21,6"/><line x1="3" y1="21" x2="21" y2="21"/></svg>,
  reports:  <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
  devices:  <svg width="22" height="22" viewBox="0 0 24 24" {...S}><rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M9 7V5h6v2"/><path d="M9 17v2h6v-2"/><polyline points="11.5,11 11.5,12.5 13,12.5"/></svg>,
  protocol: <svg width="22" height="22" viewBox="0 0 24 24" {...S}><polyline points="2,12 6,12 8,6 11,18 14,9 16,14 18,12 22,12"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

const MAIN_PATHS = ['/', '/trends', '/upload', '/devices', '/protocol']

// Screens that manage their own full-page header — suppress global TopBar
const NO_TOPBAR = new Set([
  '/signup', '/signup-preview', '/signup-preview-2', '/signup-preview-3',
  '/smart-panel', '/lab-doorstep', '/vault', '/terms', '/payment', '/settings',
])

// Screens that should also hide the bottom nav
const NO_BOTTOMNAV = new Set([
  '/signup', '/signup-preview', '/signup-preview-2', '/signup-preview-3',
  '/smart-panel', '/lab-doorstep',
])

const STANDALONE = [] // kept for legacy compat

const NAV = [
  { path: '/',         icon: ICONS.home,     labelKey: 'home' },
  { path: '/trends',   icon: ICONS.trends,   labelKey: 'trends' },
  { path: '/upload',   icon: ICONS.reports,  labelKey: 'reports' },
  { path: '/devices',  icon: ICONS.devices,  labelKey: 'devices' },
  { path: '/protocol', icon: ICONS.protocol, labelKey: 'protocol' },
]

// ── Global top bar: logo + back arrow + theme dots + settings ─────────────────
function TopBar({ theme, setTheme }) {
  const nav        = useNavigate()
  const { pathname } = useLocation()
  const t          = useT()

  if (NO_TOPBAR.has(pathname)) return null

  const isMain = MAIN_PATHS.includes(pathname)

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      minHeight: 52,
    }}>
      {/* Left: back arrow or logo */}
      {isMain ? (
        <Logo size={32}/>
      ) : (
        <button onClick={() => nav(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#0f172a', fontWeight: 700, fontSize: 14, padding: '6px 10px 6px 4px',
          borderRadius: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {t('back')}
        </button>
      )}

      {/* Center: app name on main, logo on sub */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: isMain ? 'center' : 'center' }}>
        {isMain ? (
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: -0.3 }}>HealthOS</span>
        ) : (
          <Logo size={28}/>
        )}
      </div>

      {/* Right: theme dots + settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {THEMES.map(th => (
            <button key={th.id} onClick={() => setTheme(th.id)} style={{
              width: 18, height: 18, borderRadius: '50%', background: th.dot,
              border: theme === th.id ? '2.5px solid #0f172a' : '2.5px solid transparent',
              cursor: 'pointer', padding: 0, outline: 'none',
              transform: theme === th.id ? 'scale(1.2)' : 'scale(1)',
              transition: 'all .15s',
            }}/>
          ))}
        </div>
        <button onClick={() => nav('/settings')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#64748b', display: 'flex', alignItems: 'center',
          padding: 6, borderRadius: 10,
        }}>
          {ICONS.settings}
        </button>
      </div>
    </div>
  )
}

function BottomNav() {
  const navigate   = useNavigate()
  const { pathname } = useLocation()
  const t          = useT()
  if (NO_BOTTOMNAV.has(pathname)) return null
  return (
    <nav className="bottom-nav">
      {NAV.map(n => (
        <button key={n.path} className={`nav-item ${pathname === n.path ? 'active' : ''}`}
          onClick={() => navigate(n.path)}>
          <span className="ni">{n.icon}</span>
          {t(n.labelKey)}
        </button>
      ))}
    </nav>
  )
}

function MedicalDisclaimer() {
  const { pathname } = useLocation()
  const noDisclaimer = NO_TOPBAR.has(pathname)
  if (noDisclaimer) return null
  return (
    <div className="global-disclaimer">
      ⚕️ HealthOS is for health education only · Not a substitute for medical advice · Consult your doctor
    </div>
  )
}

function AppShell({ theme, setTheme }) {
  return (
    <div data-theme={theme} className="app-shell">
      <TopBar theme={theme} setTheme={setTheme}/>
      <MedicalDisclaimer/>
      <div style={{ paddingBottom: 70 }}>
        <Routes>
          <Route path="/"               element={<Screen1 />} />
          <Route path="/trends"         element={<Screen2 />} />
          <Route path="/upload"         element={<Screen3 />} />
          <Route path="/devices"        element={<Screen4 />} />
          <Route path="/protocol"       element={<Screen5 />} />
          <Route path="/diet"           element={<Screen6 />} />
          <Route path="/progress"       element={<Screen7 />} />
          <Route path="/share"          element={<Screen8 />} />
          <Route path="/subscribe"      element={<Screen9 />} />
          <Route path="/join/:code"     element={<JoinScreen />} />
          <Route path="/smart-panel"    element={<SmartPanelReport />} />
          <Route path="/lab-doorstep"   element={<LabDoorstepScreen />} />
          <Route path="/vault"          element={<HealthVaultScreen />} />
          <Route path="/signup-preview"   element={<SignupDesignsPreview />} />
          <Route path="/signup-preview-2" element={<SignupDesignsPreview2 />} />
          <Route path="/signup-preview-3" element={<SignupDesignsPreview3 />} />
          <Route path="/signup"         element={<SignupScreen />} />
          <Route path="/terms"          element={<TermsScreen />} />
          <Route path="/payment"        element={<PaymentScreen />} />
          <Route path="/settings"       element={<SettingsScreen />} />
        </Routes>
      </div>
      <BottomNav/>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('healthos_theme') || 'teal')
  function setAndSaveTheme(t) { setTheme(t); localStorage.setItem('healthos_theme', t) }
  return (
    <LangProvider>
      <BrowserRouter>
        <AppShell theme={theme} setTheme={setAndSaveTheme}/>
      </BrowserRouter>
    </LangProvider>
  )
}
