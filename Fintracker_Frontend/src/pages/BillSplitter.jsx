/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
const billSplitAPI = {
  getAll:       ()         => api.get('/expenses/bill-splits/'),
  create:       (data)     => api.post('/expenses/bill-splits/', data),
  updateMember: (id, data) => api.put(`/expenses/bill-splits/${id}/`, data),
  delete:       (id)       => api.delete(`/expenses/bill-splits/${id}/`),
}
import { formatCurrency, getStoredCurrency, CURRENCY_CONFIG } from '../utils/currency'
export default function BillSplitter() {
  const symbol = CURRENCY_CONFIG[getStoredCurrency()]?.symbol || '₹'
  const [bills, setBills]       = useState([])

  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({ title: '', total_amount: '', description: '' })
  const [members, setMembers] = useState([{ name: '', amount: '' }])

  useEffect(() => { fetchBills() }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const res = await billSplitAPI.getAll()
      setBills(res.data)
    } catch {
      toast.error('Failed to load bills')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = () => setMembers(p => [...p, { name: '', amount: '' }])

  const handleMemberChange = (idx, field, value) => {
    setMembers(p => p.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const handleRemoveMember = (idx) => {
    if (members.length === 1) return
    setMembers(p => p.filter((_, i) => i !== idx))
  }

  const handleSplitEqual = () => {
    if (!form.total_amount || members.length === 0) return
    const perPerson = (parseFloat(form.total_amount) / members.length).toFixed(2)
    setMembers(p => p.map(m => ({ ...m, amount: perPerson })))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.total_amount) { toast.warning('Please fill all fields'); return }
    if (members.some(m => !m.name || !m.amount)) { toast.warning('Fill all member details'); return }
    setSaving(true)
    try {
      await billSplitAPI.create({ ...form, total_amount: Number(form.total_amount), members })
      toast.success('Bill split created!')
      setForm({ title: '', total_amount: '', description: '' })
      setMembers([{ name: '', amount: '' }])
      setShowForm(false)
      fetchBills()
    } catch {
      toast.error('Failed to create bill split')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkPaid = async (memberId, isPaid) => {
    try {
      await billSplitAPI.updateMember(memberId, { is_paid: isPaid })
      toast.success(isPaid ? 'Marked as paid!' : 'Marked as unpaid!')
      fetchBills()
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id) => {
    try {
      await billSplitAPI.delete(id)
      toast.success('Bill deleted!')
      fetchBills()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 className="page-title">Bill Splitter</h1>
          <p className="page-subtitle">Split bills with friends and family easily</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'var(--primary)', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: '10px', fontWeight: '600',
          fontSize: '14px', cursor: 'pointer'
        }}>
          + Split Bill
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Create Bill Split</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Bill Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Dinner at restaurant" />
              </div>
              <div className="form-group">
                <label>Total Amount ({symbol}) *</label>
                <input type="number" value={form.total_amount} onChange={e => setForm(p => ({ ...p, total_amount: e.target.value }))} min="1" placeholder="0.00" />
              </div>

            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Add any notes" />
            </div>

            {/* Members */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontWeight: '600', fontSize: '14px' }}>Members</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={handleSplitEqual} style={{ background: '#f0faf4', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    Split Equally
                  </button>
                  <button type="button" onClick={handleAddMember} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    + Add Member
                  </button>
                </div>
              </div>
              {members.map((m, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <input type="text" value={m.name} onChange={e => handleMemberChange(idx, 'name', e.target.value)} placeholder={`Person ${idx + 1} name`} style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px' }} />
                  <input type="number" value={m.amount} onChange={e => handleMemberChange(idx, 'amount', e.target.value)} placeholder="Amount" min="0" style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px' }} />
                  <button type="button" onClick={() => handleRemoveMember(idx)} style={{ background: '#fff0f0', border: '1px solid #ffb3b3', borderRadius: '8px', color: '#e74c3c', cursor: 'pointer', padding: '0 12px', fontSize: '16px' }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', border: '2px solid var(--border)', borderRadius: '10px', background: 'white', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', background: saving ? '#aaa' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                {saving ? 'Creating...' : 'Create Split'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bills List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading...</p>
      ) : bills.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px' }}>🧾</p>
          <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>No bill splits yet</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop: '16px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Split First Bill
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bills.map(bill => {
            const paidCount   = bill.members?.filter(m => m.is_paid).length || 0
            const totalMembers = bill.members?.length || 0
            const paidAmount  = bill.members?.filter(m => m.is_paid).reduce((s, m) => s + parseFloat(m.amount), 0) || 0

            return (
              <div key={bill.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontWeight: '700', fontSize: '16px' }}>{bill.title}</h3>
                    {bill.description && <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>{bill.description}</p>}
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>{new Date(bill.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>{formatCurrency(bill.total_amount)}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{paidCount}/{totalMembers} paid</p>
                    <button onClick={() => handleDelete(bill.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>Delete</button>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Collected: {formatCurrency(paidAmount)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Pending: {formatCurrency(bill.total_amount - paidAmount)}</span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '6px' }}>
                    <div style={{ width: `${(paidAmount / bill.total_amount) * 100}%`, background: 'var(--primary)', height: '100%', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Members */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {bill.members?.map(member => (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: member.is_paid ? '#f0faf4' : '#fafafa', borderRadius: '8px', border: `1px solid ${member.is_paid ? '#c6f0d8' : 'var(--border)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: member.is_paid ? '#27ae60' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>
                          {member.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '13px' }}>{member.name}</p>
                          {member.paid_at && <p style={{ fontSize: '11px', color: '#27ae60' }}>Paid on {new Date(member.paid_at).toLocaleDateString('en-IN')}</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <p style={{ fontWeight: '700', color: member.is_paid ? '#27ae60' : '#e74c3c' }}>{formatCurrency(member.amount)}</p>
                        <button onClick={() => handleMarkPaid(member.id, !member.is_paid)} style={{
                          background: member.is_paid ? '#fff0f0' : '#f0faf4',
                          border: `1px solid ${member.is_paid ? '#ffb3b3' : '#c6f0d8'}`,
                          color: member.is_paid ? '#e74c3c' : '#27ae60',
                          padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                          cursor: 'pointer', fontWeight: '600'
                        }}>
                          {member.is_paid ? 'Undo' : 'Mark Paid'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}