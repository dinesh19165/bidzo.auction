import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Image as ImageIcon, LoaderCircle, Megaphone, Plus } from 'lucide-react';
import { AdminShell } from '../components/admin/AdminShell';
import { FranchiseAdminShell } from '../components/admin/FranchiseAdminShell';
import { PrimaryButton, SecondaryButton } from '../components/common/Buttons';
import { Card } from '../components/common/Card';
import { EmptyState, ErrorState, SkeletonTable } from '../components/loading/LoadingComponents';
import VendorSidebar from '../components/layout/VendorSidebar';
import { showToast } from '../components/ui/toast';
import { useAuth } from '../context/AuthContext';
import {
  approveAdminAdvertisement,
  approveFranchiseAdvertisement,
  createAdvertisementRazorpayOrder,
  createVendorAdvertisement,
  getAdminAdvertisement,
  getAdminAdvertisements,
  getFranchiseAdvertisement,
  getFranchiseAdvertisements,
  getVendorAdvertisement,
  getVendorAdvertisements,
  publishAdminAdvertisement,
  rejectAdminAdvertisement,
  rejectFranchiseAdvertisement,
  type AdvertisementRecord,
  type AdvertisementRequest,
  type AdvertisementStatus,
  type AdvertisementType,
} from '../api/advertisementApi';
import { getAdminFranchises, getAdminProduct, getAdminVendor } from '../api/adminApi';
import { categoryLabel, getCategories, type CategoryRecord } from '../api/categoryApi';
import { getFranchiseMe, getFranchiseProduct, getFranchiseVendor } from '../api/franchiseApi';
import { getVendorProducts } from '../api/vendorProductApi';
import { uploadToCloudinaryAsset } from '../services/cloudinaryUpload';
import { loadRazorpay, openRazorpayCheckout } from '../utils/razorpay';
import { verifyAdvertisementPayment } from '../api/advertisementApi';

function toDateInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function entryLabel(value: string | undefined | null): string {
  if (!value) return 'N/A';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function currencyFormat(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '—';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numeric);
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statusSequence(): AdvertisementStatus[] {
  return [
    'DRAFT',
    'PAYMENT_PENDING',
    'PAYMENT_VERIFICATION',
    'PENDING_FRANCHISE_REVIEW',
    'FRANCHISE_REJECTED',
    'FRANCHISE_APPROVED',
    'PENDING_SUPER_ADMIN_REVIEW',
    'SUPER_ADMIN_REJECTED',
    'PUBLISHED',
    'EXPIRED',
    'CANCELLED',
  ];
}

function normalizeStatus(value?: string | null): string {
  return String(value ?? '').trim().toUpperCase();
}

function statusTone(status?: string | null): string {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case 'DRAFT':
      return 'bg-slate-500/10 text-slate-200';
    case 'PAYMENT_PENDING':
    case 'PAYMENT_VERIFICATION':
      return 'bg-amber-500/10 text-amber-200';
    case 'PENDING_FRANCHISE_REVIEW':
      return 'bg-blue-500/10 text-blue-200';
    case 'FRANCHISE_APPROVED':
    case 'PENDING_SUPER_ADMIN_REVIEW':
      return 'bg-violet-500/10 text-violet-200';
    case 'SUPER_ADMIN_REJECTED':
    case 'FRANCHISE_REJECTED':
      return 'bg-rose-500/10 text-rose-200';
    case 'PUBLISHED':
      return 'bg-emerald-500/10 text-emerald-200';
    case 'EXPIRED':
    case 'CANCELLED':
      return 'bg-slate-600/10 text-slate-200';
    default:
      return 'bg-slate-500/10 text-slate-200';
  }
}

