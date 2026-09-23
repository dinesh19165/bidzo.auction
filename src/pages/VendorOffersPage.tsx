import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import VendorSidebar from '../components/layout/VendorSidebar';
import { Card } from '../components/common/Card';
import { PrimaryButton, SecondaryButton, Badge } from '../components/common/Buttons';
import { ErrorState, SkeletonTable } from '../components/loading/LoadingComponents';
import { showToast } from '../components/ui/toast';
import { getCategories, type CategoryRecord } from '../api/categoryApi';
import { getVendorProducts, type VendorProductApiResponse } from '../api/vendorProductApi';
import { getVendorProfile } from '../api/vendorApi';
import { createVendorOffer, deleteVendorOffer, getVendorOffer, getVendorOffers, updateVendorOffer, type DiscountType, type Offer, type OfferRequest } from '../api/offerApi';

const emptyDraft: OfferRequest = {
  name: '',
  description: '',
  offerType: 'PRODUCT',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  maximumDiscountAmount: null,
  startAt: null,
  endAt: null,
  priority: 0,
  active: true,
  productIds: [],
  categoryIds: [],
};

function toLocalInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function label(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase());
}

function ownerId(category: CategoryRecord): string | null {
  const record = category as Record<string, unknown>;
  const nested = record.createdBy && typeof record.createdBy === 'object' ? record.createdBy as Record<string, unknown> : null;
  const value = record.vendorId ?? record.vendorProfileId ?? record.ownerVendorId ?? record.createdByVendorId ?? nested?.vendorId ?? nested?.vendorProfileId;
  return value === undefined || value === null || value === '' ? null : String(value);
}

function productImage(product: VendorProductApiResponse) {
  const primary = product.images?.find((image) => image.isPrimary) || product.images?.[0];
  return primary?.url || primary?.imageUrl || product.imageUrl || product.image || '/logo.png';
}

function offerTarget(offer: Offer, products: VendorProductApiResponse[], categories: CategoryRecord[]) {
  if (offer.offerType === 'PRODUCT') {
    const id = offer.productIds?.[0];
    return products.find((product) => Number(product.id) === Number(id))?.name || offer.products?.[0]?.name || `Product #${id ?? '—'}`;
  }
  const id = offer.categoryIds?.[0];
  return categories.find((category) => Number(category.id) === Number(id))?.name || offer.categories?.[0]?.name || `Category #${id ?? '—'}`;
}

