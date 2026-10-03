import { fetchJson } from './apiClient';

export interface PublicAdvertisementResponse {
  id: number;
  advertisementCode?: string;
  advertisementType?: string;
  placement?: string;
  title?: string;
  description?: string;
  bannerImageUrl?: string;
  mobileBannerImageUrl?: string;
  targetUrl?: string;
  startDate?: string;
  endDate?: string;
  productId?: number;
  product?: unknown;
  categoryId?: number;
  category?: unknown;
  vendorId?: number;
  vendor?: unknown;
}

interface PublicAdvertisementEnvelope {
  success?: boolean;
  message?: string;
  data?: PublicAdvertisementResponse[] | { content?: PublicAdvertisementResponse[]; items?: PublicAdvertisementResponse[] };
}

async function getPublicAdvertisements(path: string): Promise<PublicAdvertisementResponse[]> {
  const response = await fetchJson<PublicAdvertisementEnvelope | PublicAdvertisementResponse[]>(path, { method: 'GET' }, false);
  if (Array.isArray(response)) return response;
  if (response?.success === false) throw new Error(response.message || 'Failed to load advertisements');
  if (Array.isArray(response?.data)) return response.data;
  if (response?.data && typeof response.data === 'object') {
    if (Array.isArray(response.data.items)) return response.data.items;
    if (Array.isArray(response.data.content)) return response.data.content;
  }
  return [];
}

export function getHomeBannerAdvertisements(): Promise<PublicAdvertisementResponse[]> {
  return getPublicAdvertisements('/api/advertisements/home-banners');
}

export function getCategoryPromotionAdvertisements(categoryId: number | string): Promise<PublicAdvertisementResponse[]> {
  const params = new URLSearchParams({ categoryId: String(categoryId) });
  return getPublicAdvertisements(`/api/advertisements/category-promotions?${params.toString()}`);
}

export function getProductPromotionAdvertisements(productId: number | string): Promise<PublicAdvertisementResponse[]> {
  const params = new URLSearchParams({ productId: String(productId) });
  return getPublicAdvertisements(`/api/advertisements/product-promotions?${params.toString()}`);
}

export type AdvertisementType =
  | 'PRODUCT_PROMOTION'
  | 'STORE_PROMOTION'
  | 'BANNER'
  | 'HOMEPAGE_BANNER'
  | 'CATEGORY_BANNER'
  | string;

export type AdvertisementStatus =
  | 'DRAFT'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFICATION'
  | 'PENDING_FRANCHISE_REVIEW'
  | 'FRANCHISE_REJECTED'
  | 'FRANCHISE_APPROVED'
  | 'PENDING_SUPER_ADMIN_REVIEW'
  | 'SUPER_ADMIN_REJECTED'
  | 'PUBLISHED'
  | 'EXPIRED'
  | 'CANCELLED'
  | string;

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | string;

export type AdvertisementPricingType = 'PRODUCT_PROMOTION' | 'CATEGORY_BANNER' | 'HOMEPAGE_BANNER';

export interface AdvertisementPricing {
  type: AdvertisementPricingType;
  pricePerDay?: number | string | null;
}

