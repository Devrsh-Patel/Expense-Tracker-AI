/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { reportAPI } from '../services/api'
import { useExpense } from '../context/ExpenseContext'
import { formatCurrency } from '../utils/currency'

export default function Reports() {
  const { CATEGORIES } = useExpense()
  const [report, setReport]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [exporting, setExporting] = useState(false)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => { fetchReport() }, [])

  const validateDates = (from, to) => {
    const today = new Date().toISOString().split('T')[0]
    if (from > today || to > today) {
      toast.error('Future dates are not allowed')
      return false
    }
    if (from > to) {
      toast.error('From Date cannot be after To Date')
      return false
    }
    return true
  }

  const fetchReport = async () => {
    if (!validateDates(fromDate, toDate)) return
    try {
      setLoading(true)
      const res = await reportAPI.getSummary({ from_date: fromDate, to_date: toDate })
      setReport(res.data)
    } catch {
      toast.error('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!validateDates(fromDate, toDate)) return
    setExporting(true)
    try {
      const res = await reportAPI.exportCSV({ from_date: fromDate, to_date: toDate })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `fintracker_report_${fromDate}_${toDate}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report exported successfully!')
    } catch {
      toast.error('Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analyse your spending patterns</p>
        </div>
        <button onClick={handleExport} disabled={exporting} style={{
          background: exporting ? '#aaa' : 'var(--primary)', color: 'white',
          border: 'none', padding: '10px 20px', borderRadius: '10px',
          fontWeight: '600', fontSize: '14px', cursor: 'pointer'
        }}>
          {exporting ? 'Exporting...' : '📥 Export CSV'}
        </button>
      </div>

      {/* Date Filter */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px' }} />
          </div>
          <button onClick={fetchReport} style={{
            background: 'var(--primary)', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontWeight: '600',
            fontSize: '14px', cursor: 'pointer'
          }}>
            Generate Report
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading report...</p>
      ) : !report ? (
        <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No data found</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #e74c3c' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Total Spent</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#e74c3c' }}>{formatCurrency(report.total)}</p>
            </div>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Total Transactions</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{report.count}</p>
            </div>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f39c12' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Average per Transaction</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#f39c12' }}>
                {formatCurrency(report.count > 0 ? report.total / report.count : 0)}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          {report.category_summary?.length > 0 && (
            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '16px' }}>
                Spending by Category
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {report.category_summary.map(cat => (
                  <div key={cat.category_id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>
                          {CATEGORIES.find(c => c.name === cat.category_name)?.icon || '💰'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{cat.category_name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700' }}>{formatCurrency(cat.total)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-light)', marginLeft: '8px' }}>({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                      <div style={{
                        width: `${cat.percentage}%`,
                        background: cat.category_color || 'var(--primary)',
                        height: '100%', borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense Table */}
          {report.expenses?.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '16px' }}>
                All Transactions
              </h3>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9' }}>
                      {['Date', 'Description', 'Category', 'Payment Mode', 'Amount'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.expenses.map((exp, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-light)' }}>{exp.date}</td>
                        <td style={{ padding: '10px 14px', fontWeight: '500' }}>{exp.description}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-mid)' }}>{exp.category}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-mid)' }}>{exp.payment_mode}</td>
                        <td style={{ padding: '10px 14px', fontWeight: '700', color: '#e74c3c' }}>-{formatCurrency(exp.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}