export function VendorOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<VendorProductApiResponse[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [draft, setDraft] = useState<OfferRequest>(emptyDraft);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectorsLoading, setSelectorsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      setOffers(await getVendorOffers());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load vendor offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOffers();
    let active = true;
    Promise.all([getVendorProducts(), getCategories(), getVendorProfile()]).then(([vendorProducts, allCategories, profile]) => {
      if (!active) return;
      const vendorId = profile?.id == null ? null : String(profile.id);
      setProducts(vendorProducts);
      setCategories(allCategories.filter((category) => vendorId !== null && ownerId(category) === vendorId));
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unable to load offer selectors.');
    }).finally(() => {
      if (active) setSelectorsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(search.trim().toLowerCase())), [products, search]);
  const visibleCategories = useMemo(() => categories.filter((category) => category.name.toLowerCase().includes(search.trim().toLowerCase())), [categories, search]);
  const selectedTarget = draft.offerType === 'PRODUCT' ? draft.productIds?.[0] : draft.categoryIds?.[0];

  const beginCreate = () => {
    setDraft({ ...emptyDraft, productIds: [], categoryIds: [] });
    setEditingId('new');
    setError(null);
    setSearch('');
  };

  const beginEdit = async (offer: Offer) => {
    setEditingId(offer.id);
    setError(null);
    try {
      const detail = await getVendorOffer(offer.id);
      setDraft({
        ...emptyDraft,
        name: detail.name,
        description: detail.description || '',
        offerType: detail.offerType === 'CATEGORY' ? 'CATEGORY' : 'PRODUCT',
        discountType: detail.discountType,
        discountValue: detail.discountValue,
        maximumDiscountAmount: detail.maximumDiscountAmount ?? null,
        startAt: detail.startAt,
        endAt: detail.endAt,
        active: detail.active,
        priority: detail.priority,
        productIds: detail.productIds || detail.products?.map((product) => Number(product.id)) || [],
        categoryIds: detail.categoryIds || detail.categories?.map((category) => Number(category.id)) || [],
      });
    } catch (reason) {
      setEditingId(null);
      setError(reason instanceof Error ? reason.message : 'Unable to load offer.');
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) return setError('Offer name is required.');
    if (!draft.startAt || !draft.endAt) return setError('Start and end dates are required.');
    if (new Date(draft.startAt) >= new Date(draft.endAt)) return setError('End date must be after the start date.');
    if (!Number.isFinite(Number(draft.discountValue)) || Number(draft.discountValue) <= 0) return setError('Discount value must be greater than zero.');
    if (draft.discountType === 'PERCENTAGE' && Number(draft.discountValue) > 100) return setError('Percentage discount cannot exceed 100.');
    if (draft.maximumDiscountAmount !== null && draft.maximumDiscountAmount !== undefined && (draft.maximumDiscountAmount === '' as never || !Number.isFinite(Number(draft.maximumDiscountAmount)) || Number(draft.maximumDiscountAmount) <= 0)) return setError('Maximum discount amount must be a positive amount when entered.');
    if (draft.offerType === 'PRODUCT' && !draft.productIds?.length) return setError('Select one of your products.');
    if (draft.offerType === 'CATEGORY' && !draft.categoryIds?.length) return setError('Select one of your categories.');

    const payload: OfferRequest = {
      name: draft.name.trim(),
      description: draft.description?.trim() || draft.name.trim(),
      offerType: draft.offerType,
      discountType: draft.discountType,
      discountValue: Number(draft.discountValue),
      maximumDiscountAmount: draft.maximumDiscountAmount === null || draft.maximumDiscountAmount === undefined || draft.maximumDiscountAmount === '' as never ? null : Number(draft.maximumDiscountAmount),
      startAt: draft.startAt,
      endAt: draft.endAt,
      active: draft.active,
      priority: Number(draft.priority) || 0,
      productIds: draft.offerType === 'PRODUCT' ? [Number(draft.productIds?.[0])] : [],
      categoryIds: draft.offerType === 'CATEGORY' ? [Number(draft.categoryIds?.[0])] : [],
    };

    setSaving(true);
    setError(null);
    try {
      if (editingId === 'new') {
        await createVendorOffer(payload);
        showToast('Offer created', 'Your vendor offer was created successfully.', 'success');
      } else if (editingId !== null) {
        await updateVendorOffer(editingId, payload);
        showToast('Offer updated', 'Your vendor offer was updated successfully.', 'success');
      }
      setEditingId(null);
      await loadOffers();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to save offer.';
      setError(message);
      showToast('Offer save failed', message, 'warning');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (offer: Offer) => {
    if (!window.confirm(`Delete offer "${offer.name}"?`)) return;
    try {
      await deleteVendorOffer(offer.id);
      setOffers((current) => current.filter((item) => item.id !== offer.id));
      showToast('Offer deleted', 'The vendor offer was deleted.', 'success');
    } catch (reason) {
      showToast('Delete failed', reason instanceof Error ? reason.message : 'Unable to delete offer.', 'warning');
    }
  };

  const updateDraft = <K extends keyof OfferRequest>(key: K, value: OfferRequest[K]) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <SectionShell title="Vendor offers" subtitle="Create discounts for your own products and categories">
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Commerce</p><h2 className="mt-1 text-2xl font-semibold text-white">Offers</h2></div>
            <PrimaryButton type="button" onClick={beginCreate} icon={<Plus className="h-4 w-4" />}>Create offer</PrimaryButton>
          </div>

          {editingId !== null ? (
            <Card className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.22em] text-blue-300">{editingId === 'new' ? 'New offer' : 'Edit offer'}</p><h3 className="mt-1 text-xl font-semibold text-white">Offer details</h3></div><SecondaryButton type="button" onClick={() => setEditingId(null)}>Cancel</SecondaryButton></div>
              <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                <label><span className="mb-1.5 block text-sm text-slate-300">Offer name</span><input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
                <label><span className="mb-1.5 block text-sm text-slate-300">Description</span><input value={draft.description || ''} onChange={(event) => updateDraft('description', event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
                <label><span className="mb-1.5 block text-sm text-slate-300">Discount type</span><select value={draft.discountType} onChange={(event) => updateDraft('discountType', event.target.value as DiscountType)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed amount</option></select></label>
                <label><span className="mb-1.5 block text-sm text-slate-300">Discount value</span><input type="number" min="0" step="any" value={draft.discountValue} onChange={(event) => updateDraft('discountValue', Number(event.target.value))} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
                <label><span className="mb-1.5 block text-sm text-slate-300">Maximum discount amount</span><input type="number" min="0" step="any" value={draft.maximumDiscountAmount ?? ''} onChange={(event) => updateDraft('maximumDiscountAmount', event.target.value === '' ? null : Number(event.target.value))} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
                <label><span className="mb-1.5 block text-sm text-slate-300">Start date</span><input type="datetime-local" value={toLocalInput(draft.startAt)} onChange={(event) => updateDraft('startAt', event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
                <label><span className="mb-1.5 block text-sm text-slate-300">End date</span><input type="datetime-local" value={toLocalInput(draft.endAt)} onChange={(event) => updateDraft('endAt', event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
                <label><span className="mb-1.5 block text-sm text-slate-300">Target type</span><select value={draft.offerType} onChange={(event) => updateDraft('offerType', event.target.value as 'PRODUCT' | 'CATEGORY')} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white"><option value="PRODUCT">Product</option><option value="CATEGORY">Category</option></select></label>
                <label className="flex items-center gap-2 self-end text-sm text-slate-200"><input type="checkbox" checked={draft.active} onChange={(event) => updateDraft('active', event.target.checked)} /> Active</label>
                <div className="md:col-span-2 rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium text-slate-300">{draft.offerType === 'PRODUCT' ? 'Your product' : 'Your category'}</span><span className="text-xs text-slate-500">{selectedTarget ? '1 selected' : 'Required'}</span></div>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 px-3"><Search className="h-4 w-4 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${draft.offerType === 'PRODUCT' ? 'products' : 'categories'}...`} className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none" /></div>
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-white/10">
                    {selectorsLoading ? <p className="p-3 text-sm text-slate-400">Loading your selectors...</p> : draft.offerType === 'PRODUCT' ? visibleProducts.map((product) => <button type="button" key={product.id} onClick={() => updateDraft('productIds', [Number(product.id)])} className={`flex w-full items-center gap-3 border-b border-white/5 px-3 py-2 text-left last:border-0 ${Number(selectedTarget) === Number(product.id) ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}><img src={productImage(product)} alt="" className="h-9 w-9 rounded object-cover" /><span className="min-w-0 flex-1 truncate text-sm text-white">{product.name}</span><span className="text-xs text-slate-400">₹{product.price}</span></button>) : visibleCategories.map((category) => <button type="button" key={category.id} onClick={() => updateDraft('categoryIds', [Number(category.id)])} className={`w-full border-b border-white/5 px-3 py-2 text-left text-sm last:border-0 ${Number(selectedTarget) === Number(category.id) ? 'bg-blue-500/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}>{category.name}</button>)}
                    {!selectorsLoading && ((draft.offerType === 'PRODUCT' && visibleProducts.length === 0) || (draft.offerType === 'CATEGORY' && visibleCategories.length === 0)) ? <p className="p-3 text-sm text-slate-400">No owned {draft.offerType === 'PRODUCT' ? 'products' : 'categories'} found.</p> : null}
                  </div>
                </div>
                {error ? <p className="md:col-span-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
                <div className="md:col-span-2 flex justify-end"><PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save offer'}</PrimaryButton></div>
              </form>
            </Card>
          ) : null}

          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.22em] text-blue-300">Your promotions</p><h3 className="mt-1 text-xl font-semibold text-white">Offers</h3></div><SecondaryButton type="button" onClick={() => void loadOffers()} icon={<RefreshCw className="h-4 w-4" />}>Refresh</SecondaryButton></div>
            {loading ? <SkeletonTable /> : error && offers.length === 0 ? <ErrorState title="Unable to load offers" description={error} /> : offers.length === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">No vendor offers yet.</p> : <div className="space-y-3">{offers.map((offer) => <div key={offer.id} className="grid gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-white">{offer.name}</h4><Badge className={offer.active ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-400'}>{offer.active ? 'Active' : 'Inactive'}</Badge><Badge>{label(offer.offerType)}</Badge></div><p className="mt-1 text-sm text-slate-400">{offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`} · {offerTarget(offer, products, categories)}</p></div><div className="text-sm text-slate-400">{offer.startAt ? new Date(offer.startAt).toLocaleDateString() : 'Now'} - {offer.endAt ? new Date(offer.endAt).toLocaleDateString() : 'Open'}</div><div className="flex flex-wrap gap-2"><SecondaryButton type="button" onClick={() => void beginEdit(offer)} icon={<Pencil className="h-4 w-4" />}>Edit</SecondaryButton><button type="button" onClick={() => void remove(offer)} className="inline-flex items-center gap-1 rounded-lg border border-rose-400/30 px-3 py-2 text-sm text-rose-300"><Trash2 className="h-4 w-4" /> Delete</button></div></div>)}</div>}
          </Card>
        </main>
      </div>
    </SectionShell>
  );
}

export default VendorOffersPage;
