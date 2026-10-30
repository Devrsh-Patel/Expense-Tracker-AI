/* eslint-disable */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useExpense } from '../context/ExpenseContext'
import { expenseAPI } from '../services/api'
import { formatCurrency } from '../utils/currency'

export default function Dashboard() {
  const { user } = useAuth()
  const { expenses, fetchExpenses } = useExpense()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    fetchExpenses()
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      const res = await expenseAPI.getSummary({ month: currentMonth })
      setSummary(res.data)
    } catch (e) {
      console.log('Summary error:', e)
    } finally {
      setLoading(false)
    }
  }

  const thisMonthExpenses = expenses.filter(e =>
    e.date?.startsWith(currentMonth)
  )

  const totalThisMonth = thisMonthExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0), 0
  )

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const income = parseFloat(user?.income || 0)
  const remaining = income - totalThisMonth
  const budgetPercent = income > 0 ? Math.min((totalThisMonth / income) * 100, 100) : 0

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-light)' }}>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>
          Here is your financial summary for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #e74c3c' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}>Total Spent This Month</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#e74c3c' }}>{formatCurrency(totalThisMonth)}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>{thisMonthExpenses.length} transactions</p>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}>Monthly Income</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{income > 0 ? formatCurrency(income) : 'Not set'}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/profile')}>
            {income > 0 ? 'Update income' : 'Set your income'}
          </p>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: `4px solid ${remaining >= 0 ? '#27ae60' : '#e74c3c'}` }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}>Remaining Budget</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: remaining >= 0 ? '#27ae60' : '#e74c3c' }}>
            {income > 0 ? formatCurrency(remaining) : 'N/A'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
            {income > 0 ? `${budgetPercent.toFixed(1)}% of income used` : 'Set income to track'}
          </p>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f39c12' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}>Daily Average</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#f39c12' }}>
            {formatCurrency(totalThisMonth / new Date().getDate())}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>Per day this month</p>
        </div>

      </div>

      {/* Budget Progress */}
      {income > 0 && (
        <div className="card" style={{ padding: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontWeight: '600' }}>Monthly Budget Usage</p>
            <p style={{ color: budgetPercent > 80 ? '#e74c3c' : 'var(--primary)', fontWeight: '600' }}>{budgetPercent.toFixed(1)}%</p>
          </div>
          <div style={{ background: '#f0f0f0', borderRadius: '8px', height: '10px' }}>
            <div style={{
              width: `${budgetPercent}%`,
              background: budgetPercent > 80 ? '#e74c3c' : budgetPercent > 60 ? '#f39c12' : 'var(--primary)',
              height: '100%', borderRadius: '8px', transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Spent: {formatCurrency(totalThisMonth)}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Income: {formatCurrency(income)}</span>
          </div>
        </div>
      )}

      {/* Category Summary */}
      {summary?.category_summary?.length > 0 && (
        <div className="card" style={{ padding: '20px', marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '16px' }}>Spending by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {summary.category_summary.slice(0, 5).map(cat => (
              <div key={cat.category_id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{cat.category_name}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{formatCurrency(cat.total)} ({cat.percentage}%)</span>
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '6px' }}>
                  <div style={{ width: `${cat.percentage}%`, background: cat.category_color || 'var(--primary)', height: '100%', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>Recent Transactions</h3>
          <button onClick={() => navigate('/expenses')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            View All
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ fontSize: '32px' }}>💸</p>
            <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>No expenses yet</p>
            <button onClick={() => navigate('/add-expense')} style={{ marginTop: '12px', background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Add First Expense
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentExpenses.map(exp => (
              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: exp.category_color || '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    {exp.category_icon || '💰'}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{exp.description}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{exp.category_name} · {exp.payment_mode} · {exp.date}</p>
                  </div>
                </div>
                <p style={{ fontWeight: '700', color: '#e74c3c', fontSize: '15px' }}>-{formatCurrency(exp.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '24px' }}>
        {[
          { label: 'Add Expense',   icon: '➕', path: '/add-expense'  },
          { label: 'View Reports',  icon: '📊', path: '/reports'      },
          { label: 'AI Insights',   icon: '🤖', path: '/insights'     },
          { label: 'My Profile',    icon: '👤', path: '/profile'      },
        ].map(action => (
          <button key={action.path} onClick={() => navigate(action.path)} style={{
            padding: '16px', border: '2px solid var(--border)', borderRadius: '12px',
            background: 'white', cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <p style={{ fontSize: '24px', marginBottom: '6px' }}>{action.icon}</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)' }}>{action.label}</p>
          </button>
        ))}
      </div>

    </div>
  )
}