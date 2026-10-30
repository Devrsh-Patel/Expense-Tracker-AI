/* eslint-disable */
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('fintracker_user') || '{}')
    return user?.id || null
  } catch {
    return null
  }
}

import { setStoredCurrency } from '../utils/currency'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fintracker_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Synchronize onboarding status from backend on startup and whenever user login status changes
  useEffect(() => {
    const syncOnboarding = async () => {
      if (user) {
        try {
          const response = await api.get('/expenses/onboarding/')
          // Onboarding endpoint returns the onboarding record with ID if completed
          if (response.data && response.data.id) {
            localStorage.setItem(`fintracker_onboarded_${user.id}`, 'true')
          } else {
            localStorage.setItem(`fintracker_onboarded_${user.id}`, 'false')
          }
        } catch {
          // Keep current localStorage status if API fails
        }
      }
    }
    syncOnboarding()
  }, [user])

  const login = (userData, tokens) => {
    console.log('Login called with:', userData)
    localStorage.setItem('fintracker_user', JSON.stringify(userData))
    if (tokens) {
      localStorage.setItem('fintracker_access_token', tokens.access)
      localStorage.setItem('fintracker_refresh_token', tokens.refresh)
    }
    if (userData?.currency) {
      setStoredCurrency(userData.currency)
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