import { supabase } from './supabase'

export const reportsService = {
  // Owner-only: the RPC rejects non-owners server-side
  async getOwnerReport({ from, to }) {
    const { data, error } = await supabase.rpc('get_report', {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    })
    return { data, error }
  },

  // Any role: caller's own sales only, no profit data
  async getMySummary({ from, to }) {
    const { data, error } = await supabase.rpc('get_my_summary', {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    })
    return { data, error }
  },
}
