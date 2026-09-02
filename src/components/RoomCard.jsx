export default function RoomCard({ room, onClick }) {
  const occupied = !!room.currentStay;

  return (
    <button
      onClick={onClick}
      className={`relative group aspect-square rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border ${
        occupied
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-white border-gray-200 text-gray-900 hover:border-pine-300"
      }`}>
      {/* Indicator Dot */}
      <div
        className={`absolute top-4 right-4 w-2 h-2 rounded-md ${occupied ? "bg-red-400" : "bg-green-500"}`}
      />

      <span className={`text-3xl font-display leading-none`}>{room.id}</span>

      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${occupied ? "text-red-600" : "text-gray-500"}`}>
          {occupied ? "Occupied" : "Available"}
        </span>
        <span
          className={`text-[10px] font-medium ${occupied ? "text-red-500" : "text-gray-400"}`}>
          {room.bathroom_type === "attached" ? "Attached" : "Shared"}
        </span>
      </div>
    </button>
  );
}
