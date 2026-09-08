import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Gavel, Search, Sparkles } from 'lucide-react';
import { getPortalHome, useAuth } from '../context/AuthContext';
import { useLocaleContext } from '../context/LocaleContext';
import { getHomeData, type AuctionResponse, type HomeBannerResponse, type HomeDataResponse, type ProductResponse } from '../api/homeApi';
import { getAuctions, type AuctionListItem } from '../api/auctionApi';
import { categoryLabel, getCategories, type CategoryRecord } from '../api/categoryApi';
import { API_BASE_URL } from '../api/apiClient';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { filterEndingSoonHomeAuctions, filterHomeAuctions, type HomeAuctionStatus } from '../utils/homeAuctions';

function imageUrl(value?: string | null): string {
  if (!value) return '/logo.png';
  if (/^https?:\/\//i.test(value) || value.startsWith('/logo')) return value;
  return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
}

function mediaUrl(value?: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
}

function text(value: unknown, fallback: string): string {
  const result = String(value ?? '').trim();
  return result || fallback;
}

function numberText(value: unknown): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? String(numeric) : '';
}

function countdown(endAt?: string | null): string {
  if (!endAt) return 'End time unavailable';
  const end = new Date(endAt).getTime();
  if (!Number.isFinite(end)) return 'End time unavailable';
  const seconds = Math.max(0, Math.floor((end - Date.now()) / 1000));
  if (seconds === 0) return 'Ended';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h ${minutes}m left`;
}

function productCategory(product: ProductResponse, categories: CategoryRecord[]): string {
  if (product.categoryName) return product.categoryName;
  const category = categories.find((item) => String(item.id) === String(product.categoryId));
  return category ? category.name : 'Category unavailable';
}

function sellerName(value: ProductResponse | AuctionResponse): string {
  return text(value.vendorName || value.seller, 'Seller unavailable');
}

function toHomeAuction(item: AuctionListItem): AuctionResponse {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    startAt: item.startAt,
    endAt: item.endAt,
    startingPrice: item.startingPrice,
    currentBid: item.currentBid,
    bidCount: item.participants,
    status: item.backendStatus,
    productId: item.productId,
    seller: item.seller,
    image: item.image,
  };
}

function HomeSkeleton() {
  return <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">{Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}</div>;
}

function HomeBanner({ banners, children }: { banners: HomeBannerResponse[]; children: ReactNode }) {
  const orderedBanners = useMemo(
    () => [...banners].sort((left, right) => Number(left.displayOrder ?? 0) - Number(right.displayOrder ?? 0)),
    [banners],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const visibleBanners = orderedBanners;

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, visibleBanners.length - 1)));
  }, [visibleBanners.length]);

  useEffect(() => {
    if (visibleBanners.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % visibleBanners.length), 4500);
    return () => window.clearInterval(timer);
  }, [visibleBanners.length]);

  const banner = visibleBanners[activeIndex];
  const desktopImage = banner ? mediaUrl(banner.imageUrl) : null;
  const mobileImage = banner ? mediaUrl(banner.mobileImageUrl) || desktopImage : null;
  useEffect(() => setImageFailed(false), [banner?.id, desktopImage, mobileImage]);
  useEffect(() => {
    setIsVisible(false);
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [banner?.id]);

  const heroStyle = {
    '--hero-banner-image': !imageFailed && desktopImage ? `url("${desktopImage}")` : 'none',
    '--hero-banner-mobile-image': !imageFailed && mobileImage ? `url("${mobileImage}")` : 'none',
  } as CSSProperties;

  return (
    <section className={`home-hero relative min-h-[520px] overflow-hidden rounded-[28px] text-white transition-opacity duration-500 sm:min-h-[560px] lg:min-h-[600px] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div aria-hidden="true" className="home-hero-background absolute inset-0 z-0" style={heroStyle} />
      <div aria-hidden="true" className="home-hero-overlay pointer-events-none absolute inset-0 z-10" />
      <div className="relative z-20 flex min-h-[520px] items-center py-10 sm:min-h-[560px] sm:py-12 lg:min-h-[600px] lg:py-16 [&>section]:!bg-transparent">{children}</div>
      {visibleBanners.length > 1 ? <>
        <button type="button" aria-label="Previous banner" onClick={() => setActiveIndex((current) => (current - 1 + visibleBanners.length) % visibleBanners.length)} className="absolute left-4 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white transition hover:bg-slate-950/85"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" aria-label="Next banner" onClick={() => setActiveIndex((current) => (current + 1) % visibleBanners.length)} className="absolute right-4 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white transition hover:bg-slate-950/85"><ChevronRight className="h-4 w-4" /></button>
        <div className="absolute right-6 top-6 z-30 flex gap-1.5" role="tablist" aria-label="Banners">{visibleBanners.map((item, index) => <button key={item.id} type="button" role="tab" aria-label={`Show banner ${index + 1}`} aria-selected={index === activeIndex} onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-cyan-300' : 'w-1.5 bg-white/60'}`} />)}</div>
      </> : null}
    </section>
  );
}

function AuctionTile({ auction, status }: { auction: AuctionResponse; status: HomeAuctionStatus }) {
  const { formatCurrency } = useLocaleContext();
  const [remaining, setRemaining] = useState(() => countdown(auction.endAt));
  const title = text(auction.productName || auction.title, 'Auction');
  const currentBid = auction.currentBid ?? auction.startingPrice;
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(countdown(auction.endAt)), 1000);
    return () => window.clearInterval(timer);
  }, [auction.endAt]);
  return (
    <Link to={`/auctions/${auction.id}`} aria-label={`View ${status === 'RUNNING' ? 'live' : 'scheduled'} auction: ${title}`} className="home-auction-card group block rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-blue-400/40">
      <div className="relative h-44 overflow-hidden rounded-[20px] bg-slate-950/60">
        <img src={imageUrl(auction.imageUrl || auction.image)} alt={title} className="h-full w-full object-cover" loading="lazy" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${status === 'RUNNING' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>{status === 'RUNNING' ? 'Live' : 'Scheduled'}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-slate-400">
        <p>Current bid: <span className="font-semibold text-white">{currentBid == null ? 'Unavailable' : formatCurrency(String(currentBid))}</span></p>
        <p>Starting price: <span className="font-semibold text-white">{auction.startingPrice == null ? 'Unavailable' : formatCurrency(String(auction.startingPrice))}</span></p>
            <p className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> {remaining}</p>
        <p className="inline-flex items-center gap-2"><Gavel className="h-4 w-4" /> {auction.bidCount == null ? 'Bid count unavailable' : `${auction.bidCount} bids`}</p>
        <p>{sellerName(auction)}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition group-hover:text-cyan-200">View auction <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
    </Link>
  );
}

