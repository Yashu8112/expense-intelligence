import { useState, useEffect } from 'react'
import { reportAPI, aiAPI } from '../services/api'
import { FileText, FileSpreadsheet, Download, Loader2, Sparkles, TrendingUp, TrendingDown, Brain, Zap, AlertCircle, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import toast from 'react-hot-toast'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function ReportsPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()+1)
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear())
  const [summary, setSummary]             = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [pdfLoading, setPdfLoading]         = useState(false)
  const [xlsLoading, setXlsLoading]         = useState(false)
  const [customStart, setCustomStart] = useState(format(startOfMonth(now),'yyyy-MM-dd'))
  const [customEnd,   setCustomEnd]   = useState(format(endOfMonth(now),'yyyy-MM-dd'))

  const loadSummary = async () => {
    setSummaryLoading(true)
    try { const r = await aiAPI.getMonthlySummary(selectedMonth, selectedYear); setSummary(r.data.data) }
    catch(e) { toast.error('Failed to generate summary') }
    finally { setSummaryLoading(false) }
  }

  const downloadBlob = (data, filename, type) => {
    const blob = new Blob([data],{type}); const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const handlePdf = async () => {
    setPdfLoading(true)
    try { const r = await reportAPI.downloadPdf(customStart,customEnd); downloadBlob(r.data,`expense-report-${customStart}-to-${customEnd}.pdf`,'application/pdf'); toast.success('PDF downloaded!') }
    catch(e) { toast.error('PDF generation failed') }
    finally { setPdfLoading(false) }
  }

  const handleExcel = async () => {
    setXlsLoading(true)
    try { const r = await reportAPI.downloadExcel(customStart,customEnd); downloadBlob(r.data,`expense-report-${customStart}-to-${customEnd}.xlsx`,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); toast.success('Excel downloaded!') }
    catch(e) { toast.error('Excel generation failed') }
    finally { setXlsLoading(false) }
  }

  const prevMonth = () => { if(selectedMonth===1){setSelectedMonth(12);setSelectedYear(y=>y-1)} else setSelectedMonth(m=>m-1) }
  const nextMonth = () => { if(selectedMonth===12){setSelectedMonth(1);setSelectedYear(y=>y+1)} else setSelectedMonth(m=>m+1) }
  const isFuture  = selectedYear > now.getFullYear() || (selectedYear===now.getFullYear() && selectedMonth>now.getMonth()+1)
  const changePercent = summary?.changePercent || 0
  const isUp = changePercent > 0

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Export expense reports and view AI-generated monthly summaries</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Export */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Download size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-gray-900 dark:text-gray-100">Export Report</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Download your expense data</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="input-label">Start date</label>
                <input type="date" className="input-field" value={customStart} onChange={e => setCustomStart(e.target.value)} />
              </div>
              <div>
                <label className="input-label">End date</label>
                <input type="date" className="input-field" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2 mb-5 flex-wrap">
              {[
                { label:'This month',    start:format(startOfMonth(now),'yyyy-MM-dd'),         end:format(endOfMonth(now),'yyyy-MM-dd') },
                { label:'Last month',    start:format(startOfMonth(subMonths(now,1)),'yyyy-MM-dd'), end:format(endOfMonth(subMonths(now,1)),'yyyy-MM-dd') },
                { label:'Last 3 months', start:format(startOfMonth(subMonths(now,2)),'yyyy-MM-dd'), end:format(endOfMonth(now),'yyyy-MM-dd') },
              ].map(({ label,start,end }) => (
                <button key={label} onClick={() => { setCustomStart(start); setCustomEnd(end) }}
                  className={`btn btn-sm text-xs ${customStart===start&&customEnd===end ? 'btn-primary' : 'btn-secondary'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <button onClick={handlePdf} disabled={pdfLoading} className="btn btn-secondary btn-lg w-full justify-start gap-3 group">
                <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 rounded-xl flex items-center justify-center transition-colors">
                  <FileText size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Download PDF</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Professional formatted report</p>
                </div>
                {pdfLoading ? <Loader2 size={16} className="animate-spin text-gray-400 ml-auto" /> : <Download size={16} className="text-gray-400 ml-auto" />}
              </button>

              <button onClick={handleExcel} disabled={xlsLoading} className="btn btn-secondary btn-lg w-full justify-start gap-3 group">
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 rounded-xl flex items-center justify-center transition-colors">
                  <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Download Excel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full data with formatting</p>
                </div>
                {xlsLoading ? <Loader2 size={16} className="animate-spin text-gray-400 ml-auto" /> : <Download size={16} className="text-gray-400 ml-auto" />}
              </button>
            </div>
          </div>

          <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">What's included</span>
            </div>
            <ul className="space-y-1.5 text-xs text-blue-700 dark:text-blue-300">
              {['All expenses in the selected date range','AI-generated category labels','Payment method breakdowns','Merchant and description details','Total summaries per category'].map((item,i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Monthly Summary */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 ai-gradient rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-gray-900 dark:text-gray-100">AI Monthly Summary</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Groq AI financial analysis</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-5">
            <button onClick={prevMonth} className="btn btn-ghost btn-icon btn-sm"><ChevronLeft size={18} /></button>
            <div className="text-center">
              <p className="font-display font-bold text-gray-900 dark:text-gray-100">{MONTHS[selectedMonth-1]}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedYear}</p>
            </div>
            <button onClick={nextMonth} disabled={isFuture} className="btn btn-ghost btn-icon btn-sm disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>

          <button onClick={loadSummary} disabled={summaryLoading||isFuture} className="btn btn-primary btn-md w-full mb-5">
            {summaryLoading ? <><Loader2 size={15} className="animate-spin" />Analysing with AI...</> : <><Sparkles size={15} />Generate Summary</>}
          </button>

          {summary && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spending</p>
                  <p className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">
                    ₹{parseFloat(summary.totalSpending).toLocaleString('en-IN',{ minimumFractionDigits:2 })}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">vs. Previous Month</p>
                  <div className="flex items-center gap-1.5">
                    {isUp ? <TrendingUp size={16} className="text-red-500" /> : <TrendingDown size={16} className="text-emerald-500" />}
                    <span className={`text-xl font-display font-bold ${isUp ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {isUp?'+':''}{parseFloat(changePercent).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900">
                <Zap size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Top category: <strong>{summary.topCategory||'N/A'}</strong>
                </p>
              </div>

              {summary.aiNarrative && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl border border-blue-100 dark:border-blue-900">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Brain size={13} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">AI Analysis</span>
                  </div>
                  <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">{summary.aiNarrative}</p>
                </div>
              )}

              {summary.keyInsights?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Key Insights</p>
                  <ul className="space-y-2">
                    {summary.keyInsights.map((insight,i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{i+1}</span>
                        </div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!summary && !summaryLoading && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Brain size={22} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No summary yet</p>
              <p className="text-xs text-gray-400 mt-1">Select a month and generate your AI summary</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
