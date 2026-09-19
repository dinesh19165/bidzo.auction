import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-sm shadow-[var(--shadow-color)]"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>{hint && <p className="mt-2 text-sm text-[var(--text-muted)]">{hint}</p>}</motion.div>;
}

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-sm shadow-[var(--shadow-color)]"><h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3><div className="mt-4">{children}</div></div>;
}

export function RecentActivity({ items }: { items: Array<{ title: string; meta: string }> }) {
  return <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-sm shadow-[var(--shadow-color)]"><h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Recent activity</h3><div className="mt-4 space-y-3">{items.map((item) => <div key={item.title} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-secondary)]">{item.title}<div className="mt-1 text-xs text-[var(--text-muted)]">{item.meta}</div></div>)}</div></div>;
}
