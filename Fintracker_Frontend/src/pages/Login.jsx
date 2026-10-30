/* eslint-disable */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { GoogleLogin } from '@react-oauth/google'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill all fields'); return }

    setLoading(true)
    try {
      const response = await authAPI.login({
        email:    form.email,
        password: form.password
      })

      const { user, tokens } = response.data
      login(user, tokens)

      const isNewUser = localStorage.getItem(`fintracker_onboarded_${user.id}`) !== 'true'
      toast.success(isNewUser
        ? `Welcome to FinTracker, ${user.name.split(' ')[0]}!`
        : `Welcome back, ${user.name.split(' ')[0]}!`
      )

      if (user.is_admin) {
        navigate('/admin')
        return
      }

      const onboarded = localStorage.getItem(`fintracker_onboarded_${user.id}`) === 'true'
      navigate(onboarded ? '/dashboard' : '/onboarding')

    } catch (error) {
      const msg = error.response?.data?.non_field_errors?.[0] || 'Invalid email or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Unified Google auth — same ID-token flow as Register.jsx
  const handleGoogleCredential = async (credentialResponse) => {
    setGLoading(true)
    try {
      const res = await authAPI.googleAuth(credentialResponse.credential)
      const { user, tokens, is_new } = res.data
      login(user, tokens)

      toast.success(is_new
        ? `Welcome to FinTracker, ${user.name.split(' ')[0]}!`
        : `Welcome back, ${user.name.split(' ')[0]}!`
      )

      if (user.is_admin) {
        navigate('/admin')
        return
      }

      const onboarded = localStorage.getItem(`fintracker_onboarded_${user.id}`) === 'true'
      navigate(onboarded ? '/dashboard' : '/onboarding')

    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Google login failed. Please try again.'
      toast.error(msg)
    } finally {
      setGLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0faf4, #fff8f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="fade-in">

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', textDecoration: 'none' }}>
            <span style={{ color: 'white', background: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>Fin</span>
            <span style={{ color: '#1a73e8', fontWeight: '800' }}>Tracker</span>
          </Link>
          <p style={{ color: 'var(--text-light)', marginTop: '6px', fontSize: '14px' }}>Welcome back! Sign in to continue</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '24px' }}>Sign In</h2>

          {error && (
            <div style={{ background: '#ffeaea', border: '1px solid #ffb3b3', borderRadius: '8px', padding: '11px 14px', marginBottom: '16px', fontSize: '14px', color: '#c0392b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--primary)' }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingRight: '60px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: loading ? '#aaa' : 'var(--primary)',
                color: 'white', border: 'none', padding: '13px',
                borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Google Login Button */}
          <div style={{
            opacity: gLoading ? 0.6 : 1,
            pointerEvents: gLoading ? 'none' : 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '44px'
          }}>
            <GoogleLogin
              onSuccess={handleGoogleCredential}
              onError={() => toast.error('Google login cancelled or failed!')}
              text="signin_with"
              shape="rectangular"
              size="large"
              width="280"
            />
          </div>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: 'var(--text-mid)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
