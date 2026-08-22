import { fetchJson } from './apiClient';

export interface AdminRecord {
  id?: number | string;
  [key: string]: unknown;
}

export interface AdminPage<T extends AdminRecord = AdminRecord> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  message?: string;
  meta?: { page?: number; pageSize?: number; total?: number };
  content?: T;
  totalElements?: number;
  totalPages?: number;
}

function queryString(query: AdminQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const result = params.toString();
  return result ? `?${result}` : '';
}

function unwrap<T>(response: T | ApiEnvelope<T>, fallback: string): T {
  if (response && typeof response === 'object' && ('data' in response || 'success' in response)) {
    const envelope = response as ApiEnvelope<T>;
    if (envelope.success === false) throw new Error(envelope.message || fallback);
    return (envelope.data ?? envelope.content) as T;
  }
  return response as T;
}

function records<T extends AdminRecord>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    for (const key of ['items', 'content', 'results', 'records', 'data']) {
      const nested = records<T>(object[key]);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

async function list<T extends AdminRecord>(path: string, query: AdminQuery = {}): Promise<T[]> {
  const response = await fetchJson<T[] | ApiEnvelope<T[]>>(`${path}${queryString(query)}`);
  return records(unwrap(response, `Failed to load ${path}`));
}

async function paginated<T extends AdminRecord>(path: string, query: AdminQuery = {}): Promise<AdminPage<T>> {
  const page = query.page ?? 0;
  const pageSize = query.pageSize ?? 10;
  const response = await fetchJson<unknown>(`${path}${queryString({ ...query, page, pageSize })}`);
  if (import.meta.env.DEV && path === '/api/admin/vendors/paginated') {
    console.debug('[Admin vendors paginated] response shape', response);
  }
  const envelope = response as ApiEnvelope<unknown>;
  const value = unwrap(response as unknown, `Failed to load ${path}`);
  const items = records<T>(value);
  const meta = envelope?.meta || (value && typeof value === 'object' ? (value as Record<string, unknown>).meta as AdminPage['items'] & { page?: number; pageSize?: number; total?: number } : undefined);
  const valueObject = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    items,
    page: Number(meta?.page ?? envelope?.meta?.page ?? page),
    pageSize: Number(meta?.pageSize ?? envelope?.meta?.pageSize ?? pageSize),
    total: Number(meta?.total ?? envelope?.meta?.total ?? envelope?.totalElements ?? valueObject.totalElements ?? items.length),
  };
}

async function detail<T extends AdminRecord>(path: string, fallback: string) {
  const response = await fetchJson<T | ApiEnvelope<T>>(path);
  return unwrap(response, fallback);
}

export const getAdminDashboard = () => detail<AdminRecord>('/api/admin/dashboard', 'Failed to load admin dashboard');

export const getAdminUsers = (query?: AdminQuery) => list<AdminRecord>('/api/admin/users', query);
export const getAdminUsersPaginated = (query?: AdminQuery) => paginated<AdminRecord>('/api/admin/users/paginated', query);
export const getAdminUser = (id: string | number) => detail<AdminRecord>(`/api/admin/users/${id}`, 'Failed to load user');
export const searchAdminUsers = (search: string) => list<AdminRecord>('/api/admin/users/search', { search });
export const getAdminUsersByRole = (role: string) => list<AdminRecord>(`/api/admin/users/role/${encodeURIComponent(role)}`);

export const getAdminCustomers = (query?: AdminQuery) => list<AdminRecord>('/api/admin/customers', query);
export const getAdminCustomersPaginated = (query?: AdminQuery) => paginated<AdminRecord>('/api/admin/customers/paginated', query);
export const getAdminCustomer = (id: string | number) => detail<AdminRecord>(`/api/admin/customers/${id}`, 'Failed to load customer');
export const getAdminCustomerOrders = (id: string | number) => list<AdminRecord>(`/api/admin/customers/${id}/orders`);
export const getAdminCustomerBids = (id: string | number) => list<AdminRecord>(`/api/admin/customers/${id}/bids`);
export const getAdminCustomerPayments = (id: string | number) => list<AdminRecord>(`/api/admin/customers/${id}/payments`);

export const getAdminVendors = (query?: AdminQuery) => list<AdminRecord>('/api/admin/vendors', query);
export const getAdminVendorsPaginated = (query?: AdminQuery) => paginated<AdminRecord>('/api/admin/vendors/paginated', query);
export const activateAdminVendor = (userId: string | number) => fetchJson<AdminRecord>(`/api/admin/vendors/${userId}/activate`, { method: 'PUT' });
export const deactivateAdminVendor = (userId: string | number) => fetchJson<AdminRecord>(`/api/admin/vendors/${userId}/deactivate`, { method: 'PUT' });
export const getAdminVendor = (id: string | number) => detail<AdminRecord>(`/api/admin/vendors/${id}`, 'Failed to load vendor');
export const getAdminVendorProducts = (id: string | number) => list<AdminRecord>(`/api/admin/vendors/${id}/products`);
export const getAdminVendorAuctions = (id: string | number) => list<AdminRecord>(`/api/admin/vendors/${id}/auctions`);
export const getAdminVendorOrders = (id: string | number) => list<AdminRecord>(`/api/admin/vendors/${id}/orders`);

