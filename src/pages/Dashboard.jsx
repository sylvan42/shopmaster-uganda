import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import { TrendingUp, TrendingDown, ShoppingCart, Package, DollarSign, AlertCircle, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { axisStyle, tooltipStyle, gridStyle, CHART_COLORS } from '../lib/chartConfig'
import { formatUGX, formatUGXShort } from '../lib/formatters'

const KPICard = ({ title, value, change, icon: Icon, subValue }) => {
  const isPositive = change >= 0
  return (
    <div className={`card-standard border-l-4 ${isPositive ? 'border-l-aloe-10' : 'border-l-[#fee2e2]'}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 mr-[12px]">
          <p className="text-eyebrow-cap uppercase text-shade-50 mb-[8px] tracking-wider">{title}</p>
          <h3 className="text-heading-lg font-medium text-ink leading-tight">{value}</h3>
          {subValue && <p className="text-caption text-shade-60 mt-[4px]">{subValue}</p>}
          <div className={`flex items-center mt-[10px] ${isPositive ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="ml-[4px] text-caption font-medium">{Math.abs(change)}% vs yesterday</span>
          </div>
        </div>
        <div className="bg-canvas-cream border border-hairline-light p-[12px] rounded-lg shrink-0">
          <Icon size={22} className="text-ink" />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle.contentStyle}>
      <p style={tooltipStyle.labelStyle}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-caption mt-[2px]" style={{ color: p.color === '#000000' ? '#000' : p.color }}>
          {p.name}: {formatUGXShort(p.value)}
        </p>
      ))}
    </div>
  )
}

