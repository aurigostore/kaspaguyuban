import { Link, NavLink, Outlet } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'

export default function PublikLayout() {
  const { settings } = useData()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <div className="brand-mark" aria-hidden="true">SBH</div>
          <div>
            <h1 className="app-header__title">Kas Paguyuban</h1>
            <p className="app-header__sub">
              {settings.namaPaguyuban} · TA {settings.tahunAjaran}
            </p>
          </div>
        </div>
        <div className="app-header__actions">
          <Link to="/login" className="btn btn--secondary btn--sm header-admin-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Admin
          </Link>
        </div>
      </header>

      <Outlet />

      <nav className="bottom-nav" aria-label="Navigasi utama">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/status" className={({ isActive }) => isActive ? 'is-active' : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Status Iuran
        </NavLink>
        <NavLink to="/riwayat" className={({ isActive }) => isActive ? 'is-active' : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          Riwayat
        </NavLink>
      </nav>
    </div>
  )
}
