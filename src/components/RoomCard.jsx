export default function RoomCard({ room, onClick }) {
  const occupied = !!room.currentStay
  
  return (
    <button
      onClick={onClick}
      className={`relative group aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        occupied 
          ? 'bg-room-occupied shadow-lg shadow-room-occupied/20 text-sand-50' 
          : 'bg-white border border-sand-200 shadow-sm text-ink-800 hover:border-room-free/30'
      }`}
    >
      {/* Indicator Dot */}
      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${occupied ? 'bg-sand-50/40 animate-pulse' : 'bg-room-free'}`} />

      <span className={`text-3xl font-display leading-none ${!occupied && 'group-hover:text-room-free transition-colors'}`}>
        {room.id}
      </span>
      
      <div className="flex flex-col items-center gap-0.5">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${occupied ? 'text-sand-50/80' : 'text-ink-400'}`}>
          {occupied ? 'Occupied' : 'Available'}
        </span>
        <span className={`text-[10px] font-medium ${occupied ? 'text-sand-50/60' : 'text-ink-400/70'}`}>
          {room.bathroom_type === 'attached' ? 'Attached' : 'Shared'}
        </span>
      </div>

      {/* Hover Highlight (for available rooms) */}
      {!occupied && (
        <div className="absolute inset-0 rounded-[2rem] bg-room-free/0 group-hover:bg-room-free/[0.02] transition-colors" />
      )}
    </button>
  )
}
