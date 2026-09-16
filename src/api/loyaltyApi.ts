import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface LoyaltyBalanceResponse {
  availablePoints: number;
  pointsToCurrencyConversion: number;
  maximumRedeemablePoints: number;
  equivalentDiscountAmount: number;
  redemptionEnabled: boolean;
  message?: string;
}

export interface LoyaltyRedeemQuoteRequest {
  points: number;
  orderAmount: number;
}

export interface LoyaltyRedeemQuoteResponse {
  requestedPoints: number;
  acceptedPoints: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}

export async function getLoyaltyBalance(orderAmount: number): Promise<LoyaltyBalanceResponse> {
  const response = await fetchJson<ApiResponse<{
    availableLoyaltyPoints: number;
    pointsToCurrencyConversion: number;
    maximumRedeemablePoints: number;
    equivalentDiscountAmount: number;
    redemptionEnabled: boolean;
  }>>(`/api/customer/loyalty/balance?orderAmount=${encodeURIComponent(orderAmount)}`, { method: 'GET' });
  const data = response?.data;
  if (!data || typeof data.availableLoyaltyPoints !== 'number' || !Number.isFinite(data.availableLoyaltyPoints)) {
    throw new Error('Loyalty balance response did not include availableLoyaltyPoints.');
  }
  return { ...data, availablePoints: data.availableLoyaltyPoints };
}

export async function getLoyaltyRedeemQuote(request: LoyaltyRedeemQuoteRequest): Promise<LoyaltyRedeemQuoteResponse> {
  const response = await fetchJson<ApiResponse<LoyaltyRedeemQuoteResponse>>(
    '/api/customer/loyalty/redeem/quote',
    { method: 'POST', body: JSON.stringify(request) },
  );
  if (!response?.data) throw new Error(response?.message || 'Unable to apply loyalty points.');
  return response.data;
}
