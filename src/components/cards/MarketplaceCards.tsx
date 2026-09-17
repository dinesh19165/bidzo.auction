import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Eye, Gavel, Heart, Share2, ShoppingCart, Sparkles, Star, Users } from 'lucide-react';
import { memo, useEffect, useMemo, useState, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { showToast } from '../ui/toast';
import { useLocaleContext } from '../../context/LocaleContext';
import { useCartContext } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { StockBadge } from '../common/StockBadge';

interface ProductCardProps {
  id: string | number;
  title: string;
  description: string;
  image: string;
  price: string;
  category: string;
  condition: string;
  seller: string;
  rating?: number;
  reviews?: number;
  oldPrice?: string;
  discount?: string;
  verified?: boolean;
  currentBid?: string;
  endsIn?: string;
  badge?: string;
  location?: string;
  actionLabel?: string;
  actionLink?: string;
  createdAt?: string | null;
  showSellerMeta?: boolean;
  compact?: boolean;
  wishlistItemType?: 'PRODUCT' | 'AUCTION';
  wishlistProductId?: number;
  wishlistAuctionId?: number;
  showAddToCart?: boolean;
  availableQuantity?: number | null;
}

function parseCountdown(value?: string) {
  if (!value) return 0;
  const text = value.trim();
  const hours = text.match(/(\d+)h/i);
  const minutes = text.match(/(\d+)m/i);
  const seconds = text.match(/(\d+)s/i);
  if (hours || minutes || seconds) {
    return (Number(hours?.[1] || 0) * 3600) + (Number(minutes?.[1] || 0) * 60) + Number(seconds?.[1] || 0);
  }

  const parts = text.split(':').map((part) => Number(part));
  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }
  return 0;
}

function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) return 'Auction Ended';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

