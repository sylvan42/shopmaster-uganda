import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts'
import { Plus, AlertTriangle, CalendarClock, ShoppingCart, TrendingUp } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatTile } from '../components/StatTile'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { DateRangePicker } from '../components/DateRangePicker'
import { useAuth } from '../context/AuthContext'
import { useDateRange } from '../hooks/useDateRange'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { reportsService } from '../services/reportsService'
import { salesService, paymentLabel } from '../services/salesService'
import { productsService } from '../services/productsService'
import { formatUGX, formatUGXShort, formatDate, formatTime } from '../lib/formatters'
import { axisStyle, tooltipStyle, gridStyle } from '../lib/chartConfig'

const OwnerDashboard = () => {
  const range = useDateRange('today')

  const { data: report, loading, error, refetch } = useSupabaseQuery(
    () => reportsService.getOwnerReport({ from: range.from, to: range.to }),
    [range.from.getTime(), range.to.getTime()]
  )

  const { data: products } = useSupabaseQuery(() => productsService.list(), [])
  const { data: recentSales } = useSupabaseQuery(
    () => salesService.list({ from: range.from, to: range.to, limit: 6 }),
    [range.from.getTime(), range.to.getTime()]
  )

  const lowStock = useMemo(
    () => (products || []).filter((p) => p.quantity <= p.reorder_level).sort((a, b) => a.quantity - b.quantity),
    [products]
  )
  const expiringSoon = useMemo(
    () => (products || []).filter(
      (p) => p.expiry_date && differenceInDays(new Date(p.expiry_date), new Date()) <= 30
    ),
    [products]
  )

  const trend = useMemo(
    () => (report?.daily_trend || []).map((d) => ({
      day: formatDate(d.day, 'dd MMM'),
      revenue: Number(d.revenue),
      profit: Number(d.profit),
    })),
    [report]
  )

  const topProducts = useMemo(
    () => (report?.top_products || []).slice(0, 6).map((p) => ({
      name: p.product_name,
      revenue: Number(p.revenue),
      units: Number(p.units),
    })),
    [report]
  )

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-[24px]">
      <PageHeader title="Dashboard" subtitle="How your shop is doing"
        action={
          <Link to="/sales" className="btn-primary-pill flex items-center gap-[8px]">
            <Plus size={16} /> Record Sale
          </Link>
        }
      />

      <div className="card-standard">
        <DateRangePicker range={range} />
      </div>

      {loading ? (
        <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
            <StatTile label={`Revenue (${range.label})`} value={formatUGX(report?.revenue || 0)} />
            <StatTile label="Gross Profit" value={formatUGX(report?.gross_profit || 0)}
              subValue={`COGS ${formatUGXShort(report?.cogs || 0)}`} />
            <StatTile label="Transactions" value={report?.tx_count || 0} />
            <StatTile label="Low Stock Items" value={lowStock.length}
              subValue={expiringSoon.length ? `${expiringSoon.length} expiring soon` : undefined} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
            {/* Revenue trend */}
            <div className="card-standard">
              <h3 className="text-body-strong text-ink mb-[16px] flex items-center gap-[8px]">
                <TrendingUp size={16} /> Revenue & Profit Trend
              </h3>
              {trend.length === 0 ? (
                <p className="text-body-md text-shade-60 py-[48px] text-center">No sales in this period yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#000000" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...gridStyle} />
                    <XAxis dataKey="day" {...axisStyle} />
                    <YAxis {...axisStyle} tickFormatter={formatUGXShort} width={70} />
                    <Tooltip {...tooltipStyle} formatter={(v, name) => [formatUGX(v), name === 'revenue' ? 'Revenue' : 'Profit']} />
                    <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} fill="url(#revGrad)" />
                    <Area type="monotone" dataKey="profit" stroke="#71717a" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top products */}
            <div className="card-standard">
              <h3 className="text-body-strong text-ink mb-[16px]">Top Products</h3>
              {topProducts.length === 0 ? (
                <p className="text-body-md text-shade-60 py-[48px] text-center">Nothing sold in this period yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid {...gridStyle} horizontal={false} vertical />
                    <XAxis type="number" {...axisStyle} tickFormatter={formatUGXShort} />
                    <YAxis type="category" dataKey="name" {...axisStyle} width={120} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [formatUGX(v), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#000000" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
            {/* Recent sales */}
            <div className="card-standard">
              <div className="flex items-center justify-between mb-[16px]">
                <h3 className="text-body-strong text-ink">Recent Sales</h3>
                <Link to="/sales" className="text-caption text-shade-60 hover:text-ink transition-colors">View all →</Link>
              </div>
              {(recentSales || []).length === 0 ? (
                <p className="text-body-md text-shade-60 py-[24px] text-center">No sales in this period.</p>
              ) : (
                <div className="divide-y divide-hairline-light">
                  {(recentSales || []).slice(0, 6).map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-[10px]">
                      <div className="min-w-0">
                        <p className="text-body-md font-medium text-ink">{s.receipt_no}
                          <span className="text-shade-60 font-normal"> · {s.seller?.full_name || s.seller?.email}</span>
                        </p>
                        <p className="text-caption text-shade-60">{formatTime(s.created_at)} · {paymentLabel(s.payment_method)}</p>
                      </div>
                      <span className="text-body-strong text-ink shrink-0 ml-[12px]">{formatUGX(s.total_amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alerts */}
            <div className="card-standard">
              <h3 className="text-body-strong text-ink mb-[16px] flex items-center gap-[8px]">
                <AlertTriangle size={16} /> Stock Alerts
              </h3>
              {lowStock.length === 0 && expiringSoon.length === 0 ? (
                <p className="text-body-md text-shade-60 py-[24px] text-center">All good — no low stock or expiring items.</p>
              ) : (
                <div className="space-y-[8px] max-h-[280px] overflow-y-auto">
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-canvas-cream border border-hairline-light rounded-lg px-[12px] py-[8px]">
                      <span className="text-body-md text-ink">{p.name}</span>
                      <span className={p.quantity === 0 ? 'badge-red' : 'badge-yellow'}>
                        {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left`}
                      </span>
                    </div>
                  ))}
                  {expiringSoon.map((p) => (
                    <div key={`exp-${p.id}`} className="flex items-center justify-between bg-canvas-cream border border-hairline-light rounded-lg px-[12px] py-[8px]">
                      <span className="text-body-md text-ink flex items-center gap-[6px]">
                        <CalendarClock size={14} className="text-shade-60" /> {p.name}
                      </span>
                      <span className="badge-yellow">Expires {formatDate(p.expiry_date, 'dd MMM')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const EmployeeDashboard = () => {
  const { profile } = useAuth()
  const range = useDateRange('today')

  const { data: summary, loading, error, refetch } = useSupabaseQuery(
    () => reportsService.getMySummary({ from: range.from, to: range.to }),
    [range.from.getTime(), range.to.getTime()]
  )
  const { data: mySales } = useSupabaseQuery(
    () => salesService.list({ from: range.from, to: range.to, limit: 8 }),
    [range.from.getTime(), range.to.getTime()]
  )

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-[24px]">
      <PageHeader title={`Hello, ${profile?.full_name?.split(' ')[0] || 'there'}`}
        subtitle="Your sales at a glance"
        action={
          <Link to="/sales" className="btn-primary-pill flex items-center gap-[8px]">
            <Plus size={16} /> Record Sale
          </Link>
        }
      />

      <div className="card-standard">
        <DateRangePicker range={range} />
      </div>

      {loading ? (
        <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
            <StatTile label={`My Sales (${range.label})`} value={formatUGX(summary?.revenue || 0)} />
            <StatTile label="Transactions" value={summary?.tx_count || 0} />
            <StatTile label="Items Sold" value={summary?.items_sold || 0} />
          </div>

          <div className="card-standard">
            <div className="flex items-center justify-between mb-[16px]">
              <h3 className="text-body-strong text-ink">My Recent Sales</h3>
              <Link to="/sales" className="text-caption text-shade-60 hover:text-ink transition-colors">View all →</Link>
            </div>
            {(mySales || []).length === 0 ? (
              <EmptyState icon={ShoppingCart} title="No sales yet"
                subtitle="Record your first sale to see it here."
                action={
                  <Link to="/sales" className="btn-primary-pill flex items-center gap-[8px]">
                    <Plus size={16} /> Record Sale
                  </Link>
                } />
            ) : (
              <div className="divide-y divide-hairline-light">
                {(mySales || []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-[10px]">
                    <div className="min-w-0">
                      <p className="text-body-md font-medium text-ink">{s.receipt_no}</p>
                      <p className="text-caption text-shade-60 truncate">
                        {formatDate(s.created_at, 'dd MMM')} · {formatTime(s.created_at)} · {s.sale_items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    <span className="text-body-strong text-ink shrink-0 ml-[12px]">{formatUGX(s.total_amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export const Dashboard = () => {
  const { userRole } = useAuth()
  return userRole === 'owner' ? <OwnerDashboard /> : <EmployeeDashboard />
}
