import { useEffect, useRef, useState } from 'react';
import { useThemeContext } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLocaleContext } from '../context/LocaleContext';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, Clock3, Globe, Heart, MapPin, Mic, Package, Search, ShieldCheck, Smartphone, Sparkles, Store, TrendingUp, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  featuredProducts,
  products,
  chartSeries,
  reviews,
  auctionItems,
  sellers,
  featuredCategories,
  flashDeals,
  topCollections,
  popularSearches,
  appStats,
  marketplaceCategories,
  topCategories,
  verifiedVendors,
  premiumAuctions,
  sponsoredProducts,
  trustStatements,
  statsOverview,
  testimonials,
  downloadCards,
} from '../data/mockData';
import { PrimaryButton, SecondaryButton, Badge } from '../components/common/Buttons';
import { StatisticCard, ProductCard, ReviewCard, AuctionCard, CategoryCard, SellerCard } from '../components/cards/MarketplaceCards';
import { getHomeData } from '../api/homeApi';
import { getEffectiveAuctionStatus } from '../api/auctionApi';
import type { HomeDataResponse, CategoryResponse, ProductResponse, AuctionResponse } from '../api/homeApi';

const pieData = [
  { name: 'Auctions', value: 44 },
  { name: 'Buy Now', value: 31 },
  { name: 'Services', value: 25 },
];

