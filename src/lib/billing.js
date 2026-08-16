// ============================================================
// Billing engine
// ------------------------------------------------------------
// The hotel's "day" runs from 3:00 AM to 3:00 AM, not midnight to
// midnight. So:
//   - A guest arriving at 10:00 AM on 7 Shrawan belongs to hotel-day
//     "7 Shrawan".
//   - A guest arriving at 1:30 AM on 7 Shrawan (i.e. technically the
//     small hours of the 7th) is treated as having already used the
//     6th's day too, so a full extra day (6 Shrawan) is charged.
//     This is implemented simply: any timestamp before 3:00 AM is
//     folded back onto the PREVIOUS calendar date before any other
//     math happens. Nothing else needs to know about the 3AM rule.
// ============================================================

export const CHECKIN_CUTOFF_HOUR = 3;

function toDateOnly(y, m, d) {
  return new Date(Date.UTC(y, m, d));
}

// Returns a 'YYYY-MM-DD' string for the HOTEL-DAY a given timestamp belongs to.
export function hotelDateStr(input) {
  const d = input instanceof Date ? input : new Date(input);
  let y = d.getFullYear(),
    m = d.getMonth(),
    day = d.getDate();
  if (d.getHours() < CHECKIN_CUTOFF_HOUR) {
    const shifted = new Date(y, m, day - 1);
    y = shifted.getFullYear();
    m = shifted.getMonth();
    day = shifted.getDate();
  }
  const dt = toDateOnly(y, m, day);
  return dt.toISOString().slice(0, 10);
}

function addDaysStr(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = toDateOnly(y, m - 1, d + days);
  return dt.toISOString().slice(0, 10);
}

function diffDays(aStr, bStr) {
  const a = new Date(aStr + "T00:00:00Z").getTime();
  const b = new Date(bStr + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
}

// Builds the list of hotel-day date strings a stay occupies, given the
// raw check-in timestamp and either a check-out timestamp or "now" for
// an ongoing stay. Always at least 1 day.
export function nightsList(checkInAt, checkOutAtOrNow) {
  const startStr = hotelDateStr(checkInAt);
  let endStr = hotelDateStr(checkOutAtOrNow);
  let n = diffDays(startStr, endStr);
  if (n < 1) n = 1; // minimum one night even for a same-day / early stay
  const days = [];
  for (let i = 0; i < n; i++) days.push(addDaysStr(startStr, i));
  return days;
}

// Given occupancy_periods rows [{start_date, end_date, occupant_count}]
// (end_date null = ongoing), find the occupant count that applies to a
// given hotel-day date string. Falls back to 1 if nothing matches.
export function occupantsOnDate(occupancyPeriods, dateStr) {
  for (const p of occupancyPeriods) {
    if (p.start_date <= dateStr && (!p.end_date || p.end_date >= dateStr)) {
      return p.occupant_count;
    }
  }
  return 1;
}

// Produces a full per-night room-charge breakdown.
export function resolveRoomForDate({
  currentRoom,
  roomTransfers = [],
  allRooms = [],
  dateStr,
}) {
  if (!roomTransfers.length) return currentRoom;

  const roomMap = Object.fromEntries(allRooms.map((r) => [r.id, r]));
  const sortedTransfers = [...roomTransfers].sort(
    (a, b) => new Date(a.transferred_at) - new Date(b.transferred_at),
  );
  const initialRoomId = sortedTransfers[0]?.from_room_id ?? currentRoom.id;
  let effectiveRoom = roomMap[initialRoomId] || currentRoom;

  for (const transfer of sortedTransfers) {
    const transferDate = hotelDateStr(transfer.transferred_at);
    if (dateStr >= transferDate) {
      effectiveRoom = roomMap[transfer.to_room_id] || effectiveRoom;
    }
  }

  return effectiveRoom;
}

export function roomNightsBreakdown({
  room,
  checkInAt,
  checkOutAtOrNow,
  occupancyPeriods,
  roomTransfers = [],
  allRooms = [],
}) {
  const days = nightsList(checkInAt, checkOutAtOrNow);
  const grouped = new Map();

  for (const dateStr of days) {
    const effectiveRoom = resolveRoomForDate({
      currentRoom: room,
      roomTransfers,
      allRooms,
      dateStr,
    });
    const occupants = occupantsOnDate(occupancyPeriods, dateStr);
    const extra = Math.max(0, occupants - effectiveRoom.standard_occupancy);
    const charge =
      Number(effectiveRoom.base_rate) +
      extra * Number(effectiveRoom.extra_person_rate);

    const key = `${effectiveRoom.id}|${effectiveRoom.base_rate}|${effectiveRoom.extra_person_rate}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        dateStr,
        roomId: effectiveRoom.id,
        occupants,
        baseRate: Number(effectiveRoom.base_rate),
        extraPersons: extra,
        extraPersonRate: Number(effectiveRoom.extra_person_rate),
        nights: 0,
        charge: 0,
      });
    }

    const row = grouped.get(key);
    row.nights += 1;
    row.charge += charge;
    row.occupants = Math.max(row.occupants, occupants);
  }

  return [...grouped.values()].map((row) => ({
    dateStr: row.dateStr,
    roomId: row.roomId,
    occupants: row.occupants,
    baseRate: row.baseRate,
    extraPersons: row.extraPersons,
    extraPersonRate: row.extraPersonRate,
    nights: row.nights,
    charge: row.charge,
  }));
}

export function sumRoomCharges(breakdown) {
  return breakdown.reduce((s, r) => s + r.charge, 0);
}

function daysBetweenInclusive(startDate, endDate) {
  if (!startDate) return 1;
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate || startDate}T00:00:00Z`);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  return Math.max(1, diffDays + 1);
}

export function addonEntryCharge(addonEntry) {
  const quantity = Number(addonEntry.quantity || 0);
  const unitPrice = Number(addonEntry.unit_price || 0);
  const unitType =
    addonEntry.unit_type || addonEntry.addon_catalog?.unit_type || "one_time";

  if (unitType === "per_day") {
    return (
      quantity *
      unitPrice *
      daysBetweenInclusive(addonEntry.start_date, addonEntry.end_date)
    );
  }

  return quantity * unitPrice;
}

export function sumAddonCharges(addonEntries) {
  return addonEntries.reduce((s, a) => s + addonEntryCharge(a), 0);
}

export function computeBillTotal({
  room,
  checkInAt,
  checkOutAtOrNow,
  occupancyPeriods,
  addonEntries,
  roomTransfers = [],
  allRooms = [],
}) {
  const breakdown = roomNightsBreakdown({
    room,
    checkInAt,
    checkOutAtOrNow,
    occupancyPeriods,
    roomTransfers,
    allRooms,
  });
  const roomTotal = sumRoomCharges(breakdown);
  const addonTotal = sumAddonCharges(addonEntries);
  return {
    breakdown,
    roomTotal,
    addonTotal,
    grandTotal: roomTotal + addonTotal,
    nights: breakdown.length,
  };
}
