import axios from 'axios'

export const API_HOST = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')
const BASE_URL = `${API_HOST}/api`

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintracker_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('fintracker_refresh_token')
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('fintracker_access_token', res.data.access)
          error.config.headers.Authorization = `Bearer ${res.data.access}`
          return axios(error.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// AUTH
export const authAPI = {
  register:       (data) => api.post('/auth/register/', data),
  login:          (data) => api.post('/auth/login/', data),
  logout:         (data) => api.post('/auth/logout/', data),
  getProfile:     ()     => api.get('/auth/profile/'),
  updateProfile:  (data) => api.put('/auth/profile/', data),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  verifyOTP:      (data) => api.post('/auth/verify-otp/', data),
  resetPassword:  (data) => api.post('/auth/reset-password/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  adminStats:     ()     => api.get('/auth/admin/stats/'),
  googleLogin:    (data) => api.post('/auth/google/', data),
  googleAuth:     (token) => api.post('/auth/google/', { token }),
}

// EXPENSES
export const expenseAPI = {
  getAll:      (params) => api.get('/expenses/', { params }),
  add:         (data)   => api.post('/expenses/', data),
  update:      (id, data) => api.put(`/expenses/${id}/`, data),
  delete:      (id)     => api.delete(`/expenses/${id}/`),
  getCategories: ()     => api.get('/expenses/categories/'),
  getSummary:  (params) => api.get('/expenses/summary/', { params }),
  onboarding:  (data)   => api.post('/expenses/onboarding/', data),
  uploadReceipt: (id, file) => {
    const formData = new FormData()
    formData.append('receipt', file)
    return api.post(`/expenses/${id}/receipt/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// REPORTS
export const reportAPI = {
  getSummary: (params) => api.get('/reports/', { params }),
  exportCSV:  (params) => api.get('/reports/export/', { params, responseType: 'blob' }),
}

// INSIGHTS
export const insightAPI = {
  getSummary: () => api.get('/insights/'),
}

export default api