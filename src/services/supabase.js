import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Auth service functions
export const authService = {
  // userData: { role: 'owner', full_name, shop_name } or { role: 'employee', full_name, invite_code }
  async signup(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    return { data, error }
  },

  async getProfile() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return { data: null, error: { message: 'Not signed in' } }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, shop_id, email, full_name, phone, role, is_active, shops ( id, name, invite_code )')
      .eq('id', userData.user.id)
      .single()
    return { data, error }
  },

  async validateInviteCode(code) {
    const { data, error } = await supabase.rpc('validate_invite_code', { p_code: code })
    return { data, error }
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async logout() {
    return await supabase.auth.signOut()
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    return { user: data?.user, error }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { session: data?.session, error }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
