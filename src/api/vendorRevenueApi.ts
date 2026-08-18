import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface VendorRevenueResponse {
  totalRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  availableBalance: number;
  totalOrders: number;
  completedOrders: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  lastUpdated: string;
}

export async function getVendorRevenue(): Promise<VendorRevenueResponse> {
  const response = await fetchJson<ApiResponse<VendorRevenueResponse>>('/api/vendors/me/revenue', {
    method: 'GET',
  });

  if (!response?.success || !response.data) {
    throw new Error(response?.message || 'Failed to load vendor revenue');
  }

  return response.data;
}
