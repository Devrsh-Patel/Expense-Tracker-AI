/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import { useExpense } from '../context/ExpenseContext'

const budgetAPI = {
  getAll:  (params)     => api.get('/expenses/budgets/', { params }),
  save:    (data)       => api.post('/expenses/budgets/', data),
  update:  (id, data)   => api.put(`/expenses/budgets/${id}/`, data),
  delete:  (id)         => api.delete(`/expenses/budgets/${id}/`),
}
import { formatCurrency, getStoredCurrency, CURRENCY_CONFIG } from '../utils/currency'
export default function BudgetPlanner() {
  const symbol = CURRENCY_CONFIG[getStoredCurrency()]?.symbol || '₹'
  const { CATEGORIES, customCategories } = useExpense()

  const [budgets, setBudgets]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [form, setForm]                   = useState({ category: '', amount: '', isCustom: false })
  const [errors, setErrors]               = useState({})
  const [showForm, setShowForm]           = useState(false)
  const [categoryType, setCategoryType]   = useState('default')
  const [editBudget, setEditBudget]       = useState(null)
  const [hoveredId, setHoveredId]         = useState(null)

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

  const validate = () => {
    const e = {}
    if (!editBudget && !form.category)            e.category = 'Please select a category'
    if (!form.amount || Number(form.amount) <= 0) e.amount   = 'Enter a valid budget amount'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    try {
      if (editBudget) {
        await budgetAPI.update(editBudget.id, {
          amount: Number(form.amount),
          month:  selectedMonth
        })
        toast.success('Budget updated successfully!')
      } else {
        await budgetAPI.save({
          category:           form.isCustom ? null : Number(form.category),
          custom_category_id: form.isCustom ? Number(form.category) : null,
          amount:             Number(form.amount),
          month:              selectedMonth
        })
        toast.success('Budget saved successfully!')
      }
      setForm({ category: '', amount: '', isCustom: false })
      setErrors({})
      setShowForm(false)
      setEditBudget(null)
      fetchBudgets()
    } catch {
      toast.error('Failed to save budget')
    } finally {
      setSaving(false)
    }
  }

  const handleEditOpen = (budget) => {
    setEditBudget(budget)
    setForm({
      category: budget.category || '',
      amount:   '',
      isCustom: !!budget.custom_category
    })
    setErrors({})
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    try {
      await budgetAPI.delete(id)
      toast.success('Budget removed!')
      fetchBudgets()
    } catch {
      toast.error('Failed to delete budget')
    }
  }

  const getBarColor = (pct) => {
    if (pct >= 100) return '#e74c3c'
    if (pct >= 90)  return '#e74c3c'
    if (pct >= 70)  return '#f39c12'
    return '#27ae60'
  }

  const getBadgeStyle = (pct) => ({
    fontSize: '12px', fontWeight: '700',
    padding: '4px 10px', borderRadius: '20px',
    background: pct >= 90 ? '#ffeaea' : pct >= 70 ? '#fff8e7' : '#f0faf4',
    color: pct >= 90 ? '#e74c3c' : pct >= 70 ? '#f39c12' : '#27ae60'
  })

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
  const totalSpent  = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0)

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 className="page-title">Budget Planner</h1>
          <p className="page-subtitle">Set and track your monthly spending limits</p>
        </div>
        <button onClick={() => {
          setShowForm(!showForm)
          setEditBudget(null)
          setForm({ category: '', amount: '', isCustom: false })
          setErrors({})
        }} style={{
          background: showForm ? '#e74c3c' : 'var(--primary)',
          color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: '10px', fontWeight: '600',
          fontSize: '14px', cursor: 'pointer'
        }}>
          {showForm ? '✕ Cancel' : '+ Set Budget'}
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
        {[
          { label: 'Total Budget',  value: totalBudget,              color: 'var(--primary)' },
          { label: 'Total Spent',   value: totalSpent,               color: '#e74c3c'        },
          { label: 'Remaining',     value: totalBudget - totalSpent, color: totalBudget - totalSpent >= 0 ? '#27ae60' : '#e74c3c' },
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: '20px', borderLeft: `4px solid ${card.color}` }}>
            <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>{card.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: card.color, marginTop: '4px' }}>
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Add/Edit Budget Form */}
      {showForm && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px', border: '2px solid var(--primary)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
            {editBudget ? '✏️ Edit Budget' : '➕ Set New Budget'}
          </h3>

          {/* Category Type Toggle - only for new budget */}
          {!editBudget && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button type="button" onClick={() => {
                setCategoryType('default')
                setForm(p => ({ ...p, category: '', isCustom: false }))
                setErrors(p => ({ ...p, category: '' }))
              }} style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${categoryType === 'default' ? 'var(--primary)' : 'var(--border)'}`,
                background: categoryType === 'default' ? 'rgba(45,106,79,0.08)' : 'white',
                color: categoryType === 'default' ? 'var(--primary)' : 'var(--text-mid)', fontWeight: '600'
              }}>
                📋 Default Categories
              </button>
              <button type="button" onClick={() => {
                setCategoryType('custom')
                setForm(p => ({ ...p, category: '', isCustom: true }))
                setErrors(p => ({ ...p, category: '' }))
              }} style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${categoryType === 'custom' ? 'var(--primary)' : 'var(--border)'}`,
                background: categoryType === 'custom' ? 'rgba(45,106,79,0.08)' : 'white',
                color: categoryType === 'custom' ? 'var(--primary)' : 'var(--text-mid)', fontWeight: '600'
              }}>
                ✨ My Categories
              </button>
            </div>
          )}

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

              {/* Category */}
              <div className="form-group" style={{ margin: 0 }}>
                <label>Category</label>
                {editBudget ? (
                  <input
                    type="text"
                    value={editBudget.category_name || editBudget.custom_category_name || 'Unknown'}
                    disabled
                    style={{ background: '#f9f9f9', color: 'var(--text-mid)', cursor: 'not-allowed' }}
                  />
                ) : categoryType === 'default' ? (
                  <select
                    value={form.category}
                    onChange={e => { setForm(p => ({ ...p, category: e.target.value, isCustom: false })); setErrors(p => ({ ...p, category: '' })) }}
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={form.category}
                    onChange={e => { setForm(p => ({ ...p, category: e.target.value, isCustom: true })); setErrors(p => ({ ...p, category: '' })) }}
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="">Select custom category</option>
                    {customCategories?.length === 0 ? (
                      <option disabled>No custom categories yet</option>
                    ) : (
                      customCategories?.map(c => (
                        <option key={c.id} value={c.id}>📌 {c.name}</option>
                      ))
                    )}
                  </select>
                )}
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>

              {/* Amount */}
              <div className="form-group" style={{ margin: 0 }}>
                <label>
                  {editBudget ? `New Budget Amount (Current: ${formatCurrency(editBudget.amount)})` : `Budget Amount (${symbol})`}
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setErrors(p => ({ ...p, amount: '' })) }}
                  min="1"
                  placeholder={editBudget ? `Current: ${formatCurrency(editBudget.amount)}` : 'Enter budget amount'}
                  className={errors.amount ? 'error' : ''}
                  autoFocus={!!editBudget}
                />
                {errors.amount && <span className="error-text">{errors.amount}</span>}
              </div>

            </div>

            {categoryType === 'custom' && !editBudget && customCategories?.length === 0 && (
              <p style={{ fontSize: '13px', color: '#e74c3c', marginBottom: '12px' }}>
                ⚠️ No custom categories found. Add from Add Expense page first!
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={saving} style={{
                background: saving ? '#aaa' : 'var(--primary)', color: 'white', border: 'none',
                padding: '11px 28px', borderRadius: '10px', fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px'
              }}>
                {saving ? 'Saving...' : editBudget ? 'Update Budget' : 'Save Budget'}
              </button>
              <button type="button" onClick={() => {
                setEditBudget(null)
                setShowForm(false)
                setForm({ category: '', amount: '', isCustom: false })
                setErrors({})
              }} style={{
                background: 'white', color: 'var(--text-mid)',
                border: '2px solid var(--border)',
                padding: '11px 24px', borderRadius: '10px',
                fontWeight: '600', cursor: 'pointer', fontSize: '14px'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      {loading ? (
        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px' }}>💰</p>
          <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No budgets set for this month</p>
          <button onClick={() => setShowForm(true)} style={{
            marginTop: '16px', background: 'var(--primary)', color: 'white',
            border: 'none', padding: '10px 24px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: '600'
          }}>
            Set First Budget
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {budgets.map(budget => {
            const pct       = budget.percentage || 0
            const isHovered = hoveredId === budget.id
            return (
              <div
                key={budget.id}
                onMouseEnter={() => setHoveredId(budget.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: 'white', borderRadius: '14px', padding: '20px',
                  boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: (budget.category_color || '#6C757D') + '22',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
                    }}>
                      {budget.custom_category ? '📌' : CATEGORIES.find(c => c.id === budget.category)?.icon || '💰'}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '15px' }}>
                        {budget.category_name || budget.custom_category_name || 'Unknown'}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                        {formatCurrency(budget.spent_amount)} spent of {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={getBadgeStyle(pct)}>{pct}%</span>
                    <button onClick={() => handleEditOpen(budget)} style={{
                      background: isHovered ? '#e8f4fd' : '#f0f8ff',
                      border: '1.5px solid #b3d4f5', color: '#2980b9',
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                      cursor: 'pointer', fontWeight: '600',
                      opacity: isHovered ? 1 : 0.7, transition: 'all 0.2s'
                    }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(budget.id)} style={{
                      background: isHovered ? '#ffeaea' : '#fff0f0',
                      border: '1.5px solid #ffb3b3', color: '#e74c3c',
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                      cursor: 'pointer', fontWeight: '600',
                      opacity: isHovered ? 1 : 0.7, transition: 'all 0.2s'
                    }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ background: '#f0f0f0', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: `linear-gradient(90deg, ${getBarColor(pct)}bb, ${getBarColor(pct)})`,
                    height: '100%', borderRadius: '8px',
                    transition: 'width 0.6s ease',
                    boxShadow: `0 0 6px ${getBarColor(pct)}66`
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                    Spent: {formatCurrency(budget.spent_amount)}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                    Budget: {formatCurrency(budget.amount)}
                  </span>
                </div>

                {pct >= 100 && (
                  <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '8px', fontWeight: '700' }}>
                    🚨 Budget exceeded! Overspent by {formatCurrency(budget.spent_amount - budget.amount)}
                  </p>
                )}
                {pct >= 90 && pct < 100 && (
                  <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '8px' }}>
                    ⚠️ Almost at limit! Only {formatCurrency(budget.amount - budget.spent_amount)} remaining.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}