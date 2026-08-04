import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </motion.section>;
}
