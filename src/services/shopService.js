import { supabase } from './supabase'

export const shopService = {
  async listEmployees() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, is_active, created_at')
      .order('created_at')
    return { data, error }
  },

  async setEmployeeActive(profileId, isActive) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', profileId)
      .select()
      .single()
    return { data, error }
  },

  async updateProfile(profileId, values) {
    const { data, error } = await supabase
      .from('profiles')
      .update(values)
      .eq('id', profileId)
      .select()
      .single()
    return { data, error }
  },

  async updateShopName(shopId, name) {
    const { data, error } = await supabase
      .from('shops')
      .update({ name })
      .eq('id', shopId)
      .select()
      .single()
    return { data, error }
  },

  async regenerateInviteCode() {
    const { data, error } = await supabase.rpc('regenerate_invite_code')
    return { data, error }
  },
}
