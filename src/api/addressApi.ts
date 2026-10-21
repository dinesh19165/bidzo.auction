import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface AddressResponse {
  id: number;
  customerId: number;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressRequest {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export function buildAddressPayload(form: Pick<AddressRequest, 'fullName' | 'phone' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'postalCode' | 'country'>): AddressRequest | string {
  const payload: AddressRequest = {
    label: 'Home',
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2?.trim() || '',
    city: form.city.trim(),
    state: form.state.trim(),
    postalCode: form.postalCode.trim(),
    country: form.country.trim(),
    isDefault: true,
  };

  if (!payload.fullName) return 'Full name is required.';
  if (!payload.phone) return 'Phone number is required.';
  if (!/^[0-9]{10}$/.test(payload.phone)) return 'Phone number must be exactly 10 digits.';
  if (!payload.addressLine1) return 'Address line 1 is required.';
  if (!payload.city) return 'City is required.';
  if (!payload.state) return 'State is required.';
  if (!/^[0-9]{6}$/.test(payload.postalCode)) return 'Postal code must be exactly 6 digits.';
  if (!payload.country) return 'Country is required.';

  return payload;
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
