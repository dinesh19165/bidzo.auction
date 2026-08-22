import { fetchJson } from './apiClient';
import type { ApiResponse, OrderRequestDto, OrderResponseDto } from '../types';

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
