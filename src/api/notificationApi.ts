import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export type NotificationAudience = 'ALL_CUSTOMERS' | 'ALL_VENDORS' | 'CUSTOMERS_AND_VENDORS';
export type NotificationType =
  | 'SYSTEM'
  | 'ADMIN_ANNOUNCEMENT'
  | 'ADMIN_OFFER'
  | 'ADMIN_FESTIVAL'
  | 'AUCTION_STARTING'
  | 'AUCTION_LIVE'
  | 'AUCTION_ENDING'
  | 'OUTBID'
  | 'AUCTION_WON'
  | 'AUCTION_LOST'
  | 'AUCTION_REGISTRATION'
  | 'PAYMENT'
  | 'ORDER';

export interface NotificationResponse {
  id: number | string;
  customerId?: number | string;
  vendorId?: number | string;
  title: string;
  message: string;
  type: NotificationType;
  referenceType?: string;
  referenceId?: string | number;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string;
  sentAt?: string;
  status?: string;
}

export interface NotificationPage {
  data: NotificationResponse[];
  meta: { page: number; pageSize: number; total: number };
}

type NotificationEnvelope<T> = ApiResponse<T> | T;

function unwrap<T>(response: NotificationEnvelope<T>, fallback: string): T {
  if (response && typeof response === 'object' && 'data' in response && response.data !== undefined) {
    return response.data as T;
  }
  if (response !== undefined && response !== null) return response as T;
  throw new Error(fallback);
}

function pageFrom(value: unknown, fallbackPage: number, fallbackPageSize: number): NotificationPage {
  if (Array.isArray(value)) return { data: value, meta: { page: fallbackPage, pageSize: fallbackPageSize, total: value.length } };
  const record = (value ?? {}) as { data?: unknown; items?: unknown; content?: unknown; results?: unknown; meta?: Partial<NotificationPage['meta']>; page?: number; pageSize?: number; total?: number };
  const rows = record.data ?? record.items ?? record.content ?? record.results;
  const meta = record.meta ?? record;
  return {
    data: Array.isArray(rows) ? rows as NotificationResponse[] : [],
    meta: { page: meta.page ?? fallbackPage, pageSize: meta.pageSize ?? fallbackPageSize, total: meta.total ?? (Array.isArray(rows) ? rows.length : 0) },
  };
}

async function getNotificationList(scope: 'customer' | 'vendor'): Promise<NotificationResponse[]> {
  const response = await fetchJson<NotificationEnvelope<NotificationResponse[]>>(`/api/${scope}/notifications`, { method: 'GET' });
  const value = unwrap(response, 'Failed to load notifications');
  return Array.isArray(value) ? value : pageFrom(value, 1, 10).data;
}

async function getNotificationPage(scope: 'customer' | 'vendor', page = 1, pageSize = 10): Promise<NotificationPage> {
  const response = await fetchJson<NotificationEnvelope<unknown>>(`/api/${scope}/notifications/paginated?page=${page}&pageSize=${pageSize}`, { method: 'GET' });
  return pageFrom(unwrap(response, 'Failed to load notifications'), page, pageSize);
}

export function getNotifications(): Promise<NotificationResponse[]> {
  return getNotificationList('customer');
}

export function getVendorNotifications(): Promise<NotificationResponse[]> {
  return getNotificationList('vendor');
}

export function getNotificationsPaginated(page = 1, pageSize = 10): Promise<NotificationPage> {
  return getNotificationPage('customer', page, pageSize);
}

export function getVendorNotificationsPaginated(page = 1, pageSize = 10): Promise<NotificationPage> {
  return getNotificationPage('vendor', page, pageSize);
}

export async function getUnreadNotifications(): Promise<NotificationResponse[]> {
  const response = await fetchJson<ApiResponse<NotificationResponse[]>>('/api/customer/notifications/unread', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load unread notifications');
  }
  return response.data;
}

export async function getVendorUnreadNotifications(): Promise<NotificationResponse[]> {
  const response = await fetchJson<NotificationEnvelope<NotificationResponse[]>>('/api/vendor/notifications/unread', { method: 'GET' });
  const value = unwrap(response, 'Failed to load unread notifications');
  return Array.isArray(value) ? value : pageFrom(value, 1, 10).data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await fetchJson<ApiResponse<number | { count: number }>>('/api/customer/notifications/unread/count', {
    method: 'GET',
  });
  if (response?.data === undefined || response?.data === null) {
    throw new Error(response?.message || 'Failed to load unread count');
  }
  return typeof response.data === 'number' ? response.data : response.data.count;
}

export async function getVendorUnreadNotificationCount(): Promise<number> {
  const response = await fetchJson<NotificationEnvelope<{ count: number } | number>>('/api/vendor/notifications/unread/count', { method: 'GET' });
  const value = unwrap(response, 'Failed to load unread notification count');
  return typeof value === 'number' ? value : Number(value.count ?? 0);
}

export async function getNotificationById(notificationId: number): Promise<NotificationResponse> {
  const response = await fetchJson<ApiResponse<NotificationResponse>>(`/api/customer/notifications/${notificationId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load notification');
  }
  return response.data;
}

export async function markNotificationAsRead(notificationId: number): Promise<NotificationResponse> {
  const response = await fetchJson<ApiResponse<NotificationResponse>>(`/api/customer/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to mark notification as read');
  }
  return response.data;
}

export async function markVendorNotificationAsRead(notificationId: number | string): Promise<NotificationResponse> {
  const response = await fetchJson<NotificationEnvelope<NotificationResponse>>(`/api/vendor/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PUT' });
  return unwrap(response, 'Failed to mark notification as read');
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await fetchJson<ApiResponse<void>>('/api/customer/notifications/read-all', {
    method: 'PUT',
  });
}

export async function markAllVendorNotificationsAsRead(): Promise<void> {
  await fetchJson('/api/vendor/notifications/read-all', { method: 'PUT' });
}

export interface AdminNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  audience: NotificationAudience;
  scheduledAt?: string;
}

export interface AdminNotificationRecord extends NotificationResponse {
  audience?: NotificationAudience;
}

export async function createAdminNotification(payload: AdminNotificationRequest): Promise<AdminNotificationRecord> {
  const response = await fetchJson<NotificationEnvelope<AdminNotificationRecord>>('/api/admin/notifications', { method: 'POST', body: JSON.stringify(payload) });
  return unwrap(response, 'Failed to create notification');
}

export async function getAdminNotificationsPaginated(page = 1, pageSize = 10): Promise<NotificationPage> {
  const response = await fetchJson<NotificationEnvelope<unknown>>(`/api/admin/notifications?page=${page}&pageSize=${pageSize}`, { method: 'GET' });
  return pageFrom(unwrap(response, 'Failed to load notification history'), page, pageSize);
}

export async function getAdminNotification(id: number | string): Promise<AdminNotificationRecord> {
  const response = await fetchJson<NotificationEnvelope<AdminNotificationRecord>>(`/api/admin/notifications/${encodeURIComponent(id)}`, { method: 'GET' });
  return unwrap(response, 'Failed to load notification');
}

export async function deleteNotification(notificationId: number): Promise<void> {
  await fetchJson<ApiResponse<void>>(`/api/customer/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}
