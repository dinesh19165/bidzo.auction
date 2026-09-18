import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Logo from './Logo';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Camera, Check, ChevronDown, Gavel, Globe, Grid2X2, Home, MapPin, Menu, Mic, Search, ShoppingBag, ShoppingCart, Store, Tag, UserRound, X } from 'lucide-react';
import { getPortalHome, isAdminUser, useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useLocaleContext } from '../context/LocaleContext';
import { Footer } from './Footer';
import { CategoryIcon } from './categories/CategoryIcon';
import { categoryLabel, getCategories, type CategoryRecord } from '../api/categoryApi';
import { searchMarketplace, type MarketplaceSearchResult } from '../api/marketplaceSearchApi';
import { API_BASE_URL } from '../api/apiClient';
import { NotificationList } from './notifications/NotificationList';
import { useNotificationContext } from '../context/NotificationContext';
import { useCartContext } from '../context/CartContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const headerDropdownsRef = useRef<HTMLDivElement>(null);
  const mobileUtilityRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useThemeContext();
  const { language, currency, languageLabel, currencyLabel, setLanguage, setCurrency, translate, formatCurrency } = useLocaleContext();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotificationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [headerSearch, setHeaderSearch] = useState('');
  const [headerCategory, setHeaderCategory] = useState('');
  const [headerLocation, setHeaderLocation] = useState('Hyderabad');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [marketplaceCategories, setMarketplaceCategories] = useState<CategoryRecord[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<MarketplaceSearchResult[]>([]);
  const [searchSuggestionsLoading, setSearchSuggestionsLoading] = useState(false);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const searchRequestGeneration = useRef(0);
  const isLiveAuctionsPage = location.pathname.startsWith('/auctions');
  const isDirectBuyPage = location.pathname.startsWith('/marketplace');
  const showMarketplaceControls = !user || user.type === 'customer' || user.role === 'CUSTOMER';
  useEffect(() => {
    let active = true;
    setCategoriesLoading(true);
    setCategoriesError(null);
    getCategories().then((categories) => {
      if (active) setMarketplaceCategories(categories);
    }).catch((error: unknown) => {
      if (!active) return;
      setMarketplaceCategories([]);
      setCategoriesError(error instanceof Error ? error.message : 'Unable to load categories.');
      console.error('[Bidzo marketplace] category dropdown failed to load', error);
    }).finally(() => {
      if (active) setCategoriesLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  const submitHeaderSearch = () => {
    const query = headerSearch.trim();
    if (!query && !headerCategory) return;
    const params = new URLSearchParams({ page: '0' });
    if (query) params.set('q', query);
    if (headerCategory) params.set('categoryId', headerCategory);
    navigate(`/search?${params.toString()}`);
  };
  const focusMobileSearch = () => {
    const input = document.querySelector('input[placeholder="Search products, auctions, sellers..."]') as HTMLInputElement | null;
    input?.focus();
  };
  useEffect(() => {
    const query = headerSearch.trim();
    const generation = ++searchRequestGeneration.current;
    if (query.length < 2) {
      setSearchSuggestions([]);
      setSearchSuggestionsLoading(false);
      setSearchSuggestionsOpen(false);
      return undefined;
    }

    setSearchSuggestions([]);
    setSearchSuggestionsLoading(true);
    setSearchSuggestionsOpen(true);
    const timer = window.setTimeout(() => {
      const selectedCategory = marketplaceCategories.find((item) => String(item.id) === headerCategory);
      searchMarketplace({ query, category: selectedCategory?.name, page: 0, size: 8 }).then((response) => {
        if (generation !== searchRequestGeneration.current) return;
        setSearchSuggestions(response.content.filter((item) => item.type === 'PRODUCT'));
      }).catch(() => {
        if (generation !== searchRequestGeneration.current) return;
        setSearchSuggestions([]);
      }).finally(() => {
        if (generation === searchRequestGeneration.current) setSearchSuggestionsLoading(false);
      });
    }, 280);

    return () => window.clearTimeout(timer);
  }, [headerCategory, headerSearch, marketplaceCategories]);

  useEffect(() => {
    const handleSearchOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest('[data-header-search]')) setSearchSuggestionsOpen(false);
    };
    document.addEventListener('pointerdown', handleSearchOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleSearchOutsidePointer);
  }, []);

  const suggestionImageUrl = (value: string | null) => {
    if (!value) return '/logo.png';
    if (/^https?:\/\//i.test(value) || value.startsWith('/logo')) return value;
    return value.startsWith('/') ? `${API_BASE_URL}${value}` : `${API_BASE_URL}/${value}`;
  };
  const renderSearchSuggestions = () => {
    if (!searchSuggestionsOpen || headerSearch.trim().length < 2) return null;
    return <div role="listbox" aria-label="Search suggestions" className={`absolute left-0 right-0 top-full z-[70] mt-2 max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto rounded-xl border p-2 shadow-2xl ${theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
      {searchSuggestionsLoading ? <p className={`px-3 py-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Searching...</p> : searchSuggestions.length === 0 ? <p className={`px-3 py-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>No products found</p> : searchSuggestions.map((item) => <button key={`${item.type}-${item.id}`} type="button" role="option" onClick={() => { setSearchSuggestionsOpen(false); navigate(`/product/${item.id}`); }} className={`flex w-full min-w-0 items-center gap-3 rounded-lg p-2 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}>
        <img src={suggestionImageUrl(item.image)} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.title}</span><span className={`mt-0.5 block truncate text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.category?.name || 'Category unavailable'}</span><span className="mt-1 block truncate text-xs font-medium text-emerald-500">{item.price === null ? 'Price unavailable' : `₹${Number(item.price).toLocaleString('en-IN')}`}{item.availableQuantity !== null && item.availableQuantity !== undefined ? ` · ${item.availableQuantity} available` : ''}</span></span>
      </button>)}
    </div>;
  };
  const languageOptions = [
    { key: 'en', label: 'English' },
    { key: 'hi', label: 'Hindi' },
    { key: 'te', label: 'Telugu' },
    { key: 'ta', label: 'Tamil' },
    { key: 'kn', label: 'Kannada' },
    { key: 'ml', label: 'Malayalam' },
    { key: 'bn', label: 'Bengali' },
    { key: 'mr', label: 'Marathi' },
  ] as const;

  const currencyOptions = [
    { key: 'INR', label: 'INR ₹' },
    { key: 'USD', label: 'USD $' },
    { key: 'EUR', label: 'EUR €' },
    { key: 'GBP', label: 'GBP £' },
    { key: 'AED', label: 'AED د.إ' },
  ] as const;

  // Mobile-only links: keep only essential customer-facing items and hide vendor/admin links on mobile
  const mobileLinks = [
    { to: '/', label: 'Home' },
    { to: '/auctions', label: 'Live Auctions' },
    { to: '/marketplace', label: 'Direct Buy' },
    { to: '/login', label: 'Login' },
    // vendor/admin and other non-essential links intentionally omitted for mobile
  ];

  useEffect(() => {
    if (!languageMenuOpen && !currencyMenuOpen && !mobileProfileOpen && !categoryMenuOpen) {
      return;
    }

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!headerDropdownsRef.current?.contains(target) && !mobileUtilityRef.current?.contains(target) && !mobileProfileRef.current?.contains(target) && !categoryMenuRef.current?.contains(target)) {
        setLanguageMenuOpen(false);
        setCurrencyMenuOpen(false);
        setMobileProfileOpen(false);
        setCategoryMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [languageMenuOpen, currencyMenuOpen, mobileProfileOpen, categoryMenuOpen]);

  return (
    <div className="app-shell min-h-screen overflow-x-hidden transition-colors duration-300">
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-950/95 shadow-black/20' : 'border-slate-200 bg-white/95 shadow-slate-200/10'}`}>
        <div className={`border-b transition duration-300 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <div className={`mx-auto hidden flex-col gap-0 px-4 py-0 text-xs transition duration-300 md:flex ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8`}>
            <p className={`inline-flex flex-wrap items-center gap-1.5 rounded-full px-2.5 py-0 text-sm font-medium transition duration-300 ${theme === 'dark' ? 'bg-blue-500/10 text-slate-100' : 'bg-slate-100 text-slate-950 border border-slate-200'}`}>
              <span className="font-medium">{translate('freeShipping')}</span>
              <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{translate('onOrdersOver', { amount: '₹5,000' })}</span>
            </p>
            <div ref={headerDropdownsRef} className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLanguageMenuOpen((value) => !value);
                    setCurrencyMenuOpen(false);
                    setMobileProfileOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition duration-300 ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                  aria-expanded={languageMenuOpen}
                  aria-label="Select language"
                >
                  <Globe className="h-3.5 w-3.5" /> {languageLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {languageMenuOpen ? (
                  <div className={`absolute left-0 top-full z-[60] mt-2 w-48 overflow-hidden rounded-xl border p-1 shadow-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950 shadow-black/40' : 'border-slate-200 bg-white shadow-slate-200/40'}`}>
                    {languageOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setLanguage(option.key);
                          setLanguageMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-left text-sm transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}
                      >
                        <span>{option.label}</span>
                        {language === option.key ? <Check className="h-4 w-4 text-emerald-400" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCurrencyMenuOpen((value) => !value);
                    setLanguageMenuOpen(false);
                    setMobileProfileOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition duration-300 ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                  aria-expanded={currencyMenuOpen}
                  aria-label="Select currency"
                >
                  {currencyLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {currencyMenuOpen ? (
                  <div className={`absolute left-0 top-full z-[60] mt-2 w-48 overflow-hidden rounded-xl border p-1 shadow-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950 shadow-black/40' : 'border-slate-200 bg-white shadow-slate-200/40'}`}>
                    {currencyOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setCurrency(option.key);
                          setCurrencyMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-left text-sm transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}
                      >
                        <span>{option.label}</span>
                        {currency === option.key ? <Check className="h-4 w-4 text-emerald-400" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`theme-toggle-pill inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-300 ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50'}`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
              </button>
              <Link to="/help" className={`rounded-full px-3 py-1 transition duration-300 ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-900 hover:text-slate-700'}`}>
                {translate('help')}
              </Link>
            </div>
          </div>
        </div>

        <div ref={mobileUtilityRef} className={`relative flex flex-wrap items-center gap-2 border-t px-3 py-2 md:hidden ${theme === 'dark' ? 'border-white/10 bg-slate-950/90' : 'border-slate-200 bg-white/95'}`}>
          <div className="relative min-w-0 flex-1">
            <button type="button" onClick={() => { setLanguageMenuOpen((value) => !value); setCurrencyMenuOpen(false); setMobileProfileOpen(false); }} aria-expanded={languageMenuOpen} aria-label="Select language" className={`flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border px-2 text-xs font-medium ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}>
              <Globe className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{languageLabel}</span><ChevronDown className="h-3 w-3 shrink-0" />
            </button>
            {languageMenuOpen ? <div className={`absolute left-0 top-full z-[70] mt-2 w-44 overflow-hidden rounded-xl border p-1 shadow-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}>
              {languageOptions.map((option) => <button key={option.key} type="button" onClick={() => { setLanguage(option.key); setLanguageMenuOpen(false); }} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}><span>{option.label}</span>{language === option.key ? <Check className="h-4 w-4 text-emerald-400" /> : null}</button>)}
            </div> : null}
          </div>
          <div className="relative min-w-0 flex-1">
            <button type="button" onClick={() => { setCurrencyMenuOpen((value) => !value); setLanguageMenuOpen(false); setMobileProfileOpen(false); }} aria-expanded={currencyMenuOpen} aria-label="Select currency" className={`flex min-h-10 w-full items-center justify-center gap-1 rounded-lg border px-2 text-xs font-medium ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}>
              <span className="shrink-0">₹</span><span className="truncate">{currencyLabel}</span><ChevronDown className="h-3 w-3 shrink-0" />
            </button>
            {currencyMenuOpen ? <div className={`absolute right-0 top-full z-[70] mt-2 w-44 overflow-hidden rounded-xl border p-1 shadow-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}>
              {currencyOptions.map((option) => <button key={option.key} type="button" onClick={() => { setCurrency(option.key); setCurrencyMenuOpen(false); }} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}><span>{option.label}</span>{currency === option.key ? <Check className="h-4 w-4 text-emerald-400" /> : null}</button>)}
            </div> : null}
          </div>
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className={`inline-flex min-h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/help" onClick={() => { setLanguageMenuOpen(false); setCurrencyMenuOpen(false); }} className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border px-3 text-xs font-medium ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}>{translate('help')}</Link>
        </div>

  <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          {/* Logo component: uses /logo.png if present in public/, falls back to text */}
          <div>
            {/* Shared header: logo always shown and links to home */}
            <Link to="/" className="inline-flex items-center flex-shrink-0">
              {/* Slightly smaller logo on mobile to avoid horizontal overflow */}
              <Logo className="w-[110px] sm:w-[150px] h-auto object-contain" />
           </Link>
          </div>

          {showMarketplaceControls ? <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
            <label className={`inline-flex h-12 w-[160px] shrink-0 items-center gap-2 rounded-2xl border px-3 text-sm ${theme === 'dark' ? 'border-white/10 bg-slate-900/70 text-slate-100' : 'border-slate-200 bg-white text-slate-900 shadow-sm'}`}><MapPin className="h-4 w-4 text-blue-500" /><select aria-label="Location" value={headerLocation} onChange={(event) => setHeaderLocation(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none"><option>Hyderabad</option><option>Bengaluru</option><option>Mumbai</option><option>Delhi</option></select></label>
            <div ref={categoryMenuRef} className="relative min-w-0 w-[220px] shrink-0">
              <button type="button" aria-label="Category" aria-haspopup="listbox" aria-expanded={categoryMenuOpen} onClick={() => setCategoryMenuOpen((value) => !value)} onKeyDown={(event) => { if (event.key === 'Escape') setCategoryMenuOpen(false); if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setCategoryMenuOpen(true); } }} title={categoriesError ?? undefined} className="flex h-12 min-h-12 max-h-12 w-full items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3 text-left text-white shadow-sm transition hover:bg-slate-800">
                <span className="flex min-w-0 items-center gap-2"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${theme === 'dark' ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700'}`}><CategoryIcon iconUrl={marketplaceCategories.find((item) => String(item.id) === headerCategory)?.iconUrl} className="h-7 w-7" imageClassName="h-8 w-8 p-0" /></span><span className="truncate text-sm">{marketplaceCategories.find((item) => String(item.id) === headerCategory)?.name || 'All Categories'}</span></span><ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
              {categoryMenuOpen ? <div role="listbox" aria-label="Categories" onKeyDown={(event) => { if (event.key === 'Escape') setCategoryMenuOpen(false); }} className={`absolute left-0 top-full z-[60] mt-2 max-h-80 w-full overflow-y-auto overflow-x-hidden rounded-2xl border p-1 shadow-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                <button type="button" role="option" aria-selected={!headerCategory} onClick={() => { setHeaderCategory(''); setCategoryMenuOpen(false); }} className={`flex min-h-[60px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${!headerCategory ? 'bg-blue-500/10 text-blue-200' : theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"><CategoryIcon className="h-9 w-9" /></span><span className="truncate">All Categories</span></button>
                {categoriesLoading ? <p className="px-3 py-2 text-xs text-slate-400">Loading categories...</p> : marketplaceCategories.map((item) => <button key={item.id} type="button" role="option" aria-selected={String(item.id) === headerCategory} onClick={() => { setHeaderCategory(String(item.id)); setCategoryMenuOpen(false); }} className={`flex min-h-[60px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${String(item.id) === headerCategory ? 'bg-blue-500/10 text-blue-200' : theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"><CategoryIcon iconUrl={item.iconUrl} className="h-9 w-9" imageClassName="h-10 w-10 p-0" /></span><span className="truncate">{item.name}</span></button>)}
              </div> : null}
            </div>
            <div data-header-search className={`relative flex h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3 transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white shadow-sm'}`}>
              <button type="button" aria-label="Search marketplace" onClick={submitHeaderSearch} className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2 transition ${theme === 'dark' ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                <Search className="h-4 w-4" />
              </button>
              <input
                ref={desktopSearchRef}
                value={headerSearch}
                onChange={(event) => setHeaderSearch(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') submitHeaderSearch(); }}
                placeholder="Search products, auctions, sellers..."
                className={`w-full bg-transparent text-sm outline-none transition duration-300 ${theme === 'dark' ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`}
              />
              <button type="button" aria-label="Visual search" onClick={() => desktopSearchRef.current?.focus()} className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2 transition ${theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}><Camera className="h-4 w-4" /></button>
              <button type="button" aria-label="Voice search" onClick={() => desktopSearchRef.current?.focus()} className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2 transition ${theme === 'dark' ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                <Mic className="h-4 w-4" />
              </button>
              {renderSearchSuggestions()}
            </div>
          </div> : null}

          <div className="hidden items-center gap-3 md:flex">
            <AuthActions />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 md:hidden">
            {showMarketplaceControls ? <>
              <button type="button" aria-label="Notifications" onClick={() => navigate(user?.type === 'vendor' ? '/vendor/notifications' : '/customer/notifications')} className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-900'}`}><Bell className="h-4 w-4" />{unreadCount > 0 ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span> : null}</button>
              <Link to="/customer/offers" aria-label="Offers" className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-900'}`}><Tag className="h-4 w-4" /></Link>
            </> : null}
          </div>
        </div>

        {showMarketplaceControls ? (
          <div className={`border-t px-4 py-3 md:hidden transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
            <div data-header-search className={`relative flex items-center gap-2 rounded-2xl border px-3 py-2 ${theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-slate-200 bg-slate-100'}`}>
              <Search className={`h-4 w-4 shrink-0 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-900'}`} />
              <input value={headerSearch} onChange={(event) => setHeaderSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitHeaderSearch(); }} placeholder="Search products, auctions, sellers..." className={`w-full min-w-0 bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`} />
              <button type="button" aria-label="Visual search" onClick={focusMobileSearch} className="shrink-0 text-slate-400"><Camera className="h-4 w-4" /></button>
              <button type="button" aria-label="Voice search" onClick={focusMobileSearch} className="shrink-0 text-slate-400"><Mic className="h-4 w-4" /></button>
              {renderSearchSuggestions()}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 ${theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-slate-200 bg-slate-100'}`}><MapPin className="h-4 w-4 shrink-0 text-blue-500" /><select aria-label="Location" value={headerLocation} onChange={(event) => setHeaderLocation(event.target.value)} className={`min-w-0 w-full bg-transparent text-xs outline-none ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}><option>Hyderabad</option><option>Bengaluru</option><option>Mumbai</option><option>Delhi</option></select></label>
              <label className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 ${theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-slate-200 bg-slate-100'}`}><Grid2X2 className="h-4 w-4 shrink-0 text-blue-500" /><select aria-label="Category" value={headerCategory} onChange={(event) => setHeaderCategory(event.target.value)} className={`min-w-0 w-full bg-transparent text-xs outline-none ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}><option value="">All Categories</option>{categoriesLoading ? <option disabled>Loading categories...</option> : marketplaceCategories.map((item) => <option key={item.id} value={String(item.id)}>{categoryLabel(item)}</option>)}</select></label>
            </div>
          </div>
        ) : null}

        {showMarketplaceControls ? <nav className={`border-t px-4 py-2 transition duration-300 sm:px-6 lg:px-8 ${theme === 'dark' ? 'border-white/10 bg-slate-950/40' : 'border-slate-200 bg-white'}`} aria-label="Primary shopping navigation">
          <div className="mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link to="/auctions" className={`inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 sm:px-5 sm:text-sm ${isLiveAuctionsPage ? 'border-blue-200/50 bg-blue-500 shadow-blue-500/25' : 'border-blue-500/40 bg-blue-600 hover:bg-blue-500'}`}>
              <Gavel className="h-4 w-4" /> Live Auctions
            </Link>
            <Link to="/marketplace" className={`inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 sm:px-5 sm:text-sm ${isDirectBuyPage ? 'border-red-200/50 bg-red-500 shadow-red-500/25' : 'border-red-500/40 bg-red-600 hover:bg-red-500'}`}>
              <ShoppingBag className="h-4 w-4" /> Buy
            </Link>
            <Link to="/register/vendor" className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-emerald-200/40 bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-500 sm:px-5 sm:text-sm">
              <Tag className="h-4 w-4" /> Sell
            </Link>
          </div>
        </nav> : null}

      </header>

      <AnimatePresence>
        {showMarketplaceControls && mobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className={`fixed inset-0 z-40 backdrop-blur-sm transition duration-300 ${theme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-200/60'}`}
              aria-label="Close navigation menu"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className={`fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-sm flex-col border-r p-4 shadow-2xl transition duration-300 ${theme === 'dark' ? 'border-r border-white/10 bg-slate-950/95 shadow-black/40' : 'border-r border-slate-200 bg-white shadow-slate-200/80'}`}
            >
              <div className={`flex items-center justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <Link to="/" className="inline-flex items-center"><Logo /></Link>
                  </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2 overflow-y-auto pb-4">
                {mobileLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-[48px] items-center rounded-2xl border px-4 py-3 text-sm transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <main className="overflow-x-hidden pb-20 md:pb-0">{children}</main>

      <Footer />
      {showMarketplaceControls ? <><nav className={`fixed inset-x-0 bottom-0 z-40 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden ${theme === 'dark' ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95'} backdrop-blur-xl`} aria-label="Mobile navigation"><div className="grid grid-cols-5 gap-1"><Link to="/" className="mobile-nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px]"><Home className="h-4 w-4" />Home</Link><Link to="/customer/cart" className="mobile-nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px]"><ShoppingCart className="h-4 w-4" />Cart</Link><Link to="/categories" className="mobile-nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px]"><Grid2X2 className="h-4 w-4" />Categories</Link><button type="button" onClick={() => setMobileProfileOpen((value) => !value)} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] ${mobileProfileOpen ? 'text-blue-500' : 'mobile-nav-item'}`}><UserRound className="h-4 w-4" />Account</button><button type="button" onClick={() => setMobileMenuOpen(true)} className="mobile-nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px]"><Menu className="h-4 w-4" />More</button></div></nav>{mobileProfileOpen && user ? <div ref={mobileProfileRef} className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 max-h-[calc(100dvh-9rem)] overflow-y-auto overflow-x-hidden rounded-xl border p-3 shadow-2xl md:hidden ${theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}><Link to={user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer'} onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Dashboard</Link>{user.type === 'customer' ? <><Link to="/customer/orders" onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Orders</Link><Link to="/customer/wishlist" onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Wishlist</Link><Link to="/wallet" onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Wallet</Link><Link to="/customer/rewards" onClick={() => setMobileProfileOpen(false)} className={`block whitespace-normal break-words rounded-md px-3 py-2.5 text-sm leading-5 ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Rewards / Referral &amp; Earn</Link></> : null}<button onClick={() => { setMobileProfileOpen(false); logout(); }} className="mt-2 min-h-11 w-full rounded-md bg-amber-500 px-3 py-2.5 text-sm font-medium text-slate-950 hover:bg-amber-400">Logout</button></div> : null}</> : null}
    </div>
  );
}

function AuthActions() {
  const { user, logout } = useAuth();
  const { cart } = useCartContext();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationTriggerRef = useRef<HTMLDivElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const [notificationPosition, setNotificationPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const isAdmin = isAdminUser(user);
  const isCustomer = user?.type === 'customer' || user?.role === 'CUSTOMER';
  const cartItemCount = cart.items.reduce((total, item) => total + Math.max(0, Number(item.quantity) || 0), 0);
  const isNotificationUser = user?.type === 'customer' || user?.type === 'vendor';
  const { unreadCount, items, loading, error, refresh, markRead } = useNotificationContext();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!profileRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [open]);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    const handleOutsideNotificationPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!notificationTriggerRef.current?.contains(target) && !notificationPanelRef.current?.contains(target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideNotificationPointer);
    return () => document.removeEventListener('pointerdown', handleOutsideNotificationPointer);
  }, [notificationsOpen]);

  useLayoutEffect(() => {
    if (!notificationsOpen || !notificationTriggerRef.current) {
      return;
    }

    const updateNotificationPosition = () => {
      const triggerRect = notificationTriggerRef.current?.getBoundingClientRect();
      if (!triggerRect) {
        return;
      }

      const safeMargin = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const width = Math.min(380, Math.max(0, viewportWidth - safeMargin * 2));
      const left = Math.min(
        Math.max(safeMargin, triggerRect.right - width),
        Math.max(safeMargin, viewportWidth - safeMargin - width),
      );
      setNotificationPosition({ top: triggerRect.bottom + 8, left, width });
    };

    updateNotificationPosition();
    window.addEventListener('resize', updateNotificationPosition);
    window.addEventListener('scroll', updateNotificationPosition, true);
    return () => {
      window.removeEventListener('resize', updateNotificationPosition);
      window.removeEventListener('scroll', updateNotificationPosition, true);
    };
  }, [notificationsOpen]);

  useLayoutEffect(() => {
    if (!open || !profileRef.current || !menuRef.current) {
      return;
    }

    const updateMenuPosition = () => {
      const safeMargin = 12;
      const triggerRect = profileRef.current?.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();
      if (!triggerRect || !menuRect) {
        return;
      }

      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const availableHeight = Math.max(0, viewportHeight - safeMargin * 2);
      const menuWidth = Math.min(224, Math.max(0, viewportWidth - safeMargin * 2));
      const menuHeight = Math.min(menuRect.height, availableHeight);
      const spaceBelow = viewportHeight - triggerRect.bottom - safeMargin;
      const opensBelow = spaceBelow >= menuHeight || spaceBelow >= triggerRect.top - safeMargin;
      const top = opensBelow
        ? Math.min(triggerRect.bottom + 8, viewportHeight - safeMargin - menuHeight)
        : Math.max(safeMargin, triggerRect.top - 8 - menuHeight);
      const left = Math.min(
        Math.max(safeMargin, triggerRect.right - menuWidth),
        Math.max(safeMargin, viewportWidth - safeMargin - menuWidth),
      );

      setMenuPosition({ top, left, width: menuWidth, maxHeight: availableHeight });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  return (
    <div ref={profileRef} className="flex items-center gap-3">
      {isNotificationUser ? <div ref={notificationTriggerRef} className="relative">
        <button type="button" aria-label="Notifications" onClick={() => { setNotificationsOpen((value) => !value); if (!notificationsOpen) void refresh(); }} className="relative inline-flex items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 p-2 text-xs text-slate-200 hover:bg-white/10">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
        </button>
        {notificationsOpen ? createPortal(
          <div
            ref={notificationPanelRef}
            style={{
              position: 'fixed',
              top: notificationPosition?.top ?? 12,
              left: notificationPosition?.left ?? 12,
              width: notificationPosition?.width ?? 380,
              maxWidth: 'calc(100vw - 24px)',
              visibility: notificationPosition ? 'visible' : 'hidden',
            }}
            className="z-[60] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-white">Notifications</p>
              <Link to={user?.type === 'vendor' ? '/vendor/notifications' : '/customer/notifications'} onClick={() => setNotificationsOpen(false)} className="text-xs font-medium text-blue-300 hover:text-blue-200">View all</Link>
            </div>
            {loading ? (
              <div className="flex h-28 items-center justify-center px-4 text-sm text-slate-400">Loading notifications...</div>
            ) : error ? (
              <div className="px-4 py-5 text-sm text-rose-200"><p className="break-words">{error}</p><button type="button" onClick={() => void refresh()} className="mt-3 text-xs font-medium text-blue-300 hover:text-blue-200">Retry</button></div>
            ) : items.length === 0 ? (
              <div className="flex h-36 flex-col items-center justify-center px-4 text-center"><Bell className="mb-2 h-6 w-6 text-slate-500" /><p className="text-sm font-medium text-slate-300">No notifications yet.</p><p className="mt-1 text-xs text-slate-500">You're all caught up.</p></div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto overflow-x-hidden p-2">
                {items.slice(0, 5).map((item) => (
                  <button key={String(item.id)} type="button" onClick={() => void markRead(item)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition hover:bg-white/10 ${item.isRead ? 'border-transparent bg-white/[0.03]' : 'border-blue-400/20 bg-blue-500/[0.09]'}`}>
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.isRead ? 'bg-white/10 text-slate-400' : 'bg-blue-400/15 text-blue-300'}`}><Bell className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1" style={{ wordBreak: 'normal', overflowWrap: 'anywhere', whiteSpace: 'normal' }}>
                      <span className="block text-sm font-medium text-white" style={{ wordBreak: 'normal', overflowWrap: 'anywhere', whiteSpace: 'normal' }}>{item.title}</span>
                      <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-400" style={{ wordBreak: 'normal', overflowWrap: 'anywhere', whiteSpace: 'normal' }}>{item.message}</span>
                      <span className="mt-2 block text-[11px] text-slate-500">{item.type} <span aria-hidden="true">•</span> {new Date(item.createdAt).toLocaleString()}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-white/10 px-4 py-3">
              <Link to={user?.type === 'vendor' ? '/vendor/notifications' : '/customer/notifications'} onClick={() => setNotificationsOpen(false)} className="flex items-center justify-center text-xs font-medium text-blue-300 hover:text-blue-200">View all notifications <span aria-hidden="true" className="ml-1">→</span></Link>
            </div>
          </div>,
          document.body,
        ) : null}
      </div> : null}
      {user && isCustomer ? (
        <Link to="/customer/cart" aria-label={`Cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`} className="relative inline-flex items-center justify-center rounded-xl bg-blue-600 p-2 text-xs text-white transition hover:bg-blue-500">
          <ShoppingCart className="h-4 w-4" />
          {cartItemCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-slate-950 bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">{cartItemCount}</span> : null}
        </Link>
      ) : null}
      {user && isCustomer ? <Link to="/customer/offers" className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-100 transition hover:bg-rose-500/20"><Tag className="h-4 w-4" /><span className="hidden xl:inline">Offers</span></Link> : null}
      {!user ? (
        <>
          <Link to="/login" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Login</Link>
        </>
      ) : (
        <div className="relative">
          <button onClick={() => setOpen((v) => !v)} className="inline-flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-xs text-slate-200 transition hover:bg-white/10">
            <UserRound className="h-5 w-5" />
            <span>Account</span>
          </button>
          {open ? createPortal(
            <div
              ref={menuRef}
              style={{
                position: 'fixed',
                top: menuPosition?.top ?? 12,
                left: menuPosition?.left ?? 12,
                width: menuPosition?.width ?? 224,
                maxHeight: menuPosition?.maxHeight ?? 'calc(100vh - 24px)',
                visibility: menuPosition ? 'visible' : 'hidden',
              }}
              className="z-[60] overflow-auto rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-lg"
            >
              {!isAdmin ? (
                <>
                  <Link to={user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer'} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Dashboard</Link>
                  {isCustomer ? (
                    <>
                      <Link to="/customer/orders" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Orders</Link>
                      <Link to="/customer/wishlist" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Wishlist</Link>
                      <Link to="/customer/wallet" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Wallet</Link>
                      <Link to="/customer/rewards" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Rewards / Referral &amp; Earn</Link>
                    </>
                  ) : null}
                </>
              ) : null}
              <button onClick={() => logout()} className="mt-2 w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400">Logout</button>
            </div>
          , document.body) : null}
        </div>
      )}

      {isAdmin ? <Link to="/admin/super-dashboard" className="rounded-full border border-blue-400/30 bg-blue-600/10 px-3 py-2 text-sm font-medium text-blue-200 transition hover:bg-blue-600/20">ERP Admin</Link> : null}
    </div>
  );
}
