import { api } from './api';

export interface DemoVideo {
  url: string;
  title: string;
  poster?: string;
}

export interface HappyCustomer {
  id: string;
  photoUrl: string;
  caption?: string;
  customerName?: string;
  city?: string;
  createdAt?: string;
}

export const contentService = {
  getHome: () => api.get('/api/v1/content/home'),
  listHappyCustomers: () => api.get('/api/v1/content/happy-customers'),
  postHappyCustomer: (data: {
    pickupId?: string;
    photoUrl: string;
    caption?: string;
    customerName?: string;
    city?: string;
  }) => api.post('/api/v1/content/happy-customers', data, { timeout: 120000 }),
};
