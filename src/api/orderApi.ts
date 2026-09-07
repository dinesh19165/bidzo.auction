import { fetchJson } from './apiClient';
import type { ApiResponse, OrderRequestDto, OrderResponseDto } from '../types';
import { getPaymentsForOrder } from './paymentApi';
import { getAuctionById } from './auctionApi';

export interface AuctionPaymentState {
  paid: boolean;
  orderConfirmed: boolean;
  hasOrder: boolean;
  canPay: boolean;
  orderId: number | null;
  order: OrderResponseDto | null;
}

export function isPaidStatus(value: unknown): boolean {
  return ['PAID', 'COMPLETED', 'SUCCESS', 'PAYMENT_COMPLETED'].includes(String(value ?? '').trim().toUpperCase());
}

export function isConfirmedOrderStatus(value: unknown): boolean {
  return ['CONFIRMED', 'PAID', 'COMPLETED', 'SUCCESS', 'PAYMENT_COMPLETED'].includes(String(value ?? '').trim().toUpperCase());
}

function orderBelongsToAuction(order: OrderResponseDto, auctionId: number, productId?: number | null): boolean {
  const candidate = order as OrderResponseDto & { auctionId?: number | string | null; productId?: number | string | null };
  if (String(candidate.auctionId ?? '') === String(auctionId)) return true;
  if (productId == null) return false;
  if (String(candidate.productId ?? '') === String(productId)) return true;
  return Boolean(order.items?.some((item) => String(item.productId ?? '') === String(productId)));
}

export async function getAuctionPaymentState(auctionId: number, knownOrderId?: number | null): Promise<AuctionPaymentState> {
  const [orders, auction] = await Promise.all([getOrders(), getAuctionById(auctionId)]);
  const productId = auction.productId ?? null;
  const matchingOrder = (knownOrderId ? orders.find((order) => order.id === knownOrderId) : undefined) ?? orders.find((order) => orderBelongsToAuction(order, auctionId, productId)) ?? null;
  if (!matchingOrder) return { paid: false, orderConfirmed: false, hasOrder: false, canPay: true, orderId: null, order: null };
  const orderConfirmed = isConfirmedOrderStatus(matchingOrder.orderStatus);
  const payments = orderConfirmed ? [] : await getPaymentsForOrder(matchingOrder.id);
  const paymentCompleted = orderConfirmed || payments.some((payment) => isPaidStatus(payment.status));
  return { paid: paymentCompleted, orderConfirmed, hasOrder: true, canPay: !paymentCompleted, orderId: matchingOrder.id, order: matchingOrder };
}

export async function getOrders(): Promise<OrderResponseDto[]> {
  const response = await fetchJson<ApiResponse<OrderResponseDto[]>>('/api/orders/my', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load orders');
  }
  return response.data;
}

export async function getOrderById(orderId: number): Promise<OrderResponseDto> {
  const response = await fetchJson<ApiResponse<OrderResponseDto>>(`/api/orders/${orderId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load order details');
  }
  return response.data;
}

export async function createOrder(request: OrderRequestDto): Promise<OrderResponseDto> {
  const response = await fetchJson<ApiResponse<OrderResponseDto>>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to create order');
  }
  return response.data;
}

export async function createAuctionOrder(auctionId: number, addressId: number): Promise<OrderResponseDto> {
  const response = await fetchJson<ApiResponse<OrderResponseDto>>(`/api/auctions/${auctionId}/order`, {
    method: 'POST',
    body: JSON.stringify({ addressId }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to create auction order');
  }
  return response.data;
}
