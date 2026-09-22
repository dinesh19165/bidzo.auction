import { getHomeDeals, type HomeDealResponse } from '../api/homeApi';

export type ProductOffer = Pick<HomeDealResponse, 'discountedPrice' | 'price' | 'discountType' | 'discountValue' | 'offerEndsAt' | 'offerId'>;

let cachedOffers: Map<string, ProductOffer> | null = null;
let cachedAt = 0;
let loading: Promise<Map<string, ProductOffer>> | null = null;
const CACHE_TTL_MS = 60_000;

function activeOffer(offer: HomeDealResponse): boolean {
  const end = new Date(offer.offerEndsAt).getTime();
  return Number.isFinite(end) && end > Date.now() && Number(offer.discountedPrice) < Number(offer.price);
}

export async function getActiveProductOffers(): Promise<Map<string, ProductOffer>> {
  if (cachedOffers && Date.now() - cachedAt < CACHE_TTL_MS) return cachedOffers;
  if (loading) return loading;

  loading = getHomeDeals(1000).then((deals) => {
    const next = new Map<string, ProductOffer>();
    deals.filter(activeOffer).forEach((deal) => {
      next.set(String(deal.id), {
        discountedPrice: deal.discountedPrice,
        price: deal.price,
        discountType: deal.discountType,
        discountValue: deal.discountValue,
        offerEndsAt: deal.offerEndsAt,
        offerId: deal.offerId,
      });
    });
    cachedOffers = next;
    cachedAt = Date.now();
    return next;
  }).finally(() => {
    loading = null;
  });

  return loading;
}

export function clearProductOfferCache(): void {
  cachedOffers = null;
  cachedAt = 0;
}
