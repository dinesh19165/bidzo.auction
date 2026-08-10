import { Input, Select, Checkbox } from '../forms/FormComponents';
import { Monitor, Search, User, Star, ShieldCheck, Gavel, ShoppingBag, Tag, Funnel, RefreshCw, Check } from 'lucide-react';
import { categories } from '../../data/mockData';
import { useLocaleContext } from '../../context/LocaleContext';
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
  resetFilters: () => void;
}) {
  // Generic custom dropdown matching dark theme
  function Dropdown({ label, options, value, onChange, icon }: { label?: string; options: Array<{ label: string; value: string }>; value?: string; onChange: (v: string) => void; icon?: any }) {
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
        {label && <div className="mb-2 block text-sm font-medium text-slate-200">{label}</div>}
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm text-white">{options.find((o) => o.value === value)?.label ?? options[0]?.label}</span>
          </div>
          <svg className={`h-4 w-4 text-slate-300 transition-transform duration-150 ${open ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="none">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* dropdown menu */}
        <div
          className={`absolute left-0 mt-2 z-50 w-full origin-top-right transform transition-all duration-150 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          style={{
            background: '#0F172A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,.45)',
          }}
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
                  className={`flex h-11 cursor-pointer items-center justify-between px-4 text-white font-medium ${selected ? 'bg-[#1e3a8a]' : 'hover:bg-[#2563EB] hover:text-white'}`}
                >
                  <span>{opt.label}</span>
                  {selected ? <Check className="h-4 w-4 text-white" /> : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
  const { translate, currencySymbol } = useLocaleContext();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <Funnel className="h-4 w-4 text-blue-300" />
          <h3 className="text-lg font-semibold">{translate('filters')}</h3>
        </div>
        <button type="button" onClick={resetFilters} className="text-sm text-slate-400 transition hover:text-white">{translate('reset')}</button>
      </div>

      <div className="mt-2 space-y-3">
        <Input ariaLabel="Search products" icon={<Search className="h-4 w-4 text-slate-400" />} placeholder={translate('searchPlaceholder')} value={query} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
            <Dropdown label={translate('category')} options={[{ label: translate('allCategories'), value: '' }, ...categories.slice(0, 12).map((c: string) => ({ label: c, value: c }))]} value={category} onChange={(v) => { setCategory(v); }} icon={<Monitor className="h-4 w-4 text-slate-400" />} />

        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
          <Input ariaLabel="Minimum price" placeholder={translate('minPrice')} value={minPrice} onChange={(e: ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value)} icon={<span className="text-slate-400">{currencySymbol}</span>} />
          <Input ariaLabel="Maximum price" placeholder={translate('maxPrice')} value={maxPrice} onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value)} icon={<span className="text-slate-400">{currencySymbol}</span>} />
        </div>

        <Input ariaLabel="Seller name" icon={<User className="h-4 w-4 text-slate-400" />} placeholder={translate('seller')} value={seller} onChange={(e: ChangeEvent<HTMLInputElement>) => setSeller(e.target.value)} />

            <Dropdown label="Rating" options={[{ label: 'Any', value: '' }, { label: '4+', value: '4' }, { label: '4.5+', value: '4.5' }, { label: '4.8+', value: '4.8' }]} value={rating} onChange={(v) => setRating(v)} icon={<Star className="h-4 w-4 text-amber-300" />} />

        <div className="space-y-2">
          <Checkbox
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="group flex items-center h-14 w-full cursor-pointer rounded-[18px] px-4 transition-all duration-200 ease-out transform"
            label={
              <div className="flex items-center gap-[14px]">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <span className="text-[16px] font-medium text-white">{translate('verifiedSellersOnly')}</span>
              </div>
            }
          />

          <Checkbox
            checked={auctionOnly}
            onChange={(e) => setAuctionOnly(e.target.checked)}
            className="group flex items-center h-14 w-full cursor-pointer rounded-[18px] px-4 transition-all duration-200 ease-out transform"
            label={
              <div className="flex items-center gap-[14px]">
                <Gavel className="h-5 w-5 text-violet-400" />
                <span className="text-[16px] font-medium text-white">{translate('auctionsOnly')}</span>
              </div>
            }
          />

          <Checkbox
            checked={buyNowOnly}
            onChange={(e) => setBuyNowOnly(e.target.checked)}
            className="group flex items-center h-14 w-full cursor-pointer rounded-[18px] px-4 transition-all duration-200 ease-out transform"
            label={
              <div className="flex items-center gap-[14px]">
                <ShoppingBag className="h-5 w-5 text-blue-300" />
                <span className="text-[16px] font-medium text-white">{translate('buyNowOnly')}</span>
              </div>
            }
          />
        </div>

            <Dropdown label="Condition" options={[{ label: translate('any'), value: '' }, { label: 'New Listing', value: 'New Listing' }, { label: 'Like New', value: 'Like New' }, { label: 'Excellent', value: 'Excellent' }, { label: 'Certified', value: 'Certified' }]} value={condition} onChange={(v) => setCondition(v)} icon={<Tag className="h-4 w-4 text-slate-400" />} />

        <Input ariaLabel="Location" icon={<span className="h-4 w-4 text-slate-400">📍</span>} placeholder={translate('location')} value={location} onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} />

            <Dropdown label={translate('sortBy')} options={[{ label: '⇅ Relevance', value: 'relevance' }, { label: '🕒 Newest', value: 'newest' }, { label: '💰 Price Low to High', value: 'price_asc' }, { label: '💎 Premium', value: 'rating' }]} value={sort} onChange={(v) => setSort(v)} icon={<Funnel className="h-4 w-4 text-slate-400" />} />

        <div className="mt-2 flex items-center gap-3">
          <button onClick={resetFilters} className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500">
            <Funnel className="h-4 w-4" /> {translate('applyFilters')}
          </button>
          <button onClick={resetFilters} className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10">
            <RefreshCw className="h-4 w-4" /> {translate('resetAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
