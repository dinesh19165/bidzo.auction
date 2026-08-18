import { API_BASE_URL, fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface ProductApiImageResponse {
  id: number;
  url: string;
  altText?: string | null;
  productId?: number | null;
}

export interface CreateProductImageRequest {
  url: string;
  altText?: string | null;
}

export interface ProductApiResponse {
  id: number;
  name: string;
  description: string;
  price: string | number;
  sku: string;
  status?: string;
  brandId?: number | null;
  categoryId?: number | null;
  sellingType?: string | null;
  vendorId?: number | null;
  image?: string | null;
  imageUrl?: string | null;
  images?: Array<{ url?: string | null; imageUrl?: string | null }> | string[] | null;
}

export interface ProductListItem {
  id: number;
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  seller: string;
  rating: number;
  verified: boolean;
  image: string;
  location: string;
  badge?: string;
  reviews: number;
  sku: string;
  brandId?: number | null;
  categoryId?: number | null;
  sellingType?: string;
  isAuction: boolean;
  isDirectBuy: boolean;
  gallery?: string[];
  stock?: number;
  specifications?: Array<{ label: string; value: string }>;
  qna?: Array<{ question: string; answer: string }>;
  auctionId?: number;
  route?: string;
  actionLabel?: string;
  currentBid?: string;
  endsIn?: string;
}

const DEFAULT_PRODUCT_IMAGE = '/logo.png';

function formatPrice(value: string | number): string {
  const raw = typeof value === 'string' ? value : String(value);
  const amount = Number(raw);
  if (Number.isFinite(amount)) {
    return amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
  return raw;
}

function normalizeSellingType(value?: string | null): 'AUCTION' | 'DIRECT_BUY' | 'UNKNOWN' {
  const normalized = (value || '').trim().toUpperCase();
  if (normalized === 'AUCTION') return 'AUCTION';
  if (normalized === 'DIRECT_BUY') return 'DIRECT_BUY';
  return 'UNKNOWN';
}

function resolveImageUrl(value?: string | null): string {
  if (!value) return DEFAULT_PRODUCT_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
}

function findPrimaryProductImage(response: ProductApiResponse): string {
  const directImage = response.imageUrl || response.image || null;
  if (Array.isArray(response.images)) {
    const firstImage = response.images[0];
    if (typeof firstImage === 'string') {
      return resolveImageUrl(firstImage);
    }
    if (firstImage && (firstImage.url || firstImage.imageUrl)) {
      return resolveImageUrl(firstImage.url || firstImage.imageUrl || null);
    }
  }
  return resolveImageUrl(directImage);
}

function mapProduct(response: ProductApiResponse, imageOverride?: string): ProductListItem {
  const price = formatPrice(response.price);
  const status = response.status || 'ACTIVE';
  const statusLower = status.toLowerCase();
  const sellingType = normalizeSellingType(response.sellingType);
  const isAuction = sellingType === 'AUCTION' || statusLower.includes('auction');
  const isDirectBuy = sellingType === 'DIRECT_BUY' || statusLower.includes('buy');
  const badge = isAuction ? 'Live Auction' : isDirectBuy ? 'Buy Now' : undefined;

  return {
    id: response.id,
    title: response.name,
    description: response.description || 'No description available for this product.',
    price,
    category: response.categoryId != null ? `Category ${response.categoryId}` : 'General',
    condition: isAuction ? 'Auction' : isDirectBuy ? 'Buy Now' : status.replace(/_/g, ' ').toUpperCase(),
    seller: response.brandId != null ? `Brand ${response.brandId}` : (response.vendorId != null ? `Vendor ${response.vendorId}` : 'Verified seller'),
    rating: 4.8,
    verified: statusLower === 'published' || statusLower === 'active',
    image: imageOverride || findPrimaryProductImage(response),
    location: 'India',
    badge,
    reviews: 124,
    sku: response.sku,
    brandId: response.brandId,
    categoryId: response.categoryId,
    sellingType: sellingType === 'UNKNOWN' ? undefined : sellingType,
    isAuction,
    isDirectBuy,
  };
}

export async function createProductImage(productId: number, payload: CreateProductImageRequest): Promise<ProductApiImageResponse> {
  const response = await fetchJson<ApiResponse<ProductApiImageResponse>>(`/api/products/${productId}/images`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);

  if (!response?.data) {
    throw new Error(response?.message || 'Failed to save product image');
  }

  return response.data;
}

export async function getProductImages(productId: number): Promise<ProductApiImageResponse[]> {
  const response = await fetchJson<ApiResponse<ProductApiImageResponse[]>>(`/api/products/${productId}/images`, {
    method: 'GET',
  }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load product images');
  }
  return response.data;
}

export async function getProducts(): Promise<ProductListItem[]> {
  const response = await fetchJson<ApiResponse<ProductApiResponse[]>>('/api/products', {
    method: 'GET',
  }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load products');
  }

  const products = await Promise.all(response.data.map(async (product) => {
    try {
      const productImages = await getProductImages(product.id);
      const primaryImage = productImages[0]?.url ? resolveImageUrl(productImages[0].url) : undefined;
      return mapProduct(product, primaryImage);
    } catch {
      return mapProduct(product);
    }
  }));

  return products;
}

export async function getProductById(id: number): Promise<ProductListItem> {
  const response = await fetchJson<ApiResponse<ProductApiResponse>>(`/api/products/${id}`, {
    method: 'GET',
  }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load product');
  }

  try {
    const images = await getProductImages(id);
    const primaryImage = images[0]?.url ? resolveImageUrl(images[0].url) : undefined;
    return mapProduct(response.data, primaryImage);
  } catch {
    return mapProduct(response.data);
  }
}

export async function createBuyNowOrder(productId: number): Promise<any> {
  const response = await fetchJson<ApiResponse<any>>(`/api/products/${productId}/buy-now`, {
    method: 'POST',
    body: JSON.stringify({ quantity: 1 }),
  });
  
  // Handle different response structures
  const orderData = response?.data || (response as any);
  
  if (!orderData) {
    throw new Error((response as any)?.message || 'Failed to create buy-now order');
  }
  
  // Ensure we have an order ID
  if (!orderData.id && !orderData.orderId) {
    throw new Error('Invalid order response: missing order ID');
  }
  
  // Normalize the response to have an 'id' field
  return {
    ...orderData,
    id: orderData.id || orderData.orderId,
  };
}
