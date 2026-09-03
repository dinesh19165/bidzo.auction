import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, CreditCard, Gavel, Heart, Loader2, MapPin, PackageCheck, Search, Share2, ShieldCheck, ShoppingBag, Sparkles, Truck, Wallet, Zap, CircleDollarSign, QrCode, Printer, Download, BadgeAlert, Radio, ChevronRight } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { products, sellers, wishlistItems, reviews, transactions, categories } from '../../data/mockData';
import ProductForm from '../../components/ProductForm';
import Wizard from '../../components/Wizard';
import AuctionForm from '../../components/AuctionForm';
import UploadField from '../../components/forms/UploadField';
import { useAuth } from '../../context/AuthContext';
import { createAuctionOrder, getOrderById } from '../../api/orderApi';
import DeliveryAddressSelector from '../../components/checkout/DeliveryAddressSelector';
import type { AddressResponse } from '../../api/addressApi';
import { createRazorpayPayment, getPaymentsForOrder, verifyRazorpayPayment } from '../../api/paymentApi';
import { createVendorProduct, getVendorProducts, type SellingType } from '../../api/vendorProductApi';
import { createProductImage, createBuyNowOrder } from '../../api/productApi';
import { uploadToCloudinary } from '../../services/cloudinaryUpload';
import { getWishlist, type WishlistItemResponse } from '../../api/wishlistApi';
import { createAuction, getAuctions } from '../../api/auctionApi';
import { getVendorProfile } from '../../api/vendorApi';
import { getVendorAuctions } from '../../api/vendorAuctionApi';
import type { OrderResponseDto, PaymentResponseDto, RazorpayOrderResponse } from '../../types';
import { addMockBid, advanceAuctionClock, beginFinalPayment, enterLiveAuctionRoom, goToMarketplace, initializeAuctionFlowState, initializeAuctionFlowStateForAuction, markInvoiceReady, markOrderConfirmed, placeBid, readAuctionFlowState, resolveAuctionOutcome, startAuctionFlow, type AuctionFlowState, writeAuctionFlowState, setSelectedAuctionId, isAuctionRegistered, markAuctionAsRegistered, getSelectedAuctionId, readBuyNowFlowState, writeBuyNowFlowState, initializeBuyNowFlow, startBuyNowPayment, markBuyNowOrderConfirmed, markBuyNowInvoiceReady, clearBuyNowFlowState } from '../../utils/auctionFlowState';

