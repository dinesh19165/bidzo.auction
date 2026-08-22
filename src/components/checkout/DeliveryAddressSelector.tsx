import { useEffect, useState } from 'react';
import { buildAddressPayload, createAddress, getAddresses, type AddressRequest, type AddressResponse } from '../../api/addressApi';

type Props = {
  selectedAddressId?: number;
  onSelect: (address: AddressResponse) => void;
};

export default function DeliveryAddressSelector({ selectedAddressId, onSelect }: Props) {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AddressRequest>({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: true });

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
    <div className="space-y-4">
      {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}
      {loading ? <p className="text-sm text-slate-400">Loading addresses...</p> : addresses.length === 0 ? <p className="text-sm text-slate-400">No saved addresses. Add a delivery address to continue.</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => {
            const selected = selectedAddressId === address.id;
            return <button type="button" key={address.id} onClick={() => onSelect(address)} className={`rounded-[24px] border p-5 text-left text-sm transition ${selected ? 'border-blue-400 bg-blue-500/10 text-white ring-1 ring-blue-400/50' : 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/20'}`}>
              <p className="font-semibold">{address.fullName}</p>
              <p className="mt-1 text-slate-400">{address.phone}</p>
              <p className="mt-3">{address.addressLine1}</p>
              {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
              <p className="mt-1">{address.city}, {address.state} {address.postalCode}</p>
              <p className="mt-1 text-slate-400">{address.country}</p>
            </button>;
          })}
        </div>
      )}
      <button type="button" onClick={() => setShowForm((current) => !current)} className="rounded-full border border-blue-400/30 px-4 py-2 text-sm font-medium text-blue-200 hover:bg-blue-500/10">{showForm ? 'Cancel' : 'Add New Address'}</button>
      {showForm ? <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-5 md:grid-cols-2">
        {(['fullName', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country'] as const).map((field) => <input key={field} value={form[field] || ''} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />)}
        <button type="button" onClick={addAddress} disabled={creating} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{creating ? 'Adding...' : 'Save Address'}</button>
      </div> : null}
    </div>
  );
}
