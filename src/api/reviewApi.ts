import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface ReviewResponse {
  id?: number;
  productId?: number;
  orderId?: number;
  customerId?: number;
  customerName?: string;
  title?: string;
  content?: string;
  rating?: number;
  isVerifiedPurchase?: boolean;
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    name?: string;
  } | null;
}

export interface ReviewRequest {
  orderId?: number;
  productId: number;
  rating: number;
  title: string;
  content: string;
}

export interface ReviewEligibilityResponse {
  eligible?: boolean;
  canReview?: boolean;
  reviewed?: boolean;
  message?: string;
}

export async function createReview(payload: ReviewRequest): Promise<ReviewResponse> {
  const response = await fetchJson<ApiResponse<ReviewResponse>>('/api/customer/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to create review');
  }
  return response.data;
}

export async function getReviewEligibility(orderId: number, productId: number): Promise<ReviewEligibilityResponse> {
  const endpoints = [
    `/api/customer/reviews/eligibility?orderId=${encodeURIComponent(orderId)}&productId=${encodeURIComponent(productId)}`,
    `/api/customer/reviews/check?orderId=${encodeURIComponent(orderId)}&productId=${encodeURIComponent(productId)}`,
    `/api/customer/reviews/order/${encodeURIComponent(orderId)}/product/${encodeURIComponent(productId)}`,
  ];

  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetchJson<ApiResponse<ReviewEligibilityResponse> | ReviewEligibilityResponse>(endpoint, { method: 'GET' });
      const payload = 'data' in response && response.data ? response.data : response;
      if (payload && typeof payload === 'object') {
        return payload as ReviewEligibilityResponse;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error && lastError.message) {
    return { eligible: true, canReview: true, reviewed: false, message: lastError.message };
  }

  return { eligible: true, canReview: true, reviewed: false };
}

export async function getReviews(): Promise<ReviewResponse[]> {
  const response = await fetchJson<ApiResponse<ReviewResponse[]>>('/api/customer/reviews', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load reviews');
  }
  return response.data;
}

export async function getReviewsPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: ReviewResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: ReviewResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/reviews/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load reviews');
  }
  return response.data;
}

export async function getReviewById(reviewId: number): Promise<ReviewResponse> {
  const response = await fetchJson<ApiResponse<ReviewResponse>>(`/api/customer/reviews/${reviewId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load review');
  }
  return response.data;
}

export async function updateReview(reviewId: number, payload: ReviewRequest): Promise<ReviewResponse> {
  const response = await fetchJson<ApiResponse<ReviewResponse>>(`/api/customer/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to update review');
  }
  return response.data;
}

export async function deleteReview(reviewId: number): Promise<void> {
  await fetchJson<ApiResponse<void>>(`/api/customer/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}

export async function getProductReviews(productId: number): Promise<ReviewResponse[]> {
  const response = await fetchJson<ApiResponse<ReviewResponse[]>>(`/api/customer/reviews/product/${productId}`, {
    method: 'GET',
  }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load product reviews');
  }
  return response.data;
}

export async function getProductReviewsPaginated(productId: number, page: number = 1, pageSize: number = 10): Promise<{ data: ReviewResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: ReviewResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/reviews/product/${productId}/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load product reviews');
  }
  return response.data;
}
