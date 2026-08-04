import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock3, Globe, Heart, MapPin, Microphone, Package, Search, ShieldCheck, Smartphone, Sparkles, Store, TrendingUp, Truck } from 'lucide-react';
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
  const [activeSlide, setActiveSlide] = useState(0);

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

  const categoryIcons = [
    <Smartphone className="h-5 w-5" />, <Truck className="h-5 w-5" />, <Store className="h-5 w-5" />, <Heart className="h-5 w-5" />,
    <Package className="h-5 w-5" />, <TrendingUp className="h-5 w-5" />, <ShieldCheck className="h-5 w-5" />, <MapPin className="h-5 w-5" />,
    <Search className="h-5 w-5" />, <Globe className="h-5 w-5" />, <Truck className="h-5 w-5" />, <ShieldCheck className="h-5 w-5" />,
  ];

  const endingSoonAuctions = auctionItems.filter((item) => item.status === 'Live').slice(0, 3);
  const recentlyAdded = products.slice(0, 4);
  const recommendedProducts = products.slice(1, 7);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((value) => (value + 1) % heroSlides.length), 8000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-10">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.85fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-10"
          >
            <Badge className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Verified marketplace experience
            </Badge>
            <div className="mt-6 max-w-2xl space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                {heroSlides[activeSlide].title}
              </h1>
              <p className="text-lg leading-8 text-slate-300">
                {heroSlides[activeSlide].description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={heroSlides[activeSlide].link}>
                <PrimaryButton icon={<ArrowRight className="h-4 w-4" />}>{heroSlides[activeSlide].cta}</PrimaryButton>
              </Link>
              <Link to="/marketplace">
                <SecondaryButton>Shop now</SecondaryButton>
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Auction promotion</p>
                    <h2 className="mt-3 text-xl font-semibold text-white">Luxury SUV closing soon</h2>
                    <p className="mt-2 text-sm text-slate-400">Live bidding ends in under 2 hours with verified inspection available.</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">Live</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">Bid now</button>
                  <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">View auction</button>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-blue-300">Today’s deals</p>
                    <h2 className="mt-3 text-xl font-semibold text-white">Top picks with high discounts</h2>
                    <p className="mt-2 text-sm text-slate-400">Browse premium buys, instant savings, and fast delivery across categories.</p>
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">Up to 30% off</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-200">MacBook Pro M3</div>
                  <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-200">Italian Leather Sofa</div>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" placeholder="Search premium products, auctions or vendors" />
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10">
                  <Microphone className="h-4 w-4" /> Voice search
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Furniture', 'Agriculture'].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">{tag}</span>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {appStats.map((item) => (
                <StatisticCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSlide((value) => (value - 1 + heroSlides.length) % heroSlides.length)}
                className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setActiveSlide((value) => (value + 1) % heroSlides.length)}
                className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Next
              </button>
              <div className="flex items-center gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 w-2.5 rounded-full ${activeSlide === index ? 'bg-white' : 'bg-white/30'}`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30">
                <img src="https://images.unsplash.com/photo-1602524812462-95d6be3ee5ee?auto=format&fit=crop&w=1200&q=80" alt="Premium marketplace" className="h-96 w-full object-cover" />
                <div className="space-y-4 p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-200">Auction spotlight</div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Featured offer</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Premium audio studio set</h2>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Current bid</p>
                      <p className="text-xl font-semibold text-white">₹1,86,000</p>
                    </div>
                    <Link to="/auctions/102" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-400">Bid now</Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
                  <p className="text-sm uppercase tracking-[0.24em] text-blue-300">Seller spotlight</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">Verified vendors with premium ratings</h3>
                  <p className="mt-3 text-sm text-slate-400">Top sellers trusted for fast delivery and verified listings.</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
                  <p className="text-sm uppercase tracking-[0.24em] text-blue-300">Shipping promise</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">Fast delivery available</h3>
                  <p className="mt-3 text-sm text-slate-400">Priority logistics for high-value products and auction winners.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Browse categories</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Shop by category</h2>
          </div>
          <Link to="/categories" className="text-sm font-medium text-slate-300 transition hover:text-white">View all categories</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {marketplaceCategories.map((item, index) => (
            <CategoryCard key={item.title} title={item.title} description={item.description} icon={categoryIcons[index]} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Premium auctions</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Curated auctions with verified inventory</h2>
          </div>
          <Link to="/auctions" className="text-sm font-medium text-slate-300 transition hover:text-white">Browse auctions</Link>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          {premiumAuctions.map((item) => (
            <AuctionCard key={item.title} id={item.title} title={item.title} image={item.image} status={item.status} currentBid={item.currentBid} endsIn={item.endsIn} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Sponsored products</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Featured product picks</h2>
              </div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-200">Sponsored</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {sponsoredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.category}
                  image={item.image}
                  price={item.price}
                  oldPrice={item.oldPrice}
                  discount={item.discount}
                  category={item.category}
                  condition={`${item.reviews} reviews`}
                  seller={item.seller}
                  rating={item.rating}
                  reviews={item.reviews}
                  verified={item.verified}
                  badge={item.badge}
                  location={item.location}
                  actionLabel="Buy now"
                  actionLink={`/marketplace/${item.id}`}
                />
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Ending soon</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Auctions closing in under 3 hours</h2>
            <div className="mt-6 space-y-4">
              {endingSoonAuctions.map((item) => (
                <AuctionCard key={item.id} id={item.id} title={item.title} image={item.image} status={item.status} currentBid={item.currentBid} endsIn={item.endsIn} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Recently added</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Fresh premium listings</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-medium text-slate-300 transition hover:text-white">See all new arrivals</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {recentlyAdded.map((item) => (
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
              location={item.location}
              badge={item.badge}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Top categories</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Most searched categories this week</h2>
          </div>
          <Link to="/categories" className="text-sm font-medium text-slate-300 transition hover:text-white">Explore categories</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topCategories.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{item.title}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{item.count}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Verified vendors</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Trusted seller network</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              {verifiedVendors.map((vendor) => (
                <SellerCard key={vendor.name} name={vendor.name} specialty={vendor.specialty} rating={vendor.rating} />
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Trusted marketplace</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Why customers choose Bidzo</h2>
            <div className="mt-6 grid gap-4">
              {trustStatements.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <div className="flex items-center gap-2 text-amber-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="font-semibold text-white">{item.label}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Marketplace statistics</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Trusted performance metrics</h2>
          </div>
          <Link to="/about" className="text-sm font-medium text-slate-300 transition hover:text-white">Learn more</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statsOverview.map((item) => (
            <StatisticCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Testimonials</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Customer and vendor success stories</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {testimonials.map((item) => (
                <ReviewCard key={item.author} quote={item.quote} author={`${item.author} • ${item.role}`} rating={5} />
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-200">Download app</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Stay connected on the go</h2>
            <p className="mt-4 text-sm text-slate-300">Download the Bidzo app to track bids, orders and seller messages in one place.</p>
            <div className="mt-6 grid gap-4">
              {downloadCards.map((card) => (
                <div key={card.platform} className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{card.platform}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{card.label}</p>
                  </div>
                  <button className="rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20">{card.action}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-200">
          <p className="text-sm uppercase tracking-[0.24em] text-blue-300">Newsletter</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Get marketplace alerts and exclusive drops</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400">Subscribe for weekly updates on new auctions, premium product launches, and seller promotions.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <input type="email" placeholder="Your email address" className="w-full max-w-xl rounded-full border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:flex-1" />
            <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500">Subscribe</button>
          </div>
        </div>
      </section>
    </>
  );
}
