/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
const budgetAPI = {
  getAll: (params) => api.get('/expenses/budgets/', { params }),
  save:   (data)   => api.post('/expenses/budgets/', data),
  delete: (id)     => api.delete(`/expenses/budgets/${id}/`),
}
import { useExpense } from '../context/ExpenseContext'
import { formatCurrency } from '../utils/currency'

export default function BudgetPlanner() {
  const { CATEGORIES } = useExpense()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [form, setForm] = useState({ category: '', amount: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchBudgets() }, [selectedMonth])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const res = await budgetAPI.getAll({ month: selectedMonth })
      setBudgets(res.data)
    } catch {
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.category || !form.amount) { toast.warning('Please fill all fields'); return }
    setSaving(true)
    try {
      await budgetAPI.save({
        category: Number(form.category),
        amount:   Number(form.amount),
        month:    selectedMonth
      })
      toast.success('Budget saved!')
      setForm({ category: '', amount: '' })
      setShowForm(false)
      fetchBudgets()
    } catch {
      toast.error('Failed to save budget')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await budgetAPI.delete(id)
      toast.success('Budget removed!')
      fetchBudgets()
    } catch {
      toast.error('Failed to delete budget')
    }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
  const totalSpent  = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0)

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 className="page-title">Budget Planner</h1>
          <p className="page-subtitle">Set and track your monthly spending limits</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'var(--primary)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: '10px', fontWeight: '600',
          fontSize: '14px', cursor: 'pointer'
        }}>
          + Set Budget
        </button>
      </div>

      {/* Month Selector */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px' }}
        />
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Total Budget</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(totalBudget)}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #e74c3c' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Total Spent</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#e74c3c' }}>{formatCurrency(totalSpent)}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #27ae60' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Remaining</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#27ae60' }}>{formatCurrency(totalBudget - totalSpent)}</p>
        </div>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Set Category Budget</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Budget Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} min="1" placeholder="0.00" />
              </div>
              <button type="submit" disabled={saving} style={{
                background: 'var(--primary)', color: 'white', border: 'none',
                padding: '12px 20px', borderRadius: '10px', fontWeight: '600',
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
                {saving ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      {loading ? (
        <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>Loading...</p>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px' }}>💰</p>
          <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No budgets set for this month</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop: '16px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Set First Budget
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {budgets.map(budget => (
            <div key={budget.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: budget.category_color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {CATEGORIES.find(c => c.id === budget.category)?.icon || '💰'}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600' }}>{budget.category_name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      {formatCurrency(budget.spent_amount)} of {formatCurrency(budget.amount)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: '700',
                    color: budget.percentage > 90 ? '#e74c3c' : budget.percentage > 70 ? '#f39c12' : '#27ae60'
                  }}>
                    {budget.percentage}%
                  </span>
                  <button onClick={() => handleDelete(budget.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
                </div>
              </div>
              <div style={{ background: '#f0f0f0', borderRadius: '6px', height: '8px' }}>
                <div style={{
                  width: `${Math.min(budget.percentage, 100)}%`,
                  background: budget.percentage > 90 ? '#e74c3c' : budget.percentage > 70 ? '#f39c12' : '#27ae60',
                  height: '100%', borderRadius: '6px', transition: 'width 0.5s'
                }} />
              </div>
              {budget.percentage > 90 && (
                <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '6px' }}>⚠️ Budget almost exceeded!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}