export interface AdvertisementRecord {
  id?: number | string;
  advertisementId?: number | string;
  title?: string;
  description?: string;
  placeholder?: string;
  status?: AdvertisementStatus;
  advertisementStatus?: AdvertisementStatus;
  paymentStatus?: PaymentStatus;
  paymentStatusName?: PaymentStatus;
  paymentStatusText?: string;
  advertisementType?: AdvertisementType;
  type?: AdvertisementType;
  placement?: string;
  targetUrl?: string;
  bannerImageUrl?: string;
  bannerImagePublicId?: string;
  mobileBannerImageUrl?: string | null;
  mobileBannerImagePublicId?: string | null;
  amount?: number | string;
  pricePerDay?: number | string;
  numberOfDays?: number;
  currency?: string;
  startDate?: string;
  startAt?: string;
  endDate?: string;
  endAt?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  rejectionReason?: string;
  reason?: string;
  vendor?: Record<string, unknown> | null;
  vendorId?: number | string | null;
  categoryId?: number | string | null;
  franchise?: Record<string, unknown> | null;
  franchiseId?: number | string | null;
  product?: Record<string, unknown> | null;
  productId?: number | string | null;
  productName?: string;
  storeName?: string;
  paymentReference?: string;
  paymentRef?: string;
  paymentOrderId?: string;
  paymentId?: string;
  paymentData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AdvertisementRequest {
  advertisementType?: AdvertisementType;
  type?: AdvertisementType;
  title?: string;
  description?: string;
  placement?: string;
  targetUrl?: string;
  bannerImageUrl?: string;
  bannerImagePublicId?: string;
  mobileBannerImageUrl?: string | null;
  mobileBannerImagePublicId?: string | null;
  productId?: number | string | null;
  categoryId?: number | string | null;
  product?: Record<string, unknown> | null;
  startDate?: string;
  startAt?: string;
  endDate?: string;
  endAt?: string;
  reason?: string;
  rejectionReason?: string;
  [key: string]: unknown;
}

export interface AdvertisementPaymentSession {
  id?: number | string;
  advertisementId?: number | string;
  amount?: number | string;
  pricePerDay?: number | string;
  numberOfDays?: number;
  currency?: string;
  razorpayKeyId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderId?: string | number;
  paymentRequired?: boolean;
  message?: string;
  [key: string]: unknown;
}

function isAdvertisementPricingType(value: unknown): value is AdvertisementPricingType {
  return value === 'PRODUCT_PROMOTION' || value === 'CATEGORY_BANNER' || value === 'HOMEPAGE_BANNER';
}

function pricingEntries(value: unknown): AdvertisementPricing[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => pricingEntries(item));
  }
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  const type = record.type ?? record.advertisementType;
  if (isAdvertisementPricingType(type)) {
    return [{ type, pricePerDay: record.pricePerDay as number | string | null | undefined }];
  }
  for (const key of ['data', 'content', 'items', 'results', 'pricing', 'advertisementPricing']) {
    if (record[key] !== undefined) {
      const entries = pricingEntries(record[key]);
      if (entries.length) return entries;
    }
  }
  return Object.entries(record).flatMap(([key, entry]) => {
    if (!isAdvertisementPricingType(key)) return [];
    if (entry && typeof entry === 'object') {
      const pricePerDay = (entry as Record<string, unknown>).pricePerDay;
      return [{ type: key, pricePerDay: pricePerDay as number | string | null | undefined }];
    }
    return [{ type: key, pricePerDay: entry as number | string | null | undefined }];
  });
}

function extractBody<T>(response: unknown, fallback: string): T {
  if (!response || typeof response !== 'object') throw new Error(fallback);
  const body = response as Record<string, unknown>;
  if (body.success === false) {
    throw new Error(String(body.message || body.error || fallback));
  }

  if ('data' in body && body.data !== undefined) return body.data as T;
  if ('content' in body && body.content !== undefined) return body.content as T;
  if ('result' in body && body.result !== undefined) return body.result as T;
  if ('advertisement' in body && body.advertisement !== undefined) return body.advertisement as T;
  if ('advertisements' in body && Array.isArray(body.advertisements)) return body.advertisements as T;
  if ('items' in body && body.items !== undefined) return body.items as T;
  return response as T;
}

function listValue(value: unknown): AdvertisementRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is AdvertisementRecord => !!item && typeof item === 'object') as AdvertisementRecord[];
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  for (const key of ['items', 'content', 'results', 'records', 'advertisements', 'data']) {
    const nested = listValue(record[key]);
    if (nested.length > 0) return nested;
  }
  return [];
}

