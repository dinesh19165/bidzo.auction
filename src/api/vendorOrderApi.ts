import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface VendorOrderApiResponse {
  id: number;
  orderNumber?: string;
  customerName?: string;
  customer?: string;
  customerId?: number;
  productName?: string;
  product?: string;
  totalAmount?: number | string;
  amount?: number | string;
  orderStatus?: string;
  status?: string;
  createdAt?: string;
  orderDate?: string;
  date?: string;
  deliveryAddress?: Record<string, unknown> | string | null;
  items?: Array<{ productName?: string; name?: string; quantity?: number; price?: number | string }>;
}

export async function getVendorOrders(): Promise<VendorOrderApiResponse[]> {
  const response = await fetchJson<ApiResponse<VendorOrderApiResponse[]>>('/api/vendors/me/orders', { method: 'GET' });
  if (response?.success && Array.isArray(response.data)) {
    return response.data;
  }

  if (response?.message) {
    throw new Error(response.message);
  }

  throw new Error('Unable to load vendor orders');
}
