import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface CategoryResponse {
  id: number | string;
  name: string;
  description?: string;
  parentId?: number | string | null;
  icon?: string;
  count?: number;
}

export interface ProductResponse {
  id: number | string;
  name: string;
  description?: string;
  price?: number | string | null;
  sku?: string;
  status?: string;
  categoryId?: number | string | null;
  categoryName?: string | null;
  sellingType?: 'DIRECT_BUY' | 'AUCTION' | null;
  vendorId?: number | string | null;
  vendorName?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
  rating?: number | null;
  reviewCount?: number | null;
  reviews?: number | null;
  verified?: boolean;
  location?: string | null;
  condition?: string | null;
  seller?: string | null;
  createdAt?: string | null;
  salesCount?: number | null;
}

export interface AuctionResponse {
  id: number | string;
  title: string;
  productName?: string | null;
  description?: string;
  startAt?: string | null;
  endAt?: string | null;
  startingPrice?: number | string | null;
  currentBid?: number | string | null;
  bidCount?: number | null;
  status?: 'SCHEDULED' | 'RUNNING' | 'ENDED' | 'CANCELLED' | string;
  productId?: number | string | null;
  vendorId?: number | string | null;
  vendorName?: string | null;
  seller?: string | null;
  image?: string | null;
  imageUrl?: string | null;
}

export interface HomeStatsResponse {
  totalProducts?: number | null;
  liveAuctions?: number | null;
  upcomingAuctions?: number | null;
  totalCategories?: number | null;
  totalVendors?: number | null;
  totalCustomers?: number | null;
  [key: string]: number | string | null | undefined;
}

export interface HomeBannerResponse {
  id: number | string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  displayOrder?: number | null;
}

export interface HomeDataResponse {
  stats?: HomeStatsResponse | null;
  banners?: HomeBannerResponse[] | null;
  categories?: CategoryResponse[] | null;
  featuredProducts?: ProductResponse[] | null;
  liveAuctions?: AuctionResponse[] | null;
  endingSoonAuctions?: AuctionResponse[] | null;
  upcomingAuctions?: AuctionResponse[] | null;
  recentProducts?: ProductResponse[] | null;
  popularProducts?: ProductResponse[] | null;
  verifiedSellers?: Array<Record<string, unknown>> | null;
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
  return {
    ...response.data,
    stats: response.data.stats ?? null,
    banners: Array.isArray(response.data.banners) ? response.data.banners : [],
    categories: Array.isArray(response.data.categories) ? response.data.categories : [],
    featuredProducts: Array.isArray(response.data.featuredProducts) ? response.data.featuredProducts : [],
    liveAuctions: Array.isArray(response.data.liveAuctions) ? response.data.liveAuctions : [],
    endingSoonAuctions: Array.isArray(response.data.endingSoonAuctions) ? response.data.endingSoonAuctions : [],
    upcomingAuctions: Array.isArray(response.data.upcomingAuctions) ? response.data.upcomingAuctions : [],
    recentProducts: Array.isArray(response.data.recentProducts) ? response.data.recentProducts : [],
    popularProducts: Array.isArray(response.data.popularProducts) ? response.data.popularProducts : [],
    verifiedSellers: Array.isArray(response.data.verifiedSellers) ? response.data.verifiedSellers : [],
  };
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
