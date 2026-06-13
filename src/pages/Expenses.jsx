import { useMemo, useState } from 'react'
import { Receipt, Search, Plus, Edit2, Trash2, ChevronDown, Download } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { StatTile } from '../components/StatTile'
import { DateRangePicker } from '../components/DateRangePicker'
import { ExpenseFormModal } from '../components/forms/ExpenseFormModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDateRange } from '../hooks/useDateRange'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { expensesService, EXPENSE_CATEGORIES } from '../services/expensesService'
import { CHART_COLORS, tooltipStyle } from '../lib/chartConfig'
import { formatUGX, formatUGXShort, formatDate } from '../lib/formatters'
import { downloadCsv } from '../utils/csv'

export const Expenses = () => {
  const { shopId, user } = useAuth()
  const toast = useToast()
  const range = useDateRange('month')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data: expenses, loading, error, refetch } = useSupabaseQuery(
    () => expensesService.list({ from: range.from, to: range.to }),
    [range.from.getTime(), range.to.getTime()]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return (expenses || []).filter((e) => {
      const matchSearch = !q || (e.description || '').toLowerCase().includes(q)
      const matchCat = category === 'All' || e.category === category
      return matchSearch && matchCat
    })
  }, [expenses, search, category])

  const total = useMemo(() => filtered.reduce((s, e) => s + Number(e.amount), 0), [filtered])
  const largest = useMemo(
    () => filtered.reduce((max, e) => (Number(e.amount) > Number(max?.amount || 0) ? e : max), null),
    [filtered]
  )

  const pieData = useMemo(() => {
    const byCat = filtered.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
      return acc
    }, {})
    return Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filtered])

  const handleSave = async (values) => {
    setSaving(true)
    const op = editing
      ? expensesService.update(editing.id, values)
      : expensesService.create(shopId, user.id, values)
    const { error } = await op
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(editing ? 'Expense updated' : 'Expense added')
      setFormOpen(false)
      setEditing(null)
      refetch()
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    const { error } = await expensesService.remove(deleting.id)
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Expense deleted')
      setDeleting(null)
      refetch()
    }
  }

  const handleExport = () => {
    downloadCsv(`expenses-${range.label.toLowerCase().replace(/\s+/g, '-')}`, filtered, [
      { key: (e) => formatDate(e.expense_date), label: 'Date' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount (UGX)' },
      { key: (e) => e.creator?.full_name || e.creator?.email || '', label: 'Recorded By' },
    ])
  }

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-[24px]">
      <PageHeader title="Expenses" subtitle="Track and categorise business spending"
        action={
          <div className="flex gap-[8px]">
            <button className="btn-outline-on-light flex items-center gap-[8px]" onClick={handleExport}
              disabled={!filtered.length}>
              <Download size={16} /> Export
            </button>
            <button className="btn-primary-pill flex items-center gap-[8px]"
              onClick={() => { setEditing(null); setFormOpen(true) }}>
              <Plus size={16} /> Add Expense
            </button>
          </div>
        }
      />

      <div className="card-standard">
        <DateRangePicker range={range} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
        <StatTile label={`Total (${range.label})`} value={formatUGX(total)} />
        <StatTile label="Entries" value={filtered.length} />
        <StatTile label="Largest" value={largest ? largest.category : '—'}
          subValue={largest ? formatUGX(largest.amount) : undefined} />
      </div>

      {/* Filters */}
      <div className="card-standard py-[14px]">
        <div className="flex flex-col sm:flex-row gap-[12px] items-start sm:items-center">
          <div className="relative flex-1 min-w-0 w-full">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
            <input className="search-input" placeholder="Search expenses…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <select className="text-input pr-[32px] appearance-none cursor-pointer text-caption py-[9px]"
              value={category} onChange={(e) => setCategory(e.target.value)}>
              {['All', ...EXPENSE_CATEGORIES].map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-shade-60 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card-standard">
          <EmptyState icon={Receipt} title="No expenses in this period"
            subtitle="Record rent, utilities, restocking and other costs to track your true profit."
            action={
              <button className="btn-primary-pill flex items-center gap-[8px]"
                onClick={() => { setEditing(null); setFormOpen(true) }}>
                <Plus size={16} /> Add Expense
              </button>
            } />
        </div>
      ) : (
        <>
          <div className="table-container">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th-cell">Date</th>
                    <th className="th-cell">Description</th>
                    <th className="th-cell">Category</th>
                    <th className="th-cell">Amount</th>
                    <th className="th-cell">Recorded By</th>
                    <th className="th-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((expense) => (
                    <tr key={expense.id} className="hover:bg-canvas-cream transition-colors">
                      <td className="td-cell text-caption text-shade-60">{formatDate(expense.expense_date, 'dd MMM yyyy')}</td>
                      <td className="td-cell max-w-[260px]">
                        <span className="block truncate font-medium text-ink" title={expense.description || ''}>
                          {expense.description || '—'}
                        </span>
                      </td>
                      <td className="td-cell"><span className="pill-tag-shade">{expense.category}</span></td>
                      <td className="td-cell font-medium text-ink">{formatUGX(expense.amount)}</td>
                      <td className="td-cell text-body-md text-shade-60">{expense.creator?.full_name || expense.creator?.email || '—'}</td>
                      <td className="td-cell">
                        <div className="flex items-center gap-[4px]">
                          <button className="btn-ghost" title="Edit" onClick={() => { setEditing(expense); setFormOpen(true) }}>
                            <Edit2 size={15} />
                          </button>
                          <button className="btn-ghost text-[#991b1b] hover:bg-[#fee2e2]" title="Delete" onClick={() => setDeleting(expense)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breakdown chart */}
          <div className="card-standard">
            <h2 className="text-heading-md font-medium text-ink mb-[20px]">Breakdown by Category</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] items-center">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} formatter={(v) => formatUGX(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-[10px]">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-body-md text-shade-60">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-caption font-medium text-ink">{formatUGXShort(item.value)}</span>
                      <span className="text-caption text-shade-60 ml-[8px]">({Math.round(item.value / total * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <ExpenseFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={handleSave}
        expense={editing}
        saving={saving}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete expense"
        message={`Delete "${deleting?.description || deleting?.category}" (${formatUGX(deleting?.amount || 0)})? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={saving}
      />
    </div>
  )
}
