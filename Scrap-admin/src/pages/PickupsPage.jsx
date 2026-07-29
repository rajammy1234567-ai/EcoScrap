import React, { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../services/api";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "../components/Header";
import { Eye, CheckCircle, Clock, Search, RefreshCw, IndianRupee } from "lucide-react";
import PickupDetailModal from "../components/PickupDetailModal";

export function PickupsPage() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState(null);

  const limit = 20;

  const loadPickups = useCallback(async () => {
    try {
      setError("");
      const [response, statsRes] = await Promise.all([
        adminAPI.getAllPickups({
          status: selectedStatus || undefined,
          page,
          limit,
        }),
        adminAPI.getPickupStats().catch(() => null),
      ]);

      setPickups(response.data.pickups || []);
      setTotal(response.data.total || 0);
      if (statsRes?.data?.stats) setStats(statsRes.data.stats);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load pickups");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, page]);

  useEffect(() => {
    setLoading(true);
    loadPickups();
  }, [loadPickups]);

  useEffect(() => {
    const interval = setInterval(() => loadPickups(), 25000);
    return () => clearInterval(interval);
  }, [loadPickups]);

  const handleViewDetails = (pickup) => {
    setSelectedPickup(pickup);
    setShowModal(true);
  };

  const handleStatusUpdate = async (pickupId, newStatus, adminNote = "") => {
    try {
      setError("");
      await adminAPI.updatePickupStatus(pickupId, {
        status: newStatus,
        adminNote,
      });
      setSuccess(`Pickup → ${newStatus}`);
      setShowModal(false);
      loadPickups();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: "badge-pending",
      accepted: "badge-accepted",
      completed: "badge-completed",
      cancelled: "badge-cancelled",
    };
    return classes[status] || "badge-pending";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddr = (p) => {
    const a = p.address;
    if (!a) return "—";
    return [a.flat_number, a.locality, a.city, a.pincode]
      .filter(Boolean)
      .join(", ");
  };

  const q = search.trim().toLowerCase();
  const filtered = !q
    ? pickups
    : pickups.filter((p) => {
        const blob = [
          p.displayId,
          p.id,
          p.user?.name,
          p.user?.phone,
          p.user?.email,
          p.status,
          p.assignedScrapper?.name,
          String(p.paymentAmount || ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Pickups</h2>
          <p className="text-gray-600">
            Assign scrapers · track cash paid to users · live list
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            loadPickups();
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            ["All", stats.total, ""],
            ["Pending", stats.pending, "pending"],
            ["Unassigned", stats.unassigned ?? "—", "pending"],
            ["Accepted", stats.accepted, "accepted"],
            ["Completed", stats.completed, "completed"],
            [
              "Cash paid",
              `₹${Number(stats.totalCashPaid || 0).toLocaleString("en-IN")}`,
              "completed",
            ],
          ].map(([label, val, st]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (st !== undefined && st !== "") {
                  setSelectedStatus(st);
                  setPage(1);
                } else {
                  setSelectedStatus("");
                  setPage(1);
                }
              }}
              className="card !p-4 text-left hover:border-emerald-300 transition border"
            >
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-extrabold text-gray-900 mt-1">{val}</p>
            </button>
          ))}
        </div>
      )}

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess("")} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="input-field !pl-10"
            placeholder="Search ID, name, phone, scrapper, amount…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "accepted", label: "Accepted" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
          ].map((f) => (
            <button
              key={f.key || "all"}
              onClick={() => {
                setSelectedStatus(f.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                selectedStatus === f.key
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">
            No pickups found
          </h3>
          <p className="text-gray-500">Try another filter or search</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="table-header">Pickup</th>
                <th className="table-header">When</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Address</th>
                <th className="table-header">Scrapper</th>
                <th className="table-header">Cash</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pickup) => {
                const paid = Number(pickup.paymentAmount) > 0;
                return (
                  <tr
                    key={pickup.id || pickup._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="table-cell">
                      <span className="font-mono text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-bold">
                        {pickup.displayId ||
                          String(pickup.id || "")
                            .slice(0, 8)
                            .toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {pickup.items?.length || 0} item(s)
                        {pickup.image_urls?.length
                          ? ` · ${pickup.image_urls.length} photo(s)`
                          : ""}
                      </p>
                    </td>
                    <td className="table-cell text-sm">
                      <p className="font-medium text-gray-800">
                        {formatDate(pickup.scheduled_at || pickup.createdAt)}
                      </p>
                      {pickup.scheduled_at && (
                        <p className="text-xs text-gray-400">
                          Booked {formatDate(pickup.createdAt)}
                        </p>
                      )}
                    </td>
                    <td className="table-cell">
                      <p className="font-semibold text-gray-900">
                        {pickup.user?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pickup.user?.phone || "—"}
                      </p>
                    </td>
                    <td className="table-cell text-sm text-gray-600 max-w-[180px]">
                      <span className="line-clamp-2">{formatAddr(pickup)}</span>
                    </td>
                    <td className="table-cell text-sm">
                      {pickup.assignedScrapper?.name ||
                      pickup.assignedScrapper?.phone ? (
                        <div>
                          <p className="font-medium">
                            {pickup.assignedScrapper.name || "Scrapper"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pickup.assignedScrapper.phone}
                          </p>
                        </div>
                      ) : (
                        <span className="text-amber-700 text-xs font-semibold bg-amber-50 px-2 py-1 rounded">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {paid ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <IndianRupee size={14} />
                          {Number(pickup.paymentAmount).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`badge capitalize ${getStatusBadgeClass(
                          pickup.status,
                        )}`}
                      >
                        {pickup.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewDetails(pickup)}
                          className="btn-primary btn-small flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Open
                        </button>
                        {pickup.status === "pending" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                pickup.id || pickup._id,
                                "accepted",
                              )
                            }
                            className="btn-success btn-small flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            Accept
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > limit && (
        <div className="flex justify-center items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {pages} · {total} total
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showModal && selectedPickup && (
        <PickupDetailModal
          pickup={selectedPickup}
          onClose={() => setShowModal(false)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
