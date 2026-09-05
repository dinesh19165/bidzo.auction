import { fetchJson } from './apiClient';
import type { ApiResponse, RazorpayOrderResponse } from '../types';

export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string | null;
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
  return {
    ...item,
    id: Number(item.id ?? item.itemId),
    productId: Number(item.productId),
    productName: item.productName ?? item.name ?? 'Product',
    productImageUrl: item.productImageUrl || item.imageUrl || '/logo.png',
    unitPrice: Number(item.unitPrice ?? item.price ?? 0),
    quantity: Number(item.quantity ?? 0),
    subtotal: Number(item.subtotal ?? (Number(item.unitPrice ?? item.price ?? 0) * Number(item.quantity ?? 0))),
  };
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

export async function createCartCheckout(addressId: number): Promise<RazorpayOrderResponse> {
  const response = await fetchJson<ApiResponse<RazorpayOrderResponse>>('/api/cart/checkout', {
    method: 'POST',
    body: JSON.stringify({ addressId }),
  });
  if (!response?.data) throw new Error(response?.message || 'Failed to start cart checkout');
  return response.data;
}