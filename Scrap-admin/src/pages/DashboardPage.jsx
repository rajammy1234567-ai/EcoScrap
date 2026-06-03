import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import { StatCard, LoadingSpinner, ErrorAlert } from "../components/Header";
import { Package, CheckCircle, Clock, XCircle } from "lucide-react";

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [pickupStats, setPickupStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setError("");
      const [dashResponse, pickupResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPickupStats(),
      ]);

      setStats(dashResponse.data.stats);
      setPickupStats(pickupResponse.data.stats);
    } catch (err) {
      setError("Failed to load dashboard stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Welcome to your admin panel. Here's an overview of your operations.
        </p>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {/* Pickup Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📦 Pickup Overview
        </h3>
        {pickupStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Pickups"
              value={pickupStats.total}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Pending"
              value={pickupStats.pending}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Accepted"
              value={pickupStats.accepted}
              icon={CheckCircle}
              color="blue"
            />
            <StatCard
              title="Completed"
              value={pickupStats.completed}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Cancelled"
              value={pickupStats.cancelled}
              icon={XCircle}
              color="red"
            />
          </div>
        ) : (
          <p className="text-gray-500">Loading pickup stats...</p>
        )}
      </div>

      {/* Scrap Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ♻️ Scrap Items Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Items"
              value={stats.total}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Pending Review"
              value={stats.pending}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Accepted"
              value={stats.accepted}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue || 0}`}
              icon={Package}
              color="green"
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="#/pickups" className="btn-primary block text-center">
            View All Pickups
          </a>
          <a href="#/users" className="btn-secondary block text-center">
            View Users
          </a>
          <button onClick={loadStats} className="btn-secondary">
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
}
