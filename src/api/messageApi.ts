import { fetchJson } from './apiClient';
import type { ApiResponse } from '../types';

export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ConversationResponse {
  id: number;
  participantId: number;
  participantName: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt?: string;
}

export async function createConversation(participantId: number): Promise<ConversationResponse> {
  const response = await fetchJson<ApiResponse<ConversationResponse>>('/api/customer/messages/conversations', {
    method: 'POST',
    body: JSON.stringify({ participantId }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to create conversation');
  }
  return response.data;
}

export async function getConversations(): Promise<ConversationResponse[]> {
  const response = await fetchJson<ApiResponse<ConversationResponse[]>>('/api/customer/messages/conversations', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load conversations');
  }
  return response.data;
}

export async function getConversationsPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: ConversationResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: ConversationResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/messages/conversations/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load conversations');
  }
  return response.data;
}

export async function getConversationById(conversationId: number): Promise<ConversationResponse> {
  const response = await fetchJson<ApiResponse<ConversationResponse>>(`/api/customer/messages/conversations/${conversationId}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load conversation');
  }
  return response.data;
}

export async function sendMessage(conversationId: number, content: string): Promise<MessageResponse> {
  const response = await fetchJson<ApiResponse<MessageResponse>>(`/api/customer/messages/conversations/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to send message');
  }
  return response.data;
}

export async function getMessages(conversationId: number): Promise<MessageResponse[]> {
  const response = await fetchJson<ApiResponse<MessageResponse[]>>(`/api/customer/messages/conversations/${conversationId}/messages`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load messages');
  }
  return response.data;
}

export async function getMessagesPaginated(conversationId: number, page: number = 1, pageSize: number = 20): Promise<{ data: MessageResponse[]; meta: { page: number; pageSize: number; total: number } }> {
  const response = await fetchJson<ApiResponse<{ data: MessageResponse[]; meta: { page: number; pageSize: number; total: number } }>>(`/api/customer/messages/conversations/${conversationId}/messages/paginated?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load messages');
  }
  return response.data;
}

export async function markMessageAsRead(messageId: number): Promise<MessageResponse> {
  const response = await fetchJson<ApiResponse<MessageResponse>>(`/api/customer/messages/${messageId}/read`, {
    method: 'PUT',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to mark message as read');
  }
  return response.data;
}

export async function getUnreadMessageCount(): Promise<number> {
  const response = await fetchJson<ApiResponse<{ count: number }>>('/api/customer/messages/unread/count', {
    method: 'GET',
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load unread count');
  }
  return response.data.count;
}
