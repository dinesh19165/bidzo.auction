import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Gavel, Heart, Sparkles } from 'lucide-react';
import { getPortalHome, useAuth } from '../context/AuthContext';
import { useLocaleContext } from '../context/LocaleContext';
import { getCategoryPromotionAdvertisements, getHomeBannerAdvertisements, getProductPromotionAdvertisements, type PublicAdvertisementResponse } from '../api/advertisementApi';
import { getHomeData, getHomeDeals, type AuctionResponse, type CategoryResponse, type HomeBannerResponse, type HomeDataResponse, type HomeDealResponse, type HomeReviewResponse, type ProductResponse } from '../api/homeApi';
import { getPublicSellers, type PublicSeller } from '../api/sellerApi';
import { getPublicPromotionalBanners, type PromotionalBanner } from '../api/promotionalBannerApi';
import { getAuctions, type AuctionListItem } from '../api/auctionApi';
import { CategoryIcon } from '../components/categories/CategoryIcon';
import { API_BASE_URL } from '../api/apiClient';
import { ProductCard, ReviewCard } from '../components/cards/MarketplaceCards';
import { EmptyState, ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { filterEndingSoonHomeAuctions, filterHomeAuctions, type HomeAuctionStatus } from '../utils/homeAuctions';
import { useWishlist } from '../context/WishlistContext';
import { showToast } from '../components/ui/toast';
import { StockBadge } from '../components/common/StockBadge';
import { useCustomerLocation } from '../utils/customerLocation';
import { OfferPrice } from '../components/common/OfferPrice';
import { getActiveProductOffers } from '../services/productOfferService';

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

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    const firstCard = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstCard) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0');
    track.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="customer-testimonials-heading" className="homepage-theme-section mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Community</p>
          <h2 id="customer-testimonials-heading" className="mt-1 text-xl font-bold sm:text-2xl">What Our Customers Say</h2>
        </div>
        <span aria-hidden="true" />
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
        <div className="mt-2 flex items-center" aria-label="Testimonial navigation">
          <div className="flex gap-2">
            <button type="button" aria-label="Previous testimonial" onClick={() => scrollByCard(-1)} className="homepage-theme-control inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" aria-label="Next testimonial" onClick={() => scrollByCard(1)} className="homepage-theme-control inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300"><ChevronRight className="h-4 w-4" /></button>
          </div>
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

type HomePromotion = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  eyebrow: string;
  priceLabel: string;
  ctaLabel: string;
  href: string;
  currentBid?: string;
  startingBid?: string;
  remainingTime?: string;
  offerText?: string;
};

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
  return null;
}

