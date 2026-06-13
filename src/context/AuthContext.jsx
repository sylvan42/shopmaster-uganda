import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setProfile(null)
      return
    }
    const { data } = await authService.getProfile()
    if (data && !data.is_active) {
      // Deactivated accounts are signed out immediately
      await authService.logout()
      setUser(null)
      setProfile(null)
      return
    }
    setProfile(data || null)
  }, [])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const { user } = await authService.getCurrentUser()
      if (cancelled) return
      setUser(user)
      await loadProfile(user)
      if (!cancelled) setLoading(false)
    }

    init()

    const { data } = authService.onAuthStateChange((event, session) => {
      const sessionUser = session?.user || null
      setUser(sessionUser)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        loadProfile(sessionUser)
      }
    })

    return () => {
      cancelled = true
      data?.subscription?.unsubscribe?.()
    }
  }, [loadProfile])

  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user])

  const value = {
    user,
    profile,
    loading,
    userRole: profile?.role || null,
    shopId: profile?.shop_id || null,
    shopName: profile?.shops?.name || '',
    inviteCode: profile?.shops?.invite_code || '',
    refreshProfile,
    login: authService.login,
    logout: authService.logout,
    signup: authService.signup,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
