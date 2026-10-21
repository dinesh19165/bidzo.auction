import { useNavigate, useParams } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Share2, ShieldCheck, Sparkles, Clock3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { createAuctionRazorpayPayment, getAuctionById, getAuctionImages, getAuctionWinner, getEffectiveAuctionStatus, getProductImages, verifyAuctionRazorpayPayment, type AuctionImageResponse, type AuctionResponse, type AuctionWinnerResponse } from '../api/auctionApi';
import { getAuctionBids, placeBid, type BidResponse } from '../api/bidApi';
import { getAuctionPaymentState, getOrderById, isPaidStatus } from '../api/orderApi';
import { getPaymentsForOrder } from '../api/paymentApi';
import { getAuctionRegistrationStatus, createAuctionRegistrationPayment, verifyAuctionRegistrationPayment } from '../api/auctionApi';
import { isAuctionRegistered, markAuctionAsRegistered, markOrderConfirmed, readAuctionFlowState, writeAuctionFlowState } from '../utils/auctionFlowState';
import type { AuctionRegistrationStatusResponse, RazorpayOrderResponse, PaymentResponseDto } from '../types';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { ProductSpecification } from '../components/marketplace/MarketplaceComponents';
import { formatCurrency } from '../utils/formatters';
import { BidHistory, WinnerBanner } from '../components/auction/AuctionComponents';
import { showToast } from '../components/ui/toast';
import { getProductById } from '../api/productApi';
import DeliveryAddressSelector from '../components/checkout/DeliveryAddressSelector';
import DeliveryAvailabilityCheck from '../components/delivery/DeliveryAvailabilityCheck';
import { getAddresses, type AddressResponse } from '../api/addressApi';
import { validateIndianPincode } from '../utils/indianPincode';

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
  const navigate = useNavigate();
  const { id } = useParams();
  const auctionId = Number(id);
  const { user, authReady } = useAuth();
  const { getItem, isPending, toggle } = useWishlist();
  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [productDetails, setProductDetails] = useState<Awaited<ReturnType<typeof getProductById>> | null>(null);
  const [images, setImages] = useState<AuctionImageResponse[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
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
  const [paymentSession, setPaymentSession] = useState<RazorpayOrderResponse | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bidError, setBidError] = useState<string | null>(null);
  const auctionRequestVersion = useRef(0);

  const loadAuction = async (loadWinner = false) => {
    const requestVersion = ++auctionRequestVersion.current;
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

      if (requestVersion !== auctionRequestVersion.current) return;
      setAuction(auctionDetails);
      if (auctionImages.length > 0) {
        setImages(auctionImages);
      } else if (Array.isArray(auctionDetails.images) && auctionDetails.images.length > 0) {
        setImages(auctionDetails.images.map((image, index) => ({ id: Number(image.id ?? index), url: image.url || image.imageUrl || '/logo.png', altText: auctionDetails.title, auctionId })));
      } else if (auctionDetails.image) {
        setImages([{ id: 0, url: auctionDetails.image, altText: auctionDetails.title, auctionId }]);
      } else if (auctionDetails.productId) {
        const productImages = await getProductImages(auctionDetails.productId);
        if (requestVersion !== auctionRequestVersion.current) return;
        setImages(productImages.map((image) => ({ id: image.id, url: image.url, altText: image.altText || undefined, auctionId })));
      } else {
        setImages([]);
      }
      if (requestVersion !== auctionRequestVersion.current) return;
      setBids(auctionBids.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()));

      if (loadWinner || auctionDetails.status === 'ENDED') {
        try {
          const winnerResponse = await getAuctionWinner(auctionId);
          if (requestVersion === auctionRequestVersion.current) {
            setWinner(winnerResponse);
          }
        } catch (winnerErr: any) {
          if (!String(winnerErr?.message).toLowerCase().includes('not found')) {
            console.warn('Winner load failed', winnerErr);
          }
        }
      }
    } catch (err: any) {
      if (requestVersion !== auctionRequestVersion.current) return;
      setError(err?.message || 'Unable to load auction details');
    } finally {
      if (requestVersion === auctionRequestVersion.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAuction(true);
  }, [auctionId]);

  useEffect(() => {
    let active = true;

    const pollAuctionState = async () => {
      if (!active) return;
      const requestVersion = ++auctionRequestVersion.current;
      try {
        const [auctionDetails, auctionBids] = await Promise.all([
          getAuctionById(auctionId),
          getAuctionBids(auctionId),
        ]);

        if (!active || requestVersion !== auctionRequestVersion.current) return;

        setAuction(auctionDetails);
        setBids(auctionBids.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()));

        const status = getEffectiveAuctionStatus(auctionDetails.status, auctionDetails.startAt, auctionDetails.endAt);
        if (status === 'ENDED' || status === 'CANCELLED') {
          active = false;
        }
      } catch (pollError) {
        if (active) {
          console.warn('Auction polling failed', pollError);
        }
      }
    };

    const interval = window.setInterval(pollAuctionState, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [auctionId]);

  useEffect(() => {
    const productId = auction?.productId;
    if (!productId) {
      setProductDetails(null);
      return;
    }

    let active = true;

    const loadProductDetails = async () => {
      try {
        const nextProduct = await getProductById(productId);
        if (active) {
          setProductDetails(nextProduct);
        }
      } catch {
        if (active) {
          setProductDetails(null);
        }
      }
    };

    loadProductDetails();
    return () => {
      active = false;
    };
  }, [auction?.productId]);

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
      if (import.meta.env.DEV) console.debug('AUCTION REGISTRATION STATUS', status);
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
  const registrationAmountLabel = (() => {
    const rawAmount = registrationStatus?.amount;
    if (rawAmount === null || rawAmount === undefined) return null;
    const numericAmount = Number(rawAmount);
    return Number.isFinite(numericAmount) && numericAmount > 0 ? formatCurrency(numericAmount) : null;
  })();
  const registrationRequiresPayment = registrationStatus?.paymentRequired === true || (registrationStatus?.paymentRequired !== false && registrationAmountLabel !== null);

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
      setBidError('Complete registration to bid on this auction.');
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
  const auctionWishlistParams = auction ? { itemType: 'AUCTION' as const, auctionId: auction.id } : null;
  const currentAuctionWishlistItem = auctionWishlistParams ? getItem(auctionWishlistParams) : undefined;
  const favoritePending = auctionWishlistParams ? isPending(auctionWishlistParams) : false;

  const toggleAuctionFavorite = async () => {
    if (!auction || !auctionWishlistParams || favoritePending) return;
    if (!user || (user.type !== 'customer' && user.role !== 'CUSTOMER')) {
      navigate('/login');
      return;
    }

    try {
      await toggle(auctionWishlistParams);
      showToast(
        currentAuctionWishlistItem ? 'Removed from favourites' : 'Added to favourites',
        currentAuctionWishlistItem ? 'The auction is no longer in your saved collection.' : 'Saved for your next bidding session.',
        currentAuctionWishlistItem ? 'info' : 'success',
      );
    } catch (reason) {
      showToast('Unable to update favourites', reason instanceof Error ? reason.message : 'Please try again.', 'warning');
    }
  };

  const handleShareAuction = async () => {
    if (!auction) return;
    const auctionUrl = typeof window === 'undefined'
      ? `/auctions/${auction.id}`
      : new URL(`/auctions/${auction.id}`, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({ title: auction.title, text: `Check out ${auction.title} on Bidzo`, url: auctionUrl });
        showToast('Auction shared', 'The auction link has been opened in your sharing sheet.', 'success');
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(auctionUrl);
        showToast('Auction link copied', 'The auction link has been copied to your clipboard.', 'success');
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch (reason) {
      const cancelled = reason instanceof Error && reason.name === 'AbortError';
      showToast(
        cancelled ? 'Share cancelled' : 'Unable to share auction',
        cancelled ? 'Share was cancelled.' : 'Unable to share this auction right now. Please try again.',
        cancelled ? 'info' : 'warning',
      );
    }
  };

  useEffect(() => {
    if (!isWinner || !authReady || !user || paymentCompleted) return;

    let active = true;

    const loadSavedAddress = async () => {
      try {
        const addresses = await getAddresses();
        if (!active || addresses.length === 0) return;

        const savedAddressId = readAuctionFlowState().addressId;
        const matchedAddress = savedAddressId
          ? addresses.find((address) => address.id === savedAddressId)
          : null;
        const selected = matchedAddress ?? addresses.find((address) => address.isDefault) ?? addresses[0];

        if (!selected) return;

        setSelectedAddress(selected);
        setShowAddressSelector(false);
        writeAuctionFlowState({ ...readAuctionFlowState(), addressId: selected.id });
      } catch {
        // Keep the existing selector flow as a fallback if the address API is unavailable.
      }
    };

    void loadSavedAddress();

    return () => {
      active = false;
    };
  }, [authReady, isWinner, paymentCompleted, user?.id]);

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
    return payments.some((payment) => isPaidStatus(payment.status));
  };

  const loadOrderPaymentState = async (orderId: number) => {
    setPaymentStatusLoading(true);
    try {
      const payments = await getPaymentsForOrder(orderId);
      setPaymentCompleted(getCompletedPaymentStatus(payments));
    } catch (err) {
      // ignore payment lookup failures, keep the order available for retry
    } finally {
      setPaymentStatusLoading(false);
    }
  };

  const restoreExistingOrder = async () => {
    if (!winner || !isWinner) return;

    setPaymentStatusLoading(true);
    const storedOrderId = readStoredAuctionOrderId(auctionId);
    if (storedOrderId) {
      try {
        const existingOrder = await getOrderById(storedOrderId);
        setConfirmedOrderId(existingOrder.id);
        await loadOrderPaymentState(existingOrder.id);
      } catch {
        // Fall through to the backend order list; local storage is only an optimization.
      }
    }
    try {
      const state = await getAuctionPaymentState(auctionId, storedOrderId);
      setConfirmedOrderId(state.order?.id ?? null);
      setPaymentCompleted(state.paid);
    } catch {
      // Keep payment available when the status endpoint is temporarily unavailable.
    }
    setPaymentStatusLoading(false);
  };

  useEffect(() => {
    if (isWinner) {
      restoreExistingOrder();
    }
  }, [isWinner, auctionId]);

  const handlePaymentVerification = async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }, internalOrderId: number, razorpayOrderId: string) => {
    if (!internalOrderId || !razorpayOrderId) {
      setPaymentError('Missing order information.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const verifyResponse = await verifyAuctionRazorpayPayment(auctionId, internalOrderId, {
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      });

      const extractedOrderId = Number(
        verifyResponse?.orderId ??
        (verifyResponse as any)?.data?.orderId ??
        (verifyResponse as any)?.orderId ??
        internalOrderId
      );

      if (!Number.isFinite(extractedOrderId) || extractedOrderId <= 0) {
        throw new Error('Payment was successful but the backend did not return a valid order ID.');
      }

      const persistedState = await getAuctionPaymentState(auctionId, extractedOrderId);
      if (!persistedState.paid) {
        throw new Error('Payment verification completed, but the backend has not confirmed the payment yet.');
      }
      setPaymentCompleted(true);
      setConfirmedOrderId(persistedState.order?.id ?? extractedOrderId);
      saveStoredAuctionOrderId(auctionId, extractedOrderId);
      window.localStorage.setItem(`bidzo_paid_auction_${auctionId}`, '1');
      await loadOrderPaymentState(extractedOrderId);
      markOrderConfirmed();
      navigate(`/customer/orders/${extractedOrderId}`, { replace: true });
    } catch (err: any) {
      setPaymentError(err?.message || 'Unable to verify payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRegisterNow = async () => {
    if (!auction || isEnded || registrationStatus?.paid) return;
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
      const session = await createAuctionRegistrationPayment(auctionId);
      if (import.meta.env.DEV) {
        console.debug('AUCTION REGISTRATION PAYMENT INIT', session);
        console.debug('AUCTION REGISTRATION RAZORPAY ORDER ID', session.razorpayOrderId);
      }

      if (session.paymentRequired === false) {
        markAuctionAsRegistered(auctionId);
        setRegistered(true);
        setRegistrationStatus((prev) => ({
          paid: true,
          status: 'REGISTERED',
          amount: prev?.amount ?? null,
          paymentRequired: false,
          message: session.message || prev?.message || 'Registration completed successfully.',
          registrationId: session.registrationId ?? prev?.registrationId,
        }));
        setRegistrationSuccessMessage(session.message || 'Registration completed successfully. You may now bid.');
        setRegistrationErrorAction(null);
        setIsRegistrationReady(false);
        setRegistrationPaymentSession(null);
        return;
      }

      if (!session.amount || !session.razorpayKeyId || !session.razorpayOrderId) {
        throw new Error(session.message || 'Registration payment information was not returned by the backend.');
      }

      setRegistrationPaymentSession(session);
      setIsRegistrationReady(true);

      const Razorpay = (window as any).Razorpay;
      if (typeof Razorpay !== 'function') {
        throw new Error('Razorpay checkout is unavailable. Please refresh and try again.');
      }

      const options = {
        key: session.razorpayKeyId,
        amount: session.amount,
        currency: session.currency || 'INR',
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
      if (import.meta.env.DEV) console.debug('AUCTION REGISTRATION PAYMENT ID', response.razorpay_payment_id);
      const verifyResponse = await verifyAuctionRegistrationPayment(auctionId, {
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      });
      if (import.meta.env.DEV) console.debug('AUCTION REGISTRATION VERIFY RESPONSE', verifyResponse);
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
    if (selectedAddress) {
      const pincodeError = validateIndianPincode(selectedAddress.postalCode);
      if (pincodeError) {
        setPaymentError(pincodeError);
        return;
      }
    }
    if (deliveryAvailable === false) {
      setPaymentError('Delivery is not available to the selected PIN code.');
      return;
    }
    setPaymentStatusLoading(true);
    try {
      const currentState = await getAuctionPaymentState(auctionId, readStoredAuctionOrderId(auctionId));
      if (currentState.paid) {
        setPaymentCompleted(true);
        setConfirmedOrderId(currentState.order?.id ?? null);
        if (currentState.order?.id) {
          navigate(`/customer/orders/${currentState.order.id}`, { replace: true });
        }
        return;
      }
    } catch {
      // Continue to the existing payment flow if the status lookup is unavailable.
    } finally {
      setPaymentStatusLoading(false);
    }
    const checkoutAddressId = selectedAddress?.id || readAuctionFlowState().addressId;
    if (!checkoutAddressId) {
      setShowAddressSelector(true);
      return;
    }
    setPaymentError(null);
    setPaymentLoading(true);
    setIsPaymentReady(false);

    try {
      if (import.meta.env.DEV) console.debug('AUCTION PAY NOW - INITIALIZING', { auctionId, addressId: checkoutAddressId });
      const paymentData = await createAuctionRazorpayPayment(auctionId, checkoutAddressId);
      if (import.meta.env.DEV) console.debug('AUCTION PAYMENT INIT RESPONSE', paymentData);
      const internalOrderId = paymentData.orderId ?? paymentData.internalOrderId;
      if (!internalOrderId) throw new Error('Auction payment did not return an internal order ID.');
      if (!paymentData.razorpayKeyId || !paymentData.razorpayOrderId || paymentData.amount === undefined || paymentData.currency === undefined) {
        throw new Error('Auction payment did not return complete Razorpay checkout details.');
      }

      const razorpayKeyId = paymentData.razorpayKeyId;
      const razorpayOrderId = paymentData.razorpayOrderId;
      const amount = paymentData.amount;
      const currency = paymentData.currency;

      saveStoredAuctionOrderId(auctionId, internalOrderId);
      setPaymentSession(paymentData);
      setIsPaymentReady(true);
      const Razorpay = (window as any).Razorpay;
      if (typeof Razorpay !== 'function') throw new Error('Razorpay checkout is unavailable. Please refresh and try again.');
      const checkout = new Razorpay({ key: razorpayKeyId, amount, currency, order_id: razorpayOrderId, name: 'Bidzo', description: 'Auction payment', prefill: { name: user?.name || undefined, email: user?.email || undefined }, handler: (razorpayResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => handlePaymentVerification(razorpayResponse, internalOrderId, razorpayOrderId), modal: { ondismiss: () => setPaymentError('Payment was cancelled. Please try again.') }, theme: { color: '#2563eb' } });
      checkout.open();
    } catch (err: any) {
      setPaymentError(err?.message || 'Unable to initiate payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const gallery = images.length > 0 ? images : [{ id: 0, url: '/logo.png', altText: auction?.title || 'Auction image', auctionId: auctionId }];
  const mainImage = gallery[selectedImage]?.url || gallery[0]?.url || '/logo.png';

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
    <main className="mx-auto w-full max-w-[1440px] min-w-0 px-4 py-5 sm:px-6 lg:px-8">
      <h1 className="mb-5 break-words text-2xl font-semibold leading-snug text-[var(--text-primary)] sm:mb-7 sm:text-3xl [overflow-wrap:anywhere]">{auction.title}</h1>
      <div className="grid min-w-0 items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
        <section aria-label="Auction images" className="grid min-w-0 content-start gap-3 lg:grid-cols-[4.5rem_minmax(0,1fr)]">
          <div className="order-2 flex max-w-full gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-x-hidden">
            {gallery.map((image, index) => (
              <button key={image.id} type="button" onClick={() => setSelectedImage(index)} aria-label={`Show auction image ${index + 1}`} aria-pressed={selectedImage === index} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-20 lg:h-[4.5rem] lg:w-[4.5rem] ${selectedImage === index ? 'border-blue-500' : 'border-[var(--border-color)]'}`}>
                <img src={image.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative order-1 min-w-0 overflow-hidden rounded-xl bg-[var(--surface-muted)] lg:order-2">
            <img src={mainImage} alt={gallery[selectedImage]?.altText || auction.title} loading="lazy" decoding="async" className="aspect-[4/3] max-h-[38rem] w-full object-contain" />
            <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
              <button type="button" onClick={() => void toggleAuctionFavorite()} disabled={favoritePending} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-secondary)] transition hover:text-rose-500 disabled:cursor-wait disabled:opacity-60" aria-label="Toggle auction favorite" aria-busy={favoritePending}>
                <Heart className={`h-5 w-5 transition ${currentAuctionWishlistItem ? 'fill-current text-rose-500' : ''}`} />
              </button>
              <button type="button" onClick={() => void handleShareAuction()} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-secondary)] transition hover:text-blue-600" aria-label="Share auction">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            {gallery.length > 1 ? <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-medium text-white">{selectedImage + 1} / {gallery.length}</span> : null}
          </div>
          {auction.videoUrl ? <video src={auction.videoUrl} controls playsInline className="aspect-video w-full rounded-xl bg-slate-950 object-contain lg:col-span-2" /> : null}
        </section>

        <section aria-label="Auction information" className="min-w-0 self-start">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${canBid ? 'bg-emerald-500/10 text-emerald-700' : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'}`}>
              <Sparkles aria-hidden="true" className="h-4 w-4" /> {statusLabel} auction
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-blue-600" /> Verified seller
            </span>
          </div>

          <div className="mt-5 border-t border-[var(--border-color)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Current bid</p>
            <p className="mt-1 break-words text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">{currentBidLabel}</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Starting price: <span className="font-medium text-[var(--text-secondary)]">{formatCurrency(getAmountValue(auction.startingPrice))}</span></p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-[var(--border-color)] py-3 text-sm">
            <span className="inline-flex items-center gap-2 text-[var(--text-muted)]"><Clock3 aria-hidden="true" className="h-4 w-4 text-orange-500" />{isScheduled ? 'Starts in' : canBid ? 'Time left' : 'Auction ended'}</span>
            <span className="font-semibold text-[var(--text-primary)]">{formatCountdownLabel(auction.startAt, auction.endAt, effectiveAuctionStatus)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
            <span>Seller: <span className="font-medium text-[var(--text-secondary)]">{auction.vendorId ? `Vendor ${auction.vendorId}` : 'Verified seller'}</span></span>
            {auction.productId ? <span>Product #{auction.productId}</span> : null}
          </div>

          {isEnded ? (
            <section aria-label="Auction winner" className="mt-5 border-t border-[var(--border-color)] pt-4">
              <WinnerBanner label={winner ? `Winner ID ${winner.winnerId}` : 'Winner information not available yet'} />
              {winner ? (
                <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Final price</span><span className="font-semibold text-[var(--text-primary)]">{formatCurrency(getAmountValue(winner.finalPrice))}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Bid ID</span><span className="font-semibold text-[var(--text-primary)]">{winner.bidId}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">Awarded at</span><span className="text-right font-semibold text-[var(--text-primary)]">{formatDateTime(winner.awardedAt)}</span></div>
                  {isWinner ? (
                    <div className="mt-4 border-t border-[var(--border-color)] pt-4">
                      <p className="text-sm text-[var(--text-secondary)]">You are the winning bidder.</p>
                      {paymentStatusLoading ? (
                        <p className="mt-3 text-sm font-semibold text-[var(--text-muted)]">Checking payment status...</p>
                      ) : paymentCompleted ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-semibold text-emerald-600">Payment Completed</p>
                          {confirmedOrderId ? <button type="button" onClick={() => navigate(`/customer/orders/${confirmedOrderId}`)} className="text-sm font-semibold text-blue-600 hover:underline">View Order</button> : null}
                        </div>
                      ) : (
                        <div className="mt-4">
                          {showAddressSelector ? (
                            <DeliveryAddressSelector
                              selectedAddressId={selectedAddress?.id || readAuctionFlowState().addressId}
                              onSelect={(address) => {
                                setSelectedAddress(address);
                                setDeliveryAvailable(null);
                                setPaymentError(null);
                                writeAuctionFlowState({ ...readAuctionFlowState(), addressId: address.id });
                              }}
                              onAvailabilityChange={setDeliveryAvailable}
                            />
                          ) : selectedAddress ? (
                            <DeliveryAvailabilityCheck
                              key={selectedAddress.id}
                              initialPincode={selectedAddress.postalCode}
                              readOnly
                              onAvailabilityChange={setDeliveryAvailable}
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={handlePayNow}
                            disabled={paymentLoading || paymentStatusLoading}
                            className="mt-3 min-h-12 w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {paymentLoading ? 'Preparing payment…' : 'Pay Now'}
                          </button>
                        </div>
                      )}
                      {paymentError ? <p className="mt-3 text-sm text-rose-600">{paymentError}</p> : null}
                      {!paymentCompleted && isPaymentReady ? <p className="mt-3 text-sm text-[var(--text-muted)]">Razorpay checkout is ready. Complete payment in the popup.</p> : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="mt-5 space-y-3 border-t border-[var(--border-color)] pt-4">
            <label htmlFor="auction-bid-amount" className="block text-sm font-semibold text-[var(--text-primary)]">Place bid</label>
            <input
              id="auction-bid-amount"
              value={bidAmount}
              onChange={(event) => setBidAmount(event.target.value)}
              disabled={!canBid || placingBid}
              placeholder={canBid ? `Enter amount above ${currentBidLabel}` : 'Bidding unavailable'}
              className="w-full min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              type="number"
              min={currentBidValue + 1}
            />
            {bidError ? <p className="text-sm text-rose-600">{bidError}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            {isEnded ? <p className="text-sm font-semibold text-amber-600">Auction Ended</p> : null}
            {!registered && !isEnded ? (
              <div className="space-y-3 border-y border-[var(--border-color)] py-3 text-sm text-[var(--text-secondary)]">
                {registrationLoading ? (
                  <p>Checking auction registration status…</p>
                ) : (
                  <>
                    <p>{registrationRequiresPayment && registrationAmountLabel
                      ? `Pay ${registrationAmountLabel} registration fee to place bids for this auction.`
                      : 'Registration is available for this auction without a payment. Complete registration to bid.'}</p>
                    <button
                      type="button"
                      onClick={handleRegisterNow}
                      disabled={registrationLoadingAction || isRegistrationReady}
                      className="min-h-12 w-full rounded-xl border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {registrationLoadingAction ? 'Preparing registration…' : isRegistrationReady ? 'Opening checkout…' : registrationRequiresPayment && registrationAmountLabel ? `Register for ${registrationAmountLabel}` : 'Register now'}
                    </button>
                    {registrationErrorAction ? <p className="text-sm text-rose-600">{registrationErrorAction}</p> : null}
                    {registrationSuccessMessage ? <p className="text-sm text-emerald-600">{registrationSuccessMessage}</p> : null}
                    {registrationError && !registrationErrorAction ? <p className="text-sm text-rose-600">{registrationError}</p> : null}
                  </>
                )}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handlePlaceBid}
              disabled={bidDisabled}
              className="min-h-12 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingBid ? 'Placing bid…' : canBid ? 'Place Bid' : isScheduled ? 'Auction scheduled' : 'Bidding closed'}
            </button>
            {isScheduled ? <p className="text-sm text-[var(--text-muted)]">Bidding opens when the auction starts.</p> : null}
            {isEnded ? <p className="text-sm text-[var(--text-muted)]">Bidding is closed for ended auctions.</p> : null}
          </div>

          <section aria-labelledby="auction-bid-history-heading" className="mt-6 border-t border-[var(--border-color)] pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="auction-bid-history-heading" className="text-lg font-semibold text-[var(--text-primary)]">Bid history</h2>
              <span className="text-sm text-[var(--text-muted)]">{bids.length} {bids.length === 1 ? 'bid' : 'bids'} · Newest first</span>
            </div>
            <div className="mt-3">
              {bids.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No bids placed yet.</p>
              ) : (
                <BidHistory bids={bids.map((bid) => ({ bidder: String(bid.userId), amount: formatCurrency(getAmountValue(bid.amount)) }))} />
              )}
            </div>
          </section>
        </section>
      </div>

      <div className="mt-8 divide-y divide-[var(--border-color)] border-y border-[var(--border-color)]">
        <section aria-labelledby="auction-description-heading" className="py-5">
          <h2 id="auction-description-heading" className="text-lg font-semibold text-[var(--text-primary)]">Auction details</h2>
          <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-[var(--text-secondary)] [overflow-wrap:anywhere]">{auction.description || 'No description available for this auction.'}</p>
        </section>
        <section aria-labelledby="auction-information-heading" className="py-5">
          <h2 id="auction-information-heading" className="text-lg font-semibold text-[var(--text-primary)]">Auction information</h2>
          <dl className="mt-3 grid min-w-0 grid-cols-1 divide-y divide-[var(--border-color)] sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
            {[
              ['Status', statusLabel],
              ['Start time', formatDateTime(auction.startAt)],
              ['End time', formatDateTime(auction.endAt)],
              ['Bid count', String(bids.length)],
              ['Auction ID', String(auction.id)],
              ['Seller', auction.vendorId ? `Vendor ${auction.vendorId}` : 'Verified seller'],
              ['Product', auction.productId ? `#${auction.productId}` : 'N/A'],
              ['Auction created', formatDateTime(auction.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="grid min-w-0 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 border-b border-[var(--border-color)] py-2.5 text-sm sm:gap-4">
                <dt className="break-words text-[var(--text-muted)] [overflow-wrap:anywhere]">{label}</dt>
                <dd className="break-words text-[var(--text-secondary)] [overflow-wrap:anywhere]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        {auction.productId && productDetails?.specifications?.length ? (
          <section aria-labelledby="auction-specifications-heading" className="py-5">
            <h2 id="auction-specifications-heading" className="text-lg font-semibold text-[var(--text-primary)]">Specifications</h2>
            <div className="mt-3"><ProductSpecification specs={productDetails.specifications} /></div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
