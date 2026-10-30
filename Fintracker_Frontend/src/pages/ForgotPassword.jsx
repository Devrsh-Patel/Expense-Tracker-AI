/* eslint-disable */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep]     = useState(1)
  const [email, setEmail]   = useState('')
  const [otp, setOtp]       = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Step 1 - Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) { toast.warning('Please enter your email'); return }
    setLoading(true)
    try {
      const res = await authAPI.forgotPassword({ email })
      toast.success('OTP sent to your email!')
      console.log('OTP for testing:', res.data.otp)
      setStep(2)
    } catch (error) {
      const msg = error.response?.data?.error || 'No account found with this email'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2 - Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp) { toast.warning('Please enter OTP'); return }
    setLoading(true)
    try {
      const res = await authAPI.verifyOTP({ email, otp })
      setResetToken(res.data.reset_token)
      toast.success('OTP verified!')
      setStep(3)
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid OTP'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Step 3 - Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (newPassword.length < 8) { toast.error('Minimum 8 characters required'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword({
        email,
        reset_token:      resetToken,
        new_password:     newPassword,
        confirm_password: confirmPassword
      })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to reset password'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0faf4, #fff8f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }} className="fade-in">

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', textDecoration: 'none' }}>
            <span style={{ color: 'white', background: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>Fin</span>
            <span style={{ color: '#1a73e8', fontWeight: '800' }}>Tracker</span>
          </Link>
          <p style={{ color: 'var(--text-light)', marginTop: '6px', fontSize: '14px' }}>Reset your password</p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
          {['Email', 'OTP', 'New Password'].map((label, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: step > idx ? 'var(--primary)' : step === idx + 1 ? 'var(--primary)' : '#e0e0e0',
                  color: 'white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: '700', fontSize: '14px'
                }}>
                  {step > idx + 1 ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>{label}</span>
              </div>
              {idx < 2 && (
                <div style={{ height: '2px', flex: 1, background: step > idx + 1 ? 'var(--primary)' : '#e0e0e0', marginBottom: '16px' }} />
              )}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '32px' }}>

          {/* Step 1 - Email */}
          {step === 1 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>Forgot Password</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '24px' }}>
                Enter your registered email address and we will send you an OTP
              </p>
              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: '100%', background: loading ? '#aaa' : 'var(--primary)',
                  color: 'white', border: 'none', padding: '13px',
                  borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2 - OTP */}
          {step === 2 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>Enter OTP</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '4px' }}>
                OTP sent to <strong>{email}</strong>
              </p>
              <p style={{ fontSize: '13px', color: '#f39c12', marginBottom: '24px' }}>
                ⚠️ Check browser console for OTP (testing mode)
              </p>
              <form onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text" value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="Enter 6 digit OTP"
                    maxLength={6}
                    style={{ fontSize: '20px', letterSpacing: '8px', textAlign: 'center' }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: '100%', background: loading ? '#aaa' : 'var(--primary)',
                  color: 'white', border: 'none', padding: '13px',
                  borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '12px'
                }}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => setStep(1)} style={{
                  width: '100%', background: 'white', color: 'var(--text-mid)',
                  border: '2px solid var(--border)', padding: '11px',
                  borderRadius: '10px', fontSize: '14px', cursor: 'pointer'
                }}>
                  Back
                </button>
              </form>
            </>
          )}

          {/* Step 3 - New Password */}
          {step === 3 && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>New Password</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '24px' }}>
                Enter your new password
              </p>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      style={{ paddingRight: '60px' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: '13px',
                      color: 'var(--primary)', fontWeight: '600'
                    }}>
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: '100%', background: loading ? '#aaa' : 'var(--primary)',
                  color: 'white', border: 'none', padding: '13px',
                  borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-mid)' }}>
            Remember password?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}