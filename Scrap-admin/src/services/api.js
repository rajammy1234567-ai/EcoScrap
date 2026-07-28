import axios from "axios";

// Production (same host as admin UI): /api
// Dev override: .env VITE_API_URL=https://ecoscrap-1.onrender.com/api
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "https://ecoscrap-1.onrender.com/api")
).replace(/\/$/, "");

if (import.meta.env.DEV) {
  console.log("[Admin API]", API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// Add token to every request; let browser set boundary for FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Axios default Content-Type: application/json breaks multipart
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
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

  // Scrapper applications + KYC
  getScrapperApplications: (params) =>
    api.get("/admin/scrapper-applications", { params }),
  getScrapperApplication: (id) =>
    api.get(`/admin/scrapper-applications/${id}`),
  reviewScrapperApplication: (id, data) =>
    api.put(`/admin/scrapper-applications/${id}/review`, data),
  getScrapers: () => api.get("/admin/scrapers"),
  assignScrapper: (pickupId, scrapperId) =>
    api.put(`/admin/pickups/${pickupId}/assign-scrapper`, { scrapperId }),

  // Wallet / ledger / payouts
  getWallets: () => api.get("/admin/wallets"),
  getWalletTransactions: (params) =>
    api.get("/admin/wallet-transactions", { params }),
  topupWallet: (data) => api.post("/admin/wallets/topup", data),
  getPayouts: (params) => api.get("/admin/payouts", { params }),

  // Rate catalog (prices + permanent images)
  getRates: () => api.get("/admin/rates"),
  updateRate: (id, data) => api.put(`/admin/rates/${id}`, data),
  createRate: (data) => api.post("/admin/rates", data),
  uploadRateImage: (id, file) => {
    const form = new FormData();
    form.append("image", file);
    return api.post(`/admin/rates/${id}/image`, form);
  },
  clearRateImage: (id) => api.delete(`/admin/rates/${id}/image`),
};

export default api;
