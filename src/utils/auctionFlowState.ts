import { auctionItems } from '../data/mockData';

export type AuctionFlowStage =
  | 'LISTING'
  | 'DETAILS'
  | 'PLACE_BID'
  | 'BID_CONFIRMATION'
  | 'REGISTRATION_FEE'
  | 'REGISTRATION_PAYMENT'
  | 'LIVE_AUCTION'
  | 'AUCTION_ENDED'
  | 'WINNER'
  | 'FINAL_PAYMENT'
  | 'ORDER_SUCCESS'
  | 'INVOICE'
  | 'OUTBID'
  | 'MARKETPLACE';

export interface AuctionFlowBid {
  bidder: string;
  amount: number;
  time: string;
  isCurrentUser?: boolean;
}

export interface AuctionFlowState {
  auctionId: number;
  auctionTitle: string;
  highestBid: number;
  highestBidder: string;
  participants: number;
  secondsLeft: number;
  bids: AuctionFlowBid[];
  winnerName: string | null;
  winningAmount: number;
  auctionStage: AuctionFlowStage;
  auctionEndTime: string;
}

const AUCTION_FLOW_STORAGE_KEY = 'bidzo_auction_flow_state';
const AUCTION_REGISTRATION_STORAGE_KEY = 'bidzo_auction_registration_state';
const AUCTION_SELECTED_ID_KEY = 'bidzo_selected_auction_id';

function formatAuctionEndTime(secondsLeft: number) {
  const endTime = new Date(Date.now() + secondsLeft * 1000);
  return endTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

const defaultState: AuctionFlowState = {
  auctionId: 104,
  auctionTitle: 'Royal Enfield Classic 350',
  highestBid: 235000,
  highestBidder: 'Tara',
  participants: 18,
  secondsLeft: 120,
  bids: [
    { bidder: 'Tara', amount: 235000, time: 'just now' },
    { bidder: 'Vikram', amount: 230000, time: '9 min ago' },
    { bidder: 'Anita', amount: 225000, time: '20 min ago' },
  ],
  winnerName: null,
  winningAmount: 0,
  auctionStage: 'LISTING',
  auctionEndTime: formatAuctionEndTime(120),
};

function parseCurrency(value: string | number | undefined) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return Number(String(value).replace(/[^\d]/g, '')) || 0;
}

function getAuctionMeta(auctionId: number) {
  return auctionItems.find((item) => item.id === auctionId);
}

function makeAuctionBaseState(auctionId: number): AuctionFlowState {
  const meta = getAuctionMeta(auctionId);
  const highestBid = parseCurrency(meta?.currentBid);
  const bids = meta?.bidHistory?.map((bid) => ({ bidder: bid.bidder, amount: parseCurrency(bid.amount), time: bid.time })) || defaultState.bids;
  const secondsLeft = defaultState.secondsLeft;

  return {
    auctionId,
    auctionTitle: meta?.title || defaultState.auctionTitle,
    highestBid: highestBid || defaultState.highestBid,
    highestBidder: bids[0]?.bidder || defaultState.highestBidder,
    participants: meta?.participants || defaultState.participants,
    secondsLeft,
    bids,
    winnerName: null,
    winningAmount: 0,
    auctionStage: 'LISTING',
    auctionEndTime: formatAuctionEndTime(secondsLeft),
  };
}

function readAuctionRegistrationState(): Record<number, boolean> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(AUCTION_REGISTRATION_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, boolean>;
  } catch {
    return {};
  }
}

function writeAuctionRegistrationState(registrations: Record<number, boolean>) {
  if (typeof window === 'undefined') return registrations;
  window.localStorage.setItem(AUCTION_REGISTRATION_STORAGE_KEY, JSON.stringify(registrations));
  return registrations;
}

export function isAuctionRegistered(auctionId: number) {
  if (typeof window === 'undefined') return false;
  const registrations = readAuctionRegistrationState();
  return Boolean(registrations[auctionId]);
}

export function markAuctionAsRegistered(auctionId: number) {
  if (typeof window === 'undefined') return;
  const registrations = readAuctionRegistrationState();
  registrations[auctionId] = true;
  writeAuctionRegistrationState(registrations);
}

export function getSelectedAuctionId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUCTION_SELECTED_ID_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setSelectedAuctionId(auctionId: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUCTION_SELECTED_ID_KEY, String(auctionId));
}

export function readAuctionFlowState(): AuctionFlowState {
  if (typeof window === 'undefined') return { ...defaultState };

  try {
    const raw = window.localStorage.getItem(AUCTION_FLOW_STORAGE_KEY);
    const selectedAuctionId = getSelectedAuctionId();
    if (!raw) {
      return {
        ...defaultState,
        auctionId: selectedAuctionId ?? defaultState.auctionId,
      };
    }

    const parsed = JSON.parse(raw) as Partial<AuctionFlowState>;
    const normalizedStage = parsed.auctionStage ?? 'LISTING';

    return {
      ...defaultState,
      ...parsed,
      auctionId: parsed.auctionId ?? selectedAuctionId ?? defaultState.auctionId,
      bids: Array.isArray(parsed.bids) && parsed.bids.length > 0 ? parsed.bids : defaultState.bids,
      auctionEndTime: parsed.auctionEndTime || defaultState.auctionEndTime,
      auctionStage: normalizedStage as AuctionFlowStage,
    };
  } catch {
    return {
      ...defaultState,
      auctionId: getSelectedAuctionId() ?? defaultState.auctionId,
    };
  }
}

