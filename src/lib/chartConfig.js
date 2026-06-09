export const axisStyle = {
  axisLine: false,
  tickLine: false,
  tick: { fill: '#71717a', fontSize: 12, fontFamily: 'Inter, sans-serif' },
}

export const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
    boxShadow: '0 8px 8px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    padding: '10px 14px',
  },
  labelStyle: { color: '#000000', fontWeight: 550, marginBottom: 4 },
  cursor: { fill: '#fbfbf5' },
}

export const gridStyle = {
  strokeDasharray: '0',
  stroke: '#e4e4e7',
  vertical: false,
}

// Monochromatic shade ladder — intentional brand palette for charts
export const CHART_COLORS = ['#000000', '#71717a', '#a1a1aa', '#d4d4d8', '#c1fbd4']
