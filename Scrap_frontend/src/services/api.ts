import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

// Local machine IP (update if your PC IP changes: ipconfig)
const LOCAL_IP = '192.168.31.14';
const LOCAL_URL =
  Platform.OS === 'web' ? 'http://localhost:5000' : `http://${LOCAL_IP}:5000`;
const PROD_URL = 'https://ecoscrap-1.onrender.com';

/**
 * Priority:
 * 1. EXPO_PUBLIC_USE_LOCAL_API=true → local backend
 * 2. EXPO_PUBLIC_API_URL (from .env) → preferred remote/prod
 * 3. __DEV__ → local, else production
 *
 * OTP fail ho raha tha kyunki __DEV__ me purana dead IP use ho raha tha
 * aur local server band tha. Ab .env wala Render URL use hoga.
 */
function resolveBaseUrl(): string {
  const useLocal = process.env.EXPO_PUBLIC_USE_LOCAL_API === 'true';
  if (useLocal) return LOCAL_URL;

  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    // strip trailing /api so paths like /api/auth/send-otp stay correct
    return fromEnv.replace(/\/api\/?$/, '');
  }

  return __DEV__ ? LOCAL_URL : PROD_URL;
}

export const BASE_URL = resolveBaseUrl();

if (__DEV__) {
  console.log('BASE_URL =', BASE_URL);
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Attach access token
api.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const refresh = await storage.getRefreshToken();
        if (refresh) {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refresh_token: refresh,
          });
          await storage.setTokens(data.access_token, refresh);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        }
      } catch {
        await storage.clearAll();
      }
    }

    if (!error.response) {
      error.isNetworkError = true;
      error.message =
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Server slow or unreachable.'
          : `Cannot reach server (${BASE_URL}). Check internet or start backend.`;
    }

    return Promise.reject(error);
  },
);
