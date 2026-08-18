import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface WishlistItemResponse {
  id: number;
  productId: number;
  customerId: number;
  addedAt: string;
  product?: {
    id: number;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export async function getWishlist(): Promise<WishlistItemResponse[]> {
  const response = await fetchJson<ApiResponse<WishlistItemResponse[]>>('/api/customer/wishlist', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load wishlist');
  }
  return response.data;
}

export async function getWishlistPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: WishlistItemResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: WishlistItemResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/wishlist/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load wishlist');
  }
  return response.data;
}

export async function getWishlistCount(): Promise<number> {
  const response = await fetchJson<ApiResponse<{ count: number }>>('/api/customer/wishlist/count', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load wishlist count');
  }
  return response.data.count;
}

export async function addToWishlist(productId: number): Promise<WishlistItemResponse> {
  const response = await fetchJson<ApiResponse<WishlistItemResponse>>('/api/customer/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to add to wishlist');
  }
  return response.data;
}

export async function toggleWishlist(productId: number): Promise<WishlistItemResponse> {
  const response = await fetchJson<ApiResponse<WishlistItemResponse>>('/api/customer/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to toggle wishlist');
  }
  return response.data;
}

export async function removeFromWishlist(wishlistId: number): Promise<void> {
  await fetchJson<ApiResponse<void>>(`/api/customer/wishlist/${wishlistId}`, {
    method: 'DELETE',
  });
}
