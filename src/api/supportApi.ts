import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface SupportTicketResponse {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  customerId: number;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface SupportTicketRequest {
  subject: string;
  description: string;
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface TicketMessageResponse {
  id: number;
  ticketId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
}

export async function createSupportTicket(payload: SupportTicketRequest): Promise<SupportTicketResponse> {
  const response = await fetchJson<ApiResponse<SupportTicketResponse>>('/api/customer/support/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to create support ticket');
  }
  return response.data;
}

export async function getSupportTickets(): Promise<SupportTicketResponse[]> {
  const response = await fetchJson<ApiResponse<SupportTicketResponse[]>>('/api/customer/support/tickets', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load support tickets');
  }
  return response.data;
}

export async function getSupportTicketsPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: SupportTicketResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: SupportTicketResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/support/tickets/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load support tickets');
  }
  return response.data;
}

export async function getSupportTicketById(ticketId: number): Promise<SupportTicketResponse> {
  const response = await fetchJson<ApiResponse<SupportTicketResponse>>(`/api/customer/support/tickets/${ticketId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load support ticket');
  }
  return response.data;
}

export async function updateTicketStatus(ticketId: number, status: string): Promise<SupportTicketResponse> {
  const response = await fetchJson<ApiResponse<SupportTicketResponse>>(`/api/customer/support/tickets/${ticketId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to update ticket status');
  }
  return response.data;
}

export async function closeTicket(ticketId: number): Promise<SupportTicketResponse> {
  const response = await fetchJson<ApiResponse<SupportTicketResponse>>(`/api/customer/support/tickets/${ticketId}/close`, {
    method: 'PUT',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to close ticket');
  }
  return response.data;
}

export async function getOpenTicketCount(): Promise<number> {
  const response = await fetchJson<ApiResponse<{ count: number }>>('/api/customer/support/open-count', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load open count');
  }
  return response.data.count;
}
