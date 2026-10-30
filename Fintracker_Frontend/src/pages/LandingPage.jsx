import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', overflowX: 'hidden' }}>

      {/* Background Image */}
      <img src="/bg-image.jpg" alt="" style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center', zIndex: 0
      }} />

      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10, 25, 18, 0.52)',
        zIndex: 1
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Sticky Navbar */}
        <nav className="landing-nav" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 48px',
          position: 'sticky', top: 0, zIndex: 200,
          background: scrolled ? 'rgba(10,25,18,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.07)',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>
            <span style={{ color: 'white' }}>Fin</span>
            <span style={{ color: '#e8623a', fontWeight: '800' }}>Tracker</span>
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => navigate('/login')} style={{
              background: 'transparent', color: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              padding: '10px 24px', borderRadius: '8px',
              fontSize: '14px', fontWeight: '500', cursor: 'pointer'
            }}>Sign In</button>
            <button onClick={() => navigate('/register')} style={{
              background: '#e8623a', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: '8px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer'
            }}>Get Started</button>
          </div>
        </nav>

        {/* Hero */}
        <div className="landing-hero" style={{ flex: 1, padding: '70px 48px 40px', maxWidth: '560px' }}>
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
            fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: '700',
            color: 'white', lineHeight: '1.12', marginBottom: '22px'
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

          <div style={{ display: 'flex', gap: '14px', marginBottom: '50px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{
              background: '#e8623a', color: 'white', border: 'none',
              padding: '14px 32px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer'
            }}>Create Free Account</button>
            <button onClick={() => navigate('/login')} style={{
              background: 'rgba(255,255,255,0.08)', color: 'white',
              border: '1.5px solid rgba(255,255,255,0.2)',
              padding: '14px 32px', borderRadius: '10px',
              fontSize: '15px', cursor: 'pointer', color: 'white'
            }}>Sign In</button>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['Smart Dashboard', 'AI Insights', 'Budget Alerts', 'Export Reports', 'Category Tracking', 'Secure Login'].map(f => (
              <div key={f} style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px', padding: '7px 16px',
                fontSize: '13px', color: 'rgba(255,255,255,0.75)'
              }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="landing-section" style={{
          padding: '80px 48px',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '36px',
            fontWeight: '700', color: 'white', textAlign: 'center',
            marginBottom: '12px'
          }}>
            Everything You Need to <span style={{ color: '#e8623a' }}>Take Control</span>
          </h2>
          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.55)',
            fontSize: '16px', marginBottom: '52px'
          }}>
            Powerful features designed for smart money management
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px', maxWidth: '1100px', margin: '0 auto'
          }}>
            {[
              { icon: '📊', title: 'Smart Dashboard', desc: 'Get a complete overview of your finances with interactive charts and real-time data.' },
              { icon: '🤖', title: 'AI Insights', desc: 'Our AI analyzes your spending patterns and gives personalized suggestions to save more.' },
              { icon: '💰', title: 'Budget Planner', desc: 'Set monthly budgets per category and get alerts before you overspend.' },
              { icon: '📈', title: 'Detailed Reports', desc: 'Export and analyze your expenses with beautiful charts and CSV reports.' },
              { icon: '🔄', title: 'Recurring Bills', desc: 'Track subscriptions and recurring payments so you never miss a due date.' },
              { icon: '🧾', title: 'Bill Splitter', desc: 'Split bills with friends and family easily and track who has paid.' },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '28px',
                transition: 'all 0.2s'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ color: 'white', fontSize: '17px', fontWeight: '700', marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: '1.7' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="landing-section" style={{ padding: '80px 48px', background: 'rgba(0,0,0,0.2)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '34px',
            fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '48px'
          }}>
            What Our <span style={{ color: '#e8623a' }}>Users Say</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px', maxWidth: '1000px', margin: '0 auto'
          }}>
            {[
              { name: 'Priya Sharma', role: 'Freelancer', text: 'FinTracker helped me save ₹15,000 in just 2 months! The AI insights are incredibly accurate.', avatar: 'P' },
              { name: 'Rahul Mehta', role: 'Software Engineer', text: 'The budget planner feature is amazing. I finally have control over my monthly spending.', avatar: 'R' },
              { name: 'Anjali Patel', role: 'Business Owner', text: 'Bill splitter saved me so much hassle with my team. Highly recommend FinTracker!', avatar: 'A' },
            ].map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '16px', padding: '28px'
              }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.8', marginBottom: '20px', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: '#e8623a', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px'
                  }}>{t.avatar}</div>
                  <div>
                    <p style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{t.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="landing-stats-bar" style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.3)'
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
                fontFamily: 'var(--font-display)', fontSize: '30px',
                fontWeight: '700', color: '#e8623a', marginBottom: '4px'
              }}>{s.number}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="landing-footer" style={{
          background: 'rgba(0,0,0,0.5)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '40px 48px'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px',
            maxWidth: '1100px', margin: '0 auto'
          }}>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700' }}>
                <span style={{ color: 'white' }}>Fin</span>
                <span style={{ color: '#e8623a', fontWeight: '800' }}>Tracker</span>
              </span>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '10px', maxWidth: '240px', lineHeight: '1.7' }}>
                Smart personal finance management for everyone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '14px' }}>Product</p>
                {['Dashboard', 'AI Insights', 'Budget Planner', 'Reports'].map(l => (
                  <p key={l} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }}>{l}</p>
                ))}
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '14px' }}>Company</p>
                {['About Us', 'Contact', 'Privacy Policy', 'Terms'].map(l => (
                  <p key={l} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }}>{l}</p>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            marginTop: '32px', paddingTop: '20px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.3)', fontSize: '12px'
          }}>
            © 2025 FinTracker. All rights reserved. Built with ❤️ for smart savers.
          </div>
        </footer>

      </div>
    </div>
  )
}
