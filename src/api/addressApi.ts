import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface AddressResponse {
  id: number;
  customerId: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressRequest {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export async function getAddresses(): Promise<AddressResponse[]> {
  const response = await fetchJson<ApiResponse<AddressResponse[]>>('/api/customer/addresses', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load addresses');
  }
  return response.data;
}

export async function getAddressesPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: AddressResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: AddressResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/addresses/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load addresses');
  }
  return response.data;
}

export async function getAddressById(addressId: number): Promise<AddressResponse> {
  const response = await fetchJson<ApiResponse<AddressResponse>>(`/api/customer/addresses/${addressId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load address');
  }
  return response.data;
}

export async function createAddress(payload: AddressRequest): Promise<AddressResponse> {
  const response = await fetchJson<ApiResponse<AddressResponse>>('/api/customer/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to create address');
  }
  return response.data;
}

export async function updateAddress(addressId: number, payload: AddressRequest): Promise<AddressResponse> {
  const response = await fetchJson<ApiResponse<AddressResponse>>(`/api/customer/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to update address');
  }
  return response.data;
}

export async function setDefaultAddress(addressId: number): Promise<AddressResponse> {
  const response = await fetchJson<ApiResponse<AddressResponse>>(`/api/customer/addresses/${addressId}/default`, {
    method: 'PUT',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to set default address');
  }
  return response.data;
}

export async function deleteAddress(addressId: number): Promise<void> {
  await fetchJson<ApiResponse<void>>(`/api/customer/addresses/${addressId}`, {
    method: 'DELETE',
  });
}
