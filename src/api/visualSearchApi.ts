import { ApiError, uploadFormData } from './apiClient';
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
  if (!file || file.size === 0) throw new Error('Unable to create image file. Please choose another image.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Please select a JPEG, PNG, or WEBP image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10 MB or smaller.');

  const formData = new FormData();
  formData.append('file', file, file.name);
  if (keyword?.trim()) formData.append('keyword', keyword.trim());
  if (categoryId !== undefined && String(categoryId).trim()) formData.append('categoryId', String(categoryId));

  if (import.meta.env.DEV) {
    console.debug('[Bidzo visual search] request', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      keyword: keyword?.trim() || '',
      categoryId: categoryId === undefined ? '' : String(categoryId),
      hasFile: formData.has('file'),
      hasKeyword: formData.has('keyword'),
      hasCategoryId: formData.has('categoryId'),
    });
  }

  let response: VisualProductSearchResponse;
  try {
    response = await uploadFormData<VisualProductSearchResponse>('/api/search/visual', formData);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Bidzo visual search] request failed', {
        status: error instanceof ApiError ? error.status : undefined,
        message: error instanceof Error ? error.message : 'Unknown request error',
        errorType: error instanceof ApiError ? 'http' : 'network',
      });
    }
    throw error;
  }
  if (import.meta.env.DEV) {
    console.debug('[Bidzo visual search] response', { message: response?.message || '', productCount: response?.data?.products?.length ?? 0 });
  }
  if (!response?.success || !response.data || !Array.isArray(response.data.products)) {
    throw new Error(response?.message || 'Unable to search this image. Please try again.');
  }

  return response.data;
}