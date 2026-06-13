import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { resolveRange } from '../lib/dateRanges'

export const useDateRange = (initialPreset = 'month') => {
  const [preset, setPreset] = useState(initialPreset)
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const range = useMemo(
    () => resolveRange(preset, { month, customFrom, customTo }),
    [preset, month, customFrom, customTo]
  )

  return {
    preset, setPreset,
    month, setMonth,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
    from: range.from,
    to: range.to,
    label: range.label,
  }
}
