import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface WishlistItemResponse {
  id: number;
  productId: number;
  auctionId?: number;
  itemType?: 'PRODUCT' | 'AUCTION' | string;
  customerId?: number;
  addedAt?: string;
  title?: string | null;
  description?: string | null;
  price?: number | string | null;
  imageUrl?: string | null;
  product?: {
    id: number;
    name?: string | null;
    price?: number | string | null;
    image?: string | null;
    imageUrl?: string | null;
    description?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistToggleParams {
  productId?: number;
  auctionId?: number;
  itemType: 'PRODUCT' | 'AUCTION';
}

function normalizeWishlistItem(item: any): WishlistItemResponse {
  const rawProduct = item?.product ?? item?.productDetails ?? (item?.name || item?.title ? item : undefined);
  const product = rawProduct
    ? {
        ...rawProduct,
        image: rawProduct.imageUrl || rawProduct.image,
      }
    : undefined;

  if (product?.image && /via\.placeholder\.com/i.test(product.image)) {
    product.image = '/logo.png';
  }

  return { ...item, product };
}

function extractWishlistItems(data: any): WishlistItemResponse[] {
  const items = Array.isArray(data) ? data : data?.content ?? data?.items ?? data?.data;
  return Array.isArray(items) ? items.map(normalizeWishlistItem) : [];
}

export async function getWishlist(): Promise<WishlistItemResponse[]> {
  const response = await fetchJson<ApiResponse<WishlistItemResponse[]>>('/api/customer/wishlist', {
    method: 'GET',
  });
  if (response?.data === undefined || response?.data === null) {
    throw new Error(response?.message || 'Failed to load wishlist');
  }
  return extractWishlistItems(response.data);
}

export async function getWishlistPaginated(page: number = 0, pageSize: number = 10): Promise<{ data: WishlistItemResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: WishlistItemResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/wishlist/paginated?page=${encodeURIComponent(page)}&size=${encodeURIComponent(pageSize)}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load wishlist');
  }
  return response.data;
}

export async function getWishlistCount(): Promise<number> {
  const response = await fetchJson<ApiResponse<number>>('/api/customer/wishlist/count', {
    method: 'GET',
  });
  if (response?.data === undefined || response?.data === null) {
    throw new Error(response?.message || 'Failed to load wishlist count');
  }
  return response.data;
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

export async function toggleWishlist(params: WishlistToggleParams): Promise<WishlistItemResponse> {
  const query = new URLSearchParams({ itemType: params.itemType });
  if (params.productId !== undefined) query.set('productId', String(params.productId));
  if (params.auctionId !== undefined) query.set('auctionId', String(params.auctionId));

  const response = await fetchJson<ApiResponse<WishlistItemResponse>>(`/api/customer/wishlist/toggle?${query.toString()}`, {
    method: 'POST',
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

export function notifyWishlistChanged(detail: { productId?: number; auctionId?: number; wishlistId?: number; saved: boolean }): void {
  window.dispatchEvent(new CustomEvent('bidzo:wishlist-changed', { detail }));
}
