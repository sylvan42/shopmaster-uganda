import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoadingScreen } from './components/LoadingScreen'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { Products } from './pages/Products'
import { Sales } from './pages/Sales'
import { Inventory } from './pages/Inventory'
import { Reports } from './pages/Reports'
import { Employees } from './pages/Employees'
import { Expenses } from './pages/Expenses'
import { Settings } from './pages/Settings'
import './index.css'

const protectedPage = (element, requiredRole = null) => (
  <ProtectedRoute requiredRole={requiredRole}>
    <Layout>{element}</Layout>
  </ProtectedRoute>
)

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
      <Route path="/products" element={protectedPage(<Products />)} />
      <Route path="/sales" element={protectedPage(<Sales />)} />
      <Route path="/inventory" element={protectedPage(<Inventory />)} />
      <Route path="/reports" element={protectedPage(<Reports />, 'owner')} />
      <Route path="/employees" element={protectedPage(<Employees />, 'owner')} />
      <Route path="/expenses" element={protectedPage(<Expenses />, 'owner')} />
      <Route path="/settings" element={protectedPage(<Settings />)} />

      <Route path="/unauthorized" element={
        <div className="flex items-center justify-center h-screen bg-canvas-cream font-body">
          <div className="text-center">
            <h1 className="text-heading-xl font-medium text-ink mb-[8px]">Access Restricted</h1>
            <p className="text-body-md text-shade-60 mb-[24px]">You don't have permission to view this page.</p>
            <Navigate to="/dashboard" />
          </div>
        </div>
      } />

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