export function writeAuctionFlowState(next: AuctionFlowState) {
  if (typeof window === 'undefined') return next;
  window.localStorage.setItem(AUCTION_FLOW_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function initializeAuctionFlowState(overrides: Partial<AuctionFlowState> = {}) {
  const selectedAuctionId = overrides.auctionId ?? getSelectedAuctionId() ?? defaultState.auctionId;
  return initializeAuctionFlowStateForAuction(selectedAuctionId, overrides);
}

export function initializeAuctionFlowStateForAuction(auctionId: number, overrides: Partial<AuctionFlowState> = {}) {
  const baseState = makeAuctionBaseState(auctionId);
  const secondsLeft = overrides.secondsLeft ?? baseState.secondsLeft;
  setSelectedAuctionId(auctionId);

  return writeAuctionFlowState({
    ...baseState,
    ...overrides,
    auctionId,
    auctionTitle: overrides.auctionTitle ?? baseState.auctionTitle,
    highestBid: overrides.highestBid ?? baseState.highestBid,
    highestBidder: overrides.highestBidder ?? baseState.highestBidder,
    participants: overrides.participants ?? baseState.participants,
    bids: overrides.bids ?? baseState.bids,
    auctionEndTime: formatAuctionEndTime(secondsLeft),
  });
}

export function resetAuctionFlowState() {
  return initializeAuctionFlowState();
}

export function startAuctionFlow() {
  const state = readAuctionFlowState();
  const nextState: AuctionFlowState = {
    ...state,
    auctionStage: 'PLACE_BID',
    auctionEndTime: formatAuctionEndTime(state.secondsLeft),
  };
  return writeAuctionFlowState(nextState);
}

export function placeBid(amount: string | number, bidderName: string, currentUserName?: string) {
  const state = readAuctionFlowState();
  const parsedAmount = typeof amount === 'number' ? amount : Number(String(amount).replace(/[^\d]/g, ''));
  const nextBidAmount = Number.isFinite(parsedAmount) ? parsedAmount : state.highestBid;
  const isHigher = nextBidAmount > state.highestBid;

  const nextStage: AuctionFlowStage = state.auctionStage === 'LIVE_AUCTION' ? 'LIVE_AUCTION' : 'BID_CONFIRMATION';

  const nextState: AuctionFlowState = {
    ...state,
    highestBid: isHigher ? nextBidAmount : state.highestBid,
    highestBidder: isHigher ? bidderName : state.highestBidder,
    participants: Math.max(state.participants + 1, state.bids.length + 2),
    bids: [{ bidder: bidderName, amount: nextBidAmount, time: 'just now', isCurrentUser: bidderName === currentUserName }, ...state.bids].slice(0, 6),
    auctionStage: nextStage,
    auctionEndTime: formatAuctionEndTime(state.secondsLeft),
  };

  return writeAuctionFlowState(nextState);
}

export function addMockBid() {
  const state = readAuctionFlowState();
  if (state.auctionStage !== 'LIVE_AUCTION') return state;

  const mockNames = ['Asha', 'Nikhil', 'Priya', 'Rohan', 'Mina'];
  const bidder = mockNames[Math.floor(Math.random() * mockNames.length)];
  const amount = state.highestBid + 5000 + Math.floor(Math.random() * 4000);

  const nextState: AuctionFlowState = {
    ...state,
    highestBid: amount,
    highestBidder: bidder,
    participants: state.participants + 1,
    bids: [{ bidder, amount, time: 'just now' }, ...state.bids].slice(0, 6),
    auctionEndTime: state.auctionEndTime || formatAuctionEndTime(state.secondsLeft),
  };

  return writeAuctionFlowState(nextState);
}

export function advanceAuctionClock(currentUserName: string) {
  const state = readAuctionFlowState();
  if (state.auctionStage !== 'LIVE_AUCTION') return state;

  if (state.secondsLeft <= 1) {
    return finalizeAuction(currentUserName);
  }

  const nextState: AuctionFlowState = {
    ...state,
    secondsLeft: state.secondsLeft - 1,
    auctionEndTime: formatAuctionEndTime(state.secondsLeft - 1),
  };

  return writeAuctionFlowState(nextState);
}

export function finalizeAuction(currentUserName: string) {
  const state = readAuctionFlowState();
  const nextState: AuctionFlowState = {
    ...state,
    secondsLeft: 0,
    winnerName: state.highestBidder,
    winningAmount: state.highestBid,
    auctionStage: 'AUCTION_ENDED',
    auctionEndTime: formatAuctionEndTime(0),
  };

  return writeAuctionFlowState(nextState);
}

export function resolveAuctionOutcome(currentUserName: string) {
  const state = readAuctionFlowState();
  if (state.auctionStage !== 'AUCTION_ENDED') return state;

  const nextState: AuctionFlowState = {
    ...state,
    auctionStage: state.highestBidder === currentUserName ? 'WINNER' : 'OUTBID',
    auctionEndTime: state.auctionEndTime || formatAuctionEndTime(0),
  };

  return writeAuctionFlowState(nextState);
}

export function markRegistrationPaid() {
  const state = readAuctionFlowState();
  const nextState: AuctionFlowState = {
    ...state,
    auctionStage: 'REGISTRATION_PAYMENT',
    auctionEndTime: state.auctionEndTime || formatAuctionEndTime(state.secondsLeft > 0 ? state.secondsLeft : 45),
  };
  return writeAuctionFlowState(nextState);
}

export type BuyNowFlowState = {
  productId: number;
  flowStage: 'CONFIRM' | 'PAYMENT' | 'ORDER_SUCCESS' | 'INVOICE';
  productTitle: string;
  productPrice: number;
  orderId?: number;
};

const BUYNOW_FLOW_STORAGE_KEY = 'bidzo_buynow_flow';

export function readBuyNowFlowState(): BuyNowFlowState {
  if (typeof window === 'undefined') {
    return { productId: 0, flowStage: 'CONFIRM', productTitle: '', productPrice: 0 };
  }
  const raw = window.localStorage.getItem(BUYNOW_FLOW_STORAGE_KEY);
  if (!raw) {
    return { productId: 0, flowStage: 'CONFIRM', productTitle: '', productPrice: 0 };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { productId: 0, flowStage: 'CONFIRM', productTitle: '', productPrice: 0 };
  }
}

export function writeBuyNowFlowState(state: BuyNowFlowState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BUYNOW_FLOW_STORAGE_KEY, JSON.stringify(state));
}

export function initializeBuyNowFlow(productId: number, productTitle: string, productPrice: number): BuyNowFlowState {
  const state: BuyNowFlowState = {
    productId,
    flowStage: 'CONFIRM',
    productTitle,
    productPrice,
  };
  writeBuyNowFlowState(state);
  return state;
}

export function startBuyNowPayment(): BuyNowFlowState {
  const current = readBuyNowFlowState();
  const next: BuyNowFlowState = {
    ...current,
    flowStage: 'PAYMENT',
  };
  writeBuyNowFlowState(next);
  return next;
}

export function markBuyNowOrderConfirmed(orderId: number): BuyNowFlowState {
  const current = readBuyNowFlowState();
  const next: BuyNowFlowState = {
    ...current,
    flowStage: 'ORDER_SUCCESS',
    orderId,
  };
  writeBuyNowFlowState(next);
  return next;
}

export function markBuyNowInvoiceReady(): BuyNowFlowState {
  const current = readBuyNowFlowState();
  const next: BuyNowFlowState = {
    ...current,
    flowStage: 'INVOICE',
  };
  writeBuyNowFlowState(next);
  return next;
}

export function clearBuyNowFlowState() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(BUYNOW_FLOW_STORAGE_KEY);
}

