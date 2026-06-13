import { ChevronDown } from 'lucide-react'
import { PRESETS, recentMonths } from '../lib/dateRanges'

// Controls a useDateRange() instance: preset pills + month select + custom dates
export const DateRangePicker = ({ range }) => {
  const { preset, setPreset, month, setMonth, customFrom, setCustomFrom, customTo, setCustomTo } = range
  const months = recentMonths()

  const pill = (active) =>
    `px-[14px] py-[6px] rounded-pill text-caption font-medium transition-colors whitespace-nowrap ${
      active ? 'bg-ink text-on-primary' : 'bg-shade-30 text-ink hover:bg-shade-40'
    }`

  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      {PRESETS.map((p) => (
        <button key={p.key} className={pill(preset === p.key)} onClick={() => setPreset(p.key)}>
          {p.label}
        </button>
      ))}

      <div className="relative">
        <select
          value={preset === 'pick-month' ? month : ''}
          onChange={(e) => {
            if (e.target.value) {
              setMonth(e.target.value)
              setPreset('pick-month')
            }
          }}
          className={`${pill(preset === 'pick-month')} appearance-none cursor-pointer pr-[28px]`}
        >
          <option value="">Pick month…</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <button className={pill(preset === 'custom')} onClick={() => setPreset('custom')}>
        Custom
      </button>

      {preset === 'custom' && (
        <div className="flex items-center gap-[6px]">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="text-input !w-auto !py-[5px] !px-[10px] text-caption"
          />
          <span className="text-caption text-shade-60">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="text-input !w-auto !py-[5px] !px-[10px] text-caption"
          />
        </div>
      )}
    </div>
  )
}
