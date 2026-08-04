import { SectionShell } from '../../components/SectionShell';
import { auctionItems } from '../../data/mockData';

export function LiveAuctionsPage() {
  return (
    <SectionShell title="Live auctions" subtitle="Fast-moving bidding events">
      <div className="grid gap-4 md:grid-cols-3">
        {auctionItems.filter((item) => item.status === 'Live').map((item) => (
          <div key={item.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm">Current bid: {item.currentBid}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function UpcomingAuctionsPage() {
  return (
    <SectionShell title="Upcoming auctions" subtitle="Planned inventory and premium events">
      <div className="grid gap-4 md:grid-cols-3">
        {auctionItems.filter((item) => item.status === 'Upcoming').map((item) => (
          <div key={item.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm">Starts in {item.endsIn}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function EndedAuctionsPage() {
  return (
    <SectionShell title="Ended auctions" subtitle="Closed bids and winners">
      <div className="grid gap-4 md:grid-cols-3">
        {auctionItems.filter((item) => item.status === 'Closed').map((item) => (
          <div key={item.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm">Winning bid: {item.currentBid}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function WinnerScreenPage() {
  return (
    <SectionShell title="Winner" subtitle="Auction completion state">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p className="text-lg font-semibold text-white">Congratulations to the winning bidder.</p>
        <p className="mt-3">A success screen for auction winners and payout notes.</p>
      </div>
    </SectionShell>
  );
}
