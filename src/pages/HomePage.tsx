import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Gavel, Heart, Sparkles } from 'lucide-react';
import { getPortalHome, useAuth } from '../context/AuthContext';
import { useLocaleContext } from '../context/LocaleContext';
import { getHomeData, getHomeDeals, type AuctionResponse, type CategoryResponse, type HomeBannerResponse, type HomeDataResponse, type HomeDealResponse, type HomeReviewResponse, type ProductResponse } from '../api/homeApi';
import { getPublicPromotionalBanners, type PromotionalBanner } from '../api/promotionalBannerApi';
import { getAuctions, type AuctionListItem } from '../api/auctionApi';
import { CategoryIcon } from '../components/categories/CategoryIcon';
import { API_BASE_URL } from '../api/apiClient';
import { ProductCard, ReviewCard } from '../components/cards/MarketplaceCards';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { filterEndingSoonHomeAuctions, filterHomeAuctions, type HomeAuctionStatus } from '../utils/homeAuctions';
import { demoDirectBuyPromotions, demoLiveAuctionPromotions, type HomePromotion } from '../data/homePromotions';
import { useWishlist } from '../context/WishlistContext';
import { showToast } from '../components/ui/toast';
import { StockBadge } from '../components/common/StockBadge';

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

type HomeTestimonial = {
  id: number | string;
  quote?: string;
  author: string;
  rating: number;
  imageUrl?: string;
  title?: string;
  productName?: string;
  productImageUrl?: string;
  createdAt?: string | null;
};

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

function productCategory(product: ProductResponse, categories: CategoryResponse[]): string {
  if (product.categoryName) return product.categoryName;
  const category = categories.find((item) => String(item.id) === String(product.categoryId));
  return category ? category.name : 'Category unavailable';
}

function sellerName(value: ProductResponse | AuctionResponse): string {
  return text(value.vendorName || value.seller, 'Seller unavailable');
}

