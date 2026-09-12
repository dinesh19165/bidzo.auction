import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

export async function submitContactMessage(payload: ContactRequest): Promise<void> {
  const response = await fetchJson<ApiResponse<unknown>>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false);

  if (!response?.success) {
    throw new Error(response?.message || 'Unable to submit your message. Please try again.');
  }
}
