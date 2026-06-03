import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { LoadingSpinner, ErrorAlert } from "../components/Header";
import { Users, Mail, Phone } from "lucide-react";

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      setError("");
      const response = await adminAPI.getAllUsers({
        page,
        limit,
      });

      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            👥 Users Management
          </h2>
          <p className="text-gray-600">Total Users: {total}</p>
        </div>
        <button onClick={loadUsers} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">
            No users found
          </h3>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="table-cell font-semibold text-gray-900">
                    {user.name}
                  </td>
                  <td className="table-cell">
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Mail size={16} />
                      {user.email}
                    </a>
                  </td>
                  <td className="table-cell">
                    <a
                      href={`tel:${user.phone}`}
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Phone size={16} />
                      {user.phone}
                    </a>
                  </td>
                  <td className="table-cell text-sm">
                    {formatDate(user.createdAt)}
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
    </div>
  );
}
