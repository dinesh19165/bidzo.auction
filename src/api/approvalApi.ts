import { fetchJson } from './apiClient';
import { getAdminVendor, getAdminVendorsPaginated } from './adminApi';
import type { AdminRecord } from './adminApi';
import { getVendorDocuments } from './vendorApi';

export type KycDocumentType = 'ID_PROOF' | 'PAN' | 'SELFIE';

export interface VendorKycDocumentStatus {
  id?: number | string;
  type?: KycDocumentType;
  status?: string;
  reason?: string;
  fileName?: string;
  documentNumber?: string;
  uploadedAt?: string;
  url?: string;
  documentUrl?: string;
}

export interface ApprovalRequest extends AdminRecord {
  vendorProfileId: number | string;
  userId: number | string;
  username?: string;
  email?: string;
  businessName: string;
  verificationStatus: string;
  documents?: VendorKycDocumentStatus[];
  reason?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  gstNumber?: string;
  bankVerificationStatus?: string;
  submittedAt?: string;
  updatedAt?: string;
}

interface ApprovalEnvelope<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

function unwrap<T>(response: T | ApprovalEnvelope<T>, fallback: string): T {
  if (response && typeof response === 'object' && ('data' in response || 'success' in response)) {
    const envelope = response as ApprovalEnvelope<T>;
    if (envelope.success === false) {
      throw new Error(envelope.message || fallback);
    }
    return (envelope.data ?? response) as T;
  }
  return response as T;
}

function normalizeDocumentType(value: unknown): KycDocumentType | null {
  const raw = String(value ?? '').toUpperCase();
  if (raw.includes('ID_PROOF') || raw.includes('AADHAAR') || raw.includes('IDENTITY')) return 'ID_PROOF';
  if (raw.includes('PAN')) return 'PAN';
  if (raw.includes('SELFIE')) return 'SELFIE';
  return null;
}

function pickString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return undefined;
}

function pickDocStatus(doc: Record<string, unknown>, _type: KycDocumentType): string | undefined {
  return pickString(doc.status)
    ?? pickString(doc.documentStatus)
    ?? pickString(doc.verificationStatus)
    ?? pickString(doc.reviewStatus)
    ?? pickString(doc.state)
    ?? 'PENDING';
}

function normalizeVendorDocuments(value: unknown): VendorKycDocumentStatus[] {
  const docs: VendorKycDocumentStatus[] = [];
  const list = Array.isArray(value) ? value : value && typeof value === 'object' ? [value] : [];

  list.forEach((item) => {
    const record = (item ?? {}) as Record<string, unknown>;
    const inferredType = normalizeDocumentType(
      record.documentType ?? record.type ?? record.docType ?? record.name ?? record.documentName ?? record.kind
    );

    if (!inferredType) return;

    const fileName = pickString(record.fileName)
      ?? pickString(record.name)
      ?? pickString(record.filename)
      ?? pickString(record.originalName)
      ?? pickString(record.documentName)
      ?? undefined;

    const url = pickString(record.url)
      ?? pickString(record.fileUrl)
      ?? pickString(record.documentUrl)
      ?? pickString(record.path)
      ?? pickString(record.downloadUrl)
      ?? undefined;
    const rawId = record.id ?? record.documentId ?? record.kycDocumentId;
    const id = typeof rawId === 'string' || typeof rawId === 'number' ? rawId : undefined;

    docs.push({
      id,
      type: inferredType,
      status: pickDocStatus(record, inferredType),
      reason: pickString(record.reason) ?? pickString(record.rejectionReason) ?? pickString(record.changeReason) ?? pickString(record.adminRemark) ?? pickString(record.remarks),
      fileName,
      documentNumber: pickString(record.documentNumber) ?? pickString(record.number) ?? pickString(record.idNumber) ?? pickString(record.docNumber),
      uploadedAt: pickString(record.uploadedAt) ?? pickString(record.updatedAt) ?? pickString(record.createdAt),
      url,
      documentUrl: url,
    });
  });

  return docs.filter((doc, index, arr) => arr.findIndex((candidate) => candidate.type === doc.type) === index);
}

function extractVendorDocuments(vendor: Record<string, unknown>): VendorKycDocumentStatus[] {
  const fromArray = normalizeVendorDocuments(
    vendor.documents ?? vendor.kycDocuments ?? vendor.vendorDocuments ?? vendor.identityDocuments ?? vendor.verificationDocuments
  );
  if (fromArray.length > 0) return fromArray;

  const aadhaar = normalizeVendorDocuments(vendor.aadhaar ?? vendor.aadhaarDocument ?? vendor.aadhaarDoc);
  const pan = normalizeVendorDocuments(vendor.pan ?? vendor.panDocument ?? vendor.panDoc);
  const selfie = normalizeVendorDocuments(vendor.selfie ?? vendor.selfieDocument ?? vendor.selfieDoc);

  return [...aadhaar, ...pan, ...selfie].filter((doc, index, arr) => arr.findIndex((candidate) => candidate.type === doc.type) === index);
}

