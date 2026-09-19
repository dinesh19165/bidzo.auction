import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export type OfferType = 'NEW_USER' | 'PRODUCT' | 'CATEGORY' | 'ALL_PRODUCTS' | 'COUPON';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Offer {
  id: number | string;
  name: string;
  description?: string | null;
  offerType: OfferType;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number | null;
  maximumDiscountAmount?: number | null;
  couponCode?: string | null;
  usageLimit?: number | null;
  usageLimitPerCustomer?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  priority: number;
  active: boolean;
  productIds?: number[];
  categoryIds?: number[];
  applicableProducts?: Array<{ id: number | string; name?: string }>;
  applicableCategories?: Array<{ id: number | string; name?: string }>;
  products?: Array<{ id: number | string; name?: string; categoryId?: number | string; categoryName?: string }>;
  categories?: Array<{ id: number | string; name?: string }>;
}

export interface AdminOfferProduct {
  id: number | string;
  name: string;
  categoryId?: number | string | null;
  categoryName?: string | null;
}

export interface AdminOfferCategory {
  id: number | string;
  name: string;
}

export interface OfferRequest {
  name: string;
  description: string;
  offerType: OfferType;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number | null;
  maximumDiscountAmount?: number | null;
  couponCode?: string | null;
  usageLimit?: number | null;
  usageLimitPerCustomer?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  priority: number;
  active: boolean;
  productIds?: number[];
  categoryIds?: number[];
}

export interface OfferValidationRequest {
  offerId?: number | string;
  couponCode?: string;
  orderAmount: number;
  productIds?: number[];
  categoryIds?: number[];
}

export interface OfferValidationResponse {
  valid?: boolean;
  offerId?: number | string | null;
  offer?: Offer | null;
  offerName?: string | null;
  discountAmount: number;
  finalAmount: number;
  message?: string | null;
  couponCode?: string | null;
}

type Envelope<T> = ApiResponse<T> & { content?: T; items?: T };

function unwrap<T>(response: Envelope<T> | T, fallback: string): T {
  if (response && typeof response === 'object') {
    const record = response as Envelope<T>;
    if (record.success === false) throw new Error(backendErrorMessage(record) || fallback);
    if (record.data !== undefined) return record.data as T;
    if (record.content !== undefined) return record.content as T;
    if (record.items !== undefined) return record.items as T;
  }
  if (response === undefined || response === null) throw new Error(fallback);
  return response as T;
}

function backendErrorMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  for (const key of ['message', 'error', 'detail', 'title']) {
    if (typeof record[key] === 'string' && record[key].trim()) return record[key] as string;
  }
  if (Array.isArray(record.errors)) {
    const messages = record.errors.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
    if (messages.length > 0) return messages.join(', ');
  }
  return null;
}

