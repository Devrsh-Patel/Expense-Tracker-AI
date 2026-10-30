import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>

    
      {/* Background Image */}
<img
  src="/bg-image.jpg"
  alt=""
  style={{
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    zIndex: 0
  }}
/>

      {/* Dark overlay — stronger dark for better text visibility */}
      <div style={{
  position: 'fixed', inset: 0,
  background: 'rgba(10, 25, 18, 0.65)',
  zIndex: 1
}} />

      {/* All content */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Navbar */}
        <nav style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 48px',
          borderBottom: '1px solid rgba(255,255,255,0.07)'
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>
            <span style={{ color: 'white' }}>Fin</span>
            <span style={{ color: '#4d9eff', fontWeight: '800' }}>Tracker</span>
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/login')} style={{
              background: 'transparent', color: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              padding: '10px 28px', borderRadius: '8px',
              fontSize: '14px', fontWeight: '500', cursor: 'pointer'
            }}>
              Sign In
            </button>
            <button onClick={() => navigate('/register')} style={{
              background: '#e8623a', color: 'white', border: 'none',
              padding: '10px 28px', borderRadius: '8px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer'
            }}>
              Get Started Free
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ flex: 1, padding: '70px 48px 40px', maxWidth: '520px' }}>

          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '20px', padding: '6px 16px',
            fontSize: '13px', color: 'rgba(255,255,255,0.75)',
            marginBottom: '28px'
          }}>
            Smart Personal Finance Management
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '56px', fontWeight: '700',
            color: 'white', lineHeight: '1.12',
            marginBottom: '22px'
          }}>
            Track Every Rupee.<br />
            <span style={{ color: '#e8623a' }}>Save Smarter.</span>
          </h1>

          <p style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.65)',
            marginBottom: '40px', lineHeight: '1.8'
          }}>
            FinTracker helps you manage daily expenses, set budgets,
            and understand your spending habits with smart AI-powered insights.
          </p>

          <div style={{ display: 'flex', gap: '14px', marginBottom: '50px' }}>
            <button onClick={() => navigate('/register')} style={{
              background: '#e8623a', color: 'white', border: 'none',
              padding: '14px 36px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer'
            }}>
              Create Free Account
            </button>
            <button onClick={() => navigate('/login')} style={{
              background: 'rgba(255,255,255,0.08)', color: 'white',
              border: '1.5px solid rgba(255,255,255,0.2)',
              padding: '14px 36px', borderRadius: '10px',
              fontSize: '15px', cursor: 'pointer'
            }}>
              Sign In
            </button>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              'Smart Dashboard',
              'AI Insights',
              'Budget Alerts',
              'Export Reports',
              'Category Tracking',
              'Secure Login'
            ].map(f => (
              <div key={f} style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px', padding: '7px 16px',
                fontSize: '13px', color: 'rgba(255,255,255,0.75)'
              }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          width: '100%'
        }}>
          {[
            { number: '17+',  label: 'Expense Categories' },
            { number: '100%', label: 'Secure and Private'  },
            { number: 'Free', label: 'No Hidden Charges'   },
            { number: 'AI',   label: 'Smart Insights'      }
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '28px 20px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              textAlign: 'center'
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '30px', fontWeight: '700',
                color: '#e8623a', marginBottom: '4px'
              }}>
                {s.number}
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}