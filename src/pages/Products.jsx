import { useState } from 'react'
import { Package, Search, Plus, Edit2, Trash2, LayoutGrid, List, ChevronDown } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { formatUGX } from '../lib/formatters'

const PRODUCTS = [
  { id: 1, name: 'Sugar 1kg', category: 'Dry Goods', price: 4200, cost: 3200, stock: 24, unit: 'bag' },
  { id: 2, name: 'Sugar 2kg', category: 'Dry Goods', price: 8000, cost: 6200, stock: 15, unit: 'bag' },
  { id: 3, name: 'Posho Flour 2kg', category: 'Dry Goods', price: 6500, cost: 4800, stock: 8, unit: 'packet' },
  { id: 4, name: 'Rice 1kg', category: 'Dry Goods', price: 5500, cost: 4000, stock: 0, unit: 'packet' },
  { id: 5, name: 'Cooking Oil 1L', category: 'Cooking', price: 9800, cost: 7500, stock: 32, unit: 'bottle' },
  { id: 6, name: 'Groundnut Oil 500ml', category: 'Cooking', price: 7500, cost: 5800, stock: 6, unit: 'bottle' },
  { id: 7, name: 'Salt 500g', category: 'Spices', price: 1200, cost: 800, stock: 45, unit: 'packet' },
  { id: 8, name: 'Beans 1kg', category: 'Dry Goods', price: 4500, cost: 3200, stock: 18, unit: 'packet' },
  { id: 9, name: 'Spaghetti 400g', category: 'Pasta', price: 3200, cost: 2400, stock: 22, unit: 'packet' },
  { id: 10, name: 'Bread Loaf', category: 'Bakery', price: 5000, cost: 3800, stock: 4, unit: 'loaf' },
  { id: 11, name: 'Blue Band 500g', category: 'Spreads', price: 9500, cost: 7200, stock: 11, unit: 'tub' },
  { id: 12, name: 'Royco Cubes (10pk)', category: 'Spices', price: 1800, cost: 1200, stock: 0, unit: 'pack' },
]

const CATEGORIES = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))]

const getStatus = (stock) => {
  if (stock === 0) return { label: 'Out of Stock', cls: 'badge-red' }
  if (stock <= 8) return { label: 'Low Stock', cls: 'badge-yellow' }
  return { label: 'In Stock', cls: 'badge-green' }
}

export const Products = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [view, setView] = useState('table')

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    const status = getStatus(p.stock)
    const matchStatus = statusFilter === 'All' || status.label === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div className="space-y-[24px]">
      <PageHeader
        title="Products"
        subtitle={`${PRODUCTS.length} products in catalogue`}
        action={
          <button className="btn-primary-pill flex items-center gap-[8px]">
            <Plus size={16} /> Add Product
          </button>
        }
      />

      {/* Filters */}
      <div className="card-standard">
        <div className="flex flex-col sm:flex-row gap-[12px] items-start sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
            <input className="search-input" placeholder="Search products…"
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

      {filtered.length === 0 ? (
        <div className="card-standard">
          <EmptyState icon={Package} title="No products found"
            subtitle="Try adjusting your search or filters."
            action={<button className="btn-primary-pill flex items-center gap-[8px]"><Plus size={16} /> Add Product</button>} />
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
                  const { label, cls } = getStatus(p.stock)
                  return (
                    <tr key={p.id} className="hover:bg-canvas-cream transition-colors">
                      <td className="td-cell font-medium text-ink">{p.name}</td>
                      <td className="td-cell"><span className="pill-tag-shade">{p.category}</span></td>
                      <td className="td-cell text-body-md">{formatUGX(p.price)}</td>
                      <td className="td-cell text-body-md text-shade-60">{formatUGX(p.cost)}</td>
                      <td className="td-cell text-body-md">{p.stock} {p.unit}{p.stock !== 1 ? 's' : ''}</td>
                      <td className="td-cell"><span className={cls}>{label}</span></td>
                      <td className="td-cell">
                        <div className="flex items-center gap-[4px]">
                          <button className="btn-ghost" title="Edit"><Edit2 size={15} /></button>
                          <button className="btn-ghost text-[#991b1b] hover:bg-[#fee2e2]" title="Delete"><Trash2 size={15} /></button>
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
            const { label, cls } = getStatus(p.stock)
            return (
              <div key={p.id} className="card-standard hover:shadow-elevation-4 transition-shadow cursor-pointer">
                <p className="text-eyebrow-cap uppercase text-shade-60 mb-[6px]">{p.category}</p>
                <h3 className="text-body-strong text-ink mb-[8px] leading-snug">{p.name}</h3>
                <p className="text-heading-sm font-medium text-ink mb-[8px]">{formatUGX(p.price)}</p>
                <div className="flex items-center justify-between">
                  <span className={cls}>{label}</span>
                  <span className="text-caption text-shade-60">{p.stock} left</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
