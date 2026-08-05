import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, Globe, Heart, MapPin, Mic, Package, Search, ShieldCheck, Smartphone, Sparkles, Store, TrendingUp, Truck } from 'lucide-react';
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

const pieData = [
  { name: 'Auctions', value: 44 },
  { name: 'Buy Now', value: 31 },
  { name: 'Services', value: 25 },
];

export function HomePage() {
  const [searchCategory, setSearchCategory] = useState('All Categories');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counterValues, setCounterValues] = useState({ activeAuctions: 0, buyers: 0, sellers: 0, sold: 0 });

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

  const featuredAuctions = auctionItems.slice(0, 3);
  const featuredProductsList = featuredProducts.slice(0, 4);
  const trendingAuctions = auctionItems.slice(0, 6);
  const popularCategories = marketplaceCategories.slice(0, 6);
  const sellerHighlights = verifiedVendors.slice(0, 3);

  useEffect(() => {
    const interval = window.setInterval(() => setActiveTestimonial((value) => (value + 1) % testimonials.length), 8000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const targets = { activeAuctions: 214, buyers: 86000, sellers: 1400, sold: 48000 };
    const steps = 70;
    const increments = {
      activeAuctions: Math.ceil(targets.activeAuctions / steps),
      buyers: Math.ceil(targets.buyers / steps),
      sellers: Math.ceil(targets.sellers / steps),
      sold: Math.ceil(targets.sold / steps),
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
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_20%_30%,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.10),_transparent_20%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10">
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
                <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
                  <div className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Search inventory</div>
                  <div className="grid gap-3 sm:grid-cols-[1.5fr_0.8fr]">
                    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3">
                      <Search className="h-5 w-5 text-slate-400" />
                      <input type="search" placeholder="Search auctions, products, sellers" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
                    </div>
                    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3">
                      <span className="text-sm text-slate-400">Category</span>
                      <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className="w-full rounded-lg bg-transparent text-sm text-white outline-none">
                        <option>All Categories</option>
                        {marketplaceCategories.slice(0, 6).map((item) => (
                          <option key={item.title} className="bg-slate-900 text-white">{item.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Link to="/auctions" className="inline-flex min-h-[56px] items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-400 to-sky-500 px-6 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                    Start Bidding
                  </Link>
                  <Link to="/marketplace" className="inline-flex min-h-[56px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900/80 px-6 text-sm font-semibold text-white transition hover:bg-slate-900">
                    Explore Marketplace
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 text-center shadow-xl shadow-slate-950/20">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Live auctions</p>
                  <p className="mt-4 text-3xl font-semibold text-white">214</p>
                  <p className="mt-2 text-sm text-slate-400">Active auctions right now</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 text-center shadow-xl shadow-slate-950/20">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Registered buyers</p>
                  <p className="mt-4 text-3xl font-semibold text-white">86k+</p>
                  <p className="mt-2 text-sm text-slate-400">Premium buyers on Bidzo</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 text-center shadow-xl shadow-slate-950/20">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Verified sellers</p>
                  <p className="mt-4 text-3xl font-semibold text-white">1.4k</p>
                  <p className="mt-2 text-sm text-slate-400">Curated seller network</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.8)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Auction spotlight</p>
                    <h2 className="mt-3 text-3xl font-semibold text-white">Rolex Oyster Reserve</h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-300">Live</span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] bg-slate-950/70 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Current bid</p>
                    <p className="mt-2 text-2xl font-semibold text-white">₹3,12,000</p>
                  </div>
                  <div className="rounded-[28px] bg-slate-950/70 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Bidders</p>
                    <p className="mt-2 text-2xl font-semibold text-white">24</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/auctions/101" className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">View auction</Link>
                  <span className="inline-flex items-center rounded-full bg-white/5 px-4 py-3 text-sm text-slate-300">Verified seller</span>
                </div>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-950/90 to-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
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
          {popularCategories.map((item, index) => (
            <div key={item.title} className="group rounded-[28px] border border-white/10 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-950/90">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-950/70 text-cyan-300 transition group-hover:bg-cyan-500/10">
                {categoryIcons[index]}
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.24em] text-slate-400">{item.title}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{item.count}</p>
              <p className="mt-4 text-sm leading-6 text-slate-400">Premium listings curated for buyers seeking quality.</p>
            </div>
          ))}
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
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hidden">
          {trendingAuctions.map((item) => (
            <div key={item.id} className="min-w-[320px] rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${item.status === 'Live' ? 'bg-emerald-500/15 text-emerald-300' : item.status === 'Upcoming' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-700/80 text-slate-300'}`}>{item.status}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.endsIn}</span>
              </div>
              <div className="mb-4 h-44 overflow-hidden rounded-[20px] bg-slate-950/50">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-400">Current bid <span className="font-semibold text-white">{item.currentBid}</span></p>
              <p className="mt-2 text-sm text-slate-400">{item.participants ?? item.watchers} bidders • {item.watchers} watchers</p>
            </div>
          ))}
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
          {featuredProductsList.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              image={item.image}
              price={item.price}
              category={item.category}
              condition={item.condition}
              seller={item.seller}
              rating={item.rating}
              reviews={item.reviews}
              verified={item.verified}
              badge={item.badge}
              location={item.location}
              actionLabel={item.badge === 'Auction' ? 'Bid now' : 'Buy now'}
              actionLink={`/marketplace/${item.id}`}
            />
          ))}
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
