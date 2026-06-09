import { format } from 'date-fns'

export const formatUGX = (value) =>
  'UGX ' + Number(value).toLocaleString('en-UG')

export const formatUGXShort = (value) => {
  if (value >= 1_000_000) return `UGX ${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `UGX ${(value / 1_000).toFixed(0)}K`
  return formatUGX(value)
}

export const formatDate = (date, pattern = 'dd MMM yyyy') =>
  format(new Date(date), pattern)

export const formatTime = (date) =>
  format(new Date(date), 'HH:mm')
