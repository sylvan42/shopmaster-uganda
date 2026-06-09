import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Menu, X, LogOut, Package, ShoppingCart, BarChart3,
  Settings, Users, LayoutDashboard, Warehouse, Receipt,
} from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/sales': 'Sales',
  '/inventory': 'Inventory',
  '/reports': 'Reports',
  '/employees': 'Employees',
  '/expenses': 'Expenses',
  '/settings': 'Settings',
}

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user, logout, userRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAdmin = userRole === 'admin'

  const adminMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Sales', icon: ShoppingCart, path: '/sales' },
    { label: 'Inventory', icon: Warehouse, path: '/inventory' },
    { label: 'Reports', icon: BarChart3, path: '/reports' },
    { label: 'Employees', icon: Users, path: '/employees' },
    { label: 'Expenses', icon: Receipt, path: '/expenses' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]

  const employeeMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Record Sales', icon: ShoppingCart, path: '/sales' },
    { label: 'Daily Report', icon: BarChart3, path: '/daily-report' },
  ]

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U'

  const pageTitle = PAGE_TITLES[location.pathname] || 'ShopMaster'

  const SidebarContent = ({ expanded }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-[24px] py-[20px] flex items-center justify-between border-b border-hairline-dark">
        {expanded && (
          <span className="text-heading-md font-display font-medium tracking-tight text-on-primary">
            ShopMaster
          </span>
        )}
        {!expanded && (
          <span className="text-heading-md font-display font-medium tracking-tight text-on-primary mx-auto">
            SM
          </span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex p-[6px] hover:bg-shade-70 rounded-md transition-colors text-on-primary ml-auto"
        >
          {expanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-[12px] py-[16px] space-y-[2px] overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-[12px] px-[12px] py-[10px] rounded-lg transition-colors text-body-md overflow-hidden ${
                isActive
                  ? 'bg-shade-70 text-on-primary font-medium'
                  : 'text-shade-40 hover:bg-shade-70 hover:text-on-primary'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-aloe-10 rounded-r-xs" />
              )}
              <Icon size={18} className="shrink-0" />
              {expanded && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-[12px] py-[16px] border-t border-hairline-dark">
        <button
          onClick={handleLogout}
          className="flex items-center gap-[12px] w-full px-[12px] py-[10px] rounded-lg hover:bg-shade-70 transition-colors text-body-md text-shade-40 hover:text-on-primary"
        >
          <LogOut size={18} className="shrink-0" />
          {expanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-canvas-cream font-body antialiased overflow-hidden">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — mobile overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-canvas-night text-on-primary transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-[6px] hover:bg-shade-70 rounded-md transition-colors text-on-primary"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent expanded={true} />
      </div>

      {/* Sidebar — desktop */}
      <div
        className={`hidden lg:flex flex-col bg-canvas-night text-on-primary transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-[72px]'
        } shrink-0`}
      >
        <SidebarContent expanded={sidebarOpen} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-canvas-light px-[20px] lg:px-[32px] py-[14px] flex justify-between items-center border-b border-hairline-light shrink-0">
          <div className="flex items-center gap-[12px]">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-[6px] hover:bg-shade-30 rounded-md transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-heading-md font-medium text-ink">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-[12px]">
            <span className="hidden sm:block text-body-md text-shade-60">{user?.email}</span>
            <span className="pill-tag-mint text-xs">
              {userRole === 'admin' ? 'Owner' : 'Employee'}
            </span>
            <div className="w-8 h-8 rounded-full bg-shade-30 flex items-center justify-center text-eyebrow-cap font-medium text-ink select-none">
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-[20px] lg:p-[32px]">
          {children}
        </main>
      </div>
    </div>
  )
}
