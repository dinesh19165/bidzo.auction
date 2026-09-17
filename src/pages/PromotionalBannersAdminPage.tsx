import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { AdminShell } from '../components/admin/AdminShell';
import { Badge, PrimaryButton, SecondaryButton } from '../components/common/Buttons';
import { Card } from '../components/common/Card';
import { SkeletonTable } from '../components/loading/LoadingComponents';
import { showToast } from '../components/ui/toast';
import { createPromotionalBanner, deletePromotionalBanner, getAdminPromotionalBanners, updatePromotionalBanner, type PromotionalBanner, type PromotionalBannerInput } from '../api/promotionalBannerApi';
import { uploadToCloudinaryAsset } from '../services/cloudinaryUpload';

const emptyDraft: PromotionalBannerInput = {
  title: '',
  subtitle: '',
  buttonText: '',
  buttonLink: '',
  displayOrder: 1,
  active: true,
};

function imagePreviewUrl(banner: PromotionalBanner): string {
  return banner.imageUrl;
}

export function PromotionalBannersAdminPage() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [draft, setDraft] = useState<PromotionalBannerInput>(emptyDraft);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      setBanners(await getAdminPromotionalBanners());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load promotional banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const resetForm = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setEditingId(null);
    setDraft(emptyDraft);
    setPreviewUrl(null);
  };

  const beginCreate = () => {
    resetForm();
    setEditingId('new');
  };

  const beginEdit = (banner: PromotionalBanner) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setEditingId(banner.id);
    setDraft({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      buttonText: banner.buttonText ?? '',
      buttonLink: banner.buttonLink ?? '',
      displayOrder: Number(banner.displayOrder) || 1,
      active: banner.active,
    });
    setPreviewUrl(imagePreviewUrl(banner));
    setError(null);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.currentTarget.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError('Choose a JPEG, PNG, or WEBP image up to 10 MB.');
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewUrl(objectUrlRef.current);
    setUploading(true);
    setError(null);
    try {
      const asset = await uploadToCloudinaryAsset(file);
      setDraft((current) => ({ ...current, imagePublicId: asset.publicId }));
      setPreviewUrl(asset.secureUrl);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    } catch (reason) {
      setDraft((current) => ({ ...current, imagePublicId: undefined }));
      setError(reason instanceof Error ? reason.message : 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const updateDraft = <K extends keyof PromotionalBannerInput>(key: K, value: PromotionalBannerInput[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (editingId === 'new' && !draft.imagePublicId) {
      setError('Choose an image before creating the banner.');
      return;
    }
    if (uploading) {
      setError('Wait for the image upload to finish.');
      return;
    }
    if (!Number.isInteger(Number(draft.displayOrder)) || Number(draft.displayOrder) < 0) {
      setError('Display order must be a non-negative whole number.');
      return;
    }

    setSaving(true);
    setError(null);
    const payload = { ...draft, title: draft.title.trim(), subtitle: draft.subtitle.trim(), buttonText: draft.buttonText.trim(), buttonLink: draft.buttonLink.trim(), displayOrder: Number(draft.displayOrder) };
    try {
      if (editingId === 'new') {
        await createPromotionalBanner(payload);
        showToast('Banner created', 'The promotional banner was saved successfully.', 'success');
      } else if (editingId !== null) {
        await updatePromotionalBanner(editingId, payload);
        showToast('Banner updated', 'The promotional banner was updated successfully.', 'success');
      }
      resetForm();
      await loadBanners();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Failed to save promotional banner.';
      setError(message);
      showToast('Banner save failed', message, 'warning');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner: PromotionalBanner) => {
    try {
      await updatePromotionalBanner(banner.id, {
        title: banner.title,
        subtitle: banner.subtitle ?? '',
        buttonText: banner.buttonText ?? '',
        buttonLink: banner.buttonLink ?? '',
        displayOrder: Number(banner.displayOrder) || 0,
        active: !banner.active,
      });
      setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, active: !banner.active } : item));
      showToast('Banner status updated', `Banner is now ${banner.active ? 'inactive' : 'active'}.`, 'success');
    } catch (reason) {
      showToast('Status update failed', reason instanceof Error ? reason.message : 'Failed to update banner status.', 'warning');
    }
  };

  const handleDelete = async (banner: PromotionalBanner) => {
    if (!window.confirm(`Delete promotional banner "${banner.title}"?`)) return;
    try {
      await deletePromotionalBanner(banner.id);
      setBanners((current) => current.filter((item) => item.id !== banner.id));
      if (editingId === banner.id) resetForm();
      showToast('Banner deleted', 'The promotional banner was deleted successfully.', 'success');
    } catch (reason) {
      showToast('Delete failed', reason instanceof Error ? reason.message : 'Failed to delete promotional banner.', 'warning');
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Promotional Banners" breadcrumbs={[{ label: 'Admin' }, { label: 'Promotional Banners' }]} activePath="/admin/promotional-banners" actions={<PrimaryButton onClick={beginCreate} icon={<Plus className="h-4 w-4" />}>Add banner</PrimaryButton>}>
      <div className="space-y-6">
        {editingId !== null ? (
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">{editingId === 'new' ? 'New banner' : 'Edit banner'}</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Homepage promotion</h2>
              </div>
              <SecondaryButton type="button" onClick={resetForm}>Cancel</SecondaryButton>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Title</span><input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none focus:border-blue-400" /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Subtitle</span><input value={draft.subtitle} onChange={(event) => updateDraft('subtitle', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none focus:border-blue-400" /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Button text</span><input value={draft.buttonText} onChange={(event) => updateDraft('buttonText', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none focus:border-blue-400" /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Button link</span><input value={draft.buttonLink} onChange={(event) => updateDraft('buttonLink', event.target.value)} placeholder="/marketplace" className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none focus:border-blue-400" /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Display order</span><input type="number" min="0" step="1" value={draft.displayOrder} onChange={(event) => updateDraft('displayOrder', Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none focus:border-blue-400" /></label>
              <label className="flex items-center gap-3 self-end rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-200"><input type="checkbox" checked={draft.active} onChange={(event) => updateDraft('active', event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-900 text-blue-600" /> Active on homepage</label>
              <div className="lg:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-300">Image {editingId !== 'new' ? <span className="text-xs text-slate-500">(optional when keeping the current image)</span> : null}</span><label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-slate-900/50 px-4 py-5 text-center hover:border-blue-400/60"><ImagePlus className="h-6 w-6 text-blue-300" /><span className="text-sm font-medium text-white">{uploading ? 'Uploading image...' : 'Choose image'}</span><span className="text-xs text-slate-400">JPEG, PNG, or WEBP up to 10 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="sr-only" disabled={uploading} /></label></div>
              {previewUrl ? <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-900"><img src={previewUrl} alt="Promotional banner preview" className="aspect-[3/1] w-full object-cover" /></div> : null}
              {error ? <p className="lg:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
              <div className="lg:col-span-2 flex justify-end"><PrimaryButton type="submit" disabled={saving || uploading}>{uploading ? 'Uploading image...' : saving ? 'Saving...' : editingId === 'new' ? 'Create banner' : 'Save changes'}</PrimaryButton></div>
            </form>
          </Card>
        ) : null}

        <Card className="p-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Homepage content</p><h2 className="mt-1 text-xl font-semibold text-white">All promotional banners</h2></div><SecondaryButton type="button" onClick={() => void loadBanners()} icon={<RefreshCw className="h-4 w-4" />}>Refresh</SecondaryButton></div>
          {error && editingId === null ? <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
          {loading ? <SkeletonTable /> : banners.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center"><p className="font-semibold text-white">No promotional banners yet</p><p className="mt-2 text-sm text-slate-400">Create a banner to populate the homepage promotion rail.</p><PrimaryButton type="button" onClick={beginCreate} className="mt-4" icon={<Plus className="h-4 w-4" />}>Add banner</PrimaryButton></div> : <div className="space-y-3">{banners.map((banner) => <div key={banner.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 lg:flex-row lg:items-center"><img src={imagePreviewUrl(banner)} alt="" className="h-24 w-full rounded-xl object-cover lg:w-40" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{banner.title}</h3><Badge className={banner.active ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-400'}>{banner.active ? 'Active' : 'Inactive'}</Badge></div><p className="mt-1 line-clamp-2 text-sm text-slate-400">{banner.subtitle || 'No subtitle'}</p><p className="mt-2 text-xs text-slate-500">Button: {banner.buttonText || 'Shop Now'} · Order: {banner.displayOrder}</p></div><div className="flex flex-wrap gap-2 lg:justify-end"><SecondaryButton type="button" onClick={() => void handleToggle(banner)}>{banner.active ? 'Disable' : 'Enable'}</SecondaryButton><SecondaryButton type="button" onClick={() => beginEdit(banner)} icon={<Pencil className="h-4 w-4" />}>Edit</SecondaryButton><button type="button" onClick={() => void handleDelete(banner)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-rose-400/20 px-4 py-2 font-medium text-rose-200 transition hover:bg-rose-500/10"><Trash2 className="h-4 w-4" />Delete</button></div></div>)}</div>}
        </Card>
      </div>
    </AdminShell>
  );
}
