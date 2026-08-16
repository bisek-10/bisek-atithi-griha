import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { fetchSettings, updateSetting, fetchAddonCatalog } from "../../lib/api";

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [profile, setProfile] = useState({
    name: "",
    address: "",
    phone: "",
    near: "",
  });
  const [rooms, setRooms] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [sett, { data: r }] = await Promise.all([
      fetchSettings(),
      supabase.from("rooms").select("*").order("id"),
    ]);
    setSettings(sett);
    setProfile(sett.hotel_profile || {});
    setRooms(r || []);
    setCatalog(await fetchAddonCatalog());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function flashSaved() {
    setSavedMsg("Settings saved successfully");
    setTimeout(() => setSavedMsg(""), 2000);
  }

  async function saveProfile(e) {
    e.preventDefault();
    await updateSetting("hotel_profile", profile);
    flashSaved();
  }

  async function handleQrUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `qr-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage
        .from("public-assets")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage
        .from("public-assets")
        .getPublicUrl(path);
      await updateSetting("qr_image_url", data.publicUrl);
      setSettings((s) => ({ ...s, qr_image_url: data.publicUrl }));
      flashSaved();
    } catch (err) {
      alert(
        `Upload failed: ${err.message}. Make sure a public storage bucket named "public-assets" exists.`,
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveRoom(room) {
    const { error } = await supabase
      .from("rooms")
      .update({
        bathroom_type: room.bathroom_type,
        base_rate: Number(room.base_rate),
        standard_occupancy: Number(room.standard_occupancy),
        extra_person_rate: Number(room.extra_person_rate),
        is_active: room.is_active,
      })
      .eq("id", room.id);
    if (error) alert(error.message);
    else flashSaved();
  }

  function updateRoomField(id, field, value) {
    setRooms((rs) =>
      rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  async function saveCatalogItem(item) {
    const { error } = await supabase
      .from("addon_catalog")
      .update({
        name: item.name,
        default_price: Number(item.default_price),
        unit_type: item.unit_type,
      })
      .eq("id", item.id);
    if (error) alert(error.message);
    else flashSaved();
  }

  function updateCatalogField(id, field, value) {
    setCatalog((cs) =>
      cs.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  }

  async function addCatalogItem() {
    const { data, error } = await supabase
      .from("addon_catalog")
      .insert({ name: "New service", default_price: 0, unit_type: "one_time" })
      .select()
      .single();
    if (error) return alert(error.message);
    setCatalog((c) => [...c, data]);
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-400 gap-4">
        <div className="w-10 h-10 border-4 border-sand-200 border-t-pine-700 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading settings...</p>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink-800 tracking-tight">
          Settings
        </h1>
        {savedMsg && (
          <div className="bg-pine-700 text-sand-50 px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-fade-in-up">
            {savedMsg}
          </div>
        )}
      </div>

      {/* Hotel Profile */}
      <section className="bg-white border border-sand-200 rounded-[2rem] p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="font-display text-xl text-ink-800">Hotel Profile</h2>
          <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mt-1">
            General information shown on bills
          </p>
        </div>
        <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider">
              Business Name
            </label>
            <input
              value={profile.name || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pine-700/20 transition-all font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider">
              Contact Phone
            </label>
            <input
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pine-700/20 transition-all font-medium"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider">
              Address
            </label>
            <input
              value={profile.address || ""}
              onChange={(e) =>
                setProfile((p) => ({ ...p, address: e.target.value }))
              }
              className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pine-700/20 transition-all font-medium"
            />
          </div>
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="bg-pine-700 text-sand-50 rounded-xl px-8 py-3 text-sm font-bold hover:bg-pine-800 transition-all shadow-lg shadow-pine-900/10 active:scale-[0.98]">
              Save Profile Changes
            </button>
          </div>
        </form>
      </section>

      {/* QR Code */}
      <section className="bg-white border border-sand-200 rounded-[2rem] p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="font-display text-xl text-ink-800">Payment QR Code</h2>
          <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mt-1">
            Guests scan this to pay at checkout
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="shrink-0">
            {settings.qr_image_url ? (
              <div className="relative group">
                <img
                  src={settings.qr_image_url}
                  alt="Current QR"
                  className="w-40 h-40 object-contain bg-sand-50 border border-sand-200 rounded-2xl p-2 shadow-inner"
                />
                <div className="absolute inset-0 bg-ink-800/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <p className="text-[10px] text-white font-bold uppercase tracking-widest">
                    Active QR
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-40 h-40 bg-sand-100 border-2 border-dashed border-sand-200 rounded-2xl flex items-center justify-center text-ink-400">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-sm text-ink-600 leading-relaxed">
              Upload a clear photo of your merchant QR (eSewa, Khalti, or Bank).
              This will be embedded in the checkout interface.
            </p>
            <div className="relative inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div
                className={`px-6 py-2.5 rounded-xl border border-sand-300 text-sm font-bold flex items-center gap-2 transition-all ${uploading ? "bg-sand-100 text-ink-400" : "bg-white text-ink-800 hover:border-pine-700 hover:text-pine-700 shadow-sm"}`}>
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-sand-200 border-t-pine-700 rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Upload New QR
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Rates */}
      <section className="bg-white border border-sand-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-8">
          <h2 className="font-display text-xl text-ink-800">Rooms & Rates</h2>
          <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mt-1">
            Configure room types and pricing
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-sand-50 border-y border-sand-200">
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Room
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Type
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Base Rate
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Standard Occ.
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Extra/Person
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {rooms.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-6 py-4 font-display text-lg text-ink-800">
                    {r.id}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={r.bathroom_type}
                      onChange={(e) =>
                        updateRoomField(r.id, "bathroom_type", e.target.value)
                      }
                      className="bg-sand-50 border border-sand-200 rounded-lg px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-pine-700/20">
                      <option value="attached">Attached Bath</option>
                      <option value="non_attached">Shared Bath</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-400 font-bold">
                        NPR
                      </span>
                      <input
                        type="number"
                        value={r.base_rate}
                        onChange={(e) =>
                          updateRoomField(r.id, "base_rate", e.target.value)
                        }
                        className="w-28 bg-sand-50 border border-sand-200 rounded-lg pl-9 pr-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-pine-700/20"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={r.standard_occupancy}
                      onChange={(e) =>
                        updateRoomField(
                          r.id,
                          "standard_occupancy",
                          e.target.value,
                        )
                      }
                      className="w-16 bg-sand-50 border border-sand-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-pine-700/20 text-center"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-400 font-bold">
                        NPR
                      </span>
                      <input
                        type="number"
                        value={r.extra_person_rate}
                        onChange={(e) =>
                          updateRoomField(
                            r.id,
                            "extra_person_rate",
                            e.target.value,
                          )
                        }
                        className="w-24 bg-sand-50 border border-sand-200 rounded-lg pl-9 pr-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-pine-700/20"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={r.is_active}
                        onChange={(e) =>
                          updateRoomField(r.id, "is_active", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-sand-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pine-700"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => saveRoom(r)}
                      className="text-pine-700 font-bold hover:text-pine-800 transition-colors text-xs uppercase tracking-widest">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Service Catalog */}
      <section className="bg-white border border-sand-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-ink-800">
              Additional Services
            </h2>
            <p className="text-xs font-bold text-ink-400 uppercase tracking-widest mt-1">
              Manage add-ons services
            </p>
          </div>
          <button
            onClick={addCatalogItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-saffron-500 text-white rounded-xl text-xs font-bold hover:bg-saffron-600 transition-all shadow-md shadow-saffron-500/20 active:scale-[0.98]">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Service
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-sand-50 border-y border-sand-200">
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Service Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Base Price
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                  Unit
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-ink-400 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {catalog.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      value={c.name}
                      onChange={(e) =>
                        updateCatalogField(c.id, "name", e.target.value)
                      }
                      className="w-full bg-sand-50 border border-sand-200 rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-pine-700/20"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-400 font-bold">
                        NPR
                      </span>
                      <input
                        type="number"
                        value={c.default_price}
                        onChange={(e) =>
                          updateCatalogField(
                            c.id,
                            "default_price",
                            e.target.value,
                          )
                        }
                        className="w-32 bg-sand-50 border border-sand-200 rounded-lg pl-9 pr-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-pine-700/20"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={c.unit_type}
                      onChange={(e) =>
                        updateCatalogField(c.id, "unit_type", e.target.value)
                      }
                      className="bg-sand-50 border border-sand-200 rounded-lg px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-pine-700/20">
                      <option value="one_time">One-time Charge</option>
                      <option value="per_day">Daily Recurring</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => saveCatalogItem(c)}
                      className="text-pine-700 font-bold hover:text-pine-800 transition-colors text-xs uppercase tracking-widest">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
