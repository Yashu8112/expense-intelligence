import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { expenseAPI } from '../services/api'
import { Plus, Search, Trash2, Edit3, ChevronLeft, ChevronRight, SlidersHorizontal, X, Loader2, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import ExpenseForm from '../components/ExpenseForm'
import toast from 'react-hot-toast'

const PAYMENT_LABELS = { CASH:'Cash', CARD:'Card', UPI:'UPI', BANK_TRANSFER:'Bank', OTHER:'Other' }

export default function ExpensesPage() {
  const location = useLocation()
  const [expenses, setExpenses]   = useState([])
  const [categories, setCategories] = useState([])
  const [pag, setPag]             = useState({ page:0, size:15, total:0, totalPages:0 })
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [deleting, setDeleting]   = useState(null)
  const [filters, setFilters]     = useState({ search:'', categoryId:'', startDate:'', endDate:'', page:0, size:15 })

  useEffect(() => {
    if (location.state?.openAdd) {
      setEditTarget(null)
      setShowForm(true)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search)     params.search     = filters.search
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.startDate)  params.startDate  = filters.startDate
      if (filters.endDate)    params.endDate    = filters.endDate
      params.page = filters.page; params.size = filters.size
      const res = await expenseAPI.getAll(params)
      const d   = res.data.data
      setExpenses(d.content || [])
      setPag({ page:d.page, size:d.size, total:d.totalElements, totalPages:d.totalPages })
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])
  useEffect(() => { expenseAPI.categories().then(r => setCategories(r.data.data || [])) }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    setDeleting(id)
    try {
      await expenseAPI.delete(id);
      toast.success('Expense deleted');
      setExpenses(prev => prev.filter(e => e.id !== id));
      setPag(p => ({ ...p, total: Math.max(0, p.total - 1) }));
      fetchExpenses();
    }
    catch(e) { console.error(e) }
    finally { setDeleting(null) }
  }

  const handleFormSuccess = (savedExpense) => {
    setShowForm(false);
    setEditTarget(null);
    if (savedExpense && !editTarget) {
      setExpenses(prev => [savedExpense, ...prev.filter(e => e.id !== savedExpense.id)]);
      setPag(p => ({ ...p, total: p.total + 1 }));
    }
    fetchExpenses();
  }
  const handleEdit = (e) => { setEditTarget(e); setShowForm(true) }
  const resetFilters = () => setFilters({ search:'', categoryId:'', startDate:'', endDate:'', page:0, size:15 })
  const hasActive = filters.search || filters.categoryId || filters.startDate || filters.endDate

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{pag.total.toLocaleString()} total transactions</p>
        </div>
        <button onClick={() => { setEditTarget(null); setShowForm(true) }} className="btn btn-primary btn-md">
          <Plus size={16} />Add Expense
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="card p-4 mb-5">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search expenses..."
              className="input-field pl-9"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search:e.target.value, page:0 }))} />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`btn btn-sm gap-1.5 ${showFilters || hasActive ? 'btn-primary' : 'btn-secondary'}`}>
            <SlidersHorizontal size={14} />Filters
            {hasActive && <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">•</span>}
          </button>
          {hasActive && <button onClick={resetFilters} className="btn btn-ghost btn-sm text-red-600 dark:text-red-400"><X size={14} />Clear</button>}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="input-label">Category</label>
              <select className="input-field" value={filters.categoryId}
                onChange={e => setFilters(f => ({ ...f, categoryId:e.target.value, page:0 }))}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">From date</label>
              <input type="date" className="input-field" value={filters.startDate}
                onChange={e => setFilters(f => ({ ...f, startDate:e.target.value, page:0 }))} />
            </div>
            <div>
              <label className="input-label">To date</label>
              <input type="date" className="input-field" value={filters.endDate}
                onChange={e => setFilters(f => ({ ...f, endDate:e.target.value, page:0 }))} />
            </div>
            <div>
              <label className="input-label">Per page</label>
              <select className="input-field" value={filters.size}
                onChange={e => setFilters(f => ({ ...f, size:Number(e.target.value), page:0 }))}>
                {[10,15,25,50].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Description</th>
                <th className="th">Date</th>
                <th className="th">Category</th>
                <th className="th">Payment</th>
                <th className="th text-right">Amount</th>
                <th className="th w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_,i) => (
                  <tr key={i}>{[1,2,3,4,5,6].map(j => (
                    <td key={j} className="td"><div className="h-4 skeleton rounded w-3/4" /></td>
                  ))}</tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="td text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <IndianRupee size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">No expenses found</p>
                        <p className="text-sm text-gray-400 mt-1">{hasActive ? 'Try adjusting your filters' : 'Add your first expense'}</p>
                      </div>
                      {!hasActive && (
                        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm mt-1">
                          <Plus size={14} />Add Expense
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="tr-hover group">
                    <td className="td">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[180px]">{expense.title}</p>
                          {expense.merchant && <p className="text-xs text-gray-400 truncate max-w-[180px]">{expense.merchant}</p>}
                        </div>
                        {expense.aiProcessed && <span className="ai-badge flex-shrink-0">AI</span>}
                      </div>
                    </td>
                    <td className="td text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(expense.expenseDate),'MMM d, yyyy')}
                    </td>
                    <td className="td">
                      {expense.category ? (
                        <CategoryBadge name={expense.category.name} color={expense.category.color} />
                      ) : expense.aiCategory ? (
                        <span className="badge badge-blue text-[11px]">{expense.aiCategory}</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="td">
                      <span className="badge badge-gray text-[11px]">
                        {PAYMENT_LABELS[expense.paymentMethod] || expense.paymentMethod || '—'}
                      </span>
                    </td>
                    <td className="td text-right">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-sm">
                        ₹{parseFloat(expense.amount).toLocaleString('en-IN', { minimumFractionDigits:2 })}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1">{expense.currency}</span>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(expense)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors" title="Edit">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} disabled={deleting === expense.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Delete">
                          {deleting === expense.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pag.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {pag.page * pag.size + 1}–{Math.min((pag.page+1)*pag.size, pag.total)} of {pag.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setFilters(f => ({ ...f, page:f.page-1 }))} disabled={pag.page === 0}
                className="btn btn-ghost btn-icon btn-sm disabled:opacity-30"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(5, pag.totalPages) }, (_,i) => {
                const start = Math.max(0, Math.min(pag.page-2, pag.totalPages-5))
                const p = start+i
                return (
                  <button key={p} onClick={() => setFilters(f => ({ ...f, page:p }))}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p===pag.page ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {p+1}
                  </button>
                )
              })}
              <button onClick={() => setFilters(f => ({ ...f, page:f.page+1 }))} disabled={pag.page >= pag.totalPages-1}
                className="btn btn-ghost btn-icon btn-sm disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <ExpenseForm expense={editTarget} categories={categories}
          onSuccess={handleFormSuccess} onClose={() => { setShowForm(false); setEditTarget(null) }} />
      )}
    </div>
  )
}

function CategoryBadge({ name, color }) {
  return (
    <span className="badge text-[11px] font-medium"
      style={{ backgroundColor:(color||'#3b82f6')+'18', color:color||'#3b82f6', border:'1px solid '+(color||'#3b82f6')+'30' }}>
      {name}
    </span>
  )
}
