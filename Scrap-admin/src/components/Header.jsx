import React from "react";
import {
  LogOut,
  BarChart3,
  Package,
  Users,
  IndianRupee,
  Wrench,
  Heart,
  Leaf,
} from "lucide-react";
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
    <header className="bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-20">
      <div className="flex justify-between items-center px-8 py-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Eco Scrap Admin
          </h1>
          <p className="text-sm text-gray-500">
            Cash ops · pickups · KYC · rates
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
            Cash mode
          </span>
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2 !py-2"
          >
            <LogOut size={16} />
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
    { label: "Scrapers / KYC", icon: Wrench, path: "/scrapers" },
    { label: "Happy Customers", icon: Heart, path: "/happy-customers" },
    { label: "Rate Catalog", icon: IndianRupee, path: "/rates" },
    { label: "Users", icon: Users, path: "/users" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-30">
      <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Leaf size={20} />
        </div>
        <div>
          <p className="font-extrabold leading-tight">Eco Scrap</p>
          <p className="text-[11px] text-white/50">Admin console</p>
        </div>
      </div>
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
                active
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 text-[11px] text-white/40 leading-relaxed">
        Admin pays scrapper offline.
        <br />
        Scrapper records cash to user on complete.
      </div>
    </aside>
  );
}

export function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    yellow: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${colorClasses[color] || colorClasses.blue}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold opacity-80 truncate">{title}</p>
          <p className="text-2xl font-extrabold mt-1 tracking-tight break-all">
            {value}
          </p>
        </div>
        {Icon && <Icon size={28} className="opacity-40 shrink-0" />}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
  );
}

export function ErrorAlert({ message, onClose }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex justify-between items-start gap-3">
      <p className="text-sm font-medium">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-red-500 font-bold text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function SuccessAlert({ message, onClose }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex justify-between items-start gap-3">
      <p className="text-sm font-medium">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-emerald-600 font-bold text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
