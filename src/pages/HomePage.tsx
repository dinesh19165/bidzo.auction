import { useEffect, useRef, useState } from 'react';
import { useThemeContext } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLocaleContext } from '../context/LocaleContext';
import { ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import { ProductCard, ReviewCard } from '../components/cards/MarketplaceCards';
import { getHomeData } from '../api/homeApi';
import { getAuctions, getEffectiveAuctionStatus } from '../api/auctionApi';
import { getPublishedTestimonials, type PublicTestimonial } from '../api/cmsApi';
import { getProducts } from '../api/productApi';
import type { HomeDataResponse } from '../api/homeApi';
import { getMarketplaceCategories, type MarketplaceCategory } from '../api/marketplaceSearchApi';

export function HomePage() {
  const [searchCategory, setSearchCategory] = useState('All Categories');
  const [counterValues, setCounterValues] = useState({ activeAuctions: 0, buyers: 0, sellers: 0, sold: 0 });
  const [inventoryQuery, setInventoryQuery] = useState('');
  const [marketplaceCategories, setMarketplaceCategories] = useState<MarketplaceCategory[]>([]);
  const navigate = useNavigate();

  // API data states
  const [homeData, setHomeData] = useState<HomeDataResponse | null>(null);
  const [directBuyProducts, setDirectBuyProducts] = useState<Awaited<ReturnType<typeof getProducts>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);

  const stats = homeData?.stats;
  const popularCategories = homeData?.categories?.slice(0, 6) || [];
  const featuredProductsList = directBuyProducts.slice(0, 4);
  const trendingAuctions = [...(homeData?.liveAuctions || []), ...(homeData?.upcomingAuctions || [])].slice(0, 6);
  const auctionSpotlight = homeData?.liveAuctions?.[0];
  const [activeTrendingIndex, setActiveTrendingIndex] = useState(0);
  const trendingScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollTrendingToIndex = (index: number) => {
    const container = trendingScrollRef.current;
    if (!container) return;
    const boundedIndex = Math.min(trendingAuctions.length - 1, Math.max(0, index));
    const target = container.children[boundedIndex] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'start' });
      setActiveTrendingIndex(boundedIndex);
    }
  };

  const handleTrendingScroll = () => {
    const container = trendingScrollRef.current;
    if (!container) return;

    const firstCard = container.children[0] as HTMLElement | undefined;
    const cardWidth = firstCard ? firstCard.offsetWidth + 16 : container.offsetWidth;
    const index = Math.round(container.scrollLeft / cardWidth);
    setActiveTrendingIndex(Math.min(trendingAuctions.length - 1, Math.max(0, index)));
  };

  // Fetch home data on component mount
  const loadHomeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [data, marketplaceProducts] = await Promise.all([getHomeData(), getProducts()]);
        setDirectBuyProducts(marketplaceProducts.filter((product) => product.sellingType === 'DIRECT_BUY'));
        if (data.liveAuctions.length === 0 && data.upcomingAuctions.length === 0) {
          const marketplaceAuctions = await getAuctions();
          const liveAuctions = marketplaceAuctions
            .filter((auction) => getEffectiveAuctionStatus(auction.status, auction.startAt, auction.endAt) === 'RUNNING')
            .map((auction) => ({
              id: auction.id,
              title: auction.title,
              status: auction.status,
              startAt: auction.startAt || '',
              endAt: auction.endAt || '',
              startingPrice: Number(auction.startingPrice) || 0,
              productId: auction.productId,
              image: auction.image,
            }));
          setHomeData({ ...data, liveAuctions });
        } else {
          setHomeData(data);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load home data');
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => { loadHomeData(); }, []);

  useEffect(() => {
    getMarketplaceCategories().then(setMarketplaceCategories).catch(() => setMarketplaceCategories([]));
  }, []);

  const submitInventorySearch = () => {
    const params = new URLSearchParams({ page: '0' });
    if (inventoryQuery.trim()) params.set('q', inventoryQuery.trim());
    if (searchCategory !== 'All Categories') params.set('category', searchCategory);
    if (inventoryQuery.trim() || searchCategory !== 'All Categories') navigate(`/search?${params.toString()}`);
  };

  useEffect(() => {
    getPublishedTestimonials()
      .then(setTestimonials)
      .catch((reason: unknown) => setTestimonialsError(reason instanceof Error ? reason.message : 'Failed to load testimonials'))
      .finally(() => setTestimonialsLoading(false));
  }, []);

  useEffect(() => {
    if (!stats) return;

    const targets = {
      activeAuctions: stats.liveAuctions || 0,
      buyers: stats.totalCustomers || 0,
      sellers: stats.totalVendors || 0,
      sold: stats.totalProducts || 0,
    };

    const steps = 70;
    const increments = {
      activeAuctions: Math.ceil(Math.max(1, targets.activeAuctions) / steps),
      buyers: Math.ceil(Math.max(1, targets.buyers) / steps),
      sellers: Math.ceil(Math.max(1, targets.sellers) / steps),
      sold: Math.ceil(Math.max(1, targets.sold) / steps),
    };

    let current = { activeAuctions: 0, buyers: 0, sellers: 0, sold: 0 };
    const timer = window.setInterval(() => {
      current = {
        activeAuctions: Math.min(targets.activeAuctions, current.activeAuctions + increments.activeAuctions),
        buyers: Math.min(targets.buyers, current.buyers + increments.buyers),
        sellers: Math.min(targets.sellers, current.sellers + increments.sellers),
        sold: Math.min(targets.sold, current.sold + increments.sold),
      };
      setCounterValues(current);
      if (
        current.activeAuctions === targets.activeAuctions &&
        current.buyers === targets.buyers &&
        current.sellers === targets.sellers &&
        current.sold === targets.sold
      ) {
        window.clearInterval(timer);
      }
    }, 30);

    return () => window.clearInterval(timer);
  }, [stats]);

  const { theme } = useThemeContext();
  const { translate, formatCurrency } = useLocaleContext();

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-[var(--app-bg)] text-slate-300"><p>Loading homepage...</p></div>;
  }

  if (error || !homeData) {
    return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[var(--app-bg)] px-4 text-center text-slate-300"><p>Unable to load homepage data.</p><p className="text-sm text-slate-400">{error || 'No homepage data is available.'}</p><button type="button" onClick={loadHomeData} className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Retry</button></div>;
  }

  // Helper function to format auction status
  const getAuctionStatus = (status?: string, startAt?: string, endAt?: string) => {
    const effectiveStatus = getEffectiveAuctionStatus(status, startAt, endAt);
    if (effectiveStatus === 'RUNNING') return 'Live';
    if (effectiveStatus === 'SCHEDULED') return 'Upcoming';
    if (effectiveStatus === 'ENDED') return 'Ended';
    if (effectiveStatus === 'CANCELLED') return 'Cancelled';
    return 'Unknown';
  };

  // Helper function to format countdown timer
  const getCountdownText = (endAt?: string, status?: string, startAt?: string) => {
    if (!endAt) return 'Unavailable';
    try {
      const effectiveStatus = getEffectiveAuctionStatus(status, startAt, endAt);
      if (effectiveStatus === 'ENDED') return 'Ended';
      if (effectiveStatus === 'SCHEDULED') {
        const start = new Date(startAt || endAt).getTime();
        const diff = start - Date.now();
        if (diff <= 0) return 'Starting soon';
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m until start`;
      }

      const now = Date.now();
      const end = new Date(endAt).getTime();
      const diff = end - now;
      if (diff <= 0) return 'Ended';

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d left`;
      }
      return `${hours}h ${minutes}m left`;
    } catch {
      return 'Unavailable';
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_20%_30%,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.10),_transparent_20%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className={`grid gap-12 items-center ${auctionSpotlight ? 'lg:grid-cols-[1.05fr_0.95fr]' : ''}`}>
            <div className="space-y-8">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${theme === 'dark' ? 'bg-slate-900/70 text-slate-200 ring-1 ring-white/10' : 'bg-[var(--surface-muted)] text-[var(--text-primary)] ring-[var(--border-color)]'}`}>
                <Sparkles className="h-4 w-4 text-amber-300" />
                Trusted premium auctions and verified sellers
              </div>
              <div className="space-y-5">
                <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Premium marketplace</p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300 bg-clip-text text-transparent">Buy luxury inventory</span>
                  and win verified auctions with confidence.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Discover curated listings, live auctions, and premium sellers backed by secure payments, AI recommendations, and 24/7 support.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                <div className={`rounded-[28px] border p-5 transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_60px_-30px_rgba(15,23,42,0.08)]'}`}>
                  <div className={`mb-4 text-sm font-medium uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Search inventory</div>
                  <div className="grid gap-3 sm:grid-cols-[1.5fr_0.8fr]">
                    <div className={`flex items-center gap-3 rounded-3xl border px-4 py-3 ${theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-[var(--border-color)] bg-[var(--surface-muted)]'}`}>
                      <button type="button" aria-label="Search marketplace" onClick={submitInventorySearch} className="text-slate-400 transition hover:text-white"><Search className="h-5 w-5" /></button>
                      <input type="search" value={inventoryQuery} onChange={(event) => setInventoryQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitInventorySearch(); }} placeholder="Search auctions, products, sellers" className={`w-full bg-transparent text-sm ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]'} outline-none`} />
                    </div>
                    <div className={`flex items-center gap-3 rounded-3xl border px-4 py-3 ${theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-[var(--border-color)] bg-[var(--surface-muted)]'}`}>
                      <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Category</span>
                      <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className={`w-full rounded-lg bg-transparent text-sm ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'} outline-none`}>
                        <option>All Categories</option>
                        {marketplaceCategories.map((item) => (
                          <option key={item.id} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-[var(--surface)] text-[var(--text-primary)]'}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Link to="/auctions" className="inline-flex min-h-[56px] items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                    Live Auctions
                  </Link>
                  <Link to="/marketplace" className="inline-flex min-h-[56px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/80 px-6 text-sm font-semibold text-white transition hover:bg-slate-900">
                    Direct Buy
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
              <Link to="/auctions" className={`rounded-[28px] border p-6 text-center shadow-xl transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-slate-950/20' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'} hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)]`}>
                <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Live auctions</p>
                <p className={`mt-4 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{stats ? counterValues.activeAuctions : '—'}</p>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Active auctions right now</p>
              </Link>
                <div className={`rounded-[28px] border p-6 text-center shadow-xl transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-slate-950/20' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'}`}>
                  <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Registered buyers</p>
                  <p className={`mt-4 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{stats ? counterValues.buyers : '—'}</p>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Premium buyers on Bidzo</p>
                </div>
                <div className={`rounded-[28px] border p-6 text-center shadow-xl transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-slate-950/20' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'}`}>
                  <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Verified sellers</p>
                  <p className={`mt-4 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{stats ? counterValues.sellers : '—'}</p>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Curated seller network</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              {auctionSpotlight ? <div className={`rounded-[32px] border p-6 shadow-xl transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.8)]' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Auction spotlight</p>
                    <h2 className={`mt-3 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{auctionSpotlight.title}</h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-300">{getAuctionStatus(auctionSpotlight.status, auctionSpotlight.startAt, auctionSpotlight.endAt)}</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className={`rounded-[28px] p-4 ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-[var(--surface-muted)]'}`}>
                    <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Starting price</p>
                    <p className={`mt-2 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{formatCurrency(auctionSpotlight.startingPrice)}</p>
                  </div>
                  <div className={`rounded-[28px] p-4 ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-[var(--surface-muted)]'}`}>
                    <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Ends</p>
                    <p className={`mt-2 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{getCountdownText(auctionSpotlight.endAt, auctionSpotlight.status, auctionSpotlight.startAt)}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to={`/auctions/${auctionSpotlight.id}`} className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">View auction</Link>
                </div>
              </div> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Trending auctions</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Don’t miss today’s hottest bids</h2>
          </div>
          <Link to="/auctions" className="text-sm font-medium text-slate-300 transition hover:text-white">Browse all live auctions</Link>
        </div>
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-visible">
          {trendingAuctions && trendingAuctions.length > 0 ? (
            trendingAuctions.map((item: any) => (
              <Link key={item.id} to={`/auctions/${item.id}`} title={`View ${item.title}`} className={`w-full rounded-[28px] border p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-26px_rgba(15,23,42,0.16)] ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-slate-950/20 hover:border-blue-400/40' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)] hover:border-slate-300/40'}`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] whitespace-nowrap ${getAuctionStatus(item.status) === 'Live' ? (theme === 'dark' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700') : getAuctionStatus(item.status) === 'Upcoming' ? (theme === 'dark' ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-700') : (theme === 'dark' ? 'bg-slate-700/80 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>{getAuctionStatus(item.status)}</span>
                  <span className={`text-xs uppercase tracking-[0.18em] whitespace-nowrap ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>{getCountdownText(item.endAt, item.status)}</span>
                </div>
                <div className={`mb-4 h-44 overflow-hidden rounded-[20px] ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-[var(--surface-muted)]'}`}>
                  <img src={item.image || '/logo.png'} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <h3 className={`text-lg font-semibold break-words ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{item.title}</h3>
                <p className={`mt-3 text-sm break-words ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>{translate('currentBid')} <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{formatCurrency(item.startingPrice || 0)}</span></p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400">No auctions available at the moment</p>
            </div>
          )}
        </div>
        <div className="relative md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-2 pl-1 scrollbar-hidden snap-x snap-mandatory" ref={trendingScrollRef} onScroll={handleTrendingScroll}>
            {trendingAuctions && trendingAuctions.length > 0 ? (
              trendingAuctions.map((item: any) => (
                <Link key={item.id} to={`/auctions/${item.id}`} title={`View ${item.title}`} className={`snap-start flex-shrink-0 min-w-[calc(100%-48px)] max-w-[calc(100%-48px)] rounded-[28px] border p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-26px_rgba(15,23,42,0.16)] ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-slate-950/20 hover:border-blue-400/40' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)] hover:border-slate-300/40'}`}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] whitespace-nowrap ${getAuctionStatus(item.status) === 'Live' ? (theme === 'dark' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700') : getAuctionStatus(item.status) === 'Upcoming' ? (theme === 'dark' ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-700') : (theme === 'dark' ? 'bg-slate-700/80 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>{getAuctionStatus(item.status)}</span>
                    <span className={`text-xs uppercase tracking-[0.18em] whitespace-nowrap ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>{getCountdownText(item.endAt, item.status, item.startAt)}</span>
                  </div>
                  <div className={`mb-4 h-44 overflow-hidden rounded-[20px] ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-[var(--surface-muted)]'}`}>
                    <img src={item.image || '/logo.png'} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <h3 className={`text-lg font-semibold break-words ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{item.title}</h3>
                  <p className={`mt-3 text-sm break-words ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>{translate('currentBid')} <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{formatCurrency(item.startingPrice || 0)}</span></p>
                </Link>
              ))
            ) : (
              <div className="flex-shrink-0 w-full text-center py-12">
                <p className="text-slate-400">No auctions available</p>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Show previous auction"
            onClick={() => scrollTrendingToIndex(activeTrendingIndex - 1)}
            className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/80 p-2 text-slate-100 shadow-lg transition hover:bg-slate-900"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Show next auction"
            onClick={() => scrollTrendingToIndex(activeTrendingIndex + 1)}
            className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/80 p-2 text-slate-100 shadow-lg transition hover:bg-slate-900"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-col items-start gap-3 md:hidden">
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-400">Swipe to explore more auctions →</p>
          </div>
          <div className="flex items-center gap-2">
            {trendingAuctions.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => scrollTrendingToIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${index === activeTrendingIndex ? 'bg-slate-100' : 'bg-slate-500/40 hover:bg-slate-300/70'}`}
                aria-label={`View auction ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Direct Buy products</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Premium listings ready to buy or bid</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-slate-300 transition hover:text-white">Browse Direct Buy</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProductsList && featuredProductsList.length > 0 ? (
            featuredProductsList.map((item) => {
              const sellingTypeLabel = item.sellingType === 'AUCTION' ? 'Auction' : item.sellingType === 'DIRECT_BUY' ? 'Direct Buy' : 'Product';
              return (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description ?? ''}
                  image={item.image || '/logo.png'}
                  price={item.price}
                  category={item.category}
                  condition=""
                  seller=""
                  rating={item.rating}
                  reviews={item.reviews}
                  verified={item.verified}
                  showSellerMeta={false}
                  badge={sellingTypeLabel}
                  location={item.location ?? ''}
                  actionLabel={item.sellingType === 'AUCTION' ? 'Bid now' : 'Buy now'}
                  actionLink={`/marketplace/${item.id}`}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Testimonials</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Trusted by buyers and sellers</h2>
          </div>
          {testimonialsError ? <button type="button" onClick={() => { setTestimonialsLoading(true); setTestimonialsError(null); getPublishedTestimonials().then(setTestimonials).catch((reason: unknown) => setTestimonialsError(reason instanceof Error ? reason.message : 'Failed to load testimonials')).finally(() => setTestimonialsLoading(false)); }} className="text-sm font-medium text-slate-300 transition hover:text-white">Retry</button> : null}
        </div>
        {testimonialsLoading ? <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-400">Loading testimonials...</div> : testimonialsError ? <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-200">Unable to load testimonials: {testimonialsError}</div> : testimonials.length === 0 ? <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-slate-400">No published testimonials available.</div> : <div className="grid gap-5 lg:grid-cols-3">{testimonials.map((testimonial) => <div key={testimonial.id}><ReviewCard quote={testimonial.message} author={testimonial.customerName} rating={Math.max(1, Math.min(5, Math.round(testimonial.rating)))} imageUrl={testimonial.imageUrl || '/logo.png'} /></div>)}</div>}
      </section>

    </>
  );
}
