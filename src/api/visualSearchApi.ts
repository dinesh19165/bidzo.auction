import { uploadFormData } from './apiClient';
import type { ProductApiResponse } from './productApi';

export interface VisualProductSearchData {
  keyword?: string;
  categoryId?: number | string;
  products: ProductApiResponse[];
}

export interface VisualProductSearchResponse {
  success: boolean;
  data: VisualProductSearchData;
  message: string;
}

export async function visualProductSearch(file: File, keyword?: string, categoryId?: number | string): Promise<VisualProductSearchData> {
  const formData = new FormData();
  formData.append('file', file, file.name);
  if (keyword?.trim()) formData.append('keyword', keyword.trim());
  if (categoryId !== undefined && String(categoryId).trim()) formData.append('categoryId', String(categoryId));

  const response = await uploadFormData<VisualProductSearchResponse>('/api/search/visual', formData);
  if (!response?.success || !response.data || !Array.isArray(response.data.products)) {
    throw new Error(response?.message || 'Unable to search this image. Please try again.');
  }

  return response.data;
}