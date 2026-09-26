import { fetchJson, fetchJsonWithToken } from './apiClient';
import type { ApiResponse } from '../types';

export interface AuthLoginDto {
  email: string;
  password: string;
}

export interface AuthRegisterDto {
  username: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'VENDOR';
  phoneNumber: string;
  referralCode?: string;
}

export interface AuthLoginResponse {
  token: string;
  role?: string;
  userId?: string | number;
  vendorId?: string | number;
  vendorProfileId?: string | number;
  vendor_profile_id?: string | number;
  vendor?: {
    id?: string | number;
    vendorId?: string | number;
    vendorProfileId?: string | number;
    vendor_profile_id?: string | number;
  };
}

export interface AuthRegisterResponse {
  id?: string | number;
  userId?: string | number;
  vendorId?: string | number;
  vendorProfileId?: string | number;
  vendor_profile_id?: string | number;
  vendor?: {
    id?: string | number;
    vendorId?: string | number;
    vendorProfileId?: string | number;
    vendor_profile_id?: string | number;
  };
}

export function resolveVendorProfileId(payload?: Partial<AuthRegisterResponse & AuthLoginResponse> & { vendor?: { id?: string | number; vendorId?: string | number; vendorProfileId?: string | number; vendor_profile_id?: string | number } }): string | number | undefined {
  const candidates = [
    payload?.vendorId,
    payload?.vendorProfileId,
    (payload as { vendor_profile_id?: string | number } | undefined)?.vendor_profile_id,
    payload?.vendor?.vendorId,
    payload?.vendor?.vendorProfileId,
    payload?.vendor?.vendor_profile_id,
    payload?.vendor?.id,
  ];

  const resolved = candidates.find((candidate) => candidate !== undefined && candidate !== null && candidate !== '');
  return resolved !== undefined ? resolved : undefined;
}

export function setStoredVendorProfileId(vendorId: string | number | null | undefined): void {
  if (vendorId === undefined || vendorId === null || vendorId === '') {
    localStorage.removeItem('bidzo_vendor_profile_id');
    try {
      const raw = localStorage.getItem('bidzo_user');
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as { vendorProfileId?: string | number; vendorId?: string | number };
      delete parsed.vendorProfileId;
      delete parsed.vendorId;
      localStorage.setItem('bidzo_user', JSON.stringify(parsed));
    } catch {
      // Ignore malformed storage state.
    }
    return;
  }

  const normalized = String(vendorId);
  localStorage.setItem('bidzo_vendor_profile_id', normalized);

  try {
    const raw = localStorage.getItem('bidzo_user');
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as { vendorProfileId?: string | number; vendorId?: string | number };
    parsed.vendorProfileId = normalized;
    parsed.vendorId = normalized;
    localStorage.setItem('bidzo_user', JSON.stringify(parsed));
  } catch {
    // Ignore malformed storage state.
  }
}

export function getStoredVendorProfileId(): string | number | undefined {
  const direct = localStorage.getItem('bidzo_vendor_profile_id');
  if (direct !== null && direct !== '') {
    return direct;
  }

  try {
    const raw = localStorage.getItem('bidzo_user');
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as { vendorProfileId?: string | number; vendorId?: string | number };
    const candidate = parsed.vendorProfileId ?? parsed.vendorId;
    if (candidate !== undefined && candidate !== null && candidate !== '') {
      setStoredVendorProfileId(String(candidate));
      return String(candidate);
    }
  } catch {
    // Ignore malformed storage state.
  }

  return undefined;
}

export interface AuthMeResponse {
  id: string | number;
  name?: string;
  username?: string;
  email: string;
  role: string;
  phone?: string;
  userId?: string | number;
  vendorId?: string | number;
  vendorProfileId?: string | number;
  vendor_profile_id?: string | number;
  vendor?: {
    id?: string | number;
    vendorId?: string | number;
    vendorProfileId?: string | number;
    vendor_profile_id?: string | number;
  };
}

