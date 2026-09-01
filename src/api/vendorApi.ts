import { ApiError, fetchJson } from './apiClient';
import type { ApiResponse } from '../types';
import { uploadToCloudinary } from '../services/cloudinaryUpload';

export interface VendorProfileResponse {
  id: number;
  companyName?: string;
  description?: string;
  status?: string;
  userId?: number;
  franchiseId?: number | null;
  gstNumber?: string;
  gst?: string;
  gst_number?: string;
  accountHolderName?: string;
  account_holder_name?: string;
  bankAccountNumber?: string;
  bank_account_number?: string;
  accountNumber?: string;
  ifscCode?: string;
  ifsc_code?: string;
  ifsc?: string;
  bankName?: string;
  bank_name?: string;
  branchName?: string;
  branch_name?: string;
  bankBranch?: string;
  bank_branch?: string;
  bankDocumentName?: string;
  bank_document_name?: string;
  bankDocumentUrl?: string;
  bank_document_url?: string;
  bankProofName?: string;
  bank_proof_name?: string;
  bankProofUrl?: string;
  bank_proof_url?: string;
  documentUrl?: string;
  documentName?: string;
  [key: string]: unknown;
}

export interface VendorProfileUpdateRequest {
  gstNumber?: string;
  gst?: string;
  gst_number?: string;
  accountHolderName?: string;
  account_holder_name?: string;
  bankAccountNumber?: string;
  bank_account_number?: string;
  accountNumber?: string;
  ifscCode?: string;
  ifsc_code?: string;
  ifsc?: string;
  bankName?: string;
  bank_name?: string;
  branchName?: string;
  branch_name?: string;
  bankBranch?: string;
  bank_branch?: string;
  bankDocumentName?: string;
  bank_document_name?: string;
  bankDocumentUrl?: string;
  bank_document_url?: string;
  bankProofName?: string;
  bank_proof_name?: string;
  bankProofUrl?: string;
  bank_proof_url?: string;
  [key: string]: unknown;
}

export interface VendorBankRecord {
  id?: number | string;
  vendorId?: number | string;
  accountNumber?: string;
  bankName?: string;
  bank_name?: string;
  ifsc?: string;
  ifsc_code?: string;
  branch?: string;
  branch_name?: string;
  accountHolderName?: string;
  account_holder_name?: string;
  bankAccountNumber?: string;
  bank_account_number?: string;
  ifscCode?: string;
  branchName?: string;
  bankBranch?: string;
  bank_proof_url?: string;
  bankProofUrl?: string;
  bank_proof_name?: string;
  bankProofName?: string;
  bank_document_url?: string;
  bankDocumentUrl?: string;
  bank_document_name?: string;
  bankDocumentName?: string;
  status?: string;
  remarks?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface VendorDocumentRecord {
  id?: number;
  type?: string;
  documentType?: string;
  status?: string;
  remarks?: string;
  reason?: string;
  fileName?: string;
  documentNumber?: string;
  uploadedAt?: string;
  url?: string;
  documentUrl?: string;
}

export type VendorDocumentType = 'ID_PROOF' | 'PAN' | 'SELFIE';

export async function uploadVendorDocument(
  vendorId: string | number,
  documentType: VendorDocumentType,
  file: File,
  documentNumber = ''
): Promise<void> {
  const publicUrl = await uploadToCloudinary(file);

  const payload = {
    documentNumber,
    documentType,
    fileName: file.name,
    remarks: '',
    status: 'PENDING',
    url: publicUrl,
  };

  console.log('[KYC] userId:', 'session-user');
  console.log('[KYC] vendorId:', vendorId);
  console.log('[KYC] document URL:', `/api/vendors/${vendorId}/documents`);
  console.debug('[Bidzo vendor documents] upload request', {
    vendorId,
    documentType,
    fileName: file.name,
    fileSize: file.size,
    url: publicUrl,
  });

  const response = await fetchJson<ApiResponse<unknown> | null>(`/api/vendors/${vendorId}/documents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);

  console.debug('[Bidzo vendor documents] upload response', {
    vendorId,
    documentType,
    response,
  });

  if (response && typeof response === 'object' && 'success' in response && response.success === false) {
    throw new Error(response.message || 'Unable to upload document');
  }
}

export async function getVendorDocuments(vendorId: string | number): Promise<VendorDocumentRecord[]> {
  const response = await fetchJson<ApiResponse<VendorDocumentRecord[]> | VendorDocumentRecord[]>(`/api/vendors/${vendorId}/documents`, {
    method: 'GET',
  });

  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === 'object' && 'data' in response) {
    return Array.isArray(response.data) ? response.data : [];
  }

  return [];
}

export async function approveVendorDocument(vendorId: string | number, documentId: string | number): Promise<void> {
  const response = await fetchJson<ApiResponse<unknown> | null>(`/api/vendors/${vendorId}/documents/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'APPROVED' }),
  });

  if (response && typeof response === 'object' && 'success' in response && response.success === false) {
    throw new Error(response.message || 'Unable to approve document');
  }
}

