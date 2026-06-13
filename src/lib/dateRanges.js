import {
  startOfDay, startOfWeek, startOfMonth, endOfMonth,
  addDays, addMonths, format, subMonths,
} from 'date-fns'

// All ranges are [from, to) — `to` is an exclusive boundary so timestamps
// recorded any time on the last day are included.
export const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
]

export const resolveRange = (preset, { month, customFrom, customTo } = {}) => {
  const now = new Date()
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: addDays(startOfDay(now), 1), label: 'Today' }
    case 'week':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: addDays(startOfDay(now), 1), label: 'This Week' }
    case 'month':
      return { from: startOfMonth(now), to: addDays(startOfDay(now), 1), label: 'This Month' }
    case 'pick-month': {
      const m = month ? new Date(`${month}-01T00:00:00`) : startOfMonth(now)
      return {
        from: startOfMonth(m),
        to: addMonths(startOfMonth(m), 1),
        label: format(m, 'MMMM yyyy'),
      }
    }
    case 'custom': {
      const from = customFrom ? startOfDay(new Date(customFrom)) : startOfDay(now)
      const to = customTo ? addDays(startOfDay(new Date(customTo)), 1) : addDays(startOfDay(now), 1)
      return { from, to, label: `${format(from, 'dd MMM yyyy')} – ${format(addDays(to, -1), 'dd MMM yyyy')}` }
    }
    default:
      return { from: startOfDay(now), to: addDays(startOfDay(now), 1), label: 'Today' }
  }
}

// Last 12 months for the month dropdown, newest first
export const recentMonths = (count = 12) => {
  const start = startOfMonth(new Date())
  return Array.from({ length: count }, (_, i) => {
    const d = subMonths(start, i)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') }
  })
}

export const monthBounds = (yyyyMM) => {
  const m = new Date(`${yyyyMM}-01T00:00:00`)
  return { from: startOfMonth(m), to: endOfMonth(m) }
}