export const Dashboard = () => {
  const { userRole, user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = userRole === 'admin'

  const shopName = user?.user_metadata?.shopName || 'Your Shop'

  const salesData = [
    { date: 'Mon', sales: 890000, expenses: 150000 },
    { date: 'Tue', sales: 1200000, expenses: 180000 },
    { date: 'Wed', sales: 950000, expenses: 120000 },
    { date: 'Thu', sales: 1500000, expenses: 200000 },
    { date: 'Fri', sales: 2100000, expenses: 250000 },
    { date: 'Sat', sales: 2450000, expenses: 300000 },
    { date: 'Sun', sales: 1800000, expenses: 180000 },
  ]

  const paymentMethods = [
    { name: 'Cash', value: 45 },
    { name: 'MTN Mobile', value: 30 },
    { name: 'Airtel Money', value: 15 },
    { name: 'Credit', value: 10 },
  ]

  const topProducts = [
    { name: 'Cooking Oil 1L', sales: 480000 },
    { name: 'Sugar 2kg', sales: 360000 },
    { name: 'Posho Flour 2kg', sales: 310000 },
    { name: 'Rice 1kg', sales: 275000 },
    { name: 'Blue Band 500g', sales: 210000 },
  ]

  const recentSales = [
    { product: 'Sugar 1kg × 3', amount: 12600, time: '2 mins ago', method: 'Cash' },
    { product: 'Flour 2kg × 2', amount: 13000, time: '15 mins ago', method: 'MTN Mobile' },
    { product: 'Cooking Oil 1L', amount: 9800, time: '32 mins ago', method: 'Cash' },
    { product: 'Blue Band 500g', amount: 9500, time: '1 hr ago', method: 'Airtel' },
    { product: 'Rice 1kg × 4', amount: 22000, time: '1 hr ago', method: 'Cash' },
  ]

  const alerts = [
    { type: 'warning', message: 'Low stock: Sugar 1kg — only 3 bags remaining' },
    { type: 'error', message: 'Out of stock: Rice 5kg' },
    { type: 'info', message: 'Cash shortage: UGX 50,000 gap in daily report' },
  ]

  const quickActions = [
    { label: 'Record Sale', path: '/sales' },
    { label: 'Add Product', path: '/products' },
    { label: 'View Reports', path: '/reports' },
    { label: 'Manage Stock', path: '/inventory' },
  ]

  return (
    <div className="space-y-[28px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-[8px]">
        <div>
          <h1 className="text-heading-xl font-medium text-ink">Dashboard</h1>
          <p className="text-body-md text-shade-60 mt-[4px]">
            {shopName} — {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-[8px]">
            {quickActions.map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="btn-aloe-pill text-caption px-[14px] py-[7px] flex items-center gap-[6px]"
              >
                <Plus size={13} />
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4 xl:grid-cols-5' : 'lg:grid-cols-3'} gap-[20px]`}>
        <KPICard title="Today's Sales" value="UGX 2.45M" change={15} icon={ShoppingCart} subValue="18 transactions" />
        <KPICard title="Today's Profit" value="UGX 450K" change={12} icon={DollarSign} subValue="18.4% margin" />
        <KPICard title="Transactions" value="18" change={8} icon={TrendingUp} subValue="Avg UGX 136K each" />
        {isAdmin && (
          <>
            <KPICard title="Inventory Items" value="256 SKUs" change={-2} icon={Package} subValue="12 low-stock alerts" />
            <KPICard title="Low Stock" value="12 items" change={5} icon={AlertCircle} subValue="Need reorder soon" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[20px]">
        {/* Bar chart */}
        <div className="lg:col-span-2 card-standard">
          <div className="flex items-center justify-between mb-[20px]">
            <h2 className="text-heading-md font-medium text-ink">Weekly Sales & Expenses</h2>
            <div className="flex items-center gap-[16px] text-caption text-shade-60">
              <span className="flex items-center gap-[6px]"><span className="w-2.5 h-2.5 rounded-sm bg-ink inline-block" />Sales</span>
              <span className="flex items-center gap-[6px]"><span className="w-2.5 h-2.5 rounded-sm bg-aloe-10 inline-block" />Expenses</span>
            </div>
          </div>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} barCategoryGap="30%">
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" {...axisStyle} />
                <YAxis {...axisStyle} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`} width={44} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fbfbf5' }} />
                <Bar dataKey="sales" fill="#000000" radius={[4, 4, 0, 0]} name="Sales" />
                <Bar dataKey="expenses" fill="#c1fbd4" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart */}
        <div className="card-standard">
          <h2 className="text-heading-md font-medium text-ink mb-[20px]">Payment Methods</h2>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value" labelLine={false} label={false}>
                  {paymentMethods.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-[12px] space-y-[8px]">
            {paymentMethods.map((m, i) => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-[8px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-caption text-shade-60">{m.name}</span>
                </div>
                <span className="text-caption font-medium text-ink">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin-only sections */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[20px]">
          {/* Top Products */}
          <div className="lg:col-span-2 card-standard">
            <h2 className="text-heading-md font-medium text-ink mb-[20px]">Top Products This Week</h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="0" stroke="#e4e4e7" horizontal={false} />
                  <XAxis type="number" {...axisStyle} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" {...axisStyle} width={110} tick={{ fill: '#71717a', fontSize: 12, fontFamily: 'Inter, sans-serif' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fbfbf5' }} />
                  <Bar dataKey="sales" fill="#000000" radius={[0, 4, 4, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="card-standard">
            <div className="flex items-center justify-between mb-[16px]">
              <h2 className="text-heading-md font-medium text-ink">Recent Sales</h2>
              <button onClick={() => navigate('/sales')} className="text-caption text-shade-60 hover:text-ink transition-colors">
                View all →
              </button>
            </div>
            <div className="space-y-[12px]">
              {recentSales.map((sale, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-hairline-light pb-[12px] last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1 mr-[8px]">
                    <p className="text-body-md font-medium text-ink truncate">{sale.product}</p>
                    <p className="text-caption text-shade-60">{sale.time} · {sale.method}</p>
                  </div>
                  <span className="text-body-md font-medium text-ink shrink-0">
                    {formatUGXShort(sale.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {isAdmin && (
        <div className="card-standard">
          <h2 className="text-heading-md font-medium text-ink mb-[16px]">Alerts & Notifications</h2>
          <div className="space-y-[10px]">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`flex items-start gap-[10px] px-[14px] py-[12px] rounded-lg text-body-md ${
                alert.type === 'warning' ? 'bg-[#fef9c3] text-[#854d0e]'
                : alert.type === 'error' ? 'bg-[#fee2e2] text-[#991b1b]'
                : 'bg-canvas-cream text-ink border border-hairline-light'
              }`}>
                <AlertCircle size={16} className="shrink-0 mt-[2px]" />
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
