import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { expenseAPI, aiAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, TrendingDown, IndianRupee, Tag, Sparkles, ArrowUpRight, Brain, Zap, AlertCircle, RefreshCw, MessageSquare, BarChart2 } from 'lucide-react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler } from 'chart.js'
import { format } from 'date-fns'
import AiChatbot from '../components/AiChatbot'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler)

const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#f97316','#6366f1','#14b8a6','#ec4899']

function fmtINR(val) {
  if (!val && val !== 0) return '₹0.00'
  return '₹' + parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats]         = useState(null)
  const [insights, setInsights]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [genLoading, setGenLoading] = useState(false)
  const [chatOpen, setChatOpen]   = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, iRes] = await Promise.all([expenseAPI.dashboard(), aiAPI.getInsights(5)])
      setStats(sRes.data.data)
      setInsights(iRes.data.data || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const generateInsights = async () => {
    setGenLoading(true)
    try { const r = await aiAPI.generateInsights(); setInsights(r.data.data || []) }
    catch(e) { console.error(e) }
    finally { setGenLoading(false) }
  }

  const firstName = user?.fullName?.split(' ')[0] || 'there'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const doughnutData = stats?.categoryBreakdown ? {
    labels: stats.categoryBreakdown.slice(0,6).map(c => c.category),
    datasets:[{ data: stats.categoryBreakdown.slice(0,6).map(c => parseFloat(c.total)), backgroundColor: COLORS.slice(0,6), borderWidth:0, hoverOffset:6 }],
  } : null

  const barData = stats?.monthlyTrend ? {
    labels: stats.monthlyTrend.map(m => m.label),
    datasets:[{ label:'Spending', data: stats.monthlyTrend.map(m => parseFloat(m.total)), backgroundColor: '#3b82f620', borderColor:'#3b82f6', borderWidth:2, borderRadius:6 }],
  } : null

  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ grid:{ display:false }, ticks:{ font:{ size:11 }, color:'#94a3b8' } },
      y:{ grid:{ color:'#e2e8f020', lineWidth:1 }, ticks:{ font:{ size:11 }, color:'#94a3b8', callback: v => '₹'+(v>=1000?(v/1000).toFixed(1)+'k':v) } },
    },
  }

  const insightIcons  = { SPENDING_PATTERN:TrendingUp, BUDGET_REC:Zap, ANOMALY:AlertCircle, SUMMARY:Brain, TIP:Sparkles }
  const insightColors = {
    SPENDING_PATTERN: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900',
    BUDGET_REC:       'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900',
    ANOMALY:          'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900',
    SUMMARY:          'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-900',
    TIP:              'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900',
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">{greeting}, {firstName} 👋</h1>
          <p className="page-subtitle">{format(new Date(),'EEEE, MMMM d, yyyy')} — Here's your financial overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setChatOpen(true)} className="btn btn-secondary btn-md">
            <MessageSquare size={16} />FinBot
          </button>
          <Link to="/expenses" state={{ openAdd: true }} className="btn btn-primary btn-md">+ Add Expense</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="This Month"          value={fmtINR(stats?.totalThisMonth)}          icon={IndianRupee} iconBg="bg-blue-100 dark:bg-blue-900/30"    iconColor="text-blue-600 dark:text-blue-400"    change={stats?.changePercent} />
        <StatCard label="Highest Category"    value={stats?.highestCategory || '—'}           sub={fmtINR(stats?.highestCategoryAmount)}                     icon={Tag}         iconBg="bg-violet-100 dark:bg-violet-900/30" iconColor="text-violet-600 dark:text-violet-400" />
        <StatCard label="Total Transactions"  value={stats?.totalExpensesCount?.toLocaleString() || '0'}                                                     icon={TrendingUp}  iconBg="bg-emerald-100 dark:bg-emerald-900/30" iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Avg per Transaction" value={fmtINR(stats?.averageExpense)}            icon={ArrowUpRight} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 card p-5">
          <div className="mb-5">
            <h3 className="font-display font-bold text-gray-900 dark:text-gray-100">Monthly Spending Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
          </div>
          <div className="h-52">
            {barData ? <Bar data={barData} options={chartOpts} /> : <EmptyChart />}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-display font-bold text-gray-900 dark:text-gray-100">By Category</h3>
            <p className="text-xs text-gray-400 mt-0.5">This month</p>
          </div>
          {doughnutData ? (
            <>
              <div className="h-36 flex items-center justify-center">
                <Doughnut data={doughnutData} options={{ responsive:true, maintainAspectRatio:false, cutout:'70%', plugins:{ legend:{ display:false } } }} />
              </div>
              <div className="mt-4 space-y-2">
                {stats.categoryBreakdown.slice(0,4).map((c,i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[110px]">{c.category}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{parseFloat(c.percentage).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyChart />}
        </div>
      </div>

      {/* AI Insights */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg ai-gradient flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 dark:text-gray-100">AI Insights</h3>
              <p className="text-xs text-gray-400">Powered by Groq AI</p>
            </div>
          </div>
          <button onClick={generateInsights} disabled={genLoading} className="btn btn-secondary btn-sm">
            {genLoading ? <><RefreshCw size={13} className="animate-spin" />Generating...</> : <><Sparkles size={13} />Generate New</>}
          </button>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Brain size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">No insights yet</p>
            <p className="text-gray-400 text-xs mt-1 mb-4">Click "Generate New" to get AI-powered spending insights</p>
            <button onClick={generateInsights} disabled={genLoading} className="btn btn-primary btn-sm">
              <Sparkles size={13} />Generate Insights
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((insight,i) => {
              const Icon  = insightIcons[insight.insightType] || Sparkles
              const color = insightColors[insight.insightType] || insightColors.TIP
              return (
                <div key={i} className={`p-4 rounded-xl border ${color} hover:shadow-sm transition-all duration-200`}>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/60 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1 leading-snug">{insight.title}</p>
                      <p className="text-xs opacity-80 leading-relaxed line-clamp-3">{insight.content}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {chatOpen && <AiChatbot onClose={() => setChatOpen(false)} />}
    </div>
  )
}

function StatCard({ label, value, sub, icon:Icon, iconBg, iconColor, change }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={17} className={iconColor} />
        </div>
        {change !== undefined && (
          <span className={parseFloat(change) > 0 ? 'stat-change-down' : 'stat-change-up'}>
            {parseFloat(change) > 0
              ? <TrendingUp size={10} className="inline mr-0.5" />
              : <TrendingDown size={10} className="inline mr-0.5" />}
            {Math.abs(parseFloat(change)).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="stat-value">{value}</p>
        {sub && <p className="text-xs text-gray-400 font-medium">{sub}</p>}
        <p className="stat-label">{label}</p>
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <BarChart2 size={24} className="mx-auto mb-2 opacity-40" />
        <p className="text-xs">No data yet</p>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse space-y-6">
      <div className="h-8 skeleton w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 h-72 skeleton rounded-2xl" />
        <div className="h-72 skeleton rounded-2xl" />
      </div>
      <div className="h-64 skeleton rounded-2xl" />
    </div>
  )
}
