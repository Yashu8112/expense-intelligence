import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sparkles, TrendingUp, Brain, Shield, BarChart3, Zap, ArrowRight, CheckCircle2, Sun, Moon } from 'lucide-react'

const features = [
  { icon: Brain,    title: 'AI Categorization',      desc: 'Every expense is automatically categorized using Groq AI. No manual tagging — ever.',                         grad: 'from-violet-500 to-purple-600' },
  { icon: TrendingUp, title: 'Spending Insights',    desc: 'Get personalized AI-driven insights on your spending patterns and anomalies.',                              grad: 'from-blue-500 to-cyan-500' },
  { icon: BarChart3,  title: 'Smart Reports',        desc: 'Export beautiful PDF and Excel reports with one click.',                                                    grad: 'from-emerald-500 to-teal-500' },
  { icon: Zap,        title: 'Budget Recommendations',desc: 'AI analyses 3 months of history and suggests optimal budgets per category.',                               grad: 'from-amber-500 to-orange-500' },
  { icon: Shield,     title: 'Bank-Grade Security',  desc: 'JWT authentication. Your data is encrypted and never shared.',                                              grad: 'from-rose-500 to-pink-500' },
  { icon: Sparkles,   title: 'FinBot Assistant',     desc: 'Ask your AI financial assistant anything about your spending in plain English.',                            grad: 'from-indigo-500 to-blue-600' },
]

const stats = [
  { value:'99.9%', label:'Categorization accuracy' },
  { value:'< 2s',  label:'AI response time' },
  { value:'14+',   label:'Expense categories' },
  { value:'0',     label:'Manual entries required' },
]

const checks = [
  'Automatic AI expense categorization',
  'Personalized spending insights',
  'PDF & Excel report exports',
  'AI budget recommendations',
  'Financial chatbot assistant',
]

export default function LandingPage() {
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-200">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl ai-gradient flex items-center justify-center shadow-sm">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 dark:text-gray-100 text-[15px]">
              Expense <span className="text-blue-600">Intelligence</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Features</a>
            <a href="#stats"    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Why Us</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login"  className="btn btn-ghost btn-sm text-gray-700 dark:text-gray-300">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get started <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 opacity-40 dark:opacity-10 pointer-events-none"
             style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.8'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 mb-8">
            <Sparkles size={14} className="text-blue-500" />
            Powered by Groq AI
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 dark:text-gray-100 leading-[1.05] tracking-tight mb-6">
            Your finances,<br />
            <span className="text-gradient">intelligently</span> managed
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing where your money goes. Expense Intelligence uses AI to automatically categorize, analyse, and optimize every rupee you spend.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="btn btn-primary btn-lg shadow-md shadow-blue-500/20">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign in to your account
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-5">No credit card required · Free forever</p>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="rounded-2xl overflow-hidden shadow-[0_25px_60px_-12px_rgb(0,0,0,0.18)] border border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-white dark:bg-gray-700 rounded-md h-6 text-xs text-gray-400 flex items-center px-3 font-mono">
                app.expenseintel.ai/dashboard
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label:'Monthly Spending', value:'₹42,890', change:'+12%', up:true },
                  { label:'Highest Category', value:'Shopping', sub:'₹12,400' },
                  { label:'AI Insights',       value:'5 New',   sub:'Generated today' },
                ].map((s,i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 font-medium mb-2">{s.label}</p>
                    <p className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                    {s.change && <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{s.change} vs last month</span>}
                    {s.sub    && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.sub}</p>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 h-32 flex items-center justify-center">
                  <div className="flex items-end gap-2 h-20">
                    {[60,80,55,90,70,95,75].map((h,i) => (
                      <div key={i} className="w-7 bg-blue-100 dark:bg-blue-900/40 rounded-sm relative flex items-end">
                        <div className="w-full bg-blue-500 rounded-sm" style={{ height:`${h}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Top Categories</p>
                  {[
                    { cat:'Shopping', pct:35, color:'bg-violet-400' },
                    { cat:'Food',     pct:28, color:'bg-blue-400' },
                    { cat:'Travel',   pct:20, color:'bg-emerald-400' },
                  ].map((c,i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${c.color}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{c.cat}</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 bg-gray-900 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s,i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-display font-bold text-white mb-2">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">Everything you need to master your finances</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">One platform with all the AI-powered tools to understand and optimize your spending.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon:Icon, title, desc, grad },i) => (
              <div key={i} className="card-hover p-6 group">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-gray-900 dark:text-gray-100 mb-2 text-[15px]">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">Start tracking smarter today</h2>
            <ul className="space-y-3">
              {checks.map((c,i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" />{c}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <div className="card p-8 w-full md:w-80">
              <h3 className="font-display font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Create your free account</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">No credit card required. Set up in under 2 minutes.</p>
              <Link to="/signup" className="btn btn-primary btn-lg w-full mb-3">Get started free <ArrowRight size={16} /></Link>
              <Link to="/login"  className="btn btn-secondary btn-md w-full">I already have an account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg ai-gradient flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Expense Intelligence</span>
          </div>
          <p>© {new Date().getFullYear()} Expense Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
