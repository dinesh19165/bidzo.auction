import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModalProps { open: boolean; title: string; children: ReactNode; onClose?: () => void; }
export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg rounded-[24px] border border-white/10 bg-slate-900 p-6 text-white shadow-2xl"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">{title}</h3><button onClick={onClose} className="text-slate-400">✕</button></div>{children}</motion.div></div>;
}

export function Drawer({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm border-l border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl">{children}</div>;
}

export function Tabs({ tabs, active, onChange }: { tabs: Array<{ label: string; value: string }>; active: string; onChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1"><button key={active} className="rounded-full px-3 py-2 text-sm" />{tabs.map((tab) => <button key={tab.value} onClick={() => onChange(tab.value)} className={`rounded-full px-3 py-2 text-sm ${active === tab.value ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}>{tab.label}</button>)}</div>;
}

export function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-[20px] border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">{title}</p><div className="mt-3 text-sm text-slate-300">{children}</div></div>;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return <div className="group relative inline-block">{children}<span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">{label}</span></div>;
}

export function Toast({ message }: { message: string }) {
  return <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">{message}</div>;
}
