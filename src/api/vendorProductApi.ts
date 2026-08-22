import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export type SellingType = 'DIRECT_BUY' | 'AUCTION' | string | null;

export interface VendorProduct {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  sku?: string;
  status?: string | null;
  brandId?: number | null;
  categoryId?: number | null;
  sellingType?: SellingType;
  quantity?: number | null;
  vendorId?: number | null;
}

export interface VendorProductApiResponse extends VendorProduct {
  stock?: number | null;
  imageUrl?: string | null;
  image?: string | null;
  images?: Array<{
    url?: string | null;
    imageUrl?: string | null;
  }>;

  specifications?: Array<{
    name: string;
    value: string;
  }>;
}

export interface VendorProductCreateRequest {
  name: string;
  description?: string | null;
  price: number | string;
  sku?: string;
  status?: string | null;
  brandId?: number | null;
  categoryId?: number | null;
  sellingType?: SellingType;
  quantity?: number | null;

  // Category-specific fields.
  // Names must exactly match the existing frontend fields.
  fields?: Record<string, string>;
}

export function formatCurrency(
  value: number | string | null | undefined
): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function mapSellingTypeLabel(
  sellingType?: SellingType | null
): string {
  const normalized = String(sellingType ?? '')
    .trim()
    .toUpperCase();

  if (normalized === 'DIRECT_BUY') return 'Direct Buy';
  if (normalized === 'AUCTION') return 'Auction';

  return 'Direct Buy';
}

export function getProductImage(
  product: VendorProductApiResponse
): string {
  const directImage =
    product.imageUrl ||
    product.image ||
    product.images?.[0]?.url ||
    product.images?.[0]?.imageUrl;

  return directImage || '/logo.png';
}

export async function getVendorProducts(): Promise<
  VendorProductApiResponse[]
> {
  const response = await fetchJson<
    ApiResponse<VendorProductApiResponse[]>
  >('/api/vendors/me/products', {
    method: 'GET',
  });

  if (response?.success && Array.isArray(response.data)) {
    return response.data;
  }

  if (response?.message) {
    throw new Error(response.message);
  }

  throw new Error('Unable to load vendor products');
}

export async function createVendorProduct(
  payload: VendorProductCreateRequest
): Promise<VendorProductApiResponse> {
  const response = await fetchJson<
    ApiResponse<VendorProductApiResponse>
  >('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (response?.success && response.data) {
    return response.data;
  }

  if (response?.message) {
    throw new Error(response.message);
  }

  throw new Error('Unable to create vendor product');
}

export async function updateVendorProduct(
  id: number,
  payload: Partial<VendorProductCreateRequest>
): Promise<VendorProductApiResponse> {
  const response = await fetchJson<
    ApiResponse<VendorProductApiResponse>
  >(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (response?.success && response.data) {
    return response.data;
  }

  if (response?.message) {
    throw new Error(response.message);
  }

  throw new Error('Unable to update vendor product');
}

export async function deleteVendorProduct(id: number): Promise<void> {
  const response = await fetchJson<ApiResponse<unknown>>(`/api/products/${id}`, {
    method: 'DELETE',
  });

  if (response?.success) {
    return;
  }

  if (response?.message) {
    throw new Error(response.message);
  }

  throw new Error('Unable to delete vendor product');
}