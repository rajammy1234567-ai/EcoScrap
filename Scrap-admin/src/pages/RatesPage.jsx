import React, { useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2, Save, RefreshCw, Tag } from "lucide-react";
import { adminAPI } from "../services/api";
import { ErrorAlert, SuccessAlert, LoadingSpinner } from "../components/Header";

export function RatesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [savingId, setSavingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getRates();
      const list = res.data.items || [];
      setItems(list);
      const d = {};
      list.forEach((it) => {
        d[it._id] = {
          rate_per_kg: it.rate_per_kg,
          unit: it.unit || "Kg",
          name: it.name,
        };
      });
      setDrafts(d);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const updateDraft = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveRate = async (id) => {
    setSavingId(id);
    setError("");
    setSuccess("");
    try {
      const d = drafts[id];
      const res = await adminAPI.updateRate(id, {
        name: d.name,
        rate_per_kg: Number(d.rate_per_kg),
        unit: d.unit,
      });
      setItems((prev) =>
        prev.map((it) => (it._id === id ? res.data.item : it)),
      );
      setSuccess("Rate saved");
    } catch (e) {
      setError(e?.response?.data?.message || "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const onPickImage = async (id, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG/PNG/WebP)");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setError("Image must be under 2.5 MB");
      return;
    }
    setUploadingId(id);
    setError("");
    setSuccess("");
    try {
      const res = await adminAPI.uploadRateImage(id, file);
      // Reload to get full image_url from list
      await load();
      setSuccess(res.data.message || "Image uploaded permanently");
    } catch (e) {
      setError(e?.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const clearImage = async (id) => {
    if (!window.confirm("Remove image for this item?")) return;
    setUploadingId(id);
    setError("");
    try {
      await adminAPI.clearRateImage(id);
      await load();
      setSuccess("Image removed");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to clear image");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rate Catalog</h2>
          <p className="text-sm text-gray-500 mt-1">
            Update prices and upload real photos. Images are stored permanently
            in the database and show in the app rate list.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess("")} />
      )}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
              filter === c
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
            }`}
          >
            {c === "ALL" ? "All items" : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const d = drafts[item._id] || {};
          const busy = savingId === item._id || uploadingId === item._id;
          return (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center px-2">
                      <Tag className="mx-auto text-green-600 mb-1" size={22} />
                      <p className="text-[10px] text-gray-400 font-medium">
                        No image
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                    {item.category}
                  </p>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-900"
                    value={d.name ?? item.name}
                    onChange={(e) =>
                      updateDraft(item._id, "name", e.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 font-bold">
                        RATE (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-green-800"
                        value={d.rate_per_kg ?? item.rate_per_kg}
                        onChange={(e) =>
                          updateDraft(item._id, "rate_per_kg", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-gray-400 font-bold">
                        UNIT
                      </label>
                      <select
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                        value={d.unit ?? item.unit}
                        onChange={(e) =>
                          updateDraft(item._id, "unit", e.target.value)
                        }
                      >
                        <option value="Kg">Kg</option>
                        <option value="Unit">Unit</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 mt-auto flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => saveRate(item._id)}
                  className="flex-1 min-w-[100px] bg-gray-900 text-white text-sm font-semibold rounded-lg px-3 py-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={14} />
                  {savingId === item._id ? "Saving..." : "Save rate"}
                </button>

                <label className="flex-1 min-w-[100px] bg-green-700 text-white text-sm font-semibold rounded-lg px-3 py-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                  <ImagePlus size={14} />
                  {uploadingId === item._id ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      onPickImage(item._id, f);
                    }}
                  />
                </label>

                {item.image_url && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => clearImage(item._id)}
                    className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold flex items-center gap-1"
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">No items in this category.</p>
      )}
    </div>
  );
}
