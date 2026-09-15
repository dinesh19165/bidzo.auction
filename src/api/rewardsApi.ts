import { fetchJson } from './apiClient';

type ApiEnvelope<T> = { data?: T; content?: T; success?: boolean; message?: string };

export type RewardsRecord = Record<string, unknown>;

export interface LoyaltyTransactionsResult {
  items: RewardsRecord[];
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

function list(value: unknown): RewardsRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is RewardsRecord => Boolean(item && typeof item === 'object'));
  if (value && typeof value === 'object') {
    const record = value as RewardsRecord;
    for (const key of ['items', 'content', 'results', 'records', 'transactions', 'data']) {
      if (Array.isArray(record[key])) return list(record[key]);
    }
  }
  return [];
}

export async function getRewardsSummary(): Promise<RewardsRecord> {
  const response = await fetchJson<RewardsRecord | ApiEnvelope<RewardsRecord>>('/api/customer/rewards/summary', { method: 'GET' });
  const summary = unwrap(response, 'Failed to load rewards summary');
  if (!summary || typeof summary !== 'object') throw new Error('Failed to load rewards summary');
  return summary;
}

export async function getLoyaltyTransactions(page?: number, pageSize?: number): Promise<LoyaltyTransactionsResult> {
  const query = page && pageSize ? `?page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}` : '';
  const response = await fetchJson<unknown>(`/api/customer/rewards/loyalty/transactions${query}`, { method: 'GET' });
  const result = unwrap(response, 'Failed to load loyalty transactions');
  const source = result && typeof result === 'object' ? result as RewardsRecord : null;
  return {
    items: list(result),
    page: source && typeof source.page === 'number' ? source.page : undefined,
    pageSize: source && typeof source.pageSize === 'number' ? source.pageSize : undefined,
    total: source && typeof source.total === 'number' ? source.total : undefined,
  };
}

export async function redeemLoyaltyPoints(points: number): Promise<RewardsRecord> {
  const response = await fetchJson<RewardsRecord | ApiEnvelope<RewardsRecord>>('/api/customer/rewards/loyalty/redeem', {
    method: 'POST',
    body: JSON.stringify({ points }),
  });
  const result = unwrap(response, 'Unable to redeem loyalty points');
  if (!result || typeof result !== 'object') throw new Error('Unable to redeem loyalty points');
  return result;
}
