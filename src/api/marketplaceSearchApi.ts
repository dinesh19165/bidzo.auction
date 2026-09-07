import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';
import { getCategories, type CategoryRecord } from './categoryApi';

export type MarketplaceResultType = 'PRODUCT' | 'AUCTION' | 'VENDOR';
export type MarketplaceCategory = CategoryRecord;

export interface MarketplaceVendor {
  id: number;
  name: string;
}

export interface MarketplaceSearchResult {
  id: number;
  type: MarketplaceResultType;
  title: string;
  image: string | null;
  price: number | null;
  currentBid: number | null;
  category: MarketplaceCategory | null;
  vendor: MarketplaceVendor | null;
  auctionStatus: string | null;
  auctionEndsAt: string | null;
}

export interface MarketplaceSearchPage {
  content: MarketplaceSearchResult[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const getMarketplaceCategories = getCategories;

export interface MarketplaceSearchOptions {
  query?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  rating?: string;
  verifiedSellersOnly?: boolean;
  auctionsOnly?: boolean;
  buyNowOnly?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export async function searchMarketplace(options: MarketplaceSearchOptions = {}): Promise<MarketplaceSearchPage> {
  const params = new URLSearchParams({ page: String(options.page ?? 0), size: String(options.size ?? 20), sort: options.sort || 'relevance' });
  const textParams: Array<[string, string | undefined]> = [
    ['q', options.query],
    ['category', options.category],
    ['minPrice', options.minPrice],
    ['maxPrice', options.maxPrice],
    ['seller', options.seller],
    ['rating', options.rating],
  ];
  textParams.forEach(([key, value]) => {
    const trimmed = value?.trim();
    if (trimmed && !(key === 'category' && trimmed === 'All Categories')) params.set(key, trimmed);
  });
  if (options.verifiedSellersOnly) params.set('verifiedSellersOnly', 'true');
  if (options.auctionsOnly) params.set('auctionsOnly', 'true');
  if (options.buyNowOnly) params.set('buyNowOnly', 'true');

  const response = await fetchJson<ApiResponse<MarketplaceSearchPage>>(`/api/marketplace/search?${params.toString()}`, { method: 'GET' }, false);
  if (!response?.data) throw new Error(response?.message || 'Marketplace search failed');
  return response.data;
}