export function normalizeAdvertisement(value: unknown): AdvertisementRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const advertisement = record.advertisement && typeof record.advertisement === 'object' ? record.advertisement as Record<string, unknown> : undefined;
  const banner = record.banner && typeof record.banner === 'object' ? record.banner as Record<string, unknown> : undefined;
  const payment = record.payment && typeof record.payment === 'object' ? record.payment as Record<string, unknown> : undefined;
  const vendor = record.vendor && typeof record.vendor === 'object' ? record.vendor as Record<string, unknown> : undefined;
  const franchise = record.franchise && typeof record.franchise === 'object' ? record.franchise as Record<string, unknown> : undefined;
  const product = record.product && typeof record.product === 'object' ? record.product as Record<string, unknown> : undefined;
  const paymentList = Array.isArray(record.payments) ? record.payments.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object') : [];
  const id = (record.id ?? record.advertisementId ?? advertisement?.id ?? null) as number | string | null | undefined;
  if (id === null && !record.title && !record.description && !record.status && !record.advertisementType && !record.type) {
    return null;
  }

  return {
    ...record,
    id: id ?? undefined,
    advertisementId: (record.advertisementId ?? record.id ?? advertisement?.id ?? id ?? undefined) as number | string | undefined,
    advertisementType: String(record.advertisementType ?? record.type ?? advertisement?.type ?? '').trim() || undefined,
    type: String(record.type ?? record.advertisementType ?? advertisement?.type ?? '').trim() || undefined,
    title: String(record.title ?? record.name ?? advertisement?.title ?? '').trim() || 'Advertisement',
    description: String(record.description ?? advertisement?.description ?? '').trim() || undefined,
    status: String(record.status ?? record.advertisementStatus ?? record.currentStatus ?? record.state ?? '').trim().toUpperCase() || undefined,
    advertisementStatus: String(record.advertisementStatus ?? record.status ?? record.currentStatus ?? record.state ?? '').trim().toUpperCase() || undefined,
    paymentStatus: String(record.paymentStatus ?? record.paymentStatusName ?? record.paymentState ?? payment?.status ?? '').trim().toUpperCase() || undefined,
    paymentStatusName: String(record.paymentStatusName ?? record.paymentStatus ?? record.paymentState ?? '').trim().toUpperCase() || undefined,
    amount: (record.amount ?? record.totalAmount ?? record.price ?? advertisement?.amount) as number | string | undefined,
    pricePerDay: (record.pricePerDay ?? advertisement?.pricePerDay) as number | string | undefined,
    numberOfDays: (record.numberOfDays ?? advertisement?.numberOfDays) as number | undefined,
    currency: String(record.currency ?? record.amountCurrency ?? advertisement?.currency ?? 'INR').trim() || 'INR',
    placement: String(record.placement ?? record.location ?? advertisement?.placement ?? '').trim() || undefined,
    targetUrl: String(record.targetUrl ?? record.url ?? record.redirectUrl ?? record.link ?? advertisement?.targetUrl ?? '').trim() || undefined,
    bannerImageUrl: String(record.bannerImageUrl ?? record.imageUrl ?? record.bannerUrl ?? banner?.imageUrl ?? advertisement?.bannerImageUrl ?? '').trim() || undefined,
    bannerImagePublicId: String(record.bannerImagePublicId ?? record.imagePublicId ?? banner?.publicId ?? advertisement?.bannerImagePublicId ?? '').trim() || undefined,
    mobileBannerImageUrl: ('mobileBannerImageUrl' in record ? record.mobileBannerImageUrl : advertisement?.mobileBannerImageUrl) as string | null | undefined,
    mobileBannerImagePublicId: ('mobileBannerImagePublicId' in record ? record.mobileBannerImagePublicId : advertisement?.mobileBannerImagePublicId) as string | null | undefined,
    productId: (record.productId ?? product?.id ?? advertisement?.productId ?? undefined) as number | string | null | undefined,
    categoryId: (record.categoryId ?? (record.category && typeof record.category === 'object' ? (record.category as Record<string, unknown>).id : undefined) ?? advertisement?.categoryId ?? undefined) as number | string | null | undefined,
    productName: String(record.productName ?? product?.name ?? record.storeName ?? advertisement?.productName ?? '').trim() || undefined,
    vendorId: (record.vendorId ?? vendor?.id ?? undefined) as number | string | null | undefined,
    franchiseId: (record.franchiseId ?? franchise?.id ?? undefined) as number | string | null | undefined,
    paymentReference: String(record.paymentReference ?? record.paymentRef ?? payment?.paymentRef ?? record.paymentId ?? paymentList[0]?.paymentRef ?? '').trim() || undefined,
    rejectionReason: String(record.rejectionReason ?? record.reason ?? record.adminReason ?? record.franchiseRejectionReason ?? record.superAdminRejectionReason ?? '').trim() || undefined,
  };
}

