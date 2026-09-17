import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { AdminShell } from '../components/admin/AdminShell';
import { Badge, PrimaryButton, SecondaryButton } from '../components/common/Buttons';
import { Card } from '../components/common/Card';
import { ErrorState, SkeletonTable } from '../components/loading/LoadingComponents';
import { showToast } from '../components/ui/toast';
import { createOffer, deleteOffer, getAdminOffer, getAdminOfferCategories, getAdminOfferProducts, getAdminOffers, updateOffer, type AdminOfferCategory, type AdminOfferProduct, type DiscountType, type Offer, type OfferRequest, type OfferType } from '../api/offerApi';

const offerTypes: OfferType[] = ['NEW_USER', 'PRODUCT', 'CATEGORY', 'ALL_PRODUCTS', 'COUPON'];
const discountTypes: DiscountType[] = ['PERCENTAGE', 'FIXED_AMOUNT'];
const emptyDraft: OfferRequest = { name: '', description: '', offerType: 'ALL_PRODUCTS', discountType: 'PERCENTAGE', discountValue: 0, minimumOrderAmount: null, maximumDiscountAmount: null, couponCode: null, usageLimit: null, usageLimitPerCustomer: null, startAt: null, endAt: null, priority: 0, active: true, productIds: [], categoryIds: [] };

