import { useParams } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, ShieldCheck, Sparkles, Star, Users, Clock3, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuctionById, getAuctionImages, getAuctionWinner, getEffectiveAuctionStatus, type AuctionImageResponse, type AuctionResponse, type AuctionWinnerResponse } from '../api/auctionApi';
import { getAuctionBids, placeBid, type BidResponse } from '../api/bidApi';
import { createAuctionOrder, getOrderById, getOrders } from '../api/orderApi';
import { createRazorpayPayment, verifyRazorpayPayment, getPaymentsForOrder } from '../api/paymentApi';
import { getAuctionRegistrationStatus, createAuctionRegistrationPayment, verifyAuctionRegistrationPayment } from '../api/auctionApi';
import { isAuctionRegistered, markAuctionAsRegistered } from '../utils/auctionFlowState';
import type { AuctionRegistrationStatusResponse, OrderResponseDto, RazorpayOrderResponse, PaymentResponseDto } from '../types';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { formatCurrency } from '../utils/formatters';
import { BidHistory, BidCard, CountdownTimer, WinnerBanner } from '../components/auction/AuctionComponents';

function formatDateTime(value?: string) {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return value;
  }
}

function formatCountdownLabel(startAt?: string, endAt?: string, status?: string) {
  if (!startAt || !endAt) return 'Unavailable';
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (status === 'SCHEDULED' || now < start) {
    const diff = Math.max(0, start - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m until start`;
  }
  if (status === 'RUNNING' && end > now) {
    const diff = Math.max(0, end - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m left`;
  }
  return 'Ended';
}

function isAuctionRegistrationSuccessful(response: AuctionRegistrationStatusResponse | null | undefined) {
  if (!response) return false;

  if ((response as any).registered === true) return true;
  if (response.paid === true) return true;
  if (response.status && /^(success|completed)$/i.test(String(response.status).trim())) return true;
  if (typeof response.status === 'string' && /(success|completed)/i.test(response.status)) return true;

  return false;
}

function getAmountValue(amount?: string): number {
  if (!amount) return 0;
  const parsed = Number(String(amount).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function AuctionDetailPage() {
  const { id } = useParams();
  const auctionId = Number(id);
  const { user, authReady } = useAuth();
  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [images, setImages] = useState<AuctionImageResponse[]>([]);
  const [bids, setBids] = useState<BidResponse[]>([]);
  const [winner, setWinner] = useState<AuctionWinnerResponse | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<AuctionRegistrationStatusResponse | null>(null);
  const [registered, setRegistered] = useState(() => isAuctionRegistered(auctionId));
  const [registrationLoading, setRegistrationLoading] = useState(true);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationPaymentSession, setRegistrationPaymentSession] = useState<RazorpayOrderResponse | null>(null);
  const [isRegistrationReady, setIsRegistrationReady] = useState(false);
  const [registrationLoadingAction, setRegistrationLoadingAction] = useState(false);
  const [registrationErrorAction, setRegistrationErrorAction] = useState<string | null>(null);
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [paymentSession, setPaymentSession] = useState<RazorpayOrderResponse | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);

  const loadAuction = async (loadWinner = false) => {
    if (!Number.isFinite(auctionId)) {
      setError('Invalid auction identifier');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [auctionDetails, auctionImages, auctionBids] = await Promise.all([
        getAuctionById(auctionId),
        getAuctionImages(auctionId),
        getAuctionBids(auctionId),
      ]);

      setAuction(auctionDetails);
      setImages(auctionImages);
      setBids(auctionBids.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()));

      if (loadWinner || auctionDetails.status === 'ENDED') {
        try {
          const winnerResponse = await getAuctionWinner(auctionId);
          setWinner(winnerResponse);
        } catch (winnerErr: any) {
          if (!String(winnerErr?.message).toLowerCase().includes('not found')) {
            console.warn('Winner load failed', winnerErr);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load auction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuction(true);
  }, [auctionId]);

  const loadRegistrationStatus = async () => {
    if (!Number.isFinite(auctionId)) return;
    if (!authReady) return;

    setRegistrationLoading(true);
    setRegistrationError(null);
    setRegistrationStatus(null);

    if (!user) {
      setRegistrationError('Please login to continue.');
      setRegistrationLoading(false);
      return;
    }

    if (user.type !== 'customer') {
      setRegistrationError('Please login with a customer account to continue.');
      setRegistrationLoading(false);
      return;
    }

    try {
      const status = await getAuctionRegistrationStatus(auctionId);
      const statusRegistered = isAuctionRegistrationSuccessful(status);
      if (statusRegistered) {
        markAuctionAsRegistered(auctionId);
      }
      setRegistrationStatus(status);
      setRegistered((prev) => prev || statusRegistered);
    } catch (err: any) {
      setRegistrationError(err?.message || 'Unable to load registration status');
    } finally {
      setRegistrationLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrationStatus();
  }, [auctionId, authReady, user]);

  const isRegistered = registered;
  const registrationAmountLabel = registrationStatus?.amount ? formatCurrency(registrationStatus.amount) : '₹20';

  const currentBidValue = useMemo(() => {
    if (!auction) return 0;
    const amounts = bids.map((bid) => getAmountValue(bid.amount));
    return bids.length > 0 ? Math.max(...amounts) : getAmountValue(auction.startingPrice);
  }, [auction, bids]);

  const currentBidLabel = useMemo(() => formatCurrency(currentBidValue), [currentBidValue]);

  const effectiveAuctionStatus = useMemo(() => {
    if (!auction) return 'SCHEDULED';
    return getEffectiveAuctionStatus(auction.status, auction.startAt, auction.endAt);
  }, [auction]);

  const statusLabel = useMemo(() => {
    if (!auction) return '';
    if (effectiveAuctionStatus === 'RUNNING') return 'Live';
    if (effectiveAuctionStatus === 'SCHEDULED') return 'Scheduled';
    if (effectiveAuctionStatus === 'ENDED') return 'Ended';
    if (effectiveAuctionStatus === 'CANCELLED') return 'Cancelled';
    return auction.status;
  }, [auction, effectiveAuctionStatus]);

  const canBid = effectiveAuctionStatus === 'RUNNING';
  const isScheduled = effectiveAuctionStatus === 'SCHEDULED';
  const isEnded = effectiveAuctionStatus === 'ENDED' || effectiveAuctionStatus === 'CANCELLED';

  const registrationDisabled = registrationLoading || !registered;
  const bidDisabled = !canBid || placingBid || registrationDisabled;

  const handlePlaceBid = async () => {
    if (!auction) return;
    setBidError(null);
    setMessage(null);

    if (!authReady) {
      setBidError('Checking login status. Please wait.');
      return;
    }

    if (!user) {
      setBidError('Please login to continue.');
      return;
    }

    if (user.type !== 'customer') {
      setBidError('Please login with a customer account to bid on this auction.');
      return;
    }

    if (registrationLoading) {
      setBidError('Checking registration status. Please wait.');
      return;
    }

    if (!isRegistered) {
      setBidError('Pay ₹20 registration fee to bid on this auction.');
      return;
    }

    const amountValue = Number(bidAmount);
    if (!bidAmount || Number.isNaN(amountValue) || amountValue <= 0) {
      setBidError('Enter a valid bid amount');
      return;
    }
    if (amountValue <= currentBidValue) {
      setBidError('Bid must be greater than the current highest bid');
      return;
    }

    setPlacingBid(true);
    try {
      await placeBid(auctionId, amountValue);
      setMessage('Your bid has been placed successfully.');
      setBidAmount('');
      await loadAuction(true);
    } catch (err: any) {
      setBidError(err?.message || 'Unable to place bid.');
    } finally {
      setPlacingBid(false);
    }
  };

  const isWinner = Boolean(winner && user && String(winner.winnerId) === String(user.id));

  const readStoredAuctionOrderId = (auctionId: number): number | null => {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(`bidzo_auction_order_id_${auctionId}`);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const saveStoredAuctionOrderId = (auctionId: number, orderId: number) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`bidzo_auction_order_id_${auctionId}`, String(orderId));
  };

  const getCompletedPaymentStatus = (payments: PaymentResponseDto[]) => {
    return payments.some((payment) => String(payment.status).toUpperCase() === 'SUCCESS');
  };

  const loadOrderPaymentState = async (orderId: number) => {
    try {
      const payments = await getPaymentsForOrder(orderId);
      if (getCompletedPaymentStatus(payments)) {
        setPaymentCompleted(true);
      }
    } catch (err) {
      // ignore payment lookup failures, keep the order available for retry
    }
  };

  const restoreExistingOrder = async () => {
    if (!winner || !isWinner) return;

    const storedOrderId = readStoredAuctionOrderId(auctionId);
    if (storedOrderId) {
      try {
        const existingOrder = await getOrderById(storedOrderId);
        setOrder(existingOrder);
        await loadOrderPaymentState(existingOrder.id);
        return;
      } catch {
        // ignore and continue with search below
      }
    }

    try {
      const allOrders = await getOrders();
      const matchingOrder = allOrders.find((o) => {
        const orderAmount = Number(o.totalAmount);
        const winnerAmount = getAmountValue(winner?.finalPrice);
        return orderAmount === winnerAmount;
      });

      if (matchingOrder) {
        setOrder(matchingOrder);
        saveStoredAuctionOrderId(auctionId, matchingOrder.id);
        await loadOrderPaymentState(matchingOrder.id);
      }
    } catch {
      // ignore lookup failures
    }
  };

  useEffect(() => {
    if (isWinner) {
      restoreExistingOrder();
    }
  }, [isWinner, auctionId]);

  const handlePaymentVerification = async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
    if (!order) {
      setPaymentError('Missing order information.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      await verifyRazorpayPayment(order.id, {
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      });

      await loadOrderPaymentState(order.id);
      setPaymentCompleted(true);
    } catch (err: any) {
      setPaymentError(err?.message || 'Unable to verify payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRegisterNow = async () => {
    if (!auction || registrationStatus?.paid) return;
    if (!authReady) {
      setRegistrationErrorAction('Checking login status. Please wait.');
      return;
    }
    if (!user) {
      setRegistrationErrorAction('Please login to continue.');
      return;
    }
    if (user.type !== 'customer') {
      setRegistrationErrorAction('Please login with a customer account to register for this auction.');
      return;
    }

    setRegistrationErrorAction(null);
    setRegistrationSuccessMessage(null);
    setRegistrationLoadingAction(true);
    setIsRegistrationReady(false);

    try {
      const session = await createAuctionRegistrationPayment(auctionId, 20);
      setRegistrationPaymentSession(session);
      setIsRegistrationReady(true);

      const Razorpay = (window as any).Razorpay;
      if (typeof Razorpay !== 'function') {
        throw new Error('Razorpay checkout is unavailable. Please refresh and try again.');
      }

      const options = {
        key: session.razorpayKeyId,
        amount: session.amount,
        currency: session.currency,
        order_id: session.razorpayOrderId,
        name: 'Bidzo',
        description: 'Auction registration fee',
        prefill: {
          name: user?.name || undefined,
          email: user?.email || undefined,
        },
        handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          handleRegistrationVerification(response);
        },
        modal: {
          ondismiss: () => {
            setIsRegistrationReady(false);
            setRegistrationErrorAction('Registration payment was cancelled.');
          },
        },
        theme: {
          color: '#2563eb',
        },
      };

      const checkout = new Razorpay(options);
      checkout.open();
    } catch (err: any) {
      setRegistrationErrorAction(err?.message || 'Unable to initiate registration payment.');
      setIsRegistrationReady(false);
    } finally {
      setRegistrationLoadingAction(false);
    }
  };

  const handleRegistrationVerification = async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
    setRegistrationErrorAction(null);
    setRegistrationSuccessMessage(null);
    setRegistrationLoadingAction(true);

    try {
      await verifyAuctionRegistrationPayment(auctionId, {
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      });
      await loadRegistrationStatus();
      setRegistrationSuccessMessage('Registration successful. You may now bid.');
      setIsRegistrationReady(false);
      setRegistrationPaymentSession(null);
    } catch (err: any) {
      const message = String(err?.message || 'Unable to verify registration payment.');
      if (message.toLowerCase().includes('unauthorized')) {
        setRegistrationErrorAction('Please login to continue.');
      } else if (message.toLowerCase().includes('forbidden')) {
        setRegistrationErrorAction('You do not have permission to register for this auction.');
      } else {
        setRegistrationErrorAction(message);
      }
    } finally {
      setRegistrationLoadingAction(false);
    }
  };

  const handlePayNow = async () => {
    if (!auction || paymentCompleted) return;
    setPaymentError(null);
    setPaymentLoading(true);
    setIsPaymentReady(false);

    try {
      let currentOrder = order;
      const storedOrderId = readStoredAuctionOrderId(auctionId);

      if (!currentOrder && storedOrderId) {
        try {
          currentOrder = await getOrderById(storedOrderId);
          setOrder(currentOrder);
        } catch {
          currentOrder = null;
        }
      }

      if (!currentOrder) {
        try {
          currentOrder = await createAuctionOrder(auctionId);
          setOrder(currentOrder);
          saveStoredAuctionOrderId(auctionId, currentOrder.id);
        } catch (err: any) {
          const message = String(err?.message || '');
          if (/already exists/i.test(message)) {
            const existingOrderId = readStoredAuctionOrderId(auctionId);
            if (existingOrderId) {
              currentOrder = await getOrderById(existingOrderId);
              setOrder(currentOrder);
            } else {
              const allOrders = await getOrders();
              currentOrder = allOrders.find((o) => Number(o.totalAmount) === getAmountValue(winner?.finalPrice)) ?? null;
              if (currentOrder) {
                saveStoredAuctionOrderId(auctionId, currentOrder.id);
                setOrder(currentOrder);
              }
            }
          }
          if (!currentOrder) {
            throw err;
          }
        }
      }

      if (currentOrder) {
        await loadOrderPaymentState(currentOrder.id);
        if (paymentCompleted) {
          return;
        }

        const payments = await getPaymentsForOrder(currentOrder.id);
        if (getCompletedPaymentStatus(payments)) {
          setPaymentCompleted(true);
          return;
        }

        const paymentData = await createRazorpayPayment(currentOrder.id);
        setPaymentSession(paymentData);
        setIsPaymentReady(true);

        const Razorpay = (window as any).Razorpay;
        if (typeof Razorpay !== 'function') {
          throw new Error('Razorpay checkout is unavailable. Please refresh and try again.');
        }

        const options = {
          key: paymentData.razorpayKeyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          order_id: paymentData.razorpayOrderId,
          name: 'Bidzo',
          description: 'Auction payment',
          prefill: {
            name: user?.name || undefined,
            email: user?.email || undefined,
          },
          handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            handlePaymentVerification(response);
          },
          modal: {
            ondismiss: () => {
              setPaymentError('Payment was cancelled.');
            },
          },
          theme: {
            color: '#2563eb',
          },
        };

        const checkout = new Razorpay(options);
        checkout.open();
      }
    } catch (err: any) {
      setPaymentError(err?.message || 'Unable to initiate payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const gallery = images.length > 0 ? images : [{ id: 0, url: '/logo.png', altText: auction?.title || 'Auction image', auctionId: auctionId }];
  const mainImage = gallery[0]?.url || '/logo.png';

  if (loading) {
    return (
      <SectionShell title="Auction details" subtitle="Loading auction">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell title="Auction" subtitle="Error">
        <ErrorState title="Unable to load auction" description={error} />
      </SectionShell>
    );
  }

  if (!auction) {
    return (
      <SectionShell title="Auction" subtitle="Not found">
        <EmptyState title="Auction unavailable" description="This auction could not be found." />
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Auction details" subtitle={auction.title}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                <Sparkles className="h-4 w-4" /> {statusLabel} auction
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-blue-300" /> Verified seller
              </div>
            </div>
            <img src={mainImage} alt={gallery[0]?.altText || auction.title} loading="lazy" decoding="async" className="mt-4 h-72 w-full rounded-[20px] object-cover" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {gallery.slice(0, 3).map((image) => (
                <img key={image.id} src={image.url} alt={image.altText || auction.title} loading="lazy" decoding="async" className="h-20 w-full rounded-2xl object-cover transition duration-200 hover:scale-[1.02]" />
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" /> Starting price: {formatCurrency(getAmountValue(auction.startingPrice))}</p>
              <p className="mt-2">Current highest bid: {currentBidLabel}</p>
              <p className="mt-2">Starts: {formatDateTime(auction.startAt)}</p>
              <p className="mt-2">Ends: {formatDateTime(auction.endAt)}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-lg font-semibold text-white">Auction details</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">{auction.description || 'No description available for this auction.'}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <BidCard title="Auction information">
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between"><span className="text-slate-400">Status</span><span className="font-semibold text-white">{statusLabel}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Start time</span><span className="font-semibold text-white">{formatDateTime(auction.startAt)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">End time</span><span className="font-semibold text-white">{formatDateTime(auction.endAt)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Bid count</span><span className="font-semibold text-white">{bids.length}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Auction ID</span><span className="font-semibold text-white">{auction.id}</span></div>
                </div>
              </BidCard>
              <BidCard title="Seller details">
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between"><span className="text-slate-400">Vendor</span><span className="font-semibold text-white">{auction.vendorId ? `Vendor ${auction.vendorId}` : 'TBD'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Product</span><span className="font-semibold text-white">{auction.productId ? `#${auction.productId}` : 'N/A'}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Auction created</span><span className="font-semibold text-white">{formatDateTime(auction.createdAt)}</span></div>
                </div>
              </BidCard>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Current bid</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">{currentBidLabel}</h3>
              </div>
              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">{statusLabel}</div>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isScheduled ? 'Starts in' : canBid ? 'Time left' : 'Ended'}</span>
                <span className="font-semibold text-white">{formatCountdownLabel(auction.startAt, auction.endAt, auction.status)}</span>
              </div>
            </div>

            {isEnded ? (
              <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <WinnerBanner label={winner ? `Winner ID ${winner.winnerId}` : 'Winner information not available yet'} />
                {winner ? (
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center justify-between"><span className="text-slate-400">Final price</span><span className="font-semibold text-white">{formatCurrency(getAmountValue(winner.finalPrice))}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-400">Bid ID</span><span className="font-semibold text-white">{winner.bidId}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-400">Awarded at</span><span className="font-semibold text-white">{formatDateTime(winner.awardedAt)}</span></div>
                    {isWinner ? (
                      <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                        <p className="text-sm text-slate-300">You are the winning bidder.</p>
                        {paymentCompleted ? (
                          <div className="mt-3 inline-flex items-center justify-between rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
                            Payment Completed
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePayNow}
                            disabled={paymentLoading}
                            className="mt-3 w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {paymentLoading ? 'Preparing payment…' : 'Pay Now'}
                          </button>
                        )}
                        {paymentError ? <p className="mt-3 text-sm text-rose-300">{paymentError}</p> : null}
                        {!paymentCompleted && isPaymentReady ? <p className="mt-3 text-sm text-slate-400">Razorpay checkout is ready. Complete payment in the popup.</p> : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              <label className="block text-sm font-medium text-slate-300">Place bid</label>
              <input
                value={bidAmount}
                onChange={(event) => setBidAmount(event.target.value)}
                disabled={!canBid || placingBid}
                placeholder={canBid ? `Enter amount above ${currentBidLabel}` : 'Bidding unavailable'}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                type="number"
                min={currentBidValue + 1}
              />
              {bidError ? <p className="text-sm text-rose-300">{bidError}</p> : null}
              {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
              {!registered ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                  {registrationLoading ? (
                    <p>Checking auction registration status…</p>
                  ) : (
                    <div className="space-y-3">
                      <p>Pay {registrationAmountLabel} registration fee to place bids for this auction.</p>
                      <button
                        type="button"
                        onClick={handleRegisterNow}
                        disabled={registrationLoadingAction || isRegistrationReady}
                        className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {registrationLoadingAction ? 'Preparing registration…' : isRegistrationReady ? 'Opening checkout…' : `Register for ${registrationAmountLabel}`}
                      </button>
                      {registrationErrorAction ? <p className="mt-3 text-sm text-rose-300">{registrationErrorAction}</p> : null}
                      {registrationSuccessMessage ? <p className="mt-3 text-sm text-emerald-300">{registrationSuccessMessage}</p> : null}
                      {registrationError && !registrationErrorAction ? <p className="mt-3 text-sm text-rose-300">{registrationError}</p> : null}
                    </div>
                  )}
                </div>
              ) : null}
              <button
                type="button"
                onClick={handlePlaceBid}
                disabled={bidDisabled}
                className="mt-4 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placingBid ? 'Placing bid…' : canBid ? 'Place Bid' : isScheduled ? 'Auction scheduled' : 'Bidding closed'}
              </button>
              {isScheduled ? <p className="text-sm text-slate-400">Bidding opens when the auction starts.</p> : null}
              {isEnded ? <p className="text-sm text-slate-400">Bidding is closed for ended auctions.</p> : null}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">Bid history</h4>
              <span className="text-sm text-slate-400">Newest first</span>
            </div>
            <div className="mt-4">
              {bids.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">No bids placed yet.</div>
              ) : (
                <BidHistory bids={bids.map((bid) => ({ bidder: String(bid.userId), amount: formatCurrency(getAmountValue(bid.amount)) }))} />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}
