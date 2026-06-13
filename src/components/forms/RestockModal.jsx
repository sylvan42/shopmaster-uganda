import { useEffect, useState } from 'react'
import { Modal } from '../Modal'

export const RestockModal = ({ open, onClose, onSave, product, saving = false }) => {
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setQuantity('')
      setUnitCost(product?.buying_price != null ? String(product.buying_price) : '')
      setNote('')
      setError('')
    }
  }, [open, product])

  const handleSubmit = (e) => {
    e?.preventDefault()
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Enter a whole number greater than zero')
      return
    }
    onSave({
      quantity: qty,
      unitCost: unitCost === '' ? null : Number(unitCost),
      note: note.trim() || null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={`Restock ${product?.name || ''}`}
      subtitle={`Current stock: ${product?.current_quantity ?? product?.quantity ?? 0}`}
      footer={
        <>
          <button className="btn-outline-on-light" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary-pill" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Add stock'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-[16px]">
        <div>
          <label className="block text-body-strong text-ink mb-[6px]">Quantity to add *</label>
          <input type="number" min="1" step="1" className="text-input" value={quantity}
            onChange={(e) => setQuantity(e.target.value)} autoFocus />
          {error && <p className="text-caption text-[#991b1b] mt-[4px]">{error}</p>}
        </div>
        <div>
          <label className="block text-body-strong text-ink mb-[6px]">Unit cost (UGX)</label>
          <input type="number" min="0" step="50" className="text-input" value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)} />
          <p className="text-caption text-shade-60 mt-[4px]">What you paid per unit for this batch</p>
        </div>
        <div>
          <label className="block text-body-strong text-ink mb-[6px]">Note</label>
          <input className="text-input" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Supplier delivery" />
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  )
}
