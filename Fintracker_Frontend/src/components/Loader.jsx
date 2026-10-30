export default function Loader({ text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '200px', gap: '16px'
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}