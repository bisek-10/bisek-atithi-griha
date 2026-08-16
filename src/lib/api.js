import { supabase } from "../supabaseClient";

// ---------- Rooms ----------
export async function fetchRoomsWithStatus() {
  const { data: rooms, error: e1 } = await supabase
    .from("rooms")
    .select("*")
    .order("id");
  if (e1) throw e1;
  const { data: stays, error: e2 } = await supabase
    .from("stays")
    .select("*")
    .eq("status", "occupied");
  if (e2) throw e2;
  const stayByRoom = Object.fromEntries(stays.map((s) => [s.room_id, s]));
  return rooms.map((r) => ({ ...r, currentStay: stayByRoom[r.id] || null }));
}

export async function fetchAvailableRooms(bathroomType) {
  // small dataset (14 rooms) — fetch all active rooms and filter client-side
  const { data: all, error: e2 } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("id");
  if (e2) throw e2;
  const { data: occupied, error: e3 } = await supabase
    .from("stays")
    .select("room_id")
    .eq("status", "occupied");
  if (e3) throw e3;
  const occupiedIds = new Set(occupied.map((s) => s.room_id));
  return all.filter(
    (r) =>
      !occupiedIds.has(r.id) &&
      (!bathroomType || r.bathroom_type === bathroomType),
  );
}

// ---------- Check-in / check-out ----------
export async function checkIn({
  roomId,
  patientName,
  address,
  contactNumber,
  checkInAt,
  occupantCount,
}) {
  const { data: stay, error } = await supabase
    .from("stays")
    .insert({
      room_id: roomId,
      patient_name: patientName || null,
      address: address || null,
      contact_number: contactNumber || null,
      check_in_at: checkInAt || new Date().toISOString(),
      status: "occupied",
    })
    .select()
    .single();
  if (error) throw error;

  const { error: e2 } = await supabase.from("occupancy_periods").insert({
    stay_id: stay.id,
    start_date: (checkInAt ? new Date(checkInAt) : new Date())
      .toISOString()
      .slice(0, 10),
    end_date: null,
    occupant_count: occupantCount || 1,
  });
  if (e2) throw e2;
  return stay;
}

export async function checkOut({ stayId, checkOutAt }) {
  const { data, error } = await supabase
    .from("stays")
    .update({
      status: "checked_out",
      check_out_at: checkOutAt || new Date().toISOString(),
    })
    .eq("id", stayId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function transferRoom({ stayId, fromRoomId, toRoomId, note }) {
  const { error: e1 } = await supabase.from("room_transfers").insert({
    stay_id: stayId,
    from_room_id: fromRoomId,
    to_room_id: toRoomId,
    note: note || null,
  });
  if (e1) throw e1;
  const { data, error: e2 } = await supabase
    .from("stays")
    .update({ room_id: toRoomId })
    .eq("id", stayId)
    .select()
    .single();
  if (e2) throw e2;
  return data;
}

export async function fetchRoomTransfers(stayId) {
  const { data, error } = await supabase
    .from("room_transfers")
    .select("*")
    .eq("stay_id", stayId)
    .order("transferred_at", { ascending: true });
  if (error) throw error;
  return data;
}

// ---------- Occupancy (headcount changes mid-stay) ----------
export async function fetchOccupancyPeriods(stayId) {
  const { data, error } = await supabase
    .from("occupancy_periods")
    .select("*")
    .eq("stay_id", stayId)
    .order("start_date");
  if (error) throw error;
  return data;
}

// Close the currently-open period (if any) at `atDate` and open a new one
// starting the next day with the new occupant count. Used when the number
// of people staying in a room changes partway through a stay.
export async function changeOccupancy({ stayId, effectiveDate, newCount }) {
  const { data: open, error: e1 } = await supabase
    .from("occupancy_periods")
    .select("*")
    .eq("stay_id", stayId)
    .is("end_date", null)
    .maybeSingle();
  if (e1) throw e1;
  if (open) {
    const dayBefore = new Date(effectiveDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    await supabase
      .from("occupancy_periods")
      .update({ end_date: dayBefore.toISOString().slice(0, 10) })
      .eq("id", open.id);
  }
  const { error: e2 } = await supabase.from("occupancy_periods").insert({
    stay_id: stayId,
    start_date: effectiveDate,
    end_date: null,
    occupant_count: newCount,
  });
  if (e2) throw e2;
}

// ---------- Add-ons ----------
export async function fetchAddonCatalog() {
  const { data, error } = await supabase
    .from("addon_catalog")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data;
}

export async function fetchAddonEntries(stayId) {
  const { data, error } = await supabase
    .from("addon_entries")
    .select("*, addon_catalog(name, unit_type)")
    .eq("stay_id", stayId)
    .order("start_date");
  if (error) throw error;
  return data.map((a) => ({
    ...a,
    label: a.label || a.addon_catalog?.name,
    unit_type: a.unit_type || a.addon_catalog?.unit_type || "one_time",
  }));
}

export async function addAddonEntry({
  stayId,
  addonCatalogId,
  label,
  startDate,
  endDate,
  quantity,
  unitPrice,
  note,
}) {
  const { data, error } = await supabase
    .from("addon_entries")
    .insert({
      stay_id: stayId,
      addon_catalog_id: addonCatalogId,
      label: label || null,
      start_date: startDate,
      end_date: endDate || null,
      quantity,
      unit_price: unitPrice,
      note: note || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAddonEntry(id, patch) {
  const { data, error } = await supabase
    .from("addon_entries")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddonEntry(id) {
  const { error } = await supabase.from("addon_entries").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Payments ----------
export async function recordPayment({ stayId, amount, method, note }) {
  const { data, error } = await supabase
    .from("payments")
    .insert({ stay_id: stayId, amount, method, note: note || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPayment(stayId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("stay_id", stayId)
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---------- Settings ----------
export async function fetchSettings() {
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.key, r.value]));
}

export async function updateSetting(key, value) {
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) throw error;
}

// ---------- Customers / history ----------
export async function fetchStaysHistory({ search, from, to } = {}) {
  let query = supabase
    .from("stays")
    .select("*, rooms(id)")
    .order("check_in_at", { ascending: false });
  if (from) query = query.gte("check_in_at", from);
  if (to) query = query.lte("check_in_at", to);
  const { data, error } = await query;
  if (error) throw error;
  if (!search) return data;
  const s = search.toLowerCase();
  return data.filter(
    (r) =>
      (r.patient_name || "").toLowerCase().includes(s) ||
      (r.contact_number || "").toLowerCase().includes(s) ||
      (r.address || "").toLowerCase().includes(s),
  );
}

export async function updateStayReturnEstimate(stayId, expectedReturnDate) {
  // stored as a note-like field via settings-free approach: we keep it on the stay row
  const { error } = await supabase
    .from("stays")
    .update({ expected_return_date: expectedReturnDate })
    .eq("id", stayId);
  if (error) throw error;
}

// ---------- Sales / dashboard ----------
export async function fetchAllPaymentsBetween(from, to) {
  let query = supabase
    .from("payments")
    .select("*, stays(room_id, check_in_at, check_out_at)")
    .order("paid_at");
  if (from) query = query.gte("paid_at", from);
  if (to) query = query.lte("paid_at", to);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
