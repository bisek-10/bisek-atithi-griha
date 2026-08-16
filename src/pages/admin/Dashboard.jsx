import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import NepaliDateInput from '../../components/NepaliDateInput'
import { fetchAllPaymentsBetween } from '../../lib/api'
import { formatBS } from '../../lib/nepaliDate'

const PRESETS = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'ytd', label: 'This year' },
  { key: 'custom', label: 'Custom range' },
]

const PIE_COLORS = ['#2F4F3E', '#C8901A']

function presetToRange(key) {
  const to = new Date()
  const from = new Date()
  if (key === '7d') from.setDate(from.getDate() - 6)
  if (key === '30d') from.setDate(from.getDate() - 29)
  if (key === 'ytd') { from.setMonth(0); from.setDate(1) }
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

export default function Dashboard() {
  const [preset, setPreset] = useState('30d')
  const [customFrom, setCustomFrom] = useState(presetToRange('30d').from)
  const [customTo, setCustomTo] = useState(presetToRange('30d').to)
  const [methodFilter, setMethodFilter] = useState('all')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const range = preset === 'custom' ? { from: customFrom, to: customTo } : presetToRange(preset)

  useEffect(() => {
    setLoading(true)
    fetchAllPaymentsBetween(range.from + 'T00:00:00Z', range.to + 'T23:59:59Z')
      .then(setPayments)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to])

  const filtered = useMemo(
    () => (methodFilter === 'all' ? payments : payments.filter((p) => p.method === methodFilter)),
    [payments, methodFilter]
  )

  const byDay = useMemo(() => {
    const map = {}
    for (const p of filtered) {
      const key = new Date(p.paid_at).toISOString().slice(0, 10)
      map[key] = (map[key] || 0) + Number(p.amount)
    }
    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, total]) => ({ date, bsLabel: formatBS(date), total }))
  }, [filtered])

  const byMethod = useMemo(() => {
    const map = { cash: 0, qr: 0 }
    for (const p of filtered) map[p.method] = (map[p.method] || 0) + Number(p.amount)
    return [
      { name: 'Cash', value: map.cash },
      { name: 'QR', value: map.qr },
    ]
  }, [filtered])

  const total = filtered.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="font-display text-3xl text-ink-800 tracking-tight">Sales Dashboard</h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white p-1 border border-sand-200 rounded-2xl flex gap-1 shadow-sm">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  preset === p.key 
                    ? 'bg-pine-700 text-sand-50 shadow-md shadow-pine-900/10' 
                    : 'text-ink-600 hover:bg-sand-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6 bg-white border border-sand-200 rounded-2xl p-6 shadow-sm">
        {preset === 'custom' && (
          <div className="flex flex-wrap gap-4">
            <NepaliDateInput label="From Date" value={customFrom} onChange={setCustomFrom} maxAD={customTo} />
            <NepaliDateInput label="To Date" value={customTo} onChange={setCustomTo} minAD={customFrom} />
          </div>
        )}

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">Payment Method</label>
          <div className="relative">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full appearance-none bg-sand-50 border border-sand-200 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-800 focus:ring-2 focus:ring-pine-700/20 outline-none transition-all"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash Only</option>
              <option value="qr">QR Only</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-400 gap-4">
          <div className="w-10 h-10 border-4 border-sand-200 border-t-pine-700 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Crunching the numbers...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Summary Card */}
          <div className="lg:col-span-4 bg-white border border-sand-200 rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-1">
              <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">Total Revenue</p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-ink-400">NPR</span>
                <span className="font-display text-5xl text-ink-800 tracking-tight">{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-sand-100 rounded-2xl px-6 py-4">
                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Transactions</p>
                <p className="text-2xl font-display text-ink-800">{filtered.length}</p>
              </div>
              <div className="bg-sand-100 rounded-2xl px-6 py-4">
                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Avg. Transaction</p>
                <p className="text-2xl font-display text-ink-800">NPR {(total / (filtered.length || 1)).toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="lg:col-span-3 bg-white border border-sand-200 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl text-ink-800">Revenue Trends</h3>
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Daily breakdown (BS)</span>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3EEE0" />
                  <XAxis 
                    dataKey="bsLabel" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#3C3A33', fontWeight: 500 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#3C3A33', fontWeight: 500 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#FBF9F4' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    formatter={(v) => [`NPR ${v.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="total" fill="#2F4F3E" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Method Chart */}
          <div className="bg-white border border-sand-200 rounded-[2rem] p-8 shadow-sm">
            <div className="mb-8">
              <h3 className="font-display text-xl text-ink-800">Payment Mix</h3>
              <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Cash vs Digital</p>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={byMethod} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={60} 
                    outerRadius={85} 
                    paddingAngle={8}
                    stroke="none"
                  >
                    {byMethod.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {byMethod.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-sand-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                    <span className="text-xs font-bold text-ink-800 uppercase tracking-wider">{m.name}</span>
                  </div>
                  <span className="text-sm font-medium text-ink-600">
                    {total > 0 ? ((m.value / total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
