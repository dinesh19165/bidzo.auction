import { fetchJson } from './apiClient';
import type { ApiResponse, RazorpayOrderResponse, RazorpayVerifyRequestDto, PaymentResponseDto } from '../types';

export async function createRazorpayPayment(orderId: number): Promise<RazorpayOrderResponse> {
  const response = await fetchJson<ApiResponse<RazorpayOrderResponse>>(`/api/orders/${orderId}/payments/razorpay`, {
    method: 'POST',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to create Razorpay payment');
  }
  return response.data;
}

export async function verifyRazorpayPayment(orderId: number, request: RazorpayVerifyRequestDto): Promise<PaymentResponseDto> {
  const response = await fetchJson<ApiResponse<PaymentResponseDto>>(`/api/orders/${orderId}/payments/razorpay/verify`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to verify Razorpay payment');
  }
  return response.data;
}

export async function getPaymentsForOrder(orderId: number): Promise<PaymentResponseDto[]> {
  const response = await fetchJson<ApiResponse<PaymentResponseDto[]>>(`/api/orders/${orderId}/payments`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load payments');
  }
  return response.data;
}

export async function getPaymentById(paymentId: number): Promise<PaymentResponseDto> {
  const response = await fetchJson<ApiResponse<PaymentResponseDto>>(`/api/payments/${paymentId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load payment details');
  }
  return response.data;
}
