import { useEffect, useState, useCallback } from "react";
import Modal from "./Modal";
import NepaliDateInput from "./NepaliDateInput";
import AddonForm from "./AddonForm";
import { formatBS } from "../lib/nepaliDate";
import { computeBillTotal, addonEntryCharge } from "../lib/billing";
import { downloadBillPdf } from "../lib/pdfBill";
import {
  fetchOccupancyPeriods,
  changeOccupancy,
  fetchAddonCatalog,
  fetchAddonEntries,
  addAddonEntry,
  updateAddonEntry,
  deleteAddonEntry,
  fetchAvailableRooms,
  transferRoom,
  fetchRoomTransfers,
  checkOut,
  recordPayment,
  fetchSettings,
  fetchRoomsWithStatus,
} from "../lib/api";

function nowLocalDateTimeValue() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function RoomDetailModal({ room, onClose, onChanged }) {
  const stay = room.currentStay;
  const [occupancy, setOccupancy] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [addons, setAddons] = useState([]);
  const [settings, setSettings] = useState({});
  const [roomTransfers, setRoomTransfers] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddonForm, setShowAddonForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);

  const [newHeadcountDate, setNewHeadcountDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [newHeadcount, setNewHeadcount] = useState("");

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferOptions, setTransferOptions] = useState([]);
  const [transferTarget, setTransferTarget] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkOutAt, setCheckOutAt] = useState(nowLocalDateTimeValue());
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [occ, cat, ad, sett, transfers, roomsList] = await Promise.all([
      fetchOccupancyPeriods(stay.id),
      fetchAddonCatalog(),
      fetchAddonEntries(stay.id),
      fetchSettings(),
      fetchRoomTransfers(stay.id),
      fetchRoomsWithStatus(),
    ]);
    setOccupancy(occ);
    setCatalog(cat);
    setAddons(ad);
    setSettings(sett);
    setRoomTransfers(transfers);
    setAllRooms(roomsList);
    setLoading(false);
  }, [stay.id]);

  useEffect(() => {
    load();
  }, [load]);

  const currentRoom = allRooms.find((r) => r.id === stay.room_id) ?? room;
  const nowIso = new Date().toISOString();
  const bill = computeBillTotal({
    room: currentRoom,
    checkInAt: stay.check_in_at,
    checkOutAtOrNow: showCheckout ? new Date(checkOutAt).toISOString() : nowIso,
    occupancyPeriods: occupancy,
    addonEntries: addons,
    roomTransfers,
    allRooms,
  });

  useEffect(() => {
    setAmountReceived((prev) => {
      if (showCheckout || prev === "") {
        return bill.grandTotal.toFixed(2);
      }
      return prev;
    });
  }, [showCheckout, bill.grandTotal, stay.id]);

  if (loading) {
    return (
      <Modal title={`Room ${room.id}`} onClose={onClose}>
        <p className="text-ink-600 text-sm">Loading…</p>
      </Modal>
    );
  }

  async function handleAddonSubmit(payload) {
    if (editingAddon) {
      await updateAddonEntry(editingAddon.id, {
        addon_catalog_id: payload.addonCatalogId,
        label: payload.label,
        start_date: payload.startDate,
        end_date: payload.endDate,
        quantity: payload.quantity,
        unit_price: payload.unitPrice,
        note: payload.note,
      });
    } else {
      await addAddonEntry({ stayId: stay.id, ...payload });
    }
    setShowAddonForm(false);
    setEditingAddon(null);
    load();
  }

  async function handleDeleteAddon(id) {
    if (!confirm("Remove this service charge?")) return;
    await deleteAddonEntry(id);
    load();
  }

  async function handleHeadcountSave() {
    if (!newHeadcount) return;
    await changeOccupancy({
      stayId: stay.id,
      effectiveDate: newHeadcountDate,
      newCount: Number(newHeadcount),
    });
    setNewHeadcount("");
    load();
  }

  async function openTransfer() {
    setShowTransfer(true);
    const options = await fetchAvailableRooms();
    setTransferOptions(options);
  }

  async function handleTransfer() {
    if (!transferTarget) return;
    await transferRoom({
      stayId: stay.id,
      fromRoomId: currentRoom.id,
      toRoomId: Number(transferTarget),
    });
    setShowTransfer(false);
    setTransferTarget("");
    onChanged();
    await load();
  }

  async function handleFinishCheckout() {
    setCheckoutBusy(true);
    setCheckoutError("");
    try {
      const checkOutIso = new Date(checkOutAt).toISOString();
      await recordPayment({
        stayId: stay.id,
        amount: Number(amountReceived) || bill.grandTotal,
        method: paymentMethod,
      });
      await checkOut({ stayId: stay.id, checkOutAt: checkOutIso });
      downloadBillPdf({
        stay: { ...stay, room: currentRoom, check_out_at: checkOutIso },
        bill,
        addonEntries: addons,
        payment: {
          method: paymentMethod,
          amount: Number(amountReceived) || bill.grandTotal,
          paid_at: new Date().toISOString(),
        },
        hotelProfile: settings.hotel_profile,
      });
      setDone(true);
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutBusy(false);
    }
  }

  if (done) {
    return (
      <Modal
        title="Checked out"
        onClose={() => {
          onChanged();
          onClose();
        }}>
        <p className="text-ink-700 mb-4">
          Room {currentRoom.id} has been checked out and the bill PDF has
          downloaded. The room is now available again.
        </p>
        <button
          onClick={() => {
            onChanged();
            onClose();
          }}
          className="bg-pine-700 text-sand-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-pine-800">
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal title={`Room ${currentRoom.id}`} onClose={onClose} wide>
      {/* Guest info */}
      <div className="mb-6 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-ink-600">Patient</p>
          <p className="font-semibold text-ink-800">
            {stay.patient_name || "—"}
          </p>
        </div>
        <div>
          <p className="text-ink-600">Contact</p>
          <p className="font-semibold text-ink-800">
            {stay.contact_number || "—"}
          </p>
        </div>
        <div>
          <p className="text-ink-600">Address</p>
          <p className="font-semibold text-ink-800">{stay.address || "—"}</p>
        </div>
        <div>
          <p className="text-ink-600">Checked in</p>
          <p className="font-semibold text-ink-800">
            {new Date(stay.check_in_at).toLocaleString()} ·{" "}
            {formatBS(stay.check_in_at)} BS
          </p>
        </div>
      </div>

      {!showCheckout && (
        <>
          {/* Occupancy */}
          <section className="mb-6">
            <h3 className="font-display text-lg text-ink-800 mb-2">
              People staying in this room
            </h3>
            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="text-left text-ink-600 border-b border-sand-200">
                  <th className="py-1">From</th>
                  <th className="py-1">To</th>
                  <th className="py-1">People</th>
                </tr>
              </thead>
              <tbody>
                {occupancy.map((p) => (
                  <tr key={p.id} className="border-b border-sand-100">
                    <td className="py-1">{formatBS(p.start_date)}</td>
                    <td className="py-1">
                      {p.end_date ? formatBS(p.end_date) : "ongoing"}
                    </td>
                    <td className="py-1">{p.occupant_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-end gap-2">
              <NepaliDateInput
                label="Change takes effect from"
                value={newHeadcountDate}
                onChange={setNewHeadcountDate}
              />
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  New headcount
                </label>
                <input
                  type="number"
                  min={1}
                  value={newHeadcount}
                  onChange={(e) => setNewHeadcount(e.target.value)}
                  className="border border-sand-200 rounded-lg px-3 py-2 w-28 text-sm"
                />
              </div>
              <button
                onClick={handleHeadcountSave}
                className="border border-pine-600 text-pine-700 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-pine-700 hover:text-sand-50 transition-colors">
                Update
              </button>
            </div>
            <p className="text-[11px] text-ink-600 mt-1">
              If more people stay for a few days and then leave, log the change
              here — extra-person charges apply only on the days that had more
              people.
            </p>
          </section>

          {/* Add-ons */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg text-ink-800">
                Additional services
              </h3>
              {!showAddonForm && (
                <button
                  onClick={() => {
                    setEditingAddon(null);
                    setShowAddonForm(true);
                  }}
                  className="text-sm text-saffron-600 font-semibold hover:underline">
                  + Add service
                </button>
              )}
            </div>

            {addons.length > 0 && (
              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="text-left text-ink-600 border-b border-sand-200">
                    <th className="py-1">Service</th>
                    <th className="py-1">Date(s)</th>
                    <th className="py-1">Qty</th>
                    <th className="py-1">Total</th>
                    <th className="py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {addons.map((a) => (
                    <tr key={a.id} className="border-b border-sand-100">
                      <td className="py-1">{a.label}</td>
                      <td className="py-1">
                        {a.end_date && a.end_date !== a.start_date
                          ? `${formatBS(a.start_date)} – ${formatBS(a.end_date)}`
                          : formatBS(a.start_date)}
                      </td>
                      <td className="py-1">{a.quantity}</td>
                      <td className="py-1">
                        NPR {addonEntryCharge(a).toFixed(2)}
                      </td>
                      <td className="py-1 text-right space-x-2">
                        <button
                          className="text-pine-700 hover:underline"
                          onClick={() => {
                            setEditingAddon(a);
                            setShowAddonForm(true);
                          }}>
                          Edit
                        </button>
                        <button
                          className="text-brick-500 hover:underline"
                          onClick={() => handleDeleteAddon(a.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {showAddonForm && (
              <AddonForm
                catalog={catalog}
                initial={editingAddon}
                maxDateAD={new Date().toISOString().slice(0, 10)}
                onSubmit={handleAddonSubmit}
                onCancel={() => {
                  setShowAddonForm(false);
                  setEditingAddon(null);
                }}
              />
            )}
          </section>

          {/* Running total */}
          <section className="mb-6 bg-sand-100 rounded-xl p-4 text-sm">
            <p className="flex justify-between">
              <span>
                Room charges so far ({bill.nights} night
                {bill.nights !== 1 ? "s" : ""})
              </span>
              <span>NPR {bill.roomTotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Add-on services</span>
              <span>NPR {bill.addonTotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between font-semibold text-ink-800 mt-1 pt-1 border-t border-sand-200">
              <span>Running total</span>
              <span>NPR {bill.grandTotal.toFixed(2)}</span>
            </p>
          </section>

          {/* Transfer + checkout actions */}
          <div className="flex flex-wrap gap-3">
            {!showTransfer ? (
              <button
                onClick={openTransfer}
                className="border border-ink-600/30 rounded-lg px-4 py-2 text-sm hover:border-pine-600">
                Move to another room
              </button>
            ) : (
              <div className="flex items-end gap-2">
                <div>
                  <label className="block text-xs text-ink-700 mb-1">
                    New room
                  </label>
                  <select
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    className="border border-sand-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select room</option>
                    {transferOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.id} (
                        {r.bathroom_type === "attached" ? "attached" : "shared"}
                        )
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleTransfer}
                  className="bg-pine-700 text-sand-50 rounded-lg px-4 py-2 text-sm font-semibold">
                  Confirm move
                </button>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="text-ink-600 text-sm px-2">
                  Cancel
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setAmountReceived(bill.grandTotal.toFixed(2));
                setShowCheckout(true);
              }}
              className="bg-brick-500 text-sand-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-brick-600 transition-colors ml-auto">
              Check out →
            </button>
          </div>
        </>
      )}

      {showCheckout && (
        <section>
          <h3 className="font-display text-lg text-ink-800 mb-3">
            Check out — Room {currentRoom.id}
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Check-out time
            </label>
            <input
              type="datetime-local"
              value={checkOutAt}
              onChange={(e) => setCheckOutAt(e.target.value)}
              className="border border-sand-200 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-ink-600 mt-1">
              {formatBS(checkOutAt)} BS
            </p>
          </div>

          <div className="bg-sand-100 rounded-xl p-4 text-sm mb-4 max-h-52 overflow-y-auto">
            {bill.breakdown.map((r) => (
              <p
                key={`${r.roomId}-${r.dateStr}`}
                className="flex justify-between">
                <span>
                  Room {r.roomId} × {r.nights} night{r.nights !== 1 ? "s" : ""}
                  {r.extraPersons > 0 ? ` (+${r.extraPersons} pax)` : ""}
                </span>
                <span>NPR {r.charge.toFixed(2)}</span>
              </p>
            ))}
            <p className="flex justify-between font-semibold border-t border-sand-200 mt-2 pt-2">
              <span>Room subtotal</span>
              <span>NPR {bill.roomTotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Add-ons</span>
              <span>NPR {bill.addonTotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between font-bold text-ink-800 text-base mt-1">
              <span>Grand total</span>
              <span>NPR {bill.grandTotal.toFixed(2)}</span>
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-ink-700 mb-2">
              Payment method
            </label>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`px-4 py-2 rounded-lg text-sm border ${paymentMethod === "cash" ? "bg-pine-700 text-sand-50 border-pine-700" : "border-sand-200"}`}>
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod("qr")}
                className={`px-4 py-2 rounded-lg text-sm border ${paymentMethod === "qr" ? "bg-pine-700 text-sand-50 border-pine-700" : "border-sand-200"}`}>
                QR payment
              </button>
            </div>
            {paymentMethod === "qr" &&
              (settings.qr_image_url ? (
                <img
                  src={settings.qr_image_url}
                  alt="Payment QR"
                  className="w-40 h-40 object-contain border border-sand-200 rounded-lg"
                />
              ) : (
                <p className="text-sm text-brick-500">
                  No QR image uploaded yet — add one in Settings.
                </p>
              ))}
            <div className="mt-3">
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Amount received (NPR)
              </label>
              <input
                type="number"
                step="0.01"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="border border-sand-200 rounded-lg px-3 py-2 text-sm w-40"
              />
            </div>
          </div>

          {checkoutError && (
            <p className="text-brick-500 text-sm mb-3">{checkoutError}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleFinishCheckout}
              disabled={checkoutBusy}
              className="bg-brick-500 text-sand-50 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-brick-600 disabled:opacity-60">
              {checkoutBusy
                ? "Processing…"
                : "Confirm check-out & generate bill PDF"}
            </button>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-ink-600 text-sm px-3">
              Back
            </button>
          </div>
        </section>
      )}
    </Modal>
  );
}
