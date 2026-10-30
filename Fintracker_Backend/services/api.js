import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fintracker_access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Auto refresh token when expired
let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refresh = localStorage.getItem('fintracker_refresh_token')

      if (!refresh) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh })
        const newToken = res.data.access

        localStorage.setItem('fintracker_access_token', newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        processQueue(null, newToken)
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

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
}

export const expenseAPI = {
  getAll:        (params)   => api.get('/expenses/', { params }),
  add:           (data)     => api.post('/expenses/', data),
  update:        (id, data) => api.put(`/expenses/${id}/`, data),
  delete:        (id)       => api.delete(`/expenses/${id}/`),
  getCategories: ()         => api.get('/expenses/categories/'),
  getSummary:    (params)   => api.get('/expenses/summary/', { params }),
  onboarding:    (data)     => api.post('/expenses/onboarding/', data),
  uploadReceipt: (id, file) => {
    const formData = new FormData()
    formData.append('receipt', file)
    return api.post(`/expenses/${id}/receipt/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const reportAPI = {
  getSummary: (params) => api.get('/reports/', { params }),
  exportCSV:  (params) => api.get('/reports/export/', { params, responseType: 'blob' }),
}

export const insightAPI = {
  getSummary: () => api.get('/insights/'),
}

export const budgetAPI = {
  getAll: (params) => api.get('/expenses/budgets/', { params }),
  save:   (data)   => api.post('/expenses/budgets/', data),
  delete: (id)     => api.delete(`/expenses/budgets/${id}/`),
}

export const goalAPI = {
  getAll: ()         => api.get('/expenses/goals/'),
  create: (data)     => api.post('/expenses/goals/', data),
  update: (id, data) => api.put(`/expenses/goals/${id}/`, data),
  delete: (id)       => api.delete(`/expenses/goals/${id}/`),
}

export const recurringAPI = {
  getAll: ()     => api.get('/expenses/recurring/'),
  create: (data) => api.post('/expenses/recurring/', data),
  delete: (id)   => api.delete(`/expenses/recurring/${id}/`),
}

export const billSplitAPI = {
  getAll:       ()         => api.get('/expenses/bill-splits/'),
  create:       (data)     => api.post('/expenses/bill-splits/', data),
  updateMember: (id, data) => api.put(`/expenses/bill-splits/${id}/`, data),
  delete:       (id)       => api.delete(`/expenses/bill-splits/${id}/`),
}

// CUSTOM CATEGORIES
export const customCategoryAPI = {
  getAll: ()     => api.get('/expenses/custom-categories/'),
  create: (data) => api.post('/expenses/custom-categories/', data),
  delete: (id)   => api.delete(`/expenses/custom-categories/${id}/`),
}

export default api