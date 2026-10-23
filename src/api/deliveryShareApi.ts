import { fetchJson } from './apiClient';
import type { DeliveryPersonOrderStatus, OrderStatusUpdateResponse } from './vendorOrderApi';
import { toFrontendDeliveryShareUrl } from '../utils/deliveryShareLink';

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
  orderId: number;
  orderNumber: string;
  productNames: string[];
  orderStatus: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationVerificationRequired: boolean;
  mapUrl?: string | null;
  scheduledDeliveryDate?: string | null;
}

export interface PublicDeliveryShareResponse {
  scope: string;
  destinations: PublicDeliveryDestination[];
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
  if (typeof window === 'undefined') {
    throw new Error('Unable to create a delivery link outside the browser.');
  }
  return { ...share, shareUrl: toFrontendDeliveryShareUrl(share.shareUrl, window.location.origin) };
}

export async function revokeDeliveryShare(shareId: number): Promise<void> {
  const response = await fetchJson<unknown>(`/api/vendor/delivery-shares/${encodeURIComponent(String(shareId))}/revoke`, { method: 'POST' });
  if (response && typeof response === 'object' && 'success' in response && (response as ApiEnvelope<unknown>).success === false) {
    throw new Error((response as ApiEnvelope<unknown>).message || 'Unable to revoke this delivery link.');
  }
}

export async function getPublicDeliveryShare(token: string): Promise<PublicDeliveryShareResponse> {
  const response = await fetchJson<unknown>(`/api/public/delivery-shares/${encodeURIComponent(token)}`, {}, false);
  const share = unwrap<unknown>(response, 'Unable to load this delivery link.');
  if (!share || typeof share !== 'object' || typeof (share as Record<string, unknown>).scope !== 'string'
    || !Array.isArray((share as Record<string, unknown>).destinations)) {
    throw new Error('Delivery link response did not contain a destinations list.');
  }

  const destinations = (share as { destinations: unknown[] }).destinations;
  destinations.forEach((destination, index) => {
    if (!destination || typeof destination !== 'object') {
      throw new Error(`Delivery link response contains an invalid destination at position ${index + 1}.`);
    }
    const item = destination as Record<string, unknown>;
    if (typeof item.orderId !== 'number' || !Number.isFinite(item.orderId) || typeof item.orderNumber !== 'string'
      || !item.orderNumber.trim() || typeof item.orderStatus !== 'string'
      || !Array.isArray(item.productNames) || !item.productNames.every((name) => typeof name === 'string')) {
      throw new Error(`Delivery link response is missing order details for destination ${index + 1}. The delivery API may need to be updated.`);
    }
    if (typeof item.locationVerificationRequired !== 'boolean') {
      throw new Error(`Delivery link response is missing map verification details for destination ${index + 1}.`);
    }
  });

  return share as PublicDeliveryShareResponse;
}

export async function updatePublicDeliveryOrderStatus(
  token: string,
  orderId: number,
  status: DeliveryPersonOrderStatus,
): Promise<OrderStatusUpdateResponse> {
  const response = await fetchJson<unknown>(
    `/api/public/delivery-shares/${encodeURIComponent(token)}/orders/${encodeURIComponent(String(orderId))}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
    },
    false,
  );
  const result = unwrap<OrderStatusUpdateResponse>(response, 'Unable to update the delivery status.');
  if (!result || !Number.isFinite(result.orderId) || !['OUT_FOR_DELIVERY', 'DELIVERED'].includes(result.orderStatus)) {
    throw new Error('Delivery status update response was invalid.');
  }
  return result;
}
