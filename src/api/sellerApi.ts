import { fetchJson } from './apiClient';
import type { ProductResponse } from './homeApi';
import type { ApiResponse } from '../types';

export interface PublicSeller {
  id: number;
  companyName?: string | null;
  name?: string | null;
  city?: string | null;
  state?: string | null;
  verified: boolean;
  productCount: number;
}

export interface PublicSellerPage {
  content: PublicSeller[];
}

export interface PublicSellerProfile extends PublicSeller {
  products: ProductResponse[];
}

export async function getPublicSellers(page = 0, size = 20): Promise<PublicSeller[]> {
  const response = await fetchJson<ApiResponse<PublicSeller[] | PublicSellerPage>>(
    `/api/public/sellers?page=${encodeURIComponent(String(page))}&size=${encodeURIComponent(String(size))}`,
    { method: 'GET' },
    false,
  );
  if (!response?.data) throw new Error(response?.message || 'Unable to load verified sellers.');
  return Array.isArray(response.data) ? response.data : response.data.content;
}

export async function getPublicSellerById(vendorId: number): Promise<PublicSellerProfile> {
  const response = await fetchJson<ApiResponse<PublicSellerProfile>>(
    `/api/public/sellers/${encodeURIComponent(String(vendorId))}`,
    { method: 'GET' },
    false,
  );
  if (!response?.data) throw new Error(response?.message || 'Unable to load seller profile.');
  return response.data;
}