// columns: [{ key: 'name', label: 'Product' }] — key may be a function(row)
const cellValue = (row, col) =>
  typeof col.key === 'function' ? col.key(row) : row[col.key]

const escapeCell = (value) => {
  if (value === null || value === undefined) return ''
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCsv = (rows, columns) => {
  const header = columns.map((c) => escapeCell(c.label)).join(',')
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(cellValue(row, c))).join(',')
  )
  return [header, ...body].join('\n')
}

export const downloadCsv = (filename, rows, columns) => {
  const csv = toCsv(rows, columns)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
