import { useParams } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { auctionItems } from '../data/mockData';

export function AuctionDetailPage() {
  const { id } = useParams();
  const item = auctionItems.find((entry) => entry.id === Number(id));

  if (!item) {
    return <SectionShell title="Auction" subtitle="Not found"><div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">This auction is unavailable.</div></SectionShell>;
  }

  return (
    <SectionShell title="Auction details" subtitle={item.title}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
          <img src={item.image} alt={item.title} className="h-72 w-full rounded-[20px] object-cover" />
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p>Current bid: {item.currentBid}</p>
            <p className="mt-2">Ends: {item.endsIn}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-lg font-semibold text-white">Live bid UI</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Reserve price: ₹2,20,000</p>
              <p>Bid increment: ₹5,000</p>
              <p>Status: {item.status}</p>
            </div>
            <button className="mt-5 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Place bid</button>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h4 className="text-lg font-semibold text-white">Bid history</h4>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>• ₹2,35,000 by Rahul</p>
              <p>• ₹2,30,000 by Priya</p>
              <p>• ₹2,25,000 by Arjun</p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
