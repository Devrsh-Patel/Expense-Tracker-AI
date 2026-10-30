/* eslint-disable */
import { createContext, useContext, useState } from 'react'
import { setStoredCurrency } from '../utils/currency'

const AuthContext = createContext(null)

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('fintracker_user') || '{}')
    return user?.id || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fintracker_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (userData, tokens) => {
    console.log('Login called with:', userData)
    localStorage.setItem('fintracker_user', JSON.stringify(userData))
    if (userData?.currency) {
      setStoredCurrency(userData.currency)
    }
    if (tokens) {
      localStorage.setItem('fintracker_access_token', tokens.access)
      localStorage.setItem('fintracker_refresh_token', tokens.refresh)
    }
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('fintracker_user')
    localStorage.removeItem('fintracker_access_token')
    localStorage.removeItem('fintracker_refresh_token')
    setUser(null)
  }

  const isOnboarded = () => {
    const userId = getUserId()
    if (!userId) return false
    return localStorage.getItem(`fintracker_onboarded_${userId}`) === 'true'
  }

  const completeOnboarding = () => {
    const userId = getUserId()
    if (!userId) return
    localStorage.setItem(`fintracker_onboarded_${userId}`, 'true')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isOnboarded, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}