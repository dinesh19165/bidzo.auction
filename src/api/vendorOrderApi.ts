import { fetchAuthenticatedPdf, fetchJson } from './apiClient';

export interface VendorDeliveryAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface VendorOrderApiResponse {
  id: number;
  orderNumber?: string;
  orderStatus?: string;
  status?: string;
  scheduledDeliveryDate?: string | null;
  expectedDeliveryDate?: string | null;
  deliveryAddress?: VendorDeliveryAddress | string | null;
  items?: Array<{ productName?: string; name?: string; quantity?: number }>;
  totalAmount?: number | string;
  orderDate?: string;
  [key: string]: unknown;
}

export type OrderStatus = 'CONFIRMED' | 'PACKING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
export type DeliveryPersonOrderStatus = Extract<OrderStatus, 'OUT_FOR_DELIVERY' | 'DELIVERED'>;

export interface OrderStatusUpdateResponse {
  orderId: number;
  orderStatus: OrderStatus;
}

export interface VendorOrdersPageResult {
  orders: VendorOrderApiResponse[];
  page: number;
  size: number;
  totalPages: number;
}

type ApiEnvelope<T> = { data?: T; success?: boolean; message?: string };
type SpringPage<T> = { content?: T[]; number?: number; size?: number; totalPages?: number; totalElements?: number; data?: T[]; items?: T[]; page?: number; pageSize?: number; total?: number };

function unwrap<T>(response: T | ApiEnvelope<T>, fallback: string): T {
  if (response && typeof response === 'object' && 'success' in response && response.success === false) {
    throw new Error(response.message || fallback);
  }
  if (response && typeof response === 'object' && 'data' in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
}

export async function getVendorOrders(page = 0, size = 20): Promise<VendorOrdersPageResult> {
  const response = await fetchJson<unknown>(`/api/vendor/orders?page=${page}&size=${size}`);
  const result = unwrap(response as ApiEnvelope<SpringPage<VendorOrderApiResponse>> | SpringPage<VendorOrderApiResponse>, 'Unable to load vendor orders.');
  const data: SpringPage<VendorOrderApiResponse> = Array.isArray(result)
    ? { content: result as VendorOrderApiResponse[] }
    : result as SpringPage<VendorOrderApiResponse>;
  const orders = data.content ?? data.items ?? data.data;
  if (!Array.isArray(orders)) throw new Error('Vendor orders response did not contain an order list.');
  return {
    orders,
    page: Number(data.number ?? data.page ?? page),
    size: Number(data.size ?? data.pageSize ?? size),
    totalPages: Number(data.totalPages ?? Math.max(1, Math.ceil(Number(data.totalElements ?? data.total ?? orders.length) / size))),
  };
}

export async function getVendorOrder(orderId: number): Promise<VendorOrderApiResponse> {
  const response = await fetchJson<unknown>(`/api/vendor/orders/${encodeURIComponent(String(orderId))}`);
  return unwrap(response as ApiEnvelope<VendorOrderApiResponse> | VendorOrderApiResponse, 'Unable to load vendor order details.');
}

export async function updateScheduledDeliveryDate(orderId: number, scheduledDeliveryDate: string): Promise<void> {
  const response = await fetchJson<unknown>(`/api/vendor/orders/${encodeURIComponent(String(orderId))}/scheduled-delivery-date`, {
    method: 'PUT',
    body: JSON.stringify({ scheduledDeliveryDate }),
  });
  if (response && typeof response === 'object' && 'success' in response && (response as ApiEnvelope<unknown>).success === false) {
    throw new Error((response as ApiEnvelope<unknown>).message || 'Unable to update the scheduled delivery date.');
  }
}

export async function updateVendorOrderStatus(orderId: number, status: Extract<OrderStatus, 'PACKING' | 'SHIPPED'>): Promise<void> {
  const response = await fetchJson<unknown>(`/api/vendor/orders/${encodeURIComponent(String(orderId))}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  if (response && typeof response === 'object' && 'success' in response && (response as ApiEnvelope<unknown>).success === false) {
    throw new Error((response as ApiEnvelope<unknown>).message || 'Unable to update the vendor order status.');
  }
}

export async function downloadVendorPackingSlip(orderId: number): Promise<{ blob: Blob; filename: string }> {
  return fetchAuthenticatedPdf(
    `/api/vendor/orders/${encodeURIComponent(String(orderId))}/packing-slip`,
    `packing-slip-${orderId}.pdf`,
  );
}
