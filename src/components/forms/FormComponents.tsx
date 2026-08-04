import type { ChangeEvent, ReactNode } from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: ReactNode;
}

export function Input({ label, placeholder, value, onChange, type = 'text', icon }: InputProps) {
  return (
    <label className="block text-sm text-slate-300">
      {label && <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>}
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-inner shadow-slate-900">
        {icon}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-transparent outline-none" />
      </div>
    </label>
  );
}

export function Select({ label, options, value, onChange }: { label?: string; options: Array<{ label: string; value: string }>; value?: string; onChange?: (event: ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <label className="block text-sm text-slate-300">
      {label && <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>}
      <select value={value} onChange={onChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function Checkbox({ label }: { label: string }) {
  return <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-slate-950" />{label}</label>;
}

export function Radio({ label }: { label: string }) {
  return <label className="flex items-center gap-3 text-sm text-slate-300"><input type="radio" className="h-4 w-4" />{label}</label>;
}

export function Switch({ label }: { label: string }) {
  return <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"><span>{label}</span><input type="checkbox" className="h-5 w-10 rounded-full accent-blue-500" /></label>;
}

export function TextArea({ label, placeholder }: { label?: string; placeholder?: string }) {
  return (
    <label className="block text-sm text-slate-300">
      {label && <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>}
      <textarea placeholder={placeholder} className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
    </label>
  );
}

export function SearchBar({ placeholder = 'Search', value, onChange }: { placeholder?: string; value?: string; onChange?: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
      <span>⌕</span>
      <input value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-transparent outline-none" />
    </div>
  );
}
