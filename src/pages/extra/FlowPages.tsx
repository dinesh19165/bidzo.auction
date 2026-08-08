import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, CreditCard, Gavel, Heart, Loader2, MapPin, PackageCheck, Search, Share2, ShieldCheck, ShoppingBag, Sparkles, Truck, Wallet, Zap, CircleDollarSign, QrCode, Printer, Download, BadgeAlert, Radio, ChevronRight } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { products, auctionItems, sellers, wishlistItems, reviews, transactions, categories } from '../../data/mockData';
import ProductForm from '../../components/ProductForm';
import Wizard from '../../components/Wizard';
import AuctionForm from '../../components/AuctionForm';
import UploadField from '../../components/forms/UploadField';
import { useAuth } from '../../context/AuthContext';
import { addMockBid, advanceAuctionClock, beginFinalPayment, enterLiveAuctionRoom, goToMarketplace, initializeAuctionFlowState, initializeAuctionFlowStateForAuction, markInvoiceReady, markOrderConfirmed, placeBid, readAuctionFlowState, resolveAuctionOutcome, startAuctionFlow, type AuctionFlowState, writeAuctionFlowState, setSelectedAuctionId, isAuctionRegistered, markAuctionAsRegistered, getSelectedAuctionId } from '../../utils/auctionFlowState';

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

function getAuctionStatus(auctionId: number) {
  const auction = auctionItems.find((item) => item.id === auctionId);
  return auction?.status ?? 'Live';
}

function getAuctionTitle(auctionId: number) {
  const auction = auctionItems.find((item) => item.id === auctionId);
  return auction?.title ?? 'Auction item';
}

