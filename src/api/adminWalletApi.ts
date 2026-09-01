import { fetchJson } from './apiClient';

export interface AdminWalletSummary {
  pendingCount?: number;
  pendingAmount?: number;
  approvedCount?: number;
  approvedAmount?: number;
  rejectedCount?: number;
  rejectedAmount?: number;
  payoutTransactionCount?: number;
  totalPayoutAmount?: number;
}

export interface AdminWalletTransaction {
  id?: number | string;
  type?: string;
  vendorName?: string | null;
  amount?: number | string;
  status?: string;
  date?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminWithdrawal {
  id: number | string;
  vendorId?: number | string;
  vendorName?: string;
  vendorEmail?: string;
  businessName?: string;
  amount?: number | string;
  status?: string;
  createdAt?: string;
  requestedAt?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  bankAccountNumber?: string;
  ifsc?: string;
  ifscCode?: string;
  branch?: string;
  branchName?: string;
  bankBranch?: string;
  [key: string]: unknown;
}

interface ApiEnvelope<T> {
  data?: T;
  content?: T;
  success?: boolean;
  message?: string;
}

function unwrap<T>(response: T | ApiEnvelope<T>, fallback: string): T {
  if (response && typeof response === 'object' && ('data' in response || 'content' in response || 'success' in response)) {
    const envelope = response as ApiEnvelope<T>;
    if (envelope.success === false) throw new Error(envelope.message || fallback);
    return (envelope.data ?? envelope.content) as T;
  }
  return response as T;
}

function list<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    for (const key of ['items', 'content', 'results', 'records', 'data']) {
      if (Array.isArray(object[key])) return object[key] as T[];
    }
  }
  return [];
}

export async function getAdminWalletSummary(): Promise<AdminWalletSummary> {
  const response = await fetchJson<AdminWalletSummary | ApiEnvelope<AdminWalletSummary>>('/api/admin/wallet/summary');
  return unwrap(response, 'Failed to load wallet summary');
}

export async function getAdminWalletTransactions(): Promise<AdminWalletTransaction[]> {
  const response = await fetchJson<unknown>('/api/admin/wallet/transactions');
  return list<AdminWalletTransaction>(unwrap(response, 'Failed to load wallet transactions'));
}

export async function getPendingAdminWithdrawals(): Promise<AdminWithdrawal[]> {
  const response = await fetchJson<unknown>('/api/admin/withdrawals/pending');
  return list<AdminWithdrawal>(unwrap(response, 'Failed to load pending withdrawals'));
}

export async function getAdminWithdrawal(id: number | string): Promise<AdminWithdrawal> {
  const response = await fetchJson<AdminWithdrawal | ApiEnvelope<AdminWithdrawal>>(`/api/admin/withdrawals/${id}`);
  return unwrap(response, 'Failed to load withdrawal');
}

async function updateWithdrawal(id: number | string, action: 'approve' | 'reject'): Promise<AdminWithdrawal | null> {
  const response = await fetchJson<AdminWithdrawal | ApiEnvelope<AdminWithdrawal>>(`/api/admin/withdrawals/${id}/${action}`, { method: 'PUT' });
  return unwrap(response, `Failed to ${action} withdrawal`);
}

export const approveAdminWithdrawal = (id: number | string) => updateWithdrawal(id, 'approve');
export const rejectAdminWithdrawal = (id: number | string) => updateWithdrawal(id, 'reject');
