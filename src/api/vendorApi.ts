import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface VendorProfileResponse {
  id: number;
  companyName?: string;
  description?: string;
  status?: string;
  userId?: number;
  franchiseId?: number | null;
}

export async function getVendorProfile(): Promise<VendorProfileResponse> {
  const response = await fetchJson<ApiResponse<VendorProfileResponse>>('/api/vendors/me', {
    method: 'GET',
  });

  if (response?.success && response.data) {
    return response.data;
  }

  if (response?.message) {
    throw new Error(response.message);
  }

  throw new Error('Unable to load vendor profile');
}

export async function getVendors(): Promise<void> {
  // TODO: connect to Spring Boot vendor endpoint
}

export async function getVendorById(): Promise<void> {
  // TODO: connect to Spring Boot vendor endpoint
}
