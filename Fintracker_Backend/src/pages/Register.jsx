/* eslint-disable */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getPasswordStrength } from '../utils/validators'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '',
    gender: '', password: '', confirmPassword: ''
  })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const strength = getPasswordStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.fullName || form.fullName.trim().length < 2) e.fullName = 'Enter a valid full name'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter valid 10 digit mobile'
    if (!form.gender) e.gender = 'Please select gender'
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters required'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      await authAPI.register({
        name:             form.fullName,
        email:            form.email,
        mobile:           form.mobile,
        gender:           form.gender,
        password:         form.password,
        confirm_password: form.confirmPassword
      })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (error) {
      const data = error.response?.data
      if (data?.email)  setErrors(p => ({ ...p, email: data.email[0] }))
      if (data?.mobile) setErrors(p => ({ ...p, mobile: data.mobile[0] }))
      if (data?.name)   setErrors(p => ({ ...p, fullName: data.name[0] }))
      toast.error('Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true)
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json())

        const res = await authAPI.googleLogin({
          token: tokenResponse.access_token,
          email: userInfo.email,
          name:  userInfo.name
        })
        const { user, tokens, is_new } = res.data
        login(user, tokens)
        toast.success(`Welcome to FinTracker, ${user.name.split(' ')[0]}!`)
        navigate(is_new ? '/onboarding' : '/dashboard')
      } catch {
        toast.error('Google signup failed. Please try again.')
      } finally {
        setGLoading(false)
      }
    },
    onError: () => toast.error('Google signup failed!')
  })

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0faf4, #fff8f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }} className="fade-in">

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', textDecoration: 'none' }}>
            <span style={{ color: 'white', background: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>Fin</span>
            <span style={{ color: '#1a73e8', fontWeight: '800' }}>Tracker</span>
          </Link>
          <p style={{ color: 'var(--text-light)', marginTop: '6px', fontSize: '14px' }}>Create your free account</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '24px' }}>Sign Up</h2>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={gLoading}
            style={{
              width: '100%', padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px', background: 'white',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '10px',
              cursor: gLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600',
              color: '#444', marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              width="20" height="20" alt="Google"
            />
            {gLoading ? 'Connecting...' : 'Sign up with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>OR register with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.fullName} onChange={set('fullName')} className={errors.fullName ? 'error' : ''} />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} className={errors.email ? 'error' : ''} />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input type="tel" value={form.mobile} onChange={set('mobile')} maxLength={10} className={errors.mobile ? 'error' : ''} />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={set('gender')} className={errors.gender ? 'error' : ''}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingRight: '60px' }}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ background: '#eee', borderRadius: '4px', height: '4px' }}>
                    <div style={{ width: strength.width, background: strength.color, height: '100%', borderRadius: '4px', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#aaa' : 'var(--primary)',
                color: 'white', border: 'none', padding: '13px',
                borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: 'var(--text-mid)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign In</Link>
          </p>

        </div>
      </div>
    </div>
  )
}