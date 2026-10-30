/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
const recurringAPI = {
  getAll: ()     => api.get('/expenses/recurring/'),
  create: (data) => api.post('/expenses/recurring/', data),
  delete: (id)   => api.delete(`/expenses/recurring/${id}/`),
}
import { useExpense } from '../context/ExpenseContext'
import { formatCurrency } from '../utils/currency'

export default function RecurringExpenses() {
  const { CATEGORIES } = useExpense()
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm] = useState({
    title: '', category: '', amount: '',
    frequency: 'monthly', next_due: '', payment_mode: 'UPI'
  })

  useEffect(() => { fetchRecurring() }, [])

  const fetchRecurring = async () => {
    try {
      setLoading(true)
      const res = await recurringAPI.getAll()
      setRecurring(res.data)
    } catch {
      toast.error('Failed to load recurring expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.amount || !form.next_due) { toast.warning('Please fill all fields'); return }
    setSaving(true)
    try {
      await recurringAPI.create({
        ...form,
        category: Number(form.category),
        amount:   Number(form.amount)
      })
      toast.success('Recurring expense added!')
      setForm({ title: '', category: '', amount: '', frequency: 'monthly', next_due: '', payment_mode: 'UPI' })
      setShowForm(false)
      fetchRecurring()
    } catch {
      toast.error('Failed to add recurring expense')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await recurringAPI.delete(id)
      toast.success('Removed!')
      fetchRecurring()
    } catch {
      toast.error('Failed to remove')
    }
  }

  const totalMonthly = recurring.reduce((sum, r) => {
    const amount = parseFloat(r.amount || 0)
    if (r.frequency === 'monthly') return sum + amount
    if (r.frequency === 'yearly')  return sum + (amount / 12)
    if (r.frequency === 'weekly')  return sum + (amount * 4)
    if (r.frequency === 'daily')   return sum + (amount * 30)
    return sum
  }, 0)

  const dueSoon = recurring.filter(r => {
    const days = Math.ceil((new Date(r.next_due) - new Date()) / (1000 * 60 * 60 * 24))
    return days <= 7 && days >= 0
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 className="page-title">Recurring Expenses</h1>
          <p className="page-subtitle">Track your regular bills and subscriptions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'var(--primary)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: '10px', fontWeight: '600',
          fontSize: '14px', cursor: 'pointer'
        }}>
          + Add Recurring
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Monthly Total</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f39c12' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Active Bills</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#f39c12' }}>{recurring.length}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #e74c3c' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Due This Week</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#e74c3c' }}>{dueSoon.length}</p>
        </div>
      </div>

      {/* Due Soon Alert */}
      {dueSoon.length > 0 && (
        <div style={{ background: '#fff8e7', border: '1px solid #ffd68a', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ fontWeight: '600', color: '#b7791f', marginBottom: '8px' }}>⚠️ Due This Week</p>
          {dueSoon.map(r => (
            <p key={r.id} style={{ fontSize: '13px', color: '#b7791f' }}>
              • {r.title} — {formatCurrency(r.amount)} due on {r.next_due}
            </p>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Add Recurring Expense</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Netflix, Rent, EMI..." />
              </div>
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} min="1" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Next Due Date *</label>
                <input type="date" value={form.next_due} onChange={e => setForm(p => ({ ...p, next_due: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select value={form.payment_mode} onChange={e => setForm(p => ({ ...p, payment_mode: e.target.value }))}>
                  {['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet', 'Other'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', border: '2px solid var(--border)', borderRadius: '10px', background: 'white', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', background: saving ? '#aaa' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                {saving ? 'Adding...' : 'Add Recurring'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading...</p>
      ) : recurring.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px' }}>🔄</p>
          <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No recurring expenses yet</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop: '16px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Add First Bill
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recurring.map(r => {
            const daysLeft = Math.ceil((new Date(r.next_due) - new Date()) / (1000 * 60 * 60 * 24))
            return (
              <div key={r.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: (r.category_color || '#eee') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {CATEGORIES.find(c => c.id === r.category)?.icon || '🔄'}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600' }}>{r.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      {r.frequency} · {r.payment_mode} · Next: {r.next_due}
                    </p>
                    <p style={{ fontSize: '12px', color: daysLeft <= 3 ? '#e74c3c' : daysLeft <= 7 ? '#f39c12' : 'var(--text-light)', fontWeight: daysLeft <= 7 ? '600' : '400' }}>
                      {daysLeft === 0 ? '⚠️ Due today!' : daysLeft < 0 ? `⚠️ Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days left`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <p style={{ fontWeight: '700', color: '#e74c3c', fontSize: '16px' }}>{formatCurrency(r.amount)}</p>
                  <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}