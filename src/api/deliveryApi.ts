import { ApiError, fetchJson } from './apiClient';

export interface DeliveryCheckRequest {
  productId: number;
  pincode: string;
}

export interface DeliveryCheckResult {
  success: boolean;
  deliveryAvailable?: boolean;
  distanceKm?: number | null;
  configuredRadiusKm?: number | null;
  message?: string;
}

export interface DeliveryCheckResponse {
  data?: Omit<DeliveryCheckResult, 'success'> & { success?: boolean } | null;
  success: boolean;
  message?: string;
}

export interface DeliveryRadiusRequest {
  radiusKm: number;
}

export interface DeliveryRadiusResult {
  radiusKm: number;
}

export interface DeliveryRadiusResponse {
  data?: DeliveryRadiusResult | null;
  success: boolean;
  message?: string;
}

export async function checkDeliveryAvailability(
  request: DeliveryCheckRequest,
  signal?: AbortSignal,
): Promise<DeliveryCheckResult> {
  const response = await fetchJson<DeliveryCheckResponse>('/api/delivery/check', {
    method: 'POST',
    body: JSON.stringify(request),
    signal,
  });

  return parseDeliveryCheckResponse(response);
}

export function parseDeliveryCheckResponse(response: DeliveryCheckResponse): DeliveryCheckResult {
  if (!response.success) {
    throw new ApiError(400, response.message || 'Unable to verify delivery for this PIN code.');
  }
  if (!response.data || typeof response.data.deliveryAvailable !== 'boolean') {
    throw new Error('Delivery check returned an invalid response.');
  }
  if (response.data.success === false) {
    throw new ApiError(400, response.data.message || response.message || 'Unable to verify delivery for this PIN code.');
  }

  return {
    ...response.data,
    success: true,
    message: response.data.message ?? response.message,
  };
}

export async function getAdminDeliveryRadius(): Promise<DeliveryRadiusResult> {
  const response = await fetchJson<DeliveryRadiusResponse>('/api/admin/settings/delivery-radius', { method: 'GET' });
  if (!response.success || !response.data || !Number.isFinite(response.data.radiusKm)) {
    throw new Error(response.message || 'Unable to load delivery radius.');
  }
  return response.data;
}

export async function updateAdminDeliveryRadius(request: DeliveryRadiusRequest): Promise<DeliveryRadiusResult> {
  const response = await fetchJson<DeliveryRadiusResponse>('/api/admin/settings/delivery-radius', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
  if (!response.success || !response.data || !Number.isFinite(response.data.radiusKm)) {
    throw new Error(response.message || 'Unable to update delivery radius.');
  }
  return response.data;
}