export const getAdminAuctions = (query?: AdminQuery) => list<AdminRecord>('/api/admin/auctions', query);
export const getAdminAuctionsPaginated = (query?: AdminQuery) => paginated<AdminRecord>('/api/admin/auctions/paginated', query);
export const getAdminAuction = (id: string | number) => detail<AdminRecord>(`/api/admin/auctions/${id}`, 'Failed to load auction');
export const searchAdminAuctions = (search: string) => list<AdminRecord>('/api/admin/auctions/search', { search });
export const getAdminAuctionsByStatus = (status: string) => list<AdminRecord>(`/api/admin/auctions/status/${encodeURIComponent(status)}`);
export const getAdminAuctionBids = (id: string | number) => list<AdminRecord>(`/api/admin/auctions/${id}/bids`);
export const getAdminAuctionWinner = (id: string | number) => detail<AdminRecord>(`/api/admin/auctions/${id}/winner`, 'Failed to load auction winner');

export const getAdminOrders = (query?: AdminQuery) => list<AdminRecord>('/api/admin/orders', query);
export const getAdminOrdersPaginated = (query?: AdminQuery) => paginated<AdminRecord>('/api/admin/orders/paginated', query);
export const getAdminOrder = (id: string | number) => detail<AdminRecord>(`/api/admin/orders/${id}`, 'Failed to load order');
export const searchAdminOrders = (search: string) => list<AdminRecord>('/api/admin/orders/search', { search });
export const getAdminOrdersByStatus = (status: string) => list<AdminRecord>(`/api/admin/orders/status/${encodeURIComponent(status)}`);
export const getAdminOrdersByDateRange = (startDate: string, endDate: string) => list<AdminRecord>('/api/admin/orders/date-range', { startDate, endDate });
export const updateAdminOrderStatus = (id: string | number, status: string) => fetchJson<AdminRecord | ApiEnvelope<AdminRecord>>(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const getAdminProducts = (query?: AdminQuery) => list<AdminRecord>('/api/admin/products', query);
export const getAdminProductsPaginated = (query?: AdminQuery) => paginated<AdminRecord>('/api/admin/products/paginated', query);
export const getAdminProduct = (id: string | number) => detail<AdminRecord>(`/api/admin/products/${id}`, 'Failed to load product');
export const searchAdminProducts = (search: string) => list<AdminRecord>('/api/admin/products/search', { search });
export const getAdminProductsByStatus = (status: string) => list<AdminRecord>(`/api/admin/products/status/${encodeURIComponent(status)}`);
export const getAdminProductVariants = (id: string | number) => list<AdminRecord>(`/api/admin/products/${id}/variants`);
export const updateAdminProductStatus = (id: string | number, status: string) => fetchJson<AdminRecord | ApiEnvelope<AdminRecord>>(`/api/admin/products/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const getAdminPayments = (query?: AdminQuery) => list<AdminRecord>('/api/admin/payments', query);
export const getAdminPaymentsPaginated = (query?: AdminQuery) => paginated<AdminRecord>('/api/admin/payments/paginated', query);
export const getAdminPayment = (id: string | number) => detail<AdminRecord>(`/api/admin/payments/${id}`, 'Failed to load payment');
export const searchAdminPayments = (search: string) => list<AdminRecord>('/api/admin/payments/search', { search });
export const getAdminPaymentsByStatus = (status: string) => list<AdminRecord>(`/api/admin/payments/status/${encodeURIComponent(status)}`);
export const getAdminPaymentsByDateRange = (startDate: string, endDate: string) => list<AdminRecord>('/api/admin/payments/date-range', { startDate, endDate });

export const getAdminRevenueReport = (startDate?: string, endDate?: string) => detail<AdminRecord>(`/api/admin/reports/revenue${queryString({ startDate, endDate })}`, 'Failed to load revenue report');
export const getAdminOrdersReport = () => detail<AdminRecord>('/api/admin/reports/orders', 'Failed to load orders report');
export const getAdminAuctionsReport = () => detail<AdminRecord>('/api/admin/reports/auctions', 'Failed to load auctions report');
export const getAdminUsersReport = () => detail<AdminRecord>('/api/admin/reports/users', 'Failed to load users report');
export const getAdminPaymentsReport = () => detail<AdminRecord>('/api/admin/reports/payments', 'Failed to load payments report');
export const getAdminRevenueReportByDateRange = (startDate: string, endDate: string) => detail<AdminRecord>(`/api/admin/reports/revenue/date-range${queryString({ startDate, endDate })}`, 'Failed to load revenue report');
