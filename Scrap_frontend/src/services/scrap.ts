import { api } from './api';

export const scrapService = {
  getCategories: () => api.get('/api/v1/scrap/categories'),
  getItems: (categoryId: string) => api.get(`/api/v1/scrap/categories/${categoryId}/items`),
  getRateCard: () => api.get('/api/v1/scrap/rate-card'),
  search: (q: string) => api.get('/api/v1/scrap/items/search', { params: { q } }),
};