export async function getVendorAdvertisements(): Promise<AdvertisementRecord[]> {
  const response = await fetchJson<unknown>('/api/vendor/advertisements');
  return listValue(extractBody<unknown>(response, 'Failed to load vendor advertisements'))
    .map((entry) => normalizeAdvertisement(entry))
    .filter((entry): entry is AdvertisementRecord => Boolean(entry));
}

export async function getVendorAdvertisement(id: number | string): Promise<AdvertisementRecord> {
  const response = await fetchJson<unknown>(`/api/vendor/advertisements/${encodeURIComponent(String(id))}`);
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to load advertisement'));
  if (!record) throw new Error('Failed to load advertisement');
  return record;
}

export async function createVendorAdvertisement(payload: AdvertisementRequest): Promise<AdvertisementRecord> {
  const cleaned: Record<string, unknown> = { ...payload };
  delete cleaned.amount;
  const removedMobileImage = payload.mobileBannerImageUrl === null && payload.mobileBannerImagePublicId === null;
  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];
    if (removedMobileImage && (key === 'mobileBannerImageUrl' || key === 'mobileBannerImagePublicId')) return;
    if (value === undefined || value === null || value === '') delete cleaned[key];
  });

  const response = await fetchJson<unknown>('/api/vendor/advertisements', {
    method: 'POST',
    body: JSON.stringify(cleaned),
  });
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to create advertisement'));
  if (!record) throw new Error('Failed to create advertisement');
  return record;
}

export async function updateVendorAdvertisement(id: number | string, payload: AdvertisementRequest): Promise<AdvertisementRecord> {
  const cleaned: Record<string, unknown> = { ...payload };
  delete cleaned.amount;
  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];
    if ((key === 'mobileBannerImageUrl' || key === 'mobileBannerImagePublicId') && value === null) return;
    if (value === undefined || value === null || value === '') delete cleaned[key];
  });

  const response = await fetchJson<unknown>(`/api/vendor/advertisements/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    body: JSON.stringify(cleaned),
  });
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to update advertisement'));
  if (!record) throw new Error('Failed to update advertisement');
  return record;
}

export async function getFranchiseAdvertisements(): Promise<AdvertisementRecord[]> {
  const response = await fetchJson<unknown>('/api/franchise/advertisements');
  return listValue(extractBody<unknown>(response, 'Failed to load franchise advertisements'))
    .map((entry) => normalizeAdvertisement(entry))
    .filter((entry): entry is AdvertisementRecord => Boolean(entry));
}

export async function getFranchiseAdvertisement(id: number | string): Promise<AdvertisementRecord> {
  const response = await fetchJson<unknown>(`/api/franchise/advertisements/${encodeURIComponent(String(id))}`);
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to load franchise advertisement'));
  if (!record) throw new Error('Failed to load franchise advertisement');
  return record;
}

export async function approveFranchiseAdvertisement(id: number | string): Promise<AdvertisementRecord> {
  const response = await fetchJson<unknown>(`/api/franchise/advertisements/${encodeURIComponent(String(id))}/approve`, { method: 'POST' });
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to approve advertisement'));
  if (!record) return getFranchiseAdvertisement(id);
  return record;
}

export async function rejectFranchiseAdvertisement(id: number | string, reason: string): Promise<AdvertisementRecord> {
  const response = await fetchJson<unknown>(`/api/franchise/advertisements/${encodeURIComponent(String(id))}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to reject advertisement'));
  if (!record) return getFranchiseAdvertisement(id);
  return record;
}

export async function getAdminAdvertisements(): Promise<AdvertisementRecord[]> {
  const response = await fetchJson<unknown>('/api/admin/advertisements');
  return listValue(extractBody<unknown>(response, 'Failed to load admin advertisements'))
    .map((entry) => normalizeAdvertisement(entry))
    .filter((entry): entry is AdvertisementRecord => Boolean(entry));
}