export const ProductCard = memo(function ProductCard({
  id,
  title,
  description,
  image,
  price,
  category,
  condition,
  seller,
  rating,
  reviews,
  oldPrice,
  discount,
  verified,
  currentBid,
  endsIn,
  badge,
  location,
  actionLabel,
  actionLink,
  createdAt,
  showSellerMeta = true,
  compact = false,
  wishlistItemType,
  wishlistProductId,
  wishlistAuctionId,
  showAddToCart = false,
  availableQuantity,
}: ProductCardProps) {
  const [quickOpen, setQuickOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isWishlisted, isPending, toggle } = useWishlist();
  const wishlistParams = wishlistItemType ? { itemType: wishlistItemType, productId: wishlistProductId, auctionId: wishlistAuctionId } : null;
  const favorited = wishlistParams ? isWishlisted(wishlistParams) : false;
  const favoritePending = wishlistParams ? isPending(wishlistParams) : false;
  const { addItem } = useCartContext();
  const [cartPending, setCartPending] = useState(false);

  const addToCart = useCallback(async () => {
    if (cartPending) return;
    setCartPending(true);
    try {
      await addItem(Number(id));
      showToast('Added to cart', `${title} is ready for checkout.`, 'success');
    } catch (error) {
      showToast('Unable to add to cart', error instanceof Error ? error.message : 'Please try again.', 'warning');
    } finally {
      setCartPending(false);
    }
  }, [addItem, cartPending, id, title]);

  const toggleFavorite = useCallback(async (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (favoritePending) return;
    if (!wishlistParams) return;
    if (!user || (user.type !== 'customer' && user.role !== 'CUSTOMER')) {
      showToast('Sign in to save items', 'Log in as a customer to use your wishlist.', 'info');
      navigate('/login');
      return;
    }
    try {
      await toggle(wishlistParams);
      showToast(favorited ? 'Removed from favourites' : 'Added to favourites', favorited ? 'The listing is no longer in your saved collection.' : 'Saved for your next bidding session.', favorited ? 'info' : 'success');
    } catch (error) {
      showToast('Unable to update favourites', error instanceof Error ? error.message : 'Please try again.', 'warning');
    }
  }, [favoritePending, favorited, navigate, toggle, user, wishlistParams]);

  const openQuickView = useCallback(() => setQuickOpen(true), []);
  const closeQuickView = useCallback(() => setQuickOpen(false), []);
  const [countdown, setCountdown] = useState(() => parseCountdown(endsIn));
  const isAuction = useMemo(() => (badge || '').toLowerCase().includes('auction'), [badge]);

  useEffect(() => {
    const initialSeconds = parseCountdown(endsIn);
    if (initialSeconds <= 0) {
      setCountdown(0);
      return;
    }

    setCountdown(initialSeconds);
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endsIn]);

  const { formatCurrency, translate } = useLocaleContext();
  const priceLabel = translate(isAuction ? 'currentBid' : 'price');
  const rawPrice = (isAuction ? (currentBid || price) : price).replace(/,/g, '');
  const priceValue = Number.isFinite(Number(rawPrice)) && rawPrice !== '' ? formatCurrency(rawPrice) : 'Price unavailable';
  const productUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return actionLink ?? `/product/${id}`;
    }

    try {
      return new URL(actionLink ?? `/product/${id}`, window.location.origin).toString();
    } catch {
      return actionLink ?? `/product/${id}`;
    }
  }, [actionLink, id]);

  const handleShare = useCallback(async (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `Check out ${title} on Bidzo`,
          url: productUrl,
        });
        showToast('Product shared', 'The product link has been opened in your sharing sheet.', 'success');
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(productUrl);
        showToast('Product link copied', 'The product link has been copied to your clipboard.', 'success');
        return;
      }

      throw new Error('Clipboard API unavailable');
    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'Share was cancelled.'
        : 'Unable to share this product right now. Please try again.';

      showToast(
        error instanceof Error && error.name === 'AbortError' ? 'Share cancelled' : 'Unable to share product',
        message,
        error instanceof Error && error.name === 'AbortError' ? 'info' : 'warning',
      );
    }
  }, [productUrl, title]);

  useEffect(() => {
    if (!quickOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQuickView();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quickOpen, closeQuickView]);

  return (
    <>
      <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="group relative flex w-full max-w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 shadow-lg shadow-slate-950/20 transition-all duration-200 hover:border-blue-400/40"
    >
      <div className="relative overflow-hidden">
        <div className="aspect-[5/3] w-full overflow-hidden rounded-t-xl bg-slate-950/40">
          <img src={image} alt={title} loading="lazy" decoding="async" className="h-full w-full object-contain p-2 transition-opacity duration-200 group-hover:opacity-95" />
        </div>
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          {badge ? (
            <span className="rounded-md bg-slate-950/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">{badge}</span>
          ) : null}
          {isAuction ? <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-200"><Sparkles className="h-3 w-3" /> Live</span> : null}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={favoritePending}
              aria-label="Add to Favorites"
              className={`rounded-lg p-1.5 text-slate-200 transition-colors duration-200 disabled:cursor-wait disabled:opacity-60 ${favorited ? 'scale-105' : ''} focus-visible:outline-none`}
            >
              <Heart className={`h-4 w-4 transition-all duration-200 ${favorited ? 'fill-current text-rose-500 drop-shadow-[0_6px_14px_rgba(220,38,38,0.22)]' : 'text-slate-200 group-hover:text-rose-400'}`} />
            </button>

            <button
              type="button"
              onClick={openQuickView}
              aria-label="Quick View"
              className="rounded-lg p-1.5 text-slate-200 transition-colors duration-200 hover:bg-blue-500/20 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
        {verified ? (
          <div className="absolute bottom-3 left-3 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-300 shadow-lg shadow-slate-950/40">
            <CheckCircle2 className="mr-1 inline-block h-3.5 w-3.5" /> Verified
          </div>
        ) : null}
      </div>

      <div className="p-3 sm:p-3.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-slate-400">
          <span>{category}</span>
          <span>{condition}</span>
        </div>
        <div className="mt-1 space-y-1">
          <h3 className="break-words text-sm font-semibold leading-5 text-white">{title}</h3>
          <p className="line-clamp-2 break-words text-[11px] leading-4 text-slate-400">{description}</p>
        </div>

        <div className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="text-base font-semibold text-white">{priceValue}</p>
              {oldPrice ? <p className="text-xs text-slate-500 line-through">{formatCurrency(oldPrice)}</p> : null}
            </div>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-slate-400">{priceLabel}</p>
            {createdAt ? <p className="mt-0.5 text-[9px] text-slate-500">Added {new Date(createdAt).toLocaleDateString('en-IN')}</p> : null}
            {discount ? <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-emerald-300">{discount}</p> : null}
          </div>
          {isAuction ? (
            <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-[10px] text-blue-200">
              <Clock3 className="h-3 w-3" />
              <span>{countdown > 0 ? formatCountdown(countdown) : 'Auction Ended'}</span>
            </div>
          ) : null}
        </div>
        {!isAuction ? <StockBadge availableQuantity={availableQuantity} className="mt-1" /> : null}

        {showSellerMeta && seller ? <div className="mt-2 rounded-lg border border-white/10 bg-slate-950/70 p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[11px] font-semibold text-blue-200">
                {seller.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-white">
                  <span className="truncate">{seller}</span>
                  {verified ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" /> : null}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400">
                  {rating !== undefined ? <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3 w-3" /> {rating}</span> : null}
                  {reviews !== undefined ? <span>{reviews} Reviews</span> : null}
                </div>
              </div>
            </div>
            {verified ? <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-300">Verified</span> : null}
          </div>
        </div> : null}

        <div className="mt-2 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={actionLink ?? `/customer/product/${id}`} className="group/btn relative inline-flex min-h-[34px] flex-1 items-center justify-center gap-1 overflow-hidden rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-md shadow-blue-600/15 transition-colors duration-200 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60">
              <span className="relative z-10">{isAuction ? translate('watchAuction') : actionLabel || translate('buyNow')}</span>
              <ArrowRight className="relative z-10 h-3 w-3" />
            </Link>
            <button type="button" onClick={handleShare} className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-200 transition-colors duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50" aria-label="Share listing">
              <Share2 className="h-3 w-3" />
            </button>
            <button type="button" onClick={toggleFavorite} disabled={favoritePending} className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-200 transition-colors duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 disabled:cursor-wait disabled:opacity-60" aria-label="Favorite listing">
              <Heart className={`h-3 w-3 transition-colors duration-200 ${favorited ? 'fill-current text-rose-500' : ''}`} />
            </button>
            {showAddToCart ? <button type="button" onClick={addToCart} disabled={cartPending} className="inline-flex min-h-[34px] flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-60"><ShoppingCart className="h-3 w-3" />{cartPending ? 'Adding...' : 'Add to Cart'}</button> : null}
          </div>
        </div>
      </div>
    </motion.article>
      {quickOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeQuickView} />
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }} className="relative z-10 mx-4 w-full max-w-3xl rounded-2xl bg-slate-900/95 border border-white/10 p-6 shadow-2xl">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-slate-800/50 p-2">
                <img src={image} alt={title} className="h-72 w-full rounded-md object-cover" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">{title}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    {verified ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : null}
                  </div>
                </div>

                <div>
                  <p className="text-2xl font-semibold text-white">{priceValue}</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.12em] text-slate-400">{priceLabel}</p>
                </div>

                <p className="text-sm text-slate-300">{description}</p>

                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-3">
                  <p className="text-sm font-medium text-white">Seller</p>
                  <p className="text-sm text-slate-300">{seller}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 text-sm text-amber-300"><Star className="h-4 w-4" />{rating ?? '—'}</div>
                  <div className="text-sm text-slate-400">{reviews ?? 0} Reviews</div>
                  <div className="text-sm text-slate-400">{category}</div>
                  <div className="text-sm text-slate-400">{condition}</div>
                  <div className="text-sm text-slate-400">{location}</div>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={actionLink ?? `/customer/product/${id}`} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">
                    {isAuction ? translate('placeBid') : actionLabel || translate('buyNow')}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button onClick={closeQuickView} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">{translate('close')}</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body,
      )}
    </>
  );
});

