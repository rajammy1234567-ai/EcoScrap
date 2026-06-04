import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

// Detect if running on web or native


// Web uses localhost; native (iOS/Android) uses local network IP
const DEFAULT_URL ='https://ecoscrap-1.onrender.com';
export const BASE_URL = DEFAULT_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token
api.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401, suppress unhandled network/timeout errors
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Auto-refresh on 401
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await storage.getRefreshToken();
        if (refresh) {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refresh_token: refresh });
          await storage.setTokens(data.access_token, refresh);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        }
      } catch {
        await storage.clearAll();
      }
    }

    // Tag network/timeout errors so callers can detect them easily
    if (!error.response) {
      error.isNetworkError = true;
    }

    return Promise.reject(error);
  }
);
