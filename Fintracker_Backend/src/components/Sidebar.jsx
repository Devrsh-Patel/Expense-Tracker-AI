import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { toast } from 'react-toastify'

const NAV = [
  { path: '/profile',     icon: '👤', label: 'Profile'     },
  { path: '/dashboard',   icon: '📊', label: 'Dashboard'   },
  { path: '/add-expense', icon: '➕', label: 'Add Expense' },
  { path: '/expenses',    icon: '📋', label: 'My Expenses' },
  { path: '/reports',     icon: '📁', label: 'Reports'     },
  { path: '/ai-insights', icon: '🤖', label: 'AI Insights' },
  { path: '/budget',     icon: '💰', label: 'Budget Planner'  },
{ path: '/goals',      icon: '🎯', label: 'Financial Goals'  },
{ path: '/recurring',  icon: '🔄', label: 'Recurring Bills'  },
{ path: '/bill-split', icon: '🧾', label: 'Bill Splitter'    },
]

export default function Sidebar({ onCollapse }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    const name = user?.name?.split(' ')[0] || 'User'
    logout()
    toast.success(`Thanks for using FinTracker, ${name}! See you soon.`)
    setTimeout(() => navigate('/'), 1500)
  }

  return (
    <aside style={{
      width: collapsed ? '70px' : '240px',
      minHeight: '100vh',
      background: '#111111',
      borderRight: 'none',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 100,
      transition: 'width 0.3s ease'
    }}>

      {/* Logo */}
      <div style={{
        padding: '22px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700' }}>
            <span style={{ color: 'white' }}>Fin</span>
            <span style={{ color: '#1a73e8', fontWeight: '800' }}>Tracker</span>
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
            border: 'none',
            borderRadius: '6px',
            width: '30px', height: '30px',
            cursor: 'pointer', fontSize: '14px',
            color: 'white',
            marginLeft: collapsed ? 'auto' : '0'
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '38px', height: '38px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '16px',
            flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
            {user?.name?.split(' ')[0]}
          </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
            {user?.email}
          </div>
        </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: '12px', padding: '11px 12px',
              borderRadius: '10px', marginBottom: '4px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              fontWeight: isActive ? '600' : '400',
              fontSize: '14px',
              borderLeft: isActive ? '3px solid var(--primary-light)' : '3px solid transparent',
              transition: 'all 0.2s'
            })}
          >
            <span style={{ fontSize: '18px', minWidth: '22px', textAlign: 'center' }}>
              {item.icon}
            </span>
            {!collapsed && item.label}
          </NavLink>
        ))}

        {/* Admin link */}
        {user?.email === 'admin@fintracker.com' && (
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: '12px', padding: '11px 12px',
              borderRadius: '10px', marginBottom: '4px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(230,126,34,0.2)' : 'transparent',
              fontWeight: isActive ? '600' : '400',
              fontSize: '14px',
              borderLeft: isActive ? '3px solid #e67e22' : '3px solid transparent',
              transition: 'all 0.2s'
            })}
          >
            <span style={{ fontSize: '18px', minWidth: '22px', textAlign: 'center' }}>⚙️</span>
            {!collapsed && 'Admin Panel'}
          </NavLink>
        )}
      </nav>

     {/* Logout Button */}
<div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
  <button
    onClick={handleLogout}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '8px', padding: '12px 16px',
      borderRadius: '10px', width: '100%',
      background: 'transparent',
      border: '1.5px solid rgba(231,76,60,0.6)',
      color: '#e74c3c', fontSize: '14px',
      fontWeight: '600', cursor: 'pointer',
      transition: 'all 0.2s',
      letterSpacing: '0.3px'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = '#e74c3c'
      e.currentTarget.style.color = 'white'
      e.currentTarget.style.border = '1.5px solid #e74c3c'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.color = '#e74c3c'
      e.currentTarget.style.border = '1.5px solid rgba(231,76,60,0.6)'
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
    {!collapsed && 'Sign Out'}
  </button>
</div>

    </aside>
  )
}