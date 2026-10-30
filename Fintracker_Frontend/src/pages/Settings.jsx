/* eslint-disable */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD', 'JPY', 'CNY']

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('profile')

  // Load saved preferences from localStorage
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fintracker_notifications') || '{}')
    } catch { return {} }
  })

  const [currency, setCurrency] = useState(() =>
    localStorage.getItem('fintracker_currency') || 'INR'
  )

  const [theme, setTheme] = useState(() =>
    localStorage.getItem('fintracker_theme') || 'Light'
  )

  // Password Change
  const [pwForm, setPwForm]     = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [showPw, setShowPw]     = useState({ old: false, new: false, confirm: false })

  // Currency Calculator
  const [fromCur, setFromCur]   = useState('INR')
  const [toCur, setToCur]       = useState('USD')
  const [amount, setAmount]     = useState('')
  const [converted, setConverted] = useState(null)
  const [rates, setRates]       = useState(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => { fetchRates() }, [fromCur])

  // Apply theme on change
  useEffect(() => {
    localStorage.setItem('fintracker_theme', theme)
    if (theme === 'Dark') {
      document.documentElement.style.setProperty('--bg', '#1a1a2e')
      document.documentElement.style.setProperty('--text-dark', '#ffffff')
      document.documentElement.style.setProperty('--text-mid', '#cccccc')
      document.documentElement.style.setProperty('--text-light', '#aaaaaa')
      document.documentElement.style.setProperty('--border', '#333333')
    } else {
      document.documentElement.style.setProperty('--bg', '#f5f6fa')
      document.documentElement.style.setProperty('--text-dark', '#1a1a2e')
      document.documentElement.style.setProperty('--text-mid', '#4a5568')
      document.documentElement.style.setProperty('--text-light', '#718096')
      document.documentElement.style.setProperty('--border', '#e2e8f0')
    }
  }, [theme])

  const fetchRates = async () => {
    setRateLoading(true)
    try {
      const res  = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCur}`)
      const data = await res.json()
      setRates(data.rates)
      setLastUpdated(new Date().toLocaleTimeString('en-IN'))
    } catch {
      toast.error('Failed to fetch exchange rates')
    } finally {
      setRateLoading(false)
    }
  }

  const handleConvert = () => {
    if (!amount || Number(amount) <= 0) { toast.warning('Enter a valid amount'); return }
    if (!rates) { toast.error('Rates not loaded yet'); return }
    const rate = rates[toCur]
    setConverted((parseFloat(amount) * rate).toFixed(4))
  }

  const handleSwap = () => {
    setFromCur(toCur)
    setToCur(fromCur)
    setConverted(null)
    setAmount('')
  }

  const handleToggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem('fintracker_notifications', JSON.stringify(updated))
    toast.success(`${key === 'budgetAlerts' ? 'Budget Alerts' : key === 'emailReminder' ? 'Email Reminder' : 'Weekly Summary'} ${updated[key] ? 'enabled' : 'disabled'}!`)
  }

  const handleCurrencyChange = async (val) => {
    setCurrency(val)
    localStorage.setItem('fintracker_currency', val)
    try {
      await authAPI.updateProfile({ currency: val })
    } catch {
      // Ignore background sync errors, keep local preference
    }
    toast.success(`Default currency set to ${val}!`)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pwForm.old_password || !pwForm.new_password || !pwForm.confirm_password) {
      toast.warning('Please fill all fields')
      return
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setPwLoading(true)
    try {
      await authAPI.changePassword(pwForm)
      toast.success('Password changed successfully!')
      setPwForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const sections = [
    { id: 'profile',  icon: '👤', label: 'Profile'            },
    { id: 'security', icon: '🔐', label: 'Security'           },
    { id: 'notify',   icon: '🔔', label: 'Notifications'      },
    { id: 'prefs',    icon: '🌍', label: 'Preferences'        },
    { id: 'currency', icon: '💱', label: 'Currency Calculator' },
    { id: 'support',  icon: '🎧', label: 'Support'            },
    { id: 'about',    icon: 'ℹ️', label: 'About'              },
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '960px' }}>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your account and preferences</p>

      <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>

        {/* Left Menu */}
        <div style={{ width: '210px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '8px' }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 14px', borderRadius: '8px',
                border: 'none', cursor: 'pointer', fontSize: '13px',
                fontWeight: activeSection === s.id ? '600' : '400',
                background: activeSection === s.id ? 'rgba(232,98,58,0.1)' : 'transparent',
                color: activeSection === s.id ? '#e8623a' : 'var(--text-mid)',
                textAlign: 'left', transition: 'all 0.2s', marginBottom: '2px'
              }}>
                <span style={{ fontSize: '16px' }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div style={{ flex: 1 }}>

          {/* ── PROFILE ── */}
          {activeSection === 'profile' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '20px' }}>👤 Profile Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  width: '68px', height: '68px', borderRadius: '50%',
                  background: '#e8623a', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '28px'
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '18px' }}>{user?.name}</p>
                  <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '2px' }}>{user?.email}</p>
                </div>
              </div>

              <div style={{ background: '#f9f9f9', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                {[
                  { label: 'Full Name', value: user?.name },
                  { label: 'Email',     value: user?.email },
                  { label: 'Mobile',    value: user?.mobile || 'Not set' },
                  { label: 'Gender',    value: user?.gender || 'Not set' },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/profile')} style={{
                background: '#e8623a', color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: '8px',
                cursor: 'pointer', fontWeight: '600', fontSize: '13px'
              }}>
                Edit Profile →
              </button>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeSection === 'security' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '20px' }}>🔐 Change Password</h3>
              <form onSubmit={handleChangePassword}>
                {[
                  { key: 'old_password',     label: 'Current Password',  show: 'old'     },
                  { key: 'new_password',     label: 'New Password',      show: 'new'     },
                  { key: 'confirm_password', label: 'Confirm Password',  show: 'confirm' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPw[f.show] ? 'text' : 'password'}
                        value={pwForm[f.key]}
                        onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        style={{ paddingRight: '60px' }}
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, [f.show]: !p[f.show] }))} style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', fontSize: '12px',
                        color: 'var(--primary)', fontWeight: '600'
                      }}>{showPw[f.show] ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={pwLoading} style={{
                  background: pwLoading ? '#aaa' : '#e8623a', color: 'white',
                  border: 'none', padding: '11px 28px', borderRadius: '8px',
                  cursor: pwLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600', fontSize: '13px'
                }}>
                  {pwLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notify' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '6px' }}>🔔 Notifications</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '24px' }}>
                Your preferences are saved locally on this device.
              </p>
              {[
                { key: 'budgetAlerts',   label: 'Budget Alerts',   desc: 'Get notified when you are close to your budget limit' },
                { key: 'emailReminder',  label: 'Email Reminder',  desc: 'Reminder to log your daily expenses' },
                { key: 'weeklySummary',  label: 'Weekly Summary',  desc: 'Weekly overview of your spending habits' },
              ].map(item => (
                <div key={item.key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px', background: '#f9f9f9', borderRadius: '10px', marginBottom: '12px'
                }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.label}</p>
                    <p style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '3px' }}>{item.desc}</p>
                  </div>
                  <button onClick={() => handleToggleNotification(item.key)} style={{
                    width: '48px', height: '27px', borderRadius: '14px',
                    border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: notifications[item.key] ? '#e8623a' : '#ccc',
                    position: 'relative', transition: 'background 0.3s'
                  }}>
                    <div style={{
                      width: '21px', height: '21px', borderRadius: '50%',
                      background: 'white', position: 'absolute', top: '3px',
                      left: notifications[item.key] ? '24px' : '3px',
                      transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── PREFERENCES ── */}
          {activeSection === 'prefs' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '24px' }}>🌍 Preferences</h3>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '10px' }}>
                  Default Currency
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => handleCurrencyChange(c)} style={{
                      padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: currency === c ? '700' : '400',
                      border: `2px solid ${currency === c ? '#e8623a' : 'var(--border)'}`,
                      background: currency === c ? 'rgba(232,98,58,0.1)' : 'white',
                      color: currency === c ? '#e8623a' : 'var(--text-mid)'
                    }}>{c}</button>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
                  Selected: {currency} — saved to your device ✅
                </p>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '10px' }}>
                  Theme
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { value: 'Light', icon: '☀️' },
                    { value: 'Dark',  icon: '🌙' },
                  ].map(t => (
                    <button key={t.value} onClick={() => setTheme(t.value)} style={{
                      padding: '12px 24px', borderRadius: '10px', cursor: 'pointer',
                      fontSize: '14px', fontWeight: theme === t.value ? '700' : '400',
                      border: `2px solid ${theme === t.value ? '#e8623a' : 'var(--border)'}`,
                      background: theme === t.value ? 'rgba(232,98,58,0.1)' : 'white',
                      color: theme === t.value ? '#e8623a' : 'var(--text-mid)',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      {t.icon} {t.value}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
                  Current theme: {theme} — applied instantly ✅
                </p>
              </div>
            </div>
          )}

          {/* ── CURRENCY CALCULATOR ── */}
          {activeSection === 'currency' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '6px' }}>💱 Currency Calculator</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '12px', marginBottom: '24px' }}>
                Real-time exchange rates {lastUpdated && `· Updated at ${lastUpdated}`}
                {rateLoading && ' · Fetching...'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>From</label>
                  <select value={fromCur} onChange={e => setFromCur(e.target.value)} style={{
                    width: '100%', padding: '10px 14px',
                    border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px'
                  }}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <button onClick={handleSwap} style={{
                  padding: '10px 14px', borderRadius: '8px',
                  border: '1.5px solid var(--border)', background: 'white',
                  cursor: 'pointer', fontSize: '20px', marginTop: '20px'
                }}>⇄</button>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>To</label>
                  <select value={toCur} onChange={e => { setToCur(e.target.value); setConverted(null) }} style={{
                    width: '100%', padding: '10px 14px',
                    border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px'
                  }}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setConverted(null) }}
                  placeholder={`Enter amount in ${fromCur}`}
                  style={{
                    flex: 1, padding: '12px 16px',
                    border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '15px'
                  }}
                />
                <button onClick={handleConvert} disabled={rateLoading} style={{
                  padding: '12px 28px', background: '#e8623a', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px'
                }}>
                  Convert
                </button>
              </div>

              {converted && (
                <div style={{
                  padding: '24px', textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(232,98,58,0.08), rgba(232,98,58,0.03))',
                  border: '1.5px solid rgba(232,98,58,0.25)', borderRadius: '14px',
                  marginBottom: '20px'
                }}>
                  <p style={{ color: 'var(--text-light)', fontSize: '13px', marginBottom: '8px' }}>
                    {amount} {fromCur} equals
                  </p>
                  <p style={{ fontSize: '36px', fontWeight: '800', color: '#e8623a', marginBottom: '8px' }}>
                    {converted} {toCur}
                  </p>
                  <p style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                    1 {fromCur} = {rates?.[toCur]?.toFixed(6)} {toCur}
                  </p>
                </div>
              )}

              {/* Quick rates table */}
              {rates && (
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-dark)' }}>
                    Live Rates (Base: 1 {fromCur})
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                    {CURRENCIES.filter(c => c !== fromCur).map(c => (
                      <div key={c} onClick={() => { setToCur(c); setConverted(null) }} style={{
                        padding: '14px 10px', background: toCur === c ? 'rgba(232,98,58,0.08)' : '#f9f9f9',
                        border: `1.5px solid ${toCur === c ? '#e8623a' : 'var(--border)'}`,
                        borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px', fontWeight: '600' }}>{c}</p>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: toCur === c ? '#e8623a' : 'var(--text-dark)' }}>
                          {rates[c]?.toFixed(3)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SUPPORT ── */}
          {activeSection === 'support' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '20px' }}>🎧 Customer Support</h3>
              {[
                { icon: '❓', label: 'FAQ',         desc: 'Find answers to common questions',          action: () => toast.info('FAQ coming soon!') },
                { icon: '✉️', label: 'Contact Us',  desc: 'Email us at support@fintracker.com',        action: () => window.open('mailto:support@fintracker.com') },
                { icon: '🐛', label: 'Report a Bug', desc: 'Help us improve FinTracker',              action: () => toast.info('Bug report coming soon!') },
              ].map(item => (
                <div key={item.label} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '18px', borderRadius: '12px',
                  border: '1.5px solid var(--border)', marginBottom: '12px',
                  cursor: 'pointer', transition: 'all 0.2s', background: 'white'
                }}>
                  <span style={{ fontSize: '28px' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.label}</p>
                    <p style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '3px' }}>{item.desc}</p>
                  </div>
                  <span style={{ color: 'var(--text-light)', fontSize: '18px' }}>›</span>
                </div>
              ))}
            </div>
          )}

          {/* ── ABOUT ── */}
          {activeSection === 'about' && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>ℹ️</span> About FinTracker
              </h3>
              
              {/* Brand Header */}
              <div style={{ textAlign: 'center', padding: '16px 0 24px', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                  <span style={{ color: 'var(--primary)' }}>Fin</span>
                  <span style={{ color: '#e8623a', fontWeight: '800' }}>Tracker</span>
                </span>
                <p style={{ color: 'var(--text-mid)', fontSize: '14px', marginTop: '6px', fontWeight: '500' }}>
                  Smart Personal Finance Management System
                </p>
                <div style={{
                  display: 'inline-block', marginTop: '10px',
                  background: 'rgba(45, 106, 79, 0.1)', border: '1px solid rgba(45, 106, 79, 0.25)',
                  borderRadius: '20px', padding: '4px 16px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700'
                }}>
                  Academic Release v1.0.0
                </div>
              </div>

              {/* Project Description */}
              <div style={{ margin: '24px 0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '8px' }}>Project Overview</h4>
                <p style={{ color: 'var(--text-mid)', fontSize: '13px', lineHeight: '1.6' }}>
                  FinTracker is an all-in-one personal finance platform designed to simplify expense tracking, budgeting, and financial planning. Built with a focus on ease-of-use and visual clarity, it empowers individuals to monitor their spending patterns, set smart budgets, split bills seamlessly with friends, and achieve long-term saving goals.
                </p>
              </div>

              {/* Core Modules Grid */}
              <div style={{ margin: '24px 0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '12px' }}>Core Features & Modules</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {[
                    { icon: '📊', title: 'Interactive Analytics', desc: 'Real-time charts and reports visualizing where your money goes.' },
                    { icon: '💰', title: 'Budget Planner', desc: 'Category-wise monthly spending limits with instant visual alerts.' },
                    { icon: '🎯', title: 'Goal Tracking', desc: 'Set target saving checkpoints and monitor your real-time progress.' },
                    { icon: '🤝', title: 'Bill Splitter', desc: 'Split bills among friends with a clear record of pending dues.' },
                    { icon: '🔄', title: 'Recurring Expenses', desc: 'Never miss an EMI or subscription renewal with active reminders.' },
                    { icon: '🛡️', title: 'Admin Control Center', desc: 'Centralized admin panel to manage users, data, and system health.' }
                  ].map((feat) => (
                    <div key={feat.title} style={{
                      padding: '12px 14px',
                      background: 'rgba(0, 0, 0, 0.01)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '16px' }}>{feat.icon}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dark)' }}>{feat.title}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-light)', lineHeight: '1.4' }}>{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>



              {/* Bottom Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {['Privacy Policy', 'Terms of Service'].map(l => (
                  <button key={l} onClick={() => toast.info(`${l} coming soon!`)} style={{
                    flex: 1, padding: '10px', border: '1.5px solid var(--border)',
                    borderRadius: '8px', background: 'var(--white)', cursor: 'pointer',
                    fontSize: '12px', fontWeight: '600', color: 'var(--text-mid)',
                    transition: 'var(--transition)'
                  }}>{l}</button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}