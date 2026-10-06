import { uploadFormData } from './apiClient';
import type { ProductApiResponse } from './productApi';

export interface VoiceProductSearchData {
  keyword?: string;
  categoryId?: number | string;
  products: ProductApiResponse[];
}

export interface VoiceProductSearchResponse {
  success: boolean;
  data: VoiceProductSearchData;
  message: string;
}

export async function voiceProductSearch(audioFile: File, keyword?: string, categoryId?: number | string): Promise<VoiceProductSearchData> {
  const trimmedKeyword = keyword?.trim();
  if (!trimmedKeyword && (categoryId === undefined || !String(categoryId).trim())) {
    throw new Error('Enter a keyword or select a category.');
  }
  if (trimmedKeyword && trimmedKeyword.length > 100) {
    throw new Error('Search text must be 100 characters or fewer.');
  }

  const formData = new FormData();
  formData.append('file', audioFile, audioFile.name);
  if (trimmedKeyword) formData.append('keyword', trimmedKeyword);
  if (categoryId !== undefined && String(categoryId).trim()) formData.append('categoryId', String(categoryId));

  const response = await uploadFormData<VoiceProductSearchResponse>('/api/search/voice', formData);
  if (!response?.success || !response.data || !Array.isArray(response.data.products)) {
    throw new Error(response?.message || 'Unable to search by voice. Please try again.');
  }

  return response.data;
}