import type { ChangeEvent, ReactNode } from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: ReactNode;
  ariaLabel?: string;
}

export function Input({ label, placeholder, value, onChange, type = 'text', icon, ariaLabel }: InputProps) {
  return (
    <label className="block text-sm text-slate-300">
      {label && <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>}
      <div className="flex min-h-[48px] items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white shadow-inner shadow-slate-900 transition focus-within:border-blue-400/40 focus-within:ring-1 focus-within:ring-blue-400/20">
        {icon}
        <input aria-label={ariaLabel} type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full min-h-[48px] bg-transparent outline-none" />
      </div>
    </label>
  );
}

export function Select({ label, options, value, onChange, icon, ariaLabel }: { label?: string; options: Array<{ label: string; value: string }>; value?: string; onChange?: (event: ChangeEvent<HTMLSelectElement>) => void; icon?: ReactNode; ariaLabel?: string }) {
  return (
    <label className="block text-sm text-slate-300">
      {label && <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>}
      <div className="flex min-h-[48px] items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white shadow-inner shadow-slate-900 transition focus-within:border-blue-400/40 focus-within:ring-1 focus-within:ring-blue-400/20">
        {icon}
        <select aria-label={ariaLabel} value={value} onChange={onChange} className="w-full bg-transparent text-sm text-white outline-none">
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
    </label>
  );
}

export function Checkbox({ label, checked, onChange, className }: { label: ReactNode; checked?: boolean; onChange?: (event: ChangeEvent<HTMLInputElement>) => void; className?: string }) {
  return (
    <label className={`flex items-center gap-3 text-sm text-slate-300 ${className ?? ''}`}>
      <input aria-hidden type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-all duration-200 border-slate-500 bg-transparent peer-checked:bg-[#2563EB] peer-checked:border-[#2563EB] peer-checked:[&>svg]:opacity-100">
        <svg className="h-3.5 w-3.5 text-white opacity-0 transition-opacity duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      {label}
    </label>
  );
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
      <textarea placeholder={placeholder} className="min-h-28 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none" />
    </label>
  );
}

export function SearchBar({ placeholder = 'Search', value, onChange }: { placeholder?: string; value?: string; onChange?: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="flex min-h-[48px] items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
      <span>⌕</span>
      <input value={value} onChange={onChange} placeholder={placeholder} className="w-full min-h-[48px] bg-transparent outline-none" />
    </div>
  );
}
