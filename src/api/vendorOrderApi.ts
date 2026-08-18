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
  items?: Array<{ productName?: string; name?: string; quantity?: number; price?: number | string }>;
}

export async function getVendorOrders(): Promise<VendorOrderApiResponse[]> {
  const endpoints = ['/api/vendors/me/orders', '/api/orders/my'];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetchJson<ApiResponse<VendorOrderApiResponse[]>>(endpoint, { method: 'GET' });
      if (response?.success && Array.isArray(response.data)) {
        return response.data;
      }
      if (response?.message) {
        throw new Error(response.message);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Failed to load vendor orders');
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}
