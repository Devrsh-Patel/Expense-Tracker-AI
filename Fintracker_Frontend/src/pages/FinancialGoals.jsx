/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
const goalAPI = {
  getAll: ()         => api.get('/expenses/goals/'),
  create: (data)     => api.post('/expenses/goals/', data),
  update: (id, data) => api.put(`/expenses/goals/${id}/`, data),
  delete: (id)       => api.delete(`/expenses/goals/${id}/`),
}
import { formatCurrency, getStoredCurrency, CURRENCY_CONFIG } from '../utils/currency'
const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '💍', '🎓', '💰', '🏋️', '🎸', '🌴']

export default function FinancialGoals() {
  const symbol = CURRENCY_CONFIG[getStoredCurrency()]?.symbol || '₹'
  const [goals, setGoals] = useState([])

  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updateGoal, setUpdateGoal] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', target_amount: '',
    saved_amount: '0', deadline: '', icon: '🎯'
  })

  // State for Add Savings modal
  const [savingsModalGoal, setSavingsModalGoal] = useState(null)
  const [savingsAmount, setSavingsAmount] = useState('')

  useEffect(() => { fetchGoals() }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const res = await goalAPI.getAll()
      setGoals(res.data)
    } catch {
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.target_amount) { toast.warning('Please fill required fields'); return }
    setSaving(true)
    try {
      const target = parseFloat(form.target_amount)
      const saved = parseFloat(form.saved_amount || 0)
      const status = saved >= target ? 'completed' : 'active'

      const payload = {
        ...form,
        status: status,
        saved_amount: Math.min(saved, target)
      }

      if (updateGoal) {
        await goalAPI.update(updateGoal.id, payload)
        toast.success('Goal updated!')
      } else {
        await goalAPI.create(payload)
        toast.success('Goal created!')
      }
      setForm({ title: '', description: '', target_amount: '', saved_amount: '0', deadline: '', icon: '🎯' })
      setShowForm(false)
      setUpdateGoal(null)
      fetchGoals()
    } catch {
      toast.error('Failed to save goal')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this financial goal?')) return
    try {
      await goalAPI.delete(id)
      toast.success('Goal deleted!')
      fetchGoals()
    } catch {
      toast.error('Failed to delete goal')
    }
  }

  const handleEditOpen = (goal) => {
    setUpdateGoal(goal)
    setForm({
      title: goal.title,
      description: goal.description || '',
      target_amount: goal.target_amount,
      saved_amount: goal.saved_amount,
      deadline: goal.deadline || '',
      icon: goal.icon || '🎯'
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddSavings = (goal) => {
    setSavingsModalGoal(goal)
    setSavingsAmount('')
  }

  const handleSavingsSubmit = async (e) => {
    e.preventDefault()
    if (!savingsAmount || isNaN(savingsAmount) || parseFloat(savingsAmount) <= 0) {
      toast.warning('Please enter a valid savings amount')
      return
    }
    try {
      const amountToAdd = parseFloat(savingsAmount)
      const newSaved = parseFloat(savingsModalGoal.saved_amount) + amountToAdd
      const target = parseFloat(savingsModalGoal.target_amount)

      await goalAPI.update(savingsModalGoal.id, {
        saved_amount: Math.min(newSaved, target),
        status: newSaved >= target ? 'completed' : 'active'
      })

      toast.success('Savings added!')
      setSavingsModalGoal(null)
      setSavingsAmount('')
      fetchGoals()
    } catch {
      toast.error('Failed to update savings')
    }
  }

  const activeGoals    = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 className="page-title">Financial Goals</h1>
          <p className="page-subtitle">Set and track your savings goals</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setUpdateGoal(null) }} style={{
          background: 'var(--primary)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: '10px', fontWeight: '600',
          fontSize: '14px', cursor: 'pointer'
        }}>
          + New Goal
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Active Goals</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>{activeGoals.length}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #27ae60' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Completed</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>{completedGoals.length}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f39c12' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Total Saved</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#f39c12' }}>
            {formatCurrency(goals.reduce((s, g) => s + parseFloat(g.saved_amount || 0), 0))}
          </p>
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
            {updateGoal ? 'Update Goal' : 'Create New Goal'}
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Icon Picker */}
            <div className="form-group">
              <label>Choose Icon</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {GOAL_ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setForm(p => ({ ...p, icon }))}
                    style={{
                      width: '40px', height: '40px', fontSize: '20px', borderRadius: '8px',
                      border: `2px solid ${form.icon === icon ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.icon === icon ? 'rgba(45,106,79,0.1)' : 'white',
                      cursor: 'pointer'
                    }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Goal Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Buy a laptop" />
              </div>
              <div className="form-group">
                <label>Target Amount ({symbol}) *</label>
                <input type="number" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} min="1" placeholder="50000" />
              </div>
              <div className="form-group">
                <label>Already Saved ({symbol})</label>
                <input type="number" value={form.saved_amount} onChange={e => setForm(p => ({ ...p, saved_amount: e.target.value }))} min="0" placeholder="0" />
              </div>
              <div className="form-group">
                <label>Target Date</label>
                <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Why this goal matters to you" />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => { setShowForm(false); setUpdateGoal(null) }} style={{ flex: 1, padding: '12px', border: '2px solid var(--border)', borderRadius: '10px', background: 'white', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', background: saving ? '#aaa' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                {saving ? 'Saving...' : updateGoal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading...</p>
      ) : goals.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px' }}>🎯</p>
          <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No goals yet. Set your first financial goal!</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop: '16px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Create Goal
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {goals.map(goal => (
            <div key={goal.id} className="card" style={{ padding: '20px', opacity: goal.status === 'completed' ? 0.8 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(45,106,79,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {goal.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>{goal.title}</p>
                      {goal.status === 'completed' && <span style={{ background: '#27ae60', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>Completed!</span>}
                    </div>
                    {goal.description && <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>{goal.description}</p>}
                    {goal.deadline && (
                      <p style={{ fontSize: '12px', color: goal.days_remaining < 30 ? '#e74c3c' : 'var(--text-light)', marginTop: '2px' }}>
                        {goal.days_remaining > 0 ? `${goal.days_remaining} days remaining` : 'Deadline passed'}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {goal.status === 'active' && (
                    <button onClick={() => handleAddSavings(goal)} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      + Add Savings
                    </button>
                  )}
                  <button onClick={() => handleEditOpen(goal)} style={{ background: 'none', border: 'none', color: '#f39c12', cursor: 'pointer', fontSize: '16px' }} title="Edit Goal">✏️</button>
                  <button onClick={() => handleDelete(goal.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }} title="Delete Goal">🗑️</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                  Saved: {formatCurrency(goal.saved_amount)}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>
                  {goal.progress_percentage}% of {formatCurrency(goal.target_amount)}
                </span>
              </div>
              <div style={{ background: '#f0f0f0', borderRadius: '6px', height: '10px' }}>
                <div style={{
                  width: `${Math.min(goal.progress_percentage, 100)}%`,
                  background: goal.status === 'completed' ? '#27ae60' : 'var(--primary)',
                  height: '100%', borderRadius: '6px', transition: 'width 0.5s'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Savings Modal */}
      {savingsModalGoal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '28px', background: 'var(--white)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '16px' }}>
              💰 Add Savings to {savingsModalGoal.title}
            </h3>
            
            <div style={{ background: 'var(--bg)', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>
                <span>Current Saved:</span>
                <span>Target:</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>
                <span>{formatCurrency(savingsModalGoal.saved_amount)}</span>
                <span>{formatCurrency(savingsModalGoal.target_amount)}</span>
              </div>
            </div>

            <form onSubmit={handleSavingsSubmit}>
              <div className="form-group">
                <label>Amount to Add ({symbol}) *</label>
                <input
                  type="number"
                  value={savingsAmount}
                  onChange={e => setSavingsAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  min="1"
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => { setSavingsModalGoal(null); setSavingsAmount('') }}
                  style={{
                    flex: 1, padding: '12px', border: '1.5px solid var(--border)',
                    borderRadius: '10px', background: 'var(--white)', cursor: 'pointer',
                    fontWeight: '600', color: 'var(--text-mid)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2, padding: '12px', background: 'var(--primary)',
                    color: 'white', border: 'none', borderRadius: '10px',
                    cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  Save Savings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}