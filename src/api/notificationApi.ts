import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface NotificationResponse {
  id: number;
  customerId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function getNotifications(): Promise<NotificationResponse[]> {
  const response = await fetchJson<ApiResponse<NotificationResponse[]>>('/api/customer/notifications', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load notifications');
  }
  return response.data;
}

export async function getNotificationsPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: NotificationResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: NotificationResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/notifications/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load notifications');
  }
  return response.data;
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

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await fetchJson<ApiResponse<{ count: number }>>('/api/customer/notifications/unread/count', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load unread count');
  }
  return response.data.count;
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

export async function markAllNotificationsAsRead(): Promise<void> {
  await fetchJson<ApiResponse<void>>('/api/customer/notifications/read-all', {
    method: 'PUT',
  });
}

export async function deleteNotification(notificationId: number): Promise<void> {
  await fetchJson<ApiResponse<void>>(`/api/customer/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}
