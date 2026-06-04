import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "../components/Header";
import { Eye, Trash2, CheckCircle, Clock } from "lucide-react";
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

  const limit = 20;

  useEffect(() => {
    loadPickups();
  }, [selectedStatus, page]);

  // Auto-refresh pickups every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadPickups();
    }, 20000);
    return () => clearInterval(interval);
  }, [selectedStatus, page]);

  const loadPickups = async () => {
    try {
      setError("");
      const response = await adminAPI.getAllPickups({
        status: selectedStatus || undefined,
        page,
        limit,
      });

      setPickups(response.data.pickups);
      setTotal(response.data.total);
    } catch (err) {
      setError("Failed to load pickups");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

      setSuccess(`Pickup status updated to ${newStatus}!`);
      setShowModal(false);
      loadPickups();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update pickup status");
      console.error(err);
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
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            📦 Pickups Management
          </h2>
          <p className="text-gray-600">Total: {total} pickups</p>
        </div>
        <button onClick={loadPickups} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess("")} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => {
              setSelectedStatus("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === "" ? "btn-primary" : "btn-secondary"
            }`}
          >
            All Pickups ({total})
          </button>
          {["pending", "accepted", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                selectedStatus === status ? "btn-primary" : "btn-secondary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Pickups Table */}
      {loading ? (
        <LoadingSpinner />
      ) : pickups.length === 0 ? (
        <div className="card text-center py-12">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">
            No pickups found
          </h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="table-header">Pickup ID</th>
                <th className="table-header">Date</th>
                <th className="table-header">User</th>
                <th className="table-header">Items</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((pickup) => (
                <tr key={pickup.id} className="hover:bg-gray-50 transition">
                  <td className="table-cell">
                    <span className="font-mono text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                      {pickup.displayId || pickup.id?.toString().slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell text-sm">
                    {formatDate(pickup.createdAt)}
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {pickup.user?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pickup.user?.phone}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium">
                      {pickup.items?.length || 0} items
                    </span>
                  </td>
                  <td className="table-cell">
                    <span
                      className={`badge capitalize ${getStatusBadgeClass(pickup.status)}`}
                    >
                      {pickup.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(pickup)}
                        className="btn-primary btn-small flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      {pickup.status === "pending" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(pickup.id, "accepted")
                          }
                          className="btn-success btn-small flex items-center gap-1"
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Pickup Detail Modal */}
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