function CategoryPromotionBanner({ categoryIds, productIds }: { categoryIds: Array<CategoryResponse['id']>; productIds: Array<ProductResponse['id']> }) {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [advertisements, setAdvertisements] = useState<PublicAdvertisementResponse[]>([]);
  const [productAdvertisements, setProductAdvertisements] = useState<PublicAdvertisementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const previousTimestampRef = useRef<number | null>(null);
  const firstSetWidthRef = useRef(0);
  const isHoveredRef = useRef(false);

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
    const uniqueCategoryIds = [...new Set(categoryIds.map(String))];
    if (uniqueCategoryIds.length === 0) {
      setAdvertisements([]);
      return undefined;
    }

    let active = true;
    setAdvertisements([]);
    const loadCategoryAdvertisements = async () => {
      try {
        const results = await Promise.all(uniqueCategoryIds.map((categoryId) => getCategoryPromotionAdvertisements(categoryId).catch(() => [])));
        if (active) {
          const unique = new Map<number, PublicAdvertisementResponse>();
          results.flat().filter(isCategoryAdvertisement).forEach((advertisement) => unique.set(advertisement.id, advertisement));
          setAdvertisements([...unique.values()]);
        }
      } catch {
        if (active) setAdvertisements([]);
      }
    };

    void loadCategoryAdvertisements();
    const timer = window.setInterval(() => void loadCategoryAdvertisements(), 5 * 60 * 1000);
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void loadCategoryAdvertisements(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [categoryIds.map(String).sort().join(',')]);

  useEffect(() => {
    const uniqueProductIds = [...new Set(productIds.map(String))];
    if (uniqueProductIds.length === 0) {
      setProductAdvertisements([]);
      return undefined;
    }

    let active = true;
    setProductAdvertisements([]);
    const loadProductAdvertisements = async () => {
      const results = await Promise.all(uniqueProductIds.map((productId) => getProductPromotionAdvertisements(productId).catch(() => [])));
      if (active) {
        const unique = new Map<number, PublicAdvertisementResponse>();
        results.flat().filter(isProductAdvertisement).forEach((advertisement) => unique.set(advertisement.id, advertisement));
        setProductAdvertisements([...unique.values()]);
      }
    };

    void loadProductAdvertisements();
    const timer = window.setInterval(() => void loadProductAdvertisements(), 5 * 60 * 1000);
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void loadProductAdvertisements(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [productIds.map(String).sort().join(',')]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion || banners.length + advertisements.length + productAdvertisements.length < 2) return undefined;
    const rail = railRef.current;
    if (!rail) return undefined;

    const cycleDurationSeconds = 40;
    const measureFirstSet = () => {
      const firstCard = rail.children[0] as HTMLElement | undefined;
      const firstClone = rail.children[rail.children.length / 2] as HTMLElement | undefined;
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
    const pauseOnHover = () => {
      isHoveredRef.current = true;
    };
    const resumeAfterHover = () => {
      isHoveredRef.current = false;
      previousTimestampRef.current = performance.now();
    };

    const animate = (time: number) => {
      const previousTime = previousTimestampRef.current ?? time;
      const elapsed = Math.min(time - previousTime, 100);
      previousTimestampRef.current = time;

      if (!document.hidden && !interactingRef.current && !isHoveredRef.current && firstSetWidthRef.current > 0) {
        const speed = firstSetWidthRef.current / cycleDurationSeconds;
        rail.scrollLeft += (speed * elapsed) / 1000;
        if (rail.scrollLeft >= firstSetWidthRef.current) rail.scrollLeft -= firstSetWidthRef.current;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    measureFirstSet();
    previousTimestampRef.current = null;
    rail.addEventListener('pointerdown', pauseForInteraction);
    rail.addEventListener('touchstart', pauseForInteraction, { passive: true });
    rail.addEventListener('pointerenter', pauseOnHover);
    rail.addEventListener('pointerleave', resumeAfterHover);
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
      rail.removeEventListener('pointerenter', pauseOnHover);
      rail.removeEventListener('pointerleave', resumeAfterHover);
      window.removeEventListener('pointerup', resumeAfterInteraction);
      window.removeEventListener('pointercancel', resumeAfterInteraction);
      window.removeEventListener('pointermove', resumeWhenPointerReleased);
      window.removeEventListener('touchend', resumeAfterInteraction);
      window.removeEventListener('touchcancel', resumeAfterInteraction);
      window.removeEventListener('blur', resumeAfterInteraction);
      window.removeEventListener('resize', measureFirstSet);
      document.removeEventListener('visibilitychange', resetTimestamp);
    };
  }, [banners.length, advertisements.length, productAdvertisements.length, reducedMotion]);

  if (loading) {
    return <section aria-label="Promotional banners" className="mx-auto w-full max-w-7xl min-w-0 px-4 py-3 sm:px-6 lg:px-8"><div className="flex min-w-0 gap-3 overflow-hidden">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="aspect-[3/1] w-[min(82vw,360px)] shrink-0 animate-pulse rounded-2xl bg-white/10 sm:w-[300px] lg:w-[calc((100%-1.5rem)/3)]" />)}</div></section>;
  }

  const promotionItems = [
    ...banners.map((banner) => ({ id: `banner-${banner.id}`, title: banner.title, description: banner.subtitle, imageUrl: banner.imageUrl, targetUrl: banner.buttonLink, buttonText: banner.buttonText, isAdvertisement: false })),
    ...advertisements.map((advertisement) => ({ id: `advertisement-${advertisement.id}`, title: advertisement.title || 'Category promotion', description: advertisement.description, imageUrl: advertisement.bannerImageUrl, targetUrl: advertisement.targetUrl, buttonText: undefined, isAdvertisement: true })),
    ...productAdvertisements.map((advertisement) => {
      const product = advertisement.product && typeof advertisement.product === 'object' ? advertisement.product as Record<string, unknown> : undefined;
      const category = advertisement.category && typeof advertisement.category === 'object' ? advertisement.category as Record<string, unknown> : undefined;
      const relatedName = String(product?.name ?? category?.name ?? '').trim();
      return {
        id: `advertisement-${advertisement.id}`,
        title: advertisement.title || relatedName || 'Product promotion',
        description: advertisement.description || (relatedName && relatedName !== advertisement.title ? relatedName : undefined),
        imageUrl: advertisement.bannerImageUrl,
        targetUrl: advertisement.targetUrl,
        buttonText: undefined,
        isAdvertisement: true,
      };
    }),
  ];

  if (promotionItems.length === 0) return null;

  const renderBanner = (banner: (typeof promotionItems)[number], key: string) => (
    <AdvertisementTarget key={key} targetUrl={banner.targetUrl || (!banner.isAdvertisement ? '/marketplace' : undefined)} label={[banner.title, banner.description].filter(Boolean).join('. ') || 'Promotion'} className="group relative flex aspect-[3/1] w-[min(92vw,600px)] shrink-0 overflow-hidden rounded-2xl bg-sky-200 text-slate-950 shadow-lg shadow-slate-950/15 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800 dark:text-white sm:w-[min(62vw,600px)] lg:w-[calc((100%-1.5rem)/2)] xl:w-[calc((100%-3rem)/3)]">
      {banner.imageUrl ? <img src={banner.imageUrl} alt={banner.title || 'Promotion'} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-contain transition duration-500" /> : null}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent dark:from-slate-950/80 dark:via-slate-950/45" />
      <div className="relative z-10 flex h-full w-[62%] flex-col items-start justify-center gap-1.5 p-4 sm:gap-2 sm:p-5"><h2 className="line-clamp-2 text-lg font-bold leading-tight sm:line-clamp-1 sm:text-2xl">{banner.title}</h2>{banner.description ? <p className="line-clamp-2 text-xs font-medium leading-5 text-slate-700 dark:text-slate-200 sm:text-sm">{banner.description}</p> : null}{banner.buttonText?.trim() ? <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-950 shadow-sm transition group-hover:bg-white">{banner.buttonText.trim()} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span> : null}</div>
    </AdvertisementTarget>
  );

  return <section aria-label="Promotional banners" className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden px-4 py-3 sm:px-6 lg:px-8"><div ref={railRef} style={{ scrollBehavior: 'auto' }} className="scrollbar-hidden flex min-w-0 gap-3 overflow-x-auto overflow-y-hidden pb-2">{promotionItems.map((banner, index) => renderBanner(banner, `${banner.id}-${index}`))}{promotionItems.map((banner, index) => renderBanner(banner, `clone-${banner.id}-${index}`))}</div></section>;
}

function advertisementPlacements(advertisement: PublicAdvertisementResponse): string[] {
  return [advertisement.advertisementType, advertisement.placement]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim().toUpperCase().replace(/[\s-]+/g, '_'));
}

function isCategoryAdvertisement(advertisement: PublicAdvertisementResponse): boolean {
  return advertisementPlacements(advertisement).includes('CATEGORY_BANNER');
}

function isProductAdvertisement(advertisement: PublicAdvertisementResponse): boolean {
  return advertisementPlacements(advertisement).includes('PRODUCT_PROMOTION');
}

function AdvertisementTarget({ targetUrl, label, className, children }: { targetUrl?: string; label: string; className: string; children: ReactNode }) {
  const href = targetUrl?.trim();
  if (!href) return <div className={className}>{children}</div>;
  if (/^(https?:)?\/\//i.test(href)) return <a href={href} aria-label={label} className={className}>{children}</a>;
  return <Link to={href} aria-label={label} className={className}>{children}</Link>;
}

function CategoryAdvertisementRail({ categoryId }: { categoryId: CategoryResponse['id'] | null }) {
  const [advertisements, setAdvertisements] = useState<PublicAdvertisementResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId === null) {
      setAdvertisements([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const items = await getCategoryPromotionAdvertisements(categoryId);
        if (active) setAdvertisements(items.filter(isCategoryAdvertisement));
      } catch {
        if (active) setAdvertisements([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 5 * 60 * 1000);
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void load(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [categoryId]);

  if (categoryId === null || (!loading && advertisements.length === 0)) return null;
  if (loading && advertisements.length === 0) return <section aria-label="Category promotions" className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8"><div className="aspect-[3/1] w-full animate-pulse rounded-2xl bg-white/10" /></section>;

  const renderAd = (advertisement: PublicAdvertisementResponse, key: string) => (
    <AdvertisementTarget key={key} targetUrl={advertisement.targetUrl} label={advertisement.title || 'Category promotion'} className="group relative flex aspect-[3/1] w-[min(92vw,600px)] shrink-0 overflow-hidden rounded-2xl bg-sky-200 text-slate-950 shadow-lg shadow-slate-950/15 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800 dark:text-white sm:w-[min(62vw,600px)] lg:w-[calc((100%-1.5rem)/2)] xl:w-[calc((100%-3rem)/3)]">
      {advertisement.bannerImageUrl ? <img src={advertisement.bannerImageUrl} alt={advertisement.title || 'Category promotion'} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-contain object-center transition duration-500" /> : null}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent dark:from-slate-950/80 dark:via-slate-950/45" />
      <div className="relative z-10 flex h-full w-[62%] flex-col items-start justify-center gap-1.5 p-4 sm:gap-2 sm:p-5"><h2 className="line-clamp-2 text-lg font-bold leading-tight sm:line-clamp-1 sm:text-2xl">{advertisement.title || 'Category promotion'}</h2>{advertisement.description ? <p className="line-clamp-2 text-xs font-medium leading-5 text-slate-700 dark:text-slate-200 sm:text-sm">{advertisement.description}</p> : null}</div>
    </AdvertisementTarget>
  );

  return <section aria-label="Category promotions" className="mx-auto w-full max-w-7xl min-w-0 overflow-hidden px-4 py-3 sm:px-6 lg:px-8"><div className="scrollbar-hidden flex min-w-0 gap-3 overflow-x-auto overflow-y-hidden pb-2">{advertisements.map((advertisement) => renderAd(advertisement, `category-ad-${advertisement.id}`))}</div></section>;
}

function ProductAdvertisementRail({ productIds }: { productIds: Array<ProductResponse['id']> }) {
  const [advertisements, setAdvertisements] = useState<PublicAdvertisementResponse[]>([]);
  const requestKey = [...new Set(productIds.map(String))].sort().join(',');

  useEffect(() => {
    if (!requestKey) {
      setAdvertisements([]);
      return undefined;
    }

    let active = true;
    const ids = requestKey.split(',');
    const load = async () => {
      try {
        const results = await Promise.all(ids.map((productId) => getProductPromotionAdvertisements(productId).catch(() => [])));
        if (active) {
          const unique = new Map<number, PublicAdvertisementResponse>();
          results.flat().filter(isProductAdvertisement).forEach((advertisement) => unique.set(advertisement.id, advertisement));
          setAdvertisements([...unique.values()]);
        }
      } catch {
        if (active) setAdvertisements([]);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 5 * 60 * 1000);
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void load(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [requestKey]);

  if (advertisements.length === 0) return null;
  return <div aria-label="Product promotions" className="scrollbar-hidden -mx-1 flex min-w-0 gap-3 overflow-x-auto px-1 pb-1">{advertisements.map((advertisement) => <AdvertisementTarget key={advertisement.id} targetUrl={advertisement.targetUrl} label={advertisement.title || 'Product promotion'} className="relative flex h-28 w-[min(82vw,360px)] shrink-0 items-end overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4 text-white shadow-lg sm:w-[360px]">{advertisement.bannerImageUrl ? <img src={advertisement.bannerImageUrl} alt={advertisement.title || 'Product promotion'} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-contain" /> : null}<span className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" /><span className="relative z-10 line-clamp-2 font-semibold">{advertisement.title || advertisement.description || 'Product promotion'}</span></AdvertisementTarget>)}</div>;
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

function isUsableAuctionImage(value?: string | null): boolean {
  const normalized = value?.trim().toLowerCase() || '';
  return Boolean(normalized) && !normalized.endsWith('/logo.png') && !normalized.includes('logo.png');
}

function mergeHomeAuctionImages(auctions: AuctionResponse[], enrichedAuctions: AuctionResponse[]): AuctionResponse[] {
  const enrichedById = new Map(enrichedAuctions.map((auction) => [String(auction.id), auction]));
  return auctions.map((auction) => {
    if (isUsableAuctionImage(auction.image) || isUsableAuctionImage(auction.imageUrl)) return auction;
    const enriched = enrichedById.get(String(auction.id));
    return enriched?.image ? { ...auction, image: enriched.image, imageUrl: enriched.imageUrl } : auction;
  });
}

function HomeSkeleton() {
  return <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">{Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}</div>;
}

function HomeBanner({ advertisements, banners, children }: { advertisements: PublicAdvertisementResponse[]; banners: HomeBannerResponse[]; children: ReactNode }) {
  const slides = [
    ...banners.map((banner) => ({
      id: banner.id,
      imageUrl: mediaUrl(banner.imageUrl) || undefined,
      mobileImageUrl: mediaUrl(banner.mobileImageUrl) || undefined,
      title: banner.title,
      description: banner.subtitle,
      targetUrl: banner.buttonLink,
      isAdvertisement: false,
    })),
    ...advertisements.map((advertisement) => ({
      id: advertisement.id,
      imageUrl: advertisement.bannerImageUrl,
      mobileImageUrl: advertisement.mobileBannerImageUrl,
      title: advertisement.title,
      description: advertisement.description,
      targetUrl: advertisement.targetUrl,
      isAdvertisement: true,
    })),
  ];
  const uniqueSlides = slides.filter((slide, index, allSlides) => {
    const image = slide.imageUrl?.trim().toLowerCase() ?? '';
    const title = slide.title?.trim().toLowerCase() ?? '';
    const description = slide.description?.trim().toLowerCase() ?? '';
    const target = slide.targetUrl?.trim().toLowerCase() ?? '';
    const identity = image || title || description || target
      ? `${image}|${title}|${description}|${target}`
      : String(slide.id);
    return allSlides.findIndex((candidate) => {
      const candidateImage = candidate.imageUrl?.trim().toLowerCase() ?? '';
      const candidateTitle = candidate.title?.trim().toLowerCase() ?? '';
      const candidateDescription = candidate.description?.trim().toLowerCase() ?? '';
      const candidateTarget = candidate.targetUrl?.trim().toLowerCase() ?? '';
      const candidateIdentity = candidateImage || candidateTitle || candidateDescription || candidateTarget
        ? `${candidateImage}|${candidateTitle}|${candidateDescription}|${candidateTarget}`
        : String(candidate.id);
      return candidateIdentity === identity;
    }) === index;
  });
  const orderedBanners = useMemo(
    () => uniqueSlides,
    [uniqueSlides],
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
  const desktopImage = banner?.imageUrl || null;
  const mobileImage = banner?.mobileImageUrl || desktopImage;
  const hasMobileImage = Boolean(banner?.mobileImageUrl?.trim());
  useEffect(() => setImageFailed(false), [banner?.id, desktopImage, mobileImage]);
  useEffect(() => {
    setIsVisible(false);
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [banner?.id]);

  const hasBannerImage = Boolean(!imageFailed && desktopImage);
  return (
    <section className={`home-hero relative overflow-hidden rounded-[28px] text-white transition-opacity duration-500 ${hasBannerImage ? 'home-hero-has-banner' : 'bg-[var(--app-bg)]'} ${hasMobileImage ? 'home-hero-has-mobile-banner' : ''} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {hasBannerImage ? <picture aria-hidden="true" className="home-hero-background absolute inset-0 z-0 block"><source media="(max-width: 767px)" srcSet={mobileImage || desktopImage || undefined} /><img src={desktopImage || undefined} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-contain object-center" /></picture> : null}
      {banner?.isAdvertisement && banner.targetUrl ? <AdvertisementTarget targetUrl={banner.targetUrl} label={[banner.title, banner.description].filter(Boolean).join('. ') || 'Advertisement'} className="absolute inset-0 z-[5]" ><span className="sr-only">{banner.title || 'Advertisement'}</span></AdvertisementTarget> : null}
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
    <Link to={`/auctions/${auction.id}`} aria-label={`View ${status === 'RUNNING' ? 'live' : 'scheduled'} auction: ${title}`} className="home-auction-card group block overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 p-3 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-blue-400/40">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-950/60">
        <img src={imageUrl(auction.imageUrl || auction.image)} alt={title} className="h-full w-full object-cover" loading="lazy" />
        <span className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${status === 'RUNNING' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>{status === 'RUNNING' ? 'Live' : 'Scheduled'}</span>
      </div>
      <div className="mt-2 flex min-w-0 items-baseline justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold text-white">{title}</h3>
        <span className="shrink-0 text-base font-bold text-white">{currentBid == null ? 'Unavailable' : formatCurrency(String(currentBid))}</span>
      </div>
      <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">Auction</p>
      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
        <span className="truncate">{sellerName(auction)}</span>
        {typeof auction.bidCount === 'number' ? <span>{auction.bidCount} bids</span> : null}
        <span className="inline-flex items-center gap-1 font-medium text-red-400"><Clock3 className="h-3 w-3" />{remaining}</span>
      </div>
      <p className="mt-1 truncate text-[10px] text-slate-500">Starting price: {auction.startingPrice == null ? 'Unavailable' : formatCurrency(String(auction.startingPrice))}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 transition group-hover:text-cyan-200">View auction <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
    </Link>
  );
}

function ProductSection({ title, products, categories, emptyTitle, emptyDescription }: { title: string; products: ProductResponse[]; categories: CategoryResponse[]; emptyTitle: string; emptyDescription: string }) {
  const visibleProducts = products.filter((product) => product.sellingType !== 'AUCTION');
  return (
    <section className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${title === 'Featured products' ? 'featured-products-section' : ''}`}>
      <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Bidzo marketplace</p><h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2></div><Link to="/marketplace" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/80">Browse Marketplace</Link></div>
        {visibleProducts.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : <div className="grid min-w-0 grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-5">{visibleProducts.map((product) => <ProductCard key={product.id} id={product.id} title={text(product.name, 'Product')} description={text(product.description, 'Product details unavailable')} image={imageUrl(product.imageUrl || product.image || product.images?.[0])} images={(product.images || []).map((value) => imageUrl(value))} price={numberText(product.price)} category={productCategory(product, categories)} condition={text(product.condition, '')} seller={sellerName(product)} rating={product.rating ?? undefined} reviews={product.reviewCount ?? product.reviews ?? undefined} verified={product.verified} createdAt={product.createdAt} badge="Direct Buy" actionLabel="View Product" actionLink={`/product/${product.id}`} wishlistItemType="PRODUCT" wishlistProductId={Number(product.id)} availableQuantity={product.availableQuantity} offerPrice={product.offerPrice ?? product.discountedPrice} originalPrice={product.originalPrice} discountType={product.discountType || undefined} discountValue={product.discountValue == null ? undefined : String(product.discountValue)} offerEndsAt={product.offerEndsAt} offerActive={product.offerActive} showSellerMeta compact={title === 'Recently added'} containImage />)}</div>}
    </section>
  );
}

function VerifiedSellersSection() {
  const [sellers, setSellers] = useState<PublicSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      setSellers(await getPublicSellers(0, 20));
    } catch (reason) {
      setSellers([]);
      setError(reason instanceof Error ? reason.message : 'Unable to load verified sellers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadSellers(); }, []);

  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Trusted sellers</p><h2 className="mt-2 text-2xl font-semibold text-white">Verified sellers</h2></div>
    {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)}</div> : error ? <div><ErrorState title="Unable to load verified sellers" description={error} /><button type="button" onClick={() => void loadSellers()} className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Retry</button></div> : sellers.length === 0 ? <EmptyState title="No verified sellers available" description="Verified sellers will appear here when available." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {sellers.map((seller) => {
        const name = seller.companyName || seller.name;
        const location = [seller.city, seller.state].filter((value): value is string => Boolean(value?.trim())).join(', ');
        return <Link key={seller.id} to={`/seller/${seller.id}`} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 transition hover:border-emerald-400/40">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold text-white">{name}</p>{location ? <p className="mt-1 text-sm text-slate-400">{location}</p> : null}<p className="mt-1 text-sm text-slate-400">{seller.productCount} products</p></div>{seller.verified ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300"><CheckCircle2 className="h-4 w-4" />Verified</span> : null}</div>
        </Link>;
      })}
    </div>}
  </section>;
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
  return <article className="homepage-theme-card relative h-[120px] w-[260px] shrink-0 overflow-hidden rounded-lg border shadow-[0_1px_6px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-md sm:w-[268px] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/5)]"><Link to={`/product/${deal.id}`} className="flex h-full min-w-0 items-stretch"><div className="homepage-theme-muted flex h-full w-[132px] shrink-0 items-center justify-center overflow-hidden"><img src={deal.imageUrl || '/logo.png'} alt={deal.name} className="h-full w-full object-contain p-1" loading="lazy" /></div><div className="min-w-0 flex-1 p-2 pr-8"><h3 className="truncate text-[11px] font-semibold leading-4 text-slate-900">{deal.name}</h3><p className="homepage-theme-subtle-text truncate text-[9px]">{deal.categoryName || 'Category unavailable'}</p><OfferPrice price={deal.price} offerPrice={deal.discountedPrice} originalPrice={deal.price} discountType={deal.discountType} discountValue={deal.discountValue} offerEndsAt={deal.offerEndsAt} /><div className="mt-0.5 flex flex-col items-start gap-0.5"><StockBadge availableQuantity={deal.availableQuantity} className="text-[9px]" /><span className="homepage-theme-subtle-text text-[9px] font-medium">Ends {dealCountdown(deal.offerEndsAt, Date.now())}</span></div></div></Link><button type="button" aria-label={`Add ${deal.name} to wishlist`} disabled={pending} onClick={(event) => void toggleWishlist(event)} className={`homepage-theme-control absolute right-1.5 top-1.5 !h-7 !min-h-7 !w-7 !min-w-7 rounded-full !p-0 shadow-sm transition hover:text-red-500 disabled:opacity-50 ${wishlisted ? 'text-red-500' : ''}`}><Heart className="h-3.5 w-3.5" /></button></article>;
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

  if (loading) return <section className="homepage-theme-section mx-auto max-w-7xl rounded-2xl px-4 py-5 sm:px-6 lg:px-8"><div className="homepage-theme-muted mb-3 h-7 w-48 animate-pulse rounded" /><div className="flex gap-3 overflow-hidden">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="homepage-theme-muted h-60 w-[188px] shrink-0 animate-pulse rounded-xl" />)}</div></section>;
  const visibleDeals = uniqueDeals.filter((deal) => new Date(deal.offerEndsAt).getTime() > now);
  if (!visibleDeals.length) return <section className="homepage-theme-section mx-auto w-full max-w-7xl rounded-2xl px-4 py-5 sm:px-6 lg:px-8"><div className="flex items-center gap-2"><span className="text-[25px] leading-none" aria-hidden="true">🔥</span><h2 className="text-xl font-bold sm:text-2xl">Deals of the Day</h2></div><p className="homepage-theme-subtle-text mt-4 rounded-xl border border-dashed px-4 py-6 text-center text-sm">No deals available right now</p></section>;
  const nearestEnd = visibleDeals.reduce((nearest, deal) => new Date(deal.offerEndsAt).getTime() < new Date(nearest.offerEndsAt).getTime() ? deal : nearest, visibleDeals[0]);
  return <section className="homepage-theme-section mx-auto w-full max-w-7xl min-w-0 overflow-hidden rounded-2xl px-4 py-5 sm:px-6 lg:px-8"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="text-[25px] leading-none" aria-hidden="true">🔥</span><h2 className="text-xl font-bold tracking-[-0.02em] sm:text-2xl">Deals of the Day</h2></div><div className="flex items-center gap-3"><p className="homepage-theme-danger inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm"><Clock3 className="h-4 w-4" /> Ends in {dealCountdown(nearestEnd.offerEndsAt, now)}</p><Link to="/marketplace" className="homepage-theme-link hidden items-center gap-1 text-sm font-semibold transition hover:text-sky-600 sm:inline-flex">View All Deals <ChevronRight className="h-4 w-4" /></Link></div></div><div ref={railRef} className="scrollbar-hidden flex min-w-0 gap-3 overflow-x-auto overflow-y-hidden pb-1" style={{ scrollBehavior: 'auto' }}>{visibleDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)}</div><Link to="/marketplace" className="homepage-theme-link mt-2 inline-flex items-center gap-1 text-xs font-semibold transition hover:text-sky-600 sm:hidden">View All Deals <ChevronRight className="h-3.5 w-3.5" /></Link></section>;
}

export function HomePage() {
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const [homeData, setHomeData] = useState<HomeDataResponse | null>(null);
  const [homeAdvertisements, setHomeAdvertisements] = useState<PublicAdvertisementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryResponse['id'] | null>(null);
  const customerLocation = useCustomerLocation();

  useEffect(() => {
    if (authReady && user && user.type !== 'customer') navigate(getPortalHome(user), { replace: true });
  }, [authReady, navigate, user]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [data, auctionItems, offers] = await Promise.all([getHomeData(customerLocation ? { latitude: customerLocation.latitude, longitude: customerLocation.longitude, radiusKm: 25 } : undefined), getAuctions(), getActiveProductOffers()]);
      const applyOffer = (product: ProductResponse) => {
        const offer = offers.get(String(product.id));
        return offer ? { ...product, offerPrice: offer.discountedPrice, originalPrice: offer.price, discountType: offer.discountType, discountValue: offer.discountValue, offerEndsAt: offer.offerEndsAt, offerActive: true } : product;
      };
      const homeAuctions = auctionItems.map(toHomeAuction);
      const liveAuctions = data.liveAuctions?.length ? mergeHomeAuctionImages(data.liveAuctions, homeAuctions) : homeAuctions;
      const upcomingAuctions = data.upcomingAuctions?.length ? mergeHomeAuctionImages(data.upcomingAuctions, homeAuctions) : homeAuctions;
      const endingSoonAuctions = data.endingSoonAuctions?.length ? mergeHomeAuctionImages(data.endingSoonAuctions, homeAuctions) : homeAuctions;
      setHomeData({
        ...data,
        featuredProducts: (data.featuredProducts || []).map(applyOffer),
        popularProducts: (data.popularProducts || []).map(applyOffer),
        recentProducts: (data.recentProducts || []).map(applyOffer),
        liveAuctions,
        upcomingAuctions,
        endingSoonAuctions,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load marketplace data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [customerLocation?.latitude, customerLocation?.longitude]);

  useEffect(() => {
    let active = true;
    const loadHomeAdvertisements = async () => {
      try {
        const advertisements = await getHomeBannerAdvertisements();
        if (active) {
          setHomeAdvertisements(advertisements);
        }
      } catch {
        if (active) setHomeAdvertisements([]);
      }
    };

    void loadHomeAdvertisements();
    const timer = window.setInterval(() => void loadHomeAdvertisements(), 5 * 60 * 1000);
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void loadHomeAdvertisements(); };
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, []);

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
  const categories = homeData.categories ?? [];
  const mainCategories = categories.filter((category) => category.parentId === undefined || category.parentId === null || category.parentId === '');
  const selectedCategory = mainCategories.find((category) => String(category.id) === String(selectedCategoryId));
  const selectedSubcategories = selectedCategory
    ? categories.filter((category) => String(category.parentId) === String(selectedCategory.id))
    : [];
  const promotionProductIds = [...new Set([...featured, ...recent, ...popular].map((product) => String(product.id)))];
  return <><CategoryPromotionBanner categoryIds={categories.map((category) => category.id)} productIds={promotionProductIds} /><div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8"><HomeBanner advertisements={homeAdvertisements} banners={homeData.banners ?? []}>
    <section className="relative overflow-hidden bg-[var(--app-bg)] text-white"><div className="home-hero-content mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"><div className="max-w-4xl space-y-8"><div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10"><Sparkles className="h-4 w-4 text-amber-300" /> Trusted auctions and verified sellers</div><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"><span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-amber-300 bg-clip-text text-transparent">Buy with confidence.</span> Bid on what matters.</h1><p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">Search real marketplace inventory, discover live auctions, and connect with verified sellers.</p><div className="home-hero-actions flex flex-wrap gap-3"><Link to="/auctions" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Browse Live Auctions</Link><Link to="/marketplace" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-orange-600">Browse Marketplace</Link></div>{stats ? <div className="home-hero-stats grid gap-4 sm:grid-cols-3">{[['Live auctions', stats.liveAuctions], ['Products', stats.totalProducts], ['Verified sellers', stats.totalVendors]].map(([label, value]) => value !== null && value !== undefined ? <div key={String(label)} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p></div> : null)}</div> : null}</div></div></section>
    </HomeBanner></div>
    <section aria-label="All Categories" className="homepage-theme-section homepage-theme-outline mx-auto w-full max-w-7xl rounded-2xl px-4 py-5 shadow-sm sm:px-6 lg:px-8"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Explore</p><h2 className="mt-1 text-xl font-bold sm:text-2xl">Shop by Category</h2></div><Link to="/categories" className="homepage-theme-link inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition hover:text-sky-600">View all <ChevronRight className="h-4 w-4" /></Link></div>{categories.length === 0 ? <EmptyState title="No categories available" description="Categories will appear here when available." /> : <><div className="scrollbar-hidden flex snap-x gap-3 overflow-x-auto pb-1">{mainCategories.map((category) => <button type="button" key={category.id} onClick={() => setSelectedCategoryId(category.id)} className="homepage-theme-card flex h-[142px] w-[116px] shrink-0 snap-start flex-col items-center justify-between rounded-xl border p-2.5 text-center shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md sm:w-[124px]"><span className="homepage-theme-muted flex h-[92px] w-full items-center justify-center rounded-lg text-sky-600"><CategoryIcon iconUrl={category.iconUrl} className="h-16 w-16" /></span><span className="line-clamp-2 w-full text-xs font-semibold leading-4">{category.name}</span></button>)}</div>{selectedCategory ? <div className="scrollbar-hidden mt-4 flex snap-x gap-3 overflow-x-auto border-t border-sky-100 pt-4">{selectedSubcategories.map((category) => <button type="button" key={category.id} onClick={() => navigate(`/marketplace?categoryId=${encodeURIComponent(String(category.id))}`)} className="homepage-theme-card flex h-[142px] w-[116px] shrink-0 snap-start flex-col items-center justify-between rounded-xl border p-2.5 text-center shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md sm:w-[124px]"><span className="homepage-theme-muted flex h-[92px] w-full items-center justify-center rounded-lg text-sky-600"><CategoryIcon iconUrl={category.iconUrl} className="h-16 w-16" /></span><span className="line-clamp-2 w-full text-xs font-semibold leading-4">{category.name}</span></button>)}</div> : null}</>}</section>
    <DealsOfTheDay reducedMotion={reducedMotion} />
    <ProductSection title="Featured products" products={featured} categories={categories} emptyTitle="No featured products yet" emptyDescription="Featured products will appear here when available." />
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Live now</p><h2 className="mt-2 text-2xl font-semibold text-white">Live auctions</h2></div><Link to="/auctions" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/80">Browse Auctions</Link></div>{liveAuctions.length === 0 ? <EmptyState title="No live auctions right now" description="Check back soon for new auctions." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{liveAuctions.map((auction) => <AuctionTile key={auction.id} auction={auction} status="RUNNING" />)}</div>}</section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Coming up</p><h2 className="mt-2 text-2xl font-semibold text-white">Scheduled auctions</h2></div>{scheduledAuctions.length === 0 ? <EmptyState title="No scheduled auctions" description="There are no upcoming auctions right now." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{scheduledAuctions.map((auction) => <AuctionTile key={auction.id} auction={auction} status="SCHEDULED" />)}</div>}</section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Act soon</p><h2 className="mt-2 text-2xl font-semibold text-white">Ending soon</h2></div>{endingSoon.length === 0 ? <EmptyState title="No auctions ending soon" description="There are no ending-soon auctions right now." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{endingSoon.map((auction) => <AuctionTile key={auction.id} auction={auction} status="RUNNING" />)}</div>}</section>
    <ProductSection title="Recently added" products={recent} categories={categories} emptyTitle="No recently added products" emptyDescription="New products will appear here when available." />
    <ProductSection title="Popular products" products={popular} categories={categories} emptyTitle="No popular products yet" emptyDescription="Popularity information will appear here when available." />
    {testimonials.length > 0 ? <TestimonialsCarousel testimonials={testimonials} /> : null}
    <VerifiedSellersSection />
  </>;
}
