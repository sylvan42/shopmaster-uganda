import { useMemo, useState } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { Modal } from '../Modal'
import { useToast } from '../../context/ToastContext'
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery'
import { productsService } from '../../services/productsService'
import { salesService, PAYMENT_METHODS } from '../../services/salesService'
import { formatUGX } from '../../lib/formatters'

export const PosModal = ({ open, onClose, onComplete }) => {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([]) // [{ product, quantity }]
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: products, refetch } = useSupabaseQuery(
    () => (open ? productsService.list() : Promise.resolve({ data: [], error: null })),
    [open]
  )

  const available = useMemo(() => {
    const q = search.toLowerCase()
    return (products || [])
      .filter((p) => p.quantity > 0)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q))
      .slice(0, 30)
  }, [products, search])

  const inCart = (productId) => cart.find((l) => l.product.id === productId)
  const total = cart.reduce((sum, l) => sum + l.product.selling_price * l.quantity, 0)

  const addToCart = (product) => {
    setCart((prev) => {
      const line = prev.find((l) => l.product.id === product.id)
      if (line) {
        if (line.quantity >= product.quantity) {
          toast.error(`Only ${product.quantity} × ${product.name} in stock`)
          return prev
        }
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const setQuantity = (productId, quantity) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.product.id !== productId) return l
          const clamped = Math.max(1, Math.min(quantity, l.product.quantity))
          if (quantity > l.product.quantity) toast.error(`Only ${l.product.quantity} in stock`)
          return { ...l, quantity: clamped }
        })
        .filter((l) => l.quantity > 0)
    )
  }

  const removeLine = (productId) => setCart((prev) => prev.filter((l) => l.product.id !== productId))

  const reset = () => {
    setCart([])
    setSearch('')
    setPaymentMethod('cash')
    setCustomerName('')
  }

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Add at least one product to the cart')
      return
    }
    if (paymentMethod === 'credit' && !customerName.trim()) {
      toast.error('Enter the customer name for a credit sale')
      return
    }
    setSubmitting(true)
    const items = cart.map((l) => ({ product_id: l.product.id, quantity: l.quantity }))
    const { data, error } = await salesService.recordSale(
      items, paymentMethod, paymentMethod === 'credit' ? customerName.trim() : null
    )
    setSubmitting(false)
    if (error) {
      toast.error(error.message)
      refetch() // stock may have changed under us
    } else {
      toast.success(`Sale ${data.receipt_no} recorded — ${formatUGX(data.total)}`)
      reset()
      onComplete?.(data)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Record Sale" subtitle="Pick products, set quantities, choose payment." wide
      footer={
        <>
          <div className="flex-1 text-left">
            <p className="text-caption text-shade-60">Total</p>
            <p className="text-heading-md font-medium text-ink">{formatUGX(total)}</p>
          </div>
          <button className="btn-outline-on-light" onClick={handleClose} disabled={submitting}>Cancel</button>
          <button className="btn-primary-pill flex items-center gap-[8px]" onClick={handleSubmit}
            disabled={submitting || cart.length === 0}>
            <ShoppingCart size={16} />
            {submitting ? 'Recording…' : 'Complete Sale'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
        {/* Product picker */}
        <div>
          <div className="relative mb-[12px]">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-shade-60" />
            <input className="search-input" placeholder="Search products…" value={search}
              onChange={(e) => setSearch(e.target.value)} autoFocus />
          </div>
          <div className="border border-hairline-light rounded-lg divide-y divide-hairline-light max-h-[320px] overflow-y-auto">
            {available.length === 0 && (
              <p className="text-body-md text-shade-60 text-center py-[24px]">No products in stock match.</p>
            )}
            {available.map((p) => {
              const line = inCart(p.id)
              return (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="w-full flex items-center justify-between px-[14px] py-[10px] hover:bg-canvas-cream transition-colors text-left">
                  <div className="min-w-0">
                    <p className="text-body-md font-medium text-ink truncate">{p.name}</p>
                    <p className="text-caption text-shade-60">{formatUGX(p.selling_price)} · {p.quantity} in stock</p>
                  </div>
                  {line ? (
                    <span className="badge-green shrink-0 ml-[8px]">×{line.quantity}</span>
                  ) : (
                    <Plus size={16} className="text-shade-60 shrink-0 ml-[8px]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cart */}
        <div>
          <p className="text-body-strong text-ink mb-[12px]">Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</p>
          {cart.length === 0 ? (
            <div className="border border-dashed border-hairline-light rounded-lg py-[40px] text-center">
              <ShoppingCart size={28} className="text-shade-40 mx-auto mb-[8px]" />
              <p className="text-body-md text-shade-60">Tap products to add them</p>
            </div>
          ) : (
            <div className="space-y-[8px] max-h-[220px] overflow-y-auto pr-[4px]">
              {cart.map((l) => (
                <div key={l.product.id} className="flex items-center gap-[10px] bg-canvas-cream border border-hairline-light rounded-lg px-[12px] py-[8px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md font-medium text-ink truncate">{l.product.name}</p>
                    <p className="text-caption text-shade-60">{formatUGX(l.product.selling_price)} each</p>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <button className="btn-ghost !p-[4px]" onClick={() => setQuantity(l.product.id, l.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span className="text-body-strong text-ink w-[28px] text-center">{l.quantity}</span>
                    <button className="btn-ghost !p-[4px]" onClick={() => setQuantity(l.product.id, l.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-body-strong text-ink w-[90px] text-right">{formatUGX(l.product.selling_price * l.quantity)}</p>
                  <button className="btn-ghost !p-[4px] text-[#991b1b]" onClick={() => removeLine(l.product.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Payment method */}
          <p className="text-body-strong text-ink mt-[20px] mb-[10px]">Payment Method</p>
          <div className="flex flex-wrap gap-[8px]">
            {PAYMENT_METHODS.map((m) => (
              <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                className={`px-[16px] py-[8px] rounded-pill text-caption font-medium transition-colors ${
                  paymentMethod === m.value ? 'bg-ink text-on-primary' : 'bg-shade-30 text-ink hover:bg-shade-40'
                }`}>
                {m.label}
              </button>
            ))}
          </div>
          {paymentMethod === 'credit' && (
            <div className="mt-[12px]">
              <label className="block text-body-strong text-ink mb-[6px]">Customer Name *</label>
              <input className="text-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Who is taking this on credit?" />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
