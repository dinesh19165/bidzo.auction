import { fetchJson } from './apiClient';

export type FranchiseRecord = Record<string, unknown>;

export interface FranchiseMe extends FranchiseRecord {
  id?: string | number;
  name?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
}

export type FranchiseDashboard = FranchiseRecord;
export type FranchiseAnalytics = FranchiseRecord;

function unwrap(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const object = value as Record<string, unknown>;
  if (object.success === false) throw new Error(String(object.message || 'Franchise request failed.'));
  if ('data' in object) return object.data;
  if ('content' in object) return object.content;
  if ('result' in object) return object.result;
  return value;
}

function records(value: unknown): FranchiseRecord[] {
  const unwrapped = unwrap(value);
  if (Array.isArray(unwrapped)) return unwrapped.filter((item): item is FranchiseRecord => Boolean(item && typeof item === 'object'));
  if (!unwrapped || typeof unwrapped !== 'object') return [];
  const object = unwrapped as Record<string, unknown>;
  for (const key of ['items', 'content', 'results', 'records', 'vendors', 'products', 'orders', 'customers']) {
    const nested = records(object[key]);
    if (nested.length > 0) return nested;
  }
  return [];
}

async function getObject<T extends FranchiseRecord>(path: string, fallback: string): Promise<T> {
  const response = await fetchJson<unknown>(path);
  const value = unwrap(response);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(fallback);
  return value as T;
}

async function getList(path: string, fallback: string): Promise<FranchiseRecord[]> {
  const response = await fetchJson<unknown>(path);
  return records(response);
}

let franchiseMeRequest: Promise<FranchiseMe> | null = null;

export function getFranchiseMe(): Promise<FranchiseMe> {
  if (franchiseMeRequest) return franchiseMeRequest;
  franchiseMeRequest = getObject<FranchiseMe>('/api/franchise/me', 'Unable to load the current franchise.')
    .catch((error) => {
      franchiseMeRequest = null;
      throw error;
    });
  return franchiseMeRequest;
}

export const getFranchiseDashboard = () => getObject<FranchiseDashboard>('/api/franchise/dashboard', 'Unable to load the franchise dashboard.');
export const getFranchiseVendors = () => getList('/api/franchise/vendors', 'Unable to load franchise vendors.');
export const getFranchiseVendor = (id: string | number) => getObject(`/api/franchise/vendors/${encodeURIComponent(String(id))}`, 'Unable to load franchise vendor.');
export const getFranchiseProducts = () => getList('/api/franchise/products', 'Unable to load franchise products.');
export const getFranchiseProduct = (id: string | number) => getObject(`/api/franchise/products/${encodeURIComponent(String(id))}`, 'Unable to load franchise product.');
export const getFranchiseOrders = () => getList('/api/franchise/orders', 'Unable to load franchise orders.');
export const getFranchiseOrder = (id: string | number) => getObject(`/api/franchise/orders/${encodeURIComponent(String(id))}`, 'Unable to load franchise order.');
export const getFranchiseAnalytics = () => getObject<FranchiseAnalytics>('/api/franchise/analytics', 'Unable to load franchise analytics.');
export const getFranchiseCustomers = () => getList('/api/franchise/customers', 'Unable to load franchise customers.');
