import { fetchJson } from './apiClient';

export type DeliveryShareRequest =
  | { scope: 'SINGLE'; orderId: number; expiresInHours: number }
  | { scope: 'DAY'; date: string }
  | { scope: 'WEEK'; weekOf: string };

export interface DeliveryShareResponse {
  id?: number;
  shareId?: number;
  shareUrl: string;
  expiresAt?: string;
  destinationCount?: number;
}

export interface PublicDeliveryDestination {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  scheduledDeliveryDate?: string | null;
}

export interface PublicDeliveryShareResponse {
  scope?: string;
  destinations?: PublicDeliveryDestination[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  scheduledDeliveryDate?: string | null;
}

type ApiEnvelope<T> = { data?: T; success?: boolean; message?: string };

function unwrap<T>(response: unknown, fallback: string): T {
  if (response && typeof response === 'object' && 'success' in response) {
    const envelope = response as ApiEnvelope<T>;
    if (envelope.success === false) throw new Error(envelope.message || fallback);
    if (envelope.data !== undefined) return envelope.data;
  }
  return response as T;
}

export async function createDeliveryShare(request: DeliveryShareRequest): Promise<DeliveryShareResponse> {
  const response = await fetchJson<unknown>('/api/vendor/delivery-shares', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  const share = unwrap<DeliveryShareResponse>(response, 'Unable to create a delivery share.');
  if (!share || typeof share.shareUrl !== 'string' || !share.shareUrl.trim()) {
    throw new Error('Delivery share response did not include a shareUrl.');
  }
  return share;
}

export async function revokeDeliveryShare(shareId: number): Promise<void> {
  const response = await fetchJson<unknown>(`/api/vendor/delivery-shares/${encodeURIComponent(String(shareId))}/revoke`, { method: 'POST' });
  if (response && typeof response === 'object' && 'success' in response && (response as ApiEnvelope<unknown>).success === false) {
    throw new Error((response as ApiEnvelope<unknown>).message || 'Unable to revoke this delivery link.');
  }
}

export async function getPublicDeliveryShare(token: string): Promise<PublicDeliveryShareResponse> {
  const response = await fetchJson<unknown>(`/api/public/delivery-shares/${encodeURIComponent(token)}`, {}, false);
  return unwrap<PublicDeliveryShareResponse>(response, 'Unable to load this delivery link.');
}
