import { supabase } from './supabase'

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mtn_momo', label: 'MTN MoMo' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'credit', label: 'Credit' },
]

export const paymentLabel = (value) =>
  PAYMENT_METHODS.find((m) => m.value === value)?.label || value

export const salesService = {
  // items: [{ product_id, quantity }]
  async recordSale(items, paymentMethod, customerName = null) {
    const { data, error } = await supabase.rpc('record_sale', {
      p_items: items,
      p_payment_method: paymentMethod,
      p_customer_name: customerName,
    })
    return { data, error }
  },

  // RLS scopes employees to their own sales automatically
  async list({ from, to, paymentMethod = '', limit = 300 } = {}) {
    let query = supabase
      .from('sales')
      .select(`
        id, receipt_no, payment_method, total_amount, customer_name, created_at, sold_by,
        seller:profiles!sales_sold_by_fkey ( full_name, email ),
        sale_items ( id, product_name, quantity, unit_price, line_total )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (from) query = query.gte('created_at', from.toISOString())
    if (to) query = query.lt('created_at', to.toISOString())
    if (paymentMethod) query = query.eq('payment_method', paymentMethod)
    const { data, error } = await query
    return { data, error }
  },

  async getReceipt(saleId) {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        id, receipt_no, payment_method, total_amount, customer_name, created_at,
        seller:profiles!sales_sold_by_fkey ( full_name, email ),
        sale_items ( id, product_name, quantity, unit_price, line_total )
      `)
      .eq('id', saleId)
      .single()
    return { data, error }
  },
}
