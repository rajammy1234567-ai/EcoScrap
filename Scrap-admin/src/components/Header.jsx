import React from "react";
import { LogOut, BarChart3, Package, Users, IndianRupee, Wrench } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigation, useLocation } from "../hooks/useNavigation";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-8 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🚛 Scrap Admin Panel
          </h1>
          <p className="text-sm text-gray-500">Manage pickups and operations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigation();

  const menuItems = [
    { label: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { label: "Pickups", icon: Package, path: "/pickups" },
    { label: "Scrapers", icon: Wrench, path: "/scrapers" },
    { label: "Rate Catalog", icon: IndianRupee, path: "/rates" },
    { label: "Users", icon: Users, path: "/users" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 pt-20 shadow-lg">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location === item.path
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className={`card ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={40} className="opacity-50" />
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function ErrorAlert({ message, onClose }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onClose} className="font-bold">
        ×
      </button>
    </div>
  );
}

export function SuccessAlert({ message, onClose }) {
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onClose} className="font-bold">
        ×
      </button>
    </div>
  );
}
