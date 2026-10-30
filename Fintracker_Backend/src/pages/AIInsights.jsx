/* eslint-disable */
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { insightAPI } from '../services/api'
import { useExpense } from '../context/ExpenseContext'
import { formatCurrency } from '../utils/currency'

export default function AIInsights() {
  const { CATEGORIES } = useExpense()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => { fetchInsights() }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const res = await insightAPI.getSummary()
      setInsights(res.data)
    } catch {
      toast.error('Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '40px' }}>🤖</p>
        <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>Analyzing your spending...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">AI Insights</h1>
        <p className="page-subtitle">Smart analysis of your spending habits</p>
      </div>

      {/* Monthly Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #e74c3c' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>This Month</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#e74c3c' }}>{formatCurrency(insights?.this_month_total)}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Last Month</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(insights?.last_month_total)}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f39c12' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Daily Average</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#f39c12' }}>{formatCurrency(insights?.daily_average)}</p>
        </div>
        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #9b59b6' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Projected This Month</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#9b59b6' }}>{formatCurrency(insights?.projected_total)}</p>
        </div>
      </div>

      {/* Month over Month */}
      {insights?.mom_change !== null && insights?.mom_change !== undefined && (
        <div className="card" style={{
          padding: '20px', marginBottom: '24px',
          borderLeft: `4px solid ${insights.mom_change > 0 ? '#e74c3c' : '#27ae60'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>{insights.mom_change > 0 ? '📈' : '📉'}</span>
            <div>
              <p style={{ fontWeight: '700', fontSize: '16px' }}>
                {insights.mom_change > 0 ? 'Spending Increased' : 'Spending Decreased'}
              </p>
              <p style={{ color: insights.mom_change > 0 ? '#e74c3c' : '#27ae60', fontWeight: '600' }}>
                {Math.abs(insights.mom_change)}% compared to last month
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
                {insights.mom_change > 0
                  ? 'Try to reduce spending in top categories this month'
                  : 'Great job! You are spending less than last month'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Categories */}
      {insights?.category_totals?.length > 0 && (
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '16px' }}>
            Top Spending Categories This Month
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights.category_totals.slice(0, 5).map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px', width: '32px' }}>
                  {CATEGORIES.find(c => c.name === cat.name)?.icon || '💰'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{cat.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{formatCurrency(cat.total)}</span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '6px' }}>
                    <div style={{
                      width: `${(cat.total / insights.category_totals[0].total) * 100}%`,
                      background: cat.color || 'var(--primary)',
                      height: '100%', borderRadius: '4px'
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unusual Transactions */}
      {insights?.unusual?.length > 0 && (
        <div className="card" style={{ padding: '20px', marginBottom: '24px', borderLeft: '4px solid #e74c3c' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '16px' }}>
            ⚠️ Unusual Transactions ({insights.unusual_count})
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px' }}>
            These transactions are significantly higher than your daily average
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {insights.unusual.map((exp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#fff5f5', borderRadius: '8px', border: '1px solid #ffb3b3' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '13px' }}>{exp.description}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>{exp.category} · {exp.date}</p>
                </div>
                <p style={{ fontWeight: '700', color: '#e74c3c' }}>{formatCurrency(exp.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Forecast & Recommendations */}
      {insights?.prediction && (
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '12px' }}>
            🤖 AI Forecast & Recommendations
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '14px', background: '#f9f9f9', borderRadius: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Forecasted Monthly Spend</p>
              <p style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(insights.prediction.predicted_amount)}</p>
            </div>
            <div style={{ padding: '14px', background: '#f9f9f9', borderRadius: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Budget Utilization</p>
              <p style={{ fontWeight: '700', color: '#f39c12' }}>{insights.prediction.budget_utilization_percent}%</p>
            </div>
            <div style={{ padding: '14px', background: '#f9f9f9', borderRadius: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Financial Health</p>
              <p style={{ fontWeight: '700', color: '#27ae60' }}>{insights.prediction.financial_health_score}/100</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.prediction.ai_recommendations?.map((recommendation, idx) => (
              <div key={idx} style={{ padding: '10px 12px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', fontWeight: '600' }}>{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Budgets */}
      {insights?.suggested_budgets?.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '8px' }}>
            💡 Suggested Budgets
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
            Based on your last 3 months spending
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {insights.suggested_budgets.slice(0, 6).map((b, idx) => (
              <div key={idx} style={{ padding: '14px', background: '#f9f9f9', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {CATEGORIES.find(c => c.name === b.category_name)?.icon || '💰'}
                  </span>
                  <p style={{ fontWeight: '600', fontSize: '13px' }}>{b.category_name}</p>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>3 month avg: {formatCurrency(b.avg)}</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginTop: '4px' }}>
                  Suggested: {formatCurrency(b.suggested)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data */}
      {!insights?.category_totals?.length && !loading && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '40px' }}>🤖</p>
          <p style={{ color: 'var(--text-light)', marginTop: '12px' }}>
            Add more expenses to get AI insights!
          </p>
        </div>
      )}
    </div>
  )
}