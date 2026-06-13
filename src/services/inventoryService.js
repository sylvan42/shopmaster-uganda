import { format } from 'date-fns'
import { supabase } from './supabase'

export const MOVEMENT_LABELS = {
  initial: 'Initial Stock',
  restock: 'Restock',
  sale: 'Sale',
  damage: 'Damage',
  return: 'Return',
  adjustment: 'Adjustment',
}

export const inventoryService = {
  async restock(productId, quantity, unitCost = null, note = null) {
    const { data, error } = await supabase.rpc('restock_product', {
      p_product_id: productId,
      p_quantity: quantity,
      p_unit_cost: unitCost,
      p_note: note,
    })
    return { data, error }
  },

  async adjust(productId, quantityChange, type, note = null) {
    const { data, error } = await supabase.rpc('adjust_stock', {
      p_product_id: productId,
      p_quantity_change: quantityChange,
      p_type: type,
      p_note: note,
    })
    return { data, error }
  },

  // monthDate: Date inside the wanted month. Snapshots are created lazily
  // for the current month so opening stock is fixed the first time it's viewed.
  async getMonthlyReport(monthDate) {
    const monthStr = format(monthDate, 'yyyy-MM-01')
    const currentMonthStr = format(new Date(), 'yyyy-MM-01')
    if (monthStr === currentMonthStr) {
      const { error: snapError } = await supabase.rpc('ensure_month_snapshots', { p_month: monthStr })
      if (snapError) return { data: null, error: snapError }
    }
    const { data, error } = await supabase.rpc('get_inventory_report', { p_month: monthStr })
    return { data, error }
  },

  async listMovements({ productId = '', from, to, limit = 300 } = {}) {
    let query = supabase
      .from('stock_movements')
      .select(`
        id, movement_type, quantity_change, unit_cost, note, created_at,
        product:products ( name ),
        creator:profiles!stock_movements_created_by_fkey ( full_name, email )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (productId) query = query.eq('product_id', productId)
    if (from) query = query.gte('created_at', from.toISOString())
    if (to) query = query.lt('created_at', to.toISOString())
    const { data, error } = await query
    return { data, error }
  },
}
