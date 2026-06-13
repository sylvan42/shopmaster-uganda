import { useMemo, useState } from 'react'
import { ShoppingCart, Search, Plus, Eye, Download, ChevronDown } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatTile } from '../components/StatTile'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { DateRangePicker } from '../components/DateRangePicker'
import { PosModal } from '../components/pos/PosModal'
import { ReceiptModal } from '../components/ReceiptModal'
import { useAuth } from '../context/AuthContext'
import { useDateRange } from '../hooks/useDateRange'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { salesService, PAYMENT_METHODS, paymentLabel } from '../services/salesService'
import { formatUGX, formatDate, formatTime } from '../lib/formatters'
import { downloadCsv } from '../utils/csv'

export const Sales = () => {
  const { userRole } = useAuth()
  const isOwner = userRole === 'owner'
  const range = useDateRange('today')
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [posOpen, setPosOpen] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const { data: sales, loading, error, refetch } = useSupabaseQuery(
    () => salesService.list({ from: range.from, to: range.to, paymentMethod: paymentFilter }),
    [range.from.getTime(), range.to.getTime(), paymentFilter]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return sales || []
    return (sales || []).filter(
      (s) =>
        s.receipt_no.toLowerCase().includes(q) ||
        (s.seller?.full_name || '').toLowerCase().includes(q) ||
        (s.customer_name || '').toLowerCase().includes(q) ||
        s.sale_items.some((i) => i.product_name.toLowerCase().includes(q))
    )
  }, [sales, search])

  const totals = useMemo(() => ({
    revenue: filtered.reduce((sum, s) => sum + Number(s.total_amount), 0),
    count: filtered.length,
    items: filtered.reduce((sum, s) => sum + s.sale_items.reduce((n, i) => n + i.quantity, 0), 0),
  }), [filtered])

  const handleExport = () => {
    const rows = filtered.flatMap((s) =>
      s.sale_items.map((i) => ({
        receipt: s.receipt_no,
        date: formatDate(s.created_at),
        time: formatTime(s.created_at),
        seller: s.seller?.full_name || s.seller?.email || '',
        product: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
        payment: paymentLabel(s.payment_method),
        customer: s.customer_name || '',
      }))
    )
    downloadCsv(`sales-${range.label.toLowerCase().replace(/\s+/g, '-')}`, rows, [
      { key: 'receipt', label: 'Receipt' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'seller', label: 'Sold By' },
      { key: 'product', label: 'Product' },
      { key: 'quantity', label: 'Qty' },
      { key: 'unit_price', label: 'Unit Price (UGX)' },
      { key: 'line_total', label: 'Line Total (UGX)' },
      { key: 'payment', label: 'Payment' },
      { key: 'customer', label: 'Customer' },
    ])
  }

  const itemsSummary = (s) =>
    s.sale_items.map((i) => `${i.product_name} × ${i.quantity}`).join(', ')

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-[24px]">
      <PageHeader
        title="Sales"
        subtitle={isOwner ? 'All sales recorded in your shop' : 'Sales you have recorded'}
        action={
          <div className="flex gap-[8px]">
            {isOwner && (
              <button className="btn-outline-on-light flex items-center gap-[8px]" onClick={handleExport}
                disabled={!filtered.length}>
                <Download size={16} /> Export
              </button>
            )}
            <button className="btn-primary-pill flex items-center gap-[8px]" onClick={() => setPosOpen(true)}>
              <Plus size={16} /> Record Sale
            </button>
          </div>
        }
      />

      {/* Period + totals */}
      <div className="card-standard space-y-[16px]">
        <DateRangePicker range={range} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
          <StatTile label={`Revenue (${range.label})`} value={formatUGX(totals.revenue)} />
          <StatTile label="Transactions" value={totals.count} />
          <StatTile label="Items Sold" value={totals.items} />
        </div>
      </div>

      {/* Filters */}
      <div className="card-standard">
        <div className="flex flex-col sm:flex-row gap-[12px] items-start sm:items-center">
          <div className="relative flex-1 min-w-0 w-full">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
            <input className="search-input" placeholder="Search receipt, product, customer…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <select className="text-input pr-[32px] appearance-none cursor-pointer text-caption py-[9px]"
              value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="">All payments</option>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-shade-60 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card-standard">
          <EmptyState icon={ShoppingCart} title="No sales in this period"
            subtitle="Record your first sale to see it here."
            action={
              <button className="btn-primary-pill flex items-center gap-[8px]" onClick={() => setPosOpen(true)}>
                <Plus size={16} /> Record Sale
              </button>
            } />
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="th-cell">Receipt</th>
                  <th className="th-cell">Date & Time</th>
                  <th className="th-cell">Items</th>
                  {isOwner && <th className="th-cell">Sold By</th>}
                  <th className="th-cell">Payment</th>
                  <th className="th-cell">Amount</th>
                  <th className="th-cell">View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-canvas-cream transition-colors">
                    <td className="td-cell font-medium text-ink">{s.receipt_no}</td>
                    <td className="td-cell text-shade-60">
                      {formatDate(s.created_at)} <span className="text-shade-40">·</span> {formatTime(s.created_at)}
                    </td>
                    <td className="td-cell max-w-[280px]">
                      <span className="block truncate" title={itemsSummary(s)}>{itemsSummary(s)}</span>
                    </td>
                    {isOwner && (
                      <td className="td-cell text-shade-60">{s.seller?.full_name || s.seller?.email || '—'}</td>
                    )}
                    <td className="td-cell">
                      <span className={s.payment_method === 'credit' ? 'badge-yellow' : 'pill-tag-shade'}>
                        {paymentLabel(s.payment_method)}
                      </span>
                    </td>
                    <td className="td-cell font-medium text-ink">{formatUGX(s.total_amount)}</td>
                    <td className="td-cell">
                      <button className="btn-ghost" title="View receipt" onClick={() => setReceipt(s)}>
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PosModal
        open={posOpen}
        onClose={() => setPosOpen(false)}
        onComplete={async (result) => {
          setPosOpen(false)
          refetch()
          const { data } = await salesService.getReceipt(result.sale_id)
          if (data) setReceipt(data)
        }}
      />

      <ReceiptModal open={Boolean(receipt)} onClose={() => setReceipt(null)} sale={receipt} />
    </div>
  )
}
