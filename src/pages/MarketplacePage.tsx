import { SectionShell } from '../components/SectionShell';
import { categories, products } from '../data/mockData';
import { SearchBar, Input, Select, Checkbox } from '../components/forms/FormComponents';
import { Sidebar } from '../components/layout/LayoutComponents';
import { ProductCard } from '../components/cards/MarketplaceCards';
import { useMemo, useState } from 'react';

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

  return (
    <SectionShell title="Marketplace" subtitle="Browse categories and curated listings">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Sidebar theme="dark">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button onClick={() => { setCategory(''); setMinPrice(''); setMaxPrice(''); setSeller(''); setRating(''); setVerifiedOnly(false); setAuctionOnly(false); setBuyNowOnly(false); setCondition(''); setLocation(''); setSort('relevance'); setPage(1); }} className="text-sm text-slate-400">Reset</button>
          </div>

          <div className="mt-4 space-y-3">
            <Input placeholder="Search listings, categories, or sellers" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
            <Select label="Category" options={[{ label: 'All', value: '' }, ...categories.slice(0, 12).map((c) => ({ label: c, value: c }))]} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <Input placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
            <Input placeholder="Seller" value={seller} onChange={(e) => setSeller(e.target.value)} />
            <Select label="Rating" options={[{ label: 'Any', value: '' }, { label: '4+', value: '4' }, { label: '4.5+', value: '4.5' }, { label: '4.8+', value: '4.8' }]} value={rating} onChange={(e) => setRating(e.target.value)} />
            <Checkbox label="Verified sellers only" />
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={auctionOnly} onChange={(e) => setAuctionOnly(e.target.checked)} className="h-4 w-4 rounded" /> Auctions only</label>
              <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={buyNowOnly} onChange={(e) => setBuyNowOnly(e.target.checked)} className="h-4 w-4 rounded" /> Buy now only</label>
            </div>
            <Select label="Condition" options={[{ label: 'Any', value: '' }, { label: 'New Listing', value: 'New Listing' }, { label: 'Like New', value: 'Like New' }, { label: 'Excellent', value: 'Excellent' }, { label: 'Certified', value: 'Certified' }]} value={condition} onChange={(e) => setCondition(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Select label="Sort by" options={[{ label: 'Relevance', value: 'relevance' }, { label: 'Price: Low → High', value: 'price_asc' }, { label: 'Price: High → Low', value: 'price_desc' }, { label: 'Rating', value: 'rating' }]} value={sort} onChange={(e) => setSort(e.target.value)} />
          </div>
        </Sidebar>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-400">{filtered.length} results</p>
              <div className="h-6 w-px bg-white/5" />
              <div className="text-sm text-slate-300">View</div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-300">
                <button onClick={() => setGrid(true)} className={`${grid ? 'text-white' : 'text-slate-400'}`}>Grid</button>
                <button onClick={() => setGrid(false)} className={`${!grid ? 'text-white' : 'text-slate-400'}`}>List</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-400">Page</div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-300">
                <button onClick={() => setPage(Math.max(1, page - 1))} className="px-2">◀</button>
                <span className="px-2">{page}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="px-2">▶</button>
              </div>
            </div>
          </div>

          <div className={`${grid ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}`}>
            {pageItems.map((product) => (
              <div key={product.id} className={`${grid ? '' : 'rounded-[24px] border border-white/10 bg-slate-900/70 p-4'}`}>
                {(() => {
                  const p: any = product;
                  return (
                    <ProductCard id={p.id} title={p.title} description={p.description} image={p.image} price={p.price} category={p.category} condition={p.condition} seller={p.seller} rating={p.rating} reviews={p.reviews} verified={p.verified} badge={p.badge} location={p.location} currentBid={p.currentBid} endsIn={p.endsIn} />
                  );
                })()}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-400">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</div>
            <div className="inline-flex items-center gap-2 text-sm text-slate-300">
              <button onClick={() => setPage(1)} className="px-3 py-1 rounded bg-white/5">First</button>
              <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1 rounded bg-white/5">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="px-3 py-1 rounded bg-white/5">Next</button>
              <button onClick={() => setPage(totalPages)} className="px-3 py-1 rounded bg-white/5">Last</button>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
