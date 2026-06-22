import { useState, lazy, Suspense, useEffect, Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import './styles/global.css'
import Logo from './components/Logo'
import { LangProvider, useT } from './lib/i18n'
import { isPlusMember, syncSubscriptionStatus } from './lib/planStatus'
import RatingPrompt from './components/RatingPrompt'
import { recordAppOpen, daysSinceFirstOpen, hasRatingPromptBeenShown } from './lib/insights'
import { registerDailySync } from './lib/notifications'
import { pushToCloud } from './lib/sync'
import { migrateReports } from './lib/reportStore'

// Critical screens — eager loaded (shown on first paint)
import Screen1 from './screens/Screen1'
import SignupScreen from './screens/SignupScreen'

// Test helper — clear all data and go to root (signup)
function ResetAndSignup() {
  Object.keys(localStorage).filter(k => k.startsWith('healthos_')).forEach(k => localStorage.removeItem(k))
  window.location.replace('/')
  return null
}

// Secondary screens — lazy loaded (loaded on first navigation)
const Screen2    = lazy(() => import('./screens/Screen2'))
const Screen3    = lazy(() => import('./screens/Screen3'))
const Screen4    = lazy(() => import('./screens/Screen4'))
const Screen5    = lazy(() => import('./screens/Screen5'))
const Screen6    = lazy(() => import('./screens/Screen6'))
const Screen7    = lazy(() => import('./screens/Screen7'))
const Screen8    = lazy(() => import('./screens/Screen8'))
const Screen9    = lazy(() => import('./screens/Screen9'))
const JoinScreen = lazy(() => import('./screens/JoinScreen'))
const SmartPanelReport    = lazy(() => import('./screens/SmartPanelReport'))
const LabDoorstepScreen   = lazy(() => import('./screens/LabDoorstepScreen'))
const HealthVaultScreen   = lazy(() => import('./screens/HealthVaultScreen'))
const SignupDesignsPreview   = lazy(() => import('./screens/SignupDesignsPreview'))
const SignupDesignsPreview2  = lazy(() => import('./screens/SignupDesignsPreview2'))
const SignupDesignsPreview3  = lazy(() => import('./screens/SignupDesignsPreview3'))
const DesktopDesignPreview   = lazy(() => import('./screens/DesktopDesignPreview'))
const SignupDesktopPreview   = lazy(() => import('./screens/SignupDesktopPreview'))
const TermsScreen          = lazy(() => import('./screens/TermsScreen'))
const PaymentScreen        = lazy(() => import('./screens/PaymentScreen'))
const SettingsScreen       = lazy(() => import('./screens/SettingsScreen'))
const LogoPreviewScreen    = lazy(() => import('./screens/LogoPreviewScreen'))
const NameDesignPreview    = lazy(() => import('./screens/NameDesignPreview'))
const PrivacyScreen        = lazy(() => import('./screens/PrivacyScreen'))
const DailyHubScreen       = lazy(() => import('./screens/DailyHubScreen'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8', fontSize: 13 }}>
      Loading…
    </div>
  )
}

class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false } }
  static getDerivedStateFromError() { return { crashed: true } }
  componentDidCatch(err) {
    // Auto-reload on chunk load failures (stale deploy cache)
    if (err?.name === 'ChunkLoadError' || /Loading chunk|Failed to fetch dynamically imported module/.test(err?.message || '')) {
      window.location.reload()
    }
  }
  render() {
    if (!this.state.crashed) return this.props.children
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#fff', gap:16, padding:24, textAlign:'center' }}>
        <span style={{ fontSize:40 }}>⚠️</span>
        <div style={{ fontSize:18, fontWeight:700, color:'#0f172a' }}>Something went wrong</div>
        <div style={{ fontSize:14, color:'#64748b' }}>Tap below to reload the app</div>
        <button onClick={() => window.location.reload()} style={{ background:'#14b8a6', color:'#fff', border:'none', borderRadius:12, padding:'12px 28px', fontSize:15, fontWeight:700, cursor:'pointer' }}>
          Reload
        </button>
      </div>
    )
  }
}

const THEMES = [
  { id: 'teal',  label: '1', dot: '#14b8a6' },
  { id: 'gold',  label: '2', dot: '#e0b341' },
  { id: 'amber', label: '3', dot: '#e08c3b' },
]

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ICONS = {
  home:     <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M12 2C12 2 7 8 7 13a5 5 0 0 0 10 0c0-5-5-11-5-11z"/><circle cx="12" cy="13" r="2" fill="currentColor" stroke="none"/></svg>,
  trends:   <svg width="22" height="22" viewBox="0 0 24 24" {...S}><polyline points="3,18 9,11 13,15 21,6"/><line x1="3" y1="21" x2="21" y2="21"/></svg>,
  reports:  <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
  devices:  <svg width="22" height="22" viewBox="0 0 24 24" {...S}><rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M9 7V5h6v2"/><path d="M9 17v2h6v-2"/><polyline points="11.5,11 11.5,12.5 13,12.5"/></svg>,
  protocol: <svg width="22" height="22" viewBox="0 0 24 24" {...S}><polyline points="2,12 6,12 8,6 11,18 14,9 16,14 18,12 22,12"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
}

