import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { toast } from 'react-toastify'

const NAV_GROUPS = [
  {
    group: 'MAIN',
    items: [
      { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    ]
  },
  {
    group: 'EXPENSES',
    items: [
      { path: '/add-expense', icon: '➕', label: 'Add Expense' },
      { path: '/expenses',    icon: '📄', label: 'My Expenses' },
    ]
  },
  {
    group: 'PLANNING',
    items: [
      { path: '/budget',     icon: '💰', label: 'Budget Planner'  },
      { path: '/goals',      icon: '🎯', label: 'Financial Goals' },
      { path: '/recurring',  icon: '🔁', label: 'Recurring Bills' },
      { path: '/bill-split', icon: '🤝', label: 'Bill Splitter'   },
    ]
  },
  {
    group: 'ANALYTICS',
    items: [
      { path: '/reports',     icon: '📊', label: 'Reports'     },
      { path: '/ai-insights', icon: '✨', label: 'AI Insights' },
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { path: '/profile',  icon: '👤', label: 'Profile'  },
      { path: '/settings', icon: '⚙️', label: 'Settings' },
    ]
  },
]

export default function Sidebar({ onCollapse }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    const name = user?.name?.split(' ')[0] || 'User'
    navigate('/')
    setTimeout(() => {
      logout()
      toast.success(`Thanks for using FinTracker, ${name}! See you soon.`)
    }, 100)
  }

  return (
    <aside style={{
      width: collapsed ? '70px' : '240px',
      height: '100vh',
      background: '#1a1f2e',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 100,
      transition: 'width 0.3s ease',
      overflow: 'hidden'
    }}>

      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700' }}>
            <span style={{ color: 'white' }}>Fin</span>
            <span style={{ color: '#e8623a', fontWeight: '800' }}>Tracker</span>
          </span>
        )}
        <button
          onClick={() => {
            const newState = !collapsed
            setCollapsed(newState)
            if (onCollapse) onCollapse(newState)
          }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '6px',
            width: '28px', height: '28px',
            cursor: 'pointer', fontSize: '13px',
            color: 'rgba(255,255,255,0.7)',
            marginLeft: collapsed ? 'auto' : '0',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '10px',
          flexShrink: 0
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#e8623a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
      )}

      {/* Navigation - scrollable */}
      <nav style={{
        flex: 1,
        padding: '10px 8px',
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0
      }}>
        {NAV_GROUPS.map(group => (
          <div key={group.group}>
            {!collapsed && (
              <p style={{
                fontSize: '10px', fontWeight: '700',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '1.2px', padding: '10px 12px 4px',
                marginTop: '4px'
              }}>
                {group.group}
              </p>
            )}
            {collapsed && <div style={{ height: '10px' }} />}

            {group.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center',
                  gap: '10px', padding: '10px 12px',
                  borderRadius: '10px', marginBottom: '2px',
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(232,98,58,0.18)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '13px',
                  borderLeft: isActive ? '3px solid #e8623a' : '3px solid transparent',
                  transition: 'all 0.2s'
                })}
              >
                <span style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </NavLink>
            ))}
          </div>
        ))}

        {/* Admin link */}
        {user?.is_admin && (
          <div>
            {!collapsed && (
              <p style={{
                fontSize: '10px', fontWeight: '700',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '1.2px', padding: '10px 12px 4px',
                marginTop: '4px'
              }}>
                ADMIN
              </p>
            )}
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                gap: '10px', padding: '10px 12px',
                borderRadius: '10px', marginBottom: '2px',
                textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(232,98,58,0.18)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '13px',
                borderLeft: isActive ? '3px solid #e8623a' : '3px solid transparent',
                transition: 'all 0.2s'
              })}
            >
              <span style={{ fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>🛡️</span>
              {!collapsed && 'Admin Panel'}
            </NavLink>
          </div>
        )}
      </nav>

      {/* Logout - always at bottom */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0
      }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px', padding: '10px 12px',
            borderRadius: '10px', width: '100%',
            background: 'transparent',
            border: '1.5px solid rgba(231,76,60,0.4)',
            color: '#e74c3c', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,60,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '16px' }}>🚪</span>
          {!collapsed && 'Sign Out'}
        </button>
      </div>

    </aside>
  )
}