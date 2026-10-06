import { uploadFormData } from './apiClient';

export interface MediaUploadResult {
  secureUrl: string;
  publicId: string;
}

interface MediaUploadResponse {
  success?: boolean;
  message?: string;
  data?: Partial<MediaUploadResult>;
  secureUrl?: string;
  publicId?: string;
}

async function uploadMedia(path: '/api/media/camera' | '/api/media/voice', file: File): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await uploadFormData<MediaUploadResponse>(path, formData);
  if (response?.success === false) {
    throw new Error(response.message || 'Media upload failed.');
  }

  const result = response?.data ?? response;
  if (typeof result?.secureUrl !== 'string' || !result.secureUrl.trim() || typeof result.publicId !== 'string' || !result.publicId.trim()) {
    throw new Error(response?.message || 'The upload did not return the required media details.');
  }

  return { secureUrl: result.secureUrl, publicId: result.publicId };
}

export function uploadCameraMedia(file: File): Promise<MediaUploadResult> {
  return uploadMedia('/api/media/camera', file);
}

export function uploadVoiceMedia(file: File): Promise<MediaUploadResult> {
  return uploadMedia('/api/media/voice', file);
}