function toLocalInput(value?: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return value.slice(0, 16);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(0, 16) : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function label(value: string): string { return value.replaceAll('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase()); }

export function OffersAdminPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<AdminOfferProduct[]>([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState<AdminOfferProduct[]>([]);
  const [categories, setCategories] = useState<AdminOfferCategory[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectorLoading, setSelectorLoading] = useState(false);
  const [selectorError, setSelectorError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [draft, setDraft] = useState<OfferRequest>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      setOffers(await getAdminOffers());
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load offers.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (editingId !== 'new' && editingId !== null) return;
    let active = true;
    setSelectorLoading(true);
    setSelectorError(null);
    Promise.all([getAdminOfferProducts(productSearch), getAdminOfferCategories()]).then(([productRows, categoryRows]) => {
      if (!active) return;
      setProducts(productRows);
      setSelectedProductDetails((current) => [...current.filter((item) => !productRows.some((row) => Number(row.id) === Number(item.id))), ...productRows.filter((row) => (draft.productIds ?? []).includes(Number(row.id))),]);
      setCategories(categoryRows);
    }).catch((reason) => {
      if (active) setSelectorError(reason instanceof Error ? reason.message : 'Unable to load offer selectors.');
    }).finally(() => {
      if (active) setSelectorLoading(false);
    });
    return () => { active = false; };
  }, [editingId, productSearch]);

  const update = <K extends keyof OfferRequest>(key: K, value: OfferRequest[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const beginCreate = () => { setDraft({ ...emptyDraft, productIds: [], categoryIds: [] }); setSelectedProductDetails([]); setEditingId('new'); setError(null); };
  const beginEdit = async (offer: Offer) => { setEditingId(offer.id); setError(null); try { const detail = await getAdminOffer(offer.id); const detailProductIds = detail.productIds ?? detail.products?.map((item) => Number(item.id)) ?? []; setSelectedProductDetails(detail.products?.map((item) => ({ id: item.id, name: item.name || `Product ${item.id}`, categoryId: item.categoryId, categoryName: item.categoryName })) ?? []); setDraft({ name: detail.name, description: detail.description ?? '', offerType: detail.offerType, discountType: detail.discountType, discountValue: detail.discountValue, minimumOrderAmount: detail.minimumOrderAmount ?? null, maximumDiscountAmount: detail.maximumDiscountAmount ?? null, couponCode: detail.couponCode ?? null, usageLimit: detail.usageLimit ?? null, usageLimitPerCustomer: detail.usageLimitPerCustomer ?? null, startAt: detail.startAt ?? null, endAt: detail.endAt ?? null, priority: detail.priority, active: detail.active, productIds: detailProductIds, categoryIds: detail.categoryIds ?? detail.categories?.map((item) => Number(item.id)) ?? [] }); } catch (reason) { setEditingId(null); setError(reason instanceof Error ? reason.message : 'Unable to load offer details.'); } };
  const cancel = () => { setEditingId(null); setError(null); };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.description.trim()) return setError('Offer name and description are required.');
    if (!draft.startAt) return setError('Start date/time is required.');
    if (!draft.endAt) return setError('End date/time is required.');
    if (!Number.isFinite(Number(draft.discountValue)) || Number(draft.discountValue) <= 0) return setError('Discount value must be greater than zero.');
    if (draft.discountType === 'PERCENTAGE' && Number(draft.discountValue) > 100) return setError('Percentage discount cannot exceed 100.');
    if (draft.offerType === 'PRODUCT' && !draft.productIds?.length) return setError('Select at least one product.');
    if (draft.offerType === 'CATEGORY' && !draft.categoryIds?.length) return setError('Select at least one category.');
    if (draft.offerType === 'COUPON' && !draft.couponCode?.trim()) return setError('Coupon code is required for coupon offers.');
    setSaving(true); setError(null);
    const payload: OfferRequest = { ...draft, name: draft.name.trim(), description: draft.description.trim(), discountValue: Number(draft.discountValue), priority: Number(draft.priority) || 0, minimumOrderAmount: draft.minimumOrderAmount === null || draft.minimumOrderAmount === undefined || draft.minimumOrderAmount === '' as never ? null : Number(draft.minimumOrderAmount), maximumDiscountAmount: draft.maximumDiscountAmount === null || draft.maximumDiscountAmount === undefined || draft.maximumDiscountAmount === '' as never ? null : Number(draft.maximumDiscountAmount), usageLimit: draft.usageLimit === null || draft.usageLimit === undefined || draft.usageLimit === '' as never ? null : Number(draft.usageLimit), usageLimitPerCustomer: draft.usageLimitPerCustomer === null || draft.usageLimitPerCustomer === undefined || draft.usageLimitPerCustomer === '' as never ? null : Number(draft.usageLimitPerCustomer), startAt: draft.startAt, endAt: draft.endAt, couponCode: draft.offerType === 'COUPON' ? draft.couponCode?.trim() || null : null, productIds: draft.offerType === 'PRODUCT' ? draft.productIds : [], categoryIds: draft.offerType === 'CATEGORY' ? draft.categoryIds : [] };
    if (import.meta.env.DEV) console.debug('[OffersAdminPage] saving offer payload', payload);
    try { if (editingId === 'new') { await createOffer(payload); showToast('Offer created', 'The offer is now available to the platform.', 'success'); } else if (editingId !== null) { await updateOffer(editingId, payload); showToast('Offer updated', 'Offer settings were saved.', 'success'); } cancel(); await load(); }
    catch (reason) { const message = reason instanceof Error ? reason.message : 'Unable to save offer.'; setError(message); showToast('Offer save failed', message, 'warning'); }
    finally { setSaving(false); }
  };

  const toggle = async (offer: Offer) => { try { await updateOffer(offer.id, { name: offer.name, description: offer.description ?? '', offerType: offer.offerType, discountType: offer.discountType, discountValue: offer.discountValue, minimumOrderAmount: offer.minimumOrderAmount ?? null, maximumDiscountAmount: offer.maximumDiscountAmount ?? null, couponCode: offer.couponCode ?? null, usageLimit: offer.usageLimit ?? null, usageLimitPerCustomer: offer.usageLimitPerCustomer ?? null, startAt: offer.startAt ?? null, endAt: offer.endAt ?? null, priority: offer.priority, active: !offer.active, productIds: offer.productIds ?? [], categoryIds: offer.categoryIds ?? [] }); setOffers((current) => current.map((item) => item.id === offer.id ? { ...item, active: !offer.active } : item)); showToast('Offer status updated', 'Offer activation was updated.', 'success'); } catch (reason) { showToast('Status update failed', reason instanceof Error ? reason.message : 'Unable to update offer.', 'warning'); } };
  const remove = async (offer: Offer) => { if (!window.confirm(`Delete offer "${offer.name}"?`)) return; try { await deleteOffer(offer.id); setOffers((current) => current.filter((item) => item.id !== offer.id)); showToast('Offer deleted', 'The offer was deleted.', 'success'); } catch (reason) { showToast('Delete failed', reason instanceof Error ? reason.message : 'Unable to delete offer.', 'warning'); } };

  const numberField = (key: 'discountValue' | 'minimumOrderAmount' | 'maximumDiscountAmount' | 'usageLimit' | 'usageLimitPerCustomer' | 'priority', fieldLabel: string) => <label className="block"><span className="mb-1.5 block text-sm text-slate-300">{fieldLabel}</span><input type="number" min="0" step="any" value={draft[key] ?? ''} onChange={(event) => update(key, event.target.value === '' ? null : Number(event.target.value))} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-blue-400/50" /></label>;
  const toggleProduct = (id: number | string) => { const numericId = Number(id); const selected = (draft.productIds ?? []).includes(numericId); const product = products.find((item) => Number(item.id) === numericId); if (!selected && product) setSelectedProductDetails((current) => current.some((item) => Number(item.id) === numericId) ? current : [...current, product]); if (selected) setSelectedProductDetails((current) => current.filter((item) => Number(item.id) !== numericId)); update('productIds', selected ? (draft.productIds ?? []).filter((item) => item !== numericId) : [...(draft.productIds ?? []), numericId]); };
  const toggleCategory = (id: number | string) => { const numericId = Number(id); update('categoryIds', (draft.categoryIds ?? []).includes(numericId) ? (draft.categoryIds ?? []).filter((item) => item !== numericId) : [...(draft.categoryIds ?? []), numericId]); };
  const selectedProducts = (draft.productIds ?? []).map((id) => selectedProductDetails.find((product) => Number(product.id) === id) || products.find((product) => Number(product.id) === id)).filter((product): product is AdminOfferProduct => Boolean(product));
  const selectedCategories = (draft.categoryIds ?? []).map((id) => categories.find((category) => Number(category.id) === id)).filter((category): category is AdminOfferCategory => Boolean(category));
  const productSelector = draft.offerType === 'PRODUCT' ? <div className="md:col-span-2 rounded-xl border border-white/10 bg-slate-950/30 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium text-slate-300">Select Products</span><span className="text-xs text-slate-500">{draft.productIds?.length ?? 0} selected</span></div><div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 px-3"><Search className="h-4 w-4 text-slate-500" /><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products..." className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none" /></div>{selectedProducts.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{selectedProducts.map((product) => <span key={product.id} className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs text-blue-100"><Check className="h-3 w-3" />{product.name}<button type="button" onClick={() => toggleProduct(product.id)} aria-label={`Remove ${product.name}`}><X className="h-3 w-3" /></button></span>)}</div> : null}<div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-white/10">{selectorLoading ? <p className="p-3 text-sm text-slate-400">Loading products...</p> : selectorError ? <p className="p-3 text-sm text-rose-300">{selectorError}</p> : products.length === 0 ? <p className="p-3 text-sm text-slate-400">No products found.</p> : products.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-3 py-2.5 text-sm last:border-0 hover:bg-white/5"><input type="checkbox" checked={(draft.productIds ?? []).includes(Number(product.id))} onChange={() => toggleProduct(product.id)} /><span className="min-w-0 flex-1 truncate text-white">{product.name}</span><span className="shrink-0 text-xs text-slate-500">{product.categoryName || 'Uncategorized'}</span></label>)}</div></div> : null;
  const categorySelector = draft.offerType === 'CATEGORY' ? <div className="md:col-span-2 rounded-xl border border-white/10 bg-slate-950/30 p-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-slate-300">Select Category</span><span className="text-xs text-slate-500">{draft.categoryIds?.length ?? 0} selected</span></div>{selectedCategories.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{selectedCategories.map((category) => <span key={category.id} className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs text-blue-100"><Check className="h-3 w-3" />{category.name}<button type="button" onClick={() => toggleCategory(category.id)} aria-label={`Remove ${category.name}`}><X className="h-3 w-3" /></button></span>)}</div> : null}<div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-white/10">{selectorLoading ? <p className="p-3 text-sm text-slate-400">Loading categories...</p> : selectorError ? <p className="p-3 text-sm text-rose-300">{selectorError}</p> : categories.length === 0 ? <p className="p-3 text-sm text-slate-400">No published categories found.</p> : categories.map((category) => <label key={category.id} className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-3 py-2.5 text-sm last:border-0 hover:bg-white/5"><input type="checkbox" checked={(draft.categoryIds ?? []).includes(Number(category.id))} onChange={() => toggleCategory(category.id)} /><span className="text-white">{category.name}</span></label>)}</div></div> : null;

  return <AdminShell title="Enterprise admin" subtitle="Offers" breadcrumbs={[{ label: 'Admin' }, { label: 'Offers' }]} activePath="/admin/offers" actions={<PrimaryButton onClick={beginCreate} icon={<Plus className="h-4 w-4" />}>Create offer</PrimaryButton>}>
    <div className="space-y-5">
      {editingId !== null ? <Card className="p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.22em] text-blue-300">{editingId === 'new' ? 'New offer' : 'Edit offer'}</p><h2 className="mt-1 text-xl font-semibold text-white">Offer configuration</h2></div><SecondaryButton type="button" onClick={cancel}>Cancel</SecondaryButton></div><form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="mb-1.5 block text-sm text-slate-300">Offer name</span><input value={draft.name} onChange={(event) => update('name', event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
        <label className="block"><span className="mb-1.5 block text-sm text-slate-300">Description</span><input value={draft.description} onChange={(event) => update('description', event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
        <label className="block"><span className="mb-1.5 block text-sm text-slate-300">Offer type</span><select value={draft.offerType} onChange={(event) => update('offerType', event.target.value as OfferType)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white">{offerTypes.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
        <label className="block"><span className="mb-1.5 block text-sm text-slate-300">Discount type</span><select value={draft.discountType} onChange={(event) => update('discountType', event.target.value as DiscountType)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white">{discountTypes.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
        {numberField('discountValue', 'Discount value')}{numberField('minimumOrderAmount', 'Minimum order amount')}{numberField('maximumDiscountAmount', 'Maximum discount amount')}{numberField('usageLimit', 'Usage limit')}{numberField('usageLimitPerCustomer', 'Usage limit per customer')}{numberField('priority', 'Priority')}
        <label className="block"><span className="mb-1.5 block text-sm text-slate-300">Coupon code</span><input value={draft.couponCode ?? ''} onChange={(event) => update('couponCode', event.target.value)} disabled={draft.offerType !== 'COUPON'} placeholder="WELCOME10" className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white disabled:opacity-40" /></label>
        <label className="block"><span className="mb-1.5 block text-sm text-slate-300">Start date/time</span><input type="datetime-local" value={toLocalInput(draft.startAt)} onChange={(event) => update('startAt', event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
        <label className="block"><span className="mb-1.5 block text-sm text-slate-300">End date/time</span><input type="datetime-local" value={toLocalInput(draft.endAt)} onChange={(event) => update('endAt', event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white" /></label>
        {productSelector}{categorySelector}
        <label className="flex items-center gap-2 text-sm text-slate-200"><input type="checkbox" checked={draft.active} onChange={(event) => update('active', event.target.checked)} /> Active</label><div className="flex justify-end"><PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save offer'}</PrimaryButton></div>
        {error ? <p className="md:col-span-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
      </form></Card> : null}
      <Card className="p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Commerce rules</p><h2 className="mt-1 text-xl font-semibold text-white">All offers</h2></div><SecondaryButton type="button" onClick={() => void load()} icon={<RefreshCw className="h-4 w-4" />}>Refresh</SecondaryButton></div>{loading ? <SkeletonTable /> : error && offers.length === 0 ? <ErrorState title="Unable to load offers" description={error} /> : offers.length === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">No offers configured yet.</p> : <div className="space-y-3">{offers.map((offer) => <div key={offer.id} className="grid gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{offer.name}</h3><Badge className={offer.active ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-400'}>{offer.active ? 'Active' : 'Inactive'}</Badge><Badge>{label(offer.offerType)}</Badge></div><p className="mt-1 text-sm text-slate-400">{offer.description || 'No description'}</p><p className="mt-2 text-xs text-slate-500">{offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : `₹${offer.discountValue}`} · Priority {offer.priority}{offer.couponCode ? ` · Code ${offer.couponCode}` : ''}</p></div><div className="text-sm text-slate-400">{offer.startAt ? new Date(offer.startAt).toLocaleDateString() : 'Now'} - {offer.endAt ? new Date(offer.endAt).toLocaleDateString() : 'Open'}</div><div className="flex flex-wrap gap-2"><SecondaryButton type="button" onClick={() => void toggle(offer)}>{offer.active ? 'Deactivate' : 'Activate'}</SecondaryButton><SecondaryButton type="button" onClick={() => beginEdit(offer)} icon={<Pencil className="h-4 w-4" />}>Edit</SecondaryButton><button type="button" onClick={() => void remove(offer)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-400/20 px-3 py-2 text-sm text-rose-200"><Trash2 className="h-4 w-4" />Delete</button></div></div>)}</div>}</Card>
    </div>
  </AdminShell>;
}
