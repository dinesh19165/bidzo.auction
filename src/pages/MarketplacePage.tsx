import { SectionShell } from '../components/SectionShell';
import { categories, products } from '../data/mockData';
import { Input, Select, Checkbox } from '../components/forms/FormComponents';
import { Sidebar } from '../components/layout/LayoutComponents';
import FilterSidebar from '../components/filters/FilterSidebar';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, LayoutGrid, List, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

const categoryChips = [
  { label: 'Electronics', icon: '💻', value: 'Electronics' },
  { label: 'Vehicles', icon: '🚗', value: 'Vehicles' },
  { label: 'Real Estate', icon: '🏠', value: 'Real Estate' },
  { label: 'Fashion', icon: '👕', value: 'Fashion' },
  { label: 'Furniture', icon: '🪑', value: 'Furniture' },
  { label: 'Agriculture', icon: '🌾', value: 'Agriculture' },
  { label: 'Livestock', icon: '🐄', value: 'Livestock' },
  { label: 'Services', icon: '🛠', value: 'Services' },
  { label: 'Books', icon: '📚', value: 'Books' },
  { label: 'Pets', icon: '🐶', value: 'Pets' },
  { label: 'Live Auctions', icon: '🔴', value: 'auction' },
] as const;

function parsePrice(price: string) {
  const n = Number(price.replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
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
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [grid, setGrid] = useState(true);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q));
    }
    if (category) list = list.filter((p) => p.category === category);
    if (seller) list = list.filter((p) => p.seller.toLowerCase().includes(seller.toLowerCase()));
    if (rating) list = list.filter((p) => p.rating >= Number(rating));
    if (verifiedOnly) list = list.filter((p) => p.verified === true);
    if (auctionOnly) list = list.filter((p) => (p.badge || '').toLowerCase().includes('auction'));
    if (buyNowOnly) list = list.filter((p) => (p.badge || '').toLowerCase().includes('buy now') || (p.badge || '').toLowerCase().includes('buy'));
    if (condition) list = list.filter((p) => p.condition === condition);
    if (location) list = list.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()));
    if (minPrice) list = list.filter((p) => parsePrice(p.price) >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => parsePrice(p.price) <= Number(maxPrice));

    if (sort === 'price_asc') list = list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (sort === 'price_desc') list = list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    else if (sort === 'rating') list = list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [query, category, seller, rating, verifiedOnly, auctionOnly, buyNowOnly, condition, location, minPrice, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetFilters = () => {
    setCategory('');
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
    setPage(1);
  };

  const activeFilters = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (query) {
      chips.push({ key: 'query', label: `“${query}”`, onRemove: () => setQuery('') });
    }
    if (category) {
      chips.push({ key: 'category', label: category, onRemove: () => setCategory('') });
    }
    if (seller) {
      chips.push({ key: 'seller', label: seller, onRemove: () => setSeller('') });
    }
    if (rating) {
      chips.push({ key: 'rating', label: `★ ${rating}+`, onRemove: () => setRating('') });
    }
    if (verifiedOnly) {
      chips.push({ key: 'verified', label: 'Verified', onRemove: () => setVerifiedOnly(false) });
    }
    if (auctionOnly) {
      chips.push({ key: 'auction', label: 'Live Auctions', onRemove: () => setAuctionOnly(false) });
    }
    if (buyNowOnly) {
      chips.push({ key: 'buyNow', label: 'Buy Now', onRemove: () => setBuyNowOnly(false) });
    }
    if (condition) {
      chips.push({ key: 'condition', label: condition, onRemove: () => setCondition('') });
    }
    if (location) {
      chips.push({ key: 'location', label: location, onRemove: () => setLocation('') });
    }
    if (minPrice || maxPrice) {
      const priceLabel = minPrice && maxPrice ? `₹${minPrice} - ₹${maxPrice}` : minPrice ? `Min ₹${minPrice}` : `Max ₹${maxPrice}`;
      chips.push({ key: 'price', label: priceLabel, onRemove: () => { setMinPrice(''); setMaxPrice(''); } });
    }

    return chips;
  }, [auctionOnly, buyNowOnly, category, condition, location, maxPrice, minPrice, query, rating, seller, verifiedOnly]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (page === 1) return [1, 2, 3];
    if (page === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [page - 1, page, page + 1];
  }, [page, totalPages]);

  return (
    <SectionShell title="Marketplace" subtitle="Browse categories and curated listings">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <Sidebar theme="dark">
          <FilterSidebar
            query={query}
            setQuery={(v) => { setQuery(v); setPage(1); }}
            category={category}
            setCategory={(v) => { setCategory(v); setPage(1); }}
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
            resetFilters={resetFilters}
          />
        </Sidebar>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-400">{filtered.length} results</p>
              <div className="h-6 w-px bg-white/5" />
              <div className="text-sm text-slate-300">View</div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-300">
                <button type="button" onClick={() => setGrid(true)} className={`rounded-full p-2 transition ${grid ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`} aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setGrid(false)} className={`rounded-full p-2 transition ${!grid ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`} aria-label="List view">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <Sparkles className="mr-2 h-4 w-4 text-amber-300" />
              Curated marketplace picks
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryChips.map((chip) => {
              const isActive = chip.value === 'auction' ? auctionOnly : category === chip.value;
              return (
                <button
                  type="button"
                  key={chip.label}
                  onClick={() => {
                    if (chip.value === 'auction') {
                      setAuctionOnly(true);
                      setCategory('');
                    } else {
                      setCategory(chip.value);
                      setAuctionOnly(false);
                    }
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all duration-250 ${isActive ? 'border-blue-400/40 bg-blue-500/15 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'}`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
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

          <div className={`${grid ? 'grid grid-cols-1 gap-4 justify-items-center sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}`}>
            {pageItems.map((product) => (
              <div key={product.id} className={`${grid ? 'w-full max-w-[340px]' : 'rounded-[24px] border border-white/10 bg-slate-900/70 p-4'}`}>
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
                  currentBid={product.badge?.toLowerCase().includes('auction') ? product.price : undefined}
                  endsIn={product.badge?.toLowerCase().includes('auction') ? '02h 14m 26s' : undefined}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">Displaying {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} Listings</div>
            <div className="inline-flex items-center gap-2 text-sm text-slate-300">
              <button type="button" onClick={() => setPage(Math.max(1, page - 1))} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 disabled:opacity-50" disabled={page === 1}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              {visiblePages.map((pageNumber) => (
                <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} className={`h-10 w-10 rounded-full border transition ${page === pageNumber ? 'border-blue-400/40 bg-blue-500/15 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  {pageNumber}
                </button>
              ))}
              <button type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10 disabled:opacity-50" disabled={page === totalPages}>
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
