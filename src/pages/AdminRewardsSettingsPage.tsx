import { useEffect, useState } from 'react';
import { AdminShell } from '../components/admin/AdminShell';
import { Card } from '../components/common/Card';
import { ErrorState } from '../components/loading/LoadingComponents';
import { getAdminRewardsSettings, updateAdminRewardsSettings, type RewardsSettings } from '../api/adminSettingsApi';

type FormState = RewardsSettings;

const fields: Array<{ key: keyof RewardsSettings; label: string; type: 'boolean' | 'number' }> = [
  { key: 'referralEnabled', label: 'Referral enabled', type: 'boolean' },
  { key: 'referrerRewardAmount', label: 'Referrer reward amount', type: 'number' },
  { key: 'referredRewardAmount', label: 'Referred customer reward amount', type: 'number' },
  { key: 'loyaltyEnabled', label: 'Loyalty enabled', type: 'boolean' },
  { key: 'loyaltyPointsPerAmount', label: 'Points per purchase amount', type: 'number' },
  { key: 'loyaltyAmountUnit', label: 'Purchase amount unit', type: 'number' },
  { key: 'loyaltyRedemptionEnabled', label: 'Loyalty redemption enabled', type: 'boolean' },
  { key: 'loyaltyPointsPerCurrency', label: 'Points to currency conversion', type: 'number' },
];

export function AdminRewardsSettingsPage() {
  const [form, setForm] = useState<FormState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try { setForm(await getAdminRewardsSettings()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load rewards settings.'); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try { await updateAdminRewardsSettings(form); await load(); setSuccess('Rewards settings saved.'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save rewards settings.'); } finally { setSaving(false); }
  };

  return <AdminShell title="Enterprise admin" subtitle="Rewards and referral settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Rewards' }]} activePath="/admin/settings">
    <Card className="p-4 sm:p-5">
      {loading ? <p className="text-sm text-slate-400">Loading rewards settings...</p> : error && !Object.keys(form).length ? <ErrorState title="Unable to load rewards settings" description={error} /> : <>
        {error ? <p className="mb-4 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
        {success ? <p className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => field.type === 'boolean' ? <label key={String(field.key)} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200"><span>{field.label}</span><input type="checkbox" checked={Boolean(form[field.key])} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.checked }))} /></label> : <label key={String(field.key)} className="text-sm text-slate-300">{field.label}<input type="number" value={form[field.key] === undefined || form[field.key] === null ? '' : String(form[field.key])} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-white outline-none focus:border-blue-400/40" /></label>)}</div>
        <button type="button" disabled={saving} onClick={() => void save()} className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save rewards settings'}</button>
      </>}
    </Card>
  </AdminShell>;
}
