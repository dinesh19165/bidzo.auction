import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface WalletResponse {
  id: number;
  customerId: number;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionResponse {
  id: number;
  walletId?: number;
  type?: 'credit' | 'debit' | string;
  amount?: number | string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  balanceAfter?: number;
  createdAt?: string;
  status?: string;
  date?: string;
  [key: string]: unknown;
}

export async function getWallet(): Promise<WalletResponse> {
  const response = await fetchJson<ApiResponse<WalletResponse>>('/api/customer/wallet', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load wallet');
  }
  return response.data;
}

export async function getWalletBalance(): Promise<number> {
  const response = await fetchJson<ApiResponse<{ balance: number }>>('/api/customer/wallet/balance', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load wallet balance');
  }
  return response.data.balance;
}

export async function getTransactions(): Promise<TransactionResponse[]> {
  const response = await fetchJson<ApiResponse<TransactionResponse[]>>('/api/customer/wallet/transactions', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load transactions');
  }
  return response.data;
}

export async function getTransactionsPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: TransactionResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: TransactionResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/wallet/transactions/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load transactions');
  }
  return response.data;
}

export async function addMoney(amount: number): Promise<{ orderId: string; amount: number; currency: string }> {
  const response = await fetchJson<ApiResponse<{ orderId: string; amount: number; currency: string }>>('/api/customer/wallet/add-money', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to initiate wallet top-up');
  }
  return response.data;
}