function renderStatusBadge(status?: string | null) {
  const normalized = normalizeStatus(status);
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusTone(normalized)}`}>{normalized ? entryLabel(normalized) : 'UNKNOWN'}</span>;
}

function canPay(record: AdvertisementRecord): boolean {
  const status = normalizeStatus(record.status ?? record.advertisementStatus ?? record.paymentStatus ?? '');
  return status === 'PAYMENT_PENDING' || status === 'PAYMENT_VERIFICATION' || Boolean(record.paymentStatus && ['PENDING', 'PAYMENT_PENDING'].includes(record.paymentStatus.toUpperCase()));
}

function canFranchiseReview(record: AdvertisementRecord): boolean {
  const status = normalizeStatus(record.status ?? record.advertisementStatus ?? '');
  return status === 'PENDING_FRANCHISE_REVIEW';
}

function canSuperAdminReview(record: AdvertisementRecord): boolean {
  const status = normalizeStatus(record.status ?? record.advertisementStatus ?? '');
  return status === 'FRANCHISE_APPROVED' || status === 'PENDING_SUPER_ADMIN_REVIEW';
}

function canPublish(record: AdvertisementRecord): boolean {
  const status = normalizeStatus(record.status ?? record.advertisementStatus ?? '');
  return status === 'FRANCHISE_APPROVED' || status === 'PENDING_SUPER_ADMIN_REVIEW';
}

function resolveAdvertisementBannerUrl(record: AdvertisementRecord | null | undefined): string | undefined {
  const bannerImageUrl = record?.bannerImageUrl;
  return typeof bannerImageUrl === 'string' && bannerImageUrl.trim() ? bannerImageUrl.trim() : undefined;
}

function ExtractedImage({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);
  const safeSrc = src?.trim();

  useEffect(() => {
    setHasError(false);
  }, [safeSrc]);

  if (!safeSrc || hasError) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-muted)] text-sm text-[var(--text-muted)]">
        No advertisement image
      </div>
    );
  }
  return <img src={safeSrc} alt={alt} onError={() => setHasError(true)} className="aspect-[16/10] w-full rounded-2xl border border-[var(--border-color)] object-cover" />;
}

function AdvertStatusTimeline({ status }: { status?: string | null }) {
  const normalized = normalizeStatus(status);
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">Lifecycle</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {statusSequence().map((step) => {
          const isActive = step === normalized || (normalized === 'FRANCHISE_REJECTED' && step === 'DRAFT') || (normalized === 'SUPER_ADMIN_REJECTED' && step === 'DRAFT');
          const isPast = statusSequence().indexOf(step) <= statusSequence().indexOf(normalized || 'DRAFT');
          return (
            <div key={step} className={`min-w-[110px] rounded-xl border px-3 py-2 text-center text-xs font-medium ${isActive || isPast ? 'border-blue-500/30 bg-blue-500/10 text-white' : 'border-[var(--border-color)] bg-[var(--surface-muted)] text-[var(--text-muted)]'}`}>
              {entryLabel(step)}
            </div>
          );
        })}
      </div>
      {normalized === 'FRANCHISE_REJECTED' || normalized === 'SUPER_ADMIN_REJECTED' ? (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {normalized === 'FRANCHISE_REJECTED' ? 'This advertisement was rejected by the franchise admin.' : 'This advertisement was rejected by the super admin.'}
        </div>
      ) : null}
    </div>
  );
}

function readString(record: Record<string, unknown> | null | undefined, keys: string[]): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
      continue;
    }
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      const nestedText = readString(nested, keys);
      if (nestedText) return nestedText;
    }
  }
  return undefined;
}

function joinDisplayParts(...parts: Array<string | undefined>): string | undefined {
  const values = parts.filter((part): part is string => Boolean(part && part.trim()));
  return values.length > 0 ? values.join(' • ') : undefined;
}

async function hydrateAdvertisementDetails(record: AdvertisementRecord, context: 'admin' | 'franchise' = 'admin'): Promise<AdvertisementRecord> {
  if (!record) return record;
  const next = { ...record };
  const vendorRecord = next.vendor && typeof next.vendor === 'object' ? (next.vendor as Record<string, unknown>) : undefined;
  const franchiseRecord = next.franchise && typeof next.franchise === 'object' ? (next.franchise as Record<string, unknown>) : undefined;
  const productRecord = next.product && typeof next.product === 'object' ? (next.product as Record<string, unknown>) : undefined;

  const vendorId = next.vendorId ?? vendorRecord?.id ?? vendorRecord?.vendorId ?? vendorRecord?.vendorProfileId ?? undefined;
  const franchiseId = next.franchiseId ?? franchiseRecord?.id ?? franchiseRecord?.franchiseId ?? undefined;
  const productId = next.productId ?? productRecord?.id ?? productRecord?.productId ?? undefined;

  let vendorName = readString(vendorRecord, ['name', 'businessName', 'companyName', 'vendorName', 'storeName']);
  let vendorEmail = readString(vendorRecord, ['email', 'vendorEmail']);
  let franchiseName = readString(franchiseRecord, ['name', 'franchiseName', 'title']);
  let franchiseCity = readString(franchiseRecord, ['city', 'location', 'state', 'address']);
  let productName = readString(productRecord, ['name', 'productName', 'title']);

  try {
    if (vendorId && !vendorName) {
      const vendor = context === 'admin' ? await getAdminVendor(String(vendorId)) : await getFranchiseVendor(String(vendorId));
      vendorName = readString(vendor as Record<string, unknown>, ['name', 'businessName', 'companyName', 'vendorName', 'storeName']) ?? vendorName;
      vendorEmail = readString(vendor as Record<string, unknown>, ['email', 'vendorEmail']) ?? vendorEmail;
    }
  } catch {
    // Ignore missing vendor metadata; the detail view can still render the ID-based fallback.
  }

  try {
    if (franchiseId && !franchiseName) {
      if (context === 'admin') {
        const franchises = await getAdminFranchises();
        const match = franchises.find((item) => String(item.id ?? item.franchiseId ?? item.vendorId ?? '') === String(franchiseId));
        if (match) {
          franchiseName = readString(match as Record<string, unknown>, ['name', 'franchiseName', 'title']) ?? franchiseName;
          franchiseCity = readString(match as Record<string, unknown>, ['city', 'location', 'state']) ?? franchiseCity;
        }
      } else {
        const me = await getFranchiseMe();
        const meId = me?.id ?? me?.franchiseId;
        if (meId && String(meId) === String(franchiseId)) {
          franchiseName = readString(me as Record<string, unknown>, ['name', 'franchiseName', 'title']) ?? franchiseName;
          franchiseCity = readString(me as Record<string, unknown>, ['city', 'location', 'state']) ?? franchiseCity;
        }
      }
    }
  } catch {
    // Ignore missing franchise metadata; the view remains based on the payload.
  }

  try {
    if (productId && !productName) {
      const product = context === 'admin' ? await getAdminProduct(String(productId)) : await getFranchiseProduct(String(productId));
      productName = readString(product as Record<string, unknown>, ['name', 'productName', 'title']) ?? productName;
    }
  } catch {
    // Ignore missing product metadata; the page can still show the ID value if present.
  }

  next.vendorName = joinDisplayParts(vendorName, vendorEmail) ?? next.vendorName ?? vendorName ?? vendorEmail;
  next.vendorEmail = vendorEmail ?? next.vendorEmail;
  next.franchiseName = joinDisplayParts(franchiseName, franchiseCity) ?? next.franchiseName ?? franchiseName ?? franchiseCity;
  next.franchiseCity = franchiseCity ?? next.franchiseCity;
  next.productName = productName ?? next.productName ?? readString(productRecord, ['name', 'productName', 'title']) ?? undefined;

  return next;
}

function getAdvertisementProps(record: AdvertisementRecord): { title: string; description?: string; productName?: string; vendorName?: string; franchiseName?: string; paymentStatus?: string; status?: string; type?: string; placement?: string; amount?: string; currency?: string; image?: string } {
  const vendorName = joinDisplayParts(
    readString(record.vendor && typeof record.vendor === 'object' ? record.vendor as Record<string, unknown> : undefined, ['name', 'businessName', 'companyName', 'vendorName', 'storeName']),
    readString(record.vendor && typeof record.vendor === 'object' ? record.vendor as Record<string, unknown> : undefined, ['email', 'vendorEmail']),
    typeof record.vendorName === 'string' ? record.vendorName : undefined,
  ) ?? (typeof record.vendorName === 'string' ? record.vendorName : undefined);

  const franchiseName = joinDisplayParts(
    readString(record.franchise && typeof record.franchise === 'object' ? record.franchise as Record<string, unknown> : undefined, ['name', 'franchiseName', 'title']),
    readString(record.franchise && typeof record.franchise === 'object' ? record.franchise as Record<string, unknown> : undefined, ['city', 'state', 'location']),
    typeof record.franchiseName === 'string' ? record.franchiseName : undefined,
    typeof record.franchiseCity === 'string' ? record.franchiseCity : undefined,
  ) ?? (typeof record.franchiseName === 'string' ? record.franchiseName : undefined);

  return {
    title: record.title || 'Advertisement',
    description: record.description || record.reason || undefined,
    productName: typeof record.productName === 'string' ? record.productName : (readString(record.product && typeof record.product === 'object' ? record.product as Record<string, unknown> : undefined, ['name', 'productName', 'title']) ?? undefined),
    vendorName,
    franchiseName,
    paymentStatus: record.paymentStatus || record.paymentStatusName || record.paymentStatusText || record.status,
    status: record.status || record.advertisementStatus,
    type: record.advertisementType || record.type,
    placement: record.placement,
    amount: currencyFormat(record.amount),
    currency: record.currency || 'INR',
    image: resolveAdvertisementBannerUrl(record),
  };
}

const advertisementTypes: AdvertisementType[] = ['PRODUCT_PROMOTION', 'STORE_PROMOTION', 'BANNER', 'HOMEPAGE_BANNER', 'CATEGORY_BANNER'];

function VendorAdvertisementTable({ items, onRefresh }: { items: AdvertisementRecord[]; onRefresh: () => void }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-muted)] p-8 text-center">
        <p className="text-xl font-semibold text-[var(--text-primary)]">No advertisements yet</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Create your first advertisement to start promotion.</p>
        <div className="mt-5 flex justify-center"><Link to="/vendor/advertisements/create"><PrimaryButton icon={<Plus className="h-4 w-4" />}>Create Advertisement</PrimaryButton></Link></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border-color)] text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium">Advertisement</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
            {items.map((item) => (
              <tr key={String(item.id ?? item.advertisementId ?? item.title)}>
                <td className="px-4 py-3"><div className="flex min-w-0 items-center gap-3"><div className="h-10 w-10 overflow-hidden rounded-lg bg-[var(--surface-muted)]"><img src={item.bannerImageUrl || '/logo.png'} alt={item.title || 'Advertisement'} className="h-full w-full object-cover" /></div><div className="min-w-0"><p className="truncate font-medium text-white">{item.title || 'Advertisement'}</p><p className="truncate text-xs text-[var(--text-muted)]">{item.placement || item.description || 'No placement set'}</p></div></div></td>
                <td className="px-4 py-3">{entryLabel(item.advertisementType || item.type)}</td>
                <td className="px-4 py-3">{renderStatusBadge(item.paymentStatus || item.paymentStatusName)}</td>
                <td className="px-4 py-3">{renderStatusBadge(item.status || item.advertisementStatus)}</td>
                <td className="px-4 py-3"><div className="space-y-1 text-xs text-[var(--text-muted)]"><div>{formatDate(item.startDate || item.startAt)}</div><div>{formatDate(item.endDate || item.endAt)}</div></div></td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><Link to={`/vendor/advertisements/${item.id ?? item.advertisementId}`}><SecondaryButton type="button">View</SecondaryButton></Link>{canPay(item) ? <button type="button" onClick={() => void onRefresh()} className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-100">Pay</button> : null}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VendorAdvertisementPage() {
  const [items, setItems] = useState<AdvertisementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getVendorAdvertisements());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load your advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <VendorSidebar />
        <main className="min-w-0 flex-1">
          <section className="rounded-[30px] border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Vendor</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">My Advertisements</h1>
              </div>
              <Link to="/vendor/advertisements/create"><PrimaryButton icon={<Plus className="h-4 w-4" />}>Create Advertisement</PrimaryButton></Link>
            </div>
          </section>
          <div className="mt-6 space-y-4">
            {loading ? <SkeletonTable /> : error ? <ErrorState title="Unable to load advertisements" description={error} /> : <VendorAdvertisementTable items={items} onRefresh={() => void load()} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export function VendorAdvertisementCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Array<{ id: number | string; name: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [categoryLoadError, setCategoryLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdvertisementRequest>({
    advertisementType: 'BANNER',
    title: '',
    description: '',
    placement: '',
    targetUrl: '',
    bannerImageUrl: '',
    bannerImagePublicId: '',
    productId: undefined,
    categoryId: undefined,
    amount: 0,
    currency: 'INR',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (form.advertisementType !== 'PRODUCT_PROMOTION') return;
    let active = true;
    setLoadingProducts(true);
    getVendorProducts().then((rows) => {
      if (!active) return;
      setProducts(rows.map((row) => ({ id: row.id, name: row.name || `Product ${row.id}` })));
    }).catch(() => {
      if (active) setProducts([]);
    }).finally(() => {
      if (active) setLoadingProducts(false);
    });
    return () => { active = false; };
  }, [form.advertisementType]);

  useEffect(() => {
    if (form.advertisementType !== 'CATEGORY_BANNER') return;
    let active = true;
    setLoadingCategories(true);
    setCategoryLoadError(null);
    getCategories().then((rows) => {
      if (active) setCategories(rows.filter((category) => category.status === 'PUBLISHED'));
    }).catch((reason) => {
      if (!active) return;
      setCategories([]);
      setCategoryLoadError(reason instanceof Error ? reason.message : 'Unable to load categories.');
    }).finally(() => {
      if (active) setLoadingCategories(false);
    });
    return () => { active = false; };
  }, [form.advertisementType]);

  const updateField = <K extends keyof AdvertisementRequest>(key: K, value: AdvertisementRequest[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setUploadError('Choose a JPEG, PNG, or WEBP image up to 10 MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    updateField('bannerImageUrl', '');
    updateField('bannerImagePublicId', '');
    try {
      const asset = await uploadToCloudinaryAsset(file, 'image');
      updateField('bannerImageUrl', asset.secureUrl);
      updateField('bannerImagePublicId', asset.publicId);
    } catch (reason) {
      updateField('bannerImageUrl', '');
      updateField('bannerImagePublicId', '');
      setUploadError(reason instanceof Error ? reason.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const openBannerImagePicker = () => bannerInputRef.current?.click();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title?.trim()) return showToast('Title is required', 'Please add an advertisement title.', 'warning');
    if (!form.startDate) return showToast('Start date is required', 'Choose a start date before saving.', 'warning');
    if (!form.endDate) return showToast('End date is required', 'Choose an end date before saving.', 'warning');
    if (form.advertisementType === 'PRODUCT_PROMOTION' && !form.productId) return showToast('Product is required', 'Select a product for this promotion.', 'warning');
    if (form.advertisementType === 'CATEGORY_BANNER' && (form.categoryId === undefined || form.categoryId === null || form.categoryId === '')) return showToast('Category is required', 'Select a category for this banner.', 'warning');
    if (form.advertisementType === 'CATEGORY_BANNER' && categoryLoadError) return showToast('Categories unavailable', categoryLoadError, 'warning');
    if (uploading) return showToast('Image upload in progress', 'Wait for the banner image upload to finish.', 'warning');
    if (uploadError) return showToast('Banner image upload failed', uploadError, 'warning');
    if ((form.advertisementType === 'BANNER' || form.advertisementType === 'HOMEPAGE_BANNER' || form.advertisementType === 'CATEGORY_BANNER' || form.advertisementType === 'STORE_PROMOTION' || form.advertisementType === 'PRODUCT_PROMOTION') && !form.bannerImageUrl) return showToast('Banner image is required', 'Upload a banner image for this advertisement type.', 'warning');

    setSaving(true);
    try {
      const payload: AdvertisementRequest = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        placement: form.placement?.trim() || undefined,
        targetUrl: form.targetUrl?.trim() || undefined,
        amount: form.amount === undefined || form.amount === null ? undefined : Number(form.amount),
        currency: form.currency || 'INR',
        startDate: form.startDate,
        endDate: form.endDate,
        ...(form.advertisementType !== 'PRODUCT_PROMOTION' ? { productId: undefined } : { productId: form.productId }),
        ...(form.advertisementType === 'CATEGORY_BANNER' ? { categoryId: form.categoryId } : { categoryId: undefined }),
      };
      const created = await createVendorAdvertisement(payload);
      const status = normalizeStatus(created.status ?? created.advertisementStatus ?? '');
      if (status === 'PAYMENT_PENDING' || status === 'PENDING') {
        const paymentSession = await createAdvertisementRazorpayOrder(created.id ?? created.advertisementId ?? '', {
          paymentProvider: 'RAZORPAY',
          amount: Number(created.amount ?? 0),
          currency: String(created.currency || 'INR'),
        });

        const amount = Number(paymentSession.amount ?? created.amount ?? 0);
        const currency = String(paymentSession.currency || created.currency || 'INR');
        const razorpayKeyId = paymentSession.razorpayKeyId;
        const razorpayOrderId = paymentSession.razorpayOrderId;

        const razorpayLoaded = await loadRazorpay();
        if (!razorpayLoaded || !window.Razorpay) {
          throw new Error('Razorpay Checkout could not be loaded.');
        }
        if (!razorpayKeyId || !razorpayOrderId || amount === undefined || !currency) {
          throw new Error('Advertisement payment session is incomplete. Please try again.');
        }

        openRazorpayCheckout({
          key: razorpayKeyId,
          order_id: razorpayOrderId,
          amount: amount * 100,
          currency,
          name: 'Bidzo Advertisement',
          description: created.title || 'Advertisement payment',
          prefill: { name: user?.name, email: user?.email },
          handler: async (response) => {
            try {
              await verifyAdvertisementPayment(created.id ?? created.advertisementId ?? '', {
                paymentProvider: 'RAZORPAY',
                paymentReference: response.razorpay_payment_id,
                amount,
                currency,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              showToast('Payment successful — waiting for Franchise Admin approval.', 'Your advertisement has been submitted for review.', 'success');
              navigate(`/vendor/advertisements/${created.id ?? created.advertisementId}`);
            } catch (error) {
              showToast('Payment verification failed', error instanceof Error ? error.message : 'Unable to verify payment.', 'warning');
            }
          },
          modal: { ondismiss: () => showToast('Payment cancelled', 'The advertisement remains pending payment.', 'info') },
        });
        return;
      }
      showToast('Advertisement created', 'Your advertisement request was submitted successfully.', 'success');
      navigate(`/vendor/advertisements/${created.id ?? created.advertisementId}`);
    } catch (reason) {
      showToast('Unable to save advertisement', reason instanceof Error ? reason.message : 'Please try again.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <VendorSidebar />
        <main className="min-w-0 flex-1">
          <section className="rounded-[30px] border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Vendor</p>
                <h1 className="mt-2 text-2xl font-semibold text-white">Create Advertisement</h1>
              </div>
              <Link to="/vendor/advertisements"><SecondaryButton type="button">Back to list</SecondaryButton></Link>
            </div>
          </section>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-[30px] border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-lg">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Advertisement Type</span>
                <select value={form.advertisementType} onChange={(event) => updateField('advertisementType', event.target.value as AdvertisementType)} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white">
                  {advertisementTypes.map((type) => <option key={type} value={type}>{entryLabel(type)}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Title</span>
                <input value={form.title || ''} onChange={(event) => updateField('title', event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white" placeholder="Campaign title" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Description</span>
                <textarea value={form.description || ''} onChange={(event) => updateField('description', event.target.value)} rows={4} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-white" placeholder="Tell customers about this promotion" />
              </label>
              {form.advertisementType === 'PRODUCT_PROMOTION' ? (
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Product</span>
                  <select value={String(form.productId ?? '')} onChange={(event) => updateField('productId', event.target.value === '' ? undefined : Number(event.target.value))} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white">
                    <option value="">Select a product</option>
                    {products.map((product) => <option key={String(product.id)} value={String(product.id)}>{product.name}</option>)}
                  </select>
                  {loadingProducts ? <p className="mt-2 text-xs text-[var(--text-muted)]">Loading products…</p> : null}
                </label>
              ) : null}
              {form.advertisementType === 'CATEGORY_BANNER' ? (
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Category</span>
                  <select value={String(form.categoryId ?? '')} onChange={(event) => updateField('categoryId', event.target.value || undefined)} disabled={loadingCategories || Boolean(categoryLoadError)} required className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white disabled:opacity-60">
                    <option value="">{loadingCategories ? 'Loading categories...' : 'Select a category'}</option>
                    {categories.map((category) => <option key={String(category.id)} value={String(category.id)}>{categoryLabel(category).trim()}</option>)}
                  </select>
                  {categoryLoadError ? <p role="alert" className="mt-2 text-sm text-rose-300">{categoryLoadError}</p> : null}
                </label>
              ) : null}
              <label className="block">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Placement</span>
                <input value={form.placement || ''} onChange={(event) => updateField('placement', event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white" placeholder="Homepage, category, sidebar" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Target URL</span>
                <input value={form.targetUrl || ''} onChange={(event) => updateField('targetUrl', event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white" placeholder="https://" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Start Date</span>
                <input type="date" value={toDateInput(form.startDate || form.startAt)} onChange={(event) => { updateField('startDate', event.target.value); updateField('startAt', event.target.value); }} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">End Date</span>
                <input type="date" value={toDateInput(form.endDate || form.endAt)} onChange={(event) => { updateField('endDate', event.target.value); updateField('endAt', event.target.value); }} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Amount</span>
                <input type="number" min="0" step="0.01" value={Number(form.amount ?? 0)} onChange={(event) => updateField('amount', Number(event.target.value))} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-[var(--text-secondary)]">Currency</span>
                <input value={form.currency || 'INR'} onChange={(event) => updateField('currency', event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] px-3 text-sm text-white" />
              </label>
              {form.advertisementType === 'BANNER' || form.advertisementType === 'HOMEPAGE_BANNER' || form.advertisementType === 'CATEGORY_BANNER' || form.advertisementType === 'STORE_PROMOTION' || form.advertisementType === 'PRODUCT_PROMOTION' ? (
                <div className="md:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-muted)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">Banner Image</p>
                    <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" disabled={uploading} />
                    <button type="button" onClick={openBannerImagePicker} disabled={uploading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
                      {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                      {uploading ? 'Uploading image...' : form.bannerImageUrl ? 'Change Image' : 'Upload Banner Image'}
                    </button>
                  </div>
                  <button type="button" onClick={openBannerImagePicker} disabled={uploading} aria-label={form.bannerImageUrl ? 'Change banner image' : 'Upload banner image'} className="mt-4 block w-full overflow-hidden rounded-xl text-left disabled:cursor-wait">
                    {form.bannerImageUrl ? <img src={form.bannerImageUrl} alt="Advertisement banner preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="aspect-[16/10] w-full rounded-xl border border-[var(--border-color)] object-cover" /> : <span className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--surface)] text-sm text-[var(--text-muted)] transition hover:border-blue-500/50 hover:text-white"><ImageIcon className="h-7 w-7" />No advertisement image</span>}
                  </button>
                  {uploading ? <p className="mt-2 inline-flex items-center gap-2 text-sm text-blue-200"><LoaderCircle className="h-4 w-4 animate-spin" />Uploading your banner image...</p> : null}
                  {uploadError ? <p role="alert" className="mt-2 text-sm text-rose-300">{uploadError}</p> : null}
                  {form.bannerImageUrl ? <button type="button" onClick={() => { updateField('bannerImageUrl', ''); updateField('bannerImagePublicId', ''); setUploadError(null); }} disabled={uploading} className="mt-3 text-sm font-medium text-rose-300 hover:text-rose-200 disabled:opacity-50">Remove Image</button> : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <SecondaryButton type="button" onClick={() => navigate('/vendor/advertisements')}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving || uploading || Boolean(uploadError)} icon={saving || uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}>{uploading ? 'Uploading image...' : saving ? 'Saving...' : 'Create Advertisement'}</PrimaryButton>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export function VendorAdvertisementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AdvertisementRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setRecord(await getVendorAdvertisement(id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load advertisement details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [id]);

  const pay = async () => {
    if (!record || !record.id) return;
    try {
      setProcessingPayment(true);
      const paymentSession = await createAdvertisementRazorpayOrder(record.id ?? '', {
        paymentProvider: 'RAZORPAY',
        amount: Number(record.amount ?? 0),
        currency: String(record.currency || 'INR'),
      });

      const amount = Number(paymentSession.amount ?? record.amount ?? 0);
      const currency = String(paymentSession.currency || record.currency || 'INR');
      const razorpayKeyId = paymentSession.razorpayKeyId;
      const razorpayOrderId = paymentSession.razorpayOrderId;

      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout could not be loaded.');
      }
      if (!razorpayKeyId || !razorpayOrderId || amount === undefined || !currency) {
        throw new Error('Advertisement payment session is incomplete. Please try again.');
      }

      openRazorpayCheckout({
        key: razorpayKeyId,
        order_id: razorpayOrderId,
        amount: amount * 100,
        currency,
        name: 'Bidzo Advertisement',
        description: record.title || 'Advertisement payment',
        prefill: { name: 'Vendor', email: '' },
        handler: async (response) => {
          try {
            await verifyAdvertisementPayment(record.id ?? '', {
              paymentProvider: 'RAZORPAY',
              paymentReference: response.razorpay_payment_id,
              amount,
              currency,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            showToast('Payment successful — waiting for Franchise Admin approval.', 'Your advertisement has been submitted for review.', 'success');
            await load();
          } catch (error) {
            showToast('Verification failed', error instanceof Error ? error.message : 'Unable to verify payment.', 'warning');
          }
        },
        modal: { ondismiss: () => showToast('Payment cancelled', 'Advertisement remains pending payment.', 'info') },
      });
    } catch (reason) {
      showToast('Payment failed', reason instanceof Error ? reason.message : 'Unable to start payment.', 'warning');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!record && loading) {
    return <div className="min-h-screen bg-[var(--app-bg)] p-6"><div className="mx-auto max-w-5xl space-y-4"><SkeletonTable /></div></div>;
  }

  if (error || !record) {
    return <div className="min-h-screen bg-[var(--app-bg)] p-6"><div className="mx-auto max-w-5xl"><ErrorState title="Advertisement not found" description={error || 'The selected advertisement could not be loaded.'} /></div></div>;
  }

  const props = getAdvertisementProps(record);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/vendor/advertisements')} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]"><ArrowLeft className="h-4 w-4" />Back</button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Vendor</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">{props.title}</h1>
            </div>
          </div>
          {canPay(record) ? <PrimaryButton type="button" onClick={() => void pay()} disabled={processingPayment} icon={processingPayment ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}>{processingPayment ? 'Preparing payment...' : 'Pay now'}</PrimaryButton> : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <Card className="p-5">
              <ExtractedImage src={props.image} alt={props.title} />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {renderStatusBadge(props.status)}
                {record.paymentStatus ? renderStatusBadge(record.paymentStatus) : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{props.title}</h2>
              {props.description ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{props.description}</p> : null}
            </Card>
            <Card className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Advertisement Type" value={entryLabel(props.type)} />
                <DetailRow label="Placement" value={props.placement || '—'} />
                <DetailRow label="Vendor" value={props.vendorName || '—'} />
                <DetailRow label="Product" value={props.productName || '—'} />
                <DetailRow label="Amount" value={props.amount ?? '—'} />
                <DetailRow label="Currency" value={props.currency || 'INR'} />
                <DetailRow label="Start Date" value={formatDate(record.startDate || record.startAt)} />
                <DetailRow label="End Date" value={formatDate(record.endDate || record.endAt)} />
                <DetailRow label="Created" value={formatDateTime(record.createdAt)} />
                <DetailRow label="Updated" value={formatDateTime(record.updatedAt)} />
                <DetailRow label="Payment Reference" value={record.paymentReference || record.paymentRef || record.paymentOrderId || '—'} />
              </div>
            </Card>
            {record.rejectionReason ? <Card className="border-rose-500/20 bg-rose-500/10 p-5"><p className="text-sm font-semibold text-rose-200">Rejection reason</p><p className="mt-2 text-sm text-rose-100">{record.rejectionReason}</p></Card> : null}
          </div>
          <div className="space-y-6">
            <AdvertStatusTimeline status={props.status} />
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Payment</p>
              <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center justify-between gap-3"><span>Payment status</span><span className="font-medium text-white">{record.paymentStatus || '—'}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Reference</span><span className="font-medium text-white">{record.paymentReference || record.paymentRef || '—'}</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 break-words text-sm text-white">{value ?? '—'}</p>
    </div>
  );
}

export function FranchiseAdvertisementPage() {
  const [items, setItems] = useState<AdvertisementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setItems(await getFranchiseAdvertisements()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load advertisements'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  if (loading) return <FranchiseAdminShell title="Franchise Admin" subtitle="Advertisements" activePath="/franchise/advertisements" breadcrumbs={[{ label: 'Franchise' }, { label: 'Advertisements' }]}><SkeletonTable /></FranchiseAdminShell>;
  if (error) return <FranchiseAdminShell title="Franchise Admin" subtitle="Advertisements" activePath="/franchise/advertisements" breadcrumbs={[{ label: 'Franchise' }, { label: 'Advertisements' }]}><ErrorState title="Unable to load advertisements" description={error} /></FranchiseAdminShell>;

  return (
    <FranchiseAdminShell title="Franchise Admin" subtitle="Advertisements" activePath="/franchise/advertisements" breadcrumbs={[{ label: 'Franchise' }, { label: 'Advertisements' }]}>
      {items.length === 0 ? <EmptyState title="No advertisements are waiting for review." description="New vendor submissions will appear here when ready." /> : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3">Advertisement</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {items.map((item) => (
                <tr key={String(item.id ?? item.advertisementId)}>
                  <td className="px-4 py-3"><div className="min-w-0"><p className="font-medium text-white">{item.title || 'Advertisement'}</p><p className="text-xs text-[var(--text-muted)]">{item.placement || '—'}</p></div></td>
                  <td className="px-4 py-3">{item.vendor && typeof item.vendor === 'object' ? String((item.vendor as Record<string, unknown>).name ?? (item.vendor as Record<string, unknown>).businessName ?? (item.vendor as Record<string, unknown>).vendorName ?? 'Vendor') : 'Vendor'}</td>
                  <td className="px-4 py-3">{entryLabel(item.advertisementType || item.type)}</td>
                  <td className="px-4 py-3">{currencyFormat(item.amount)}</td>
                  <td className="px-4 py-3">{renderStatusBadge(item.paymentStatus || item.paymentStatusName)}</td>
                  <td className="px-4 py-3">{renderStatusBadge(item.advertisementStatus || item.status)}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><Link to={`/franchise/advertisements/${item.id ?? item.advertisementId}`}><SecondaryButton type="button">View</SecondaryButton></Link>{canFranchiseReview(item) ? <button type="button" onClick={() => void approveFranchiseAdvertisement(item.id ?? item.advertisementId ?? '').then(() => { showToast('Advertisement approved', 'The advertisement is now pending Super Admin review.', 'success'); void load(); }).catch((reason) => showToast('Approval failed', reason instanceof Error ? reason.message : 'Unable to approve advertisement.', 'warning'))} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100">Approve</button> : null}{canFranchiseReview(item) ? <button type="button" onClick={() => { const reason = window.prompt('Rejection reason'); if (!reason || !reason.trim()) { showToast('Rejection reason required', 'A reason is required before rejection.', 'warning'); return; } rejectFranchiseAdvertisement(item.id ?? item.advertisementId ?? '', reason.trim()).then(() => { showToast('Advertisement rejected', 'The rejection reason has been saved.', 'success'); void load(); }).catch((reasonError) => showToast('Rejection failed', reasonError instanceof Error ? reasonError.message : 'Unable to reject advertisement.', 'warning')); }} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100">Reject</button> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FranchiseAdminShell>
  );
}

export function FranchiseAdvertisementDetailPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<AdvertisementRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { if (!id) return; try { const ad = await getFranchiseAdvertisement(id); setRecord(await hydrateAdvertisementDetails(ad, 'franchise')); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load advertisement'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [id]);
  if (loading) return <FranchiseAdminShell title="Franchise Admin" subtitle="Advertisement details" activePath="/franchise/advertisements" breadcrumbs={[{ label: 'Franchise' }, { label: 'Advertisements' }]}><SkeletonTable /></FranchiseAdminShell>;
  if (error || !record) return <FranchiseAdminShell title="Franchise Admin" subtitle="Advertisement details" activePath="/franchise/advertisements" breadcrumbs={[{ label: 'Franchise' }, { label: 'Advertisements' }]}><ErrorState title="Unable to load advertisement" description={error || 'Advertisement details are unavailable.'} /></FranchiseAdminShell>;

  const props = getAdvertisementProps(record);
  return (
    <FranchiseAdminShell title="Franchise Admin" subtitle={props.title} activePath="/franchise/advertisements" breadcrumbs={[{ label: 'Franchise', to: '/franchise/dashboard' }, { label: 'Advertisements', to: '/franchise/advertisements' }, { label: props.title }]}>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <Card className="p-5"><ExtractedImage src={props.image} alt={props.title} /><div className="mt-4 flex flex-wrap gap-2">{renderStatusBadge(props.status)}{renderStatusBadge(record.paymentStatus || record.paymentStatusName)}</div><h2 className="mt-4 text-xl font-semibold text-white">{props.title}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{props.description || 'No description provided.'}</p></Card>
          <Card className="p-5"><div className="grid gap-4 sm:grid-cols-2"><DetailRow label="Advertisement Type" value={entryLabel(props.type)} /><DetailRow label="Vendor" value={props.vendorName || '—'} /><DetailRow label="Product / Store" value={props.productName || props.vendorName || '—'} /><DetailRow label="Placement" value={props.placement || '—'} /><DetailRow label="Amount" value={props.amount ?? '—'} /><DetailRow label="Currency" value={props.currency || 'INR'} /><DetailRow label="Payment Reference" value={record.paymentReference || record.paymentRef || '—'} /><DetailRow label="Created date" value={formatDateTime(record.createdAt)} /></div></Card>
        </div>
        <div className="space-y-6">
          <AdvertStatusTimeline status={props.status} />
          <Card className="p-5"><div className="space-y-3 text-sm text-[var(--text-secondary)]"><div className="flex items-center justify-between gap-3"><span>Current status</span><span className="font-medium text-white">{entryLabel(props.status)}</span></div><div className="flex items-center justify-between gap-3"><span>Start date</span><span className="font-medium text-white">{formatDate(record.startDate || record.startAt)}</span></div><div className="flex items-center justify-between gap-3"><span>End date</span><span className="font-medium text-white">{formatDate(record.endDate || record.endAt)}</span></div>{record.rejectionReason ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-100">{record.rejectionReason}</div> : null}</div></Card>
          {canFranchiseReview(record) ? <div className="flex flex-col gap-2"><PrimaryButton type="button" onClick={() => { approveFranchiseAdvertisement(record.id ?? record.advertisementId ?? '').then(() => { showToast('Advertisement approved', 'It is now pending Super Admin review.', 'success'); void load(); }).catch((reason) => showToast('Approval failed', reason instanceof Error ? reason.message : 'Unable to approve this advertisement.', 'warning')); }}>Approve Advertisement</PrimaryButton><SecondaryButton type="button" onClick={() => { const reason = window.prompt('Describe the rejection reason'); if (!reason || !reason.trim()) { showToast('Rejection reason required', 'A reason is required before rejecting.', 'warning'); return; } rejectFranchiseAdvertisement(record.id ?? record.advertisementId ?? '', reason.trim()).then(() => { showToast('Advertisement rejected', 'The rejection reason has been recorded.', 'success'); void load(); }).catch((reasonError) => showToast('Rejection failed', reasonError instanceof Error ? reasonError.message : 'Unable to reject this advertisement.', 'warning')); }}>Reject Advertisement</SecondaryButton></div> : null}
        </div>
      </div>
    </FranchiseAdminShell>
  );
}

export function AdminAdvertisementPage() {
  const [items, setItems] = useState<AdvertisementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setItems(await getAdminAdvertisements()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load advertisements'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  if (loading) return <AdminShell title="Enterprise admin" subtitle="Advertisement Management" breadcrumbs={[{ label: 'Admin' }, { label: 'Advertisements' }]} activePath="/admin/advertisements"><SkeletonTable /></AdminShell>;
  if (error) return <AdminShell title="Enterprise admin" subtitle="Advertisement Management" breadcrumbs={[{ label: 'Admin' }, { label: 'Advertisements' }]} activePath="/admin/advertisements"><ErrorState title="Unable to load advertisements" description={error} /></AdminShell>;
  return (
    <AdminShell title="Enterprise admin" subtitle="Advertisement Management" breadcrumbs={[{ label: 'Admin' }, { label: 'Advertisements' }]} activePath="/admin/advertisements">
      {items.length === 0 ? <EmptyState title="No advertisements available." description="No advertisements are currently visible to the admin console." /> : <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]"><table className="min-w-full text-left text-sm"><thead className="bg-[var(--surface-muted)] text-[var(--text-secondary)]"><tr><th className="px-4 py-3">Advertisement</th><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Franchise</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">{items.map((item) => <tr key={String(item.id ?? item.advertisementId)}><td className="px-4 py-3"><div className="min-w-0"><p className="font-medium text-white">{item.title || 'Advertisement'}</p><p className="text-xs text-[var(--text-muted)]">{item.placement || '—'}</p></div></td><td className="px-4 py-3">{item.vendor && typeof item.vendor === 'object' ? String((item.vendor as Record<string, unknown>).name ?? (item.vendor as Record<string, unknown>).businessName ?? (item.vendor as Record<string, unknown>).vendorName ?? 'Vendor') : 'Vendor'}</td><td className="px-4 py-3">{item.franchise && typeof item.franchise === 'object' ? String((item.franchise as Record<string, unknown>).name ?? (item.franchise as Record<string, unknown>).franchiseName ?? 'Franchise') : 'Franchise'}</td><td className="px-4 py-3">{entryLabel(item.advertisementType || item.type)}</td><td className="px-4 py-3">{renderStatusBadge(item.paymentStatus || item.paymentStatusName)}</td><td className="px-4 py-3">{renderStatusBadge(item.advertisementStatus || item.status)}</td><td className="px-4 py-3"><Link to={`/admin/advertisements/${item.id ?? item.advertisementId}`}><SecondaryButton type="button">View</SecondaryButton></Link></td></tr>)}</tbody></table></div>}
    </AdminShell>
  );
}

export function AdminAdvertisementDetailPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<AdvertisementRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { if (!id) return; try { const ad = await getAdminAdvertisement(id); setRecord(await hydrateAdvertisementDetails(ad, 'admin')); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load advertisement'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [id]);
  if (loading) return <AdminShell title="Enterprise admin" subtitle="Advertisement details" breadcrumbs={[{ label: 'Admin' }, { label: 'Advertisements', to: '/admin/advertisements' }, { label: 'Details' }]} activePath="/admin/advertisements"><SkeletonTable /></AdminShell>;
  if (error || !record) return <AdminShell title="Enterprise admin" subtitle="Advertisement details" breadcrumbs={[{ label: 'Admin' }, { label: 'Advertisements', to: '/admin/advertisements' }, { label: 'Details' }]} activePath="/admin/advertisements"><ErrorState title="Unable to load advertisement" description={error || 'Advertisement details are unavailable.'} /></AdminShell>;

  const props = getAdvertisementProps(record);
  return (
    <AdminShell title="Enterprise admin" subtitle={props.title} breadcrumbs={[{ label: 'Admin', to: '/admin/super-dashboard' }, { label: 'Advertisements', to: '/admin/advertisements' }, { label: props.title }]} activePath="/admin/advertisements">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <Card className="p-5"><ExtractedImage src={props.image} alt={props.title} /><div className="mt-4 flex flex-wrap gap-2">{renderStatusBadge(props.status)}{renderStatusBadge(record.paymentStatus || record.paymentStatusName)}</div><h2 className="mt-4 text-xl font-semibold text-white">{props.title}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{props.description || 'No description provided.'}</p></Card>
          <Card className="p-5"><div className="grid gap-4 sm:grid-cols-2"><DetailRow label="Vendor" value={props.vendorName || '—'} /><DetailRow label="Franchise" value={props.franchiseName || '—'} /><DetailRow label="Product/Store" value={props.productName || '—'} /><DetailRow label="Advertisement type" value={entryLabel(props.type)} /><DetailRow label="Placement" value={props.placement || '—'} /><DetailRow label="Amount" value={props.amount ?? '—'} /><DetailRow label="Currency" value={props.currency || 'INR'} /><DetailRow label="Payment reference" value={record.paymentReference || record.paymentRef || '—'} /></div></Card>
        </div>
        <div className="space-y-6">
          <AdvertStatusTimeline status={props.status} />
          <Card className="p-5"><div className="space-y-3 text-sm text-[var(--text-secondary)]"><div className="flex items-center justify-between gap-3"><span>Franchise status</span><span className="font-medium text-white">{record.advertisementStatus || record.status || '—'}</span></div><div className="flex items-center justify-between gap-3"><span>Start date</span><span className="font-medium text-white">{formatDate(record.startDate || record.startAt)}</span></div><div className="flex items-center justify-between gap-3"><span>End date</span><span className="font-medium text-white">{formatDate(record.endDate || record.endAt)}</span></div><div className="flex items-center justify-between gap-3"><span>Created</span><span className="font-medium text-white">{formatDateTime(record.createdAt)}</span></div>{record.rejectionReason ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-100">{record.rejectionReason}</div> : null}</div></Card>
          <div className="flex flex-col gap-2">
            {canSuperAdminReview(record) ? <PrimaryButton type="button" onClick={() => { approveAdminAdvertisement(record.id ?? record.advertisementId ?? '').then(() => { showToast('Advertisement approved for review', 'It is ready for final review.', 'success'); void load(); }).catch((reason) => showToast('Approval failed', reason instanceof Error ? reason.message : 'Unable to approve this advertisement.', 'warning')); }}>Approve</PrimaryButton> : null}
            {canSuperAdminReview(record) ? <SecondaryButton type="button" onClick={() => { const reason = window.prompt('Rejection reason'); if (!reason || !reason.trim()) { showToast('Rejection reason required', 'A reason is required before rejection.', 'warning'); return; } rejectAdminAdvertisement(record.id ?? record.advertisementId ?? '', reason.trim()).then(() => { showToast('Advertisement rejected', 'The rejection reason has been saved.', 'success'); void load(); }).catch((reasonError) => showToast('Rejection failed', reasonError instanceof Error ? reasonError.message : 'Unable to reject this advertisement.', 'warning')); }}>Reject</SecondaryButton> : null}
            {canPublish(record) ? <PrimaryButton type="button" onClick={() => { publishAdminAdvertisement(record.id ?? record.advertisementId ?? '').then(() => { showToast('Advertisement published', 'The advertisement is now PUBLISHED.', 'success'); void load(); }).catch((reason) => showToast('Publish failed', reason instanceof Error ? reason.message : 'Unable to publish this advertisement.', 'warning')); }}>Publish</PrimaryButton> : null}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export default VendorAdvertisementPage;
