import { useEffect, useState } from 'react'
import { Modal } from '../Modal'

const TYPES = [
  { value: 'damage', label: 'Damage / Loss', hint: 'Stock removed (broken, spoiled, stolen)' },
  { value: 'return', label: 'Customer Return', hint: 'Stock added back from a return' },
  { value: 'adjustment', label: 'Correction', hint: 'Fix a counting error (+ or −)' },
]

export const StockAdjustModal = ({ open, onClose, onSave, product, saving = false }) => {
  const [type, setType] = useState('damage')
  const [quantity, setQuantity] = useState('')
  const [direction, setDirection] = useState('-') // only for 'adjustment'
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setType('damage')
      setQuantity('')
      setDirection('-')
      setNote('')
      setError('')
    }
  }, [open])

  const handleSubmit = (e) => {
    e?.preventDefault()
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Enter a whole number greater than zero')
      return
    }
    let change = qty
    if (type === 'damage') change = -qty
    if (type === 'return') change = qty
    if (type === 'adjustment') change = direction === '-' ? -qty : qty
    onSave({ change, type, note: note.trim() || null })
  }

  return (
    <Modal open={open} onClose={onClose} title={`Adjust ${product?.name || ''}`}
      subtitle={`Current stock: ${product?.current_quantity ?? product?.quantity ?? 0}`}
      footer={
        <>
          <button className="btn-outline-on-light" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary-pill" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save adjustment'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-[16px]">
        <div>
          <label className="block text-body-strong text-ink mb-[8px]">Type</label>
          <div className="space-y-[8px]">
            {TYPES.map((t) => (
              <label key={t.value} className={`flex items-start gap-[10px] border rounded-lg px-[14px] py-[10px] cursor-pointer transition-colors ${
                type === t.value ? 'border-ink bg-canvas-cream' : 'border-hairline-light hover:bg-canvas-cream'
              }`}>
                <input type="radio" name="adjust-type" value={t.value} checked={type === t.value}
                  onChange={() => setType(t.value)} className="mt-[3px]" />
                <span>
                  <span className="block text-body-strong text-ink">{t.label}</span>
                  <span className="block text-caption text-shade-60">{t.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-[12px]">
          {type === 'adjustment' && (
            <div>
              <label className="block text-body-strong text-ink mb-[6px]">Direction</label>
              <div className="flex border border-hairline-light rounded-lg overflow-hidden">
                <button type="button" onClick={() => setDirection('-')}
                  className={`px-[16px] py-[9px] text-body-md transition-colors ${direction === '-' ? 'bg-ink text-on-primary' : 'hover:bg-canvas-cream'}`}>−</button>
                <button type="button" onClick={() => setDirection('+')}
                  className={`px-[16px] py-[9px] text-body-md transition-colors ${direction === '+' ? 'bg-ink text-on-primary' : 'hover:bg-canvas-cream'}`}>+</button>
              </div>
            </div>
          )}
          <div className="flex-1">
            <label className="block text-body-strong text-ink mb-[6px]">Quantity *</label>
            <input type="number" min="1" step="1" className="text-input" value={quantity}
              onChange={(e) => setQuantity(e.target.value)} />
            {error && <p className="text-caption text-[#991b1b] mt-[4px]">{error}</p>}
          </div>
        </div>

        <div>
          <label className="block text-body-strong text-ink mb-[6px]">Note</label>
          <input className="text-input" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="What happened?" />
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  )
}
