import { supabase } from './supabase'

export const productsService = {
  async list({ search = '', category = '', includeInactive = false } = {}) {
    let query = supabase
      .from('products')
      .select('*')
      .order('name')
    if (!includeInactive) query = query.eq('is_active', true)
    if (category) query = query.eq('category', category)
    if (search.trim()) {
      const q = search.trim()
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
    }
    const { data, error } = await query
    return { data, error }
  },

  async create(shopId, values) {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...values, shop_id: shopId })
      .select()
      .single()
    return { data, error }
  },

  async update(id, values) {
    const { data, error } = await supabase
      .from('products')
      .update(values)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async deactivate(id) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
    return { data, error }
  },

  async listCategories() {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null)
    if (error) return { data: null, error }
    const unique = [...new Set(data.map((r) => r.category).filter(Boolean))].sort()
    return { data: unique, error: null }
  },
}
