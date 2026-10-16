import { fetchJson } from './apiClient';
import type { ApiResponse, RazorpayOrderResponse } from '../types';

export interface CartItemResponse {
  id: number;
  productId: number;
  categoryId?: number | null;
  availableQuantity?: number | null;
  productName: string;
  productImageUrl?: string | null;
  seller?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id?: number;
  items: CartItemResponse[];
  total: number;
}

function normalizeItem(item: any): CartItemResponse {
  const rawAvailableQuantity = item.availableQuantity ?? item.product?.availableQuantity ?? item.product?.quantity ?? item.product?.stock;
  const rawCategoryId = item.categoryId ?? item.product?.categoryId ?? item.product?.category?.id;
  const unitPrice = Number(item.unitPrice ?? item.price ?? item.product?.price ?? 0);
  const quantity = Number(item.quantity ?? 0);
  const rawSeller = item.sellerName ?? item.seller?.name ?? item.seller ?? item.product?.sellerName ?? item.product?.seller?.name ?? item.product?.seller;
  return {
    ...item,
    id: Number(item.id ?? item.itemId),
    productId: Number(item.productId ?? item.product?.id),
    categoryId: rawCategoryId == null ? null : Number(rawCategoryId),
    availableQuantity: rawAvailableQuantity == null ? null : Number(rawAvailableQuantity),
    productName: item.productName ?? item.name ?? item.product?.name ?? item.product?.title ?? 'Product',
    productImageUrl: item.productImageUrl || item.imageUrl || item.product?.imageUrl || item.product?.image || '/logo.png',
    seller: typeof rawSeller === 'string' ? rawSeller : undefined,
    unitPrice,
    quantity,
    subtotal: Number(item.subtotal ?? unitPrice * quantity),
  };
}

export function getNextCartQuantity(existingItem: CartItemResponse | undefined, requestedQuantity: number): number {
  if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
    throw new Error('Enter a valid quantity.');
  }
  const nextQuantity = (existingItem?.quantity ?? 0) + requestedQuantity;
  if (existingItem?.availableQuantity != null && nextQuantity > existingItem.availableQuantity) {
    throw new Error('Requested quantity exceeds available stock.');
  }
  return nextQuantity;
}

function normalizeCart(data: any): CartResponse {
  const rawItems = Array.isArray(data) ? data : data?.items ?? data?.cartItems ?? data?.content ?? [];
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeItem) : [];
  return { ...data, items, total: Number(data?.total ?? data?.totalAmount ?? items.reduce((sum, item) => sum + item.subtotal, 0)) };
}

export async function getCart(): Promise<CartResponse> {
  const response = await fetchJson<ApiResponse<any>>('/api/cart', { method: 'GET' });
  if (response?.data === undefined || response?.data === null) throw new Error(response?.message || 'Failed to load cart');
  return normalizeCart(response.data);
}

export async function addCartItem(productId: number, quantity: number = 1): Promise<CartResponse> {
  const response = await fetchJson<ApiResponse<any>>('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
  if (response?.success === false) throw new Error(response?.message || 'Failed to add item to cart');
  return getCart();
}

export async function addOrUpdateCartItem(productId: number, quantity = 1): Promise<CartResponse> {
  if (!Number.isInteger(productId) || productId <= 0) throw new Error('A valid product is required.');
  getNextCartQuantity(undefined, quantity);
  const currentCart = await getCart();
  const existingItem = currentCart.items.find((item) => item.productId === productId);
  const nextQuantity = getNextCartQuantity(existingItem, quantity);
  return existingItem
    ? updateCartItem(existingItem.id, nextQuantity)
    : addCartItem(productId, quantity);
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartResponse> {
  const response = await fetchJson<ApiResponse<any>>(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
  if (response?.success === false) throw new Error(response?.message || 'Failed to update cart item');
  return getCart();
}

export async function removeCartItem(itemId: number): Promise<CartResponse> {
  const response = await fetchJson<ApiResponse<any>>(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
  if (response?.success === false) throw new Error(response?.message || 'Failed to remove item from cart');
  return getCart();
}

export async function createCartCheckout(addressId: number, offerId?: number | string, couponCode?: string): Promise<RazorpayOrderResponse> {
  const response = await fetchJson<ApiResponse<RazorpayOrderResponse>>('/api/cart/checkout', {
    method: 'POST',
    body: JSON.stringify({ addressId, ...(offerId !== undefined ? { offerId } : {}), ...(couponCode?.trim() ? { couponCode: couponCode.trim() } : {}) }),
  });
  if (!response?.data) throw new Error(response?.message || 'Failed to start cart checkout');
  return response.data;
}