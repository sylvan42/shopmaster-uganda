import { useState } from 'react'
import { Receipt, Search, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { StatTile } from '../components/StatTile'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CHART_COLORS, tooltipStyle } from '../lib/chartConfig'
import { formatUGX, formatUGXShort, formatDate } from '../lib/formatters'

const CATEGORY_STYLES = {
  Rent: 'bg-[#fee2e2] text-[#991b1b]',
  Utilities: 'bg-[#fef9c3] text-[#854d0e]',
  'Stock Replenishment': 'bg-aloe-10 text-ink',
  Salaries: 'bg-canvas-cream border border-hairline-light text-ink',
  Transport: 'bg-shade-30 text-ink',
  Other: 'bg-shade-30 text-ink',
}

const BASE = new Date()
const daysAgo = (d) => { const dt = new Date(BASE); dt.setDate(dt.getDate() - d); return dt }

const EXPENSES = [
  { id: 1, date: daysAgo(0), description: 'Shop Rent – June 2025', category: 'Rent', amount: 450000, paidBy: 'Nakato Sarah', ref: 'RNT-2025-06' },
  { id: 2, date: daysAgo(1), description: 'UMEME Electricity Bill', category: 'Utilities', amount: 85000, paidBy: 'Nakato Sarah', ref: 'UTL-00234' },
  { id: 3, date: daysAgo(2), description: 'Sugar & Flour restock – Owino Market', category: 'Stock Replenishment', amount: 320000, paidBy: 'Ssemakula James', ref: 'STK-00089' },
  { id: 4, date: daysAgo(3), description: 'Salaries – May 2025', category: 'Salaries', amount: 680000, paidBy: 'Nakato Sarah', ref: 'SAL-2025-05' },
  { id: 5, date: daysAgo(4), description: 'Transport to Nakawa Market', category: 'Transport', amount: 25000, paidBy: 'Ssemakula James', ref: 'TRP-00112' },
  { id: 6, date: daysAgo(5), description: 'Cooking Oil restock', category: 'Stock Replenishment', amount: 175000, paidBy: 'Akello Grace', ref: 'STK-00088' },
  { id: 7, date: daysAgo(6), description: 'MTN Mobile Money float', category: 'Other', amount: 50000, paidBy: 'Nakato Sarah', ref: 'OTH-00045' },
  { id: 8, date: daysAgo(8), description: 'NWSC Water Bill', category: 'Utilities', amount: 42000, paidBy: 'Nakato Sarah', ref: 'UTL-00231' },
  { id: 9, date: daysAgo(10), description: 'Shelf repairs & maintenance', category: 'Other', amount: 35000, paidBy: 'Mugisha David', ref: 'OTH-00043' },
  { id: 10, date: daysAgo(12), description: 'Beans & Spaghetti restock', category: 'Stock Replenishment', amount: 120000, paidBy: 'Akello Grace', ref: 'STK-00085' },
]

const CATEGORIES = ['All', ...Object.keys(CATEGORY_STYLES)]

const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0)
const largest = EXPENSES.reduce((max, e) => e.amount > max.amount ? e : max, EXPENSES[0])

const pieData = Object.entries(
  EXPENSES.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
).map(([name, value]) => ({ name, value }))

export const Expenses = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = EXPENSES.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.ref.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || e.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-[24px]">
      <PageHeader
        title="Expenses"
        subtitle="Track and categorise all business expenditures"
        action={
          <button className="btn-primary-pill flex items-center gap-[8px]">
            <Plus size={16} /> Add Expense
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
        <StatTile label="This Month Total" value={formatUGXShort(totalExpenses)} />
        <StatTile label="Categories" value={Object.keys(CATEGORY_STYLES).length.toString()} subValue="tracked" />
        <StatTile label="Largest Expense" value={largest.category} subValue={formatUGX(largest.amount)} />
      </div>

      {/* Filters */}
      <div className="card-standard py-[14px]">
        <div className="flex flex-col sm:flex-row gap-[12px] items-start sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
            <input className="search-input" placeholder="Search expenses…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <select className="text-input pr-[32px] appearance-none cursor-pointer text-caption py-[9px]"
              value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-shade-60 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="th-cell">Date</th>
                <th className="th-cell">Description</th>
                <th className="th-cell">Category</th>
                <th className="th-cell">Amount</th>
                <th className="th-cell">Paid By</th>
                <th className="th-cell">Reference</th>
                <th className="th-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-0 border-0">
                    <EmptyState icon={Receipt} title="No expenses found" subtitle="Try adjusting your filters or add a new expense." />
                  </td>
                </tr>
              ) : (
                filtered.map((expense) => (
                  <tr key={expense.id} className="hover:bg-canvas-cream transition-colors">
                    <td className="td-cell text-caption text-shade-60">{formatDate(expense.date, 'dd MMM')}</td>
                    <td className="td-cell max-w-[220px]">
                      <span className="block truncate font-medium text-ink" title={expense.description}>{expense.description}</span>
                    </td>
                    <td className="td-cell">
                      <span className={`inline-flex items-center rounded-pill px-[10px] py-[3px] text-eyebrow-cap uppercase font-medium ${CATEGORY_STYLES[expense.category]}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="td-cell font-medium text-ink">{formatUGX(expense.amount)}</td>
                    <td className="td-cell text-body-md text-shade-60">{expense.paidBy}</td>
                    <td className="td-cell text-caption font-mono text-shade-60">{expense.ref}</td>
                    <td className="td-cell">
                      <div className="flex items-center gap-[4px]">
                        <button className="btn-ghost" title="Edit"><Edit2 size={15} /></button>
                        <button className="btn-ghost text-[#991b1b] hover:bg-[#fee2e2]" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown chart */}
      <div className="card-standard">
        <h2 className="text-heading-md font-medium text-ink mb-[20px]">Expense Breakdown by Category</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] items-center">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value" labelLine={false} label={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v) => formatUGX(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-[10px]">
            {pieData.sort((a, b) => b.value - a.value).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-body-md text-shade-60">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-caption font-medium text-ink">{formatUGXShort(item.value)}</span>
                  <span className="text-caption text-shade-60 ml-[8px]">({Math.round(item.value / totalExpenses * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
