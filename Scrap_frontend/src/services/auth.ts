import { api } from './api';

export const authService = {
  sendOtp: (email: string) => api.post('/api/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/api/auth/verify-otp', { email, otp }),
  register: (first_name: string, last_name: string, referral_code?: string) =>
    api.put('/api/auth/profile', { name: `${first_name} ${last_name}`.trim(), referral_code }),
  me: () => api.get('/api/auth/me'),
  refresh: (refresh_token: string) => api.post('/api/auth/refresh', { refresh_token }),
};
