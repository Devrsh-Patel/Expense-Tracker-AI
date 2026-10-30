/* eslint-disable */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useExpense } from '../context/ExpenseContext'
import { expenseAPI } from '../services/api'
import { formatCurrency, getStoredCurrency, CURRENCY_CONFIG } from '../utils/currency'


// Simple Pie Chart Component
function PieChart({ data }) {
  if (!data || data.length === 0) return null
  const symbol = CURRENCY_CONFIG[getStoredCurrency()]?.symbol || '₹'


  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulative = 0

  const slices = data.map((d, i) => {
    const startAngle = (cumulative / total) * 360
    cumulative += d.value
    const endAngle = (cumulative / total) * 360
    return { ...d, startAngle, endAngle }
  })

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * (Math.PI / 180)
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    }
  }

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end   = polarToCartesian(cx, cy, r, startAngle)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {slices.map((slice, i) => (
          <path
            key={i}
            d={describeArc(90, 90, 80, slice.startAngle, slice.endAngle)}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
        <circle cx="90" cy="90" r="40" fill="white" />
        <text x="90" y="86" textAnchor="middle" fontSize="11" fill="#666">Total</text>
        <text x="90" y="100" textAnchor="middle" fontSize="10" fill="#333" fontWeight="bold">
          {symbol}{Math.round(total / 1000)}k
        </text>

      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.slice(0, 6).map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-mid)' }}>{d.name}</span>
            <span style={{ fontSize: '12px', fontWeight: '600', marginLeft: 'auto' }}>
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple Bar Chart Component
function BarChart({ data }) {
  if (!data || data.length === 0) return null
  const symbol = CURRENCY_CONFIG[getStoredCurrency()]?.symbol || '₹'


  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '0 8px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-light)', marginBottom: '4px', fontWeight: '600' }}>
              {symbol}{d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
            </span>

            <div style={{
              width: '100%',
              height: `${maxValue > 0 ? (d.value / maxValue) * 120 : 0}px`,
              background: d.color || 'var(--primary)',
              borderRadius: '6px 6px 0 0',
              minHeight: d.value > 0 ? '4px' : '0',
              transition: 'height 0.5s ease'
            }} />
          </div>
        ))}
      </div>

      {/* X Axis Labels */}
      <div style={{ display: 'flex', gap: '8px', padding: '6px 8px 0' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { expenses, fetchExpenses, CATEGORIES } = useExpense()
  const navigate  = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('pie')

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

  const thisMonthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth))
  const totalThisMonth    = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  const recentExpenses    = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  const income            = parseFloat(user?.income || 0)
  const remaining         = income - totalThisMonth
  const budgetPercent     = income > 0 ? Math.min((totalThisMonth / income) * 100, 100) : 0

  // Build chart data from real transactions
  const categoryMap = {}
  thisMonthExpenses.forEach(exp => {
    const catName  = exp.category_name || 'Other'
    const catColor = exp.category_color || '#D3D3D3'
    if (!categoryMap[catName]) {
      categoryMap[catName] = { name: catName, value: 0, color: catColor }
    }
    categoryMap[catName].value += parseFloat(exp.amount || 0)
  })

  const chartData = Object.values(categoryMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Build last 7 days bar chart data
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const d    = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' })
    const total   = expenses
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    last7Days.push({ name: dayName, value: Math.round(total), color: 'var(--primary)' })
  }

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
          <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{income > 0 ? formatCurrency(income) : 'Set Income'}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/profile')}>
            {income > 0 ? 'Update income' : 'Set your income'}
          </p>
        </div>

        <div className="card" style={{ padding: '20px', borderLeft: `4px solid ${remaining >= 0 ? '#27ae60' : '#e74c3c'}` }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}>Remaining Budget</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: remaining >= 0 ? '#27ae60' : '#e74c3c' }}>
            {income > 0 ? formatCurrency(remaining) : '—'}
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

        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #9b59b6' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}>Total Transactions</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#9b59b6' }}>
            {expenses.length}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>{thisMonthExpenses.length} made this month</p>
        </div>
      </div>

      {/* Charts Section */}
      {thisMonthExpenses.length > 0 ? (
        <div className="card" style={{ padding: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>Spending Charts</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setActiveChart('pie')} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${activeChart === 'pie' ? 'var(--primary)' : 'var(--border)'}`,
                background: activeChart === 'pie' ? 'rgba(45,106,79,0.08)' : 'white',
                color: activeChart === 'pie' ? 'var(--primary)' : 'var(--text-mid)',
                fontWeight: '600'
              }}>
                🥧 Pie Chart
              </button>
              <button onClick={() => setActiveChart('bar')} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                border: `2px solid ${activeChart === 'bar' ? 'var(--primary)' : 'var(--border)'}`,
                background: activeChart === 'bar' ? 'rgba(45,106,79,0.08)' : 'white',
                color: activeChart === 'bar' ? 'var(--primary)' : 'var(--text-mid)',
                fontWeight: '600'
              }}>
                📊 Bar Chart
              </button>
            </div>
          </div>

          {activeChart === 'pie' && (
            <>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                Category wise spending this month
              </p>
              <PieChart data={chartData} />
            </>
          )}

          {activeChart === 'bar' && (
            <>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                Daily spending last 7 days
              </p>
              <BarChart data={last7Days} />
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '20px', marginBottom: '28px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px' }}>📊</p>
          <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>Add expenses to see charts!</p>
        </div>
      )}

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
                 <div style={{
  minWidth: '70px', height: '32px', borderRadius: '8px',
  background: (exp.category_color || '#eee') + '33',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, fontSize: '11px', fontWeight: '700',
  color: exp.category_color || '#666', textAlign: 'center',
  padding: '0 8px', whiteSpace: 'nowrap'
}}>
  {exp.category_name || 'Expense'}
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
          { label: 'Add Expense',  icon: '➕', path: '/add-expense' },
          { label: 'View Reports', icon: '📊', path: '/reports'     },
          { label: 'AI Insights',  icon: '🤖', path: '/ai-insights' },
          { label: 'My Profile',   icon: '👤', path: '/profile'     },
        ].map(action => (
          <button key={action.path} onClick={() => navigate(action.path)} style={{
            padding: '16px', border: '2px solid var(--border)', borderRadius: '12px',
            background: 'white', cursor: 'pointer', textAlign: 'center'
          }}>
            <p style={{ fontSize: '24px', marginBottom: '6px' }}>{action.icon}</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)' }}>{action.label}</p>
          </button>
        ))}
      </div>

    </div>
  )
}