// Thin wrapper around `nepali-date-converter` so the rest of the app never
// touches the library directly. All DATA is stored in the database as
// normal Gregorian (AD) dates/timestamps — that keeps every date-math
// operation (billing, sorting, date-range queries) simple and reliable.
// Nepali (BS) dates are purely a DISPLAY layer, generated on the fly here.

import NepaliDate, { dateConfigMap } from 'nepali-date-converter'

// Canonical month-name keys used by the library's internal dateConfigMap,
// in the same 0-indexed order as NepaliDate.getMonth()/constructor month arg.
const BS_MONTH_KEYS = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
]

// Display names (kept separate from BS_MONTH_KEYS since our preferred
// English spellings differ slightly from the library's internal keys).
const BS_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
]

const BS_MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत',
]

const NP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

export function toNepaliDigits(n) {
  return String(n).replace(/[0-9]/g, (d) => NP_DIGITS[d])
}

// Accepts a JS Date, ISO date string ("2026-07-22"), or ISO timestamp.
export function toBS(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput)
  const nd = new NepaliDate(d)
  return {
    year: nd.getYear(),
    month: nd.getMonth(), // 0-indexed
    date: nd.getDate(),
    day: nd.getDay(), // 0=Sun
  }
}

// Human readable Nepali date, e.g. "7 Shrawan 2083" or Devanagari script.
export function formatBS(dateInput, { script = 'en' } = {}) {
  const bs = toBS(dateInput)
  if (script === 'np') {
    return `${toNepaliDigits(bs.date)} ${BS_MONTHS_NP[bs.month]} ${toNepaliDigits(bs.year)}`
  }
  return `${bs.date} ${BS_MONTHS[bs.month]} ${bs.year}`
}

// Short numeric form: 2083-04-07
export function formatBSNumeric(dateInput) {
  const bs = toBS(dateInput)
  const mm = String(bs.month + 1).padStart(2, '0')
  const dd = String(bs.date).padStart(2, '0')
  return `${bs.year}-${mm}-${dd}`
}

// Convert a BS (year, month 0-indexed, date) back to a JS Date (AD, midnight local).
export function bsToAD(year, month, date) {
  const nd = new NepaliDate(year, month, date)
  return nd.toJsDate()
}

export function todayBS() {
  return toBS(new Date())
}

export function bsMonthLength(year, month) {
  const yearConfig = dateConfigMap[String(year)]
  if (!yearConfig) return 30 // fallback for years outside the library's supported range
  const key = BS_MONTH_KEYS[month]
  return yearConfig[key] ?? 30
}

export { BS_MONTHS, BS_MONTHS_NP }
