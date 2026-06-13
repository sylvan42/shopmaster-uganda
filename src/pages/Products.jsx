import { useMemo, useState } from 'react'
import { differenceInDays } from 'date-fns'
import { Package, Search, Plus, Edit2, Trash2, LayoutGrid, List, ChevronDown, Download } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { ProductFormModal } from '../components/forms/ProductFormModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { productsService } from '../services/productsService'
import { inventoryService } from '../services/inventoryService'
import { formatUGX, formatDate } from '../lib/formatters'
import { downloadCsv } from '../utils/csv'

const getStatus = (p) => {
  if (p.quantity === 0) return { label: 'Out of Stock', cls: 'badge-red' }
  if (p.quantity <= p.reorder_level) return { label: 'Low Stock', cls: 'badge-yellow' }
  return { label: 'In Stock', cls: 'badge-green' }
}

const isExpiringSoon = (p) =>
  p.expiry_date && differenceInDays(new Date(p.expiry_date), new Date()) <= 30

export const Products = () => {
  const { shopId, userRole } = useAuth()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [view, setView] = useState('table')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data: products, loading, error, refetch } = useSupabaseQuery(
    () => productsService.list(),
    []
  )

  const categories = useMemo(
    () => [...new Set((products || []).map((p) => p.category).filter(Boolean))].sort(),
    [products]
  )

  const filtered = useMemo(() => {
    return (products || []).filter((p) => {
      const q = search.toLowerCase()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
      const matchCat = category === 'All' || p.category === category
      const matchStatus = statusFilter === 'All' || getStatus(p).label === statusFilter
      return matchSearch && matchCat && matchStatus
    })
  }, [products, search, category, statusFilter])

  const handleSave = async (values) => {
    setSaving(true)
    const { initial_quantity, ...productValues } = values
    if (editing) {
      const { error } = await productsService.update(editing.id, productValues)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success(`${productValues.name} updated`)
        setFormOpen(false)
        setEditing(null)
        refetch()
      }
    } else {
      // Insert with zero stock, then record initial stock through the ledger RPC
      const { data: created, error } = await productsService.create(shopId, { ...productValues, quantity: 0 })
      if (error) {
        toast.error(error.message?.includes('duplicate') ? 'A product with this SKU already exists.' : error.message)
      } else {
        if (initial_quantity > 0) {
          const { error: stockError } = await inventoryService.restock(
            created.id, initial_quantity, productValues.buying_price, 'Initial stock'
          )
          if (stockError) toast.error(`Product added but initial stock failed: ${stockError.message}`)
        }
        toast.success(`${productValues.name} added`)
        setFormOpen(false)
        refetch()
      }
    }
    setSaving(false)
  }

  const handleDeactivate = async () => {
    setSaving(true)
    const { error } = await productsService.deactivate(deleting.id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`${deleting.name} removed from catalogue`)
      setDeleting(null)
      refetch()
    }
    setSaving(false)
  }

  const handleExport = () => {
    downloadCsv('products', filtered, [
      { key: 'name', label: 'Product' },
      { key: 'category', label: 'Category' },
      { key: 'sku', label: 'SKU' },
      { key: 'buying_price', label: 'Buying Price (UGX)' },
      { key: 'selling_price', label: 'Selling Price (UGX)' },
      { key: 'quantity', label: 'Stock' },
      { key: 'reorder_level', label: 'Reorder Level' },
      { key: 'supplier', label: 'Supplier' },
      { key: 'expiry_date', label: 'Expiry Date' },
    ])
  }

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-[24px]">
      <PageHeader
        title="Products"
        subtitle={loading ? 'Loading…' : `${(products || []).length} products in catalogue`}
        action={
          <div className="flex gap-[8px]">
            {userRole === 'owner' && (
              <button className="btn-outline-on-light flex items-center gap-[8px]" onClick={handleExport}>
                <Download size={16} /> Export
              </button>
            )}
            <button className="btn-primary-pill flex items-center gap-[8px]"
              onClick={() => { setEditing(null); setFormOpen(true) }}>
              <Plus size={16} /> Add Product
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="card-standard">
        <div className="flex flex-col sm:flex-row gap-[12px] items-start sm:items-center">
          <div className="relative flex-1 min-w-0 w-full">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
            <input className="search-input" placeholder="Search by name or SKU…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-[8px] flex-wrap">
            <div className="relative">
              <select className="text-input pr-[32px] appearance-none cursor-pointer text-caption py-[9px]"
                value={category} onChange={(e) => setCategory(e.target.value)}>
                {['All', ...categories].map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-shade-60 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="text-input pr-[32px] appearance-none cursor-pointer text-caption py-[9px]"
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-shade-60 pointer-events-none" />
            </div>
            <div className="flex border border-hairline-light rounded-lg overflow-hidden">
              <button onClick={() => setView('table')} className={`px-[10px] py-[9px] transition-colors ${view === 'table' ? 'bg-ink text-on-primary' : 'hover:bg-canvas-cream'}`}>
                <List size={16} />
              </button>
              <button onClick={() => setView('grid')} className={`px-[10px] py-[9px] transition-colors ${view === 'grid' ? 'bg-ink text-on-primary' : 'hover:bg-canvas-cream'}`}>
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card-standard">
          <EmptyState icon={Package}
            title={(products || []).length === 0 ? 'No products yet' : 'No products found'}
            subtitle={(products || []).length === 0 ? 'Add your first product to start tracking stock and sales.' : 'Try adjusting your search or filters.'}
            action={
              <button className="btn-primary-pill flex items-center gap-[8px]"
                onClick={() => { setEditing(null); setFormOpen(true) }}>
                <Plus size={16} /> Add Product
              </button>
            } />
        </div>
      ) : view === 'table' ? (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="th-cell">Product</th>
                  <th className="th-cell">Category</th>
                  <th className="th-cell">Selling Price</th>
                  <th className="th-cell">Cost Price</th>
                  <th className="th-cell">Stock</th>
                  <th className="th-cell">Status</th>
                  <th className="th-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const { label, cls } = getStatus(p)
                  return (
                    <tr key={p.id} className="hover:bg-canvas-cream transition-colors">
                      <td className="td-cell">
                        <span className="font-medium text-ink">{p.name}</span>
                        {p.sku && <span className="block text-caption text-shade-60">{p.sku}</span>}
                      </td>
                      <td className="td-cell">{p.category ? <span className="pill-tag-shade">{p.category}</span> : <span className="text-shade-40">—</span>}</td>
                      <td className="td-cell text-body-md">{formatUGX(p.selling_price)}</td>
                      <td className="td-cell text-body-md text-shade-60">{formatUGX(p.buying_price)}</td>
                      <td className="td-cell text-body-md">{p.quantity}</td>
                      <td className="td-cell">
                        <div className="flex flex-wrap gap-[4px]">
                          <span className={cls}>{label}</span>
                          {isExpiringSoon(p) && (
                            <span className="badge-yellow" title={`Expires ${formatDate(p.expiry_date)}`}>Expiring</span>
                          )}
                        </div>
                      </td>
                      <td className="td-cell">
                        <div className="flex items-center gap-[4px]">
                          <button className="btn-ghost" title="Edit"
                            onClick={() => { setEditing(p); setFormOpen(true) }}>
                            <Edit2 size={15} />
                          </button>
                          {userRole === 'owner' && (
                            <button className="btn-ghost text-[#991b1b] hover:bg-[#fee2e2]" title="Remove"
                              onClick={() => setDeleting(p)}>
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[16px]">
          {filtered.map((p) => {
            const { label, cls } = getStatus(p)
            return (
              <div key={p.id} className="card-standard hover:shadow-elevation-4 transition-shadow cursor-pointer"
                onClick={() => { setEditing(p); setFormOpen(true) }}>
                <p className="text-eyebrow-cap uppercase text-shade-60 mb-[6px]">{p.category || 'Uncategorised'}</p>
                <h3 className="text-body-strong text-ink mb-[8px] leading-snug">{p.name}</h3>
                <p className="text-heading-sm font-medium text-ink mb-[8px]">{formatUGX(p.selling_price)}</p>
                <div className="flex items-center justify-between">
                  <span className={cls}>{label}</span>
                  <span className="text-caption text-shade-60">{p.quantity} left</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={handleSave}
        product={editing}
        categories={categories}
        saving={saving}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeactivate}
        title="Remove product"
        message={`Remove "${deleting?.name}" from the catalogue? Its sales history and stock records are kept, but it can no longer be sold.`}
        confirmLabel="Remove"
        danger
        loading={saving}
      />
    </div>
  )
}