export async function getPendingVendorApprovals(): Promise<ApprovalRequest[]> {
  const firstPage = await getAdminVendorsPaginated({ page: 0, pageSize: 100 });
  const pages = [firstPage];
  const pageSize = Math.max(firstPage.pageSize, firstPage.items.length, 1);
  const totalPages = Math.min(Math.ceil(firstPage.total / pageSize), 20);

  for (let page = 1; page < totalPages; page += 1) {
    pages.push(await getAdminVendorsPaginated({ page, pageSize: 100 }));
  }

  const vendors = pages.flatMap((page) => page.items);

  const approvals = await Promise.all(vendors.map(async (vendor) => {
    const vendorId = vendor.vendorProfileId ?? vendor.id ?? vendor.userId;
    const businessName = pickString(vendor.businessName) ?? pickString(vendor.companyName) ?? 'Vendor';
    const userId = vendor.userId ?? vendor.id ?? vendor.vendorProfileId ?? 0;
    const status = pickString(vendor.verificationStatus) ?? pickString(vendor.status) ?? 'PENDING_APPROVAL';

    if (typeof vendorId === 'undefined') {
      return null;
    }

    let detail: Record<string, unknown> = { ...(vendor as Record<string, unknown>) };
    try {
      const vendorDetail = await getAdminVendor(String(vendorId));
      if (vendorDetail && typeof vendorDetail === 'object') {
        detail = { ...detail, ...(vendorDetail as Record<string, unknown>) };
      }
    } catch {
      // Ignore detail fetch failures and fall back to paginated vendor summary.
    }

    try {
      const vendorDocuments = await getVendorDocuments(String(vendorId));
      if (vendorDocuments.length > 0) {
        detail = { ...detail, documents: vendorDocuments };
      }
    } catch {
      // Ignore vendor document fetch failures and keep the summary-based fallback.
    }

    const documents = extractVendorDocuments(detail);
    const bankAccountNumber = pickString(detail.accountNumber)
      ?? pickString(detail.bankAccountNumber)
      ?? pickString(detail.bank_account_number)
      ?? pickString(vendor.accountNumber)
      ?? pickString(vendor.bankAccountNumber)
      ?? pickString(vendor.bank_account_number)
      ?? undefined;

    return {
      vendorProfileId: vendorId as number | string,
      userId: userId as number | string,
      username: pickString(vendor.username) ?? pickString(vendor.ownerName) ?? pickString(vendor.email),
      email: pickString(vendor.email),
      businessName,
      verificationStatus: status,
      documents,
      reason: pickString(vendor.reason) ?? pickString(vendor.changeReason) ?? undefined,
      accountHolderName: pickString(detail.accountHolderName)
        ?? pickString(detail.account_holder_name)
        ?? pickString(vendor.accountHolderName)
        ?? pickString(vendor.account_holder_name)
        ?? undefined,
      bankName: pickString(detail.bankName)
        ?? pickString(detail.bank_name)
        ?? pickString(vendor.bankName)
        ?? pickString(vendor.bank_name)
        ?? undefined,
      accountNumber: bankAccountNumber,
      ifsc: pickString(detail.ifsc)
        ?? pickString(detail.ifscCode)
        ?? pickString(detail.ifsc_code)
        ?? pickString(vendor.ifsc)
        ?? pickString(vendor.ifscCode)
        ?? pickString(vendor.ifsc_code)
        ?? undefined,
      branch: pickString(detail.branch)
        ?? pickString(detail.branchName)
        ?? pickString(detail.branch_name)
        ?? pickString(vendor.branch)
        ?? pickString(vendor.branchName)
        ?? pickString(vendor.branch_name)
        ?? pickString(vendor.bankBranch)
        ?? pickString(vendor.bank_branch)
        ?? undefined,
      gstNumber: pickString(detail.gstNumber)
        ?? pickString(detail.gst_number)
        ?? pickString(vendor.gstNumber)
        ?? pickString(vendor.gst_number)
        ?? undefined,
      bankVerificationStatus: pickString(detail.bankVerificationStatus)
        ?? pickString(detail.bank_verification_status)
        ?? pickString(detail.verificationStatus)
        ?? pickString(vendor.bankVerificationStatus)
        ?? pickString(vendor.bank_verification_status)
        ?? pickString(vendor.status)
        ?? undefined,
      submittedAt: pickString(detail.submittedAt) ?? pickString(detail.createdAt) ?? pickString(vendor.createdAt) ?? undefined,
      updatedAt: pickString(detail.updatedAt) ?? pickString(detail.lastUpdated) ?? pickString(vendor.updatedAt) ?? undefined,
    } satisfies ApprovalRequest;
  }));

  return approvals
    .filter((approval): approval is NonNullable<typeof approval> => approval !== null)
    .filter((approval) => {
      const status = approval.verificationStatus?.toUpperCase();
      return status === 'PENDING_APPROVAL' || status === 'REQUIRES_CHANGES' || status === 'CHANGES_REQUESTED';
    });
}

export async function requestVendorChanges(id: number | string, documents: KycDocumentType[], reason: string): Promise<void> {
  const payload = {
    documents: documents.map((document) => document === 'ID_PROOF' ? 'AADHAAR' : document),
    reason,
  };
  const response = await fetchJson<void | ApprovalEnvelope<void>>(`/api/admin/vendors/${id}/request-changes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  unwrap(response, 'Failed to request vendor document changes');
}

async function updateVendorApproval(id: number | string, action: 'approve' | 'reject'): Promise<void> {
  const response = await fetchJson<void | ApprovalEnvelope<void>>(`/api/admin/vendors/${id}/${action}`, {
    method: 'PUT',
  });
  unwrap(response, `Failed to ${action} approval`);
}

export function approveVendor(id: number | string): Promise<void> {
  return updateVendorApproval(id, 'approve');
}

export function rejectVendor(id: number | string): Promise<void> {
  return updateVendorApproval(id, 'reject');
}
