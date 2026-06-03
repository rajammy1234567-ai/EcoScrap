import { api } from './api';

export const locationService = {
  checkService: (pincode: string) => api.post('/api/v1/location/check-service', { pincode }),
  notifyMe: (pincode: string, phone?: string) =>
    api.post('/api/v1/location/notify-me', { pincode, phone }),
};
