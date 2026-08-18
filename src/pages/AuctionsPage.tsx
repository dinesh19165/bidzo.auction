import { useEffect, useState } from 'react';
import { SectionShell } from '../components/SectionShell';
import { AuctionCard } from '../components/cards/MarketplaceCards';
import { getAuctions, type AuctionListItem } from '../api/auctionApi';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';

export function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getAuctions();
        setAuctions(items);
      } catch (err: any) {
        setError(err?.message || 'Unable to load auctions');
      } finally {
        setLoading(false);
      }
    };

    loadAuctions();
  }, []);

  return (
    <SectionShell title="Auctions" subtitle="Live, upcoming, and closed bidding">
      {loading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Auction load failed" description={error} />
      ) : auctions.length === 0 ? (
        <EmptyState title="No auctions found" description="There are no auctions available right now. Please check back later." />
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((item) => (
            <AuctionCard
              key={item.id}
              id={item.id}
              title={item.title}
              image={item.image}
              status={item.status}
              currentBid={item.currentBid}
              endsIn={item.endsIn}
              seller={item.seller}
              verified={item.verified}
              watchers={item.watchers}
              participants={item.participants}
              condition={item.condition}
            />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
