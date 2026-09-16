import { fetchJson } from './apiClient';
import type { TransactionResponse } from './walletApi';

type ApiEnvelope<T> = { data?: T; content?: T; success?: boolean; message?: string };

export interface CustomerWalletLedger {
  balance?: number | string;
  availableBalance?: number | string;
  transactions: TransactionResponse[];
  page?: number;
  pageSize?: number;
  total?: number;
}

function unwrap<T>(response: T | ApiEnvelope<T>, fallback: string): T {
  if (response && typeof response === 'object' && ('data' in response || 'content' in response || 'success' in response)) {
    const envelope = response as ApiEnvelope<T>;
    if (envelope.success === false) throw new Error(envelope.message || fallback);
    return (envelope.data ?? envelope.content) as T;
  }
  return response as T;
}

function getList(value: unknown): TransactionResponse[] {
  if (Array.isArray(value)) return value as TransactionResponse[];
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['transactions', 'items', 'content', 'results', 'records', 'data']) {
      if (Array.isArray(record[key])) return record[key] as TransactionResponse[];
    }
  }
  return [];
}

export async function getWalletLedger(page?: number, pageSize?: number): Promise<CustomerWalletLedger> {
  const query = page && pageSize ? `?page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}` : '';
  const response = await fetchJson<unknown>(`/api/customer/wallet/ledger${query}`, { method: 'GET' });
  const result = unwrap(response, 'Failed to load wallet ledger');
  const source = result && typeof result === 'object' ? result as Record<string, unknown> : {};
  const availableBalance = typeof source.availableBalance === 'number' || typeof source.availableBalance === 'string' ? source.availableBalance : undefined;
  const balance = typeof source.balance === 'number' || typeof source.balance === 'string' ? source.balance : availableBalance;
  return {
    balance,
    availableBalance,
    transactions: getList(result),
    page: typeof source.page === 'number' ? source.page : undefined,
    pageSize: typeof source.pageSize === 'number' ? source.pageSize : undefined,
    total: typeof source.total === 'number' ? source.total : undefined,
  };
}
