import { useState } from 'react'
import { ShoppingCart, Search, Download, Eye, ChevronDown } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { StatTile } from '../components/StatTile'
import { formatUGX, formatUGXShort, formatDate, formatTime } from '../lib/formatters'
import { useAuth } from '../context/AuthContext'

const PAYMENT_BADGES = {
  Cash: 'badge-green',
  'MTN Mobile': 'badge-yellow',
  'Airtel Money': 'badge-yellow',
  Credit: 'badge-red',
}

const TODAY = new Date()
const addHours = (h) => {
  const d = new Date(TODAY)
  d.setHours(h, Math.floor(Math.random() * 59))
  return d
}

const SALES = [
  { id: 'R-00118', time: addHours(9), items: 'Sugar 1kg × 3, Salt 500g × 2', payment: 'Cash', amount: 14000, cashier: 'Ssemakula James', status: 'completed' },
  { id: 'R-00117', time: addHours(9), items: 'Cooking Oil 1L', payment: 'MTN Mobile', amount: 9800, cashier: 'Akello Grace', status: 'completed' },
  { id: 'R-00116', time: addHours(8), items: 'Posho Flour 2kg × 2, Beans 1kg', payment: 'Airtel Money', amount: 17500, cashier: 'Ssemakula James', status: 'completed' },
  { id: 'R-00115', time: addHours(8), items: 'Blue Band 500g', payment: 'Cash', amount: 9500, cashier: 'Namutebi Fatuma', status: 'completed' },
  { id: 'R-00114', time: addHours(8), items: 'Rice 1kg × 4', payment: 'MTN Mobile', amount: 22000, cashier: 'Akello Grace', status: 'completed' },
  { id: 'R-00113', time: addHours(7), items: 'Bread Loaf × 2, Blue Band 500g', payment: 'Cash', amount: 19500, cashier: 'Ssemakula James', status: 'completed' },
  { id: 'R-00112', time: addHours(7), items: 'Sugar 2kg', payment: 'Cash', amount: 8000, cashier: 'Namutebi Fatuma', status: 'completed' },
  { id: 'R-00111', time: addHours(6), items: 'Spaghetti 400g × 3, Royco Cubes', payment: 'Credit', amount: 11400, cashier: 'Akello Grace', status: 'completed' },
  { id: 'R-00110', time: addHours(6), items: 'Groundnut Oil 500ml', payment: 'MTN Mobile', amount: 7500, cashier: 'Ssemakula James', status: 'completed' },
  { id: 'R-00109', time: addHours(6), items: 'Salt 500g × 5, Beans 1kg × 2', payment: 'Cash', amount: 15000, cashier: 'Namutebi Fatuma', status: 'completed' },
]

const totalSales = SALES.reduce((s, t) => s + t.amount, 0)

export const Sales = () => {
  const { userRole } = useAuth()
  const isAdmin = userRole === 'admin'
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('All')

  const filtered = SALES.filter(s => {
    const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) || s.items.toLowerCase().includes(search.toLowerCase())
    const matchPayment = paymentFilter === 'All' || s.payment === paymentFilter
    return matchSearch && matchPayment
  })

  return (
    <div className="space-y-[24px]">
      <PageHeader
        title="Sales"
        subtitle={`${SALES.length} transactions today`}
        action={isAdmin
          ? <button className="btn-outline-on-light flex items-center gap-[8px]"><Download size={16} /> Export CSV</button>
          : <button className="btn-primary-pill flex items-center gap-[8px]"><ShoppingCart size={16} /> Record Sale</button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
        <StatTile label="Total Sales Today" value={formatUGXShort(totalSales)} />
        <StatTile label="Transactions" value={SALES.length.toString()} subValue="all completed" />
        <StatTile label="Average Transaction" value={formatUGXShort(Math.round(totalSales / SALES.length))} />
      </div>

      {/* Filters */}
      <div className="card-standard py-[14px]">
        <div className="flex flex-col sm:flex-row gap-[12px] items-start sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
            <input className="search-input" placeholder="Search by receipt # or product…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <select className="text-input pr-[32px] appearance-none cursor-pointer text-caption py-[9px]"
              value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              {['All', 'Cash', 'MTN Mobile', 'Airtel Money', 'Credit'].map(p => <option key={p}>{p}</option>)}
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
                <th className="th-cell">Time</th>
                <th className="th-cell">Receipt #</th>
                <th className="th-cell">Items</th>
                <th className="th-cell">Payment</th>
                <th className="th-cell">Amount</th>
                {isAdmin && <th className="th-cell">Cashier</th>}
                <th className="th-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-0 border-0">
                    <EmptyState icon={ShoppingCart} title="No transactions found" subtitle="Try adjusting your search or filters." />
                  </td>
                </tr>
              ) : (
                filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-canvas-cream transition-colors">
                    <td className="td-cell text-caption text-shade-60">{formatTime(sale.time)}</td>
                    <td className="td-cell font-mono text-caption font-medium text-ink">{sale.id}</td>
                    <td className="td-cell max-w-[200px]">
                      <span className="block truncate text-body-md" title={sale.items}>{sale.items}</span>
                    </td>
                    <td className="td-cell">
                      <span className={PAYMENT_BADGES[sale.payment] || 'pill-tag-shade'}>{sale.payment}</span>
                    </td>
                    <td className="td-cell font-medium text-ink">{formatUGX(sale.amount)}</td>
                    {isAdmin && <td className="td-cell text-body-md text-shade-60">{sale.cashier}</td>}
                    <td className="td-cell">
                      <button className="btn-ghost" title="View Receipt"><Eye size={15} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
