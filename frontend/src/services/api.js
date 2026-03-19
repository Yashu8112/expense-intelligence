import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    const msg = error.response?.data?.error || 'Something went wrong'
    if (error.response?.status !== 401) toast.error(msg)
    return Promise.reject(error)
  }
)

// ──────────────────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data)   => api.post('/auth/signup', data),
  login:  (data)   => api.post('/auth/login', data),
  getMe:  ()       => api.get('/auth/me'),
  googleUrl:  ()   => '#',
  githubUrl:  ()   => '#',
}

// ──────────────────────────────────────────────────────────
// EXPENSES
// ──────────────────────────────────────────────────────────
export const expenseAPI = {
  create:     (data)        => api.post('/expenses', data),
  getAll:     (params)      => api.get('/expenses', { params }),
  getById:    (id)          => api.get(`/expenses/${id}`),
  update:     (id, data)    => api.put(`/expenses/${id}`, data),
  delete:     (id)          => api.delete(`/expenses/${id}`),
  dashboard:  ()            => api.get('/expenses/dashboard/stats'),
  categories: ()            => api.get('/expenses/categories'),
}

// ──────────────────────────────────────────────────────────
// AI
// ──────────────────────────────────────────────────────────
export const aiAPI = {
  generateInsights:      ()                  => api.post('/ai/insights/generate'),
  getInsights:           (limit = 10)        => api.get('/ai/insights', { params: { limit } }),
  getBudgetRecs:         ()                  => api.get('/ai/budget-recommendations'),
  getMonthlySummary:     (month, year)       => api.get('/ai/monthly-summary', { params: { month, year } }),
  chat:                  (data)              => api.post('/ai/chat', data),
  getChatHistory:        (sessionId)         => api.get(`/ai/chat/history/${sessionId}`),
}

// ──────────────────────────────────────────────────────────
// REPORTS
// ──────────────────────────────────────────────────────────
export const reportAPI = {
  downloadPdf: (startDate, endDate) =>
    api.get('/reports/pdf', {
      params: { startDate, endDate },
      responseType: 'blob',
    }),
  downloadExcel: (startDate, endDate) =>
    api.get('/reports/excel', {
      params: { startDate, endDate },
      responseType: 'blob',
    }),
}

export default api
