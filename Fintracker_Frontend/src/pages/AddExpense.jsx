/* eslint-disable */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useExpense } from '../context/ExpenseContext'
import { useAuth } from '../context/AuthContext'
import { expenseAPI } from '../services/api'
import { getStoredCurrency, CURRENCY_CONFIG } from '../utils/currency'


const ALLOWED_TYPES      = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf']
const CATEGORY_COLORS    = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#7EC8E3',
  '#FFB347', '#87CEEB', '#B0C4DE', '#90EE90',
  '#F4A460', '#DA70D6', '#FFB6C1', '#98FB98', '#6C757D'
]

export default function AddExpense() {
  const { addExpense, CATEGORIES, customCategories, addCustomCategory } = useExpense()
  const { user } = useAuth()
  const navigate = useNavigate()
  const hasIncome = user?.income > 0
  const symbol = CURRENCY_CONFIG[getStoredCurrency()]?.symbol || '₹'


  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    payment_mode: '',
    description: '',
    spent_at: '',
    receipt_type: 'none',
    manual_receipt: ''
  })
  const [errors, setErrors]             = useState({})
  const [loading, setLoading]           = useState(false)
  const [receipt, setReceipt]           = useState(null)
  const [preview, setPreview]           = useState(null)
  const [receiptConfirmed, setReceiptConfirmed] = useState(false)

  const [categoryType, setCategoryType]     = useState('default')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm]         = useState({ name: '', color: '#6C757D' })
  const [addingCustom, setAddingCustom]     = useState(false)

  const validate = () => {
    const e = {}
    if (!form.amount || Number(form.amount) <= 0) e.amount       = 'Enter a valid amount'
    if (!form.date)                               e.date         = 'Date is required'
    if (!form.category)                           e.category     = 'Select a category'
    if (!form.payment_mode)                       e.payment_mode = 'Select payment mode'
    if (!form.description.trim())                 e.description  = 'Add a short description'

    if (form.receipt_type === 'upload' && !receipt) {
      toast.warning('Please upload a receipt file first!')
      e.receipt = 'Receipt file is required'
    }
    if (form.receipt_type === 'manual' && !form.manual_receipt?.trim()) {
      toast.warning('Please write your receipt details — field cannot be empty!')
      e.receipt = 'Receipt details cannot be empty'
    }

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

  const handleAddCustomCategory = async () => {
    if (!customForm.name.trim()) { toast.warning('Please enter category name'); return }
    setAddingCustom(true)
    try {
      const newCat = await addCustomCategory({
        name:  customForm.name,
        icon:  'other',
        color: customForm.color
      })
      toast.success('Custom category added!')
      setForm(p => ({ ...p, category: `custom_${newCat.id}` }))
      setCustomForm({ name: '', color: '#6C757D' })
      setShowCustomForm(false)
    } catch {
      toast.error('Failed to add custom category')
    } finally {
      setAddingCustom(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const isCustom         = form.category.toString().startsWith('custom_')
      const categoryId       = isCustom ? null : Number(form.category)
      const customCategoryId = isCustom ? parseInt(form.category.replace('custom_', '')) : null

      const newExpense = await addExpense({
        amount:             Number(form.amount),
        date:               form.date,
        category:           categoryId,
        custom_category_id: customCategoryId,
        payment_mode:       form.payment_mode,
        description:        form.description,
        spent_at:           form.spent_at || '',
        manual_receipt:     form.manual_receipt || ''
      })

      if (receipt && newExpense?.id) {
        try {
          await expenseAPI.uploadReceipt(newExpense.id, receipt)
          toast.success('Expense and receipt saved successfully!')
        } catch {
          toast.success('Expense saved! Receipt upload failed.')
        }
      } else {
        toast.success('Expense added successfully.')
      }

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
    setForm(p => ({ ...p, receipt_type: key, manual_receipt: '' }))
    setReceipt(null)
    setPreview(null)
    setReceiptConfirmed(false)
    setErrors(p => ({ ...p, receipt: '' }))
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

          {/* Amount */}
          <div className="form-group">
            <label>Amount ({symbol})</label>
            <input type="number" value={form.amount} onChange={set('amount')} min="0.01" step="0.01" placeholder="0.00" className={errors.amount ? 'error' : ''} style={{ fontSize: '18px', fontWeight: '600' }} />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={set('date')} max={new Date().toISOString().split('T')[0]} className={errors.date ? 'error' : ''} />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button type="button" onClick={() => { setCategoryType('default'); setForm(p => ({ ...p, category: '' })) }} style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${categoryType === 'default' ? 'var(--primary)' : 'var(--border)'}`,
                background: categoryType === 'default' ? 'rgba(45,106,79,0.08)' : 'white',
                color: categoryType === 'default' ? 'var(--primary)' : 'var(--text-mid)', fontWeight: '600'
              }}>
                📋 Default
              </button>
              <button type="button" onClick={() => { setCategoryType('custom'); setForm(p => ({ ...p, category: '' })) }} style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${categoryType === 'custom' ? 'var(--primary)' : 'var(--border)'}`,
                background: categoryType === 'custom' ? 'rgba(45,106,79,0.08)' : 'white',
                color: categoryType === 'custom' ? 'var(--primary)' : 'var(--text-mid)', fontWeight: '600'
              }}>
                ✨ My Categories
              </button>
            </div>

            {categoryType === 'default' && (
              <select value={form.category.toString().startsWith('custom_') ? '' : form.category} onChange={set('category')} className={errors.category ? 'error' : ''}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            )}

            {categoryType === 'custom' && (
              <div>
                {customCategories.length > 0 && (
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={errors.category ? 'error' : ''} style={{ marginBottom: '10px' }}>
                    <option value="">Select custom category</option>
                    {customCategories.map(c => (
                      <option key={c.id} value={`custom_${c.id}`}>📌 {c.name}</option>
                    ))}
                  </select>
                )}

                {customCategories.length === 0 && !showCustomForm && (
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '10px' }}>
                    No custom categories yet. Add one below!
                  </p>
                )}

                {!showCustomForm && (
                  <button type="button" onClick={() => setShowCustomForm(true)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', border: '2px dashed var(--primary)',
                    borderRadius: '8px', background: 'rgba(45,106,79,0.04)',
                    color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                  }}>
                    + Add New Category
                  </button>
                )}

                {showCustomForm && (
                  <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '8px' }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>Create New Category</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Category name (e.g. Pet Care)"
                        value={customForm.name}
                        onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))}
                        style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px' }}
                      />
                      <input
                        type="color"
                        value={customForm.color}
                        onChange={e => setCustomForm(p => ({ ...p, color: e.target.value }))}
                        style={{ width: '44px', height: '40px', borderRadius: '8px', border: '1.5px solid var(--border)', cursor: 'pointer', padding: '2px' }}
                      />
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '6px' }}>Pick a color:</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {CATEGORY_COLORS.map(color => (
                        <div key={color} onClick={() => setCustomForm(p => ({ ...p, color }))} style={{
                          width: '24px', height: '24px', borderRadius: '50%', background: color, cursor: 'pointer',
                          border: customForm.color === color ? '3px solid #333' : '2px solid transparent'
                        }} />
                      ))}
                    </div>

                    {customForm.name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: customForm.color }} />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>📌 {customForm.name}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => { setShowCustomForm(false); setCustomForm({ name: '', color: '#6C757D' }) }} style={{
                        flex: 1, padding: '9px', border: '1.5px solid var(--border)',
                        borderRadius: '8px', background: 'white', cursor: 'pointer',
                        fontSize: '13px', fontWeight: '600', color: 'var(--text-mid)'
                      }}>Cancel</button>
                      <button type="button" onClick={handleAddCustomCategory} disabled={addingCustom} style={{
                        flex: 2, padding: '9px',
                        background: addingCustom ? '#aaa' : 'var(--primary)',
                        color: 'white', border: 'none', borderRadius: '8px',
                        cursor: addingCustom ? 'not-allowed' : 'pointer',
                        fontSize: '13px', fontWeight: '600'
                      }}>
                        {addingCustom ? 'Adding...' : '+ Add Category'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          {/* Payment Mode */}
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

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={form.description} onChange={set('description')} maxLength={150} className={errors.description ? 'error' : ''} />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* Spent At */}
          <div className="form-group">
            <label>Where was this spent? <span style={{ color: 'var(--text-light)', fontWeight: '400' }}>(Optional)</span></label>
            <input type="text" value={form.spent_at} onChange={set('spent_at')} maxLength={100} />
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Enter shop name, app, or place</span>
          </div>

          {/* Receipt */}
          <div className="form-group">
            <label>Receipt / Bill</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              {[
                { key: 'none',   label: 'No Receipt'     },
                { key: 'upload', label: 'Upload File'    },
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
                {errors.receipt && <span className="error-text">{errors.receipt}</span>}
              </div>
            )}

            {form.receipt_type === 'manual' && (
              <div>
                <textarea
                  placeholder="Write receipt details here — item name, quantity, price etc..."
                  value={form.manual_receipt}
                  onChange={e => {
                    setForm(p => ({ ...p, manual_receipt: e.target.value }))
                    if (errors.receipt) setErrors(p => ({ ...p, receipt: '' }))
                  }}
                  rows={4} maxLength={500}
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: `1.5px solid ${errors.receipt ? '#e74c3c' : 'var(--border)'}`,
                    borderRadius: '10px', fontSize: '14px',
                    fontFamily: 'var(--font-body)', resize: 'vertical',
                    outline: 'none', lineHeight: '1.6'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  {errors.receipt
                    ? <span className="error-text">{errors.receipt}</span>
                    : <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>This field is required</span>
                  }
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                    {form.manual_receipt?.length || 0}/500
                  </span>
                </div>
              </div>
            )}

            {form.receipt_type === 'none' && (
              <p style={{ fontSize: '13px', color: 'var(--text-light)', padding: '10px 0' }}>
                No receipt — only description and location will be saved.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => navigate('/expenses')} style={{
              flex: 1, padding: '12px', border: '2px solid var(--border)',
              borderRadius: '10px', background: 'white',
              color: 'var(--text-mid)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: '12px',
              background: loading ? '#aaa' : 'var(--primary)',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Saving...' : 'Add Expense'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}