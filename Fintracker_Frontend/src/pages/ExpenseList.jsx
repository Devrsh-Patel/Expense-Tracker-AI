/* eslint-disable */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useExpense } from '../context/ExpenseContext'
import { formatCurrency, getStoredCurrency, CURRENCY_CONFIG } from '../utils/currency'
import { API_HOST } from '../services/api'


export default function ExpenseList() {
  const symbol = CURRENCY_CONFIG[getStoredCurrency()]?.symbol || '₹'
  const { expenses, fetchExpenses, deleteExpense, editExpense, CATEGORIES, customCategories } = useExpense()

  const navigate = useNavigate()
  const [search, setSearch]       = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterPay, setFilterPay] = useState('')
  const [fromDate, setFromDate]   = useState('')
  const [toDate, setToDate]       = useState('')
  const [viewReceipt, setViewReceipt]         = useState(null)
  const [editExpenseData, setEditExpenseData] = useState(null)
  const [editLoading, setEditLoading]         = useState(false)

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

  const handleEditOpen = (exp) => {
    setEditExpenseData({
      id:             exp.id,
      description:    exp.description || '',
      category:       exp.category || '',
      amount:         '',
      payment_mode:   exp.payment_mode || '',
      date:           exp.date || '',
      spent_at:       exp.spent_at || '',
      receipt_url:    exp.receipt_url || null,
      manual_receipt: exp.manual_receipt || '',
    })
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    if (!editExpenseData.description.trim()) { toast.warning('Description is required'); return }
    if (!editExpenseData.amount || Number(editExpenseData.amount) <= 0) { toast.warning('Enter valid amount'); return }
    if (!editExpenseData.category) { toast.warning('Select a category'); return }
    if (!editExpenseData.payment_mode) { toast.warning('Select payment mode'); return }

    setEditLoading(true)
    try {
      await editExpense(editExpenseData.id, {
        description:  editExpenseData.description,
        category:     Number(editExpenseData.category),
        amount:       Number(editExpenseData.amount),
        payment_mode: editExpenseData.payment_mode,
        date:         editExpenseData.date,
        spent_at:     editExpenseData.spent_at,
      })
      toast.success('Expense updated!')
      setEditExpenseData(null)
    } catch {
      toast.error('Failed to update expense')
    } finally {
      setEditLoading(false)
    }
  }

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description?.toLowerCase().includes(search.toLowerCase()) || e.spent_at?.toLowerCase().includes(search.toLowerCase())
    const matchCat    = !filterCat || e.category_name === CATEGORIES.find(c => c.id === Number(filterCat))?.name
    const matchPay    = !filterPay || e.payment_mode === filterPay
    const matchFrom   = !fromDate || e.date >= fromDate
    const matchTo     = !toDate   || e.date <= toDate
    return matchSearch && matchCat && matchPay && matchFrom && matchTo
  })

  const totalFiltered = filtered.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)

  return (
    <div className="page-container">

      {/* Receipt Modal */}
      {viewReceipt && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setViewReceipt(null)}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            maxWidth: '500px', width: '100%', maxHeight: '80vh', overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>Receipt / Bill</h3>
              <button onClick={() => setViewReceipt(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {viewReceipt.type === 'file' && (
              <div style={{ textAlign: 'center' }}>
                {viewReceipt.url.match(/\.(jpg|jpeg|png)$/i) ? (
                  <img src={viewReceipt.url} alt="receipt" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                ) : (
                  <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <p style={{ fontSize: '40px' }}>📄</p>
                    <a href={viewReceipt.url} target="_blank" rel="noreferrer" style={{
                      display: 'inline-block', marginTop: '12px', background: 'var(--primary)',
                      color: 'white', padding: '8px 20px', borderRadius: '8px',
                      textDecoration: 'none', fontWeight: '600'
                    }}>Open PDF</a>
                  </div>
                )}
              </div>
            )}
            {viewReceipt.type === 'manual' && (
              <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>Manual Receipt Details:</p>
                <p style={{ fontSize: '14px', color: 'var(--text-dark)', lineHeight: '1.6' }}>{viewReceipt.text}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editExpenseData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setEditExpenseData(null)}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '28px',
            maxWidth: '520px', width: '100%', maxHeight: '90vh', overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700' }}>Edit Expense</h3>
              <button onClick={() => setEditExpenseData(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-light)' }}>✕</button>
            </div>

            <form onSubmit={handleEditSave}>

              {/* Description */}
              <div className="form-group">
                <label>Expense Title</label>
                <input
                  type="text"
                  value={editExpenseData.description}
                  onChange={e => setEditExpenseData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Enter expense title"
                  maxLength={150}
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editExpenseData.category}
                  onChange={e => setEditExpenseData(p => ({ ...p, category: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                  {customCategories?.length > 0 && (
                    <>
                      <option disabled>── My Categories ──</option>
                      {customCategories.map(c => (
                        <option key={`custom_${c.id}`} value={`custom_${c.id}`}>📌 {c.name}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Amount */}
              <div className="form-group">
                <label>Amount ({symbol})</label>

                <input
                  type="number"
                  value={editExpenseData.amount}
                  onChange={e => setEditExpenseData(p => ({ ...p, amount: e.target.value }))}
                  min="0.01" step="0.01"
                  placeholder="Enter amount"
                  style={{ fontSize: '16px', fontWeight: '600' }}
                />
              </div>

              {/* Payment Mode */}
              <div className="form-group">
                <label>Payment Mode</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet', 'Other'].map(mode => (
                    <button key={mode} type="button"
                      onClick={() => setEditExpenseData(p => ({ ...p, payment_mode: mode }))}
                      style={{
                        padding: '7px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                        border: `2px solid ${editExpenseData.payment_mode === mode ? 'var(--primary)' : 'var(--border)'}`,
                        background: editExpenseData.payment_mode === mode ? 'rgba(45,106,79,0.08)' : 'white',
                        color: editExpenseData.payment_mode === mode ? 'var(--primary)' : 'var(--text-mid)',
                        fontWeight: editExpenseData.payment_mode === mode ? '600' : '400'
                      }}>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={editExpenseData.date}
                  onChange={e => setEditExpenseData(p => ({ ...p, date: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Spent At */}
              <div className="form-group">
                <label>Where was this spent? <span style={{ color: 'var(--text-light)', fontWeight: '400' }}>(Optional)</span></label>
                <input
                  type="text"
                  value={editExpenseData.spent_at}
                  onChange={e => setEditExpenseData(p => ({ ...p, spent_at: e.target.value }))}
                  placeholder="Shop name, app, or place"
                  maxLength={100}
                />
              </div>

              {/* Receipt */}
              {editExpenseData.receipt_url && (
                <div className="form-group">
                  <label>Existing Receipt</label>
                  <button type="button"
                    onClick={() => setViewReceipt({ type: 'file', url: `${API_HOST}${editExpenseData.receipt_url}` })}
                    style={{
                      background: '#f0faf4', border: '1px solid #c6f0d8',
                      color: 'var(--primary)', padding: '8px 16px',
                      borderRadius: '8px', fontSize: '13px',
                      cursor: 'pointer', fontWeight: '600'
                    }}>
                    📎 View Existing Receipt
                  </button>
                </div>
              )}

              {editExpenseData.manual_receipt && (
                <div className="form-group">
                  <label>Manual Receipt Notes</label>
                  <textarea
                    value={editExpenseData.manual_receipt}
                    onChange={e => setEditExpenseData(p => ({ ...p, manual_receipt: e.target.value }))}
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--border)', borderRadius: '8px',
                      fontSize: '14px', resize: 'vertical', fontFamily: 'var(--font-body)'
                    }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditExpenseData(null)} style={{
                  flex: 1, padding: '12px', border: '2px solid var(--border)',
                  borderRadius: '10px', background: 'white',
                  color: 'var(--text-mid)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} style={{
                  flex: 2, padding: '12px',
                  background: editLoading ? '#aaa' : 'var(--primary)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '600',
                  cursor: editLoading ? 'not-allowed' : 'pointer'
                }}>
                  {editLoading ? 'Updating...' : 'Update Expense'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Page Header */}
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
          <input type="text" placeholder="🔍 Search expenses..."
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
          <button onClick={() => navigate('/add-expense')} style={{
            marginTop: '16px', background: 'var(--primary)', color: 'white',
            border: 'none', padding: '10px 24px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: '600'
          }}>
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
          {filtered.map(exp => (
            <div key={exp.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>

                  {/* Category Box */}
                  <div style={{
                    minWidth: '70px', height: '32px', borderRadius: '8px',
                    background: (exp.category_color || '#eee') + '33',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: '11px', fontWeight: '700',
                    color: exp.category_color || '#666', padding: '0 8px', whiteSpace: 'nowrap'
                  }}>
                    {exp.category_name || 'Expense'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{exp.description}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                      {exp.payment_mode}
                      {exp.spent_at ? ` · ${exp.spent_at}` : ''}
                      {` · ${exp.date}`}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {exp.receipt_url && (
                        <button onClick={() => setViewReceipt({ type: 'file', url: `${API_HOST}${exp.receipt_url}` })} style={{
                          background: '#f0faf4', border: '1px solid #c6f0d8',
                          color: 'var(--primary)', padding: '3px 10px',
                          borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600'
                        }}>
                          📎 View Receipt
                        </button>
                      )}
                      {exp.manual_receipt && (
                        <button onClick={() => setViewReceipt({ type: 'manual', text: exp.manual_receipt })} style={{
                          background: '#fff8e7', border: '1px solid #ffd68a',
                          color: '#b7791f', padding: '3px 10px',
                          borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600'
                        }}>
                          📝 View Notes
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexShrink: 0 }}>
                  <p style={{ fontWeight: '700', color: '#e74c3c', fontSize: '15px', whiteSpace: 'nowrap' }}>
                    -{formatCurrency(exp.amount)}
                  </p>
                  <button onClick={() => handleEditOpen(exp)} style={{
                    background: '#f0f8ff', border: '1px solid #b3d4f5',
                    color: '#2980b9', padding: '6px 12px',
                    borderRadius: '8px', fontSize: '12px',
                    cursor: 'pointer', fontWeight: '600'
                  }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(exp.id)} style={{
                    background: '#fff0f0', border: '1px solid #ffb3b3',
                    color: '#e74c3c', padding: '6px 12px',
                    borderRadius: '8px', fontSize: '12px',
                    cursor: 'pointer', fontWeight: '600'
                  }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}