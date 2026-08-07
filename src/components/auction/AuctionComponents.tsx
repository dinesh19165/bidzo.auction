import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function CountdownTimer({ value }: { value: string }) {
  return <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-slate-100 shadow-lg shadow-blue-500/10">{value}</div>;
}

export function BidHistory({ bids }: { bids: Array<{ bidder: string; amount: string }> }) {
  return (
    <div className="space-y-3">
      {bids.map((bid, index) => (
        <div key={`${bid.bidder}-${bid.amount}`} className={`rounded-2xl border p-3 text-sm ${index === 0 ? 'border-blue-400/30 bg-blue-500/10' : 'border-white/10 bg-white/5'} `}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">{bid.bidder.charAt(0)}</div>
              <span className="text-slate-200">{bid.bidder}</span>
            </div>
            <span className="font-semibold text-white">{bid.amount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BidCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20"><h3 className="font-semibold text-white">{title}</h3><div className="mt-4">{children}</div></div>;
}

export function AutoBidCard({ title }: { title: string }) {
  return <motion.div whileHover={{ y: -2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20"><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm text-slate-400">Enable automatic bidding for faster participation.</p></motion.div>;
}

export function WinnerBanner({ label }: { label: string }) {
  return <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-300">{label}</div>;
}
