import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { user } = await authService.getCurrentUser()
      setUser(user)
      if (user?.user_metadata?.role) {
        setUserRole(user.user_metadata.role)
      }
      setLoading(false)
    }

    getUser()

    const { data } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role)
      }
    })

    return () => data?.subscription?.unsubscribe?.()
  }, [])

  const value = {
    user,
    loading,
    userRole,
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
