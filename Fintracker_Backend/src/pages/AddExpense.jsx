/* eslint-disable */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useExpense } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf']

export default function AddExpense() {
  const { addExpense, CATEGORIES } = useExpense()
  const { user } = useAuth()
  const navigate = useNavigate()

  const users = JSON.parse(localStorage.getItem('fintracker_users') || '[]')
  const currentUser = users.find(u => u.id === user?.id)
  const hasIncome = user?.income > 0

  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    payment_mode: '',
    description: '',
    spent_at: '',
    receipt_type: 'none'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [preview, setPreview] = useState(null)
  const [receiptConfirmed, setReceiptConfirmed] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.amount || Number(form.amount) <= 0) e.amount       = 'Enter a valid amount'
    if (!form.date)                               e.date         = 'Date is required'
    if (!form.category)                           e.category     = 'Select a category'
    if (!form.payment_mode)                       e.payment_mode = 'Select payment mode'
    if (!form.description.trim())                 e.description  = 'Add a short description'
    return e
  }

  const handleReceipt = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!receiptConfirmed) {
      toast.warning('Please confirm this is a valid bill or receipt first.')
      e.target.value = ''
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file. Only JPG, PNG or PDF bills allowed.')
      e.target.value = ''
      return
    }

    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error('Invalid file extension. Only .jpg .png .pdf allowed.')
      e.target.value = ''
      return
    }

    if (file.size < 10 * 1024) {
      toast.error('File is too small to be a valid receipt.')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum 5MB allowed.')
      e.target.value = ''
      return
    }

    setReceipt(file)
    setPreview(file.type !== 'application/pdf' ? URL.createObjectURL(file) : 'pdf')
    toast.success('Receipt uploaded successfully.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      await addExpense({
        amount:       Number(form.amount),
        date:         form.date,
        category:     Number(form.category),
        payment_mode: form.payment_mode,
        description:  form.description,
        spent_at:     form.spent_at || '',
        manual_receipt: form.manual_receipt || ''
      })
      toast.success('Expense added successfully.')
      navigate('/expenses')
    } catch (error) {
      toast.error('Failed to add expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const handleReceiptType = (key) => {
    setForm(p => ({ ...p, receipt_type: key }))
    setReceipt(null)
    setPreview(null)
    setReceiptConfirmed(false)
  }

  return (
    <div style={{ padding: '32px' }}>
      <h1 className="page-title">Add Expense</h1>
      <p className="page-subtitle">Record a new expense to your tracker</p>

      {!hasIncome && (
        <div style={{ background: '#fff8e7', border: '1px solid #ffd68a', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#b7791f' }}>
          You have not set your monthly income yet. Please go to Profile and set your income for better insights.
        </div>
      )}

      <div className="card fade-in" style={{ padding: '28px' }}>
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Amount (Rs.)</label>
            <input type="number" value={form.amount} onChange={set('amount')} min="0.01" step="0.01" className={errors.amount ? 'error' : ''} style={{ fontSize: '18px', fontWeight: '600' }} />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={set('date')} max={new Date().toISOString().split('T')[0]} className={errors.date ? 'error' : ''} />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={set('category')} className={errors.category ? 'error' : ''}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label>Payment Mode</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet', 'Other'].map(mode => (
                <button key={mode} type="button"
                  onClick={() => { setForm(p => ({ ...p, payment_mode: mode })); setErrors(p => ({ ...p, payment_mode: '' })) }}
                  style={{
                    padding: '8px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                    border: `2px solid ${form.payment_mode === mode ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.payment_mode === mode ? 'rgba(45,106,79,0.08)' : 'white',
                    color: form.payment_mode === mode ? 'var(--primary)' : 'var(--text-mid)',
                    fontWeight: form.payment_mode === mode ? '600' : '400'
                  }}>
                  {mode}
                </button>
              ))}
            </div>
            {errors.payment_mode && <span className="error-text">{errors.payment_mode}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <input type="text" value={form.description} onChange={set('description')} maxLength={150} className={errors.description ? 'error' : ''} />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Where was this spent? <span style={{ color: 'var(--text-light)', fontWeight: '400' }}>(Optional)</span></label>
            <input type="text" value={form.spent_at} onChange={set('spent_at')} maxLength={100} />
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Enter shop name, app, or place</span>
          </div>

          <div className="form-group">
            <label>Receipt / Bill</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              {[
                { key: 'none',   label: 'No Receipt'    },
                { key: 'upload', label: 'Upload File'   },
                { key: 'manual', label: 'Write Manually' }
              ].map(opt => (
                <button key={opt.key} type="button" onClick={() => handleReceiptType(opt.key)}
                  style={{
                    flex: 1, padding: '9px 8px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                    border: `2px solid ${form.receipt_type === opt.key ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.receipt_type === opt.key ? 'rgba(45,106,79,0.08)' : 'white',
                    color: form.receipt_type === opt.key ? 'var(--primary)' : 'var(--text-mid)',
                    fontWeight: form.receipt_type === opt.key ? '600' : '400'
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {form.receipt_type === 'upload' && (
              <div>
                <div style={{ background: '#fff8e7', border: '1px solid #ffd68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#b7791f' }}>Only upload actual bills, receipts or invoices.</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={receiptConfirmed} onChange={e => setReceiptConfirmed(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-mid)' }}>I confirm this is a valid bill or receipt</span>
                </label>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px',
                  border: `2px dashed ${receiptConfirmed ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '10px', cursor: receiptConfirmed ? 'pointer' : 'not-allowed',
                  background: receiptConfirmed ? 'rgba(45,106,79,0.04)' : '#f9f9f9',
                  opacity: receiptConfirmed ? 1 : 0.6
                }}>
                  {preview ? (
                    preview === 'pdf'
                      ? <p style={{ color: 'var(--primary)', fontSize: '14px' }}>PDF: {receipt?.name}</p>
                      : <img src={preview} alt="receipt" style={{ maxHeight: '100px', borderRadius: '6px' }} />
                  ) : (
                    <>
                      <p style={{ fontSize: '14px', color: 'var(--text-mid)', fontWeight: '500' }}>Click to upload receipt</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>JPG, PNG, PDF only · 10KB to 5MB</p>
                    </>
                  )}
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleReceipt} disabled={!receiptConfirmed} style={{ display: 'none' }} />
                </label>
                {receipt && (
                  <button type="button" onClick={() => { setReceipt(null); setPreview(null) }} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#e74c3c', fontSize: '13px', cursor: 'pointer' }}>
                    Remove file
                  </button>
                )}
              </div>
            )}

            {form.receipt_type === 'manual' && (
              <textarea
                placeholder="Write receipt details manually here..."
                value={form.manual_receipt || ''}
                onChange={e => setForm(p => ({ ...p, manual_receipt: e.target.value }))}
                rows={4} maxLength={500}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', fontFamily: 'var(--font-body)', resize: 'vertical', outline: 'none', lineHeight: '1.6' }}
              />
            )}

            {form.receipt_type === 'none' && (
              <p style={{ fontSize: '13px', color: 'var(--text-light)', padding: '10px 0' }}>
                No receipt — only description and location will be saved.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => navigate('/expenses')} style={{ flex: 1, padding: '12px', border: '2px solid var(--border)', borderRadius: '10px', background: 'white', color: 'var(--text-mid)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', background: loading ? '#aaa' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving...' : 'Add Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}