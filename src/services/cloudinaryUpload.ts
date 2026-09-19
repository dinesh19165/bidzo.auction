export interface CloudinaryUploadResponse {
  secure_url?: string;
  url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
}

function getCloudinaryConfig() {
  const cloudName = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
  const uploadPreset = String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();

  return { cloudName, uploadPreset };
}

export async function uploadToCloudinaryAsset(file: File, resourceType: 'image' | 'video' = 'image'): Promise<{ secureUrl: string; publicId: string }> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as CloudinaryUploadResponse | null;

  if (!response.ok) {
    throw new Error(data?.error?.message || `${resourceType === 'video' ? 'Video' : 'Image'} upload failed`);
  }

  const publicUrl = data?.secure_url || data?.url;
  if (!publicUrl || !data?.public_id) {
    throw new Error('Cloudinary did not return the required media details');
  }

  return { secureUrl: publicUrl, publicId: data.public_id };
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const asset = await uploadToCloudinaryAsset(file);
  return asset.secureUrl;
}
