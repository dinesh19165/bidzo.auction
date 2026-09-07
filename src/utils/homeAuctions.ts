import { getEffectiveAuctionStatus } from '../api/auctionApi';
import type { AuctionResponse } from '../api/homeApi';

export type HomeAuctionStatus = 'SCHEDULED' | 'RUNNING';

export function getHomeAuctionStatus(auction: AuctionResponse, now = Date.now()): HomeAuctionStatus | null {
  const backendStatus = String(auction.status ?? '').trim().toUpperCase();
  const end = auction.endAt ? new Date(auction.endAt).getTime() : Number.NaN;
  if (!Number.isFinite(end) || end <= now) return null;

  const start = auction.startAt ? new Date(auction.startAt).getTime() : Number.NaN;
  const effectiveStatus = getEffectiveAuctionStatus(auction.status, auction.startAt, auction.endAt);

  if (effectiveStatus === 'RUNNING' && ['RUNNING', 'LIVE', 'OPEN'].includes(backendStatus) && (!Number.isFinite(start) || start <= now)) return 'RUNNING';
  if (effectiveStatus === 'SCHEDULED' && ['SCHEDULED', 'UPCOMING'].includes(backendStatus) && Number.isFinite(start) && start > now) return 'SCHEDULED';
  return null;
}

export function filterHomeAuctions(auctions: AuctionResponse[], status: HomeAuctionStatus, now = Date.now()): AuctionResponse[] {
  return auctions.filter((auction) => getHomeAuctionStatus(auction, now) === status);
}

export function filterEndingSoonHomeAuctions(auctions: AuctionResponse[], now = Date.now()): AuctionResponse[] {
  return filterHomeAuctions(auctions, 'RUNNING', now)
    .sort((left, right) => new Date(left.endAt || '').getTime() - new Date(right.endAt || '').getTime());
}