function toIndiaOffsetDateTime(value?: string | null): string | null | undefined {
  if (!value) return value;
  const displayValue = value.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/);
  if (displayValue) {
    const [, day, month, year, hour, minute] = displayValue;
    return `${year}-${month}-${day}T${hour}:${minute}:00+05:30`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00+05:30`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)) {
    return `${value}+05:30`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?[+-]\d{2}:\d{2}$/.test(value)) {
    return value;
  }
  return value;
}

export function normalizeOfferRequest(request: OfferRequest): OfferRequest {
  return {
    ...request,
    startAt: toIndiaOffsetDateTime(request.startAt),
    endAt: toIndiaOffsetDateTime(request.endAt),
  };
}

function listValue<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['offers', 'items', 'content', 'results', 'records', 'data']) {
      if (Array.isArray(record[key])) return record[key] as T[];
      if (record[key] && typeof record[key] === 'object') {
        const nested = listValue<T>(record[key]);
        if (nested.length > 0) return nested;
      }
    }
  }
  return [];
}

function normalizeOffer(value: unknown): Offer | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const id = record.id ?? record.offerId;
  if (id === undefined || id === null) return null;
  const rawType = String(record.offerType ?? record.type ?? 'ALL_PRODUCTS').toUpperCase();
  const rawDiscountType = String(record.discountType ?? 'PERCENTAGE').toUpperCase();
  const categories = Array.isArray(record.categories) ? record.categories : [];
  const products = Array.isArray(record.products) ? record.products : [];
  const categoryIds = Array.isArray(record.categoryIds)
    ? record.categoryIds.map(Number).filter(Number.isFinite)
    : categories.map((category) => Number((category as Record<string, unknown>)?.id)).filter(Number.isFinite);
  const productIds = Array.isArray(record.productIds)
    ? record.productIds.map(Number).filter(Number.isFinite)
    : products.map((product) => Number((product as Record<string, unknown>)?.id)).filter(Number.isFinite);
  const startAt = typeof record.startAt === 'string' ? record.startAt : typeof record.startTime === 'string' ? record.startTime : null;
  const endAt = typeof record.endAt === 'string' ? record.endAt : typeof record.endTime === 'string' ? record.endTime : null;
  return {
    id: id as number | string,
    name: String(record.name ?? record.offerName ?? 'Offer'),
    description: typeof record.description === 'string' ? record.description : null,
    offerType: (['NEW_USER', 'PRODUCT', 'CATEGORY', 'ALL_PRODUCTS', 'COUPON'].includes(rawType) ? rawType : 'ALL_PRODUCTS') as OfferType,
    discountType: (rawDiscountType === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE') as DiscountType,
    discountValue: Number(record.discountValue ?? 0),
    minimumOrderAmount: record.minimumOrderAmount == null ? null : Number(record.minimumOrderAmount),
    maximumDiscountAmount: record.maximumDiscountAmount == null ? null : Number(record.maximumDiscountAmount),
    couponCode: typeof record.couponCode === 'string' ? record.couponCode : null,
    usageLimit: record.usageLimit == null ? null : Number(record.usageLimit),
    usageLimitPerCustomer: record.usageLimitPerCustomer == null ? null : Number(record.usageLimitPerCustomer),
    startAt,
    endAt,
    priority: Number(record.priority ?? 0),
    active: record.active !== false,
    productIds,
    categoryIds,
    applicableProducts: Array.isArray(record.applicableProducts) ? record.applicableProducts as Offer['applicableProducts'] : undefined,
    applicableCategories: Array.isArray(record.applicableCategories) ? record.applicableCategories as Offer['applicableCategories'] : undefined,
    products: products as Offer['products'],
    categories: categories as Offer['categories'],
  };
}

export async function getAdminOffers(): Promise<Offer[]> {
  const response = await fetchJson<unknown>('/api/admin/offers');
  return listValue<Offer>(unwrap(response as Envelope<unknown>, 'Failed to load offers'));
}

export async function getAdminOffer(id: number | string): Promise<Offer> {
  const response = await fetchJson<unknown>(`/api/admin/offers/${encodeURIComponent(id)}`);
  const offer = unwrap<Offer>(response as Envelope<Offer>, backendErrorMessage(response) || 'Failed to load offer');
  if (!offer || typeof offer !== 'object') throw new Error('Failed to load offer: the server returned no offer details.');
  return offer;
}

export async function getAdminOfferProducts(search = ''): Promise<AdminOfferProduct[]> {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const response = await fetchJson<unknown>(`/api/admin/offers/products${query}`);
  return listValue<AdminOfferProduct>(unwrap(response as Envelope<unknown>, 'Failed to load offer products'));
}

export async function getAdminOfferCategories(): Promise<AdminOfferCategory[]> {
  const response = await fetchJson<unknown>('/api/admin/offers/categories');
  return listValue<AdminOfferCategory>(unwrap(response as Envelope<unknown>, 'Failed to load offer categories'));
}

export async function createOffer(request: OfferRequest): Promise<Offer> {
  const response = await fetchJson<unknown>('/api/admin/offers', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(normalizeOfferRequest(request)) });
  return unwrap<Offer>(response as Envelope<Offer>, 'Failed to create offer');
}

export async function updateOffer(id: number | string, request: OfferRequest): Promise<Offer> {
  const response = await fetchJson<unknown>(`/api/admin/offers/${encodeURIComponent(id)}`, { method: 'PUT', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(normalizeOfferRequest(request)) });
  return unwrap<Offer>(response as Envelope<Offer>, 'Failed to update offer');
}

export async function deleteOffer(id: number | string): Promise<void> {
  await fetchJson(`/api/admin/offers/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getVendorOffers(): Promise<Offer[]> {
  const response = await fetchJson<unknown>('/api/vendor/offers');
  return listValue<unknown>(unwrap(response as Envelope<unknown>, 'Failed to load vendor offers'))
    .map(normalizeOffer)
    .filter((offer): offer is Offer => Boolean(offer));
}

export async function getVendorOffer(id: number | string): Promise<Offer> {
  const response = await fetchJson<unknown>(`/api/vendor/offers/${encodeURIComponent(id)}`);
  const offer = normalizeOffer(unwrap<unknown>(response as Envelope<unknown>, backendErrorMessage(response) || 'Failed to load vendor offer'));
  if (!offer) throw new Error('Failed to load vendor offer');
  return offer;
}

export async function createVendorOffer(request: OfferRequest): Promise<Offer> {
  const response = await fetchJson<unknown>('/api/vendor/offers', { method: 'POST', body: JSON.stringify(normalizeOfferRequest(request)) });
  const offer = normalizeOffer(unwrap<unknown>(response as Envelope<unknown>, 'Failed to create vendor offer'));
  if (!offer) throw new Error('Failed to create vendor offer');
  return offer;
}

export async function updateVendorOffer(id: number | string, request: OfferRequest): Promise<Offer> {
  const response = await fetchJson<unknown>(`/api/vendor/offers/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(normalizeOfferRequest(request)) });
  const offer = normalizeOffer(unwrap<unknown>(response as Envelope<unknown>, 'Failed to update vendor offer'));
  if (!offer) throw new Error('Failed to update vendor offer');
  return offer;
}

export async function deleteVendorOffer(id: number | string): Promise<void> {
  await fetchJson(`/api/vendor/offers/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getCustomerOffers(): Promise<Offer[]> {
  const response = await fetchJson<unknown>('/api/customer/offers');
  const rawOffers = listValue<unknown>(unwrap(response as Envelope<unknown>, 'Failed to load available offers'));
  return rawOffers.map(normalizeOffer).filter((offer): offer is Offer => Boolean(offer));
}

export async function validateOffer(request: OfferValidationRequest): Promise<OfferValidationResponse> {
  const response = await fetchJson<unknown>('/api/customer/offers/validate', { method: 'POST', body: JSON.stringify(request) });
  return unwrap<OfferValidationResponse>(response as Envelope<OfferValidationResponse>, 'Unable to validate offer');
}