function TestimonialsCarousel({ testimonials }: { testimonials: HomeTestimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const updateActiveIndex = () => {
      const firstCard = track.firstElementChild as HTMLElement | null;
      if (!firstCard) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0');
      const step = firstCard.offsetWidth + gap;
      if (step > 0) setActiveIndex(Math.max(0, Math.round(track.scrollLeft / step)));
    };
    track.addEventListener('scroll', updateActiveIndex, { passive: true });
    window.addEventListener('resize', updateActiveIndex);
    updateActiveIndex();
    return () => {
      track.removeEventListener('scroll', updateActiveIndex);
      window.removeEventListener('resize', updateActiveIndex);
    };
  }, [testimonials.length]);

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstCard) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0');
    track.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: 'smooth' });
  };

  const pageCount = Math.max(1, testimonials.length);

  return (
    <section aria-labelledby="customer-testimonials-heading" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Community</p>
          <h2 id="customer-testimonials-heading" className="mt-1 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">What Our Customers Say</h2>
        </div>
        {testimonials.length > 1 ? (
          <div className="hidden gap-2 sm:flex">
            <button type="button" aria-label="Previous testimonial" onClick={() => scrollByCard(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Next testimonial" onClick={() => scrollByCard(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      <div ref={trackRef} className="flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300/80 [scrollbar-width:thin]">
        {testimonials.map((review, index) => (
          <div key={`${review.id}-${index}`} className="w-full min-w-0 shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] xl:w-[calc((100%-1.5rem)/3)]">
            <ReviewCard
              quote={review.quote}
              author={review.author}
              rating={review.rating}
              imageUrl={review.imageUrl}
              title={review.title}
              productName={review.productName}
              productImageUrl={review.productImageUrl}
              createdAt={review.createdAt}
            />
          </div>
        ))}
      </div>
      {testimonials.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5" aria-label="Testimonial slides">
          {Array.from({ length: pageCount }, (_, index) => (
            <button key={index} type="button" aria-label={`Go to testimonial ${index + 1}`} aria-current={activeIndex === index ? 'true' : undefined} onClick={() => {
              const track = trackRef.current;
              const card = track?.children[index] as HTMLElement | undefined;
              card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            }} className={`h-1.5 rounded-full transition-all ${activeIndex === index ? 'w-5 bg-sky-500' : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PromotionCarousel({ title, eyebrow, items, kind }: { title: string; eyebrow: string; items: Array<ProductResponse | AuctionResponse>; kind: 'auction' | 'product' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => setActiveIndex((current) => Math.min(current, Math.max(0, items.length - 1))), [items.length]);
  useEffect(() => {
    if (items.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % items.length), 5000);
    return () => window.clearInterval(timer);
  }, [items.length]);
  if (items.length === 0) return <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-5"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2></div><EmptyState title={`No ${kind === 'auction' ? 'live auction' : 'Direct Buy'} promotions right now`} description="Paid and admin-approved promotions will appear here when available." /></section>;
  const item = items[activeIndex];
  const isAuction = kind === 'auction';
  const itemTitle = text(isAuction ? (item as AuctionResponse).productName || (item as AuctionResponse).title : (item as ProductResponse).name, isAuction ? 'Live auction' : 'Direct Buy');
  const promotion = { imageUrl: item.imageUrl || item.image, title: null, subtitle: null };
  const href = isAuction ? `/auctions/${item.id}` : `/product/${item.id}`;
  return <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2></div><Link to={isAuction ? '/auctions' : '/marketplace'} className="text-sm font-semibold text-sky-300">View all</Link></div><div className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-xl sm:min-h-[360px] lg:min-h-[420px]"><img src={imageUrl(promotion.imageUrl || item.imageUrl || item.image)} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/10" /><div className="relative flex min-h-[300px] items-end p-6 sm:min-h-[360px] sm:p-10 lg:min-h-[420px] lg:p-14"><div className="max-w-xl"><span className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">{isAuction ? 'Live auction' : 'Direct Buy'}</span><h3 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{text(promotion.title || itemTitle, itemTitle)}</h3><p className="mt-4 text-base leading-7 text-slate-300">{text(promotion.subtitle || item.description, isAuction ? 'Bid now on a verified live auction.' : 'Shop this promoted direct-buy listing.')}</p><Link to={href} className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white">{isAuction ? 'Watch auction' : 'Shop now'}</Link></div></div>{items.length > 1 ? <><button type="button" aria-label="Previous promotion" onClick={() => setActiveIndex((current) => (current - 1 + items.length) % items.length)} className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/70 text-white"><ChevronLeft className="h-5 w-5" /></button><button type="button" aria-label="Next promotion" onClick={() => setActiveIndex((current) => (current + 1) % items.length)} className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/70 text-white"><ChevronRight className="h-5 w-5" /></button><div className="absolute bottom-5 right-6 flex gap-2">{items.map((entry, index) => <button key={entry.id} type="button" aria-label={`Show promotion ${index + 1}`} onClick={() => setActiveIndex(index)} className={`h-2 rounded-full ${index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />)}</div></> : null}</div></section>;
}

function DemoPromotionCarousel({ items }: { items: HomePromotion[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, items.length - 1)));
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % items.length), 5000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const item = items[activeIndex];
  return <section className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8"><div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-xl shadow-slate-950/20 sm:min-h-[360px] lg:min-h-[420px]"><img src={item.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/10" /><div className="relative flex min-h-[320px] items-end p-6 sm:min-h-[360px] sm:p-10 lg:min-h-[420px] lg:p-14"><div className="max-w-2xl"><span className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">{item.eyebrow}</span><h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">{item.title}</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{item.description}</p><p className="mt-4 text-base font-semibold text-white">{item.priceLabel}</p><Link to={item.href} className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">{item.ctaLabel}</Link></div></div>{items.length > 1 ? <><button type="button" aria-label="Previous promotion" onClick={() => setActiveIndex((current) => (current - 1 + items.length) % items.length)} className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white transition hover:bg-slate-950"><ChevronLeft className="h-5 w-5" /></button><button type="button" aria-label="Next promotion" onClick={() => setActiveIndex((current) => (current + 1) % items.length)} className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white transition hover:bg-slate-950"><ChevronRight className="h-5 w-5" /></button><div className="absolute bottom-5 right-6 flex gap-2">{items.map((entry, index) => <button key={entry.id} type="button" aria-label={`Show promotion ${index + 1}`} onClick={() => setActiveIndex(index)} className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />)}</div></> : null}</div></section>;
}

function DemoPromotionPanel({ title, items, kind }: { title: string; items: HomePromotion[]; kind: 'auction' | 'direct-buy' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const item = items[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % items.length), 5000);
    return () => window.clearInterval(timer);
  }, [items.length]);

    return <section className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 p-3 shadow-xl shadow-slate-950/20 sm:p-4"><div className="flex items-center justify-between gap-3 px-1 pb-4"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Bidzo picks</p><h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2></div><span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">{activeIndex + 1} / {items.length}</span></div><div className="relative flex flex-1 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/70"><div className="relative h-52 shrink-0 overflow-hidden sm:h-60"><img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-700" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" /><span className="absolute bottom-4 left-4 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">{item.eyebrow}</span></div><div className="flex flex-1 flex-col p-5"><h3 className="text-xl font-semibold text-white sm:text-2xl">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>{kind === 'auction' ? <div className="mt-4 grid grid-cols-3 gap-2 text-sm"><div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-500">Current bid</p><p className="mt-1 font-semibold text-white">{item.currentBid}</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-500">Starting bid</p><p className="mt-1 font-semibold text-white">{item.startingBid}</p></div><div className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-500">Remaining</p><p className="mt-1 font-semibold text-amber-200">{item.remainingTime}</p></div></div> : <div className="mt-4 rounded-xl bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Offer price</p><p className="mt-1 text-2xl font-semibold text-white">{item.priceLabel}</p><p className="mt-1 text-sm text-emerald-300">{item.offerText}</p></div>}<Link to={item.href} className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">{item.ctaLabel}</Link></div>{items.length > 1 ? <><button type="button" aria-label={`Previous ${title} promotion`} onClick={() => setActiveIndex((current) => (current - 1 + items.length) % items.length)} className="absolute left-3 top-1/3 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/75 text-white transition hover:bg-slate-950"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label={`Next ${title} promotion`} onClick={() => setActiveIndex((current) => (current + 1) % items.length)} className="absolute right-3 top-1/3 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/75 text-white transition hover:bg-slate-950"><ChevronRight className="h-4 w-4" /></button></> : null}</div><div className="flex justify-center gap-2 pt-4">{items.map((entry, index) => <button key={entry.id} type="button" aria-label={`Show ${title} promotion ${index + 1}`} onClick={() => setActiveIndex(index)} className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-cyan-300' : 'w-2 bg-white/30'}`} />)}</div></section>;
}

function DemoPromotionGrid() {
  return <section className="home-promotions-grid mx-auto grid w-full max-w-7xl gap-5 px-4 py-3 sm:px-6 lg:grid-cols-2 lg:px-8"><DemoPromotionPanel title="Live Auctions" items={demoLiveAuctionPromotions} kind="auction" /><DemoPromotionPanel title="Direct Buy" items={demoDirectBuyPromotions} kind="direct-buy" /></section>;
}

function CategoryPromotionBanner() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const previousTimestampRef = useRef<number | null>(null);
  const firstSetWidthRef = useRef(0);

  useEffect(() => {
    let active = true;
    getPublicPromotionalBanners().then((items) => {
      if (active) setBanners(items.filter((item) => item.active));
    }).catch((reason: unknown) => {
      if (active) setBanners([]);
      console.error('[Bidzo marketplace] promotional banners failed to load', reason);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion || banners.length < 2) return undefined;
    const rail = railRef.current;
    if (!rail) return undefined;

    const speed = 35;
    const measureFirstSet = () => {
      const firstCard = rail.children[0] as HTMLElement | undefined;
      const firstClone = rail.children[banners.length] as HTMLElement | undefined;
      firstSetWidthRef.current = firstCard && firstClone ? firstClone.offsetLeft - firstCard.offsetLeft : 0;
    };
    const pauseForInteraction = () => {
      interactingRef.current = true;
    };
    const resumeAfterInteraction = () => {
      interactingRef.current = false;
      previousTimestampRef.current = performance.now();
    };
    const resumeWhenPointerReleased = (event: PointerEvent) => {
      if (event.buttons === 0) resumeAfterInteraction();
    };
    const resetTimestamp = () => {
      previousTimestampRef.current = performance.now();
    };

    const animate = (time: number) => {
      const previousTime = previousTimestampRef.current ?? time;
      const elapsed = Math.min(time - previousTime, 100);
      previousTimestampRef.current = time;

      if (!document.hidden && !interactingRef.current && firstSetWidthRef.current > 0) {
        rail.scrollLeft += (speed * elapsed) / 1000;
        if (rail.scrollLeft >= firstSetWidthRef.current) rail.scrollLeft -= firstSetWidthRef.current;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    measureFirstSet();
    previousTimestampRef.current = null;
    rail.addEventListener('pointerdown', pauseForInteraction);
    rail.addEventListener('touchstart', pauseForInteraction, { passive: true });
    window.addEventListener('pointerup', resumeAfterInteraction);
    window.addEventListener('pointercancel', resumeAfterInteraction);
    window.addEventListener('pointermove', resumeWhenPointerReleased);
    window.addEventListener('touchend', resumeAfterInteraction);
    window.addEventListener('touchcancel', resumeAfterInteraction);
    window.addEventListener('blur', resumeAfterInteraction);
    window.addEventListener('resize', measureFirstSet);
    document.addEventListener('visibilitychange', resetTimestamp);
    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      previousTimestampRef.current = null;
      rail.removeEventListener('pointerdown', pauseForInteraction);
      rail.removeEventListener('touchstart', pauseForInteraction);
      window.removeEventListener('pointerup', resumeAfterInteraction);
      window.removeEventListener('pointercancel', resumeAfterInteraction);
      window.removeEventListener('pointermove', resumeWhenPointerReleased);
      window.removeEventListener('touchend', resumeAfterInteraction);
      window.removeEventListener('touchcancel', resumeAfterInteraction);
      window.removeEventListener('blur', resumeAfterInteraction);
      window.removeEventListener('resize', measureFirstSet);
      document.removeEventListener('visibilitychange', resetTimestamp);
    };
  }, [banners.length, reducedMotion]);

  if (loading) {
    return <section aria-label="Promotional banners" className="mx-auto w-full max-w-7xl min-w-0 px-4 py-3 sm:px-6 lg:px-8"><div className="flex min-w-0 gap-3 overflow-hidden">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-[200px] w-[min(82vw,360px)] shrink-0 animate-pulse rounded-2xl bg-white/10 sm:w-[300px] lg:w-[calc((100%-1.5rem)/3)]" />)}</div></section>;
  }

  if (banners.length === 0) return null;

  const renderLink = (banner: PromotionalBanner, children: ReactNode, key: string) => {
    const href = banner.buttonLink?.trim() || '/marketplace';
    const cardStyle = { position: 'relative' as const, overflow: 'hidden' as const };
    if (/^https?:\/\//i.test(href)) return <a key={key} href={href} style={cardStyle} className="group flex h-40 w-[min(92vw,600px)] shrink-0 rounded-2xl bg-sky-200 text-slate-950 shadow-lg shadow-slate-950/15 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800 dark:text-white sm:h-44 sm:w-[min(62vw,600px)] lg:w-[calc((100%-1.5rem)/2)] xl:w-[calc((100%-3rem)/3)]">{children}</a>;
    return <Link key={key} to={href} style={cardStyle} className="group flex h-40 w-[min(92vw,600px)] shrink-0 rounded-2xl bg-sky-200 text-slate-950 shadow-lg shadow-slate-950/15 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800 dark:text-white sm:h-44 sm:w-[min(62vw,600px)] lg:w-[calc((100%-1.5rem)/2)] xl:w-[calc((100%-3rem)/3)]">{children}</Link>;
  };

  const renderBanner = (banner: PromotionalBanner, key: string) => renderLink(banner, <><img src={banner.imageUrl} alt={banner.title} style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', margin: 0, padding: 0, objectFit: 'cover', objectPosition: 'center' }} className="transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = 'none'; }} /><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent dark:from-slate-950/80 dark:via-slate-950/45" /><div className="relative z-10 flex h-full w-[62%] flex-col items-start justify-center gap-1.5 p-4 sm:gap-2 sm:p-5"><h2 className="line-clamp-2 text-lg font-bold leading-tight sm:line-clamp-1 sm:text-2xl">{banner.title}</h2>{banner.subtitle ? <p className="line-clamp-2 text-xs font-medium leading-5 text-slate-700 dark:text-slate-200 sm:text-sm">{banner.subtitle}</p> : null}{banner.buttonText?.trim() ? <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-950 shadow-sm transition group-hover:bg-white">{banner.buttonText.trim()} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span> : null}</div></>, key);

  return <section aria-label="Promotional banners" className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden px-4 py-3 sm:px-6 lg:px-8"><div ref={railRef} style={{ scrollBehavior: 'auto' }} className="scrollbar-hidden flex min-w-0 gap-3 overflow-x-auto overflow-y-hidden pb-2">{banners.map((banner, index) => renderBanner(banner, `banner-${banner.id}-${index}`))}{banners.map((banner, index) => renderBanner(banner, `banner-clone-${banner.id}-${index}`))}</div></section>;
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
  return <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">{Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}</div>;
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

  const hasBannerImage = Boolean(!imageFailed && desktopImage);

  return (
    <section className={`home-hero relative overflow-hidden rounded-[28px] text-white transition-opacity duration-500 ${hasBannerImage ? 'home-hero-has-banner' : 'bg-[var(--app-bg)]'} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {hasBannerImage ? <picture aria-hidden="true" className="home-hero-background absolute inset-0 z-0 block"><source media="(max-width: 767px)" srcSet={mobileImage || desktopImage || undefined} /><img src={desktopImage || undefined} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-contain object-center" /></picture> : null}
      <div aria-hidden="true" className="home-hero-overlay pointer-events-none absolute inset-0 z-10" />
      <div className="relative z-20 flex items-center py-5 sm:py-7 lg:py-9 [&>section]:!bg-transparent">{children}</div>
      {visibleBanners.length > 1 ? <>
        <button type="button" aria-label="Previous banner" onClick={() => setActiveIndex((current) => (current - 1 + visibleBanners.length) % visibleBanners.length)} className="absolute left-4 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white transition hover:bg-slate-950/85"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" aria-label="Next banner" onClick={() => setActiveIndex((current) => (current + 1) % visibleBanners.length)} className="absolute right-4 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white transition hover:bg-slate-950/85"><ChevronRight className="h-4 w-4" /></button>
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

function ProductSection({ title, products, categories, emptyTitle, emptyDescription }: { title: string; products: ProductResponse[]; categories: CategoryResponse[]; emptyTitle: string; emptyDescription: string }) {
  const visibleProducts = products.filter((product) => product.sellingType !== 'AUCTION');
  return (
    <section className={`mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 ${title === 'Featured products' ? 'featured-products-section' : ''}`}>
      <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Bidzo marketplace</p><h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2></div><Link to="/marketplace" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/80">Browse Marketplace</Link></div>
        {visibleProducts.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product.id} id={product.id} title={text(product.name, 'Product')} description={text(product.description, 'Product details unavailable')} image={imageUrl(product.imageUrl || product.image || product.images?.[0])} price={numberText(product.price)} category={productCategory(product, categories)} condition={text(product.condition, '')} seller={sellerName(product)} rating={product.rating ?? undefined} reviews={product.reviewCount ?? product.reviews ?? undefined} verified={product.verified} createdAt={product.createdAt} badge="Direct Buy" actionLabel="View Product" actionLink={`/product/${product.id}`} wishlistItemType="PRODUCT" wishlistProductId={Number(product.id)} availableQuantity={product.availableQuantity} showSellerMeta compact={title === 'Recently added'} />)}</div>}
    </section>
  );
}

function dealCountdown(offerEndsAt: string, now: number): string {
  const totalSeconds = Math.max(0, Math.floor((new Date(offerEndsAt).getTime() - now) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
}

function DealCard({ deal }: { deal: HomeDealResponse }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getItem, isPending, toggle } = useWishlist();
  const wishlistParams = { itemType: 'PRODUCT' as const, productId: Number(deal.id) };
  const wishlisted = Boolean(getItem(wishlistParams));
  const pending = isPending(wishlistParams);
  const toggleWishlist = async (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user || (user.type !== 'customer' && user.role !== 'CUSTOMER')) { navigate('/login'); return; }
    try { await toggle(wishlistParams); showToast(wishlisted ? 'Removed from favourites' : 'Added to favourites', '', wishlisted ? 'info' : 'success'); }
    catch (reason) { showToast('Unable to update favourites', reason instanceof Error ? reason.message : 'Please try again.', 'warning'); }
  };
  return <article className="relative h-[120px] w-[260px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_6px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:shadow-black/20 sm:w-[268px] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/5)]"><Link to={`/product/${deal.id}`} className="flex h-full min-w-0 items-stretch"><div className="flex h-full w-[132px] shrink-0 items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950/60"><img src={deal.imageUrl || '/logo.png'} alt={deal.name} className="h-full w-full object-contain p-1" loading="lazy" /></div><div className="min-w-0 flex-1 p-2 pr-8"><span className="inline-flex max-w-full rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{deal.discountType === 'PERCENTAGE' ? `${deal.discountValue}% OFF` : `₹${deal.discountValue} OFF`}</span><h3 className="mt-0.5 truncate text-[11px] font-semibold leading-4 text-slate-900 dark:text-white">{deal.name}</h3><p className="truncate text-[9px] text-slate-500 dark:text-slate-400">{deal.categoryName || 'Category unavailable'}</p><div className="mt-1 flex min-w-0 items-baseline gap-1"><span className="shrink-0 text-sm font-bold text-red-500">₹{Number(deal.discountedPrice).toLocaleString('en-IN')}</span><span className="truncate text-[9px] text-slate-400 line-through">₹{Number(deal.price).toLocaleString('en-IN')}</span></div><div className="mt-0.5 flex flex-col items-start gap-0.5"><StockBadge availableQuantity={deal.availableQuantity} className="text-[9px]" /><span className="text-[9px] font-medium text-slate-400">Ends {dealCountdown(deal.offerEndsAt, Date.now())}</span></div></div></Link><button type="button" aria-label={`Add ${deal.name} to wishlist`} disabled={pending} onClick={(event) => void toggleWishlist(event)} className={`absolute right-1.5 top-1.5 !h-7 !min-h-7 !w-7 !min-w-7 rounded-full bg-white/95 !p-0 text-slate-700 shadow-sm transition hover:text-red-500 disabled:opacity-50 dark:bg-slate-800/95 dark:text-slate-200 ${wishlisted ? 'text-red-500' : ''}`}><Heart className="h-3.5 w-3.5" /></button></article>;
}

function DealsOfTheDay({ reducedMotion }: { reducedMotion: boolean }) {
  const [deals, setDeals] = useState<HomeDealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const railRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const loopWidthRef = useRef(0);
  const refreshedRef = useRef(new Set<string>());
  const uniqueDeals = useMemo(() => deals.filter((deal, index, self) => index === self.findIndex((item) => item.id === deal.id)), [deals]);

  const loadDeals = async () => {
    try { setDeals(await getHomeDeals(12)); } catch (reason) { console.error('[Bidzo marketplace] home deals failed to load', reason); setDeals([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadDeals(); }, []);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    const expired = deals.filter((deal) => new Date(deal.offerEndsAt).getTime() <= now && !refreshedRef.current.has(String(deal.id)));
    if (!expired.length) return;
    expired.forEach((deal) => refreshedRef.current.add(String(deal.id)));
    void loadDeals();
  }, [deals, now]);
  useEffect(() => {
    if (reducedMotion || uniqueDeals.length < 2) return undefined;
    const rail = railRef.current;
    if (!rail) return undefined;
    const measure = () => { loopWidthRef.current = rail.scrollWidth - rail.clientWidth; };
    const pause = () => { interactingRef.current = true; };
    const resume = () => { interactingRef.current = false; previousTimeRef.current = performance.now(); };
    const animate = (time: number) => { const previous = previousTimeRef.current ?? time; previousTimeRef.current = time; if (!document.hidden && !interactingRef.current && loopWidthRef.current > 0) { rail.scrollLeft += (24 * Math.min(time - previous, 100)) / 1000; if (rail.scrollLeft >= loopWidthRef.current) rail.scrollLeft -= loopWidthRef.current; } frameRef.current = window.requestAnimationFrame(animate); };
    measure(); rail.addEventListener('pointerdown', pause); rail.addEventListener('touchstart', pause, { passive: true }); window.addEventListener('pointerup', resume); window.addEventListener('pointercancel', resume); window.addEventListener('touchend', resume); window.addEventListener('touchcancel', resume); window.addEventListener('resize', measure); frameRef.current = window.requestAnimationFrame(animate);
    return () => { if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current); rail.removeEventListener('pointerdown', pause); rail.removeEventListener('touchstart', pause); window.removeEventListener('pointerup', resume); window.removeEventListener('pointercancel', resume); window.removeEventListener('touchend', resume); window.removeEventListener('touchcancel', resume); window.removeEventListener('resize', measure); };
  }, [uniqueDeals.length, reducedMotion]);

  if (loading) return <section className="mx-auto max-w-7xl rounded-2xl bg-white px-4 py-5 dark:bg-slate-950 sm:px-6 lg:px-8"><div className="mb-3 h-7 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /><div className="flex gap-3 overflow-hidden">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-60 w-[188px] shrink-0 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div></section>;
  const visibleDeals = uniqueDeals.filter((deal) => new Date(deal.offerEndsAt).getTime() > now);
  if (!visibleDeals.length) return <section className="mx-auto w-full max-w-7xl rounded-2xl bg-white px-4 py-5 dark:bg-slate-950 sm:px-6 lg:px-8"><div className="flex items-center gap-2"><span className="text-[25px] leading-none" aria-hidden="true">🔥</span><h2 className="text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Deals of the Day</h2></div><p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">No deals available right now</p></section>;
  const nearestEnd = visibleDeals.reduce((nearest, deal) => new Date(deal.offerEndsAt).getTime() < new Date(nearest.offerEndsAt).getTime() ? deal : nearest, visibleDeals[0]);
  return <section className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden rounded-2xl bg-white px-4 py-5 dark:bg-slate-950 sm:px-6 lg:px-8"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="text-[25px] leading-none" aria-hidden="true">🔥</span><h2 className="text-xl font-bold tracking-[-0.02em] text-slate-950 dark:text-white sm:text-2xl">Deals of the Day</h2></div><div className="flex items-center gap-3"><p className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 dark:bg-red-500/10 dark:text-red-300 sm:text-sm"><Clock3 className="h-4 w-4" /> Ends in {dealCountdown(nearestEnd.offerEndsAt, now)}</p><Link to="/marketplace" className="hidden items-center gap-1 text-sm font-semibold text-sky-500 transition hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200 sm:inline-flex">View All Deals <ChevronRight className="h-4 w-4" /></Link></div></div><div ref={railRef} className="scrollbar-hidden flex min-w-0 gap-3 overflow-x-auto overflow-y-hidden pb-1" style={{ scrollBehavior: 'auto' }}>{visibleDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)}</div><Link to="/marketplace" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-500 dark:text-sky-300 sm:hidden">View All Deals <ChevronRight className="h-3.5 w-3.5" /></Link></section>;
}

export function HomePage() {
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const [homeData, setHomeData] = useState<HomeDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (authReady && user && user.type !== 'customer') navigate(getPortalHome(user), { replace: true });
  }, [authReady, navigate, user]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [data, auctionItems] = await Promise.all([getHomeData(), getAuctions()]);
      const homeAuctions = auctionItems.map(toHomeAuction);
      setHomeData({
        ...data,
        liveAuctions: data.liveAuctions?.length ? data.liveAuctions : homeAuctions,
        upcomingAuctions: data.upcomingAuctions?.length ? data.upcomingAuctions : homeAuctions,
        endingSoonAuctions: data.endingSoonAuctions?.length ? data.endingSoonAuctions : homeAuctions,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load marketplace data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.('change', updatePreference);
    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, []);

  const testimonials = useMemo(() => {
    const source = Array.isArray(homeData?.testimonials) ? homeData.testimonials : [];

    return source.map((review: HomeReviewResponse, index: number) => {
      const title = text(review.title, '');
      const content = [review.message, review.comment, review.content, review.quote]
        .filter((entry) => entry && String(entry).trim())
        .join(' ')
        .trim();

      const rating = Number(review.rating ?? 0);

      return {
        id: review.id ?? `${review.customerName ?? review.author ?? 'testimonial'}-${index}`,
        title: title || undefined,
        quote: content || undefined,
        author: text(review.customerName || review.author, 'Verified buyer'),
        rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : 5,
        imageUrl: review.imageUrl || undefined,
        productName: text(review.productName || review.product?.name, ''),
        productImageUrl: review.productImageUrl || review.product?.imageUrl || undefined,
        createdAt: review.createdAt || null,
      };
    });
  }, [homeData?.testimonials]);

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
  const categories = homeData.categories ?? [];
  return <><CategoryPromotionBanner /><div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8"><HomeBanner banners={homeData.banners ?? []}>
    <section className="relative overflow-hidden bg-[var(--app-bg)] text-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"><div className="max-w-4xl space-y-8"><div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10"><Sparkles className="h-4 w-4 text-amber-300" /> Trusted auctions and verified sellers</div><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"><span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300 bg-clip-text text-transparent">Buy with confidence.</span> Bid on what matters.</h1><p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">Search real marketplace inventory, discover live auctions, and connect with verified sellers.</p><div className="flex flex-wrap gap-3"><Link to="/auctions" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Browse Live Auctions</Link><Link to="/marketplace" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-orange-600">Browse Marketplace</Link></div>{stats ? <div className="grid gap-4 sm:grid-cols-3">{[['Live auctions', stats.liveAuctions], ['Products', stats.totalProducts], ['Verified sellers', stats.totalVendors]].map(([label, value]) => value !== null && value !== undefined ? <div key={String(label)} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p></div> : null)}</div> : null}</div></div></section>
    </HomeBanner></div>
    <section aria-label="All Categories" className="mx-auto w-full max-w-7xl rounded-2xl bg-white/90 px-4 py-5 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-950/90 dark:ring-white/10 sm:px-6 lg:px-8"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">Explore</p><h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">Shop by Category</h2></div><Link to="/categories" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-sky-500 transition hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200">View All Categories <ChevronRight className="h-4 w-4" /></Link></div>{categories.length === 0 ? <EmptyState title="No categories available" description="Categories will appear here when available." /> : <div className="scrollbar-hidden flex snap-x gap-3 overflow-x-auto pb-1">{categories.map((category) => <button type="button" key={category.id} onClick={() => navigate(`/marketplace?categoryId=${encodeURIComponent(String(category.id))}`)} className="flex h-[142px] w-[116px] shrink-0 snap-start flex-col items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:shadow-black/20 sm:w-[124px]"><span className="flex h-[92px] w-full items-center justify-center rounded-lg bg-slate-50 text-sky-600 dark:bg-slate-800 dark:text-sky-300"><CategoryIcon iconUrl={category.iconUrl} className="h-16 w-16" /></span><span className="line-clamp-2 w-full text-xs font-semibold leading-4 text-slate-800 dark:text-slate-200">{category.name}</span></button>)}</div>}</section>
    <DealsOfTheDay reducedMotion={reducedMotion} />
    <ProductSection title="Featured products" products={featured} categories={categories} emptyTitle="No featured products yet" emptyDescription="Featured products will appear here when available." />
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Live now</p><h2 className="mt-2 text-2xl font-semibold text-white">Live auctions</h2></div><Link to="/auctions" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/80">Browse Auctions</Link></div>{liveAuctions.length === 0 ? <EmptyState title="No live auctions right now" description="Check back soon for new auctions." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{liveAuctions.map((auction) => <AuctionTile key={auction.id} auction={auction} status="RUNNING" />)}</div>}</section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Coming up</p><h2 className="mt-2 text-2xl font-semibold text-white">Scheduled auctions</h2></div>{scheduledAuctions.length === 0 ? <EmptyState title="No scheduled auctions" description="There are no upcoming auctions right now." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{scheduledAuctions.map((auction) => <AuctionTile key={auction.id} auction={auction} status="SCHEDULED" />)}</div>}</section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Act soon</p><h2 className="mt-2 text-2xl font-semibold text-white">Ending soon</h2></div>{endingSoon.length === 0 ? <EmptyState title="No auctions ending soon" description="There are no ending-soon auctions right now." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{endingSoon.map((auction) => <AuctionTile key={auction.id} auction={auction} status="RUNNING" />)}</div>}</section>
    <ProductSection title="Recently added" products={recent} categories={categories} emptyTitle="No recently added products" emptyDescription="New products will appear here when available." />
    <ProductSection title="Popular products" products={popular} categories={categories} emptyTitle="No popular products yet" emptyDescription="Popularity information will appear here when available." />
    {testimonials.length > 0 ? <TestimonialsCarousel testimonials={testimonials} /> : null}
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Trusted sellers</p><h2 className="mt-2 text-2xl font-semibold text-white">Verified sellers</h2></div>{sellers.length === 0 ? <EmptyState title="No verified sellers available" description="Verified sellers will appear here when available." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{sellers.map((seller, index) => { const name = text(seller.name || seller.vendorName || seller.storeName, 'Seller unavailable'); const sellerId = seller.id || seller.vendorId; return <Link key={String(sellerId || index)} to={sellerId ? `/seller/${sellerId}` : '/marketplace'} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 transition hover:border-emerald-400/40"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-white">{name}</p>{seller.productCount !== undefined && seller.productCount !== null ? <p className="mt-1 text-sm text-slate-400">{String(seller.productCount)} products</p> : null}</div><CheckCircle2 className="h-5 w-5 text-emerald-300" /></div></Link>; })}</div>}</section>
  </>;
}
