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
}

export interface AuthLoginResponse {
  token: string;
}

export interface AuthMeResponse {
  id: string;
  name?: string;
  username?: string;
  email: string;
  role: string;
  phone?: string;
}

export async function register(payload: AuthRegisterDto): Promise<void> {
  const response = await fetchJson<ApiResponse<unknown>>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
  if (!response?.success) {
    throw new Error(response?.message || 'Registration failed');
  }
}

export async function login(payload: AuthLoginDto): Promise<AuthLoginResponse> {
  const response = await fetchJson<ApiResponse<AuthLoginResponse>>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);
  if (!response?.data?.token) {
    throw new Error('Invalid login response');
  }
  return response.data;
}

export async function authMe(token: string): Promise<AuthMeResponse> {
  const response = await fetchJsonWithToken<ApiResponse<AuthMeResponse>>('/api/auth/me', token, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error('Invalid auth/me response');
  }
  return response.data;
}
