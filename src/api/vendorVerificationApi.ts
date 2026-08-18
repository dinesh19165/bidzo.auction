import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export type VendorVerificationStatus = 'COMPLETE' | 'PENDING';

export interface VendorVerificationDetail {
  status: VendorVerificationStatus;
  lastUpdated: string;
  remarks?: string | null;
}

export interface VendorVerificationResponse {
  businessDetails: VendorVerificationDetail;
  gstAndBank: VendorVerificationDetail;
  identityVerification: VendorVerificationDetail;
}

export async function getVendorVerificationStatus(): Promise<VendorVerificationResponse> {
  const response = await fetchJson<ApiResponse<VendorVerificationResponse>>('/api/vendors/me/verification-status', {
    method: 'GET',
  });

  if (!response?.success || !response.data) {
    throw new Error(response?.message || 'Failed to load vendor verification status');
  }

  return response.data;
}
