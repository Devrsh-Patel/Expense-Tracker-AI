/* eslint-disable */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.warning('Please fill all fields'); return }

    setLoading(true)
    try {
      const response = await authAPI.login({
        email:    form.email,
        password: form.password
      })

      const { user, tokens } = response.data
console.log('Admin user data:', user)
console.log('is_admin value:', user.is_admin)
      if (!user.is_admin) {
        toast.error('Access denied! Admin only area.')
        return
      }

      login(user, tokens)
      toast.success(`Welcome, ${user.name}!`)
      navigate('/admin')

    } catch (error) {
      toast.error('Invalid admin credentials!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
          <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '6px' }}>
            FinTracker Administration
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>Admin Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@fintracker.com"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter admin password"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', paddingRight: '60px' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '13px',
                  color: 'rgba(255,255,255,0.6)', fontWeight: '600'
                }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#555' : '#e74c3c',
              color: 'white', border: 'none', padding: '13px',
              borderRadius: '10px', fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px'
            }}>
              {loading ? 'Signing in...' : 'Admin Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          This area is restricted to administrators only
        </p>
      </div>
    </div>
  )
}