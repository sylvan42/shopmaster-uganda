import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingScreen } from './LoadingScreen'

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, profile, loading, userRole } = useAuth()

  // Profile loads asynchronously after the session resolves
  if (loading || (user && !profile)) return <LoadingScreen />

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
