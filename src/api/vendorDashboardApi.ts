import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export type VerificationState = 'COMPLETE' | 'PENDING';

export interface VendorDashboardVerificationStatus {
  businessDetails: VerificationState;
  gstAndBank: VerificationState;
  identityVerification: VerificationState;
}

export interface VendorDashboardResponse {
  liveProducts: number;
  openAuctions: number;
  totalOrders: number;
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  activeProducts: number;
  liveAuctions: number;
  repeatCustomers: number;
  verificationStatus: VendorDashboardVerificationStatus;
}

export async function getVendorDashboard(): Promise<VendorDashboardResponse> {
  const response = await fetchJson<ApiResponse<VendorDashboardResponse>>('/api/vendors/me/dashboard', {
    method: 'GET',
  });

  if (!response?.success || !response.data) {
    throw new Error(response?.message || 'Failed to load vendor dashboard');
  }

  return response.data;
}
