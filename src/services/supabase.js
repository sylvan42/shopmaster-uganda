import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Auth service functions
export const authService = {
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
