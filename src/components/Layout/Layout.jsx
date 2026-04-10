import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/',             label: 'Dashboard',        icon: HomeIcon,     end: true },
  { to: '/predicciones', label: 'Mis predicciones', icon: PredictIcon },
  { to: '/ranking',      label: 'Ranking',           icon: RankIcon },
  { to: '/fixture',      label: 'Fixture',           icon: CalendarIcon },
  { to: '/llaves',       label: 'Cuadro / Llaves',   icon: BracketIcon },
  { to: '/bases',        label: 'Bases y Condiciones', icon: DocIcon },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
  }

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.logoWrapper}>
          <img src="/logo-distrocuyo.png" alt="Distrocuyo" className={styles.logoImg} />
          <span className={styles.logoSub}>Prode Mundial 2026</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{profile?.display_name || 'Usuario'}</span>
            <button className={styles.signOutBtn} onClick={handleSignOut}>Cerrar sesión</button>
          </div>
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <img src="/logo-distrocuyo.png" alt="Distrocuyo" className={styles.mobileLogoImg} />
        <div className={styles.avatar} style={{ width: '32px', height: '32px', fontSize: '.65rem' }}>{initials}</div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.mobileNav}>
        {NAV_ITEMS.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => isActive ? styles.mobileNavItemActive : styles.mobileNavItem}
          >
            <Icon />
            <span>{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function HomeIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
}
function PredictIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
}
function RankIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
}
function CalendarIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
function BracketIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
}
function GiftIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
}
function DocIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
}
