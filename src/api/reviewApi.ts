import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface ReviewResponse {
  id: number;
  productId: number;
  customerId: number;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewRequest {
  productId: number;
  rating: number;
  title: string;
  content: string;
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
