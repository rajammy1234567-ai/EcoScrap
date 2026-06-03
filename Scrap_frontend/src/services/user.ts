import { api } from './api';

export const userService = {
  updateProfile: (data: { first_name?: string; last_name?: string; email?: string }) => {
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    return api.put('/api/auth/profile', { name });
  },

  getAddresses: () => api.get('/api/v1/users/me/addresses'),
  addAddress: (data: object) => api.post('/api/v1/users/me/addresses', data),
  updateAddress: (id: string, data: object) => api.put(`/api/v1/users/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/api/v1/users/me/addresses/${id}`),

  getPaymentMethods: () => api.get('/api/v1/payment-methods'),
  addPaymentMethod: (data: object) => api.post('/api/v1/payment-methods', data),
  deletePaymentMethod: (id: string) => api.delete(`/api/v1/payment-methods/${id}`),

  getReferral: () => api.get('/api/v1/referral'),
  applyReferral: (code: string) => api.post('/api/v1/referral/apply', { code }),
};
