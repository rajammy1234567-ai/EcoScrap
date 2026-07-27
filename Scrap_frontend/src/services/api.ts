import axios from 'axios';
import { storage } from './storage';

/** Production backend (Render) — app + admin same server */
const PROD_URL = 'https://ecoscrap-1.onrender.com';

/**
 * Always use production unless EXPO_PUBLIC_USE_LOCAL_API=true
 */
function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_USE_LOCAL_API === 'true') {
    // Optional local only when explicitly enabled
    return 'http://localhost:5000';
  }

  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/api\/?$/, '');
  }

  return PROD_URL;
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
          : `Cannot reach server (${BASE_URL}). Check internet.`;
    }

    return Promise.reject(error);
  },
);
