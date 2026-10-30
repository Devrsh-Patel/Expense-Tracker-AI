/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { CURRENCY_OPTIONS, formatCurrency, getStoredCurrency, setStoredCurrency } from '../utils/currency'

export default function Profile() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', mobile: '', gender: '', income: '', currency: getStoredCurrency()
  })
  const [passForm, setPassForm] = useState({
    old_password: '', new_password: '', confirm_password: ''
  })
  const [showPass, setShowPass] = useState({
    old: false, new: false, confirm: false
  })
  const [loading, setLoading]         = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [activeTab, setActiveTab]     = useState('profile')

  useEffect(() => {
    if (user) {
      setForm({
        name:     user.name     || '',
        mobile:   user.mobile   || '',
        gender:   user.gender   || '',
        income:   user.income   || '',
        currency: user.currency || getStoredCurrency()
      })
    }
  }, [user])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.updateProfile(form)
      setStoredCurrency(form.currency)
      login(res.data.user, null)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passForm.new_password !== passForm.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    if (passForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setPassLoading(true)
    try {
      await authAPI.changePassword(passForm)
      toast.success('Password changed successfully!')
      setPassForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to change password'
      toast.error(msg)
    } finally {
      setPassLoading(false)
    }
  }

  const set = (field, isPass = false) => (e) => {
    if (isPass) setPassForm(p => ({ ...p, [field]: e.target.value }))
    else setForm(p => ({ ...p, [field]: e.target.value }))
  }

  const toggleShow = (field) => setShowPass(p => ({ ...p, [field]: !p[field] }))

  const PasswordInput = ({ field, label, value, onChange }) => (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPass[field] ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          style={{ paddingRight: '60px' }}
        />
        <button
          type="button"
          onClick={() => toggleShow(field)}
          style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: '13px',
            color: 'var(--primary)', fontWeight: '600'
          }}
        >
          {showPass[field] ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '32px' }}>
      <h1 className="page-title">My Profile</h1>
      <p className="page-subtitle">Manage your account settings</p>

      {/* Profile Header */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: 'var(--primary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', color: 'white', fontWeight: '700'
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: '700', fontSize: '18px' }}>{user?.name}</p>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>{user?.email}</p>
          <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '2px' }}>
            Member since {new Date(user?.created_at).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { key: 'profile',  label: '👤 Profile Info'    },
          { key: 'password', label: '🔒 Change Password' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer',
            background: activeTab === tab.key ? 'var(--primary)' : 'white',
            color:      activeTab === tab.key ? 'white' : 'var(--text-mid)',
            border:     `2px solid ${activeTab === tab.key ? 'var(--primary)' : 'var(--border)'}`
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '20px' }}>
            Personal Information
          </h3>
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={set('name')} />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input type="tel" value={form.mobile} onChange={set('mobile')} maxLength={10} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender} onChange={set('gender')}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Income</label>
                <input type="number" value={form.income} onChange={set('income')} min="0" placeholder="Enter your monthly income" />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select value={form.currency} onChange={set('currency')}>
                  {CURRENCY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} disabled style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Email cannot be changed</span>
            </div>

            <button type="submit" disabled={loading} style={{
              background: loading ? '#aaa' : 'var(--primary)',
              color: 'white', border: 'none', padding: '12px 32px',
              borderRadius: '10px', fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px'
            }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '20px' }}>
            Change Password
          </h3>

          <form onSubmit={handleChangePassword}>
            <PasswordInput
              field="old"
              label="Current Password"
              value={passForm.old_password}
              onChange={set('old_password', true)}
            />

            {/* Forgot Password Link */}
            <div style={{ marginTop: '-12px', marginBottom: '16px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--primary)', fontSize: '13px',
                  cursor: 'pointer', fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                Forgot current password?
              </button>
            </div>

            <PasswordInput
              field="new"
              label="New Password"
              value={passForm.new_password}
              onChange={set('new_password', true)}
            />

            <PasswordInput
              field="confirm"
              label="Confirm New Password"
              value={passForm.confirm_password}
              onChange={set('confirm_password', true)}
            />

            <button type="submit" disabled={passLoading} style={{
              background: passLoading ? '#aaa' : 'var(--primary)',
              color: 'white', border: 'none', padding: '12px 32px',
              borderRadius: '10px', fontSize: '14px', fontWeight: '600',
              cursor: passLoading ? 'not-allowed' : 'pointer'
            }}>
              {passLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}