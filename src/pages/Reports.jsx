import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { Printer, Download, TrendingUp } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatTile } from '../components/StatTile'
import { axisStyle, tooltipStyle, gridStyle, CHART_COLORS } from '../lib/chartConfig'
import { formatUGX, formatUGXShort } from '../lib/formatters'

const DATA_7 = [
  { date: 'Mon 02', revenue: 890000, expenses: 150000, profit: 740000 },
  { date: 'Tue 03', revenue: 1200000, expenses: 180000, profit: 1020000 },
  { date: 'Wed 04', revenue: 950000, expenses: 120000, profit: 830000 },
  { date: 'Thu 05', revenue: 1500000, expenses: 200000, profit: 1300000 },
  { date: 'Fri 06', revenue: 2100000, expenses: 250000, profit: 1850000 },
  { date: 'Sat 07', revenue: 2450000, expenses: 300000, profit: 2150000 },
  { date: 'Sun 08', revenue: 1800000, expenses: 180000, profit: 1620000 },
]

const DATA_30 = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}`,
  revenue: 800000 + Math.random() * 2000000,
  expenses: 100000 + Math.random() * 400000,
  profit: 600000 + Math.random() * 1500000,
}))

const PAYMENT_DATA = [
  { name: 'Cash', value: 45 },
  { name: 'MTN Mobile', value: 30 },
  { name: 'Airtel Money', value: 15 },
  { name: 'Credit', value: 10 },
]

const TOP_PRODUCTS = [
  { name: 'Cooking Oil 1L', sales: 480000 },
  { name: 'Sugar 2kg', sales: 360000 },
  { name: 'Posho Flour 2kg', sales: 310000 },
  { name: 'Rice 1kg', sales: 275000 },
  { name: 'Blue Band 500g', sales: 210000 },
]

const HOURLY = Array.from({ length: 12 }, (_, i) => ({
  hour: `${8 + i}:00`,
  sales: [12000, 35000, 58000, 72000, 95000, 110000, 88000, 65000, 72000, 95000, 80000, 45000][i],
}))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle.contentStyle}>
      <p style={tooltipStyle.labelStyle}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-caption mt-[2px]">
          {p.name}: {formatUGXShort(p.value)}
        </p>
      ))}
    </div>
  )
}

const DATE_RANGES = ['7 Days', '30 Days', 'This Month']

export const Reports = () => {
  const [range, setRange] = useState('7 Days')

  const data = range === '7 Days' ? DATA_7 : DATA_30
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0)
  const totalProfit = data.reduce((s, d) => s + d.profit, 0)
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)

  return (
    <div className="space-y-[28px]">
      <PageHeader
        title="Reports"
        subtitle="Analytics and performance overview"
        action={
          <div className="flex gap-[8px]">
            <button onClick={() => window.print()} className="btn-outline-on-light flex items-center gap-[8px]">
              <Printer size={16} /> Print
            </button>
            <button className="btn-primary-pill flex items-center gap-[8px]">
              <Download size={16} /> Export CSV
            </button>
          </div>
        }
      />

      {/* Date range toggle */}
      <div className="flex items-center gap-[6px]">
        {DATE_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-[16px] py-[8px] rounded-pill text-caption transition-colors ${
              range === r ? 'bg-ink text-on-primary' : 'bg-canvas-cream border border-hairline-light text-ink hover:bg-shade-30'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px]">
        <StatTile label="Total Revenue" value={formatUGXShort(totalRevenue)} subValue={`${data.length} days`} />
        <StatTile label="Total Expenses" value={formatUGXShort(totalExpenses)} />
        <StatTile label="Net Profit" value={formatUGXShort(totalProfit)} subValue={`${profitMargin}% margin`} />
        <StatTile label="Top Product" value="Cooking Oil 1L" subValue={formatUGXShort(480000)} />
      </div>

      {/* Revenue vs Expenses */}
      <div className="card-standard">
        <div className="flex items-center justify-between mb-[20px]">
          <h2 className="text-heading-md font-medium text-ink">Revenue vs Expenses</h2>
          <div className="flex items-center gap-[16px] text-caption text-shade-60">
            <span className="flex items-center gap-[6px]"><span className="w-2.5 h-2.5 rounded-sm bg-ink inline-block" />Revenue</span>
            <span className="flex items-center gap-[6px]"><span className="w-2.5 h-2.5 rounded-sm bg-aloe-10 inline-block" />Expenses</span>
          </div>
        </div>
        <div className="h-[240px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c1fbd4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#c1fbd4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" {...axisStyle} interval={range === '30 Days' ? 4 : 0} />
              <YAxis {...axisStyle} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${(v/1000).toFixed(0)}K`} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} fill="url(#revGrad)" name="Revenue" dot={false} />
              <Area type="monotone" dataKey="expenses" stroke="#c1fbd4" strokeWidth={2} fill="url(#expGrad)" name="Expenses" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column: Payment Methods + Profit Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
        {/* Payment Methods */}
        <div className="card-standard">
          <h2 className="text-heading-md font-medium text-ink mb-[20px]">Payment Methods</h2>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PAYMENT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value" labelLine={false} label={false}>
                  {PAYMENT_DATA.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-[12px] space-y-[8px]">
            {PAYMENT_DATA.map((m, i) => (
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

        {/* Daily Profit Trend */}
        <div className="card-standard">
          <h2 className="text-heading-md font-medium text-ink mb-[20px]">Daily Profit Trend</h2>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c1fbd4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#c1fbd4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" {...axisStyle} interval={range === '30 Days' ? 4 : 0} />
                <YAxis {...axisStyle} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={44} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="profit" stroke="#000000" strokeWidth={2} fill="url(#profitGrad)" name="Profit" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-column: Top Products + Sales by Hour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
        {/* Top Products */}
        <div className="card-standard">
          <h2 className="text-heading-md font-medium text-ink mb-[20px]">Top 5 Products by Sales</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_PRODUCTS} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="0" stroke="#e4e4e7" horizontal={false} />
                <XAxis type="number" {...axisStyle} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" {...axisStyle} width={120} tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fbfbf5' }} />
                <Bar dataKey="sales" fill="#000000" radius={[0, 4, 4, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Hour */}
        <div className="card-standard">
          <h2 className="text-heading-md font-medium text-ink mb-[20px]">Sales by Hour of Day</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY} barCategoryGap="20%">
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="hour" {...axisStyle} tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Inter, sans-serif' }} />
                <YAxis {...axisStyle} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} width={40} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fbfbf5' }} />
                <Bar dataKey="sales" fill="#c1fbd4" radius={[3, 3, 0, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
