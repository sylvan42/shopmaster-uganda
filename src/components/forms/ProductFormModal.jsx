import { useEffect, useState } from 'react'
import { Modal } from '../Modal'

const EMPTY = {
  name: '', category: '', sku: '', buying_price: '', selling_price: '',
  initial_quantity: '', reorder_level: '5', supplier: '', expiry_date: '',
}

export const ProductFormModal = ({ open, onClose, onSave, product = null, categories = [], saving = false }) => {
  const isEdit = Boolean(product)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setErrors({})
    setValues(
      product
        ? {
            name: product.name || '',
            category: product.category || '',
            sku: product.sku || '',
            buying_price: String(product.buying_price ?? ''),
            selling_price: String(product.selling_price ?? ''),
            initial_quantity: '',
            reorder_level: String(product.reorder_level ?? 5),
            supplier: product.supplier || '',
            expiry_date: product.expiry_date || '',
          }
        : EMPTY
    )
  }, [open, product])

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!values.name.trim()) errs.name = 'Product name is required'
    const buying = Number(values.buying_price)
    const selling = Number(values.selling_price)
    if (values.buying_price === '' || isNaN(buying) || buying < 0) errs.buying_price = 'Enter a valid buying price'
    if (values.selling_price === '' || isNaN(selling) || selling < 0) errs.selling_price = 'Enter a valid selling price'
    if (!isEdit && values.initial_quantity !== '' && (!Number.isInteger(Number(values.initial_quantity)) || Number(values.initial_quantity) < 0)) {
      errs.initial_quantity = 'Quantity must be a whole number'
    }
    if (!Number.isInteger(Number(values.reorder_level)) || Number(values.reorder_level) < 0) {
      errs.reorder_level = 'Reorder level must be a whole number'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      name: values.name.trim(),
      category: values.category.trim() || null,
      sku: values.sku.trim() || null,
      buying_price: Number(values.buying_price),
      selling_price: Number(values.selling_price),
      reorder_level: Number(values.reorder_level),
      supplier: values.supplier.trim() || null,
      expiry_date: values.expiry_date || null,
      initial_quantity: isEdit ? null : Number(values.initial_quantity || 0),
    })
  }

  const sellingBelowCost =
    values.buying_price !== '' && values.selling_price !== '' &&
    Number(values.selling_price) < Number(values.buying_price)

  const field = (label, key, props = {}, hint = null) => (
    <div>
      <label className="block text-body-strong text-ink mb-[6px]">{label}</label>
      <input className="text-input" value={values[key]} onChange={set(key)} {...props} />
      {errors[key] && <p className="text-caption text-[#991b1b] mt-[4px]">{errors[key]}</p>}
      {!errors[key] && hint && <p className="text-caption text-shade-60 mt-[4px]">{hint}</p>}
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      subtitle={isEdit ? 'Stock changes are made from the Inventory page.' : 'Initial stock will be recorded in the stock ledger.'}
      footer={
        <>
          <button className="btn-outline-on-light" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary-pill" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-[16px]">
        {field('Product Name *', 'name', { placeholder: 'e.g. Sugar 1kg' })}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          <div>
            <label className="block text-body-strong text-ink mb-[6px]">Category</label>
            <input className="text-input" list="product-categories" value={values.category}
              onChange={set('category')} placeholder="e.g. Dry Goods" />
            <datalist id="product-categories">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          {field('SKU', 'sku', { placeholder: 'Optional code, e.g. DG-001' })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          {field('Buying Price (UGX) *', 'buying_price', { type: 'number', min: 0, step: '50', placeholder: '3200' })}
          {field('Selling Price (UGX) *', 'selling_price', { type: 'number', min: 0, step: '50', placeholder: '4200' })}
        </div>
        {sellingBelowCost && (
          <p className="text-caption bg-[#fef9c3] text-[#854d0e] px-[12px] py-[8px] rounded-md">
            Warning: the selling price is below the buying price — this product will sell at a loss.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          {!isEdit && field('Initial Stock', 'initial_quantity', { type: 'number', min: 0, step: '1', placeholder: '0' })}
          {field('Low-stock Alert Level', 'reorder_level', { type: 'number', min: 0, step: '1' }, 'Alert shows when stock falls to this level')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
          {field('Supplier', 'supplier', { placeholder: 'Optional' })}
          {field('Expiry Date', 'expiry_date', { type: 'date' }, 'Optional — for perishables')}
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  )
}
