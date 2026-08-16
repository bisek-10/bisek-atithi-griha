import { useEffect, useState } from 'react'
import Modal from './Modal'
import { fetchAvailableRooms, checkIn } from '../lib/api'
import { formatBS } from '../lib/nepaliDate'

function nowLocalDateTimeValue() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

// presetRoomId: if the owner clicked directly on a specific available room card
export default function CheckInModal({ presetRoomId, onClose, onDone }) {
  const [bathroomType, setBathroomType] = useState(null)
  const [rooms, setRooms] = useState([])
  const [roomId, setRoomId] = useState(presetRoomId || null)
  const [loadingRooms, setLoadingRooms] = useState(false)

  const [patientName, setPatientName] = useState('')
  const [address, setAddress] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [occupantCount, setOccupantCount] = useState(1)
  const [checkInAt, setCheckInAt] = useState(nowLocalDateTimeValue())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!presetRoomId && bathroomType) {
      setLoadingRooms(true)
      fetchAvailableRooms(bathroomType)
        .then(setRooms)
        .finally(() => setLoadingRooms(false))
    }
  }, [bathroomType, presetRoomId])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const checkInIso = new Date(checkInAt).toISOString()
      await checkIn({
        roomId,
        patientName,
        address,
        contactNumber,
        checkInAt: checkInIso,
        occupantCount: Number(occupantCount) || 1,
      })
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const showTypeStep = !presetRoomId && !roomId

  return (
    <Modal onClose={onClose} title={`Check in${roomId ? ` — Room ${roomId}` : ''}`}>
      {showTypeStep && (
        <div>
          <p className="text-sm text-ink-600 mb-3">Which type of room does the guest need?</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              className="border border-sand-200 rounded-xl py-4 hover:border-pine-600 hover:bg-sand-100 transition-colors"
              onClick={() => setBathroomType('attached')}
            >
              Attached bathroom
            </button>
            <button
              className="border border-sand-200 rounded-xl py-4 hover:border-pine-600 hover:bg-sand-100 transition-colors"
              onClick={() => setBathroomType('non_attached')}
            >
              Shared bathroom
            </button>
          </div>
          {bathroomType && (
            <div>
              <p className="text-sm text-ink-600 mb-2">Available rooms:</p>
              {loadingRooms && <p className="text-sm text-ink-600">Loading…</p>}
              {!loadingRooms && rooms.length === 0 && (
                <p className="text-sm text-brick-500">No rooms of this type are currently free.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRoomId(r.id)}
                    className="border border-pine-600 text-pine-700 rounded-lg px-3 py-1.5 text-sm hover:bg-pine-700 hover:text-sand-50 transition-colors"
                  >
                    Room {r.id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {roomId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Check-in time</label>
            <input
              type="datetime-local"
              value={checkInAt}
              onChange={(e) => setCheckInAt(e.target.value)}
              className="w-full border border-sand-200 rounded-lg px-3 py-2 focus:border-pine-600 outline-none"
            />
            <p className="text-xs text-ink-600 mt-1">
              {formatBS(checkInAt)} BS — hotel day starts at 3:00 AM; arriving before that charges
              the previous day too.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Number of people staying</label>
            <input
              type="number"
              min={1}
              value={occupantCount}
              onChange={(e) => setOccupantCount(e.target.value)}
              className="w-full border border-sand-200 rounded-lg px-3 py-2 focus:border-pine-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Patient name (optional)</label>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full border border-sand-200 rounded-lg px-3 py-2 focus:border-pine-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Address (optional)</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-sand-200 rounded-lg px-3 py-2 focus:border-pine-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Contact number (optional)</label>
            <input
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full border border-sand-200 rounded-lg px-3 py-2 focus:border-pine-600 outline-none"
            />
          </div>

          {error && <p className="text-brick-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-pine-700 text-sand-50 rounded-lg py-2.5 font-semibold hover:bg-pine-800 transition-colors disabled:opacity-60"
          >
            {saving ? 'Checking in…' : 'Check in'}
          </button>
        </form>
      )}
    </Modal>
  )
}
