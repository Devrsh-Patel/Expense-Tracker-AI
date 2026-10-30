import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0faf4, #fff8f5)', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '72px', marginBottom: '16px' }}>😕</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '10px' }}>Page Not Found</h1>
      <p style={{ fontSize: '15px', color: 'var(--text-light)', marginBottom: '28px' }}>The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')} className="btn-primary">← Back to Home</button>
    </div>
  )
}