import { fetchJson } from './apiClient';
import { getAuctionBids } from './bidApi';
import type { ApiResponse, RazorpayOrderResponse, RazorpayVerifyRequestDto, PaymentResponseDto, AuctionRegistrationStatusResponse } from '../types';

export interface AuctionResponse {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  startingPrice: string;
  status: 'SCHEDULED' | 'RUNNING' | 'ENDED' | 'CANCELLED' | string;
  productId?: number;
  vendorId?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AuctionImageResponse {
  id: number;
  url: string;
  altText?: string;
  auctionId: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AuctionWinnerResponse {
  id: number;
  awardedAt: string;
  finalPrice: string;
  auctionId: number;
  winnerId: number;
  bidId: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  startingPrice: number;
  productId: number;
  vendorId: number;
}

export interface AuctionListItem {
  id: number;
  title: string;
  description: string;
  image: string;
  status: string;
  currentBid: string;
  endsIn: string;
  seller: string;
  verified: boolean;
  watchers: number;
  participants: number;
  condition: string;
}

export function getEffectiveAuctionStatus(status?: string | null, startAt?: string | null, endAt?: string | null): 'SCHEDULED' | 'RUNNING' | 'ENDED' | 'CANCELLED' {
  const backendStatus = String(status || '').trim().toUpperCase();
  if (backendStatus === 'CANCELLED') return 'CANCELLED';

  const now = Date.now();
  const startTimestamp = startAt ? new Date(startAt).getTime() : Number.NaN;
  const endTimestamp = endAt ? new Date(endAt).getTime() : Number.NaN;

  if (Number.isFinite(endTimestamp) && now >= endTimestamp) return 'ENDED';
  if (Number.isFinite(startTimestamp) && now < startTimestamp) return 'SCHEDULED';

  if (backendStatus === 'SCHEDULED' || backendStatus === 'UPCOMING') return 'SCHEDULED';
  if (backendStatus === 'RUNNING' || backendStatus === 'LIVE' || backendStatus === 'OPEN') return 'RUNNING';
  if (backendStatus === 'ENDED' || backendStatus === 'COMPLETED' || backendStatus === 'FINISHED') return 'ENDED';

  if (Number.isFinite(startTimestamp) && Number.isFinite(endTimestamp) && now >= startTimestamp && now < endTimestamp) {
    return 'RUNNING';
  }

  return 'SCHEDULED';
}

function formatCurrency(value: string | number): string {
  const numeric = typeof value === 'number' ? value : Number(String(value));
  if (Number.isNaN(numeric)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
}

function formatRelativeCountdown(startAt?: string, endAt?: string, status?: string) {
  if (!startAt || !endAt) return 'Unavailable';
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const effectiveStatus = getEffectiveAuctionStatus(status, startAt, endAt);

  if (effectiveStatus === 'SCHEDULED' || now < start) {
    const diff = Math.max(0, start - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m until start`;
  }
  if (effectiveStatus === 'RUNNING' && end > now) {
    const diff = Math.max(0, end - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m left`;
  }
  return 'Ended';
}

interface AuctionStats {
  participants: number;
  currentBid: string;
}

function mapAuction(auction: AuctionResponse, stats: AuctionStats): AuctionListItem {
  const effectiveStatus = getEffectiveAuctionStatus(auction.status, auction.startAt, auction.endAt);
  const statusLabel = effectiveStatus === 'RUNNING' ? 'Live' : effectiveStatus === 'SCHEDULED' ? 'Upcoming' : effectiveStatus === 'ENDED' ? 'Ended' : effectiveStatus === 'CANCELLED' ? 'Cancelled' : auction.status;
  return {
    id: auction.id,
    title: auction.title,
    description: auction.description || `Auction listing for product ${auction.productId ?? auction.id}`,
    image: '/logo.png',
    status: statusLabel,
    currentBid: stats.currentBid,
    endsIn: formatRelativeCountdown(auction.startAt, auction.endAt, auction.status),
    seller: auction.vendorId ? `Vendor ${auction.vendorId}` : 'Premium Seller',
    verified: effectiveStatus === 'RUNNING',
    watchers: 0,
    participants: stats.participants,
    condition: effectiveStatus === 'RUNNING' ? 'Live' : effectiveStatus === 'SCHEDULED' ? 'Scheduled' : 'Closed',
  };
}

async function loadAuctionStats(auction: AuctionResponse): Promise<AuctionStats> {
  try {
    const bids = await getAuctionBids(auction.id);
    const bidAmounts = bids.map((bid) => Number(String(bid.amount).replace(/[^0-9.-]/g, ''))).filter(Number.isFinite);
    const highestBid = bidAmounts.length > 0 ? Math.max(...bidAmounts) : Number(String(auction.startingPrice).replace(/[^0-9.-]/g, '')) || 0;
    return {
      participants: bids.length,
      currentBid: formatCurrency(highestBid),
    };
  } catch {
    return {
      participants: 0,
      currentBid: formatCurrency(auction.startingPrice || '0'),
    };
  }
}

export async function getAuctions(): Promise<AuctionListItem[]> {
  const response = await fetchJson<ApiResponse<AuctionResponse[]>>('/api/auctions', { method: 'GET' }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load auctions');
  }

  const auctions = response.data;
  const items = await Promise.all(auctions.map(async (auction) => {
    const stats = await loadAuctionStats(auction);
    return mapAuction(auction, stats);
  }));

  return items;
}

export async function createAuction(payload: CreateAuctionRequest): Promise<AuctionResponse> {
  const response = await fetchJson<ApiResponse<AuctionResponse>>('/api/auctions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (response?.success && response.data) {
    return response.data;
  }

  if (response?.message) {
    throw new Error(response.message);
  }

  throw new Error('Unable to create auction');
}

export async function getAuctionById(auctionId: number): Promise<AuctionResponse> {
  const response = await fetchJson<ApiResponse<AuctionResponse>>(`/api/auctions/${auctionId}`, { method: 'GET' }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load auction details');
  }
  return response.data;
}

export async function getAuctionImages(auctionId: number): Promise<AuctionImageResponse[]> {
  const response = await fetchJson<ApiResponse<AuctionImageResponse[]>>(`/api/auctions/${auctionId}/images`, { method: 'GET' }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load auction images');
  }
  return response.data;
}

export async function getAuctionWinner(auctionId: number): Promise<AuctionWinnerResponse> {
  const response = await fetchJson<ApiResponse<AuctionWinnerResponse>>(`/api/auctions/${auctionId}/winner`, { method: 'GET' }, false);
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load auction winner');
  }
  return response.data;
}

export async function getAuctionRegistrationStatus(auctionId: number): Promise<AuctionRegistrationStatusResponse> {
  const response = await fetchJson<ApiResponse<AuctionRegistrationStatusResponse>>(`/api/auctions/${auctionId}/registration`, { method: 'GET' });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to load auction registration status');
  }
  return response.data;
}

export async function createAuctionRegistrationPayment(auctionId: number, amount: number = 20): Promise<RazorpayOrderResponse> {
  const response = await fetchJson<ApiResponse<RazorpayOrderResponse>>(`/api/auctions/${auctionId}/registration/payment`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to create auction registration payment');
  }
  return response.data;
}

export async function verifyAuctionRegistrationPayment(auctionId: number, request: RazorpayVerifyRequestDto): Promise<PaymentResponseDto> {
  const response = await fetchJson<ApiResponse<PaymentResponseDto>>(`/api/auctions/${auctionId}/registration/payment/verify`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  if (!response?.data) {
    throw new Error(response?.message || 'Failed to verify auction registration payment');
  }
  return response.data;
}
export async function getMyWonAuctions(): Promise<
  Array<{
    winner: AuctionWinnerResponse;
    auction: AuctionResponse;
  }>
> {
  const { getMyBids } = await import('./bidApi');

  const bids = await getMyBids();

  const winningBids = bids.filter(
    (bid) => String(bid.status).toUpperCase() === 'ACCEPTED'
  );

  const results = await Promise.all(
    winningBids.map(async (bid) => {
      const [winner, auction] = await Promise.all([
        getAuctionWinner(bid.auctionId),
        getAuctionById(bid.auctionId),
      ]);

      return {
        winner,
        auction,
      };
    })
  );

  return results;
}