import { useParams } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { auctionItems } from '../data/mockData';
import { useState, useEffect } from 'react';
import { Clock3 } from 'lucide-react';

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

  return (
    <SectionShell title="Auction details" subtitle={item.title}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
          <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="h-72 w-full rounded-[20px] object-cover" />
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" /> Current bid: {item.currentBid}</p>
            <p className="mt-2">Ends: {countdown || item.endsIn}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-lg font-semibold text-white">Live bid UI</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Reserve price: {item.reservePrice}</p>
              <p>Bid increment: {item.bidIncrement}</p>
              <p>Status: {item.status}</p>
              <p>Participants: {item.participants}</p>
              <p>Watchers: {item.watchers}</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input placeholder="Enter bid amount" className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-white" />
              <a href="/customer/place-bid" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Place bid</a>
              <a href="/customer/place-bid" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Auto-bid</a>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h4 className="text-lg font-semibold text-white">Bid history</h4>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {item.bidHistory.map((bh) => <div key={bh.time} className="rounded-2xl border border-white/10 bg-white/5 p-3">• {bh.amount} by {bh.bidder} • {bh.time}</div>)}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
