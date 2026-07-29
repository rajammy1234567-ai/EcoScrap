export type ScrapperStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'admin' | 'scrapper';

export interface User {
  id: string;
  phone: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  referral_code: string | null;
  category: string;
  role?: UserRole;
  scrapperStatus?: ScrapperStatus;
}

export interface Address {
  id: string;
  type: string;
  flat_number: string | null;
  building: string | null;
  locality: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

export interface ScrapCategory {
  id: string;
  name: string;
  icon_url: string | null;
  sort_order: number;
}

export interface ScrapItem {
  id: string;
  category_id: string;
  name: string;
  rate_per_kg: number;
  unit: string;
  image_url: string | null;
  guidelines: string | null;
}

export interface PickupItem {
  id: string;
  scrap_item_id: string;
  estimated_qty: number | null;
  actual_qty: number | null;
  amount: number | null;
}

export interface Pickup {
  id: string;
  user_id: string;
  address_id: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  scheduled_at: string | null;
  completed_at: string | null;
  /** Cash earned (maps from paymentAmount when scrapper records cash) */
  total_amount: number | null;
  paymentAmount?: number | null;
  paymentStatus?: string | null;
  paidAt?: string | null;
  notes: string | null;
  created_at: string;
  createdAt?: string;          // backend may return camelCase
  adminNote?: string | null;   // set when cancelled
  displayId?: string;
  address?: Record<string, any> | null; // populated by backend
  items: PickupItem[];
  image_urls: string[];
}

/** Cash earned from a pickup (scrapper recorded amount) */
export function pickupEarnedAmount(p: Partial<Pickup> | null | undefined): number {
  if (!p) return 0;
  const a = Number((p as any).paymentAmount);
  if (a > 0) return a;
  const b = Number(p.total_amount);
  if (b > 0) return b;
  return 0;
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'bank_transfer';
  upi_id: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  is_default: boolean;
}
