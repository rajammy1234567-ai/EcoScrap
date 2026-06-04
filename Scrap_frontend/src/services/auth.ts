import { api } from './api';

export const authService = {
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string, phone?: string) =>
    api.post('/api/auth/register', { name, email, password, phone }),
  me: () => api.get('/api/auth/me'),
  refresh: (refresh_token: string) => api.post('/api/auth/refresh', { refresh_token }),
};
