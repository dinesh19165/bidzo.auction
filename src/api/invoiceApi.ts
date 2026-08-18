import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface InvoiceResponse {
  id: number;
  orderId: number;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  status: string;
  downloadUrl?: string;
  createdAt: string;
}

export async function getInvoices(): Promise<InvoiceResponse[]> {
  const response = await fetchJson<ApiResponse<InvoiceResponse[]>>('/api/customer/invoices', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load invoices');
  }
  return response.data;
}

export async function getInvoicesPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: InvoiceResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: InvoiceResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/invoices/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load invoices');
  }
  return response.data;
}

export async function getInvoiceById(invoiceId: number): Promise<InvoiceResponse> {
  const response = await fetchJson<ApiResponse<InvoiceResponse>>(`/api/customer/invoices/${invoiceId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load invoice');
  }
  return response.data;
}

export async function getInvoiceByOrderId(orderId: number): Promise<InvoiceResponse> {
  const response = await fetchJson<ApiResponse<InvoiceResponse>>(`/api/customer/invoices/order/${orderId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load invoice');
  }
  return response.data;
}

export async function downloadInvoice(invoiceId: number): Promise<string> {
  const response = await fetchJson<ApiResponse<{ downloadUrl: string }>>(`/api/customer/invoices/${invoiceId}/download`, {
    method: 'GET',
  });
  if (!response?.data?.downloadUrl) {
    throw new Error(response?.message || 'Failed to generate download URL');
  }
  return response.data.downloadUrl;
}