export function HomePage() {
  const [searchCategory, setSearchCategory] = useState('All Categories');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counterValues, setCounterValues] = useState({ activeAuctions: 0, buyers: 0, sellers: 0, sold: 0 });

  // API data states
  const [homeData, setHomeData] = useState<HomeDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryIcons = [
    <Smartphone className="h-5 w-5" />, <Truck className="h-5 w-5" />, <Store className="h-5 w-5" />, <Heart className="h-5 w-5" />,
    <Package className="h-5 w-5" />, <TrendingUp className="h-5 w-5" />, <ShieldCheck className="h-5 w-5" />, <MapPin className="h-5 w-5" />,
    <Search className="h-5 w-5" />, <Globe className="h-5 w-5" />,
  ];

  const heroSlides = [
    {
      title: 'Bid on premium inventory with confidence',
      description: 'Live auctions, trusted sellers and secure checkout for enterprise-grade deals.',
      cta: 'Explore auctions',
      link: '/auctions',
    },
    {
      title: 'Shop curated listings across vehicles, tech and luxury goods',
      description: 'Verified sellers, fast delivery and premium buyer protection in every order.',
      cta: 'Browse marketplace',
      link: '/marketplace',
    },
    {
      title: 'Discover featured sellers and top-rated offers today',
      description: 'Track trending inventory, flash deals and handpicked premium collections.',
      cta: 'See featured sellers',
      link: '/marketplace',
    },
  ];

  // Fallback to mock data if API data is not available
  const featuredProductsList = homeData?.featuredProducts?.slice(0, 4) || featuredProducts.slice(0, 4);
  const popularCategories = homeData?.categories?.slice(0, 6) || marketplaceCategories.slice(0, 6);
  const stats = homeData?.stats || { totalProducts: 0, liveAuctions: 0, upcomingAuctions: 0, totalCategories: 0, totalVendors: 0, totalCustomers: 0 };
  
  // Combine live and upcoming auctions for trending section
  const trendingAuctions = [
    ...(homeData?.liveAuctions || []),
    ...(homeData?.upcomingAuctions || []),
  ].slice(0, 6) || auctionItems.slice(0, 6);
  
  const sellerHighlights = verifiedVendors.slice(0, 3);
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
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getHomeData();
        setHomeData(data);
      } catch (err) {
        console.error('Error loading home data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load home data');
        // Continue with mock data as fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setActiveTestimonial((value) => (value + 1) % testimonials.length), 8000);
    return () => window.clearInterval(interval);
  }, []);

  // Update counter values based on stats from API
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
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
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
                      <Search className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`} />
                      <input type="search" placeholder="Search auctions, products, sellers" className={`w-full bg-transparent text-sm ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]'} outline-none`} />
                    </div>
                    <div className={`flex items-center gap-3 rounded-3xl border px-4 py-3 ${theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-[var(--border-color)] bg-[var(--surface-muted)]'}`}>
                      <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Category</span>
                      <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className={`w-full rounded-lg bg-transparent text-sm ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'} outline-none`}>
                        <option>All Categories</option>
                        {marketplaceCategories.slice(0, 6).map((item) => (
                          <option key={item.title} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-[var(--surface)] text-[var(--text-primary)]'}>{item.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Link to="/auctions" className="inline-flex min-h-[56px] items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                    {translate('startBidding')}
                  </Link>
                  <Link to="/marketplace" className="inline-flex min-h-[56px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/80 px-6 text-sm font-semibold text-white transition hover:bg-slate-900">
                    {translate('exploreMarketplace')}
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
              <Link to="/auctions" className={`rounded-[28px] border p-6 text-center shadow-xl transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-slate-950/20' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'} hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)]`}>
                <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Live auctions</p>
                <p className={`mt-4 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{counterValues.activeAuctions}</p>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Active auctions right now</p>
              </Link>
                <div className={`rounded-[28px] border p-6 text-center shadow-xl transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-slate-950/20' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'}`}>
                  <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Registered buyers</p>
                  <p className={`mt-4 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{counterValues.buyers > 0 ? `${Math.round(counterValues.buyers / 1000)}k+` : '0'}</p>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Premium buyers on Bidzo</p>
                </div>
                <div className={`rounded-[28px] border p-6 text-center shadow-xl transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-slate-950/20' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'}`}>
                  <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Verified sellers</p>
                  <p className={`mt-4 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{counterValues.sellers > 0 ? `${Math.round(counterValues.sellers / 1000)}k+` : '0'}</p>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Curated seller network</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              <div className={`rounded-[32px] border p-6 shadow-xl transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/80 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.8)]' : 'border-[var(--border-color)] bg-[var(--surface)] shadow-[0_20px_45px_rgba(15,23,42,0.08)]'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Auction spotlight</p>
                    <h2 className={`mt-3 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>Rolex Oyster Reserve</h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-300">Live</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className={`rounded-[28px] p-4 ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-[var(--surface-muted)]'}`}>
                    <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>{translate('currentBid')}</p>
                    <p className={`mt-2 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>{formatCurrency(312000)}</p>
                  </div>
                  <div className={`rounded-[28px] p-4 ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-[var(--surface-muted)]'}`}>
                    <p className={`text-sm uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>Bidders</p>
                    <p className={`mt-2 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-[var(--text-primary)]'}`}>24</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/auctions/101" className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">View auction</Link>
                  <span className={`inline-flex items-center rounded-full px-4 py-3 text-sm ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-[var(--surface-muted)] text-[var(--text-primary)]'}`}>Verified seller</span>
                </div>
              </div>
              <div className={`rounded-[32px] border p-6 shadow-xl shadow-slate-950/20 ${theme === 'dark' ? 'border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-950/90 to-slate-900/80' : 'border-[var(--border-color)] bg-[var(--surface)]'}`}>
                <p className="text-sm uppercase tracking-[0.24em] text-blue-300">Fast access</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Premium listings, refined for you</h2>
                <p className="mt-5 text-sm leading-7 text-slate-300">Explore curated products and live auctions that match your premium buying criteria.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Trusted sellers</p>
                    <p className="mt-2 text-lg font-semibold text-white">1.4k</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Fast delivery</p>
                    <p className="mt-2 text-lg font-semibold text-white">24h+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Browse categories</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Shop by category</h2>
          </div>
          <Link to="/categories" className="text-sm font-medium text-slate-300 transition hover:text-white">View all categories</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {popularCategories && popularCategories.length > 0 ? (
            popularCategories.map((item: any, index: number) => (
              <Link key={item.id} to={`/marketplace?category=${item.id || item.title}`} className="group rounded-[28px] border border-white/10 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-950/90">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950/70 text-cyan-300 transition group-hover:bg-cyan-500/10">
                  {categoryIcons[index % categoryIcons.length]}
                </div>
                <p className="mt-6 text-sm uppercase tracking-[0.24em] text-slate-400">{item.name || item.title}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{item.count || '0'}</p>
                <p className="mt-4 text-sm leading-6 text-slate-400">{item.description || 'Premium listings curated for buyers seeking quality.'}</p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400">No categories available</p>
            </div>
          )}
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
                <p className={`mt-2 text-sm break-words ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>{item.participants || 0} bidders • {item.watchers || 0} watchers</p>
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
                  <p className={`mt-2 text-sm break-words ${theme === 'dark' ? 'text-slate-400' : 'text-[var(--text-muted)]'}`}>{item.participants || 0} bidders • {item.watchers || 0} watchers</p>
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
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Marketplace products</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Premium listings ready to buy or bid</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-slate-300 transition hover:text-white">Explore the full marketplace</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProductsList && featuredProductsList.length > 0 ? (
            featuredProductsList.map((item: any) => {
              const sellingTypeLabel = item.sellingType === 'AUCTION' ? 'Auction' : item.sellingType === 'DIRECT_BUY' ? 'Direct Buy' : 'Product';
              return (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.name || item.title || 'Product'}
                  description={item.description || ''}
                  image={item.image || '/logo.png'}
                  price={`₹${item.price || 0}`}
                  category={item.categoryId ? `Category ${item.categoryId}` : 'Uncategorized'}
                  condition="New"
                  seller={item.vendorId ? `Vendor ${item.vendorId}` : 'Unknown Seller'}
                  rating={4.5}
                  reviews={0}
                  verified={true}
                  badge={sellingTypeLabel}
                  location="India"
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
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Why choose Bidzo</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Premium features for modern auctions</h2>
          </div>
          <Link to="/faq" className="text-sm font-medium text-slate-300 transition hover:text-white">Learn more</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { icon: <ShieldCheck className="h-5 w-5" />, title: 'Verified Sellers', description: 'Every listing is vetted before approval.' },
            { icon: <ArrowRight className="h-5 w-5" />, title: 'Secure Payments', description: 'Escrow support with verified checkout flows.' },
            { icon: <Clock3 className="h-5 w-5" />, title: 'Live Auctions', description: 'Real-time bidding with immediate notifications.' },
            { icon: <Package className="h-5 w-5" />, title: 'Fast Delivery', description: 'Priority logistics for premium orders.' },
            { icon: <Globe className="h-5 w-5" />, title: 'AI Recommendations', description: 'Smart matching for buyers and sellers.' },
            { icon: <Heart className="h-5 w-5" />, title: '24/7 Support', description: 'Marketplace support whenever you need it.' },
          ].map((item) => (
            <div key={item.title} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 transition hover:-translate-y-1 hover:bg-slate-900/90">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950/70 text-cyan-300">{item.icon}</div>
              <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Testimonials</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Trusted by buyers and sellers</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <button onClick={() => setActiveTestimonial((value) => (value - 1 + testimonials.length) % testimonials.length)} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 transition hover:bg-slate-900">Prev</button>
            <button onClick={() => setActiveTestimonial((value) => (value + 1) % testimonials.length)} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 transition hover:bg-slate-900">Next</button>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <div key={item.author} className={index === activeTestimonial ? 'block' : 'hidden lg:block'}>
              <ReviewCard quote={item.quote} author={`${item.author} • ${item.role}`} rating={5} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">How it works</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">A premium process for buyers and sellers</h2>
          </div>
          <Link to="/onboarding" className="text-sm font-medium text-slate-300 transition hover:text-white">Get started</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { step: '01', title: 'Register', description: 'Create your account and complete onboarding.' },
            { step: '02', title: 'Verify', description: 'Finish KYC and seller verification quickly.' },
            { step: '03', title: 'Start Selling', description: 'List premium inventory or launch auctions.' },
            { step: '04', title: 'Place Bids', description: 'Join live auctions with confidence.' },
            { step: '05', title: 'Win Auction', description: 'Secure the best deals with transparent bidding.' },
            { step: '06', title: 'Delivery', description: 'Track fast delivery and secure fulfillment.' },
          ].map((item) => (
            <div key={item.step} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 transition hover:-translate-y-1">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">{item.step}</div>
              <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