export async function getAdminAdvertisementPricing(): Promise<AdvertisementPricing[]> {
  const response = await fetchJson<unknown>('/api/admin/advertisement-pricing');
  return pricingEntries(extractBody<unknown>(response, 'Failed to load advertisement pricing'));
}

export async function updateAdminAdvertisementPricing(type: AdvertisementPricingType, pricePerDay: number): Promise<AdvertisementPricing> {
  const response = await fetchJson<unknown>(`/api/admin/advertisement-pricing/${encodeURIComponent(type)}`, {
    method: 'PUT',
    body: JSON.stringify({ pricePerDay }),
  });
  const entries = pricingEntries(extractBody<unknown>(response, 'Failed to update advertisement pricing'));
  return entries.find((entry) => entry.type === type) ?? { type, pricePerDay };
}

export async function getAdminAdvertisement(id: number | string): Promise<AdvertisementRecord> {
  const response = await fetchJson<unknown>(`/api/admin/advertisements/${encodeURIComponent(String(id))}`);
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to load admin advertisement'));
  if (!record) throw new Error('Failed to load admin advertisement');
  return record;
}

export async function approveAdminAdvertisement(id: number | string): Promise<AdvertisementRecord> {
  const response = await fetchJson<unknown>(`/api/admin/advertisements/${encodeURIComponent(String(id))}/approve-publishing`, { method: 'POST' });
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to approve advertisement for publishing'));
  if (!record) return getAdminAdvertisement(id);
  return record;
}

export async function rejectAdminAdvertisement(id: number | string, reason: string): Promise<AdvertisementRecord> {
  const response = await fetchJson<unknown>(`/api/admin/advertisements/${encodeURIComponent(String(id))}/reject-publishing`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to reject advertisement for publishing'));
  if (!record) return getAdminAdvertisement(id);
  return record;
}

export async function publishAdminAdvertisement(id: number | string): Promise<AdvertisementRecord> {
  const response = await fetchJson<unknown>(`/api/admin/advertisements/${encodeURIComponent(String(id))}/publish`, { method: 'POST' });
  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to publish advertisement'));
  if (!record) return getAdminAdvertisement(id);
  return record;
}

export async function createAdvertisementRazorpayOrder(
  id: number | string,
  payload: { paymentProvider?: string } = {},
): Promise<AdvertisementPaymentSession> {
  const response = await fetchJson<unknown>(`/api/vendor/advertisements/${encodeURIComponent(String(id))}/payments/razorpay`, {
    method: 'POST',
    body: JSON.stringify({
      paymentProvider: String(payload.paymentProvider ?? 'RAZORPAY'),
    }),
  });

  const value = extractBody<AdvertisementPaymentSession | Record<string, unknown>>(response, 'Failed to create Razorpay order for advertisement');
  if (!value || typeof value !== 'object') {
    throw new Error('Failed to create Razorpay order for advertisement');
  }

  return value as AdvertisementPaymentSession;
}

export async function verifyAdvertisementPayment(id: number | string, payload: Record<string, unknown>): Promise<AdvertisementRecord> {
  const amountValue = Number(payload.amount ?? payload.totalAmount ?? 0);
  const currencyValue = String(payload.currency ?? 'INR');
  const reasonValue = String(payload.paymentReference ?? payload.razorpayPaymentId ?? payload.paymentId ?? '');

  const response = await fetchJson<unknown>(`/api/vendor/advertisements/${encodeURIComponent(String(id))}/payment`, {
    method: 'POST',
    body: JSON.stringify({
      paymentProvider: String(payload.paymentProvider ?? 'RAZORPAY'),
      paymentReference: reasonValue,
      amount: amountValue,
      currency: currencyValue,
      razorpayPaymentId: payload.razorpayPaymentId ?? undefined,
      razorpayOrderId: payload.razorpayOrderId ?? undefined,
      razorpaySignature: payload.razorpaySignature ?? undefined,
    }),
  });

  const record = normalizeAdvertisement(extractBody<unknown>(response, 'Failed to verify advertisement payment'));
  if (!record) return getVendorAdvertisement(id);
  return record;
}
