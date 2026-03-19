import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import SignupPage     from './pages/SignupPage'
import DashboardPage  from './pages/DashboardPage'
import ExpensesPage   from './pages/ExpensesPage'
import ReportsPage    from './pages/ReportsPage'
import OAuth2Redirect from './pages/OAuth2Redirect'
import AppLayout      from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
        }}
      />
      <Routes>
        <Route path="/"                 element={<LandingPage />} />
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/signup"           element={<SignupPage />} />
        <Route path="/oauth2/redirect"  element={<OAuth2Redirect />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/expenses"   element={<ExpensesPage />} />
          <Route path="/reports"    element={<ReportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  )
}
