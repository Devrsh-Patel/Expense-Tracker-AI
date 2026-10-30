/* eslint-disable */
import { createContext, useContext, useState, useEffect } from 'react'
import { expenseAPI } from '../services/api'
import api from '../services/api'

const customCategoryAPI = {
  getAll: ()     => api.get('/expenses/custom-categories/'),
  create: (data) => api.post('/expenses/custom-categories/', data),
  delete: (id)   => api.delete(`/expenses/custom-categories/${id}/`),
}

const ExpenseContext = createContext(null)

export const CATEGORIES = [
  { id: 1,  name: 'Food and Dining',   icon: '🍽️', color: '#FF6B6B' },
  { id: 2,  name: 'Groceries',         icon: '🛒',  color: '#4ECDC4' },
  { id: 3,  name: 'Transport',         icon: '🚗',  color: '#45B7D1' },
  { id: 4,  name: 'Rent and Housing',  icon: '🏠',  color: '#96CEB4' },
  { id: 5,  name: 'Utilities',         icon: '💡',  color: '#FFEAA7' },
  { id: 6,  name: 'Shopping',          icon: '🛍️', color: '#DDA0DD' },
  { id: 7,  name: 'Healthcare',        icon: '🏥',  color: '#98D8C8' },
  { id: 8,  name: 'Education',         icon: '📚',  color: '#7EC8E3' },
  { id: 9,  name: 'Entertainment',     icon: '🎬',  color: '#FFB347' },
  { id: 10, name: 'Travel',            icon: '✈️',  color: '#87CEEB' },
  { id: 11, name: 'Insurance',         icon: '🛡️', color: '#B0C4DE' },
  { id: 12, name: 'Investments',       icon: '📈',  color: '#90EE90' },
  { id: 13, name: 'Loan and EMI',      icon: '🏦',  color: '#F4A460' },
  { id: 14, name: 'Subscriptions',     icon: '📱',  color: '#DA70D6' },
  { id: 15, name: 'Personal Care',     icon: '💆',  color: '#FFB6C1' },
  { id: 16, name: 'Family Expenses',   icon: '👨‍👩‍👧', color: '#98FB98' },
  { id: 17, name: 'Other',             icon: '📦',  color: '#D3D3D3' },
]

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses]               = useState([])
  const [loading, setLoading]                 = useState(false)
  const [customCategories, setCustomCategories] = useState([])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await expenseAPI.getAll()
      setExpenses(response.data)
    } catch (error) {
      console.log('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomCategories = async () => {
    try {
      const res = await customCategoryAPI.getAll()
      setCustomCategories(res.data)
    } catch (error) {
      console.log('Error fetching custom categories:', error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('fintracker_access_token')
    if (token) {
      fetchExpenses()
      fetchCustomCategories()
    }
  }, [])

  const addExpense = async (exp) => {
    try {
      const response = await expenseAPI.add(exp)
      setExpenses(prev => [response.data, ...prev])
      return response.data
    } catch (error) {
      throw error
    }
  }

  const editExpense = async (id, data) => {
    try {
      const response = await expenseAPI.update(id, data)
      setExpenses(prev => prev.map(e => e.id === id ? response.data : e))
      return response.data
    } catch (error) {
      throw error
    }
  }

  const deleteExpense = async (id) => {
    try {
      await expenseAPI.delete(id)
      setExpenses(prev => prev.filter(e => e.id !== id))
    } catch (error) {
      throw error
    }
  }

  const addCustomCategory = async (data) => {
    try {
      const res = await customCategoryAPI.create(data)
      setCustomCategories(prev => [...prev, res.data])
      return res.data
    } catch (error) {
      throw error
    }
  }

  const deleteCustomCategory = async (id) => {
    try {
      await customCategoryAPI.delete(id)
      setCustomCategories(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      throw error
    }
  }

  return (
    <ExpenseContext.Provider value={{
      expenses,
      loading,
      fetchExpenses,
      addExpense,
      editExpense,
      deleteExpense,
      CATEGORIES,
      customCategories,
      addCustomCategory,
      deleteCustomCategory
    }}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpense() {
  return useContext(ExpenseContext)
}