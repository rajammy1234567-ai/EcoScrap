import axios from 'axios';

export const POPULAR_CITIES = ['Indore', 'Bhopal', 'Ujjain', 'Dewas', 'Jabalpur', 'Gwalior'];

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecoscrap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh or clear on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecoscrap_token');
      localStorage.removeItem('ecoscrap_user');
    }
    return Promise.reject(error);
  }
);

// ── Rates API ──
export const fetchRateCatalog = async () => {
  try {
    const res = await api.get('/api/v1/scrap/rate-card');
    if (res.data?.success && res.data.categories) {
      // Flatten categories into list of items with category name
      const allItems = [];
      res.data.categories.forEach((cat) => {
        if (Array.isArray(cat.items)) {
          cat.items.forEach((item) => {
            allItems.push({
              ...item,
              category: cat.name,
            });
          });
        }
      });
      return allItems;
    }
  } catch (err) {
    console.error('Failed to fetch rate catalog from API:', err);
    throw err;
  }
  return [];
};

// ── Content & Happy Customers ──
export const fetchHappyCustomers = async () => {
  try {
    const res = await api.get('/api/v1/content/happy-customers');
    if (res.data?.success && Array.isArray(res.data.happyCustomers)) {
      return res.data.happyCustomers;
    }
  } catch (err) {
    console.error('Failed to fetch happy customers from API:', err);
    throw err;
  }
  return [];
};

export const fetchHomeContent = async () => {
  const res = await api.get('/api/v1/content/home');
  return res.data;
};

// ── Pickups API ──
export const createPickupOrder = async (orderData) => {
  const res = await api.post('/api/v1/pickups', orderData);
  return res.data;
};

export const fetchMyPickups = async (status = '') => {
  const url = status ? `/api/v1/pickups?status=${status}` : '/api/v1/pickups';
  const res = await api.get(url);
  return res.data;
};

export const getPickupById = async (id) => {
  const res = await api.get(`/api/v1/pickups/${id}`);
  return res.data;
};

export const cancelPickupOrder = async (id) => {
  const res = await api.put(`/api/v1/pickups/${id}/cancel`);
  return res.data;
};

// ── Saved Addresses API ──
export const fetchSavedAddresses = async () => {
  const res = await api.get('/api/v1/users/me/addresses');
  return res.data?.addresses || [];
};

export const createSavedAddress = async (addressData) => {
  const res = await api.post('/api/v1/users/me/addresses', addressData);
  return res.data?.addresses || [];
};

export const deleteSavedAddress = async (id) => {
  const res = await api.delete(`/api/v1/users/me/addresses/${id}`);
  return res.data?.addresses || [];
};

// ── Location & Serviceability ──
export const checkPincodeService = async (pincode) => {
  const res = await api.post('/api/v1/location/check-service', { pincode });
  return res.data;
};

// ── Partner Application API ──
export const registerPartnerApplication = async (formData) => {
  // Can accept JSON or FormData for KYC
  const res = await api.post('/api/v1/scrapper/apply', formData);
  return res.data;
};

// ── Auth APIs ──
export const loginUser = async (credentials) => {
  const res = await api.post('/api/auth/login', credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post('/api/auth/register', userData);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/api/auth/me');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/api/auth/profile', data);
  return res.data;
};
