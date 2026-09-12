import { useEffect, useState } from 'react';
import { SectionShell } from '../../components/SectionShell';
import { getAuctions, getEffectiveAuctionStatus, type AuctionListItem } from '../../api/auctionApi';
import { EmptyState, ErrorState, SkeletonCard } from '../../components/loading/LoadingComponents';

function AuctionListPage({ title, subtitle, status, bidLabel }: { title: string; subtitle: string; status: 'RUNNING' | 'SCHEDULED' | 'ENDED'; bidLabel: string }) {
  const [auctions, setAuctions] = useState<AuctionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getAuctions().then((items) => setAuctions(items.filter((item) => getEffectiveAuctionStatus(item.status, item.startAt, item.endAt) === status))).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load auctions.')).finally(() => setLoading(false)); }, [status]);

  return <SectionShell title={title} subtitle={subtitle}>{loading ? <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div> : error ? <ErrorState title="Unable to load auctions" description={error} /> : auctions.length === 0 ? <EmptyState title="No auctions found" description="There are no auctions in this section right now." /> : <div className="grid gap-4 md:grid-cols-3">{auctions.map((item) => <div key={item.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300"><h3 className="text-lg font-semibold text-white">{item.title}</h3><p className="mt-3 text-sm">{bidLabel}: {item.currentBid ?? item.startingPrice ?? 'Not available'}</p></div>)}</div>}</SectionShell>;
}

export function LiveAuctionsPage() {
  return <AuctionListPage title="Live auctions" subtitle="Fast-moving bidding events" status="RUNNING" bidLabel="Current bid" />;
}

export function UpcomingAuctionsPage() {
  return <AuctionListPage title="Upcoming auctions" subtitle="Planned inventory and premium events" status="SCHEDULED" bidLabel="Starting price" />;
}

export function EndedAuctionsPage() {
  return <AuctionListPage title="Ended auctions" subtitle="Closed bids and winners" status="ENDED" bidLabel="Final bid" />;
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
