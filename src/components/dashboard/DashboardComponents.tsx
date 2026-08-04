import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <motion.div whileHover={{ y: -2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p>{hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}</motion.div>;
}

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20"><h3 className="text-lg font-semibold text-white">{title}</h3><div className="mt-4">{children}</div></div>;
}

export function RecentActivity({ items }: { items: Array<{ title: string; meta: string }> }) {
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20"><h3 className="text-lg font-semibold text-white">Recent activity</h3><div className="mt-4 space-y-3">{items.map((item) => <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{item.title}<div className="mt-1 text-xs text-slate-500">{item.meta}</div></div>)}</div></div>;
}