function getAuctionCurrentBid(auctionId: number) {
  const auction = auctionItems.find((item) => item.id === auctionId);
  return auction?.currentBid ?? '₹0';
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
  return (
    <SectionShell title="Wishlist" subtitle="Saved products and auctions you want to follow">
      <FlowBreadcrumbs steps={[{ label: 'Product', to: '/customer/product/1' }, { label: 'Wishlist', to: '/customer/wishlist' }, { label: 'Auction', to: '/customer/watch-auction' }]} />
      <div className="grid gap-4 md:grid-cols-2">
        {wishlistItems.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{item.title}</p>
              <Heart className="h-4 w-4 text-amber-300" />
            </div>
            <p className="mt-2 text-sm text-slate-400">{item.note}</p>
            <p className="mt-4 text-lg font-semibold text-white">{item.price}</p>
            <div className="mt-4 flex gap-3">
              <Link to="/customer/watch-auction" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">Watch</Link>
              <Link to="/customer/place-bid" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Bid</Link>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerWatchAuctionPage() {
  const navigate = useNavigate();
  const selectedAuctionId = getSelectedAuctionId() ?? auctionItems.find((item) => item.status === 'Live')?.id ?? 104;
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => {
    const initialFlowState = readAuctionFlowState();
    if (initialFlowState.auctionId !== selectedAuctionId) {
      return initializeAuctionFlowStateForAuction(selectedAuctionId);
    }

    if (['WINNER', 'OUTBID', 'AUCTION_ENDED', 'FINAL_PAYMENT', 'ORDER_SUCCESS', 'INVOICE'].includes(initialFlowState.auctionStage)) {
      return initializeAuctionFlowStateForAuction(selectedAuctionId);
    }

    return initialFlowState;
  });

  useEffect(() => {
    setSelectedAuctionId(selectedAuctionId);
  }, [selectedAuctionId]);

  useAuctionFlowBackGuard(false);

  const auctionStatus = getAuctionStatus(selectedAuctionId);
  const registered = isAuctionRegistered(selectedAuctionId);

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

  return (
    <SectionShell title="Watch auction" subtitle="Follow live bidding events and be ready to act">
      <FlowBreadcrumbs steps={[{ label: 'Wishlist', to: '/customer/wishlist' }, { label: 'Watch', to: '/customer/watch-auction' }, { label: 'Bid', to: '/customer/place-bid' }]} />
      <AuctionFlowProgress currentStep="details" statusMessage="Step 1 of 6 – Review Details" />
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Live countdown</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{flowState.auctionTitle}</h3>
          </div>
          <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">{auctionStatus}</div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-300" /> Ends in {flowState.secondsLeft}s</p>
            <p className="mt-3">Current highest bid: ₹{flowState.highestBid.toLocaleString()}</p>
            <p className="mt-2">Participants: {flowState.participants}</p>
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
          <p className="mt-3 text-3xl font-semibold text-white">₹82,500</p>
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
  const previousBidsRef = useRef(flowState.bids);

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
      <div className="grid gap-4 lg:grid-cols-2">
        {['Home • 12, 4th Cross, Bengaluru', 'Office • 54, Marine Drive, Mumbai'].map((address) => (
          <div key={address} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">{address}</div>
        ))}
      </div>
      <Link to="/customer/shipping" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to shipping <ArrowRight className="h-4 w-4" /></Link>
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

export function CustomerPaymentPage() {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

  useAuctionFlowBackGuard(true);

  useEffect(() => {
    if (!isPaymentSuccessful) return undefined;
    const timer = window.setTimeout(() => {
      const nextState = markOrderConfirmed();
      setFlowState(nextState);
      navigate('/customer/order-success', { replace: true });
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [isPaymentSuccessful, navigate]);

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

  const handleConfirmOrder = () => {
    setIsPaymentSuccessful(true);
  };

  return (
    <SectionShell title="Payment" subtitle="Choose a secure payment method for your order">
      <FlowBreadcrumbs steps={[{ label: 'Shipping', to: '/customer/shipping' }, { label: 'Payment', to: '/customer/payment' }, { label: 'Success', to: '/customer/order-success' }]} />
      <div className="grid gap-4 md:grid-cols-3">
        {['UPI', 'Credit card', 'Wallet'].map((method) => <div key={method} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">{method}</div>)}
      </div>
      <button type="button" onClick={handleConfirmOrder} className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Confirm order <ArrowRight className="h-4 w-4" /></button>
    </SectionShell>
  );
}

export function CustomerOrderSuccessPage() {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<AuctionFlowState>(() => readAuctionFlowState());
  const [isPreparingInvoice, setIsPreparingInvoice] = useState(false);

  useAuctionFlowBackGuard(true);

  useEffect(() => {
    if (flowState.auctionStage === 'ORDER_SUCCESS') {
      setIsPreparingInvoice(true);
      const timer = window.setTimeout(() => {
        const nextState = markInvoiceReady();
        setFlowState(nextState);
        navigate('/customer/invoice', { replace: true });
      }, 2400);
      return () => {
        window.clearTimeout(timer);
        setIsPreparingInvoice(false);
      };
    }
    return undefined;
  }, [flowState.auctionStage, navigate, setFlowState]);

  if (flowState.auctionStage === 'ORDER_SUCCESS' && isPreparingInvoice) {
    return (
      <FlowTransitionScreen
        heading="Preparing Invoice..."
        message="Finalizing your order receipt"
        detail="Redirecting to invoice shortly."
      />
    );
  }

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

  return (
    <SectionShell title="Order success" subtitle="Your order is confirmed and ready for the next milestone">
      <FlowBreadcrumbs steps={[{ label: 'Payment', to: '/customer/payment' }, { label: 'Success', to: '/customer/order-success' }, { label: 'Invoice', to: '/customer/invoice' }]} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Order #31284 confirmed</p>
            <p className="mt-1">You’ll receive updates once the seller dispatches the item.</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Order summary</p>
          <p className="mt-2">{flowState.auctionTitle} • ₹{flowState.winningAmount.toLocaleString()} • Registration fee included</p>
          <p className="mt-2">Expected seller response: within 2 hours</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handleViewInvoice} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">View invoice</button>
        </div>
      </motion.div>
    </SectionShell>
  );
}

export function CustomerInvoicePage() {
  const [flowState] = useState<AuctionFlowState>(() => readAuctionFlowState());

  useAuctionFlowBackGuard(true);

  if (flowState.auctionStage !== 'INVOICE') {
    return <Navigate to="/customer/watch-auction" replace />;
  }

  return (
    <SectionShell title="Invoice" subtitle="Official payment and order receipt">
      <FlowBreadcrumbs steps={[{ label: 'Success', to: '/customer/order-success' }, { label: 'Invoice', to: '/customer/invoice' }, { label: 'Track', to: '/customer/track-order' }]} />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-white">Invoice INV-31284</p>
            <p className="mt-2">Item: {flowState.auctionTitle}</p>
            <p className="mt-2">Amount paid: ₹{(flowState.winningAmount + 20).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-200">Payment status: Paid</div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-slate-400">Transaction ID</p>
            <p className="mt-1 font-semibold text-white">TXN-874512</p>
            <p className="mt-3 text-slate-400">Payment method</p>
            <p className="mt-1 font-semibold text-white">UPI • Razorpay</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-white"><QrCode className="h-4 w-4 text-blue-300" /> QR receipt</div>
            <div className="mt-3 flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 text-slate-400">Scan to verify</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"><Download className="h-4 w-4" /> Download PDF</button>
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
  const [formData, setFormData] = useState<any>({ title: '', category: 'Electronics', price: '', fields: {}, description: '' });
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');
  const [productFormValid, setProductFormValid] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[] | undefined>(undefined);

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
    canContinue = !!(formData.price && formData.price.toString().trim().length > 0);
  }

  return (
    <SectionShell title="Create product" subtitle="Multi-step product wizard for a complete selling experience">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <Wizard
          steps={steps}
          step={step}
          canContinue={canContinue}
          onPrev={() => setStep(Math.max(1, step - 1))}
          onNext={() => setStep(Math.min(steps.length, step + 1))}
          onSaveDraft={() => alert('Draft saved (UI only)')}
          onPreview={() => alert('Preview (UI only)')}
          autosaveStatus={autosaveStatus}
        >
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Choose the category for the product.</p>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.keys(categoryFields).map((c) => (
                  <button key={c} onClick={() => setFormData({ ...formData, category: c })} className={`rounded-2xl border px-4 py-3 text-left text-sm ${formData.category === c ? 'border-blue-500/40 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Listing title" />
              <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Short description" />
            </div>
          )}

          {step === 3 && (
            <div>
              <ProductForm initial={formData} categoryFields={categoryFields} requiredFields={requiredFields} onValidate={(v) => setProductFormValid(v)} onChange={(data) => setFormData({ ...formData, ...data })} />
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-sm text-slate-400">Upload product gallery images and a hero image.</p>
              <div className="mt-3">
                <UploadField onChange={(files) => { setUploadedImages(files); setFormData({ ...formData, images: files }); }} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Price" />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Set price, promotions, and installment options (UI only).</div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <select className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.shipping || 'Express'} onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}>
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
              <p className="mt-2">Price: {formData.price}</p>
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
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          )}

          {step === 2 && (
            <ProductForm initial={formData} categoryFields={categoryFields} requiredFields={requiredFieldsEdit} onValidate={(v) => setProductFormValidEdit(v)} onChange={(data) => setFormData({ ...formData, ...data })} />
          )}

          {step === 3 && (
            <div>
              <p className="text-sm text-slate-400">Manage product images and media.</p>
              <div className="mt-3">
                <UploadField onChange={(files) => setFormData({ ...formData, images: files })} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
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
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const isBikeAuction = typeParam === 'bike';

  const steps = ['Settings', 'Details', 'Preview', 'Publish'];
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({
    title: isBikeAuction ? 'Bike Auction Bundle' : 'Vintage Camera Kit',
    reserve: isBikeAuction ? '₹75,000' : '₹1,00,000',
    durationDays: isBikeAuction ? 5 : 3,
    bidIncrement: isBikeAuction ? '₹2,000' : '₹1,000',
  });
  const [autosaveStatus, setAutosaveStatus] = useState('Saved');
  const [auctionFormValid, setAuctionFormValid] = useState(false);

  useEffect(() => {
    setAutosaveStatus('Autosaving...');
    const t = setTimeout(() => setAutosaveStatus('Saved'), 700);
    return () => clearTimeout(t);
  }, [data]);

  let canContinueAuction = true;
  if (step === 1) {
    canContinueAuction = !!(data.title && data.title.toString().trim().length > 0 && data.reserve && data.bidIncrement);
  } else if (step === 2) {
    canContinueAuction = auctionFormValid;
  }

  return (
    <SectionShell title="Create auction" subtitle="Guide your auction from setup to launch">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <Wizard
          steps={steps}
          step={step}
          canContinue={canContinueAuction}
          onPrev={() => setStep(Math.max(1, step - 1))}
          onNext={() => setStep(Math.min(steps.length, step + 1))}
          onSaveDraft={() => alert('Auction draft saved (UI only)')}
          onPreview={() => alert('Auction preview (UI only)')}
          autosaveStatus={autosaveStatus}
        >
          {step === 1 && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Choose item, audience and reserve rules.</div>}
          {step === 2 && <AuctionForm initial={data} onValidate={(v) => setAuctionFormValid(v)} onChange={(d) => setData(d)} />}
          {step === 3 && (<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Preview start time, increments and promotional placement.</div>)}
          {step === 4 && (<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-slate-300"><p className="text-lg font-semibold text-white">Auction published</p><p className="mt-2">{data.title} is now live for buyers and ready for instant bidding.</p><Link to="/vendor/auctions" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Manage auctions</Link></div>)}
        </Wizard>
      </div>
    </SectionShell>
  );
}
