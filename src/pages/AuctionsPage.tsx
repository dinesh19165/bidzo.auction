import { useEffect, useState } from 'react';
import { SectionShell } from '../components/SectionShell';
import { AuctionCard } from '../components/cards/MarketplaceCards';
import { getAuctions, getAuctionWinner, getEffectiveAuctionStatus, type AuctionListItem } from '../api/auctionApi';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { useAuth } from '../context/AuthContext';

function getPaidAuctionIds() {
  if (typeof window === 'undefined') return new Set<number>();

  const ids = new Set<number>();
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith('bidzo_paid_auction_')) continue;
    const auctionId = Number(key.replace('bidzo_paid_auction_', ''));
    if (Number.isFinite(auctionId)) {
      ids.add(auctionId);
    }
  }

  return ids;
}

export function AuctionsPage() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<AuctionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getAuctions();
        const paidAuctionIds = getPaidAuctionIds();

        const visibleAuctions = await Promise.all(
          items.map(async (item) => {
            const effectiveStatus = getEffectiveAuctionStatus(item.status, item.startAt, item.endAt);

            if (effectiveStatus === 'RUNNING' || effectiveStatus === 'SCHEDULED') {
              return item;
            }

            if (effectiveStatus !== 'ENDED' || !user?.id || paidAuctionIds.has(item.id)) {
              return null;
            }

            try {
              const winner = await getAuctionWinner(item.id);
              return Number(winner.winnerId) === Number(user.id) ? item : null;
            } catch {
              return null;
            }
          })
        );

        setAuctions(visibleAuctions.filter((item): item is AuctionListItem => item !== null));
      } catch (err: any) {
        setError(err?.message || 'Unable to load auctions');
      } finally {
        setLoading(false);
      }
    };

    loadAuctions();
  }, [user?.id]);

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
