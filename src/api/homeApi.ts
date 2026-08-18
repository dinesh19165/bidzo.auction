import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  icon?: string;
  count?: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  status?: string;
  brandId?: number;
  categoryId?: number;
  sellingType?: 'DIRECT_BUY' | 'AUCTION' | null;
  vendorId?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  verified?: boolean;
  location?: string;
  condition?: string;
  seller?: string;
}

export interface AuctionResponse {
  id: number;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  startingPrice: number;
  status?: 'SCHEDULED' | 'RUNNING' | 'ENDED' | 'CANCELLED' | string;
  productId?: number;
  vendorId?: number;
  image?: string;
}

export interface HomeStatsResponse {
  totalProducts: number;
  liveAuctions: number;
  upcomingAuctions: number;
  totalCategories: number;
  totalVendors: number;
  totalCustomers: number;
}

export interface HomeDataResponse {
  stats: HomeStatsResponse;
  categories: CategoryResponse[];
  featuredProducts: ProductResponse[];
  liveAuctions: AuctionResponse[];
  upcomingAuctions: AuctionResponse[];
}

/**
 * Fetch home page data - includes stats, categories, featured products, and auctions
 * This is the recommended endpoint for initial page load
 */
export async function getHomeData(): Promise<HomeDataResponse> {
  const response = await fetchJson<ApiResponse<HomeDataResponse>>('/api/home', { method: 'GET' }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load home data');
  }
  return response.data;
}

/**
 * Fetch featured products
 */
export async function getFeaturedProducts(limit: number = 8): Promise<ProductResponse[]> {
  const response = await fetchJson<ApiResponse<ProductResponse[]>>(
    `/api/home/featured-products?limit=${limit}`,
    { method: 'GET' },
    false
  );
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load featured products');
  }
  return response.data;
}

/**
 * Fetch live auctions
 */
export async function getLiveAuctions(limit: number = 8): Promise<AuctionResponse[]> {
  const response = await fetchJson<ApiResponse<AuctionResponse[]>>(
    `/api/home/live-auctions?limit=${limit}`,
    { method: 'GET' },
    false
  );
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load live auctions');
  }
  return response.data;
}

/**
 * Fetch upcoming auctions
 */
export async function getUpcomingAuctions(limit: number = 8): Promise<AuctionResponse[]> {
  const response = await fetchJson<ApiResponse<AuctionResponse[]>>(
    `/api/home/upcoming-auctions?limit=${limit}`,
    { method: 'GET' },
    false
  );
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load upcoming auctions');
  }
  return response.data;
}

/**
 * Fetch categories
 */
export async function getCategories(): Promise<CategoryResponse[]> {
  const response = await fetchJson<ApiResponse<CategoryResponse[]>>(
    '/api/home/categories',
    { method: 'GET' },
    false
  );
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load categories');
  }
  return response.data;
}

/**
 * Fetch home statistics
 */
export async function getHomeStats(): Promise<HomeStatsResponse> {
  const response = await fetchJson<ApiResponse<HomeStatsResponse>>(
    '/api/home/stats',
    { method: 'GET' },
    false
  );
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load home statistics');
  }
  return response.data;
}
