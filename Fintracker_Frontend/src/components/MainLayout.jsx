import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function MainLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile Top Navigation Header */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <Link to="/dashboard" className="mobile-logo">
            <span style={{ color: 'white' }}>Fin</span>
            <span style={{ color: '#e8623a', fontWeight: '800' }}>Tracker</span>
          </Link>
        </div>

        <div className="mobile-header-right">
          <Link to="/add-expense" className="mobile-add-btn">
            + Add
          </Link>
          <Link
            to="/profile"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#e8623a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '13px',
              textDecoration: 'none',
              marginLeft: '4px'
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div style={{ display: 'flex' }}>
        <Sidebar
          onCollapse={(collapsed) => setSidebarWidth(collapsed ? 70 : 240)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main
          className="main-content"
          style={{
            marginLeft: `${sidebarWidth}px`,
            flex: 1,
            minHeight: '100vh',
            width: `calc(100% - ${sidebarWidth}px)`,
            background: 'var(--bg)',
            overflowX: 'hidden',
            transition: 'margin-left 0.3s ease, width 0.3s ease'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
