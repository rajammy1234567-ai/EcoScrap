import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  // Auth
  login: (email, password) => api.post("/auth/login", { email, password }),

  // Dashboard Stats
  getDashboardStats: () => api.get("/admin/stats"),

  // Pickups
  getAllPickups: (params) => api.get("/admin/pickups", { params }),
  getPickupDetails: (id) => api.get(`/admin/pickups/${id}`),
  updatePickupStatus: (id, data) =>
    api.put(`/admin/pickups/${id}/status`, data),
  getPickupStats: () => api.get("/admin/pickups/stats"),

  // Users
  getAllUsers: (params) => api.get("/admin/users", { params }),
};

export default api;
