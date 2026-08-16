import { useCallback, useEffect, useState } from 'react'
import RoomCard from '../../components/RoomCard'
import CheckInModal from '../../components/CheckInModal'
import RoomDetailModal from '../../components/RoomDetailModal'
import { fetchRoomsWithStatus } from '../../lib/api'
import { formatBS } from '../../lib/nepaliDate'

export default function Overview() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkInFor, setCheckInFor] = useState(undefined) // undefined = closed, null = open w/o preset room, number = preset room
  const [detailRoom, setDetailRoom] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetchRoomsWithStatus()
    setRooms(r)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const freeCount = rooms.filter((r) => !r.currentStay).length

  function handleRoomClick(room) {
    if (room.currentStay) {
      setDetailRoom(room)
    } else {
      setCheckInFor(room.id)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink-800 tracking-tight">Room Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-ink-600 bg-sand-200 px-2 py-0.5 rounded-md">{formatBS(new Date())} BS</span>
            <span className="text-sm text-ink-400">·</span>
            <span className="text-sm text-ink-500 font-medium">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-white border border-sand-200 rounded-2xl p-1.5 shadow-sm">
            <div className="px-4 py-1.5 border-r border-sand-100 text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-bold">Available</p>
              <p className="text-lg font-display text-room-free leading-tight">{freeCount}</p>
            </div>
            <div className="px-4 py-1.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-bold">Occupied</p>
              <p className="text-lg font-display text-room-occupied leading-tight">{rooms.length - freeCount}</p>
            </div>
          </div>

          <button
            onClick={() => setCheckInFor(null)}
            className="bg-pine-700 text-sand-50 rounded-2xl px-6 py-3 text-sm font-bold shadow-lg shadow-pine-900/10 hover:bg-pine-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Check-in
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-400 gap-4">
          <div className="w-10 h-10 border-4 border-sand-200 border-t-pine-700 rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading room layout...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onClick={() => handleRoomClick(room)} />
          ))}
        </div>
      )}

      {checkInFor !== undefined && (
        <CheckInModal
          presetRoomId={checkInFor || null}
          onClose={() => setCheckInFor(undefined)}
          onDone={() => { setCheckInFor(undefined); load() }}
        />
      )}

      {detailRoom && (
        <RoomDetailModal room={detailRoom} onClose={() => setDetailRoom(null)} onChanged={load} />
      )}
    </div>
  )
}
