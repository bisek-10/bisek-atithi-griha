import { useEffect, useMemo, useState } from 'react'
import { toBS, bsToAD, formatBS, BS_MONTHS, bsMonthLength } from '../lib/nepaliDate'

// value: AD date string 'YYYY-MM-DD' or null
// onChange(adDateString)
// maxAD / minAD: optional bounding AD date strings ('YYYY-MM-DD')
export default function NepaliDateInput({ value, onChange, maxAD, minAD, label }) {
  const [open, setOpen] = useState(false)
  const selectedBS = useMemo(() => (value ? toBS(value) : toBS(new Date())), [value])
  const [viewYear, setViewYear] = useState(selectedBS.year)
  const [viewMonth, setViewMonth] = useState(selectedBS.month)

  useEffect(() => {
    setViewYear(selectedBS.year)
    setViewMonth(selectedBS.month)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const daysInMonth = bsMonthLength(viewYear, viewMonth)
  const firstOfMonthAD = bsToAD(viewYear, viewMonth, 1)
  const leadingBlanks = firstOfMonthAD.getDay() // 0 = Sunday

  function pick(day) {
    const ad = bsToAD(viewYear, viewMonth, day)
    const iso = ad.toISOString().slice(0, 10)
    if (maxAD && iso > maxAD) return
    if (minAD && iso < minAD) return
    onChange(iso)
    setOpen(false)
  }

  function shiftMonth(delta) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewYear(y)
    setViewMonth(m)
  }

  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium text-ink-700 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-sand-200 rounded-lg px-3 py-2 text-left bg-white hover:border-pine-600 transition-colors"
      >
        {value ? formatBS(value) : 'Select date (BS)'}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-sand-200 rounded-xl shadow-lg p-3 w-72">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => shiftMonth(-1)} className="px-2 py-1 rounded hover:bg-sand-100">‹</button>
            <span className="text-sm font-semibold text-ink-800">
              {BS_MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={() => shiftMonth(1)} className="px-2 py-1 rounded hover:bg-sand-100">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-center text-ink-600 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <span key={`b${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const iso = bsToAD(viewYear, viewMonth, day).toISOString().slice(0, 10)
              const disabled = (maxAD && iso > maxAD) || (minAD && iso < minAD)
              const isSelected = value === iso
              return (
                <button
                  type="button"
                  key={day}
                  disabled={disabled}
                  onClick={() => pick(day)}
                  className={`text-sm rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-pine-700 text-sand-50'
                      : disabled
                      ? 'text-ink-600/30 cursor-not-allowed'
                      : 'hover:bg-sand-100 text-ink-700'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              const todayIso = new Date().toISOString().slice(0, 10)
              onChange(todayIso)
              setOpen(false)
            }}
            className="mt-2 text-xs text-saffron-600 hover:underline"
          >
            Today
          </button>
        </div>
      )}
    </div>
  )
}
