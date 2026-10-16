import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function CountdownTimer({ value }: { value: string }) {
  return <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-slate-100 shadow-sm shadow-blue-500/10">{value}</div>;
}

export function BidHistory({ bids }: { bids: Array<{ bidder: string; amount: string }> }) {
  return (
    <div className="divide-y divide-[var(--border-color)]">
      {bids.map((bid, index) => (
        <div key={`${bid.bidder}-${bid.amount}`} className={`flex items-center justify-between gap-3 py-3 text-sm ${index === 0 ? 'text-blue-700' : 'text-[var(--text-secondary)]'}`}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-semibold text-[var(--text-secondary)]">{bid.bidder.charAt(0)}</span>
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">{bid.bidder}</span>
          </div>
          <span className="shrink-0 font-semibold text-[var(--text-primary)]">{bid.amount}</span>
        </div>
      ))}
    </div>
  );
}

export function BidCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-sm shadow-[var(--shadow-color)]"><h3 className="font-semibold text-[var(--text-primary)]">{title}</h3><div className="mt-4">{children}</div></div>;
}

export function AutoBidCard({ title }: { title: string }) {
  return <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-sm shadow-[var(--shadow-color)]"><h3 className="font-semibold text-[var(--text-primary)]">{title}</h3><p className="mt-2 text-sm text-[var(--text-muted)]">Enable automatic bidding for faster participation.</p></motion.div>;
}

export function WinnerBanner({ label }: { label: string }) {
  return <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-300">{label}</div>;
}
