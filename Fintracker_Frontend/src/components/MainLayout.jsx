import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

export default function MainLayout({ children }) {
  const [sidebarWidth, setSidebarWidth] = useState(240)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar onCollapse={(collapsed) => setSidebarWidth(collapsed ? 70 : 240)} />
      <main style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        minHeight: '100vh',
        width: `calc(100% - ${sidebarWidth}px)`,
        background: 'var(--bg)',
        overflowX: 'hidden',
        transition: 'margin-left 0.3s ease, width 0.3s ease'
      }}>
        {children}
      </main>
    </div>
  )
}