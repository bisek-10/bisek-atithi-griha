import { useEffect, useState } from 'react'
import NepaliDateInput from '../../components/NepaliDateInput'
import { fetchStaysHistory, updateStayReturnEstimate } from '../../lib/api'
import { formatBS } from '../../lib/nepaliDate'

export default function Customers() {
  const [stays, setStays] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingReturn, setEditingReturn] = useState(null) // stay id being edited

  async function load() {
    setLoading(true)
    const data = await fetchStaysHistory({ search: search || undefined })
    setStays(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    load()
  }

  const visible = stays.filter((s) => (statusFilter === 'all' ? true : s.status === statusFilter))

  async function saveReturnDate(stayId, date) {
    await updateStayReturnEstimate(stayId, date)
    setEditingReturn(null)
    load()
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="font-display text-3xl text-ink-800 tracking-tight">Customer Records</h1>
        
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full bg-white border border-sand-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pine-700/20 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-sand-200 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-700 outline-none focus:ring-2 focus:ring-pine-700/20 transition-all"
          >
            <option value="all">All Stays</option>
            <option value="occupied">Staying</option>
            <option value="checked_out">Checked out</option>
          </select>
          <button type="submit" className="bg-pine-700 text-sand-50 rounded-xl px-6 py-2.5 text-sm font-bold hover:bg-pine-800 transition-all shadow-lg shadow-pine-900/10">
            Search
          </button>
        </form>
      </div>

      <div className="bg-white border border-sand-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-sand-50 border-b border-sand-200">
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Customer Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Room</th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Check-in Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest text-right">Return Estimate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-sand-200 border-t-pine-700 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-ink-400">Loading history...</p>
                    </div>
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-ink-400 font-medium">
                    No matching customer records found.
                  </td>
                </tr>
              ) : (
                visible.map((s) => (
                  <tr key={s.id} className="group hover:bg-sand-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-ink-800">{s.patient_name || '—'}</p>
                        <p className="text-xs text-ink-400">{s.address || '—'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-ink-700">{s.contact_number || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sand-100 text-sm font-display text-ink-800">
                        {s.room_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-ink-700 font-medium">{formatBS(s.check_in_at)}</p>
                      <p className="text-[10px] text-ink-400 uppercase tracking-tighter">
                        {new Date(s.check_in_at).toLocaleDateString('en-GB')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'occupied' 
                          ? 'bg-room-free/10 text-room-free' 
                          : 'bg-ink-400/10 text-ink-500'
                      }`}>
                        {s.status === 'occupied' ? 'Staying' : 'Checked out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingReturn === s.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <NepaliDateInput
                            value={s.expected_return_date}
                            onChange={(d) => saveReturnDate(s.id, d)}
                          />
                          <button 
                            className="p-1.5 rounded-lg text-ink-400 hover:bg-brick-500/10 hover:text-brick-500 transition-colors" 
                            onClick={() => setEditingReturn(null)}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-pine-700 hover:text-pine-800 transition-colors" 
                          onClick={() => setEditingReturn(s.id)}
                        >
                          {s.expected_return_date ? (
                            <>
                              <span className="font-bold">{formatBS(s.expected_return_date)}</span>
                              <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </>
                          ) : (
                            <span className="text-xs text-ink-400 italic font-normal">+ Add estimate</span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