function ProductSection({ title, products, categories, emptyTitle, emptyDescription }: { title: string; products: ProductResponse[]; categories: CategoryRecord[]; emptyTitle: string; emptyDescription: string }) {
  const visibleProducts = products.filter((product) => product.sellingType !== 'AUCTION');
  return (
    <section className={`mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 ${title === 'Featured products' ? 'featured-products-section' : ''}`}>
      <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Bidzo marketplace</p><h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2></div><Link to="/marketplace" className="text-sm font-medium text-slate-300 hover:text-white">Browse Marketplace</Link></div>
        {visibleProducts.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product.id} id={product.id} title={text(product.name, 'Product')} description={text(product.description, 'Product details unavailable')} image={imageUrl(product.imageUrl || product.image || product.images?.[0])} price={numberText(product.price)} category={productCategory(product, categories)} condition={text(product.condition, '')} seller={sellerName(product)} rating={product.rating ?? undefined} reviews={product.reviewCount ?? product.reviews ?? undefined} verified={product.verified} createdAt={product.createdAt} badge="Direct Buy" actionLabel="View Product" actionLink={`/product/${product.id}`} showSellerMeta />)}</div>}
    </section>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const [homeData, setHomeData] = useState<HomeDataResponse | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (authReady && user && user.type !== 'customer') navigate(getPortalHome(user), { replace: true });
  }, [authReady, navigate, user]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [data, categoryData, auctionItems] = await Promise.all([getHomeData(), getCategories(), getAuctions()]);
      const homeAuctions = auctionItems.map(toHomeAuction);
      setHomeData({
        ...data,
        liveAuctions: data.liveAuctions?.length ? data.liveAuctions : homeAuctions,
        upcomingAuctions: data.upcomingAuctions?.length ? data.upcomingAuctions : homeAuctions,
        endingSoonAuctions: data.endingSoonAuctions?.length ? data.endingSoonAuctions : homeAuctions,
      });
      setCategories(categoryData);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load marketplace data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedCategory = useMemo(() => categories.find((item) => String(item.id) === categoryId), [categories, categoryId]);
  const submitSearch = () => {
    const params = new URLSearchParams({ page: '0' });
    if (query.trim()) params.set('q', query.trim());
    if (selectedCategory) params.set('categoryId', String(selectedCategory.id));
    navigate(`/marketplace?${params.toString()}`);
  };

  if (!authReady || (user && user.type !== 'customer')) return null;
  if (loading) return <HomeSkeleton />;
  if (error || !homeData) return <div className="mx-auto max-w-2xl px-4 py-24"><ErrorState title="Unable to load marketplace data." description={error || 'No marketplace data is available.'} /><button type="button" onClick={load} className="mt-4 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white">Retry</button></div>;

  const featured = (homeData.featuredProducts ?? []).filter((product) => product.sellingType !== 'AUCTION');
  const liveAuctions = filterHomeAuctions(homeData.liveAuctions ?? [], 'RUNNING', currentTime);
  const scheduledAuctions = filterHomeAuctions(homeData.upcomingAuctions ?? [], 'SCHEDULED', currentTime);
  const endingSoon = filterEndingSoonHomeAuctions(homeData.endingSoonAuctions ?? [], currentTime);
  const stats = { ...homeData.stats, liveAuctions: liveAuctions.length };
  const recent = homeData.recentProducts ?? [];
  const popular = homeData.popularProducts ?? [];
  const sellers = homeData.verifiedSellers ?? [];

  return <><div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8"><HomeBanner banners={homeData.banners ?? []}>
    <section className="relative overflow-hidden bg-[var(--app-bg)] text-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"><div className="max-w-4xl space-y-8"><div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10"><Sparkles className="h-4 w-4 text-amber-300" /> Trusted auctions and verified sellers</div><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"><span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300 bg-clip-text text-transparent">Buy with confidence.</span> Bid on what matters.</h1><p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">Search real marketplace inventory, discover live auctions, and connect with verified sellers.</p><div className="grid gap-3 rounded-[28px] border border-white/10 bg-slate-900/80 p-4 sm:grid-cols-[1fr_220px_auto]"><div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"><Search className="h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} placeholder="Search products, auctions, sellers" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" /></div><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"><option value="">All Categories</option>{categories.map((category) => <option key={category.id} value={String(category.id)}>{categoryLabel(category)}</option>)}</select><button type="button" onClick={submitSearch} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">Search</button></div><div className="flex flex-wrap gap-3"><Link to="/auctions" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Browse Live Auctions</Link><Link to="/marketplace" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Browse Marketplace</Link></div>{stats ? <div className="grid gap-4 sm:grid-cols-3">{[['Live auctions', stats.liveAuctions], ['Products', stats.totalProducts], ['Verified sellers', stats.totalVendors]].map(([label, value]) => value !== null && value !== undefined ? <div key={String(label)} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p></div> : null)}</div> : null}</div></div></section>
    </HomeBanner></div>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Explore</p><h2 className="mt-2 text-2xl font-semibold text-white">Categories</h2></div>{categories.length === 0 ? <EmptyState title="No categories available" description="Categories will appear here when available." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category) => <button type="button" key={category.id} onClick={() => navigate(`/marketplace?categoryId=${encodeURIComponent(String(category.id))}`)} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left transition hover:border-blue-400/40"><p className="font-semibold text-white">{categoryLabel(category)}</p>{category.count !== undefined && category.count !== null ? <p className="mt-1 text-sm text-slate-400">{String(category.count)} products</p> : null}</button>)}</div>}</section>
    <ProductSection title="Featured products" products={featured} categories={categories} emptyTitle="No featured products yet" emptyDescription="Featured products will appear here when available." />
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Live now</p><h2 className="mt-2 text-2xl font-semibold text-white">Live auctions</h2></div><Link to="/auctions" className="text-sm text-slate-300 hover:text-white">Browse Auctions</Link></div>{liveAuctions.length === 0 ? <EmptyState title="No live auctions right now" description="Check back soon for new auctions." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{liveAuctions.map((auction) => <AuctionTile key={auction.id} auction={auction} status="RUNNING" />)}</div>}</section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Coming up</p><h2 className="mt-2 text-2xl font-semibold text-white">Scheduled auctions</h2></div>{scheduledAuctions.length === 0 ? <EmptyState title="No scheduled auctions" description="There are no upcoming auctions right now." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{scheduledAuctions.map((auction) => <AuctionTile key={auction.id} auction={auction} status="SCHEDULED" />)}</div>}</section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Act soon</p><h2 className="mt-2 text-2xl font-semibold text-white">Ending soon</h2></div>{endingSoon.length === 0 ? <EmptyState title="No auctions ending soon" description="There are no ending-soon auctions right now." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{endingSoon.map((auction) => <AuctionTile key={auction.id} auction={auction} status="RUNNING" />)}</div>}</section>
    <ProductSection title="Recently added" products={recent} categories={categories} emptyTitle="No recently added products" emptyDescription="New products will appear here when available." />
    <ProductSection title="Popular products" products={popular} categories={categories} emptyTitle="No popular products yet" emptyDescription="Popularity information will appear here when available." />
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Trusted sellers</p><h2 className="mt-2 text-2xl font-semibold text-white">Verified sellers</h2></div>{sellers.length === 0 ? <EmptyState title="No verified sellers available" description="Verified sellers will appear here when available." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{sellers.map((seller, index) => { const name = text(seller.name || seller.vendorName || seller.storeName, 'Seller unavailable'); const sellerId = seller.id || seller.vendorId; return <Link key={String(sellerId || index)} to={sellerId ? `/seller/${sellerId}` : '/marketplace'} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 transition hover:border-emerald-400/40"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-white">{name}</p>{seller.productCount !== undefined && seller.productCount !== null ? <p className="mt-1 text-sm text-slate-400">{String(seller.productCount)} products</p> : null}</div><CheckCircle2 className="h-5 w-5 text-emerald-300" /></div></Link>; })}</div>}</section>
  </>;
}
