import { useState } from 'react'
import NepaliDateInput from './NepaliDateInput'

const todayIso = () => new Date().toISOString().slice(0, 10)

// catalog: [{id, name, default_price, unit_type}]
// onSubmit({addonCatalogId, label, startDate, endDate, quantity, unitPrice, note})
export default function AddonForm({ catalog, onSubmit, onCancel, initial, maxDateAD }) {
  const [catalogId, setCatalogId] = useState(initial?.addon_catalog_id || catalog[0]?.id || '')
  const [customLabel, setCustomLabel] = useState(initial?.label && !catalog.find(c => c.id === initial.addon_catalog_id) ? initial.label : '')
  const [isRange, setIsRange] = useState(!!initial?.end_date && initial.end_date !== initial.start_date)
  const [startDate, setStartDate] = useState(initial?.start_date || todayIso())
  const [endDate, setEndDate] = useState(initial?.end_date || todayIso())
  const [quantity, setQuantity] = useState(initial?.quantity || 1)
  const [unitPrice, setUnitPrice] = useState(
    initial?.unit_price ?? catalog.find((c) => c.id === (initial?.addon_catalog_id || catalog[0]?.id))?.default_price ?? 0
  )
  const [note, setNote] = useState(initial?.note || '')

  const selectedCatalog = catalog.find((c) => c.id === catalogId)

  function handleCatalogChange(id) {
    setCatalogId(id)
    const c = catalog.find((x) => x.id === id)
    if (c) setUnitPrice(c.default_price)
  }

  function submit(e) {
    e.preventDefault()
    onSubmit({
      addonCatalogId: catalogId,
      label: selectedCatalog?.name === 'Other' ? customLabel : null,
      startDate,
      endDate: isRange ? endDate : startDate,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      note,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-3 border border-sand-200 rounded-xl p-4 bg-white">
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Service</label>
        <select
          value={catalogId}
          onChange={(e) => handleCatalogChange(e.target.value)}
          className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm"
        >
          {catalog.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.unit_type === 'per_day' ? '(per day)' : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedCatalog?.name === 'Other' && (
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Describe service</label>
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-xs text-ink-600">
        <input type="checkbox" checked={isRange} onChange={(e) => setIsRange(e.target.checked)} />
        This applied over a date range (e.g. appliance used for several days)
      </label>

      <div className="grid grid-cols-2 gap-3">
        <NepaliDateInput label={isRange ? 'From' : 'Date'} value={startDate} onChange={setStartDate} maxAD={maxDateAD} />
        {isRange && (
          <NepaliDateInput label="To" value={endDate} onChange={setEndDate} maxAD={maxDateAD} minAD={startDate} />
        )}
      </div>

      <p className="text-[11px] text-ink-600">
        You can pick any past date here — useful if a service was used a few days ago and wasn't
        logged at the time.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Quantity</label>
          <input
            type="number"
            min={0}
            step="0.5"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Unit price (NPR)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Note (optional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-sand-200 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="bg-pine-700 text-sand-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-pine-800">
          Save
        </button>
        <button type="button" onClick={onCancel} className="text-ink-600 text-sm px-4 py-2 hover:text-ink-800">
          Cancel
        </button>
      </div>
    </form>
  )
}