export function beginFinalPayment() {
  const state = readAuctionFlowState();
  const nextState: AuctionFlowState = {
    ...state,
    auctionStage: 'FINAL_PAYMENT',
    auctionEndTime: state.auctionEndTime || formatAuctionEndTime(state.secondsLeft),
  };
  return writeAuctionFlowState(nextState);
}

export function markOrderConfirmed() {
  const state = readAuctionFlowState();
  const nextState: AuctionFlowState = {
    ...state,
    auctionStage: 'ORDER_SUCCESS',
    auctionEndTime: state.auctionEndTime || formatAuctionEndTime(state.secondsLeft),
  };
  return writeAuctionFlowState(nextState);
}

export function enterLiveAuctionRoom() {
  const state = readAuctionFlowState();
  const nextState: AuctionFlowState = {
    ...state,
    secondsLeft: state.secondsLeft > 0 ? state.secondsLeft : 45,
    auctionStage: 'LIVE_AUCTION',
    auctionEndTime: state.auctionEndTime || formatAuctionEndTime(state.secondsLeft > 0 ? state.secondsLeft : 45),
  };
  return writeAuctionFlowState(nextState);
}

export function markInvoiceReady() {
  const state = readAuctionFlowState();
  const nextState: AuctionFlowState = {
    ...state,
    auctionStage: 'INVOICE',
  };
  return writeAuctionFlowState(nextState);
}

export function goToMarketplace() {
  const state = readAuctionFlowState();
  const nextState: AuctionFlowState = {
    ...state,
    auctionStage: 'MARKETPLACE',
  };
  return writeAuctionFlowState(nextState);
}
