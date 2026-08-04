import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function CountdownTimer({ value }: { value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">{value}</div>;
}

export function BidHistory({ bids }: { bids: Array<{ bidder: string; amount: string }> }) {
  return <div className="space-y-2">{bids.map((bid) => <div key={bid.bidder} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"><span>{bid.bidder}</span><span>{bid.amount}</span></div>)}</div>;
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
