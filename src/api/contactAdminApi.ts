import { fetchJson } from './apiClient';

export type ContactMessageStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export interface ContactMessage {
  id: number | string;
  name?: string;
  customerName?: string;
  email: string;
  message: string;
  status: ContactMessageStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactMessagePage {
  content: ContactMessage[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ContactMessageQuery {
  status?: ContactMessageStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

function queryString(query: ContactMessageQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const result = params.toString();
  return result ? `?${result}` : '';
}

export async function getAdminContactMessages(query: ContactMessageQuery = {}): Promise<ContactMessagePage> {
  const response = await fetchJson<ContactMessagePage | { data?: ContactMessagePage; message?: string }>(`/api/admin/contact${queryString(query)}`);
  if ('data' in response && response.data) return response.data;
  if ('message' in response && response.message) throw new Error(response.message);
  return response as ContactMessagePage;
}

export async function getAdminContactMessage(id: number | string): Promise<ContactMessage> {
  const response = await fetchJson<ContactMessage | { data?: ContactMessage; message?: string }>(`/api/admin/contact/${id}`);
  if ('data' in response && response.data) return response.data;
  if ('message' in response && response.message) throw new Error(response.message);
  return response as ContactMessage;
}

export async function updateAdminContactMessageStatus(id: number | string, status: ContactMessageStatus): Promise<ContactMessage | undefined> {
  const response = await fetchJson<ContactMessage | { data?: ContactMessage; message?: string }>(`/api/admin/contact/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if ('message' in response && response.message && !('data' in response)) throw new Error(response.message);
  return 'data' in response ? response.data : response as ContactMessage;
}