export async function register(payload: AuthRegisterDto): Promise<AuthRegisterResponse | undefined> {
  const response = await fetchJson<ApiResponse<AuthRegisterResponse> | null>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
  if (response?.success === false) {
    throw new Error(response?.message || 'Registration failed');
  }
  return response?.data ?? undefined;
}

export interface OtpRequest {
  email?: string;
  phoneNumber?: string;
  otp: string;
  channel?: 'EMAIL' | 'SMS';
}

export interface ResendRegistrationOtpRequest {
  email?: string;
  phoneNumber?: string;
  channel: 'EMAIL' | 'SMS';
}

export const RESET_TOKEN_STORAGE_KEY = 'bidzo_reset_token';
export const RESET_EMAIL_STORAGE_KEY = 'bidzo_reset_email';

export function setStoredResetToken(token: string | null | undefined): void {
  if (!token || !token.trim()) {
    sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(RESET_TOKEN_STORAGE_KEY, token.trim());
}

export function getStoredResetToken(): string | undefined {
  const token = sessionStorage.getItem(RESET_TOKEN_STORAGE_KEY);
  return token && token.trim() ? token.trim() : undefined;
}

export function clearStoredResetToken(): void {
  sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(RESET_EMAIL_STORAGE_KEY);
}

export function resolveResetTokenValue(payload: unknown): string | undefined {
  const entry = payload as Record<string, unknown> | undefined;
  if (!entry) {
    return undefined;
  }

  const candidates: unknown[] = [
    entry.resetToken,
    entry.token,
    entry.accessToken,
    entry.jwt,
    entry.authToken,
    (entry.data as Record<string, unknown> | undefined)?.resetToken,
    (entry.data as Record<string, unknown> | undefined)?.token,
    (entry.data as Record<string, unknown> | undefined)?.accessToken,
    (entry.data as Record<string, unknown> | undefined)?.jwt,
    (entry.data as Record<string, unknown> | undefined)?.authToken,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return undefined;
}

export function extractRetryDelaySeconds(message: string): number | undefined {
  const normalized = message.toLowerCase();
  const explicit = normalized.match(/(\d+)\s*(second|seconds|minute|minutes|min|mins)/i);
  if (explicit) {
    const amount = Number.parseInt(explicit[1], 10);
    const unit = explicit[2].toLowerCase();
    if (!Number.isNaN(amount)) {
      return unit.startsWith('min') ? amount * 60 : amount;
    }
  }
  if (normalized.includes('retry after') || normalized.includes('please wait') || normalized.includes('wait a moment') || normalized.includes('too many requests')) {
    const fallback = normalized.match(/(\d+)/);
    if (fallback) {
      return Number.parseInt(fallback[1], 10);
    }
    return 30;
  }
  return undefined;
}

export function validatePasswordRules(password: string): string[] {
  const nextErrors: string[] = [];
  if (password.length < 8) {
    nextErrors.push('Use at least 8 characters.');
  }
  if (!/[A-Z]/.test(password)) {
    nextErrors.push('Include at least one uppercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    nextErrors.push('Include at least one number.');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
    nextErrors.push('Include at least one special character.');
  }
  return nextErrors;
}

async function postAuthAction(path: string, payload: object, fallbackMessage: string): Promise<ApiResponse<unknown> | null> {
  const response = await fetchJson<ApiResponse<unknown> | null>(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
  if (response?.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
  return response;
}

export function verifyRegistrationOtp(payload: OtpRequest): Promise<void> {
  return postAuthAction('/auth/verify-registration-otp', payload, 'Invalid or expired verification OTP.').then(() => undefined);
}

export function resendRegistrationOtp(payload: ResendRegistrationOtpRequest): Promise<void> {
  return postAuthAction('/auth/resend-registration-otp', payload, 'Unable to resend the verification OTP.').then(() => undefined);
}

export async function forgotPassword(email: string): Promise<string | undefined> {
  const response = await postAuthAction('/auth/forgot-password', { email }, 'Unable to send the password reset OTP.');
  const resetToken = response ? resolveResetTokenValue(response) : undefined;
  if (resetToken) {
    setStoredResetToken(resetToken);
  }
  return resetToken;
}

export async function verifyResetOtp(payload: OtpRequest): Promise<string | undefined> {
  const response = await postAuthAction('/auth/verify-reset-otp', payload, 'Invalid or expired password reset OTP.');
  const resetToken = response ? resolveResetTokenValue(response) : undefined;
  if (resetToken) {
    setStoredResetToken(resetToken);
  }
  return resetToken;
}

export async function resetPassword(payload: OtpRequest & { newPassword: string; resetToken?: string }): Promise<void> {
  const resetToken = payload.resetToken ?? getStoredResetToken();
  const requestBody = {
    ...payload,
    ...(resetToken ? { resetToken, token: resetToken } : {}),
  };

  const response = await postAuthAction('/auth/reset-password', requestBody, 'Unable to reset your password.');
  if (response) {
    const nextToken = resolveResetTokenValue(response);
    if (nextToken) {
      setStoredResetToken(nextToken);
    } else {
      clearStoredResetToken();
    }
  } else {
    clearStoredResetToken();
  }
}

export async function login(payload: AuthLoginDto): Promise<AuthLoginResponse> {
  const response = await fetchJson<ApiResponse<AuthLoginResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
  if (!response?.data?.token) {
    throw new Error('Invalid login response');
  }

  if (import.meta.env.DEV) {
    console.debug('[Bidzo auth] login response', {
      role: response.data.role,
      userId: response.data.userId,
      vendorId: response.data.vendorId,
      vendorProfileId: response.data.vendorProfileId,
    });
  }

  const persisted = (() => {
    try {
      return JSON.parse(localStorage.getItem('bidzo_user') || '{}');
    } catch {
      return {};
    }
  })();

  const resolvedVendorId = response.data.vendorId ?? response.data.vendorProfileId ?? response.data.vendor?.vendorId ?? response.data.vendor?.vendorProfileId ?? response.data.vendor_profile_id ?? response.data.vendor?.vendor_profile_id;
  if (resolvedVendorId !== undefined && resolvedVendorId !== null && resolvedVendorId !== '') {
    setStoredVendorProfileId(String(resolvedVendorId));
  }

  const nextUserState = {
    ...persisted,
    token: response.data.token,
    vendorId: resolvedVendorId,
    vendorProfileId: resolvedVendorId,
  };
  localStorage.setItem('bidzo_user', JSON.stringify(nextUserState));
  return response.data;
}

export async function authMe(token: string): Promise<AuthMeResponse> {
  const response = await fetchJsonWithToken<ApiResponse<AuthMeResponse>>('/auth/me', token, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error('Invalid auth/me response');
  }

  const resolvedVendorId = resolveVendorProfileId(response.data);
  if (resolvedVendorId !== undefined && resolvedVendorId !== null && resolvedVendorId !== '') {
    setStoredVendorProfileId(String(resolvedVendorId));
    const vendorInfo = response.data.vendor ?? {};
    return {
      ...response.data,
      vendorId: response.data.vendorId ?? resolvedVendorId,
      vendorProfileId: response.data.vendorProfileId ?? resolvedVendorId,
      vendor_profile_id: response.data.vendor_profile_id ?? resolvedVendorId,
      vendor: {
        ...vendorInfo,
        id: vendorInfo.id ?? resolvedVendorId,
        vendorId: vendorInfo.vendorId ?? resolvedVendorId,
        vendorProfileId: vendorInfo.vendorProfileId ?? resolvedVendorId,
        vendor_profile_id: vendorInfo.vendor_profile_id ?? resolvedVendorId,
      },
    };
  }

  return response.data;
}
