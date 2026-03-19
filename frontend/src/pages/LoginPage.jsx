import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2, Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const { login }     = useAuth()
  const { dark, toggle } = useTheme()
  const navigate      = useNavigate()
  const location      = useLocation()
  const from          = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]     = useState({ email:'', password:'' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email)                          e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email  = 'Invalid email'
    if (!form.password)                       e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Login failed' })
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-200">
      {/* Left panel */}
      <div className="auth-left-panel">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">Expense Intelligence</span>
        </Link>
        <div>
          <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
            Your money,<br />your insights.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            AI-powered expense tracking that understands your spending and helps you save more.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v:'99%',   l:'AI accuracy' },
              { v:'< 2s',  l:'Categorization speed' },
              { v:'14+',   l:'Smart categories' },
              { v:'Free',  l:'Forever plan' },
            ].map(({ v,l },i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-2xl font-display font-bold text-white">{v}</p>
                <p className="text-blue-100 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200/70 text-sm">© {new Date().getFullYear()} Expense Intelligence</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-950 transition-colors duration-200">
        {/* Theme toggle top-right */}
        <button onClick={toggle}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl ai-gradient flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 dark:text-gray-100">Expense Intelligence</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>
          </div>

          {errors.form && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email address</label>
              <input type="email" placeholder="you@company.com"
                className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400/20' : ''}`}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              {errors.email && <p className="input-error">{errors.email}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400/20' : ''}`}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="input-error">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
