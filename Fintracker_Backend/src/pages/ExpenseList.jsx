/* eslint-disable */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useExpense } from '../context/ExpenseContext'
import { formatCurrency } from '../utils/currency'

export default function ExpenseList() {
  const { expenses, fetchExpenses, deleteExpense, CATEGORIES } = useExpense()
  const navigate = useNavigate()
  const [search, setSearch]       = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterPay, setFilterPay] = useState('')
  const [fromDate, setFromDate]   = useState('')
  const [toDate, setToDate]       = useState('')
  const [loading, setLoading]     = useState(false)

  useEffect(() => { fetchExpenses() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await deleteExpense(id)
      toast.success('Expense deleted!')
    } catch {
      toast.error('Failed to delete expense')
    }
  }

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description?.toLowerCase().includes(search.toLowerCase()) || e.spent_at?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || e.category_name === CATEGORIES.find(c => c.id === Number(filterCat))?.name
    const matchPay    = !filterPay || e.payment_mode === filterPay
    const matchFrom   = !fromDate || e.date >= fromDate
    const matchTo     = !toDate   || e.date <= toDate
    return matchSearch && matchCat && matchPay && matchFrom && matchTo
  })

  const totalFiltered = filtered.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 className="page-title">My Expenses</h1>
          <p className="page-subtitle">{filtered.length} transactions · {formatCurrency(totalFiltered)}</p>
        </div>
        <button onClick={() => navigate('/add-expense')} style={{
          background: 'var(--primary)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: '10px', fontWeight: '600',
          fontSize: '14px', cursor: 'pointer'
        }}>
          + Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <input
            type="text" placeholder="🔍 Search expenses..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
          />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={filterPay} onChange={e => setFilterPay(e.target.value)}
            style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}>
            <option value="">All Payment Modes</option>
            {['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet', 'Other'].map(m => <option key={m}>{m}</option>)}
          </select>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }} />
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }} />
          <button onClick={() => { setSearch(''); setFilterCat(''); setFilterPay(''); setFromDate(''); setToDate('') }}
            style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px', background: 'white', cursor: 'pointer', fontWeight: '600' }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Expense List */}
      {expenses.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px' }}>💸</p>
          <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No expenses yet</p>
          <button onClick={() => navigate('/add-expense')} style={{ marginTop: '16px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Add First Expense
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px' }}>🔍</p>
          <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No expenses match your filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(exp => {
            const cat = CATEGORIES.find(c => c.id === exp.category)
            return (
              <div key={exp.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: (exp.category_color || '#eee') + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {cat?.icon || '💰'}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{exp.description}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                      {exp.category_name} · {exp.payment_mode}
                      {exp.spent_at ? ` · ${exp.spent_at}` : ''}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '1px' }}>{exp.date}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <p style={{ fontWeight: '700', color: '#e74c3c', fontSize: '15px' }}>-{formatCurrency(exp.amount)}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => navigate(`/add-expense?edit=${exp.id}`)} style={{ background: '#f0faf4', border: '1px solid #c6f0d8', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(exp.id)} style={{ background: '#fff0f0', border: '1px solid #ffb3b3', color: '#e74c3c', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}