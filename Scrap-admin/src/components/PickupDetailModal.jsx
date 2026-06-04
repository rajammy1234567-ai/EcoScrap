import React, { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";

export default function PickupDetailModal({ pickup, onClose, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(pickup.status);
  const [adminNote, setAdminNote] = useState(pickup.adminNote || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await onUpdate(pickup.id, selectedStatus, adminNote);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Pickup Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              👤 User Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">
                  {pickup.user?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">
                  {pickup.user?.phone}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">
                  {pickup.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📦 Pickup Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Created On</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(pickup.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled For</p>
                <p className="font-semibold text-gray-900">
                  {pickup.scheduled_at
                    ? formatDate(pickup.scheduled_at)
                    : "Not scheduled"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number of Items</p>
                <p className="font-semibold text-gray-900">
                  {pickup.items?.length || 0}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Pickup ID</p>
                <p className="font-semibold text-gray-900 font-mono text-sm">
                  {pickup.id}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-900">
                  {pickup.address ? (
                    `${pickup.address.flat_number || ""}, ${pickup.address.locality || ""}, ${pickup.address.city || ""} - ${pickup.address.pincode || ""}`
                  ) : (
                    `Address ID: ${pickup.address_id} (Address not found)`
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          {pickup.items && pickup.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Items to Pick Up
              </h3>
              <div className="space-y-2">
                {pickup.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-50 p-3 rounded-lg border border-blue-200"
                  >
                    <p className="text-sm text-gray-600">
                      Item ID: {item.scrap_item_id}
                    </p>
                    <p className="font-semibold text-gray-900">
                      Estimated Qty: {item.estimated_qty}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {pickup.image_urls && pickup.image_urls.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📸 Images
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {pickup.image_urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group"
                  >
                    <img
                      src={url}
                      alt={`Pickup ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-75 transition"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {pickup.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📝 User Notes
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-gray-900">
                {pickup.notes}
              </div>
            </div>
          )}

          {/* Status Update Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔧 Update Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Note (Optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="input-field"
                  rows="3"
                  placeholder="Add any notes about this pickup..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleUpdateStatus}
                  disabled={loading || selectedStatus === pickup.status}
                  className="btn-success flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {loading ? "Updating..." : "Update Status"}
                </button>
                <button onClick={onClose} className="btn-secondary flex-1">
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Current Status Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Current Status:</strong> {pickup.status.toUpperCase()}
            </p>
            {pickup.adminNote && (
              <p className="text-sm text-blue-700 mt-1">
                <strong>Admin Note:</strong> {pickup.adminNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
