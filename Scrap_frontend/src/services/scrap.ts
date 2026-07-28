import { api } from './api';

export const scrapService = {
  getCategories: () => api.get('/api/v1/scrap/categories'),
  getItems: (categoryId: string) => api.get(`/api/v1/scrap/categories/${categoryId}/items`),
  /** Live rate catalog from admin (no browser/app cache) */
  getRateCard: () =>
    api.get('/api/v1/scrap/rate-card', {
      params: { _t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    }),
  search: (q: string) => api.get('/api/v1/scrap/items/search', { params: { q } }),
};
