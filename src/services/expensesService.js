import { format } from 'date-fns'
import { supabase } from './supabase'

export const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Stock Replenishment', 'Salaries', 'Transport', 'Other',
]

export const expensesService = {
  async list({ from, to, category = '' } = {}) {
    let query = supabase
      .from('expenses')
      .select('id, category, amount, description, expense_date, created_at, creator:profiles!expenses_created_by_fkey ( full_name, email )')
      .order('expense_date', { ascending: false })
    if (from) query = query.gte('expense_date', format(from, 'yyyy-MM-dd'))
    if (to) query = query.lt('expense_date', format(to, 'yyyy-MM-dd'))
    if (category) query = query.eq('category', category)
    const { data, error } = await query
    return { data, error }
  },

  async create(shopId, userId, values) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...values, shop_id: shopId, created_by: userId })
      .select()
      .single()
    return { data, error }
  },

  async update(id, values) {
    const { data, error } = await supabase
      .from('expenses')
      .update(values)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async remove(id) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    return { data: null, error }
  },
}
