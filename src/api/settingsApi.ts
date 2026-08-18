import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface SettingsResponse {
  id: number;
  customerId: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
  currency: string;
  twoFactorEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingsRequest {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  language?: string;
  timezone?: string;
  currency?: string;
}

export async function getSettings(): Promise<SettingsResponse> {
  const response = await fetchJson<ApiResponse<SettingsResponse>>('/api/customer/settings', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load settings');
  }
  return response.data;
}

export async function updateSettings(payload: SettingsRequest): Promise<SettingsResponse> {
  const response = await fetchJson<ApiResponse<SettingsResponse>>('/api/customer/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to update settings');
  }
  return response.data;
}

export async function enableTwoFactor(): Promise<{ secret: string; qrCode: string }> {
  const response = await fetchJson<ApiResponse<{ secret: string; qrCode: string }>>('/api/customer/settings/2fa/enable', {
    method: 'POST',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to enable two-factor authentication');
  }
  return response.data;
}

export async function verifyTwoFactor(code: string): Promise<{ enabled: boolean }> {
  const response = await fetchJson<ApiResponse<{ enabled: boolean }>>('/api/customer/settings/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to verify two-factor authentication');
  }
  return response.data;
}

export async function disableTwoFactor(): Promise<void> {
  await fetchJson<ApiResponse<void>>('/api/customer/settings/2fa/disable', {
    method: 'POST',
  });
}
