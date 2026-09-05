import { SectionShell } from '../components/SectionShell';
import { Sidebar } from '../components/layout/LayoutComponents';
import FilterSidebar from '../components/filters/FilterSidebar';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, LayoutGrid, List, Sparkles, X } from 'lucide-react';
import { useLocaleContext } from '../context/LocaleContext';
import { useThemeContext } from '../context/ThemeContext';
import { getMarketplaceCategories, searchMarketplace, type MarketplaceCategory, type MarketplaceSearchOptions, type MarketplaceSearchResult } from '../api/marketplaceSearchApi';
import { API_BASE_URL } from '../api/apiClient';
import { getWishlist, type WishlistItemResponse } from '../api/wishlistApi';
import { useAuth } from '../context/AuthContext';
import { EmptyState, SkeletonCard, ErrorState } from '../components/loading/LoadingComponents';

const ALL_CATEGORIES = '';
const PAGE_SIZE = 20;
type MarketplaceFilters = Omit<MarketplaceSearchOptions, 'page' | 'size'>;

const DEFAULT_FILTERS: MarketplaceFilters = {
  query: '', category: '', minPrice: '', maxPrice: '', seller: '', rating: '',
  verifiedSellersOnly: false, auctionsOnly: false, buyNowOnly: false, sort: 'relevance',
};

function toCardListing(item: MarketplaceSearchResult) {
  const isAuction = item.type === 'AUCTION';
  const image = item.image && !item.image.includes('placeholder.com') ? item.image : '/logo.png';
  return {
    id: item.id,
    title: item.title || item.vendor?.name || 'Marketplace listing',
    description: item.type === 'VENDOR' ? 'Seller profile' : `${item.type === 'AUCTION' ? 'Auction' : 'Product'} listing`,
    image: image.startsWith('/') && !image.startsWith('/logo') ? `${API_BASE_URL}${image}` : image,
    price: String(isAuction ? (item.currentBid ?? item.price ?? 0) : (item.price ?? 0)),
    category: item.category?.name || 'Marketplace',
    condition: isAuction ? (item.auctionStatus || 'Auction') : 'Available',
    seller: item.vendor?.name || (item.type === 'VENDOR' ? item.title : 'Seller'),
    rating: undefined,
    reviews: undefined,
    verified: false,
    badge: isAuction ? 'LIVE AUCTION' : item.type === 'VENDOR' ? 'SELLER' : 'BUY NOW',
    location: undefined,
    route: isAuction ? `/auctions/${item.id}` : item.type === 'VENDOR' ? `/seller/${item.id}` : `/product/${item.id}`,
    actionLabel: isAuction ? 'Watch Auction' : item.type === 'VENDOR' ? 'View Seller' : 'Buy Now',
    currentBid: item.currentBid === null ? undefined : String(item.currentBid),
    endsIn: item.auctionEndsAt || undefined,
    isAuction,
    auctionId: isAuction ? item.id : undefined,
  };
}

