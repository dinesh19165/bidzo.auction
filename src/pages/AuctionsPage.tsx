import { SectionShell } from '../components/SectionShell';
import { auctionItems } from '../data/mockData';
import { AuctionCard } from '../components/cards/MarketplaceCards';

export function AuctionsPage() {
  return (
    <SectionShell title="Auctions" subtitle="Live, upcoming, and closed bidding">
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {auctionItems.map((item) => (
          <AuctionCard key={item.id} id={item.id} title={item.title} image={item.image} status={item.status} currentBid={item.currentBid} endsIn={item.endsIn} seller="Premium Seller" verified={item.status === 'Live'} watchers={item.watchers} participants={item.participants} condition="Excellent" rating={4.8} />
        ))}
      </div>
    </SectionShell>
  );
}
