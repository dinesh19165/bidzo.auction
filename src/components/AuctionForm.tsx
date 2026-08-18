import React, { useEffect, useState } from 'react';

export interface AuctionFormData {
  title: string;
  reserve: string;
  durationDays: number;
  bidIncrement: string;
  description: string;
  startAt: string;
  endAt: string;
}

interface Props {
  initial?: Partial<AuctionFormData>;
  onChange?: (data: AuctionFormData) => void;
  onValidate?: (isValid: boolean) => void;
}

export const AuctionForm: React.FC<Props> = ({ initial, onChange, onValidate }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [reserve, setReserve] = useState(initial?.reserve || '');
  const [durationDays, setDurationDays] = useState(initial?.durationDays || 3);
  const [bidIncrement, setBidIncrement] = useState(initial?.bidIncrement || '₹5,000');
  const [description, setDescription] = useState(initial?.description || '');
  const [startDate, setStartDate] = useState(initial?.startAt || '');
  const [endDate, setEndDate] = useState(initial?.endAt || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');

  useEffect(() => {
    setTitle(initial?.title || '');
    setReserve(initial?.reserve || '');
    setDurationDays(initial?.durationDays || 3);
    setBidIncrement(initial?.bidIncrement || '₹5,000');
    setDescription(initial?.description || '');
    setStartDate(initial?.startAt || '');
    setEndDate(initial?.endAt || '');
  }, [initial]);

  useEffect(() => {
    onChange?.({ title, reserve, durationDays, bidIncrement, description, startAt: startDate, endAt: endDate });
  }, [title, reserve, durationDays, bidIncrement, description, startDate, endDate]);

  useEffect(() => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!reserve.trim()) next.reserve = 'Reserve price required';
    if (!description.trim()) next.description = 'Description is required';
    if (!bidIncrement.trim()) next.bidIncrement = 'Bid increment required';
    if (!startDate) next.startAt = 'Start time is required';
    if (!endDate) next.endAt = 'End time is required';
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) next.endDate = 'End date must be after start date';
    setErrors(next);
    onValidate?.(Object.keys(next).length === 0);
  }, [title, reserve, bidIncrement, description, startDate, endDate]);

  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 800);
    return () => clearTimeout(t);
  }, [title, reserve, durationDays, bidIncrement, description, startDate, endDate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-400">Auction title</label>
        <input placeholder="e.g. Vintage Camera Kit (Lot #12)" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        {errors.title && <div className="mt-1 text-sm text-rose-400">{errors.title}</div>}
      </div>
      <div>
        <label className="text-sm text-slate-400">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the item, condition, and bidding details" className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        {errors.description && <div className="mt-1 text-sm text-rose-400">{errors.description}</div>}
      </div>
      <div>
        <label className="text-sm text-slate-400">Reserve price</label>
        <input placeholder="₹0" value={reserve} onChange={(e) => setReserve(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        {errors.reserve && <div className="mt-1 text-sm text-rose-400">{errors.reserve}</div>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-400">Duration (days)</label>
          <input type="number" value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-sm text-slate-400">Bid increment</label>
          <input value={bidIncrement} onChange={(e) => setBidIncrement(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-400">Start time</label>
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
          {errors.startAt && <div className="mt-1 text-sm text-rose-400">{errors.startAt}</div>}
        </div>
        <div>
          <label className="text-sm text-slate-400">End time</label>
          <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white" />
          {errors.endDate && <div className="mt-1 text-sm text-rose-400">{errors.endDate}</div>}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <div className="font-medium text-white">Preview</div>
        <div className="mt-2">{title || 'Untitled auction'} • Reserve {reserve} • {durationDays} days • {description || 'No description yet'}</div>
      </div>

      <div className="text-sm text-slate-400">Autosave status: {autosaveStatus}</div>
    </div>
  );
};

export default AuctionForm;
