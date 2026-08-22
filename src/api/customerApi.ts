import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface CustomerProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
  addressId: number | null;
}

export interface CustomerProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  addressId: number | null;
  userId: number;
}

export interface CustomerDashboardProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
}

export interface CustomerDashboardTransaction {
  id?: number | string;
  type?: string;
  amount?: number | string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface CustomerDashboardOrder {
  id?: number | string;
  orderNumber?: string;
  totalAmount?: number | string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface CustomerDashboardResponse {
  profile: CustomerDashboardProfile | null;
  profileCompletionPercentage: number;
  activeBidsCount: number;
  wonAuctionsCount: number;
  wishlistCount: number;
  walletBalance: number;
  recentTransactions: CustomerDashboardTransaction[];
  recentOrders: CustomerDashboardOrder[];
  unreadMessageCount: number;
  unreadNotificationCount: number;
  pendingInvoicesCount: number;
}

export async function getCustomerProfile(): Promise<CustomerProfileResponse> {
  const response = await fetchJson<ApiResponse<CustomerProfileResponse>>('/api/customers/profile', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load customer profile');
  }
  return response.data;
}

export async function saveCustomerProfile(payload: CustomerProfileRequest): Promise<CustomerProfileResponse> {
  const response = await fetchJson<ApiResponse<CustomerProfileResponse>>('/api/customer/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to save customer profile');
  }
  return response.data;
}

export async function getCustomerDashboard(): Promise<CustomerDashboardResponse> {
  const response = await fetchJson<ApiResponse<CustomerDashboardResponse>>('/api/customer/dashboard', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load customer dashboard');
  }
  return response.data;
}
