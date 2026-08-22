import { fetchJson } from './apiClient';
import { getAdminVendorsPaginated } from './adminApi';
import type { AdminRecord } from './adminApi';

export interface ApprovalRequest extends AdminRecord {
  vendorProfileId: number | string;
  userId: number | string;
  username?: string;
  email?: string;
  businessName: string;
  verificationStatus: string;
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

export async function getPendingVendorApprovals(): Promise<ApprovalRequest[]> {
  const firstPage = await getAdminVendorsPaginated({ page: 0, pageSize: 100 });
  const pages = [firstPage];
  const pageSize = Math.max(firstPage.pageSize, firstPage.items.length, 1);
  const totalPages = Math.min(Math.ceil(firstPage.total / pageSize), 20);

  for (let page = 1; page < totalPages; page += 1) {
    pages.push(await getAdminVendorsPaginated({ page, pageSize: 100 }));
  }

  const vendors = pages.flatMap((page) => page.items);
  return vendors
    .filter((vendor) => {
      return (typeof vendor.userId === 'number' || typeof vendor.userId === 'string') &&
        (typeof vendor.vendorProfileId === 'number' || typeof vendor.vendorProfileId === 'string') &&
        typeof vendor.businessName === 'string' &&
        vendor.verificationStatus === 'PENDING_APPROVAL';
    })
    .map((vendor) => ({
      vendorProfileId: vendor.vendorProfileId as number | string,
      userId: vendor.userId as number | string,
      username: typeof vendor.username === 'string' ? vendor.username : undefined,
      email: typeof vendor.email === 'string' ? vendor.email : undefined,
      businessName: String(vendor.businessName),
      verificationStatus: String(vendor.verificationStatus),
    }));
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
