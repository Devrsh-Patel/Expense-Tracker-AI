/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { getStoredCurrency, CURRENCY_CONFIG } from '../utils/currency'

export default function Profile() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const symbol = CURRENCY_CONFIG[getStoredCurrency()]?.symbol || '₹'
  const [form, setForm] = useState({
    name: '', mobile: '', gender: '', income: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name:   user.name   || '',
        mobile: user.mobile || '',
        gender: user.gender || '',
        income: user.income || ''
      })
    }
  }, [user])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.updateProfile(form)
      login(res.data.user, null)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
  }

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

      {/* Personal Info Card */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '20px' }}>
          Personal Information
        </h3>
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={form.name} onChange={handleChange('name')} />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="tel" value={form.mobile} onChange={handleChange('mobile')} maxLength={10} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={handleChange('gender')}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monthly Income ({symbol})</label>
              <input type="number" value={form.income} onChange={handleChange('income')} min="0" placeholder="Enter your monthly income" />
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
    </div>
  )
}