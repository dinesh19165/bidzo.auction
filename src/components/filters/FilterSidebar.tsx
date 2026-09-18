import { Input, Select, Checkbox } from '../forms/FormComponents';
import { Monitor, Search, User, Star, ShieldCheck, Gavel, ShoppingBag, Tag, Funnel, RefreshCw, Check } from 'lucide-react';
import { categoryLabel, type CategoryRecord } from '../../api/categoryApi';
import { useLocaleContext } from '../../context/LocaleContext';
import { useThemeContext } from '../../context/ThemeContext';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function FilterSidebar({
  query,
  setQuery,
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  seller,
  setSeller,
  rating,
  setRating,
  verifiedOnly,
  setVerifiedOnly,
  auctionOnly,
  setAuctionOnly,
  buyNowOnly,
  setBuyNowOnly,
  condition,
  setCondition,
  location,
  setLocation,
  sort,
  setSort,
  categories,
  categoriesLoading = false,
  categoriesError,
  applyFilters,
  resetFilters,
}: {
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  seller: string;
  setSeller: (v: string) => void;
  rating: string;
  setRating: (v: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  auctionOnly: boolean;
  setAuctionOnly: (v: boolean) => void;
  buyNowOnly: boolean;
  setBuyNowOnly: (v: boolean) => void;
  condition: string;
  setCondition: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  categories: CategoryRecord[];
  categoriesLoading?: boolean;
  categoriesError?: string | null;
  applyFilters: () => void;
  resetFilters: () => void;
}) {
  // Generic custom dropdown matching dark theme
  function Dropdown({ label, options, value, onChange, icon, themeAware = false }: { label?: string; options: Array<{ label: string; value: string }>; value?: string; onChange: (v: string) => void; icon?: any; themeAware?: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const handleDocument = useCallback((e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }, []);

    useEffect(() => {
      document.addEventListener('mousedown', handleDocument);
      return () => document.removeEventListener('mousedown', handleDocument);
    }, [handleDocument]);

    const toggle = () => setOpen((v) => !v);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    return (
      <div className="relative w-full" ref={ref} onKeyDown={onKey}>
        {label && <div className={`mb-2 block text-sm font-medium ${themeAware && theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{label}</div>}
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex w-full items-center justify-between gap-3 min-h-[48px] rounded-2xl border px-4 py-3 text-sm outline-none ${themeAware && theme === 'light' ? 'border-slate-200 bg-white text-slate-900 shadow-sm' : 'border-white/10 bg-slate-950/60 text-white'}`}
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className={`text-sm ${themeAware && theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{options.find((o) => o.value === value)?.label ?? options[0]?.label}</span>
          </div>
          <svg className={`h-4 w-4 text-slate-300 transition-transform duration-150 ${open ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="none">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* dropdown menu */}
        <div
          className={`absolute left-0 mt-2 z-50 w-full origin-top-right transform transition-all duration-150 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          style={themeAware && theme === 'light' ? { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, boxShadow: '0 12px 30px rgba(15,23,42,.12)' } : { background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.45)' }}
          role="listbox"
        >
          <ul className="max-h-60 overflow-auto">
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex h-11 cursor-pointer items-center justify-between px-4 font-medium ${themeAware && theme === 'light' ? (selected ? 'bg-blue-100 text-slate-900' : 'text-slate-800 hover:bg-slate-100 hover:text-slate-900') : `text-white ${selected ? 'bg-[#1e3a8a]' : 'hover:bg-[#2563EB] hover:text-white'}`}`}
                >
                  <span>{opt.label}</span>
                  {selected ? <Check className={`h-4 w-4 ${themeAware && theme === 'light' ? 'text-blue-600' : 'text-white'}`} /> : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
  const { translate, currencySymbol } = useLocaleContext();
  const { theme } = useThemeContext();

  return (
    <div className="marketplace-filter-panel space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <Funnel className="h-4 w-4 text-blue-300" />
          <h3 className="text-lg font-semibold">{translate('filters')}</h3>
        </div>
        <button type="button" onClick={resetFilters} className="text-sm text-slate-400 transition hover:text-white">{translate('reset')}</button>
      </div>

      <div className="mt-2 space-y-3">
        <Input ariaLabel="Search products" icon={<Search className="h-4 w-4 text-slate-400" />} placeholder="Search products, auctions, sellers..." value={query} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
            <Dropdown themeAware label={translate('category')} options={[{ label: translate('allCategories'), value: '' }, ...(categoriesLoading ? [{ label: 'Loading categories...', value: '__loading__' }] : categories.map((c) => ({ label: categoryLabel(c), value: String(c.id) })))]} value={category} onChange={(v) => { if (v !== '__loading__') setCategory(v); }} icon={<Monitor className="h-4 w-4 text-slate-400" />} />
            {categoriesError ? <p className="mt-1 text-xs text-rose-300">Unable to load categories.</p> : null}

        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
          <Input ariaLabel="Minimum price" placeholder="Min price" value={minPrice} onChange={(e: ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value)} icon={<span className="text-slate-400">{currencySymbol}</span>} />
          <Input ariaLabel="Maximum price" placeholder="Max price" value={maxPrice} onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value)} icon={<span className="text-slate-400">{currencySymbol}</span>} />
        </div>

        <Input ariaLabel="Seller name" icon={<User className="h-4 w-4 text-slate-400" />} placeholder="Search seller" value={seller} onChange={(e: ChangeEvent<HTMLInputElement>) => setSeller(e.target.value)} />

            <Dropdown label="Rating" options={[{ label: 'Any', value: '' }, { label: '4+', value: '4' }, { label: '4.5+', value: '4.5' }, { label: '4.8+', value: '4.8' }]} value={rating} onChange={(v) => setRating(v)} icon={<Star className="h-4 w-4 text-amber-300" />} />

        <div className="space-y-2">
          <Checkbox
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="group flex h-12 w-full cursor-pointer items-center rounded-xl px-3 transition-all duration-200 ease-out transform"
            label={
              <div className="flex items-center gap-[14px]">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-medium text-white">Verified sellers only</span>
              </div>
            }
          />

          <Checkbox
            checked={auctionOnly}
            onChange={(e) => setAuctionOnly(e.target.checked)}
            className="group flex h-12 w-full cursor-pointer items-center rounded-xl px-3 transition-all duration-200 ease-out transform"
            label={
              <div className="flex items-center gap-[14px]">
                <Gavel className="h-5 w-5 text-violet-400" />
                <span className="text-sm font-medium text-white">Auctions only</span>
              </div>
            }
          />

          <Checkbox
            checked={buyNowOnly}
            onChange={(e) => setBuyNowOnly(e.target.checked)}
            className="group flex h-12 w-full cursor-pointer items-center rounded-xl px-3 transition-all duration-200 ease-out transform"
            label={
              <div className="flex items-center gap-[14px]">
                <ShoppingBag className="h-5 w-5 text-blue-300" />
                <span className="text-sm font-medium text-white">{translate('buyNowOnly')}</span>
              </div>
            }
          />
        </div>

            <Dropdown label="Condition" options={[{ label: translate('any'), value: '' }, { label: 'New Listing', value: 'New Listing' }, { label: 'Like New', value: 'Like New' }, { label: 'Excellent', value: 'Excellent' }, { label: 'Certified', value: 'Certified' }]} value={condition} onChange={(v) => setCondition(v)} icon={<Tag className="h-4 w-4 text-slate-400" />} />

        <Input ariaLabel="Location" icon={<span className="h-4 w-4 text-slate-400">📍</span>} placeholder={translate('location')} value={location} onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} />

            <Dropdown label={translate('sortBy')} options={[{ label: '⇅ Relevance', value: 'relevance' }, { label: '🕒 Newest', value: 'newest' }, { label: '💰 Price Low to High', value: 'price_asc' }, { label: '💎 Premium', value: 'rating' }]} value={sort} onChange={(v) => setSort(v)} icon={<Funnel className="h-4 w-4 text-slate-400" />} />

        <div className={`sticky bottom-0 z-10 -mx-1 mt-3 flex gap-3 border-t pt-3 ${theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <button type="button" onClick={resetFilters} className="inline-flex h-12 min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-transparent px-4 text-sm font-medium text-slate-300 transition hover:bg-white/10">
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
          <button type="button" onClick={applyFilters} className="inline-flex h-12 min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500">
            <Funnel className="h-4 w-4" /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
