import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { buildAddressPayload, createAddress, getAddresses, type AddressRequest, type AddressResponse } from '../../api/addressApi';
import { useThemeContext } from '../../context/ThemeContext';

type Props = {
  selectedAddressId?: number;
  onSelect: (address: AddressResponse) => void;
  compact?: boolean;
};

export default function DeliveryAddressSelector({ selectedAddressId, onSelect, compact = false }: Props) {
  const { theme } = useThemeContext();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AddressRequest>({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: true });
  const [showSavedAddresses, setShowSavedAddresses] = useState(!compact);

  const loadAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      setAddresses(await getAddresses());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load delivery addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAddresses(); }, []);

  const addAddress = async () => {
    const payloadResult = buildAddressPayload(form);
    if (typeof payloadResult === 'string') {
      setError(payloadResult);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      console.debug('ADD ADDRESS PAYLOAD', payloadResult);
      const created = await createAddress(payloadResult);
      const refreshed = await getAddresses();
      setAddresses(refreshed);
      onSelect(created);
      setShowForm(false);
      setForm({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create delivery address.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      {error ? <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div> : null}
      {loading ? <p className="text-sm text-slate-400">Loading addresses...</p> : addresses.length === 0 ? <p className="text-sm text-slate-400">No saved addresses. Add a delivery address to continue.</p> : compact && selectedAddressId && !showSavedAddresses ? (
        <div className={`${compact ? 'flex items-start justify-between gap-3 py-1' : 'rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3'}`}>
          {(() => {
            const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
            if (!selectedAddress) return <p className="text-sm text-slate-400">Select a delivery address to continue.</p>;
            return <div className={`min-w-0 rounded-xl border p-3 text-sm ${theme === 'light' ? 'border-blue-300 bg-blue-50 text-slate-700' : 'border-sky-400/40 bg-sky-500/10 text-slate-200'}`}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedAddress.fullName}</p><span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">{selectedAddress.label || 'Address'}</span></div><p className="mt-1 leading-5">{selectedAddress.addressLine1}{selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p><p className="mt-1 text-slate-400">{selectedAddress.phone}</p></div><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white" aria-label="Selected address"><Check className="h-4 w-4" /></span></div></div>;
          })()}
          <button type="button" onClick={() => setShowSavedAddresses(true)} className="shrink-0 px-0 text-sm font-semibold text-sky-300 hover:text-sky-200">Change</button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {addresses.map((address) => {
            const selected = selectedAddressId === address.id;
            return <button type="button" key={address.id} aria-selected={selected} onClick={() => onSelect(address)} className={`${compact ? 'rounded-xl border p-3' : 'rounded-2xl border p-4'} group relative w-full text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${selected ? theme === 'light' ? 'border-blue-400 bg-blue-50 text-slate-900 shadow-sm' : 'border-sky-400/60 bg-sky-500/10 text-white' : theme === 'light' ? 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50' : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-start justify-between gap-2"><div className="flex min-w-0 flex-wrap items-center gap-2"><p className="font-semibold">{address.fullName}</p>{compact ? <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">{address.label || 'Address'}</span> : null}</div>{selected ? <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white" aria-hidden="true"><Check className="h-4 w-4" /></span> : null}</div>
              <p className="mt-0.5 text-slate-400">{address.phone}</p>
              <p className="mt-1 leading-5">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
              <p className="leading-5">{address.city}, {address.state} {address.postalCode}</p>
              {!compact ? <p className="mt-1 text-slate-400">{address.country}</p> : null}
            </button>;
          })}
        </div>
      )}
      {compact && selectedAddressId && showSavedAddresses ? <button type="button" onClick={() => setShowSavedAddresses(false)} className="rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5">Use selected address</button> : null}
      <button type="button" onClick={() => setShowForm((current) => !current)} className="px-0 py-1 text-sm font-medium text-blue-300 hover:text-blue-200">{showForm ? 'Cancel' : 'Add New Address'}</button>
      {showForm ? <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 md:grid-cols-2">
        {(['fullName', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country'] as const).map((field) => <input key={field} value={form[field] || ''} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />)}
        <button type="button" onClick={addAddress} disabled={creating} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{creating ? 'Adding...' : 'Save Address'}</button>
      </div> : null}
    </div>
  );
}
