export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-[2px] p-4 sm:p-6"
      onClick={onClose}>
      <div
        className={`
          relative w-full
          ${wide ? "max-w-4xl" : "max-w-lg"}
          max-h-[90vh]
          flex flex-col
          overflow-hidden
          rounded-2xl
          border border-sand-200
          bg-white
          shadow-2xl
          animate-fade-in-up
        `}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-sand-200 bg-white shrink-0">
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-800 truncate">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
              shrink-0
              w-9 h-9
              flex items-center justify-center
              rounded-lg
              border border-sand-200
              bg-sand-50
              text-ink-500
              text-xl
              leading-none
              hover:bg-sand-100
              hover:text-ink-800
              transition-colors
            ">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
