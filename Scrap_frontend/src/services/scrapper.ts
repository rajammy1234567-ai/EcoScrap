import { api } from './api';

export type VehicleType =
  | 'bike'
  | 'scooter'
  | 'auto'
  | 'e-rickshaw'
  | 'mini-truck'
  | 'truck'
  | 'other';

export interface ScrapperApplicationPayload {
  fullName: string;
  phone: string;
  email?: string;
  aadhaarNumber: string;
  panNumber: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  city: string;
  pincode: string;
  serviceAreas?: string;
  experienceYears?: number;
  address: string;
  notes?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  upiId?: string;
  /** base64 data URIs */
  aadhaarFront: string;
  aadhaarBack: string;
  panCard: string;
  selfie?: string;
  cancelledCheque?: string;
}

export interface ScrapperApplication {
  id: string;
  _id?: string;
  fullName: string;
  phone: string;
  email?: string;
  aadhaarNumber: string;
  panNumber?: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  city: string;
  pincode: string;
  serviceAreas?: string;
  experienceYears?: number;
  address: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  reviewedAt?: string;
  createdAt: string;
  kycComplete?: boolean;
  signupBonusCredited?: boolean;
  signupBonusAmount?: number;
  upiId?: string;
}

export interface WalletInfo {
  balance: number;
  totalCredited: number;
  totalDebited: number;
  isFrozen?: boolean;
  currency?: string;
}

export const scrapperService = {
  apply: (data: ScrapperApplicationPayload) =>
    api.post('/api/v1/scrapper/apply', data, {
      timeout: 120000,
      headers: { 'Content-Type': 'application/json' },
    }),

  getMyApplication: () => api.get('/api/v1/scrapper/my-application'),

  getWallet: (params?: { page?: number; limit?: number }) =>
    api.get('/api/v1/scrapper/wallet', { params }),

  listJobs: (params?: { tab?: 'available' | 'mine' | 'all'; status?: string }) =>
    api.get('/api/v1/scrapper/jobs', { params }),

  acceptJob: (id: string) => api.put(`/api/v1/scrapper/jobs/${id}/accept`),

  /** Complete pickup + pay customer from wallet */
  completeAndPay: (
    id: string,
    data: {
      amount: number;
      customerUpi?: string;
      method?: 'upi' | 'cash' | 'bank';
      note?: string;
      actualWeightKg?: number;
      scrapItemsSummary?: string;
    },
  ) => api.put(`/api/v1/scrapper/jobs/${id}/complete-and-pay`, data),
};
