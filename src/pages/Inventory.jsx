import { useMemo, useState } from 'react'
import { Warehouse, Search, PackagePlus, SlidersHorizontal, ChevronDown, History, Table2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatTile } from '../components/StatTile'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { RestockModal } from '../components/forms/RestockModal'
import { StockAdjustModal } from '../components/forms/StockAdjustModal'
import { useToast } from '../context/ToastContext'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { inventoryService, MOVEMENT_LABELS } from '../services/inventoryService'
import { recentMonths } from '../lib/dateRanges'
import { formatDate, formatTime } from '../lib/formatters'

const MOVEMENT_BADGES = {
  initial: 'pill-tag-shade',
  restock: 'badge-green',
  sale: 'pill-tag-shade',
  damage: 'badge-red',
  return: 'badge-yellow',
  adjustment: 'badge-yellow',
}

export const Inventory = () => {
  const toast = useToast()
  const months = recentMonths()
  const [month, setMonth] = useState(months[0].value)
  const [tab, setTab] = useState('report') // 'report' | 'movements'
  const [search, setSearch] = useState('')
  const [restocking, setRestocking] = useState(null)
  const [adjusting, setAdjusting] = useState(null)
  const [saving, setSaving] = useState(false)

  const monthDate = useMemo(() => new Date(`${month}-01T00:00:00`), [month])

  const { data: report, loading, error, refetch } = useSupabaseQuery(
    () => inventoryService.getMonthlyReport(monthDate),
    [month]
  )

  const { data: movements, loading: movementsLoading, refetch: refetchMovements } = useSupabaseQuery(
    () => {
      const from = new Date(`${month}-01T00:00:00`)
      const to = new Date(from)
      to.setMonth(to.getMonth() + 1)
      return inventoryService.listMovements({ from, to })
    },
    [month]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return report || []
    return (report || []).filter(
      (r) => r.name.toLowerCase().includes(q) || (r.sku || '').toLowerCase().includes(q)
    )
  }, [report, search])

  const stats = useMemo(() => {
    const rows = report || []
    return {
      products: rows.length,
      lowStock: rows.filter((r) => r.current_quantity > 0 && r.current_quantity <= r.reorder_level).length,
      outOfStock: rows.filter((r) => r.current_quantity === 0).length,
      sold: rows.reduce((sum, r) => sum + r.sold, 0),
    }
  }, [report])

  const refreshAll = () => {
    refetch()
    refetchMovements()
  }

  const handleRestock = async ({ quantity, unitCost, note }) => {
    setSaving(true)
    const { error } = await inventoryService.restock(restocking.product_id, quantity, unitCost, note)
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Added ${quantity} × ${restocking.name}`)
      setRestocking(null)
      refreshAll()
    }
  }

  const handleAdjust = async ({ change, type, note }) => {
    setSaving(true)
    const { error } = await inventoryService.adjust(adjusting.product_id, change, type, note)
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Stock adjusted for ${adjusting.name}`)
      setAdjusting(null)
      refreshAll()
    }
  }

  const stockBadge = (r) => {
    if (r.current_quantity === 0) return <span className="badge-red">Out</span>
    if (r.current_quantity <= r.reorder_level) return <span className="badge-yellow">Low</span>
    return <span className="badge-green">OK</span>
  }

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-[24px]">
      <PageHeader
        title="Inventory"
        subtitle="Opening stock, additions and sales for any month"
        action={
          <div className="relative">
            <select className="text-input pr-[32px] appearance-none cursor-pointer py-[9px]"
              value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-shade-60 pointer-events-none" />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
        <StatTile label="Products Tracked" value={stats.products} />
        <StatTile label="Units Sold This Month" value={stats.sold} />
        <StatTile label="Low Stock" value={stats.lowStock} />
        <StatTile label="Out of Stock" value={stats.outOfStock} />
      </div>

      {/* Tabs + search */}
      <div className="card-standard">
        <div className="flex flex-col sm:flex-row gap-[12px] items-start sm:items-center">
          <div className="flex border border-hairline-light rounded-lg overflow-hidden shrink-0">
            <button onClick={() => setTab('report')}
              className={`flex items-center gap-[6px] px-[14px] py-[9px] text-caption font-medium transition-colors ${tab === 'report' ? 'bg-ink text-on-primary' : 'hover:bg-canvas-cream'}`}>
              <Table2 size={14} /> Monthly Report
            </button>
            <button onClick={() => setTab('movements')}
              className={`flex items-center gap-[6px] px-[14px] py-[9px] text-caption font-medium transition-colors ${tab === 'movements' ? 'bg-ink text-on-primary' : 'hover:bg-canvas-cream'}`}>
              <History size={14} /> Movement History
            </button>
          </div>
          {tab === 'report' && (
            <div className="relative flex-1 min-w-0 w-full">
              <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
              <input className="search-input" placeholder="Search by name or SKU…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {tab === 'report' ? (
        loading ? (
          <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card-standard">
            <EmptyState icon={Warehouse} title="No inventory data"
              subtitle="Add products from the Products page to start tracking stock." />
          </div>
        ) : (
          <div className="table-container">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th-cell">Product</th>
                    <th className="th-cell">Opening</th>
                    <th className="th-cell">Added</th>
                    <th className="th-cell">Sold</th>
                    <th className="th-cell">Damaged</th>
                    <th className="th-cell">Returned</th>
                    <th className="th-cell">Closing</th>
                    <th className="th-cell">Status</th>
                    <th className="th-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.product_id} className="hover:bg-canvas-cream transition-colors">
                      <td className="td-cell">
                        <span className="font-medium text-ink">{r.name}</span>
                        {r.sku && <span className="block text-caption text-shade-60">{r.sku}</span>}
                      </td>
                      <td className="td-cell">{r.opening}</td>
                      <td className="td-cell text-ink">{r.added > 0 ? `+${r.added}` : '—'}</td>
                      <td className="td-cell text-ink">{r.sold > 0 ? `−${r.sold}` : '—'}</td>
                      <td className="td-cell text-shade-60">{r.damaged > 0 ? `−${r.damaged}` : '—'}</td>
                      <td className="td-cell text-shade-60">{r.returned > 0 ? `+${r.returned}` : '—'}</td>
                      <td className="td-cell font-medium text-ink">{r.closing}</td>
                      <td className="td-cell">{stockBadge(r)}</td>
                      <td className="td-cell">
                        <div className="flex items-center gap-[4px]">
                          <button className="btn-ghost" title="Restock" onClick={() => setRestocking(r)}>
                            <PackagePlus size={15} />
                          </button>
                          <button className="btn-ghost" title="Adjust (damage / return / correction)"
                            onClick={() => setAdjusting(r)}>
                            <SlidersHorizontal size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : movementsLoading ? (
        <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
      ) : (movements || []).length === 0 ? (
        <div className="card-standard">
          <EmptyState icon={History} title="No stock movements this month"
            subtitle="Restocks, sales, damages and corrections will appear here." />
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="th-cell">Date & Time</th>
                  <th className="th-cell">Product</th>
                  <th className="th-cell">Type</th>
                  <th className="th-cell">Change</th>
                  <th className="th-cell">By</th>
                  <th className="th-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-canvas-cream transition-colors">
                    <td className="td-cell text-shade-60">
                      {formatDate(m.created_at)} <span className="text-shade-40">·</span> {formatTime(m.created_at)}
                    </td>
                    <td className="td-cell font-medium text-ink">{m.product?.name || '—'}</td>
                    <td className="td-cell">
                      <span className={MOVEMENT_BADGES[m.movement_type] || 'pill-tag-shade'}>
                        {MOVEMENT_LABELS[m.movement_type] || m.movement_type}
                      </span>
                    </td>
                    <td className={`td-cell font-medium ${m.quantity_change > 0 ? 'text-ink' : 'text-[#991b1b]'}`}>
                      {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                    </td>
                    <td className="td-cell text-shade-60">{m.creator?.full_name || m.creator?.email || '—'}</td>
                    <td className="td-cell text-shade-60 max-w-[220px]">
                      <span className="block truncate" title={m.note || ''}>{m.note || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RestockModal open={Boolean(restocking)} onClose={() => setRestocking(null)}
        onSave={handleRestock} product={restocking} saving={saving} />
      <StockAdjustModal open={Boolean(adjusting)} onClose={() => setAdjusting(null)}
        onSave={handleAdjust} product={adjusting} saving={saving} />
    </div>
  )
}
