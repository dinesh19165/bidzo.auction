import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';
import { getCategories, type CategoryRecord } from './categoryApi';
import { getAuctionById, getAuctionImages, getEffectiveAuctionStatus, getProductImages, type AuctionResponse } from './auctionApi';

export type MarketplaceResultType = 'PRODUCT' | 'AUCTION' | 'VENDOR';
export type MarketplaceCategory = CategoryRecord;

export interface MarketplaceVendor {
  id: number;
  name: string;
}

export interface MarketplaceSearchResult {
  id: number;
  type: MarketplaceResultType;
  sellingType?: string | null;
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

function isCurrentAuction(auction: AuctionResponse, now: number): boolean {
  const end = new Date(auction.endAt).getTime();
  if (!Number.isFinite(end) || end <= now) return false;

  const effectiveStatus = getEffectiveAuctionStatus(auction.status, auction.startAt, auction.endAt);
  return effectiveStatus === 'RUNNING' || effectiveStatus === 'SCHEDULED';
}

function hasSearchImage(image: string | null): boolean {
  return Boolean(image?.trim()) && !image?.includes('placeholder.com');
}

export async function deduplicateMarketplaceResults(results: MarketplaceSearchResult[], now = Date.now()): Promise<MarketplaceSearchResult[]> {
  const auctionDetails = new Map<number, AuctionResponse>();
  const enrichedResults = await Promise.all(results.map(async (result) => {
    if (result.type !== 'AUCTION') return result;

    try {
      const auction = await getAuctionById(result.id);
      auctionDetails.set(result.id, auction);

      if (hasSearchImage(result.image)) return result;

      const auctionImages = await getAuctionImages(result.id);
      const auctionImage = auctionImages[0]?.url || null;
      if (auctionImage) return { ...result, image: auctionImage };

      if (auction.productId) {
        const productImages = await getProductImages(auction.productId);
        return { ...result, image: productImages[0]?.url || null };
      }
    } catch {
      return result;
    }

    return result;
  }));

  const groups = new Map<string, MarketplaceSearchResult[]>();
  const order: string[] = [];
  enrichedResults.forEach((result) => {
    const auction = result.type === 'AUCTION' ? auctionDetails.get(result.id) : undefined;
    const productId = result.type === 'PRODUCT' ? result.id : auction?.productId;
    const key = productId == null ? `result:${result.type}:${result.id}` : `product:${productId}`;
    if (!groups.has(key)) order.push(key);
    groups.set(key, [...(groups.get(key) || []), result]);
  });

  return order.map((key) => {
    const group = groups.get(key) || [];
    const preferredAuction = group.find((result) => {
      const auction = result.type === 'AUCTION' ? auctionDetails.get(result.id) : undefined;
      return auction ? isCurrentAuction(auction, now) : false;
    });
    if (preferredAuction) return preferredAuction;

    return group.find((result) => result.type === 'PRODUCT') || group[0];
  });
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
