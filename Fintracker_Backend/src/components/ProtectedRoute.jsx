/* eslint-disable */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export const OnboardingRoute = ({ children }) => {
  const { user, isOnboarded } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.is_admin === true) return children
  if (!isOnboarded()) return <Navigate to="/onboarding" replace />
  return children
}

export const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/admin-login" replace />
  if (user.is_admin !== true) return <Navigate to="/dashboard" replace />
  return children
}

export const PublicRoute = ({ children }) => {
  const { user, isOnboarded } = useAuth()
  if (user && user.is_admin === true) return <Navigate to="/admin" replace />
  if (user) return <Navigate to={isOnboarded() ? '/dashboard' : '/onboarding'} replace />
  return children
}