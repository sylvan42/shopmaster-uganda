import { useState } from 'react'
import { Warehouse, Search, Plus, Edit2, AlertTriangle, ChevronDown } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { StatTile } from '../components/StatTile'
import { formatUGX } from '../lib/formatters'

const INVENTORY = [
  { id: 1, sku: 'DG-001', name: 'Sugar 1kg', category: 'Dry Goods', stock: 24, reorder: 10, price: 4200, cost: 3200 },
  { id: 2, sku: 'DG-002', name: 'Sugar 2kg', category: 'Dry Goods', stock: 15, reorder: 8, price: 8000, cost: 6200 },
  { id: 3, sku: 'DG-003', name: 'Posho Flour 2kg', category: 'Dry Goods', stock: 8, reorder: 10, price: 6500, cost: 4800 },
  { id: 4, sku: 'DG-004', name: 'Rice 1kg', category: 'Dry Goods', stock: 0, reorder: 12, price: 5500, cost: 4000 },
  { id: 5, sku: 'CK-001', name: 'Cooking Oil 1L', category: 'Cooking', stock: 32, reorder: 15, price: 9800, cost: 7500 },
  { id: 6, sku: 'CK-002', name: 'Groundnut Oil 500ml', category: 'Cooking', stock: 6, reorder: 10, price: 7500, cost: 5800 },
  { id: 7, sku: 'SP-001', name: 'Salt 500g', category: 'Spices', stock: 45, reorder: 20, price: 1200, cost: 800 },
  { id: 8, sku: 'DG-005', name: 'Beans 1kg', category: 'Dry Goods', stock: 18, reorder: 10, price: 4500, cost: 3200 },
  { id: 9, sku: 'PA-001', name: 'Spaghetti 400g', category: 'Pasta', stock: 22, reorder: 12, price: 3200, cost: 2400 },
  { id: 10, sku: 'BK-001', name: 'Bread Loaf', category: 'Bakery', stock: 4, reorder: 8, price: 5000, cost: 3800 },
  { id: 11, sku: 'SP-002', name: 'Blue Band 500g', category: 'Spreads', stock: 11, reorder: 8, price: 9500, cost: 7200 },
  { id: 12, sku: 'SP-003', name: 'Royco Cubes (10pk)', category: 'Spices', stock: 0, reorder: 15, price: 1800, cost: 1200 },
]

const CATEGORIES = ['All', ...Array.from(new Set(INVENTORY.map(p => p.category)))]

const getStatus = (stock, reorder) => {
  if (stock === 0) return { label: 'Out of Stock', cls: 'badge-red' }
  if (stock <= reorder) return { label: 'Low Stock', cls: 'badge-yellow' }
  return { label: 'In Stock', cls: 'badge-green' }
}

export const Inventory = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const lowStockCount = INVENTORY.filter(i => i.stock > 0 && i.stock <= i.reorder).length
  const outOfStockCount = INVENTORY.filter(i => i.stock === 0).length
  const inStockCount = INVENTORY.filter(i => i.stock > i.reorder).length

  const filtered = INVENTORY.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || item.category === category
    const status = getStatus(item.stock, item.reorder)
    const matchStatus = statusFilter === 'All' || status.label === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="space-y-[24px]">
      <PageHeader
        title="Inventory"
        subtitle="Monitor stock levels and reorder points"
        action={
          <button className="btn-primary-pill flex items-center gap-[8px]">
            <Plus size={16} /> Add Stock Entry
          </button>
        }
      />

      {/* Low-stock alert banner */}
      {(lowStockCount + outOfStockCount) > 0 && (
        <div className="flex items-center gap-[12px] px-[16px] py-[12px] bg-[#fef9c3] border border-[#fef08a] rounded-lg">
          <AlertTriangle size={18} className="text-[#854d0e] shrink-0" />
          <p className="text-body-md text-[#854d0e]">
            <strong>{lowStockCount + outOfStockCount} items</strong> need attention —{' '}
            {lowStockCount} low stock, {outOfStockCount} out of stock.
          </p>
          <button onClick={() => setStatusFilter('Low Stock')} className="ml-auto text-caption font-medium text-[#854d0e] underline whitespace-nowrap">
            View Low Stock
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[12px]">
        <StatTile label="Total SKUs" value={INVENTORY.length.toString()} />
        <StatTile label="In Stock" value={inStockCount.toString()} subValue="above reorder point" />
        <StatTile label="Low Stock" value={lowStockCount.toString()} subValue="need reordering" />
        <StatTile label="Out of Stock" value={outOfStockCount.toString()} subValue="no units available" />
      </div>

      {/* Filters */}
      <div className="card-standard py-[14px]">
        <div className="flex flex-col sm:flex-row gap-[12px] items-start sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
            <input className="search-input" placeholder="Search by name or SKU…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-[8px] flex-wrap">
            <div className="relative">
              <select className="text-input pr-[32px] appearance-none cursor-pointer text-caption py-[9px]"
                value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="th-cell">Product</th>
                <th className="th-cell">SKU</th>
                <th className="th-cell">Category</th>
                <th className="th-cell">Current Stock</th>
                <th className="th-cell">Reorder Point</th>
                <th className="th-cell">Selling Price</th>
                <th className="th-cell">Cost Price</th>
                <th className="th-cell">Status</th>
                <th className="th-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-0 border-0">
                    <EmptyState icon={Warehouse} title="No items found" subtitle="Try adjusting your search or filters." />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const { label, cls } = getStatus(item.stock, item.reorder)
                  return (
                    <tr key={item.id} className="hover:bg-canvas-cream transition-colors">
                      <td className="td-cell font-medium text-ink">{item.name}</td>
                      <td className="td-cell text-caption text-shade-60 font-mono">{item.sku}</td>
                      <td className="td-cell"><span className="pill-tag-shade">{item.category}</span></td>
                      <td className={`td-cell font-medium ${item.stock === 0 ? 'text-[#991b1b]' : item.stock <= item.reorder ? 'text-[#854d0e]' : 'text-ink'}`}>
                        {item.stock} units
                      </td>
                      <td className="td-cell text-shade-60">{item.reorder} units</td>
                      <td className="td-cell">{formatUGX(item.price)}</td>
                      <td className="td-cell text-shade-60">{formatUGX(item.cost)}</td>
                      <td className="td-cell"><span className={cls}>{label}</span></td>
                      <td className="td-cell">
                        <button className="btn-ghost flex items-center gap-[6px] text-caption" title="Adjust Stock">
                          <Edit2 size={14} /> Adjust
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
