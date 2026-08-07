import { useParams, Link } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { auctionItems } from '../data/mockData';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, Gavel, Heart, ShieldCheck, Sparkles, Star, Users } from 'lucide-react';

function useCountdown(end: string | undefined): string {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!end) return;
    const iv = setInterval(() => {
      // For now, mirror the provided label (mock countdown). In a real app parse end time.
      setRemaining(end);
    }, 1000);
    return () => clearInterval(iv);
  }, [end]);
  return remaining;
}

export function AuctionDetailPage() {
  const { id } = useParams();
  const item = auctionItems.find((entry) => entry.id === Number(id));

  if (!item) {
    return <SectionShell title="Auction" subtitle="Not found"><div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">This auction is unavailable.</div></SectionShell>;
  }

  const countdown = useCountdown(item.endsIn);

  const gallery = [item.image, item.image, item.image];
  const history = [...item.bidHistory].reverse();

  return (
    <SectionShell title="Auction details" subtitle={item.title}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                <Sparkles className="h-4 w-4" /> Premium live auction
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-blue-300" /> Verified seller
              </div>
            </div>
            <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="mt-4 h-72 w-full rounded-[20px] object-cover" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {gallery.map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${item.title} view ${index + 1}`} loading="lazy" decoding="async" className="h-20 w-full rounded-2xl object-cover transition duration-200 hover:scale-[1.02]" />
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" /> Current bid: {item.currentBid}</p>
              <p className="mt-2">Ends: {countdown || item.endsIn}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-lg font-semibold text-white">Auction highlights</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Reserve price', value: item.reservePrice },
                { label: 'Bid increment', value: item.bidIncrement },
                { label: 'Participants', value: item.participants },
                { label: 'Watchers', value: item.watchers },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="text-slate-400">{stat.label}</p>
                  <p className="mt-1 font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">High bid</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">{item.currentBid}</h3>
              </div>
              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Live</div>
            </div>
            <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Countdown</span>
                <span className="font-semibold text-white">{countdown || item.endsIn}</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <input aria-label="Enter bid amount" placeholder="Enter bid amount" className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60" />
              <Link to="/customer/place-bid" className="rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500">Place bid</Link>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <Star className="h-4 w-4 text-amber-300" /> Seller rating 4.8 · 124 reviews
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Bid history</h4>
              <span className="text-sm text-slate-400">Newest first</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {history.map((bh, index) => (
                <div key={`${bh.bidder}-${bh.time}`} className={`rounded-2xl border p-3 ${index === 0 ? 'border-blue-400/30 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">{bh.bidder.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-white">{bh.bidder}</p>
                        <p className="text-xs text-slate-400">{bh.time}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-white">{bh.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}
