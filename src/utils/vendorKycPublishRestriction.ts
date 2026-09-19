import { ApiError } from '../api/apiClient';

export const VENDOR_KYC_PUBLISH_REQUIRED_MESSAGE = 'Vendor KYC approval is required before publishing.';

export function isVendorKycPublishRestrictionError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.message.trim() === VENDOR_KYC_PUBLISH_REQUIRED_MESSAGE;
  }

  const rawMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  const normalized = rawMessage.trim();

  return normalized.includes(VENDOR_KYC_PUBLISH_REQUIRED_MESSAGE) || normalized.toLowerCase().includes('vendor kyc approval is required before publishing.');
}
