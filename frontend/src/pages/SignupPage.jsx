import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2, CheckCircle2, Sun, Moon } from 'lucide-react'

const pwChecks = [
  { label:'At least 8 characters', test: v => v.length >= 8 },
  { label:'Contains a number',     test: v => /\d/.test(v) },
  { label:'Contains a letter',     test: v => /[a-zA-Z]/.test(v) },
]

export default function SignupPage() {
  const { signup }       = useAuth()
  const { dark, toggle } = useTheme()
  const navigate         = useNavigate()

  const [form, setForm]     = useState({ fullName:'', email:'', password:'' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.fullName || form.fullName.trim().length < 2) e.fullName = 'Full name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))  e.email    = 'Valid email is required'
    if (!form.password || form.password.length < 8)        e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Signup failed. Please try again.' })
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
            Take control of<br />your finances
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Join thousands of users who use AI to automatically track, categorize, and optimize their spending.
          </p>
          <div className="space-y-4">
            {[
              'Free forever — no credit card needed',
              'AI categorizes expenses automatically',
              'Export reports in PDF and Excel',
              'Bank-grade security & encryption',
            ].map((f,i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={13} className="text-white" />
                </div>
                <span className="text-blue-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-200/70 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-medium hover:underline">Sign in</Link>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-950 transition-colors duration-200">
        {/* Theme toggle */}
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
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-2">Create your account</h1>
            <p className="text-gray-500 dark:text-gray-400">Start managing your expenses with AI today</p>
          </div>

          {errors.form && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full name</label>
              <input type="text" placeholder="Priya Sharma"
                className={`input-field ${errors.fullName ? 'border-red-400' : ''}`}
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
              {errors.fullName && <p className="input-error">{errors.fullName}</p>}
            </div>

            <div>
              <label className="input-label">Email address</label>
              <input type="email" placeholder="you@company.com"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              {errors.email && <p className="input-error">{errors.email}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="input-error">{errors.password}</p>}
              {form.password && (
                <div className="mt-2 space-y-1">
                  {pwChecks.map(({ label, test },i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${test(form.password) ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {test(form.password) && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className={`text-xs ${test(form.password) ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                : <>Create free account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account, you agree to our{' '}
            <span className="underline cursor-pointer">Terms</span> and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
