import { api } from './api';

export const pickupService = {
  create: (data: {
    address_id: string;
    items: { scrap_item_id: string; estimated_qty: number }[];
    image_urls?: string[];
    scheduled_at?: string;
    notes?: string;
  }) => api.post('/api/v1/pickups', data),

  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/api/v1/pickups', { params }),

  get: (id: string) => api.get(`/api/v1/pickups/${id}`, { timeout: 15000 }),

  cancel: (id: string) => api.put(`/api/v1/pickups/${id}/cancel`, null, { timeout: 15000 }),

  uploadImage: async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'photo.jpg';
    const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    formData.append('file', { uri, name: filename, type } as any);
    return api.post('/api/v1/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
