import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { EmptyState, ErrorState, SkeletonCard } from '../../components/loading/LoadingComponents';
import { getMarketplaceCategories, searchMarketplace, type MarketplaceCategory, type MarketplaceSearchPage, type MarketplaceSearchResult } from '../../api/marketplaceSearchApi';
import { API_BASE_URL } from '../../api/apiClient';
import { products, categories } from '../../data/mockData';

export function CategoriesPage() {
  return (
    <SectionShell title="Categories" subtitle="Browse by vertical and intent">
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <div key={category} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">{category}</div>
        ))}
      </div>
    </SectionShell>
  );
}

export function SubCategoriesPage() {
  return (
    <SectionShell title="Sub categories" subtitle="Details for niche discovery">
      <div className="grid gap-4 md:grid-cols-3">
        {['Smartphones', 'Gaming', 'Office Equipment', 'Classic Vehicles', 'Luxury Jewelry', 'Industrial Tools'].map((item) => (
          <div key={item} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">{item}</div>
        ))}
      </div>
    </SectionShell>
  );
}

export function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const category = params.get('category') || 'All Categories';
  const page = Math.max(0, Number(params.get('page') || 0));
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [results, setResults] = useState<MarketplaceSearchPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMarketplaceCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    if (!query.trim() && category === 'All Categories') {
      setResults(null);
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setError(null);
    searchMarketplace({ query, category, page, size: 20 }).then((data) => {
      if (active) setResults(data);
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Marketplace search failed');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [category, page, query]);

  const updateParams = (nextQuery: string, nextCategory: string) => {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set('q', nextQuery.trim());
    if (nextCategory !== 'All Categories') next.set('category', nextCategory);
    next.set('page', '0');
    setParams(next);
  };

  return <SectionShell title="Search results" subtitle="Products, auctions, and sellers from the marketplace">
    <div className="mb-6 grid gap-3 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 md:grid-cols-[1fr_240px_auto]">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"><Search className="h-4 w-4 text-slate-400" /><input aria-label="Search marketplace" defaultValue={query} onKeyDown={(event) => { if (event.key === 'Enter') updateParams(event.currentTarget.value, category); }} className="w-full bg-transparent text-sm text-white outline-none" placeholder="Search products, auctions, sellers..." /></div>
      <select aria-label="Search category" value={category} onChange={(event) => updateParams(query, event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"><option>All Categories</option>{categories.map((item) => <option key={item.id}>{item.name}</option>)}</select>
      <button type="button" onClick={() => updateParams(query, category)} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">Search</button>
    </div>
    {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div> : error ? <ErrorState title="Search failed" description={error} /> : results && results.content.length > 0 ? <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.content.map((item) => <MarketplaceResultCard key={`${item.type}-${item.id}`} item={item} />)}</div>
      <div className="mt-6 flex items-center justify-between text-sm text-slate-400"><span>{results.totalElements} results</span><div className="flex gap-2"><button type="button" disabled={results.first} onClick={() => setParams((current) => { current.set('page', String(Math.max(0, page - 1))); return current; })} className="rounded-full border border-white/10 px-4 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={results.last} onClick={() => setParams((current) => { current.set('page', String(page + 1)); return current; })} className="rounded-full border border-white/10 px-4 py-2 disabled:opacity-40">Next</button></div></div>
    </> : results ? <EmptyState title="No results found" description="Try a different search or category." /> : <EmptyState title="Search the marketplace" description="Enter a keyword or choose a category to find products, auctions, and sellers." />}
  </SectionShell>;
}

function MarketplaceResultCard({ item }: { item: MarketplaceSearchResult }) {
  const image = item.image && !item.image.includes('placeholder.com') ? item.image : '/logo.png';
  const href = item.type === 'AUCTION' ? `/auctions/${item.id}` : item.type === 'VENDOR' ? `/seller/${item.id}` : `/product/${item.id}`;
  const value = item.type === 'AUCTION' ? item.currentBid : item.price;
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-slate-300"><img src={image.startsWith('/') && !image.startsWith('/logo') ? `${API_BASE_URL}${image}` : image} alt={item.title} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo.png'; }} className="h-44 w-full rounded-2xl object-cover" /><p className="mt-4 text-xs uppercase tracking-[0.2em] text-blue-300">{item.type}</p><h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3><p className="mt-2 text-sm">{item.category?.name || item.vendor?.name || 'Marketplace result'}</p>{value !== null ? <p className="mt-4 text-lg font-semibold text-white">₹{Number(value).toLocaleString()}</p> : null}<Link to={href} className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">View details</Link></div>;
}

export function RecommendedPage() {
  return (
    <SectionShell title="Recommended" subtitle="Suggested for your buying journey">
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
            <h3 className="text-lg font-semibold text-white">{product.title}</h3>
            <p className="mt-2 text-sm">{product.price}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
