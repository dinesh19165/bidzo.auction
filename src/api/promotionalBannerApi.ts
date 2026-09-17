import { fetchJson } from './apiClient';

export interface PromotionalBanner {
  id: number | string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  imagePublicId?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  displayOrder: number;
  active: boolean;
}

export interface PromotionalBannerInput {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  active: boolean;
  imagePublicId?: string;
}

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

function unwrap<T>(response: ApiEnvelope<T> | T, fallback: string): T {
  if (response && typeof response === 'object' && 'data' in response && response.data !== undefined) {
    return response.data as T;
  }
  if (response === undefined || response === null) {
    throw new Error(fallback);
  }
  return response as T;
}

function normalizeList(value: PromotionalBanner[] | { content?: PromotionalBanner[] } | null | undefined): PromotionalBanner[] {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.content) ? value.content : [];
}

export async function getPublicPromotionalBanners(): Promise<PromotionalBanner[]> {
  const response = await fetchJson<ApiEnvelope<PromotionalBanner[]>>('/api/promotional-banners', { method: 'GET' }, false);
  return normalizeList(unwrap(response, 'Failed to load promotional banners'));
}

export async function getAdminPromotionalBanners(): Promise<PromotionalBanner[]> {
  const response = await fetchJson<ApiEnvelope<PromotionalBanner[] | { content?: PromotionalBanner[] }>>('/api/admin/promotional-banners');
  return normalizeList(unwrap(response, 'Failed to load promotional banners'));
}

export async function createPromotionalBanner(input: PromotionalBannerInput): Promise<PromotionalBanner> {
  const response = await fetchJson<ApiEnvelope<PromotionalBanner>>('/api/admin/promotional-banners', { method: 'POST', body: JSON.stringify(input) });
  return unwrap(response, 'Failed to create promotional banner');
}

export async function updatePromotionalBanner(id: number | string, input: PromotionalBannerInput): Promise<PromotionalBanner> {
  const response = await fetchJson<ApiEnvelope<PromotionalBanner>>(`/api/admin/promotional-banners/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) });
  return unwrap(response, 'Failed to update promotional banner');
}

export async function deletePromotionalBanner(id: number | string): Promise<void> {
  await fetchJson(`/api/admin/promotional-banners/${encodeURIComponent(id)}`, { method: 'DELETE' });
}