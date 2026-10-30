export const validateEmail    = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
export const validateMobile   = (m) => /^[6-9]\d{9}$/.test(m)
export const validatePassword = (p) => /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(p)
export const validateName     = (n) => n.trim().length >= 2

export const getPasswordStrength = (p) => {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[@$!%*?&]/.test(p)) s++
  if (p.length >= 12) s++
  if (s <= 1) return { label: 'Weak',   color: '#e74c3c', width: '25%' }
  if (s <= 2) return { label: 'Fair',   color: '#f39c12', width: '50%' }
  if (s <= 3) return { label: 'Good',   color: '#2ecc71', width: '75%' }
  return           { label: 'Strong', color: '#27ae60', width: '100%' }
}

import { formatCurrency as formatCurrencyValue } from './currency'

export const formatCurrency = (amount) => formatCurrencyValue(amount)

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

export const getCurrentMonth = () => {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}