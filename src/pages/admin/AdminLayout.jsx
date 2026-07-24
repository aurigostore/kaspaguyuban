import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV_ITEMS = [
  { to: '/admin',          label: 'Dashboard',      end: true  },
  { to: '/admin/wali-murid', label: 'Wali Murid'              },
  { to: '/admin/bayar',    label: 'Bayar Iuran'              },
  { to: '/admin/pemasukan',label: 'Pemasukan Lain'            },
  { to: '/admin/pengeluaran',label:'Pengeluaran'              },
  { to: '/admin/laporan',  label: 'Laporan & Export'          },
  { to: '/admin/pengaturan',label:'Pengaturan'                },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  // Tutup drawer saat klik di luar
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* Mobile top bar */}
      <header className="admin-mobile-bar">
        <button
          type="button"
          className="admin-menu-btn"
          id="admin-menu-open"
          aria-label="Buka menu navigasi"
          aria-controls="admin-drawer"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="admin-mobile-bar__brand">
          <div className="brand-mark brand-mark--sm" aria-hidden="true">
            <img src="/favicon.svg" alt="Logo" style={{ width: 22, height: 22, display: 'block', objectFit: 'contain' }} />
          </div>
          <div>
            <strong className="admin-mobile-bar__title">Kas Admin</strong>
            <span className="admin-mobile-bar__sub">{user?.nama || 'Admin'}</span>
          </div>
        </div>
        <Link to="/" className="btn btn--secondary btn--sm">Publik</Link>
      </header>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className={`admin-drawer-overlay${drawerOpen ? ' is-open' : ''}`}
          id="admin-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`admin-drawer${drawerOpen ? ' is-open' : ''}`}
        id="admin-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu admin"
      >
        <div className="admin-drawer__head">
          <div>
            <h2 className="admin-drawer__title">Menu Admin</h2>
            <p className="admin-drawer__sub">SAID BIN HARITS</p>
          </div>
          <button type="button" className="admin-menu-btn" aria-label="Tutup menu" onClick={() => setDrawerOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav className="admin-drawer__nav" aria-label="Navigasi admin mobile">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-drawer__foot">
          <Link to="/" className="btn btn--secondary btn--block" onClick={() => setDrawerOpen(false)}>
            Lihat halaman publik
          </Link>
          <button type="button" className="btn btn--ghost btn--block" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main layout */}
      <div className="admin-layout" style={{ minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar desktop */}
        <aside className="sidebar">
          <div className="sidebar__brand">
            <h1>Kas Admin</h1>
            <p>SAID BIN HARITS</p>
          </div>
          <nav className="sidebar__nav" aria-label="Menu admin desktop">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar__foot">
            <Link to="/" className="btn btn--secondary btn--block btn--sm">Halaman publik</Link>
            <button type="button" className="btn btn--ghost btn--block btn--sm" onClick={handleLogout}>
              Keluar
            </button>
          </div>
        </aside>

        {/* Page content */}
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </>
  )
}