export async function getVendorProfile(): Promise<VendorProfileResponse> {
  const response = await fetchJson<ApiResponse<VendorProfileResponse>>('/api/vendors/me', {
    method: 'GET',
  });

  if (response?.success && response.data) {
    return response.data;
  }

  if (response?.message) {
    throw new Error(response.message);
  }

  throw new Error('Unable to load vendor profile');
}

export async function updateVendorProfile(payload: VendorProfileUpdateRequest): Promise<VendorProfileResponse> {
  const attempts = [
    { method: 'PUT', body: JSON.stringify(payload) },
    { method: 'PATCH', body: JSON.stringify(payload) },
  ];

  let lastError: unknown = null;

  for (const init of attempts) {
    try {
      const response = await fetchJson<ApiResponse<VendorProfileResponse>>('/api/vendors/me', {
        method: init.method,
        body: init.body,
      });

      if (response?.success && response.data) {
        return response.data;
      }

      if (response?.message) {
        throw new Error(response.message);
      }

      return {} as VendorProfileResponse;
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && (error.status === 404 || error.status === 405 || error.status === 400)) {
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to update vendor profile');
}

function unwrapVendorBankRecord(response: unknown, fallback: string): VendorBankRecord | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const envelope = response as { data?: unknown; success?: boolean; message?: string; content?: unknown };
  if (envelope.success === false) {
    throw new Error(envelope.message || fallback);
  }

  const candidate = envelope.data ?? envelope.content ?? response;
  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate[0] as VendorBankRecord;
  }

  if (candidate && typeof candidate === 'object') {
    return candidate as VendorBankRecord;
  }

  return null;
}

export async function getVendorBankRecord(): Promise<VendorBankRecord | null> {
  try {
    const response = await fetchJson<unknown>('/api/vendors/me/bank', { method: 'GET' });
    return unwrapVendorBankRecord(response, 'Failed to load vendor bank details.');
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Error('Bank details are not available yet.');
    }
    throw error;
  }
}

export async function saveVendorBankRecord(payload: VendorBankRecord): Promise<VendorBankRecord> {
  const requestBody = {
    accountHolderName: payload.accountHolderName ?? '',
    bankName: payload.bankName ?? '',
    accountNumber: payload.accountNumber ?? '',
    ifsc: payload.ifsc ?? '',
    branch: payload.branch ?? '',
  };

  const response = await fetchJson<unknown>('/api/vendors/me/bank', {
    method: 'PUT',
    body: JSON.stringify(requestBody),
  });

  const record = unwrapVendorBankRecord(response, 'Failed to save vendor bank details.');
  if (record) {
    return {
      ...record,
      accountHolderName: record.accountHolderName ?? record.account_holder_name ?? requestBody.accountHolderName,
      bankName: record.bankName ?? record.bank_name ?? requestBody.bankName,
      accountNumber: record.accountNumber ?? record.bankAccountNumber ?? record.bank_account_number ?? requestBody.accountNumber,
      ifsc: record.ifsc ?? record.ifscCode ?? record.ifsc_code ?? requestBody.ifsc,
      branch: record.branch ?? record.branchName ?? record.branch_name ?? record.bankBranch ?? requestBody.branch,
    };
  }

  return {
    ...payload,
    accountHolderName: requestBody.accountHolderName,
    bankName: requestBody.bankName,
    accountNumber: requestBody.accountNumber,
    ifsc: requestBody.ifsc,
    branch: requestBody.branch,
  };
}

export async function getVendors(): Promise<void> {
  // TODO: connect to Spring Boot vendor endpoint
}

export async function getVendorById(): Promise<void> {
  // TODO: connect to Spring Boot vendor endpoint
}
