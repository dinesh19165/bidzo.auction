import { fetchJson } from './apiClient';

export interface WithdrawalBalance {
  availableBalance?: number;
  balance?: number;
  pendingBalance?: number;
  settledBalance?: number;
  [key: string]: unknown;
}

export interface WithdrawalRequest {
  amount: number;
  [key: string]: unknown;
}

export interface WithdrawalRecord {
  id: number | string;
  amount?: number | string;
  status?: string;
  createdAt?: string;
  requestedAt?: string;
  vendorName?: string;
  vendorEmail?: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

function unwrap<T>(response: T | ApiResponse<T>, message: string): T {
  if (response && typeof response === 'object' && 'data' in response) {
    const wrapped = response as ApiResponse<T>;
    if (wrapped.success === false || !wrapped.data) {
      throw new Error(wrapped.message || message);
    }
    return wrapped.data;
  }

  return response as T;
}

export async function getVendorWithdrawalBalance(): Promise<WithdrawalBalance> {
  const response = await fetchJson<WithdrawalBalance | number | string | ApiResponse<WithdrawalBalance | number | string>>('/api/vendors/me/withdrawals/balance');
  const data = unwrap(response, 'Failed to load withdrawal balance');

  if (typeof data === 'number' || typeof data === 'string') {
    const availableBalance = Number(data);
    if (Number.isFinite(availableBalance)) {
      return { availableBalance };
    }
  }

  return data as WithdrawalBalance;
}

export async function getVendorWithdrawals(): Promise<WithdrawalRecord[]> {
  const response = await fetchJson<WithdrawalRecord[] | ApiResponse<WithdrawalRecord[]>>('/api/vendors/me/withdrawals');
  const data = unwrap(response, 'Failed to load withdrawal history');
  return Array.isArray(data) ? data : [];
}

export async function createVendorWithdrawal(amount: number): Promise<WithdrawalRecord> {
  const response = await fetchJson<WithdrawalRecord | ApiResponse<WithdrawalRecord>>('/api/vendors/me/withdrawals', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  return unwrap(response, 'Failed to submit withdrawal');
}

export async function getPendingWithdrawals(): Promise<WithdrawalRecord[]> {
  const response = await fetchJson<WithdrawalRecord[] | ApiResponse<WithdrawalRecord[]>>('/api/admin/withdrawals/pending');
  const data = unwrap(response, 'Failed to load pending withdrawals');
  return Array.isArray(data) ? data : [];
}

export async function approveWithdrawal(id: number | string): Promise<WithdrawalRecord | null> {
  const response = await fetchJson<WithdrawalRecord | ApiResponse<WithdrawalRecord>>(`/api/admin/withdrawals/${id}/approve`, { method: 'PUT' });
  return unwrap(response, 'Failed to approve withdrawal');
}

export async function rejectWithdrawal(id: number | string): Promise<WithdrawalRecord | null> {
  const response = await fetchJson<WithdrawalRecord | ApiResponse<WithdrawalRecord>>(`/api/admin/withdrawals/${id}/reject`, { method: 'PUT' });
  return unwrap(response, 'Failed to reject withdrawal');
}