interface AuctionCardProps {
  id: string | number;
  title: string;
  image: string;
  status: string;
  currentBid: string;
  endsIn: string;
  seller?: string;
  verified?: boolean;
  watchers?: number;
  participants?: number;
  condition?: string;
  rating?: number;
}

export function AuctionCard({ id, title, image, status, currentBid, endsIn, seller='Bidzo Seller', verified=true, watchers=0, participants=0, condition='Excellent', rating }: AuctionCardProps) {
  const { translate, formatCurrency } = useLocaleContext();
  return (
    <motion.article whileHover={{ y: -8, scale: 1.01, boxShadow: '0 32px 80px -24px rgba(59,130,246,0.35)' }} transition={{ duration: 0.24 }} className="group w-full max-w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30 transition duration-300 hover:border-blue-400/40">
      <div className="relative overflow-hidden">
        <div className="thumbnail-wrapper" style={{ width: 280, height: 180, maxWidth: '100%', overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <img src={image} alt={title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="bg-slate-800 transition-all duration-300 group-hover:scale-[1.05]" />
        </div>
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${status === 'Live' ? 'bg-emerald-500/15 text-emerald-300' : status === 'Upcoming' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-700/80 text-slate-300'}`}>
            {status === 'Live' ? <span className="mr-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> : null}
            {status}
          </span>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-950/90 px-3 py-1 text-xs text-slate-300">
            <Clock3 className="h-3.5 w-3.5" /> {endsIn}
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-200">{seller.charAt(0)}</div>
            <div>
              <p className="font-semibold text-white">{seller}</p>
              <p className="text-xs text-slate-400">{condition}</p>
            </div>
          </div>
          {verified ? <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Verified</span> : null}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {typeof watchers === 'number' && watchers > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1"><Users className="h-3 w-3" /> {watchers} watchers</span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1"><Gavel className="h-3 w-3" /> {participants} bids</span>
          {typeof rating === 'number' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1"><Star className="h-3 w-3" /> {rating}</span>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-slate-400">{translate('currentBid')} {formatCurrency(currentBid)}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link to={`/auctions/${id}`} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-250 hover:-translate-y-0.5 hover:bg-blue-500">
            {translate('viewDetails')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button className="min-h-[48px] rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition-all duration-250 hover:-translate-y-0.5 hover:bg-white/10">{translate('watch')}</button>
        </div>
      </div>
    </motion.article>
  );
}

export function CategoryCard({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="w-full max-w-full rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30 transition duration-300">
      <div className="flex items-center gap-3">
        <div className="rounded-3xl bg-blue-500/10 p-3 text-blue-300">{icon}</div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function SellerCard({ name, specialty, rating }: { name: string; specialty: string; rating: string }) {
  return (
    <div className="w-full max-w-full rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30 transition duration-300">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="mt-1 text-sm text-slate-400">{specialty}</p>
        </div>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">★ {rating}</span>
      </div>
    </div>
  );
}

export function ReviewCard({
  quote,
  author,
  rating,
  imageUrl,
  title,
  productName,
  productImageUrl,
  createdAt,
}: {
  quote?: string;
  author: string;
  rating: number;
  imageUrl?: string;
  title?: string;
  productName?: string;
  productImageUrl?: string;
  createdAt?: string | null;
}) {
  const safeRating = Math.min(5, Math.max(1, Number.isFinite(rating) ? Math.round(rating) : 5));
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : null;

  return (
    <article className="flex h-full min-w-0 w-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_8px_22px_rgba(15,23,42,0.09)] sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">{author}</p>
          <p className="mt-1 text-sm leading-none text-amber-500" aria-label={`${safeRating} out of 5 stars`}>{'★'.repeat(safeRating)}</p>
        </div>
        {imageUrl ? <img src={imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200" /> : null}
      </div>

      {formattedDate ? <p className="mt-2 text-xs text-slate-500">{formattedDate}</p> : null}
      {title ? <p className="mt-3 break-words text-sm font-semibold leading-5 text-slate-900">{title}</p> : null}
      {quote ? <p className="mt-3 break-words text-sm leading-6 text-slate-600">“{quote}”</p> : null}

      {(productName || productImageUrl) ? (
        <div className="mt-4 flex min-w-0 items-center gap-2 border-t border-slate-100 pt-3">
          {productImageUrl ? <img src={productImageUrl} alt={productName || 'Product'} className="h-9 w-9 shrink-0 rounded-lg object-cover" /> : null}
          <p className="min-w-0 truncate text-xs font-medium text-slate-600">{productName || 'Product review'}</p>
        </div>
      ) : null}
    </article>
  );
}

export function StatisticCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className={`w-full max-w-full rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 transition duration-300 ${accent || ''}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
