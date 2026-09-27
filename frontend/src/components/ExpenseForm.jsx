import { useState } from 'react'
import { expenseAPI } from '../services/api'
import { X, Loader2, Calendar, Tag, CreditCard, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = ['CARD','CASH','UPI','BANK_TRANSFER','OTHER']

export default function ExpenseForm({ expense, categories, onSuccess, onClose }) {
  const isEdit = !!expense
  const [form, setForm] = useState({
    title:         expense?.title         || '',
    description:   expense?.description   || '',
    amount:        expense?.amount        || '',
    currency:      expense?.currency      || 'INR',
    expenseDate:   expense?.expenseDate   || new Date().toISOString().slice(0,10),
    categoryId:    expense?.category?.id  || '',
    paymentMethod: expense?.paymentMethod || 'CARD',
    merchant:      expense?.merchant      || '',
    notes:         expense?.notes         || '',
    isRecurring:   expense?.isRecurring   || false,
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.amount)       e.amount = 'Amount is required'
    else if (isNaN(form.amount)||parseFloat(form.amount)<=0) e.amount = 'Enter a valid amount'
    if (!form.expenseDate)  e.expenseDate = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      let res;
      if (isEdit) {
        res = await expenseAPI.update(expense.id, payload);
        toast.success('Expense updated!');
      } else {
        res = await expenseAPI.create(payload);
        toast.success('Expense added! AI is categorizing it...');
      }
      onSuccess(res?.data?.data);
    } catch(e) { toast.error(e.response?.data?.error || 'Failed to save expense') }
    finally { setLoading(false) }
  }

  const set = k => e => setForm(f => ({ ...f, [k]:e.target.value }))

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box w-full max-w-xl">
        <div className="modal-header">
          <div>
            <h2 className="font-display font-bold text-gray-900 dark:text-gray-100 text-lg">
              {isEdit ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit ? 'Update expense details' : 'AI will auto-categorize this expense'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon text-gray-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div>
              <label className="input-label">Title <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Lunch at Saravana" autoFocus
                className={`input-field ${errors.title ? 'border-red-400' : ''}`}
                value={form.title} onChange={set('title')} />
              {errors.title && <p className="input-error">{errors.title}</p>}
            </div>

            <div>
                <label className="input-label">Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none">₹</span>
                  <input type="number" step="0.01" min="0.01" placeholder="0.00"
                    className={`input-field pl-8 ${errors.amount ? 'border-red-400' : ''}`}
                    value={form.amount} onChange={set('amount')} />
                </div>
                {errors.amount && <p className="input-error">{errors.amount}</p>}
              </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" className={`input-field pl-8 ${errors.expenseDate ? 'border-red-400' : ''}`}
                    value={form.expenseDate} onChange={set('expenseDate')} />
                </div>
                {errors.expenseDate && <p className="input-error">{errors.expenseDate}</p>}
              </div>
              <div>
                <label className="input-label">Payment method</label>
                <div className="relative">
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="input-field pl-8" value={form.paymentMethod} onChange={set('paymentMethod')}>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Category</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select className="input-field pl-8" value={form.categoryId} onChange={set('categoryId')}>
                    <option value="">Auto (AI will pick)</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Merchant</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="e.g. Swiggy" className="input-field pl-8" value={form.merchant} onChange={set('merchant')} />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">Description</label>
              <textarea rows={2} placeholder="Optional description..." className="input-field resize-none" value={form.description} onChange={set('description')} />
            </div>
            <div>
              <label className="input-label">Notes</label>
              <input type="text" placeholder="Any additional notes..." className="input-field" value={form.notes} onChange={set('notes')} />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <div onClick={() => setForm(f => ({ ...f, isRecurring:!f.isRecurring }))}
                className={`w-9 h-5 rounded-full transition-colors relative ${form.isRecurring ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${form.isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Recurring expense</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-md">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-md">
              {loading
                ? <><Loader2 size={15} className="animate-spin" />Saving...</>
                : isEdit ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}