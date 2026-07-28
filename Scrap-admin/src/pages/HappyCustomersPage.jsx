import React, { useEffect, useState } from "react";
import { adminAPI } from "../services/api";
import { LoadingSpinner, ErrorAlert } from "../components/Header";
import { Trash2, Plus, ImagePlus, Sparkles } from "lucide-react";

export function HappyCustomersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [city, setCity] = useState("");
  const [caption, setCaption] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("url"); // url | file

  const load = async () => {
    try {
      setError("");
      const res = await adminAPI.getHappyCustomers();
      setList(res.data?.happyCustomers || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load happy customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setCustomerName("");
    setCity("");
    setCaption("");
    setPhotoUrl("");
    setFile(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      if (mode === "file" && file) {
        await adminAPI.uploadHappyCustomer(file, {
          customerName: customerName.trim() || "Happy customer",
          city: city.trim(),
          caption: caption.trim(),
        });
      } else {
        if (!photoUrl.trim()) {
          setMsg("Photo URL required");
          setSaving(false);
          return;
        }
        await adminAPI.createHappyCustomer({
          photoUrl: photoUrl.trim(),
          customerName: customerName.trim() || "Happy customer",
          city: city.trim(),
          caption: caption.trim(),
        });
      }
      setMsg("Added successfully");
      resetForm();
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this happy customer card?")) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteHappyCustomer(id);
      setList((prev) => prev.filter((x) => x.id !== id));
      setMsg("Deleted");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeed = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await adminAPI.seedHappyCustomers(true);
      setMsg(res.data?.message || "Samples ready");
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Seed failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Happy Customers
          </h2>
          <p className="text-gray-600">
            App Profile & Home pe dikhte hain. Sample add karo, naya card banao
            ya delete karo.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSeed}
          disabled={saving}
          className="btn-secondary flex items-center gap-2"
        >
          <Sparkles size={18} />
          Load sample cards
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          {msg}
        </div>
      )}

      {/* Add form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} /> Add happy customer
        </h3>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={mode === "url" ? "btn-primary text-sm" : "btn-secondary text-sm"}
            onClick={() => setMode("url")}
          >
            Photo URL
          </button>
          <button
            type="button"
            className={mode === "file" ? "btn-primary text-sm" : "btn-secondary text-sm"}
            onClick={() => setMode("file")}
          >
            Upload image
          </button>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              className="input-field mt-1"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Priya Sharma"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              className="input-field mt-1"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Chandigarh"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Caption</label>
            <input
              className="input-field mt-1"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Got fair price for scrap..."
            />
          </div>

          {mode === "url" ? (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Photo URL (https)
              </label>
              <input
                className="input-field mt-1"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
              {photoUrl.trim() && (
                <img
                  src={photoUrl}
                  alt="preview"
                  className="mt-2 h-28 rounded-lg object-cover border"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImagePlus size={16} /> Image from gallery / PC
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && (
                <p className="text-xs text-gray-500 mt-1">{file.name}</p>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || (mode === "file" && !file)}
            >
              {saving ? "Saving..." : "Add to app"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          All cards ({list.length})
        </h3>
        {list.length === 0 ? (
          <p className="text-gray-500">
            No cards yet. Click &quot;Load sample cards&quot; or add one above.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((h) => (
              <div
                key={h.id}
                className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50"
              >
                <img
                  src={h.photoUrl}
                  alt={h.customerName}
                  className="w-full h-40 object-cover bg-gray-200"
                />
                <div className="p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {h.customerName}
                      </p>
                      {h.city && (
                        <p className="text-xs text-gray-500">{h.city}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                      disabled={deletingId === h.id}
                      onClick={() => handleDelete(h.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {h.caption && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {h.caption}
                    </p>
                  )}
                  {h.createdByAdmin && (
                    <span className="inline-block text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
