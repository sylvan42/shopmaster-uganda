import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Modal } from '../Modal'
import { EXPENSE_CATEGORIES } from '../../services/expensesService'

const EMPTY = () => ({
  category: EXPENSE_CATEGORIES[0],
  amount: '',
  description: '',
  expense_date: format(new Date(), 'yyyy-MM-dd'),
})

export const ExpenseFormModal = ({ open, onClose, onSave, expense = null, saving = false }) => {
  const isEdit = Boolean(expense)
  const [values, setValues] = useState(EMPTY())
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setErrors({})
    setValues(
      expense
        ? {
            category: expense.category || EXPENSE_CATEGORIES[0],
            amount: String(expense.amount ?? ''),
            description: expense.description || '',
            expense_date: expense.expense_date || format(new Date(), 'yyyy-MM-dd'),
          }
        : EMPTY()
    )
  }, [open, expense])

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    const amount = Number(values.amount)
    if (values.amount === '' || isNaN(amount) || amount <= 0) errs.amount = 'Enter an amount greater than zero'
    if (!values.expense_date) errs.expense_date = 'Pick a date'
    setErrors(errs)
    if (Object.keys(errs).length) return
    onSave({
      category: values.category,
      amount,
      description: values.description.trim() || null,
      expense_date: values.expense_date,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Expense' : 'Add Expense'}
      footer={
        <>
          <button className="btn-outline-on-light" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary-pill" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add expense'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-[16px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          <div>
            <label className="block text-body-strong text-ink mb-[6px]">Category</label>
            <select className="text-input appearance-none cursor-pointer" value={values.category} onChange={set('category')}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-body-strong text-ink mb-[6px]">Amount (UGX) *</label>
            <input type="number" min="0" step="100" className="text-input" value={values.amount}
              onChange={set('amount')} placeholder="0" />
            {errors.amount && <p className="text-caption text-[#991b1b] mt-[4px]">{errors.amount}</p>}
          </div>
        </div>
        <div>
          <label className="block text-body-strong text-ink mb-[6px]">Date *</label>
          <input type="date" className="text-input" value={values.expense_date} onChange={set('expense_date')} />
          {errors.expense_date && <p className="text-caption text-[#991b1b] mt-[4px]">{errors.expense_date}</p>}
        </div>
        <div>
          <label className="block text-body-strong text-ink mb-[6px]">Description</label>
          <input className="text-input" value={values.description} onChange={set('description')}
            placeholder="e.g. Shop rent for June" />
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  )
}