const MAIN_PATHS = ['/home', '/trends', '/upload', '/devices', '/protocol']

// Screens that manage their own full-page header — suppress global TopBar
const NO_TOPBAR = new Set([
  '/', '/signup', '/signup-preview', '/signup-preview-2', '/signup-preview-3',
  '/smart-panel', '/lab-doorstep', '/vault', '/terms', '/upgrade', '/settings',
  '/logo-preview', '/name-preview', '/privacy', '/desktop-preview', '/signup-desktop-preview',
])

// Screens that should also hide the bottom nav
const NO_BOTTOMNAV = new Set([
  '/', '/signup', '/signup-preview', '/signup-preview-2', '/signup-preview-3',
  '/smart-panel', '/lab-doorstep', '/desktop-preview',
])

const STANDALONE = [] // kept for legacy compat

const NAV = [
  { path: '/home',     icon: ICONS.home,     labelKey: 'home' },
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

  const userName = localStorage.getItem('healthos_username') || ''
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      minHeight: 52,
    }}>
      {/* Left: greeting on desktop main, logo+name on mobile main, back on sub-pages */}
      {isMain ? (
        <>
          {/* Mobile: logo + name */}
          <div className="topbar-mobile-logo" style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Logo size={32}/>
            <span style={{ fontSize:16, fontWeight:800, color:'#0f172a', letterSpacing:-0.3 }}>
              AROGYO<span style={{ color:'#14b8a6' }}>S</span>
            </span>
          </div>
          {/* Desktop: greeting (logo is in sidebar) */}
          <div className="topbar-desktop-greeting" style={{ display:'none' }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>
              {greeting}{userName ? `, ${userName}` : ''} 👋
            </span>
          </div>
        </>
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

      {/* Center: logo on sub-pages (mobile only) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!isMain && <Logo size={28}/>}
      </div>

      {/* Right: plus button + settings (mobile only) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isPlusMember() && (
          <button onClick={() => nav('/subscribe')} style={{
            background: 'linear-gradient(90deg,#14b8a6,#059669)',
            border: 'none', borderRadius: 20, cursor: 'pointer',
            color: '#fff', fontSize: 11, fontWeight: 800,
            padding: '5px 12px', letterSpacing: 0.3,
          }}>
            ⭐ Plus
          </button>
        )}
        {/* Settings icon — mobile only (desktop has it in sidebar) */}
        <button className="topbar-settings-btn" onClick={() => nav('/settings')} style={{
          background: pathname === '/settings' ? 'rgba(20,184,166,0.12)' : 'none',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          color: pathname === '/settings' ? '#14b8a6' : '#64748b',
          padding: '6px', display: 'flex', alignItems: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
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
  if (NO_TOPBAR.has(pathname)) return null
  return (
    <div className="global-disclaimer">
      ⚕️ AROGYOS is for health education only · Not a substitute for medical advice · Consult your doctor
    </div>
  )
}

// ── Desktop sidebar (Option 1 — dark) ────────────────────────────────────────
function DesktopSidebar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const t            = useT()

  const userName = localStorage.getItem('healthos_username') || 'You'
  const initial  = userName.charAt(0).toUpperCase()

  return (
    <aside className="desktop-sidebar" style={{ display: 'none' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 32px' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#14b8a6', opacity: 0.4 }}/>
        </div>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>
          AROGY<span style={{ color: '#14b8a6' }}>OS</span>
        </span>
      </div>

      {/* Nav items */}
      {NAV.map(n => {
        const active = pathname === n.path
        return (
          <button key={n.path} onClick={() => navigate(n.path)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 20px', border: 'none', cursor: 'pointer',
            background: active ? 'rgba(20,184,166,0.12)' : 'none',
            borderLeft: active ? '3px solid #14b8a6' : '3px solid transparent',
            color: active ? '#14b8a6' : 'rgba(255,255,255,0.5)',
            fontWeight: active ? 700 : 400, fontSize: 13,
            width: '100%', textAlign: 'left', transition: 'all .12s',
          }}>
            <span style={{ opacity: active ? 1 : 0.5 }}>{n.icon}</span>
            {t(n.labelKey)}
          </button>
        )
      })}

      <div style={{ flex: 1 }}/>

      {/* Upgrade card */}
      {!isPlusMember() && (
        <div style={{ padding: '0 16px 12px' }}>
          <div
            onClick={() => navigate('/subscribe')}
            style={{
              background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)',
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 11, color: '#14b8a6', fontWeight: 700, marginBottom: 4 }}>⭐ UPGRADE TO PLUS</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>Full BioAge · Family dashboard</div>
          </div>
        </div>
      )}

      {/* Settings */}
      <button onClick={() => navigate('/settings')} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 20px', border: 'none', cursor: 'pointer',
        background: pathname === '/settings' ? 'rgba(20,184,166,0.12)' : 'none',
        borderLeft: pathname === '/settings' ? '3px solid #14b8a6' : '3px solid transparent',
        color: pathname === '/settings' ? '#14b8a6' : 'rgba(255,255,255,0.5)',
        fontSize: 13, width: '100%', textAlign: 'left',
      }}>
        <span style={{ opacity: pathname === '/settings' ? 1 : 0.5 }}>{ICONS.settings}</span>
        Settings
      </button>

      {/* Social follow icons */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Follow Us</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { href: 'https://www.instagram.com/arogyos/', color: '#e1306c', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
            { href: 'https://www.linkedin.com/company/arogyos/', color: '#0ea5e9', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
            { href: 'https://www.youtube.com/@arogyos', color: '#ff0000', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg> },
            { href: 'https://www.reddit.com/r/Arogyos/', color: '#ff4500', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.72 10A2 2 0 0 1 20 11.5a2 2 0 0 1-1 1.74"/><path d="M7.28 10A2 2 0 0 0 4 11.5a2 2 0 0 0 1 1.74"/><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M9.5 16a4 4 0 0 0 5 0"/></svg> },
          ].map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${s.color}44`,
              background: `${s.color}11`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, textDecoration: 'none',
            }}>{s.svg}</a>
          ))}
        </div>
      </div>

      {/* User row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#14b8a6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>{initial}</div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>BioAge Member</div>
        </div>
      </div>
    </aside>
  )
}

const ROUTES = (
  <>
    <Route path="/"               element={<SignupScreen />} />
    <Route path="/signup"         element={<SignupScreen />} />
    <Route path="/home"           element={<DailyHubScreen />} />
    <Route path="/home-classic"   element={<Screen1 />} />
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
    <Route path="/reset"          element={<ResetAndSignup />} />
    <Route path="/terms"          element={<TermsScreen />} />
    <Route path="/upgrade"         element={<PaymentScreen />} />
    <Route path="/checkout"       element={<Navigate to="/upgrade" replace />} />
    <Route path="/payment"        element={<Navigate to="/upgrade" replace />} />
    <Route path="/settings"       element={<SettingsScreen />} />
    <Route path="/logo-preview"   element={<LogoPreviewScreen />} />
    <Route path="/name-preview"   element={<NameDesignPreview />} />
    <Route path="/privacy"          element={<PrivacyScreen />} />
    <Route path="/desktop-preview"       element={<DesktopDesignPreview />} />
    <Route path="/signup-desktop-preview" element={<SignupDesktopPreview />} />
    <Route path="/daily"             element={<DailyHubScreen />} />
  </>
)

function AppShell({ theme, setTheme }) {
  const [showRating, setShowRating] = useState(false)
  const { pathname } = useLocation()
  const FULL_SCREEN_PATHS = new Set(['/', '/signup', '/desktop-preview', '/signup-desktop-preview'])
  const isAuth = NO_TOPBAR.has(pathname) && FULL_SCREEN_PATHS.has(pathname)

  useEffect(() => {
    recordAppOpen()
    registerDailySync()
    if (localStorage.getItem('healthos_uid')) {
      pushToCloud()
      syncSubscriptionStatus()  // silently sync plan status from server
    }
    const quizDone = !!localStorage.getItem('healthos_profile') &&
      JSON.parse(localStorage.getItem('healthos_profile') || '{}').quizDone
    if (quizDone && daysSinceFirstOpen() >= 7 && !hasRatingPromptBeenShown()) {
      const t = setTimeout(() => setShowRating(true), 6000)
      return () => clearTimeout(t)
    }
  }, [])

  // Auth screens (signup/preview) — no sidebar, full screen (override grid CSS)
  if (isAuth) {
    return (
      <div data-theme={theme} className="app-shell" style={{ display: 'block' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>{ROUTES}</Routes>
        </Suspense>
      </div>
    )
  }

  return (
    <div data-theme={theme} className="app-shell">
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <DesktopSidebar/>

      {/* Main area */}
      <div className="desktop-main">
        <TopBar theme={theme} setTheme={setTheme}/>
        <MedicalDisclaimer/>
        {showRating && <RatingPrompt onClose={() => setShowRating(false)} />}
        <div className="desktop-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>{ROUTES}</Routes>
          </Suspense>
        </div>
      </div>

      {/* Mobile bottom nav — hidden on desktop via CSS */}
      <BottomNav/>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('healthos_theme') || 'teal')
  function setAndSaveTheme(t) { setTheme(t); localStorage.setItem('healthos_theme', t) }
  useEffect(() => { try { migrateReports() } catch {} }, [])
  return (
    <AppErrorBoundary>
      <LangProvider>
        <BrowserRouter>
          <AppShell theme={theme} setTheme={setAndSaveTheme}/>
        </BrowserRouter>
      </LangProvider>
    </AppErrorBoundary>
  )
}
