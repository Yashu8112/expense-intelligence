import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const saveAuth = useCallback((authData) => {
    const { accessToken, user: userData } = authData
    localStorage.setItem('token', accessToken)
    setToken(accessToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) { setLoading(false); return }
      try {
        const res = await authAPI.getMe()
        setUser(res.data.data.user)
      } catch {
        localStorage.removeItem('token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const signup = async (data) => {
    const res = await authAPI.signup(data)
    saveAuth(res.data.data)
    toast.success('Welcome to Expense Intelligence! 🎉')
  }

  const login = async (data) => {
    const res = await authAPI.login(data)
    saveAuth(res.data.data)
    toast.success(`Welcome back, ${res.data.data.user.fullName.split(' ')[0]}!`)
  }

  const value = { user, token, loading, login, signup, logout, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