function FlowBreadcrumbs({ steps }: { steps: Array<{ label: string; to?: string }> }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-full border border-white/10 bg-slate-900/70 p-2 text-sm text-slate-300">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2">
          {index > 0 && <span className="text-slate-500">/</span>}
          <span className="rounded-full px-3 py-1.5 text-slate-200">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

type AuctionFlowStepKey = 'details' | 'bid' | 'registration' | 'live' | 'result' | 'payment';

function AuctionFlowProgress({ currentStep, statusMessage }: { currentStep: AuctionFlowStepKey; statusMessage: string }) {
  const steps: Array<{ key: AuctionFlowStepKey; label: string }> = [
    { key: 'details', label: 'Details' },
    { key: 'bid', label: 'Bid' },
    { key: 'registration', label: 'Registration' },
    { key: 'live', label: 'Live Auction' },
    { key: 'result', label: 'Result' },
    { key: 'payment', label: 'Payment' },
  ];

  const activeIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="mb-6 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-white">{statusMessage}</p>
        <p className="text-slate-400">Step {Math.max(activeIndex + 1, 1)} of 6</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;
          return (
            <div key={step.key} className={`rounded-full border px-3 py-1.5 ${isActive ? 'border-blue-400/40 bg-blue-500/10 text-blue-200' : isComplete ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlowTransitionScreen({ heading, message, detail }: { heading: string; message: string; detail?: string }) {
  return (
    <SectionShell title={heading} subtitle={message}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-[24px] border border-white/10 bg-slate-900/70 p-10 text-center text-slate-300"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-slate-950/60">
          <Loader2 className="h-10 w-10 animate-spin text-blue-300" />
        </div>
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Please wait</p>
        <h3 className="text-2xl font-semibold text-white">{heading}</h3>
        <p className="max-w-xl text-sm text-slate-400">{detail ?? 'This should only take a few seconds.'}</p>
      </motion.div>
    </SectionShell>
  );
}

function useAuctionFlowBackGuard(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [enabled]);
}


export function CustomerSearchPage() {
  return (
    <SectionShell title="Search products" subtitle="Discover the right listing and continue to the next step">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <Search className="h-4 w-4 text-blue-300" />
            <input className="w-full bg-transparent text-sm outline-none" defaultValue="Premium MacBook Pro" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Electronics', 'Vehicles', 'Furniture', 'Real Estate'].map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">{tag}</span>)}
          </div>
          <Link to="/customer/filter-products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Apply filters <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Top matches</p>
          <div className="mt-4 space-y-3">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white">{product.title}</p>
                  <p>{product.category}</p>
                </div>
                <Link to={`/customer/category`} className="text-blue-300">Open</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerFilterPage() {
  return (
    <SectionShell title="Filter products" subtitle="Refine by location, price range, condition and seller type">
      <FlowBreadcrumbs steps={[{ label: 'Search', to: '/customer/search-products' }, { label: 'Filters', to: '/customer/filter-products' }, { label: 'Category', to: '/customer/category' }]} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="space-y-3 text-sm text-slate-300">
            {['Verified sellers only', 'Price range ₹10k–₹3L', 'Like new or certified', 'Bengaluru and Mumbai'].map((filter) => (
              <div key={filter} className="rounded-2xl border border-white/10 bg-white/5 p-3">{filter}</div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Results summary</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-5 text-sm text-slate-300">
            <p className="text-lg font-semibold text-white">18 premium matches</p>
            <p className="mt-2">Delivery forecast: 24h to 72h depending on order value and seller location.</p>
          </div>
          <Link to="/customer/category" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to category <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerCategoryPage() {
  return (
    <SectionShell title="Category page" subtitle="Browse the chosen category with premium filters and clear next actions">
      <FlowBreadcrumbs steps={[{ label: 'Search', to: '/customer/search-products' }, { label: 'Filters', to: '/customer/filter-products' }, { label: 'Category', to: '/customer/category' }, { label: 'Product', to: '/customer/product/1' }]} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{product.category}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{product.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{product.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-white">{product.price}</p>
              <Link to={`/customer/product/${product.id}`} className="rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerProductPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id)) || products[0];

  return (
    <SectionShell title="Product details" subtitle={product.title}>
      <FlowBreadcrumbs steps={[{ label: 'Search', to: '/customer/search-products' }, { label: 'Category', to: '/customer/category' }, { label: 'Product', to: `/customer/product/${product.id}` }, { label: 'Seller', to: '/customer/seller/1' }]} />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
          <img src={product.image} alt={product.title} className="h-80 w-full rounded-[20px] object-cover" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/customer/seller/1" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">View seller</Link>
            <Link to="/customer/wishlist" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Add to wishlist</Link>
            <Link to="/customer/watch-auction" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Watch auction</Link>
            <Link to="/customer/place-bid" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Place bid</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {['Verified seller', 'Secure delivery', 'Express support'].map((feature) => <div key={feature} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{feature}</div>)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">{product.category}</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">{product.price}</h3>
            <p className="mt-3 text-sm text-slate-300">{product.description}</p>
            <div className="mt-6 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Seller:</span> {product.seller}</p>
              <p><span className="text-slate-500">Condition:</span> {product.condition}</p>
              <p><span className="text-slate-500">Location:</span> {product.location}</p>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h4 className="text-lg font-semibold text-white">Why buyers love it</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>• Trusted checkout and delivery estimates</li>
              <li>• Verified coverage for high-value items</li>
              <li>• Flexible wallet and card payments</li>
            </ul>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerSellerPage() {
  const seller = sellers[0];

  return (
    <SectionShell title="Seller profile" subtitle={seller.name}>
      <FlowBreadcrumbs steps={[{ label: 'Product', to: '/customer/product/1' }, { label: 'Seller', to: '/customer/seller/1' }, { label: 'Wishlist', to: '/customer/wishlist' }]} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300"><BadgeCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Verified seller</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">Trusted by 12.4k buyers</h3>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-300">This seller offers rapid dispatch, premium packaging, and responsive support for high-value orders and auctions.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/customer/wishlist" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Add to wishlist</Link>
            <Link to="/customer/watch-auction" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Watch auction</Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h4 className="text-lg font-semibold text-white">Recent buyer feedback</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {reviews.map((review) => <div key={review.author} className="rounded-2xl border border-white/10 bg-white/5 p-3">{review.quote}</div>)}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerWishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getWishlist();
        setWishlist(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wishlist');
      } finally {
        setIsLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const items = wishlist;

  if (isLoading) {
    return (
      <SectionShell title="Wishlist" subtitle="Saved products and auctions you want to follow">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500"></div>
            <p className="mt-4 text-slate-400">Loading your wishlist...</p>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell title="Wishlist" subtitle="Saved products and auctions you want to follow">
        <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-6 text-slate-300">
          <p className="text-sm font-medium text-rose-200">Wishlist Error</p>
          <p className="mt-2">{error}</p>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Wishlist" subtitle="Saved products and auctions you want to follow">
      <FlowBreadcrumbs steps={[{ label: 'Product', to: '/customer/product/1' }, { label: 'Wishlist', to: '/customer/wishlist' }, { label: 'Auction', to: '/customer/watch-auction' }]} />
      {items && items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item: any) => {
            const product = item.product ?? null;
            const title = product?.name || 'Wishlist item';
            const description = product?.description || 'Saved item';
            const price = Number(product?.price ?? 0);

            return (
              <div key={item.id || product?.id || title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{title}</p>
                  <Heart className="h-4 w-4 text-amber-300" />
                </div>
                <p className="mt-2 text-sm text-slate-400">{description}</p>
                <p className="mt-4 text-lg font-semibold text-white">₹{price.toLocaleString()}</p>
                <div className="mt-4 flex gap-3">
                  <Link to="/customer/watch-auction" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Watch</Link>
                  <Link to="/customer/place-bid" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Bid</Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-4 text-slate-400">Your wishlist is empty</p>
        </div>
      )}
    </SectionShell>
  );
}

export function CustomerWatchAuctionPage() {
  const navigate = useNavigate();
  const [runtimeAuction, setRuntimeAuction] = useState<{ id: number; title: string; status: string; currentBid: number; participants: number; endsIn: string } | null>(null);
  const [selectedAuctionId, setSelectedAuctionIdState] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const loadRuntimeAuction = async () => {
      try {
        const auctions = await getAuctions();
        if (!active) return;

        const candidate = auctions.find((item: { status: string }) => item.status === 'Live') ?? auctions.find((item: { status: string }) => item.status === 'Upcoming') ?? null;
        if (!candidate) {
          setRuntimeAuction(null);
          setSelectedAuctionIdState(null);
          return;
        }

        const nextBid = Number(String(candidate.currentBid).replace(/[^0-9.-]/g, '')) || 0;
        const nextState = {
          id: candidate.id,
          title: candidate.title,
          status: candidate.status,
          currentBid: nextBid,
          participants: candidate.participants || 0,
          endsIn: candidate.endsIn,
        };

        setSelectedAuctionIdState(candidate.id);
        setSelectedAuctionId(candidate.id);
        setRuntimeAuction(nextState);
      } catch {
        setRuntimeAuction(null);
        setSelectedAuctionIdState(null);
      }
    };

    loadRuntimeAuction();
    return () => {
      active = false;
    };
  }, []);

  const effectiveSelectedAuctionId = selectedAuctionId ?? getSelectedAuctionId() ?? 0;
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => {
    const initialFlowState = readAuctionFlowState();
    if (effectiveSelectedAuctionId > 0 && initialFlowState.auctionId !== effectiveSelectedAuctionId) {
      return initializeAuctionFlowStateForAuction(effectiveSelectedAuctionId);
    }

    if (['WINNER', 'OUTBID', 'AUCTION_ENDED', 'FINAL_PAYMENT', 'ORDER_SUCCESS', 'INVOICE'].includes(initialFlowState.auctionStage)) {
      return initializeAuctionFlowStateForAuction(effectiveSelectedAuctionId || initialFlowState.auctionId);
    }

    return initialFlowState;
  });

  useEffect(() => {
    if (effectiveSelectedAuctionId > 0) {
      setSelectedAuctionId(effectiveSelectedAuctionId);
    }
  }, [effectiveSelectedAuctionId]);

  useAuctionFlowBackGuard(false);

  const auctionStatus = runtimeAuction?.status || 'Ended';
  const registered = effectiveSelectedAuctionId > 0 ? isAuctionRegistered(effectiveSelectedAuctionId) : false;

  if (!runtimeAuction) {
    return (
      <SectionShell title="Watch auction" subtitle="No live auctions available right now">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
          <p className="text-lg font-semibold text-white">No active auctions found</p>
          <p className="mt-4">The backend response currently has no live or upcoming auctions to show.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/auctions" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Browse auctions</Link>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (auctionStatus === 'Ended') {
    return (
      <SectionShell title="Auction closed" subtitle="This auction has ended">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
          <p className="text-lg font-semibold text-white">Auction ended</p>
          <p className="mt-4">This auction is no longer accepting bids.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/auctions" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Browse auctions</Link>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (auctionStatus === 'Sold') {
    return (
      <SectionShell title="Auction sold" subtitle="Bidding is disabled for this item">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
          <p className="text-lg font-semibold text-white">Sold</p>
          <p className="mt-4">This auction winner has already been declared and bidding is disabled.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/auctions" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Browse auctions</Link>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (registered && auctionStatus === 'Live') {
    return <Navigate to="/customer/auction-live" replace />;
  }

  if (flowState.auctionStage === 'BID_CONFIRMATION') {
    return <Navigate to="/customer/bid-confirmation" replace />;
  }

  if (flowState.auctionStage === 'REGISTRATION_FEE' || flowState.auctionStage === 'REGISTRATION_PAYMENT') {
    return <Navigate to="/registration-fee" replace />;
  }

  if (flowState.auctionStage === 'LIVE_AUCTION' || flowState.auctionStage === 'AUCTION_ENDED') {
    return <Navigate to="/customer/auction-live" replace />;
  }

  const beginBidFlow = () => {
    const nextState = startAuctionFlow();
    setFlowState(nextState);
    navigate('/customer/place-bid', { replace: true });
  };

  const auctionTitle = runtimeAuction?.title || flowState.auctionTitle;
  const currentHighestBid = runtimeAuction ? runtimeAuction.currentBid : flowState.highestBid;
  const participantCount = runtimeAuction ? runtimeAuction.participants : flowState.participants;

  return (
    <SectionShell title="Watch auction" subtitle="Follow live bidding events and be ready to act">
      <FlowBreadcrumbs steps={[{ label: 'Wishlist', to: '/customer/wishlist' }, { label: 'Watch', to: '/customer/watch-auction' }, { label: 'Bid', to: '/customer/place-bid' }]} />
      <AuctionFlowProgress currentStep="details" statusMessage="Step 1 of 6 – Review Details" />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Live countdown</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{auctionTitle}</h3>
          </div>
          <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">{auctionStatus}</div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" /> {runtimeAuction ? runtimeAuction.endsIn : `Ends in ${flowState.secondsLeft}s`}</p>
            <p className="mt-3">Current highest bid: ₹{currentHighestBid.toLocaleString()}</p>
            <p className="mt-2">Participants: {participantCount}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={beginBidFlow} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Place bid</button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Share2 className="h-4 w-4 text-blue-300" /> Share auction</p>
            <p className="mt-2">Send a private link to your colleagues or co-bidders before the final countdown.</p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerPlaceBidPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const [bidAmount, setBidAmount] = useState(String(readAuctionFlowState().highestBid + 5000));

  if (flowState.auctionStage === 'BID_CONFIRMATION') {
    return <Navigate to="/customer/bid-confirmation" replace />;
  }

  if (flowState.auctionStage === 'REGISTRATION_FEE' || flowState.auctionStage === 'REGISTRATION_PAYMENT') {
    return <Navigate to="/registration-fee" replace />;
  }

  if (flowState.auctionStage === 'LIVE_AUCTION' || flowState.auctionStage === 'AUCTION_ENDED') {
    return <Navigate to="/customer/auction-live" replace />;
  }

  if (flowState.auctionStage === 'WINNER' || flowState.auctionStage === 'FINAL_PAYMENT' || flowState.auctionStage === 'ORDER_SUCCESS' || flowState.auctionStage === 'INVOICE' || flowState.auctionStage === 'OUTBID') {
    return <Navigate to="/customer/winner" replace />;
  }

  if (flowState.auctionStage !== 'PLACE_BID') {
    return <Navigate to="/customer/watch-auction" replace />;
  }
  const [autoBid, setAutoBid] = useState(true);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const amount = Number(bidAmount.replace(/[^\d]/g, ''));
    setIsValid(!Number.isNaN(amount) && amount >= flowState.highestBid + 5000);
  }, [bidAmount, flowState.highestBid]);

  const handleSubmitBid = () => {
    if (!isValid) return;

    const bidderName = user?.name || 'You';
    const nextState = placeBid(bidAmount, bidderName, bidderName);
    setFlowState(nextState);

    const registered = isAuctionRegistered(nextState.auctionId);
    if (registered) {
      navigate('/customer/auction-live', { replace: true });
    } else {
      navigate('/registration-fee', { replace: true });
    }
  };

  return (
    <SectionShell title="Place bid" subtitle="Enter your bid and review the confirmation before checkout">
      <FlowBreadcrumbs steps={[{ label: 'Watch', to: '/customer/watch-auction' }, { label: 'Bid', to: '/customer/place-bid' }, { label: 'Confirmation', to: '/customer/bid-confirmation' }]} />
      <AuctionFlowProgress currentStep="bid" statusMessage="Step 2 of 6 – Place Your Bid" />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Bid details</p>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-slate-400">Current bid</p><p className="mt-1 font-semibold text-white">₹{flowState.highestBid.toLocaleString()}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-slate-400">Minimum next bid</p><p className="mt-1 font-semibold text-white">₹{(flowState.highestBid + 5000).toLocaleString()}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-slate-400">Suggested bid</p><p className="mt-1 font-semibold text-white">₹{(flowState.highestBid + 10000).toLocaleString()}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-slate-400">Winning chance</p><p className="mt-1 font-semibold text-white">82%</p></div>
          </div>
          <label className="mt-5 block text-sm text-slate-400" htmlFor="bid-amount">Enter amount</label>
          <input id="bid-amount" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60" />
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <span>Auto-bid</span>
            <button type="button" onClick={() => setAutoBid((prev) => !prev)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${autoBid ? 'bg-blue-600' : 'bg-slate-700'}`} aria-pressed={autoBid}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${autoBid ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${isValid ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200' : 'border-amber-400/25 bg-amber-500/10 text-amber-200'}`}>
            {isValid ? 'Your bid is valid and ready to place.' : 'Please increase your bid to meet the minimum next bid.'}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={handleSubmitBid} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">Submit bid</button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Bid history</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {flowState.bids.map((bid) => <div key={`${bid.bidder}-${bid.amount}-${bid.time}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">{bid.bidder} • ₹{bid.amount.toLocaleString()}</div>)}
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export function CustomerBidConfirmationPage() {
  const navigate = useNavigate();
  const [flowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const auctionStage = flowState.auctionStage;

  useAuctionFlowBackGuard(true);

  useEffect(() => {
    if (auctionStage !== 'BID_CONFIRMATION') return;

    const registered = isAuctionRegistered(flowState.auctionId);
    const target = registered ? '/customer/auction-live' : '/registration-fee';
    const timer = window.setTimeout(() => {
      navigate(target, { replace: true });
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [flowState.auctionStage, flowState.auctionId, navigate]);

  if (auctionStage === 'BID_CONFIRMATION') {
    const registered = isAuctionRegistered(flowState.auctionId);
    return (
      <FlowTransitionScreen
        heading={registered ? 'Joining Live Auction...' : 'Auction Starting...'}
        message={registered ? 'Preparing your live bidding room' : 'Preparing your auction registration'}
        detail="You will be redirected in a few seconds."
      />
    );
  }

  if (auctionStage === 'REGISTRATION_FEE' || auctionStage === 'REGISTRATION_PAYMENT') {
    return <Navigate to="/registration-fee" replace />;
  }

  if (auctionStage === 'LIVE_AUCTION' || auctionStage === 'AUCTION_ENDED') {
    return <Navigate to="/customer/auction-live" replace />;
  }

  if (auctionStage === 'WINNER' || auctionStage === 'FINAL_PAYMENT' || auctionStage === 'ORDER_SUCCESS' || auctionStage === 'INVOICE' || auctionStage === 'OUTBID') {
    return <Navigate to="/customer/winner" replace />;
  }

  return <Navigate to="/customer/watch-auction" replace />;

  return (
    <SectionShell title="Bid confirmation" subtitle="Your bid is ready. Finish verification and payment to secure the item.">
      <FlowBreadcrumbs steps={[{ label: 'Bid', to: '/customer/place-bid' }, { label: 'Confirmation', to: '/customer/bid-confirmation' }, { label: 'Fee', to: '/registration-fee' }]} />
      <AuctionFlowProgress currentStep="bid" statusMessage="Step 2 of 6 – Bid Confirmed" />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Order summary</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Item: {flowState.auctionTitle}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Bid: ₹{flowState.highestBid.toLocaleString()}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Registration fee: ₹20</div>
          </div>
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Estimated payment: ₹{(flowState.highestBid + 20).toLocaleString()}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Continuing to registration payment.
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Next steps</p>
          <p className="mt-3 text-sm text-slate-300">Complete the registration payment before the live auction closes. Your wallet balance will be updated immediately after confirmation.</p>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export function CustomerWalletPaymentPage() {
  const navigate = useNavigate();
  const [flowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadBalance = async () => {
      try {
        const { getWallet } = await import('../../api/walletApi');
        const wallet = await getWallet();
        if (isMounted) {
          setWalletBalance(Number(wallet?.balance ?? 0));
        }
      } catch (err) {
        if (isMounted) {
          setWalletError(err instanceof Error ? err.message : 'Failed to load wallet balance');
          setWalletBalance(0);
        }
      }
    };

    loadBalance();
    return () => { isMounted = false; };
  }, []);

  useAuctionFlowBackGuard(true);

  if (flowState.auctionStage === 'BID_CONFIRMATION' || flowState.auctionStage === 'REGISTRATION_FEE' || flowState.auctionStage === 'REGISTRATION_PAYMENT') {
    return <Navigate to="/registration-fee" replace />;
  }

  if (flowState.auctionStage === 'FINAL_PAYMENT' || flowState.auctionStage === 'ORDER_SUCCESS' || flowState.auctionStage === 'INVOICE') {
    return <Navigate to="/customer/payment" replace />;
  }

  if (flowState.auctionStage === 'WINNER') {
    return <Navigate to="/customer/payment" replace />;
  }

  return (
    <SectionShell title="Wallet payment" subtitle="Use your wallet balance for the winning bid and related fees">
      <FlowBreadcrumbs steps={[{ label: 'Fee', to: '/registration-fee' }, { label: 'Wallet', to: '/customer/wallet-payment' }, { label: 'Checkout', to: '/customer/checkout' }]} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Available balance</p>
          <p className="mt-3 text-3xl font-semibold text-white">₹{walletBalance.toLocaleString()}</p>
          {walletError ? (
            <p className="mt-3 text-sm text-rose-300">{walletError}</p>
          ) : null}
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fee due: ₹20</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Auction balance reserve: ₹2,50,000</div>
          </div>
          <Link to="/customer/payment" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to payment <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Payment protection</p>
          <p className="mt-3 text-sm text-slate-300">Your wallet payment is secured with instant confirmation and order protection for every completed purchase.</p>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerAuctionLivePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialFlowState = readAuctionFlowState();
  const [flowState, setFlowState] = useState<AuctionFlowState>(initialFlowState);
  const [bidAmount, setBidAmount] = useState(String(initialFlowState.highestBid + 5000));
  const [highlightedBidId, setHighlightedBidId] = useState<string | null>(null);
  const [highestBidHighlight, setHighestBidHighlight] = useState(false);
  const [runtimeAuction, setRuntimeAuction] = useState<{ id: number; title: string; status: string; currentBid: number; participants: number; endsIn: string } | null>(null);
  const previousBidsRef = useRef(flowState.bids);

  useEffect(() => {
    let active = true;

    const syncRuntimeAuction = async () => {
      try {
        const auctions = await getAuctions();
        if (!active) return;

        const candidate = auctions.find((item: { status: string }) => item.status === 'Live') ?? auctions.find((item: { status: string }) => item.status === 'Upcoming') ?? null;
        if (!candidate) {
          setRuntimeAuction(null);
          return;
        }

        const amountValue = Number(String(candidate.currentBid).replace(/[^0-9.-]/g, '')) || 0;

        setRuntimeAuction({
          id: candidate.id,
          title: candidate.title,
          status: candidate.status,
          currentBid: amountValue,
          participants: candidate.participants || 0,
          endsIn: candidate.endsIn,
        });

        setSelectedAuctionId(candidate.id);
        setFlowState((prev) => ({
          ...prev,
          auctionId: candidate.id,
          auctionTitle: candidate.title,
          highestBid: amountValue,
          participants: candidate.participants || prev.participants,
          auctionEndTime: candidate.endsIn,
        }));
      } catch {
        setRuntimeAuction(null);
      }
    };

    syncRuntimeAuction();
    return () => {
      active = false;
    };
  }, []);

  useAuctionFlowBackGuard(true);

  const auctionStage = flowState.auctionStage;
  const shouldSendToWatchAuction = auctionStage !== 'REGISTRATION_PAYMENT' && auctionStage !== 'LIVE_AUCTION' && auctionStage !== 'AUCTION_ENDED' && auctionStage !== 'WINNER' && auctionStage !== 'OUTBID' && auctionStage !== 'FINAL_PAYMENT' && auctionStage !== 'ORDER_SUCCESS' && auctionStage !== 'INVOICE';
  const isBidConfirmation = auctionStage === 'BID_CONFIRMATION';
  const isRegistrationPayment = auctionStage === 'REGISTRATION_PAYMENT';
  const isWinnerStage = auctionStage === 'WINNER';
  const isOutbidStage = auctionStage === 'OUTBID';

  useEffect(() => {
    const currentStage = flowState.auctionStage;

    if (currentStage === 'REGISTRATION_PAYMENT' || currentStage === 'REGISTRATION_FEE') {
      const timer = window.setTimeout(() => {
        setFlowState(enterLiveAuctionRoom());
      }, 1800);
      return () => window.clearTimeout(timer);
    }

    if (currentStage === 'LIVE_AUCTION' || currentStage === 'AUCTION_ENDED' || currentStage === 'WINNER' || currentStage === 'OUTBID' || currentStage === 'BID_CONFIRMATION' || currentStage === 'FINAL_PAYMENT' || currentStage === 'ORDER_SUCCESS' || currentStage === 'INVOICE') {
      return;
    }

    const nextState = enterLiveAuctionRoom();
    setFlowState(nextState);
  }, [flowState.auctionStage]);

  useEffect(() => {
    if (flowState.auctionStage !== 'LIVE_AUCTION') return;

    const timer = window.setInterval(() => {
      const nextState = advanceAuctionClock(user?.name || 'You');
      setFlowState(nextState);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [flowState.auctionStage, user?.name]);

  useEffect(() => {
    if (flowState.auctionStage !== 'LIVE_AUCTION') return;

    const mockTimer = window.setInterval(() => {
      setFlowState(addMockBid());
    }, 5000);

    return () => window.clearInterval(mockTimer);
  }, [flowState.auctionStage]);

  useEffect(() => {
    if (flowState.auctionStage === 'AUCTION_ENDED' || (flowState.auctionStage === 'LIVE_AUCTION' && flowState.secondsLeft <= 0)) {
      const resolved = resolveAuctionOutcome(user?.name || 'You');
      setFlowState(resolved);
    }
  }, [flowState.auctionStage, flowState.secondsLeft, user?.name]);

  useEffect(() => {
    if (flowState.auctionStage === 'WINNER' || flowState.auctionStage === 'OUTBID') {
      navigate('/customer/winner', { replace: true });
    }
  }, [flowState.auctionStage, navigate]);

  useEffect(() => {
    if (flowState.bids.length === 0) return;

    const latestBid = flowState.bids[0];
    const previousBid = previousBidsRef.current[0];
    const hasNewBid = !previousBid || previousBid.bidder !== latestBid.bidder || previousBid.amount !== latestBid.amount;

    if (hasNewBid) {
      setHighlightedBidId(`${latestBid.bidder}-${latestBid.amount}-${latestBid.time}`);
      setHighestBidHighlight(true);
      const timer = window.setTimeout(() => {
        setHighlightedBidId(null);
        setHighestBidHighlight(false);
      }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [flowState.bids]);

  useEffect(() => {
    previousBidsRef.current = flowState.bids;
  }, [flowState.bids]);

  if (isBidConfirmation) {
    return <Navigate to="/customer/bid-confirmation" replace />;
  }

  if (isRegistrationPayment) {
    return (
      <FlowTransitionScreen
        heading="Joining Live Auction..."
        message="Auction Starting..."
        detail="Preparing the live room for your bid."
      />
    );
  }

  const isAuctionClosed = auctionStage !== 'LIVE_AUCTION' || flowState.secondsLeft <= 0;

  if (shouldSendToWatchAuction) {
    return <Navigate to="/customer/watch-auction" replace />;
  }
  const auctionStatus =
    auctionStage === 'WINNER'
      ? 'WINNER DECLARED'
      : auctionStage === 'OUTBID'
      ? 'SOLD'
      : auctionStage === 'AUCTION_ENDED' || flowState.secondsLeft <= 0
      ? 'ENDED'
      : 'Live';

  const placeNewBid = () => {
    const nextState = placeBid(bidAmount, user?.name || 'You', user?.name || 'You');
    setFlowState(nextState);
  };

  if (isWinnerStage) {
    return (
      <SectionShell title="Auction winner" subtitle="Congratulations — your bid secured the auction item">
        <FlowBreadcrumbs steps={[{ label: 'Live', to: '/customer/auction-live' }, { label: 'Winner', to: '/customer/winner' }, { label: 'Checkout', to: '/customer/checkout' }]} />
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Winning status</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">You won {flowState.auctionTitle}</h3>
            <p className="mt-3 text-sm text-slate-300">Winning amount: ₹{flowState.winningAmount.toLocaleString()}</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Moving you to final payment automatically.
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Auction summary</p>
            <p className="mt-3 text-sm text-slate-300">Highest bidder: {flowState.winnerName}</p>
            <p className="mt-2 text-sm text-slate-300">Winning amount: ₹{flowState.winningAmount.toLocaleString()}</p>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (isOutbidStage) {
    const recommendedLiveAuctions = [
      { title: 'Luxury Sports Watch', currentBid: '₹3,10,000', endsIn: '05m 12s' },
      { title: 'Vintage Chronograph Timepiece', currentBid: '₹2,72,000', endsIn: '02m 18s' },
      { title: 'Limited Edition Dive Watch', currentBid: '₹2,95,500', endsIn: '08m 04s' },
    ];

    const recentlyEndedAuctions = [
      { title: 'Heritage Racing Timepiece', soldFor: '₹4,20,000' },
      { title: 'Classic Pilot Watch', soldFor: '₹3,75,500' },
      { title: 'Modern Dress Watch', soldFor: '₹2,90,000' },
    ];

    return (
      <SectionShell title="Auction ended" subtitle="The countdown is over and your bid was not the highest.">
        <FlowBreadcrumbs steps={[{ label: 'Live', to: '/customer/auction-live' }, { label: 'Ended', to: '/customer/auction-live' }]} />
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Auction summary</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">You were outbid</h3>
            </div>
            <div className="rounded-full border border-amber-300/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-200">SOLD</div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Winner</p>
              <p className="mt-2 text-lg font-semibold text-white">{flowState.winnerName || flowState.highestBidder}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Winning bid</p>
              <p className="mt-2 text-lg font-semibold text-white">₹{flowState.winningAmount.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Total bids</p>
              <p className="mt-2 text-lg font-semibold text-white">{flowState.bids.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Participants</p>
              <p className="mt-2 text-lg font-semibold text-white">{flowState.participants}</p>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Auction end time</p>
              <p className="mt-2 text-lg font-semibold text-white">{flowState.auctionEndTime}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/auctions" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Browse More Auctions <ArrowRight className="h-4 w-4" /></Link>
            <a href="#recommended-live-auctions" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">View Similar Auctions</a>
            <Link to="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Return to Marketplace</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6" id="recommended-live-auctions">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Recommended Live Auctions</p>
                <p className="mt-2 text-sm text-slate-400">Active auctions that are still accepting bids.</p>
              </div>
              {recommendedLiveAuctions.length === 0 && (
                <button type="button" onClick={() => window.location.reload()} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Refresh</button>
              )}
            </div>

            {recommendedLiveAuctions.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-slate-300">
                <p className="text-lg font-semibold text-white">No Live Auctions Available</p>
                <p className="mt-2 text-sm text-slate-400">Try refreshing to fetch the latest live listings.</p>
                <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Refresh</button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {recommendedLiveAuctions.map((auction) => (
                  <div key={auction.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Live now</p>
                        <h4 className="mt-2 text-lg font-semibold text-white">{auction.title}</h4>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Live</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                      <span>Current bid: {auction.currentBid}</span>
                      <span>Ends in {auction.endsIn}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Recently Ended Auctions</p>
            <p className="mt-2 text-sm text-slate-400">Recently sold items you may want to watch next time.</p>
            <div className="mt-6 space-y-4">
              {recentlyEndedAuctions.map((auction) => (
                <div key={auction.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{auction.title}</h4>
                      <p className="mt-2 text-sm text-slate-400">Sold for {auction.soldFor}</p>
                    </div>
                    <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-200">SOLD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Auction live screen" subtitle="See the bid stream, timer, and bid controls in one place">
      <FlowBreadcrumbs steps={[{ label: 'Watch', to: '/customer/watch-auction' }, { label: 'Live', to: '/customer/auction-live' }, { label: 'Winner', to: '/customer/winner' }]} />
      <AuctionFlowProgress currentStep="live" statusMessage="Step 4 of 6 – Waiting for Auction to End" />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Current highest bid</p>
              <motion.div initial={false} animate={highestBidHighlight ? { scale: [1, 1.03, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-2 text-3xl font-semibold text-white">₹{flowState.highestBid.toLocaleString()}</motion.div>
            </div>
            <div className={`rounded-full px-3 py-1 text-sm ${auctionStatus === 'Live' ? 'bg-emerald-500/10 text-emerald-300' : auctionStatus === 'WINNER DECLARED' ? 'bg-emerald-500/10 text-emerald-300' : auctionStatus === 'SOLD' ? 'bg-amber-500/10 text-amber-300' : auctionStatus === 'ENDED' ? 'bg-slate-600/10 text-slate-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{auctionStatus}</div>
          </div>
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-slate-200">
            <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" /> {flowState.secondsLeft}s remaining</div>
          </div>
          { !isAuctionClosed && (
            <>
              <div className="mt-5 flex flex-wrap gap-3">
                <input value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white sm:max-w-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60" />
                <button type="button" onClick={placeNewBid} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">Place bid</button>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Participants {flowState.participants}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Connection status: Connected</span>
              </div>
            </>
          )}
          {isAuctionClosed && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
              This auction has ended and bidding is closed.
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h4 className="text-lg font-semibold text-white">Bid history</h4>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {flowState.bids.map((bid) => {
              const bidId = `${bid.bidder}-${bid.amount}-${bid.time}`;
              const isHighlighted = highlightedBidId === bidId;
              return (
                <motion.div key={bidId} initial={{ opacity: 0.75, y: 6 }} animate={isHighlighted ? { opacity: 1, scale: 1.01, y: 0 } : { opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  {bid.bidder} • ₹{bid.amount.toLocaleString()}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export function CustomerWinnerPage() {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => readAuctionFlowState());

  useAuctionFlowBackGuard(true);

  const restartLiveAuction = () => {
    const nextState = initializeAuctionFlowState();
    setFlowState(nextState);
    navigate('/customer/watch-auction', { replace: true });
  };

  const [isCalculatingWinner, setIsCalculatingWinner] = useState(false);

  useEffect(() => {
    if (flowState.auctionStage === 'WINNER') {
      setIsCalculatingWinner(true);
      const timer = window.setTimeout(() => {
        const nextState = beginFinalPayment();
        setFlowState(nextState);
        navigate('/customer/payment', { replace: true });
      }, 2400);
      return () => {
        window.clearTimeout(timer);
        setIsCalculatingWinner(false);
      };
    }
    return undefined;
  }, [flowState.auctionStage, navigate]);

  if (flowState.auctionStage === 'WINNER' && isCalculatingWinner) {
    return (
      <FlowTransitionScreen
        heading="Calculating Winner..."
        message="Finalizing the auction result"
        detail="You will be redirected to payment shortly."
      />
    );
  }

  if (flowState.auctionStage === 'OUTBID') {
    const recommendedLiveAuctions = [
      { title: 'Luxury Sports Watch', currentBid: '₹3,10,000', endsIn: '05m 12s' },
      { title: 'Vintage Chronograph Timepiece', currentBid: '₹2,72,000', endsIn: '02m 18s' },
      { title: 'Limited Edition Dive Watch', currentBid: '₹2,95,500', endsIn: '08m 04s' },
    ];

    const recentlyEndedAuctions = [
      { title: 'Heritage Racing Timepiece', soldFor: '₹4,20,000' },
      { title: 'Classic Pilot Watch', soldFor: '₹3,75,500' },
      { title: 'Modern Dress Watch', soldFor: '₹2,90,000' },
    ];

    return (
      <SectionShell title="Auction ended" subtitle="The timer has finished and you were outbid.">
        <FlowBreadcrumbs steps={[{ label: 'Live', to: '/customer/auction-live' }, { label: 'Ended', to: '/customer/winner' }]} />
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Auction summary</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Better luck next time</h3>
            </div>
            <div className="rounded-full border border-amber-300/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-200">SOLD</div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Winner</p>
              <p className="mt-2 text-lg font-semibold text-white">{flowState.winnerName || flowState.highestBidder}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Winning bid</p>
              <p className="mt-2 text-lg font-semibold text-white">₹{flowState.winningAmount.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Total bids</p>
              <p className="mt-2 text-lg font-semibold text-white">{flowState.bids.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Participants</p>
              <p className="mt-2 text-lg font-semibold text-white">{flowState.participants}</p>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Auction end time</p>
              <p className="mt-2 text-lg font-semibold text-white">{flowState.auctionEndTime}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={restartLiveAuction} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950">Restart Live Auction <ArrowRight className="h-4 w-4" /></button>
            <Link to="/auctions" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Browse More Auctions <ArrowRight className="h-4 w-4" /></Link>
            <a href="#recommended-live-auctions" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">View Similar Auctions</a>
            <Link to="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Return to Marketplace</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6" id="recommended-live-auctions">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Recommended Live Auctions</p>
                <p className="mt-2 text-sm text-slate-400">Active auctions that are still accepting bids.</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {recommendedLiveAuctions.map((auction) => (
                <div key={auction.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Live now</p>
                      <h4 className="mt-2 text-lg font-semibold text-white">{auction.title}</h4>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Live</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                    <span>Current bid: {auction.currentBid}</span>
                    <span>Ends in {auction.endsIn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Recently Ended Auctions</p>
            <p className="mt-2 text-sm text-slate-400">Recently sold items you may want to watch next time.</p>
            <div className="mt-6 space-y-4">
              {recentlyEndedAuctions.map((auction) => (
                <div key={auction.title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{auction.title}</h4>
                      <p className="mt-2 text-sm text-slate-400">Sold for {auction.soldFor}</p>
                    </div>
                    <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-200">SOLD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (flowState.auctionStage === 'FINAL_PAYMENT') {
    return <Navigate to="/customer/payment" replace />;
  }

  if (flowState.auctionStage === 'ORDER_SUCCESS') {
    return <Navigate to="/customer/order-success" replace />;
  }

  if (flowState.auctionStage === 'INVOICE') {
    return <Navigate to="/customer/invoice" replace />;
  }

  if (flowState.auctionStage !== 'WINNER') {
    return <Navigate to="/customer/watch-auction" replace />;
  }

  return (
    <SectionShell title="Auction winner" subtitle="Congratulations — your bid secured the auction item">
      <FlowBreadcrumbs steps={[{ label: 'Live', to: '/customer/auction-live' }, { label: 'Winner', to: '/customer/winner' }, { label: 'Checkout', to: '/customer/checkout' }]} />
      <AuctionFlowProgress currentStep="result" statusMessage="Step 5 of 6 – You Won" />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Winning status</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">You won {flowState.auctionTitle}</h3>
          <p className="mt-3 text-sm text-slate-300">Winner name: {flowState.winnerName || 'You'}</p>
          <p className="mt-2 text-sm text-slate-300">Winning bid: ₹{flowState.winningAmount.toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-300">Total participants: {flowState.participants}</p>
          <p className="mt-2 text-sm text-slate-300">Auction end time: {flowState.auctionEndTime}</p>
          <p className="mt-2 text-sm text-slate-300">Remaining payment amount: ₹{(flowState.winningAmount + 20 - flowState.highestBid).toLocaleString()}</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Moving you to final payment automatically.
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Payment reminder</p>
          <p className="mt-3 text-sm text-slate-300">Complete the remaining payment and delivery confirmation before the item ships.</p>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerCheckoutPage() {
  const [flowState] = useState<AuctionFlowState>(() => readAuctionFlowState());

  useAuctionFlowBackGuard(true);

  if (flowState.auctionStage === 'WINNER' || flowState.auctionStage === 'FINAL_PAYMENT') {
    return <Navigate to="/customer/payment" replace />;
  }

  if (flowState.auctionStage === 'ORDER_SUCCESS') {
    return <Navigate to="/customer/order-success" replace />;
  }

  if (flowState.auctionStage === 'INVOICE') {
    return <Navigate to="/customer/invoice" replace />;
  }

  return (
    <SectionShell title="Checkout" subtitle="Complete your purchase with address, shipping and payment steps">
      <FlowBreadcrumbs steps={[{ label: 'Winner', to: '/customer/winner' }, { label: 'Checkout', to: '/customer/checkout' }, { label: 'Address', to: '/customer/address' }]} />
      <AuctionFlowProgress currentStep="payment" statusMessage="Step 6 of 6 – Payment Required" />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <div>
            <p className="font-semibold text-white">Rare Collectible Watch</p>
            <p>Winning bid ₹2,50,000</p>
          </div>
          <span className="text-white">₹2,50,000</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/customer/address" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue</Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerAddressPage() {
  const [flowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(() => {
    const saved = readAuctionFlowState();
    return saved.addressId ? ({ id: saved.addressId } as AddressResponse) : null;
  });
  const navigate = useNavigate();

  useAuctionFlowBackGuard(true);

  if (flowState.auctionStage === 'WINNER' || flowState.auctionStage === 'FINAL_PAYMENT') {
    return <Navigate to="/customer/payment" replace />;
  }

  if (flowState.auctionStage === 'ORDER_SUCCESS') {
    return <Navigate to="/customer/order-success" replace />;
  }

  if (flowState.auctionStage === 'INVOICE') {
    return <Navigate to="/customer/invoice" replace />;
  }

  return (
    <SectionShell title="Address" subtitle="Choose where your order should be delivered">
      <FlowBreadcrumbs steps={[{ label: 'Checkout', to: '/customer/checkout' }, { label: 'Address', to: '/customer/address' }, { label: 'Shipping', to: '/customer/shipping' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6"><DeliveryAddressSelector selectedAddressId={selectedAddress?.id ?? flowState.addressId} onSelect={setSelectedAddress} /></div>
      {!selectedAddress ? <p className="mt-4 text-sm text-amber-300">Please select a delivery address before continuing to payment.</p> : null}
      <button type="button" disabled={!selectedAddress} onClick={() => { const next = writeAuctionFlowState({ ...readAuctionFlowState(), addressId: selectedAddress!.id }); navigate('/customer/shipping'); }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">Continue to shipping <ArrowRight className="h-4 w-4" /></button>
    </SectionShell>
  );
}

export function CustomerShippingPage() {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => readAuctionFlowState());

  useAuctionFlowBackGuard(true);

  if (flowState.auctionStage !== 'WINNER' && flowState.auctionStage !== 'FINAL_PAYMENT') {
    return <Navigate to="/customer/watch-auction" replace />;
  }

  const continueToPayment = () => {
    const nextState = beginFinalPayment();
    setFlowState(nextState);
    navigate('/customer/payment', { replace: true });
  };

  return (
    <SectionShell title="Shipping method" subtitle="Choose an express or standard delivery mode">
      <FlowBreadcrumbs steps={[{ label: 'Address', to: '/customer/address' }, { label: 'Shipping', to: '/customer/shipping' }, { label: 'Payment', to: '/customer/payment' }]} />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Express', detail: '1-2 business days', price: '₹1,200' },
          { label: 'Standard', detail: '3-5 business days', price: '₹450' },
          { label: 'Pickup', detail: 'Same-day pickup', price: 'Free' },
        ].map((option) => (
          <div key={option.label} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">{option.label}</p>
            <p className="mt-2">{option.detail}</p>
            <p className="mt-4 text-white">{option.price}</p>
          </div>
        ))}
      </div>
      <button type="button" onClick={continueToPayment} className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to payment <ArrowRight className="h-4 w-4" /></button>
    </SectionShell>
  );
}

const AUCTION_ORDER_ID_STORAGE_PREFIX = 'bidzo_auction_order_id_';

function readStoredAuctionOrderId(auctionId: number): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(`${AUCTION_ORDER_ID_STORAGE_PREFIX}${auctionId}`);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function saveStoredAuctionOrderId(auctionId: number, orderId: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${AUCTION_ORDER_ID_STORAGE_PREFIX}${auctionId}`, String(orderId));
}

export function CustomerPaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [paymentData, setPaymentData] = useState<RazorpayOrderResponse | null>(null);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useAuctionFlowBackGuard(true);

  useEffect(() => {
    if (flowState.auctionStage !== 'FINAL_PAYMENT') return undefined;

    let cancelled = false;

    const preparePayment = async () => {
      setLoading(true);
      setError(null);
      try {
        let currentOrder: OrderResponseDto | null = null;
        const storedOrderId = readStoredAuctionOrderId(flowState.auctionId);

        if (storedOrderId) {
          try {
            currentOrder = await getOrderById(storedOrderId);
          } catch {
            currentOrder = null;
          }
        }

        if (!currentOrder) {
          try {
            if (!flowState.addressId) throw new Error('Please select a delivery address before continuing to payment.');
            currentOrder = await createAuctionOrder(flowState.auctionId, flowState.addressId);
            saveStoredAuctionOrderId(flowState.auctionId, currentOrder.id);
          } catch (createError: any) {
            const message = String(createError?.message || 'Unable to create auction order');
            if (/already exists/i.test(message) && storedOrderId) {
              currentOrder = await getOrderById(storedOrderId);
            } else {
              throw createError;
            }
          }
        }

        if (!currentOrder) {
          throw new Error('Unable to prepare your order');
        }

        if (!cancelled) {
          setOrder(currentOrder);
        }

        const paymentOrder = await createRazorpayPayment(currentOrder.id);
        if (!cancelled) {
          setPaymentData(paymentOrder);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Unable to prepare payment');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    preparePayment();

    return () => {
      cancelled = true;
    };
  }, [flowState.auctionStage, flowState.auctionId]);

  const handlePaymentVerification = async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
    if (!order) {
      setError('Missing order information.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const verifiedPayment = await verifyRazorpayPayment(order.id, {
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      });

      const [confirmedOrder, payments] = await Promise.all([
        getOrderById(order.id),
        getPaymentsForOrder(order.id),
      ]);

      if (verifiedPayment?.status === 'SUCCESS' || payments.some((payment) => String(payment.status).toUpperCase() === 'SUCCESS')) {
        const nextState = markOrderConfirmed();
        setFlowState(nextState);
        setIsPaymentSuccessful(true);
        navigate('/customer/order-success', { replace: true });
        return;
      }

      const nextState = markOrderConfirmed();
      setFlowState(nextState);
      setOrder(confirmedOrder);
      navigate('/customer/order-success', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Unable to verify payment.');
    } finally {
      setProcessing(false);
    }
  };

  const openRazorpayCheckout = () => {
    if (!paymentData || !order) {
      setError('Payment session is not ready yet.');
      return;
    }

    const Razorpay = (window as any).Razorpay;
    if (typeof Razorpay !== 'function') {
      setError('Razorpay checkout is unavailable. Please refresh and try again.');
      return;
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
        contact: undefined,
      },
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        handlePaymentVerification(response);
      },
      modal: {
        ondismiss: () => {
          setError('Payment was cancelled.');
        },
      },
      theme: {
        color: '#2563eb',
      },
    };

    const checkout = new Razorpay(options);
    checkout.open();
  };

  if (loading) {
    return (
      <FlowTransitionScreen
        heading="Preparing payment"
        message="Creating your order and payment session"
        detail="Please wait while we connect to Razorpay."
      />
    );
  }

  if (isPaymentSuccessful) {
    return (
      <FlowTransitionScreen
        heading="Payment Successful"
        message="Your order is confirmed"
        detail="Preparing your success receipt..."
      />
    );
  }

  if (flowState.auctionStage === 'WINNER') {
    return <Navigate to="/customer/winner" replace />;
  }

  if (flowState.auctionStage === 'ORDER_SUCCESS') {
    return <Navigate to="/customer/order-success" replace />;
  }

  if (flowState.auctionStage === 'INVOICE') {
    return <Navigate to="/customer/invoice" replace />;
  }

  if (flowState.auctionStage !== 'FINAL_PAYMENT') {
    return <Navigate to="/customer/watch-auction" replace />;
  }

  return (
    <SectionShell title="Payment" subtitle="Choose a secure payment method for your order">
      <FlowBreadcrumbs steps={[{ label: 'Shipping', to: '/customer/shipping' }, { label: 'Payment', to: '/customer/payment' }, { label: 'Success', to: '/customer/order-success' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4">
          <div>
            <p className="text-sm text-slate-400">Order</p>
            <p className="mt-1 text-lg font-semibold text-white">{order?.orderNumber || `#${order?.id}`}</p>
            <p className="mt-1 text-sm text-slate-400">Status: {order?.orderStatus || 'Pending'}</p>
            <p className="mt-1 text-sm text-slate-400">Delivery: {typeof order?.deliveryAddress === 'string' ? order.deliveryAddress : order?.deliveryAddress ? JSON.stringify(order.deliveryAddress) : 'Selected delivery address'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total amount</p>
            <p className="mt-1 text-2xl font-semibold text-white">₹{Number(order?.totalAmount ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">UPI • Razorpay</p>
          <p className="mt-3 text-slate-400">Pay securely through Razorpay with your preferred UPI app.</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Order ID</p>
          <p className="mt-3 text-slate-400">{paymentData?.razorpayOrderId || 'Preparing...'}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">
          <p className="font-semibold text-white">Payment processor</p>
          <p className="mt-3 text-slate-400">Razorpay Checkout</p>
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
            <p className="font-semibold">Payment error</p>
            <p className="mt-1 text-red-300">{error}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={openRazorpayCheckout}
        disabled={!paymentData || processing}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-600"
      >
        {processing ? 'Processing payment...' : 'Pay with Razorpay'}
        <ArrowRight className="h-4 w-4" />
      </button>
    </SectionShell>
  );
}

export function CustomerOrderSuccessPage() {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [payment, setPayment] = useState<PaymentResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAuctionFlowBackGuard(true);

  useEffect(() => {
    if (flowState.auctionStage !== 'ORDER_SUCCESS') {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const restore = async () => {
      try {
        const storedOrderId = readStoredAuctionOrderId(flowState.auctionId);
        if (!storedOrderId) {
          if (active) setError('Order not found.');
          return;
        }

        const [orderData, payments] = await Promise.all([
          getOrderById(storedOrderId),
          getPaymentsForOrder(storedOrderId),
        ]);

        const successfulPayment = payments.find((item: PaymentResponseDto) => String(item.status).toUpperCase() === 'SUCCESS') ?? null;
        if (!active) return;
        setOrder(orderData);
        setPayment(successfulPayment);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load order details.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, [flowState.auctionId, flowState.auctionStage]);

  if (flowState.auctionStage === 'WINNER' || flowState.auctionStage === 'FINAL_PAYMENT') {
    return <Navigate to="/customer/payment" replace />;
  }

  if (flowState.auctionStage === 'INVOICE') {
    return <Navigate to="/customer/invoice" replace />;
  }

  if (flowState.auctionStage !== 'ORDER_SUCCESS') {
    return <Navigate to="/customer/watch-auction" replace />;
  }

  const handleViewInvoice = () => {
    const nextState = markInvoiceReady();
    setFlowState(nextState);
    navigate('/customer/invoice', { replace: true });
  };

  const orderNumber = order?.orderNumber || (order ? `#${order.id}` : '—');
  const itemName = order?.items?.[0]?.productName || order?.items?.[0]?.name || flowState.auctionTitle || 'Auction item';
  const amountPaid = payment?.amount ?? order?.totalAmount ?? flowState.winningAmount ?? 0;

  return (
    <SectionShell title="Order success" subtitle="Your order is confirmed and ready for the next milestone">
      <FlowBreadcrumbs steps={[{ label: 'Payment', to: '/customer/payment' }, { label: 'Success', to: '/customer/order-success' }, { label: 'Invoice', to: '/customer/invoice' }]} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
        {loading ? (
          <FlowTransitionScreen heading="Loading order" message="Confirming your payment and order details" detail="Please wait a moment." />
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
            <p className="font-semibold">Order not available</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{orderNumber} confirmed</p>
                <p className="mt-1">Payment successful. You can review the invoice or track the order.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Order summary</p>
              <p className="mt-2">{itemName} • ₹{Number(amountPaid).toLocaleString()} • Payment status: {String(payment?.status ?? 'SUCCESS').toUpperCase() === 'SUCCESS' ? 'Paid' : payment?.status || 'Paid'}</p>
              {payment?.paymentRef ? <p className="mt-2">Payment reference: {payment.paymentRef}</p> : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={handleViewInvoice} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">View invoice</button>
              {order ? <Link to="/customer/track-order" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200">Track Order</Link> : null}
            </div>
          </>
        )}
      </motion.div>
    </SectionShell>
  );
}

export function CustomerInvoicePage() {
  const [flowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [payment, setPayment] = useState<PaymentResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAuctionFlowBackGuard(true);

  useEffect(() => {
    let active = true;
    const loadInvoice = async () => {
      try {
        const auctionId = getSelectedAuctionId() ?? flowState.auctionId;
        const storedOrderId = readStoredAuctionOrderId(auctionId);
        if (!storedOrderId) {
          if (active) setError('Order not found.');
          return;
        }

        const [orderData, payments] = await Promise.all([
          getOrderById(storedOrderId),
          getPaymentsForOrder(storedOrderId),
        ]);

        const successfulPayment = payments.find((item: PaymentResponseDto) => String(item.status).toUpperCase() === 'SUCCESS') ?? null;
        if (!active) return;
        setOrder(orderData);
        setPayment(successfulPayment);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load invoice data.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadInvoice();
    return () => {
      active = false;
    };
  }, [flowState.auctionId]);

  const orderNumber = order?.orderNumber || (order ? `#${order.id}` : '—');
  const itemName = order?.items?.[0]?.productName || order?.items?.[0]?.name || flowState.auctionTitle || 'Auction item';
  const paymentId = payment?.paymentRef || payment?.paymentId || payment?.razorpayPaymentId || payment?.id || '—';
  const paymentStatus = String(payment?.status ?? 'PENDING').toUpperCase() === 'SUCCESS' ? 'Paid' : String(payment?.status ?? 'Pending');
  const amountPaid = Number(payment?.amount ?? order?.totalAmount ?? flowState.winningAmount ?? 0);
  const paymentMethod = payment?.paymentMethod || payment?.paymentMethodName || payment?.method || 'Razorpay';
  const paymentDate = payment?.paidAt || payment?.createdAt || order?.createdAt || new Date().toISOString();
  const formattedDate = paymentDate ? new Date(paymentDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const receiptUrl = payment?.receiptUrl || payment?.qrCodeUrl || '';
  const qrUrl = receiptUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(receiptUrl)}` : '';

  const handlePrintSavePdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <FlowTransitionScreen
        heading="Loading invoice"
        message="Preparing your payment receipt"
        detail="Fetching your real order and payment history."
      />
    );
  }

  if (error || !order) {
    return (
      <SectionShell title="Invoice" subtitle="Official payment and order receipt">
        <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
          <p className="font-semibold">Invoice unavailable</p>
          <p className="mt-1">{error || 'The order could not be found.'}</p>
          <Link to="/customer/order-success" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Back to order</Link>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Invoice" subtitle="Official payment and order receipt">
      <FlowBreadcrumbs steps={[{ label: 'Success', to: '/customer/order-success' }, { label: 'Invoice', to: '/customer/invoice' }, { label: 'Track', to: '/customer/track-order' }]} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-white">Invoice {orderNumber}</p>
            <p className="mt-2">Item: {itemName}</p>
            <p className="mt-2">Amount paid: ₹{amountPaid.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-200">Payment status: {paymentStatus}</div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-slate-400">Payment ID</p>
            <p className="mt-1 font-semibold text-white">{paymentId}</p>
            <p className="mt-3 text-slate-400">Razorpay Order ID</p>
            <p className="mt-1 font-semibold text-white">{payment?.razorpayOrderId || 'Not available'}</p>
            <p className="mt-3 text-slate-400">Payment method</p>
            <p className="mt-1 font-semibold text-white">{paymentMethod}</p>
            <p className="mt-3 text-slate-400">Paid on</p>
            <p className="mt-1 font-semibold text-white">{formattedDate}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-white"><QrCode className="h-4 w-4 text-blue-300" /> Payment reference</div>
            {qrUrl ? (
              <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-3">
                <img src={qrUrl} alt="Payment receipt QR code" className="mx-auto h-32 w-32 rounded-xl bg-white p-2" />
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-slate-300">
                <p className="font-medium text-white">Payment reference</p>
                <p className="mt-2 break-all">{paymentId}</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handlePrintSavePdf} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"><Download className="h-4 w-4" /> Print / Save as PDF</button>
          <Link to="/customer/track-order" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200">Track order</Link>
        </div>
      </motion.div>
    </SectionShell>
  );
}

export function CustomerTrackOrderPage() {
  return (
    <SectionShell title="Track order" subtitle="Monitor progress from dispatch to delivery">
      <FlowBreadcrumbs steps={[{ label: 'Invoice', to: '/customer/invoice' }, { label: 'Track', to: '/customer/track-order' }, { label: 'Delivered', to: '/customer/delivered' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p className="font-semibold text-white">Shipment status: In transit</p>
        <p className="mt-2">Estimated delivery: 18 Aug 2026</p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p>Dispatch confirmed • Packaging complete • Courier assigned</p>
        </div>
        <Link to="/customer/delivered" className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Mark delivered <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </SectionShell>
  );
}

export function CustomerDeliveredPage() {
  return (
    <SectionShell title="Delivered" subtitle="Your purchase was delivered successfully">
      <FlowBreadcrumbs steps={[{ label: 'Track', to: '/customer/track-order' }, { label: 'Delivered', to: '/customer/delivered' }, { label: 'Review', to: '/customer/review' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
        <p className="text-lg font-semibold text-white">Delivered to your preferred address</p>
        <p className="mt-3">The item arrived safely and is ready for your rating and review.</p>
        <Link to="/customer/review" className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Write a review <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </SectionShell>
  );
}

export function CustomerReviewPage() {
  return (
    <SectionShell title="Review product" subtitle="Share your purchase experience and return to the dashboard">
      <FlowBreadcrumbs steps={[{ label: 'Delivered', to: '/customer/delivered' }, { label: 'Review', to: '/customer/review' }, { label: 'Dashboard', to: '/dashboards/customer' }]} />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">How would you rate the experience?</p>
          <p className="mt-2">5/5 • Delivery, quality and seller communication were excellent.</p>
        </div>
        <textarea className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" defaultValue="The item arrived in perfect condition and the support team was responsive." />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/dashboards/customer" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Submit review</Link>
          <Link to="/customer/dashboard" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Skip for now</Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function VendorCreateProductWizardPage() {
  const navigate = useNavigate();
  const categoryFields: Record<string, string[]> = {
    Electronics: ['Brand', 'Model', 'RAM', 'Storage', 'Warranty'],
    Vehicles: ['Brand', 'Fuel', 'Mileage', 'Transmission', 'RC'],
    Pets: ['Breed', 'Age', 'Gender', 'Vaccination', 'Health'],
    Fish: ['Species', 'Size', 'Quantity', 'Water Type'],
    Agriculture: ['Crop', 'Harvest Date', 'Quantity', 'Organic'],
    Furniture: ['Material', 'Dimensions', 'Weight'],
    Fashion: ['Brand', 'Size', 'Color'],
    RealEstate: ['Property Type', 'Area', 'Bedrooms', 'Bathrooms'],
    Services: ['Experience', 'Availability', 'Location'],
  };

  const requiredFields: Record<string, string[]> = {
    Electronics: ['Brand', 'Model'],
    Vehicles: ['Brand', 'Fuel'],
    Pets: ['Breed', 'Age', 'Vaccination'],
    Agriculture: ['Crop', 'Quantity'],
    Furniture: ['Material'],
    RealEstate: ['Property Type', 'Area'],
    Services: ['Experience'],
  };

  const steps = ['Category', 'Basic info', 'Category fields', 'Images', 'Pricing', 'Shipping', 'Auction', 'Preview', 'Publish'];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({ title: '', category: 'Electronics', price: '', quantity: '', fields: {}, description: '', sellingType: 'DIRECT_BUY', categoryId: 2, status: 'PUBLISHED' });
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');
  const [productFormValid, setProductFormValid] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[] | undefined>(undefined);
  const [productImageUrl, setProductImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const buildProductPayload = (draft: any) => {
    const safeName = String(draft.title || '').trim();
    const safeDescription = String(draft.description || '').trim();
    const parsedPrice = Number(String(draft.price || '').replace(/[^\d.]/g, ''));
    const parsedQuantity = Number(String(draft.quantity ?? '').trim());
    const normalizedQuantity = Number.isFinite(parsedQuantity) && parsedQuantity >= 0 ? Math.trunc(parsedQuantity) : 0;
    const normalizedSellingType = String(draft.sellingType || 'DIRECT_BUY').trim().toUpperCase();
    const sku = String(draft.sku || '').trim() || `${safeName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase() || 'PRODUCT'}-${Date.now()}`;
    const rawFields = draft.fields && typeof draft.fields === 'object' ? draft.fields : {};
    const normalizedFields: Record<string, string> = Object.fromEntries(
      Object.entries(rawFields)
        .filter(([key, value]) => typeof key === 'string' && key.trim() !== '' && typeof value === 'string' && value.trim() !== '')
        .map(([key, value]) => [key.trim(), String(value).trim()])
    );

    return {
      name: safeName,
      description: safeDescription,
      price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      quantity: normalizedQuantity,
      sku,
      status: String(draft.status || 'PUBLISHED').toUpperCase(),
      categoryId: Number(draft.categoryId ?? 2),
      sellingType: (normalizedSellingType === 'AUCTION' || normalizedSellingType === 'DIRECT_BUY' ? normalizedSellingType : 'DIRECT_BUY') as SellingType,
      fields: normalizedFields,
    };
  };

  const handleNext = async () => {
    if (step === 8) {
      try {
        setSubmitting(true);
        setSubmitError(null);

        const selectedFile = uploadedImages?.[0];
        let resolvedPublicImageUrl = String(productImageUrl || '').trim();

        if (selectedFile) {
          setUploadingImage(true);
          try {
            resolvedPublicImageUrl = await uploadToCloudinary(selectedFile);
            setProductImageUrl(resolvedPublicImageUrl);
          } finally {
            setUploadingImage(false);
          }
        }

        if (!resolvedPublicImageUrl || !(resolvedPublicImageUrl.startsWith('http://') || resolvedPublicImageUrl.startsWith('https://'))) {
          setSubmitError('A valid public image URL is required before the product can be published.');
          return;
        }

        const productPayload = buildProductPayload(formData);
        console.log('PRODUCT PAYLOAD BEFORE API:', productPayload);
        console.log('PRODUCT FIELDS BEFORE API:', productPayload.fields);
        const createdProduct = await createVendorProduct(productPayload);
        const productId = Number(createdProduct?.id ?? 0);

        if (!productId) {
          throw new Error('Product creation did not return a valid product ID.');
        }

        await createProductImage(productId, {
          url: resolvedPublicImageUrl,
          altText: `${String(formData.title || 'Product').trim() || 'Product'} Main Image`,
        });

        if (productPayload.sellingType === 'AUCTION') {
          navigate(`/vendor/create-auction-wizard?productId=${productId}`);
          return;
        }

        setStep(9);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Unable to create product');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep(Math.min(steps.length, step + 1));
  };

  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 700);
    return () => clearTimeout(t);
  }, [formData]);

  // compute whether the current step can continue
  let canContinue = true;
  if (step === 1) {
    canContinue = !!formData.category;
  } else if (step === 2) {
    canContinue = !!(formData.title && formData.title.toString().trim().length > 0 && formData.description && formData.description.toString().trim().length > 0);
  } else if (step === 3) {
    canContinue = productFormValid;
  } else if (step === 4) {
    const imgs = uploadedImages || formData.images || [];
    canContinue = imgs.length > 0;
  } else if (step === 5) {
    const quantityValue = Number(formData.quantity);
    canContinue = !!(formData.price && formData.price.toString().trim().length > 0 && formData.quantity !== undefined && formData.quantity !== null && formData.quantity !== '' && Number.isFinite(quantityValue) && quantityValue >= 0 && Number.isInteger(quantityValue));
  } else if (step === 8) {
    const quantityValue = Number(formData.quantity);
    canContinue = !!(formData.title && formData.title.toString().trim().length > 0 && formData.price && formData.price.toString().trim().length > 0 && formData.quantity !== undefined && formData.quantity !== null && formData.quantity !== '' && Number.isFinite(quantityValue) && quantityValue >= 0 && Number.isInteger(quantityValue));
  }

  return (
    <SectionShell title="Create product" subtitle="Multi-step product wizard for a complete selling experience">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <Wizard
          steps={steps}
          step={step}
          canContinue={canContinue && !submitting}
          onPrev={() => setStep(Math.max(1, step - 1))}
          onNext={handleNext}
          onSaveDraft={() => alert('Draft saved (UI only)')}
          onPreview={() => alert('Preview (UI only)')}
          autosaveStatus={submitting ? 'Submitting...' : autosaveStatus}
        >
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Choose the category for the product.</p>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.keys(categoryFields).map((c) => (
                  <button key={c} onClick={() => setFormData((prev: any) => ({ ...prev, category: c }))} className={`rounded-2xl border px-4 py-3 text-left text-sm ${formData.category === c ? 'border-blue-500/40 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.title} onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))} placeholder="Listing title" />
              <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.description} onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} placeholder="Short description" />
            </div>
          )}

          {step === 3 && (
            <div>
              <ProductForm initial={formData} categoryFields={categoryFields} requiredFields={requiredFields} onValidate={(v) => setProductFormValid(v)} onChange={(data) => setFormData((prev: any) => ({ ...prev, ...data }))} />
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-sm text-slate-400">Select an image and upload it to the configured Cloudinary unsigned preset. The backend image API requires a permanent public URL, not a browser blob URL.</p>
              <div className="mt-3">
                <UploadField onChange={(files) => { setUploadedImages(files); setFormData((prev: any) => ({ ...prev, images: files })); }} />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-200">Cloudinary public URL</label>
                <input
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white"
                  placeholder="https://res.cloudinary.com/.../image/upload/...jpg"
                />
                {uploadingImage && (
                  <p className="mt-3 text-sm text-blue-200">Uploading selected image to Cloudinary...</p>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_0.8fr]">
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.price} onChange={(e) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))} placeholder="Price" />
                <input type="number" min="0" step="1" className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.quantity ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, quantity: e.target.value }))} placeholder="Quantity" />
                <select className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.sellingType || 'DIRECT_BUY'} onChange={(e) => setFormData((prev: any) => ({ ...prev, sellingType: e.target.value }))}>
                  <option value="DIRECT_BUY">Direct Buy</option>
                  <option value="AUCTION">Auction</option>
                </select>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Set price, stock quantity, promotions, and installment options (UI only).</div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <select className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.shipping || 'Express'} onChange={(e) => setFormData((prev: any) => ({ ...prev, shipping: e.target.value }))}>
                <option>Express</option>
                <option>Standard</option>
                <option>Pickup</option>
              </select>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Choose dispatch times, packaging and returns policy.</div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Auction settings: reserve price, duration and auto-bid rules.</div>
            </div>
          )}

          {step === 8 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Preview</p>
              <p className="mt-2">{formData.title}</p>
              <p className="mt-2">Category: {formData.category}</p>
              <p className="mt-2">Selling type: {formData.sellingType === 'AUCTION' ? 'Auction' : 'Direct Buy'}</p>
              <p className="mt-2">Price: {formData.price}</p>
              <p className="mt-2">Quantity: {formData.quantity}</p>
              {submitError && <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{submitError}</p>}
            </div>
          )}

          {step === 9 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-slate-300">
              <p className="text-lg font-semibold text-white">Product published</p>
              <p className="mt-2">Your listing is visible to buyers and is now ready for auction or direct purchase.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/vendor/products" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Manage products</Link>
                <Link to="/vendor/create-auction-wizard" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Create auction</Link>
              </div>
            </div>
          )}
        </Wizard>
      </div>
    </SectionShell>
  );
}

export function VendorEditProductWizardPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id)) || products[0];

  const categoryFields: Record<string, string[]> = {
    Electronics: ['Brand', 'Model', 'RAM', 'Storage', 'Warranty'],
    Vehicles: ['Brand', 'Fuel', 'Mileage', 'Transmission', 'RC'],
    Pets: ['Breed', 'Age', 'Gender', 'Vaccination', 'Health'],
    Fish: ['Species', 'Size', 'Quantity', 'Water Type'],
    Agriculture: ['Crop', 'Harvest Date', 'Quantity', 'Organic'],
    Furniture: ['Material', 'Dimensions', 'Weight'],
    Fashion: ['Brand', 'Size', 'Color'],
    RealEstate: ['Property Type', 'Area', 'Bedrooms', 'Bathrooms'],
    Services: ['Experience', 'Availability', 'Location'],
  };

  const requiredFieldsEdit: Record<string, string[]> = {
    Electronics: ['Brand', 'Model'],
    Vehicles: ['Brand', 'Fuel'],
    Pets: ['Breed', 'Age', 'Vaccination'],
    Agriculture: ['Crop', 'Quantity'],
    Furniture: ['Material'],
    RealEstate: ['Property Type', 'Area'],
    Services: ['Experience'],
  };

  const [productFormValidEdit, setProductFormValidEdit] = useState(false);

  const steps = ['Edit Info', 'Category fields', 'Images', 'Pricing', 'Shipping', 'Preview', 'Publish'];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({ title: product.title, category: product.category || 'Electronics', price: product.price, fields: {}, description: product.description });
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');

  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 700);
    return () => clearTimeout(t);
  }, [formData]);

  // compute canContinue for edit wizard
  let canContinueEdit = true;
  if (step === 1) {
    canContinueEdit = !!(formData.title && formData.title.toString().trim().length > 0);
  } else if (step === 2) {
    canContinueEdit = productFormValidEdit;
  } else if (step === 3) {
    canContinueEdit = !!(formData.images && formData.images.length > 0);
  } else if (step === 4) {
    canContinueEdit = !!(formData.price && formData.price.toString().trim().length > 0);
  }

  return (
    <SectionShell title="Edit product" subtitle={`Edit: ${product.title}`}>
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <Wizard
          steps={steps}
          step={step}
          canContinue={canContinueEdit}
          onPrev={() => setStep(Math.max(1, step - 1))}
          onNext={() => setStep(Math.min(steps.length, step + 1))}
          onSaveDraft={() => alert('Draft saved (UI only)')}
          onPreview={() => alert('Preview (UI only)')}
          autosaveStatus={autosaveStatus}
        >
          {step === 1 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.title} onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))} />
              <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.description} onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} />
            </div>
          )}

          {step === 2 && (
            <ProductForm initial={formData} categoryFields={categoryFields} requiredFields={requiredFieldsEdit} onValidate={(v) => setProductFormValidEdit(v)} onChange={(data) => setFormData((prev: any) => ({ ...prev, ...data }))} />
          )}

          {step === 3 && (
            <div>
              <p className="text-sm text-slate-400">Manage product images and media.</p>
              <div className="mt-3">
                <UploadField onChange={(files) => setFormData((prev: any) => ({ ...prev, images: files }))} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.price} onChange={(e) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))} />
            </div>
          )}

          {step === 5 && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Shipping and returns configuration (UI only)</div>}

          {step === 6 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Preview</p>
              <p className="mt-2">{formData.title}</p>
              <p className="mt-2">Category: {formData.category}</p>
              <p className="mt-2">Price: {formData.price}</p>
            </div>
          )}

          {step === 7 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-slate-300">
              <p className="text-lg font-semibold text-white">Product updated</p>
              <p className="mt-2">Your changes are saved locally (UI only).</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/vendor/products" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Manage products</Link>
              </div>
            </div>
          )}
        </Wizard>
      </div>
    </SectionShell>
  );
}

export function VendorCreateAuctionWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const requestedProductId = Number(searchParams.get('productId') || 0);
  const isBikeAuction = typeParam === 'bike';

  const steps = ['Settings', 'Details', 'Preview', 'Publish'];
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({
    title: '',
    description: '',
    reserve: '',
    productPrice: '',
    categoryId: null,
    durationDays: isBikeAuction ? 5 : 3,
    bidIncrement: '',
    startAt: '',
    endAt: '',
    productId: null as number | null,
    vendorId: null as number | null,
  });
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');
  const [auctionFormValid, setAuctionFormValid] = useState(false);
  const [products, setProducts] = useState<Array<{ id: number; name: string; price: number | string; sellingType?: string | null }>>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const applyProductToAuction = (product: { id: number; name: string; description?: string | null; price: number | string; categoryId?: number | null }) => {
    const productPrice = String(product.price ?? '').trim();
    setSelectedProductId(product.id);
    setData((prev: any) => ({
      ...prev,
      productId: product.id,
      title: product.name,
      description: product.description || prev.description || '',
      reserve: productPrice,
      productPrice,
      categoryId: product.categoryId ?? null,
    }));
  };

  useEffect(() => {
    let active = true;

    const loadVendorAuctionOptions = async () => {
      try {
        const [vendorProducts, vendorProfile] = await Promise.all([
          getVendorProducts(),
          getVendorProfile(),
        ]);

        if (!active) return;

        const auctionProducts = vendorProducts.filter((product: { sellingType?: string | null }) => String(product.sellingType || '').toUpperCase() === 'AUCTION');
        const availableProducts = auctionProducts.length > 0 ? auctionProducts : vendorProducts;

        setProducts(availableProducts);

        const requestedProduct = availableProducts.find((product) => product.id === requestedProductId);
        const firstProductId = requestedProduct?.id ?? availableProducts[0]?.id ?? null;
        const selectedProduct = availableProducts.find((product) => product.id === firstProductId);
        setData((prev: any) => ({ ...prev, vendorId: vendorProfile?.id ?? prev.vendorId }));
        if (selectedProduct) {
          applyProductToAuction(selectedProduct);
        } else {
          setSelectedProductId(null);
        }
      } catch {
        if (active) {
          setProducts([]);
          setSelectedProductId(null);
        }
      }
    };

    loadVendorAuctionOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 700);
    return () => clearTimeout(t);
  }, [data]);

  const formatLocalDateTime = (value: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
  };

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const productId = Number(selectedProductId ?? data.productId ?? 0);
      const vendorId = Number(data.vendorId ?? 0);
      const parsedPrice = Number(String(data.reserve || '').replace(/[^\d.]/g, ''));
      const startAt = formatLocalDateTime(data.startAt || new Date().toISOString());
      const endAt = formatLocalDateTime(data.endAt || new Date(Date.now() + 10 * 60 * 1000).toISOString());

      if (!productId) {
        throw new Error('Please select a vendor product for this auction.');
      }
      if (!vendorId) {
        throw new Error('Unable to resolve the authenticated vendor profile.');
      }
      if (!startAt || !endAt) {
        throw new Error('Both start and end times are required.');
      }

      const existingAuctions = await getVendorAuctions();
      if (existingAuctions.some((auction) => Number(auction.productId) === productId)) {
        throw new Error('This product already has an auction.');
      }

      const payload = {
        title: String(data.title || '').trim(),
        description: String(data.description || '').trim(),
        startAt,
        endAt,
        startingPrice: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        productId,
        vendorId,
      };

      const createdAuction = await createAuction(payload);
      setSubmitSuccess(`Auction created successfully: ${createdAuction.title} (${createdAuction.status || 'LIVE'})`);
      navigate(`/auctions/${createdAuction.id}`, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  let canContinueAuction = true;
  if (step === 1) {
    canContinueAuction = !!(selectedProductId || data.productId);
  } else if (step === 2) {
    canContinueAuction = auctionFormValid;
  } else if (step === 3) {
    canContinueAuction = !!(selectedProductId || data.productId);
  }

  return (
    <SectionShell title="Create auction" subtitle="Guide your auction from setup to launch">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <Wizard
          steps={steps}
          step={step}
          canContinue={canContinueAuction && !isSubmitting}
          onPrev={() => setStep(Math.max(1, step - 1))}
          onNext={() => {
            if (step === steps.length) {
              void handlePublish();
              return;
            }
            setStep(Math.min(steps.length, step + 1));
          }}
          onSaveDraft={() => alert('Auction draft saved (UI only)')}
          onPreview={() => alert('Auction preview (UI only)')}
          autosaveStatus={isSubmitting ? 'Submitting...' : autosaveStatus}
        >
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Choose your product</p>
                <div className="mt-3 space-y-2">
                  {products.length === 0 ? (
                    <p className="text-slate-400">No vendor products were returned by the authenticated vendor profile.</p>
                  ) : (
                    products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          applyProductToAuction(product);
                        }}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${selectedProductId === product.id ? 'border-blue-500/40 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}
                      >
                        {product.name} • ₹{Number(product.price ?? 0).toLocaleString()} • {product.sellingType === 'AUCTION' ? 'Auction' : 'Direct Buy'}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {step === 2 && <AuctionForm initial={data} onValidate={(v) => setAuctionFormValid(v)} onChange={(d) => setData((prev: any) => ({ ...prev, ...d }))} />}
          {step === 3 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="text-lg font-semibold text-white">Preview</p>
              <p className="mt-2">Title: {data.title}</p>
              <p className="mt-2">Product price: ₹{String(data.productPrice || '').replace(/[^\d.]/g, '') || '0'}</p>
              <p className="mt-2">Category ID: {data.categoryId ?? 'Not available'}</p>
              <p className="mt-2">Description: {data.description}</p>
              <p className="mt-2">Start: {data.startAt || 'Not set'}</p>
              <p className="mt-2">End: {data.endAt || 'Not set'}</p>
              <p className="mt-2">Starting price: ₹{String(data.reserve || '').replace(/[^\d.]/g, '') || '0'}</p>
              <p className="mt-2">Product ID: {selectedProductId ?? data.productId ?? 'Not selected'}</p>
              <p className="mt-2">Vendor ID: {data.vendorId ?? 'Not resolved'}</p>
            </div>
          )}
          {step === 4 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-slate-300">
              <p className="text-lg font-semibold text-white">Auction published</p>
              <p className="mt-2">{submitSuccess || `${data.title} is ready to go live.`}</p>
              {submitError && <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{submitError}</p>}
              <Link to="/vendor/auction-analytics" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Manage auctions</Link>
            </div>
          )}
        </Wizard>
      </div>
    </SectionShell>
  );
}
