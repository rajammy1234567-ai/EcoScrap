import { api } from './api';

export type AuthChannel = 'email' | 'phone';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  loginWithPhone: (phone: string, password: string) =>
    api.post('/api/auth/login', { phone, password }),

  register: (name: string, email: string, password: string, phone?: string) =>
    api.post('/api/auth/register', { name, email, password, phone }),

  registerWithPhone: (name: string, phone: string) =>
    api.post('/api/auth/register', { name, phone }),

  /** Request OTP — for phone, backend returns `otp` for in-app display */
  sendOtp: (payload: {
    email?: string;
    phone?: string;
    name?: string;
    purpose?: 'login' | 'register';
  }) => api.post('/api/auth/send-otp', payload),

  verifyOtp: (payload: {
    email?: string;
    phone?: string;
    otp: string;
    name?: string;
  }) => api.post('/api/auth/verify-otp', payload),

  googleAuth: (payload: {
    email: string;
    name: string;
    googleId: string;
    idToken?: string;
  }) => api.post('/api/auth/google', payload),

  me: () => api.get('/api/auth/me'),
  refresh: (refresh_token: string) =>
    api.post('/api/auth/refresh', { refresh_token }),
};

/** Keep only digits; max 10 for Indian mobile */
export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

export function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