export function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [seller, setSeller] = useState('');
  const [rating, setRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [auctionOnly, setAuctionOnly] = useState(false);
  const [buyNowOnly, setBuyNowOnly] = useState(false);
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(0);
  const [grid, setGrid] = useState(true);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS);
  const [results, setResults] = useState<ReturnType<typeof toCardListing>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistByProductId, setWishlistByProductId] = useState<Record<number, WishlistItemResponse>>({});
  const { user } = useAuth();

  useEffect(() => { getMarketplaceCategories().then(setCategories).catch(() => setCategories([])); }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    searchMarketplace({ ...appliedFilters, page, size: PAGE_SIZE }).then((data) => {
      if (!active) return;
      setResults(data.content.map(toCardListing));
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    }).catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Unable to load marketplace listings'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [appliedFilters, page]);

  useEffect(() => {
    if (user?.type !== 'customer') return;
    getWishlist().then((wishlist) => setWishlistByProductId(Object.fromEntries(wishlist.filter((item) => item.itemType !== 'AUCTION').map((item) => [item.productId, item])))).catch(() => setWishlistByProductId({}));
  }, [user?.type]);

  const { translate, currencySymbol } = useLocaleContext();
  const { theme } = useThemeContext();

  const resetFilters = () => {
    setCategory(ALL_CATEGORIES);
    setMinPrice('');
    setMaxPrice('');
    setSeller('');
    setRating('');
    setVerifiedOnly(false);
    setAuctionOnly(false);
    setBuyNowOnly(false);
    setCondition('');
    setLocation('');
    setSort('relevance');
    setQuery('');
    setPage(0);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const applyFilters = () => {
    setPage(0);
    setAppliedFilters({ query, category, minPrice, maxPrice, seller, rating, verifiedSellersOnly: verifiedOnly, auctionsOnly: auctionOnly, buyNowOnly, sort });
  };

  const activeFilters = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (query) {
      chips.push({ key: 'query', label: `“${query}”`, onRemove: () => setQuery('') });
    }
    if (category) {
      chips.push({ key: 'category', label: category, onRemove: () => setCategory(ALL_CATEGORIES) });
    }
    if (seller) {
      chips.push({ key: 'seller', label: seller, onRemove: () => setSeller('') });
    }
    if (rating) {
      chips.push({ key: 'rating', label: `★ ${rating}+`, onRemove: () => setRating('') });
    }
    if (verifiedOnly) {
      chips.push({ key: 'verified', label: translate('verifiedSellersOnly'), onRemove: () => setVerifiedOnly(false) });
    }
    if (auctionOnly) {
      chips.push({ key: 'auction', label: translate('liveAuctions'), onRemove: () => setAuctionOnly(false) });
    }
    if (buyNowOnly) {
      chips.push({ key: 'buyNow', label: translate('buyNow'), onRemove: () => setBuyNowOnly(false) });
    }
    if (condition) {
      chips.push({ key: 'condition', label: condition, onRemove: () => setCondition('') });
    }
    if (location) {
      chips.push({ key: 'location', label: location, onRemove: () => setLocation('') });
    }
    if (minPrice || maxPrice) {
      const priceLabel = minPrice && maxPrice ? `${translate('minPrice')} ${currencySymbol}${minPrice} - ${translate('maxPrice')} ${currencySymbol}${maxPrice}` : minPrice ? `${translate('minPrice')} ${currencySymbol}${minPrice}` : `${translate('maxPrice')} ${currencySymbol}${maxPrice}`;
      chips.push({ key: 'price', label: priceLabel, onRemove: () => { setMinPrice(''); setMaxPrice(''); } });
    }

    return chips;
  }, [auctionOnly, buyNowOnly, category, condition, location, maxPrice, minPrice, query, rating, seller, verifiedOnly]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, index) => index);
    if (page === 0) return [0, 1, 2];
    if (page === totalPages - 1) return [totalPages - 3, totalPages - 2, totalPages - 1];
    return [page - 1, page, page + 1];
  }, [page, totalPages]);

  return (
    <SectionShell title="Marketplace" subtitle="Browse categories and curated listings">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <Sidebar theme="dark">
          <FilterSidebar
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            seller={seller}
            setSeller={setSeller}
            rating={rating}
            setRating={setRating}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            auctionOnly={auctionOnly}
            setAuctionOnly={setAuctionOnly}
            buyNowOnly={buyNowOnly}
            setBuyNowOnly={setBuyNowOnly}
            condition={condition}
            setCondition={setCondition}
            location={location}
            setLocation={setLocation}
            sort={sort}
            setSort={setSort}
            categories={categories}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
          />
        </Sidebar>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-400">{totalElements} {translate('results')}</p>
              <div className="h-6 w-px bg-white/5" />
              <div className="text-sm text-slate-300">{translate('view')}</div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-300">
                <button type="button" onClick={() => setGrid(true)} className={`rounded-full p-2 transition ${grid ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`} aria-label={translate('gridView')}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setGrid(false)} className={`rounded-full p-2 transition ${!grid ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`} aria-label={translate('listView')}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <Sparkles className="mr-2 h-4 w-4 text-amber-300" />
              {translate('curatedMarketplacePicks')}
            </div>
          </div>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-[24px] border border-white/10 bg-slate-900/70 px-4 py-3">
              {activeFilters.map((chip) => (
                <button key={chip.key} type="button" onClick={chip.onRemove} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 transition hover:bg-white/10">
                  <span>{chip.label}</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <button type="button" onClick={resetFilters} className="ml-1 text-sm text-slate-400 transition hover:text-white">Clear All</button>
            </div>
          ) : null}

          {loading ? (
            <div className={`${grid ? 'grid grid-cols-1 gap-4 justify-items-center md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={`${grid ? 'w-full max-w-full sm:max-w-[340px] min-w-0' : 'rounded-[24px] border border-white/10 bg-slate-900/70 p-4 min-w-0'}`}>
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState title="Product load failed" description={error} />
          ) : results.length === 0 ? (
            <EmptyState title="No products found" description="Try clearing filters or adjusting search criteria." />
          ) : (
            <div className={`${grid ? 'grid grid-cols-1 gap-4 justify-items-center md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}`}>
              {results.map((product) => (
                <div key={`${product.isAuction ? 'auction' : 'listing'}-${product.id}`} className={`${grid ? 'w-full max-w-full sm:max-w-[340px] min-w-0' : 'rounded-[24px] border border-white/10 bg-slate-900/70 p-4 min-w-0'}`}>
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    description={product.description}
                    image={product.image}
                    price={product.price}
                    category={product.category}
                    condition={product.condition}
                    seller={product.seller}
                    rating={product.rating}
                    reviews={product.reviews}
                    verified={product.verified}
                    badge={product.badge}
                    location={product.location}
                    actionLink={product.route || `/product/${product.id}`}
                    actionLabel={product.actionLabel}
                    currentBid={product.currentBid || (product.isAuction ? product.price : undefined)}
                    endsIn={product.endsIn}
                    wishlistItemType={product.isAuction ? 'AUCTION' : 'PRODUCT'}
                    wishlistProductId={product.isAuction ? undefined : product.id}
                    wishlistAuctionId={product.isAuction ? product.auctionId : undefined}
                    wishlistRecordId={wishlistByProductId[product.isAuction ? (product.auctionId ?? product.id) : product.id]?.id}
                    initialFavorited={Boolean(wishlistByProductId[product.isAuction ? (product.auctionId ?? product.id) : product.id])}
                    showAddToCart={!product.isAuction}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">Displaying {totalElements === 0 ? 0 : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements} Listings</div>
            <div className="inline-flex items-center gap-2 text-sm text-slate-300">
              <button type="button" onClick={() => setPage(Math.max(0, page - 1))} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 disabled:opacity-50" disabled={page === 0 || totalPages === 0}>
                <ArrowLeft className="h-4 w-4" /> {translate('previous')}
              </button>
              {visiblePages.map((pageNumber) => (
                <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} className={`h-10 w-10 rounded-full border transition ${page === pageNumber ? 'border-blue-400/40 bg-blue-500/15 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  {pageNumber + 1}
                </button>
              ))}
              <button type="button" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 disabled:opacity-50" disabled={totalPages === 0 || page >= totalPages - 1}>
                {translate('next')} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
