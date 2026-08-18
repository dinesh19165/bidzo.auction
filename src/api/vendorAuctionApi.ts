import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface VendorAuctionApiResponse {
  id: number;
  title: string;
  description?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  startingPrice?: number | string | null;
  status?: string | null;
  productId?: number | null;
  vendorId?: number | null;
}

export async function getVendorAuctions(): Promise<VendorAuctionApiResponse[]> {
  const endpoints = ['/api/vendors/me/auctions', '/api/auctions'];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetchJson<ApiResponse<VendorAuctionApiResponse[]>>(endpoint, { method: 'GET' });
      if (response?.success && Array.isArray(response.data)) {
        return response.data;
      }
      if (response?.message) {
        throw new Error(response.message);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Failed to load auctions');
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}
