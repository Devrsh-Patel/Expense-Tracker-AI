/* eslint-disable */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { toast } from 'react-toastify'
import { formatCurrency } from '../utils/currency'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard')
      return
    }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await authAPI.adminStats()
      setStats(res.data)
    } catch {
      toast.error('Failed to load admin stats')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin-login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>

      {/* Admin Navbar */}
      <nav style={{
        background: '#1a1a2e', color: 'white',
        padding: '16px 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <p style={{ fontWeight: '700', fontSize: '16px' }}>FinTracker Admin</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Admin Control Panel</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Welcome, {user?.name}</p>
          <button onClick={handleLogout} style={{
            background: '#e74c3c', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', fontSize: '13px'
          }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '28px' }}>
          Overview of all FinTracker users and expenses
        </p>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>Total Users</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>{stats?.total_users || 0}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>Registered users</p>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', borderLeft: '4px solid #e74c3c', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>Total Expenses</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#e74c3c' }}>{stats?.total_expenses || 0}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>All transactions</p>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', borderLeft: '4px solid #f39c12', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>Total Amount</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#f39c12' }}>{formatCurrency(stats?.total_amount)}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>All time spending</p>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '14px', borderLeft: '4px solid #27ae60', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>Avg per User</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>
              {formatCurrency(stats?.total_users > 0 ? stats?.total_amount / stats?.total_users : 0)}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>Average spending</p>
          </div>
        </div>

        {/* Recent Users */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '16px' }}>
            Recent Users
          </h3>
          {stats?.recent_users?.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px' }}>No users yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9f9f9' }}>
                 {['#', 'Name', 'Email', 'Mobile', 'Gender', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.recent_users?.map((u, idx) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
  <td style={{ padding: '12px 14px', color: 'var(--text-light)' }}>{idx + 1}</td>
  <td style={{ padding: '12px 14px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px' }}>
        {u.name?.[0]?.toUpperCase()}
      </div>
      <span style={{ fontWeight: '500' }}>{u.name}</span>
    </div>
  </td>
  <td style={{ padding: '12px 14px', color: 'var(--text-mid)' }}>{u.email}</td>
  <td style={{ padding: '12px 14px', color: 'var(--text-mid)' }}>{u.mobile || 'N/A'}</td>
  <td style={{ padding: '12px 14px', color: 'var(--text-mid)' }}>{u.gender || 'N/A'}</td>
  <td style={{ padding: '12px 14px', color: 'var(--text-light)' }}>
    {new Date(u.created_at).toLocaleDateString('en-IN')}
  </td>
</tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '24px' }}>
          {[
            { label: 'Django Admin', icon: '⚙️', url: 'http://127.0.0.1:8000/admin/' },
            { label: 'API Docs',     icon: '📄', url: 'http://127.0.0.1:8000/swagger/' },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noreferrer" style={{
              padding: '16px', border: '2px solid var(--border)', borderRadius: '12px',
              background: 'white', textAlign: 'center', textDecoration: 'none',
              display: 'block', transition: 'all 0.2s'
            }}>
              <p style={{ fontSize: '24px', marginBottom: '6px' }}>{link.icon}</p>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)' }}>{link.label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}