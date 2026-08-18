import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface BidResponse {
  id: number;
  amount: string;
  placedAt: string;
  status: string;
  auctionId: number;
  userId: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface BidRequest {
  amount: string;
}

export async function getAuctionBids(
  auctionId: number
): Promise<BidResponse[]> {
  const response = await fetchJson<ApiResponse<BidResponse[]>>(
    `/api/auctions/${auctionId}/bids`,
    { method: 'GET' }
  );

  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load auction bids');
  }

  return response.data;
}

export async function getBidById(id: number): Promise<BidResponse> {
  const response = await fetchJson<ApiResponse<BidResponse>>(
    `/api/bids/${id}`,
    { method: 'GET' }
  );

  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load bid');
  }

  return response.data;
}

export async function getMyBids(): Promise<BidResponse[]> {
  const response = await fetchJson<ApiResponse<BidResponse[]>>(
    `/api/customer/bids`,
    { method: 'GET' }
  );

  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load your bids');
  }

  return response.data;
}

export async function placeBid(
  auctionId: number,
  amount: number
): Promise<BidResponse> {
  const response = await fetchJson<ApiResponse<BidResponse>>(
    `/api/auctions/${auctionId}/bids`,
    {
      method: 'POST',
      body: JSON.stringify({
        amount: amount.toString(),
      }),
    }
  );

  if (!response?.data) {
    throw new Error(response?.message || 'Failed to place bid');
  }

  return response.data;
}