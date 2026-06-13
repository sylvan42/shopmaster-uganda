import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Download, BarChart3 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatTile } from '../components/StatTile'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { DateRangePicker } from '../components/DateRangePicker'
import { useDateRange } from '../hooks/useDateRange'
import { useSupabaseQuery } from '../hooks/useSupabaseQuery'
import { reportsService } from '../services/reportsService'
import { paymentLabel } from '../services/salesService'
import { axisStyle, tooltipStyle, gridStyle, CHART_COLORS } from '../lib/chartConfig'
import { formatUGX, formatUGXShort, formatDate } from '../lib/formatters'
import { downloadCsv } from '../utils/csv'

export const Reports = () => {
  const range = useDateRange('month')

  const { data: report, loading, error, refetch } = useSupabaseQuery(
    () => reportsService.getOwnerReport({ from: range.from, to: range.to }),
    [range.from.getTime(), range.to.getTime()]
  )

  const trend = useMemo(
    () => (report?.daily_trend || []).map((d) => ({
      day: formatDate(d.day, 'dd MMM'),
      revenue: Number(d.revenue),
      profit: Number(d.profit),
      transactions: Number(d.tx_count),
    })),
    [report]
  )

  const byPayment = useMemo(
    () => (report?.by_payment || []).map((p) => ({
      name: paymentLabel(p.payment_method),
      value: Number(p.total),
      count: Number(p.tx_count),
    })),
    [report]
  )

  const topProducts = useMemo(
    () => (report?.top_products || []).map((p) => ({
      name: p.product_name,
      revenue: Number(p.revenue),
      profit: Number(p.profit),
      units: Number(p.units),
    })),
    [report]
  )

  const byEmployee = report?.by_employee || []
  const hasSales = (report?.tx_count || 0) > 0

  const handleExport = () => {
    const rows = [
      { metric: 'Period', value: range.label },
      { metric: 'Revenue (UGX)', value: report?.revenue || 0 },
      { metric: 'Cost of Goods Sold (UGX)', value: report?.cogs || 0 },
      { metric: 'Gross Profit (UGX)', value: report?.gross_profit || 0 },
      { metric: 'Expenses (UGX)', value: report?.expenses_total || 0 },
      { metric: 'Net Profit (UGX)', value: report?.net_profit || 0 },
      { metric: 'Transactions', value: report?.tx_count || 0 },
      ...topProducts.map((p) => ({
        metric: `Top product: ${p.name}`,
        value: `${p.units} units, ${formatUGX(p.revenue)} revenue, ${formatUGX(p.profit)} profit`,
      })),
      ...byEmployee.map((e) => ({
        metric: `Sales by: ${e.name}`,
        value: `${e.tx_count} transactions, ${formatUGX(e.total)}`,
      })),
    ]
    downloadCsv(`report-${range.label.toLowerCase().replace(/\s+/g, '-')}`, rows, [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
    ])
  }

  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  return (
    <div className="space-y-[24px]">
      <PageHeader title="Reports" subtitle="Profit and performance for any period"
        action={
          <button className="btn-outline-on-light flex items-center gap-[8px]" onClick={handleExport}
            disabled={loading || !hasSales}>
            <Download size={16} /> Export
          </button>
        }
      />

      <div className="card-standard">
        <DateRangePicker range={range} />
      </div>

      {loading ? (
        <div className="card-standard flex justify-center py-[64px]"><div className="spinner" /></div>
      ) : !hasSales ? (
        <div className="card-standard">
          <EmptyState icon={BarChart3} title="No sales in this period"
            subtitle="Once sales are recorded, revenue, profit and trends will show here." />
        </div>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-[12px]">
            <StatTile label="Revenue" value={formatUGXShort(report.revenue)} subValue={`${report.tx_count} transactions`} />
            <StatTile label="Cost of Goods" value={formatUGXShort(report.cogs)} />
            <StatTile label="Gross Profit" value={formatUGXShort(report.gross_profit)}
              subValue={report.revenue > 0 ? `${((report.gross_profit / report.revenue) * 100).toFixed(1)}% margin` : undefined} />
            <StatTile label="Expenses" value={formatUGXShort(report.expenses_total)} />
            <StatTile label="Net Profit" value={formatUGXShort(report.net_profit)}
              subValue="Revenue − COGS − Expenses" />
          </div>

          {/* Trend */}
          <div className="card-standard">
            <h3 className="text-body-strong text-ink mb-[16px]">Daily Revenue & Profit — {range.label}</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="repRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="day" {...axisStyle} />
                <YAxis {...axisStyle} tickFormatter={formatUGXShort} width={70} />
                <Tooltip {...tooltipStyle} formatter={(v, name) => [formatUGX(v), name === 'revenue' ? 'Revenue' : 'Gross Profit']} />
                <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} fill="url(#repRevGrad)" />
                <Area type="monotone" dataKey="profit" stroke="#71717a" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
            {/* Payment breakdown */}
            <div className="card-standard">
              <h3 className="text-body-strong text-ink mb-[16px]">Payment Methods</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byPayment} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {byPayment.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v) => formatUGX(v)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top products */}
            <div className="card-standard">
              <h3 className="text-body-strong text-ink mb-[16px]">Top Products by Revenue</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                  <CartesianGrid {...gridStyle} horizontal={false} vertical />
                  <XAxis type="number" {...axisStyle} tickFormatter={formatUGXShort} />
                  <YAxis type="category" dataKey="name" {...axisStyle} width={120} />
                  <Tooltip {...tooltipStyle}
                    formatter={(v, name) => [formatUGX(v), name === 'revenue' ? 'Revenue' : 'Profit']} />
                  <Bar dataKey="revenue" fill="#000000" radius={[0, 4, 4, 0]} barSize={16} />
                  <Bar dataKey="profit" fill="#c1fbd4" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales by employee */}
          <div className="table-container">
            <div className="px-[24px] pt-[20px]">
              <h3 className="text-body-strong text-ink">Sales by Team Member — {range.label}</h3>
            </div>
            <div className="overflow-x-auto mt-[12px]">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th-cell">Name</th>
                    <th className="th-cell">Role</th>
                    <th className="th-cell">Transactions</th>
                    <th className="th-cell">Revenue</th>
                    <th className="th-cell">Gross Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {byEmployee.map((e) => (
                    <tr key={e.employee_id} className="hover:bg-canvas-cream transition-colors">
                      <td className="td-cell font-medium text-ink">{e.name}</td>
                      <td className="td-cell">
                        <span className={e.role === 'owner' ? 'pill-tag-mint' : 'pill-tag-shade'}>
                          {e.role === 'owner' ? 'Owner' : 'Employee'}
                        </span>
                      </td>
                      <td className="td-cell">{e.tx_count}</td>
                      <td className="td-cell font-medium text-ink">{formatUGX(e.total)}</td>
                      <td className="td-cell text-shade-60">{formatUGX(e.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
