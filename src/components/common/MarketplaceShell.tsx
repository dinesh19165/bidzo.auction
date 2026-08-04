import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function SectionHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PremiumPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className={`rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl ${className}`}>
      {children}
    </motion.div>
  );
}
