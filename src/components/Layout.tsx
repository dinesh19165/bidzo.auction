import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Logo from './Logo';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bell, Briefcase, Camera, Check, ChevronDown, CircleHelp, Crosshair, Gavel, Globe, Grid2X2, Home, LoaderCircle, LogOut, MapPin, Menu, Mic, Moon, Search, ShoppingBag, ShoppingCart, Store, Sun, Tag, UserRound, X } from 'lucide-react';
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
import { clearCustomerLocation, getRecentCustomerLocations, getStoredCustomerLocation, reverseGeocode, saveCustomerLocation, searchCustomerLocations, type CustomerLocation } from '../utils/customerLocation';

function CustomerLocationPicker({ value, onSelect, mobile = false }: { value: CustomerLocation | null; onSelect: (location: CustomerLocation | null) => void; mobile?: boolean }) {
  const { theme } = useThemeContext();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerLocation[]>([]);
  const [recent, setRecent] = useState<CustomerLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setRecent(getRecentCustomerLocations());
    const closeOnOutside = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!open || trimmedQuery.length < 3) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      searchCustomerLocations(trimmedQuery).then(setResults).catch((searchError: unknown) => {
        setError(searchError instanceof Error ? searchError.message : 'Unable to search locations right now.');
        setResults([]);
      }).finally(() => setSearching(false));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [open, query]);

  const selectLocation = (selectedLocation: CustomerLocation | null) => {
    if (!selectedLocation) {
      clearCustomerLocation();
      onSelect(null);
      setOpen(false);
      setQuery('');
      setResults([]);
      setError('');
      return;
    }
    saveCustomerLocation(selectedLocation);
    onSelect(selectedLocation);
    setOpen(false);
    setQuery('');
    setResults([]);
    setError('');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Current location is not available in this browser. Please search manually.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        selectLocation(await reverseGeocode(coords.latitude, coords.longitude));
      } catch (locationError) {
        setError(locationError instanceof Error ? locationError.message : 'We could not identify that location. Please search manually.');
      } finally {
        setLoading(false);
      }
    }, (geolocationError) => {
      setLoading(false);
      setError(geolocationError.code === geolocationError.PERMISSION_DENIED ? 'Location permission was denied. Please search for your location manually.' : 'Unable to access your current location. Please search manually.');
    }, { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 });
  };

  const displayName = value?.city || value?.displayName || 'Location';
  const choices = query.trim().length >= 3 ? results : recent;
  const controlClass = mobile ? 'h-10 w-[clamp(120px,38vw,200px)] lg:h-12 lg:w-[200px]' : 'h-12 w-[200px]';

  return <div ref={pickerRef} className={`relative shrink-0 ${mobile ? 'min-w-0 flex-1' : ''}`}>
    <button type="button" aria-label="Location" aria-expanded={open} aria-haspopup="dialog" onClick={() => { setOpen((current) => !current); setError(''); }} className={`inline-flex ${controlClass} min-w-0 items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 text-sm text-slate-800 shadow-[0_2px_5px_rgba(59,130,246,0.16)] transition hover:border-blue-200 ${mobile ? 'rounded-xl lg:rounded-2xl' : ''}`}>
      <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
      <span className="min-w-0 flex-1 truncate text-left">{displayName}</span>
      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-700 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open ? <div role="dialog" aria-label="Choose your location" className={`absolute left-0 top-full z-[80] mt-2 w-[min(22rem,calc(100vw-24px))] overflow-hidden rounded-2xl border p-3 shadow-2xl ${theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
      <p className={`px-1 pb-2 text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Location</p>
      <button type="button" onClick={useCurrentLocation} disabled={loading} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${theme === 'dark' ? 'text-cyan-200 hover:bg-cyan-500/10' : 'text-cyan-700 hover:bg-cyan-50'}`}>
        {loading ? <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" /> : <Crosshair className="h-5 w-5 shrink-0" />}
        <span>{loading ? 'Finding your location...' : 'Use my current location'}</span>
      </button>
      {value ? <button type="button" onClick={() => selectLocation(null)} className="flex min-h-10 w-full items-center rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50">Clear location filter</button> : null}
      <div className={`my-2 flex items-center gap-2 rounded-xl border px-3 ${theme === 'dark' ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
        <Search className={`h-4 w-4 shrink-0 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
        <input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setError(''); }} placeholder="Search city or pincode" className={`min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`} />
        {searching ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-blue-500" /> : null}
      </div>
      {error ? <p role="alert" className="px-1 py-2 text-xs leading-5 text-amber-700">{error}</p> : null}
      {choices.length > 0 ? <div className="max-h-48 overflow-y-auto">
        {query.trim().length < 3 && recent.length > 0 ? <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Recently selected</p> : null}
        {choices.map((locationOption) => <button key={`${locationOption.displayName}-${locationOption.latitude}`} type="button" onClick={() => selectLocation(locationOption)} className="flex min-h-11 w-full items-start gap-3 rounded-xl px-2 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-100"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" /><span className="min-w-0"><span className="block truncate font-medium">{locationOption.city || locationOption.displayName}</span><span className="block truncate text-xs text-slate-500">{[locationOption.state, locationOption.pincode].filter(Boolean).join(' · ')}</span></span></button>)}
      </div> : query.trim().length >= 3 && !searching ? <p className="px-2 py-3 text-sm text-slate-500">No locations found. Try a city or pincode.</p> : null}
    </div> : null}
  </div>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const headerDropdownsRef = useRef<HTMLDivElement>(null);
  const mobileUtilityRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useThemeContext();
  const { language, currency, languageLabel, currencyLabel, setLanguage, setCurrency, translate, formatCurrency } = useLocaleContext();
  const { user, logout } = useAuth();
  const { cart } = useCartContext();
  const { unreadCount } = useNotificationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [headerSearch, setHeaderSearch] = useState('');
  const [headerCategory, setHeaderCategory] = useState('');
  const [headerLocation, setHeaderLocation] = useState<CustomerLocation | null>(() => getStoredCustomerLocation());
  const [marketplaceCategories, setMarketplaceCategories] = useState<CategoryRecord[]>([]);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<CategoryRecord['id'] | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<MarketplaceSearchResult[]>([]);
  const [searchSuggestionsLoading, setSearchSuggestionsLoading] = useState(false);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const categoryListRef = useRef<HTMLDivElement>(null);
  const categoryTrackRef = useRef<HTMLDivElement>(null);
  const [categoryMarqueeDistance, setCategoryMarqueeDistance] = useState(0);
  const searchRequestGeneration = useRef(0);
  const isLiveAuctionsPage = location.pathname.startsWith('/auctions');
  const isDirectBuyPage = location.pathname.startsWith('/marketplace');
  const isHomePage = location.pathname === '/';
  const cartItemCount = cart.items.reduce((total, item) => total + Math.max(0, Number(item.quantity) || 0), 0);
  const isCustomerUser = Boolean(user && (user.type === 'customer' || user.role === 'CUSTOMER'));
  const showMarketplaceControls = !user || isCustomerUser;
  const showCustomerHeaderItems = isCustomerUser;
  const mainCategories = marketplaceCategories.filter((category) => category.parentId === undefined || category.parentId === null || category.parentId === '');
  const selectedMainCategory = mainCategories.find((category) => String(category.id) === String(selectedMainCategoryId));
  const selectedSubcategories = selectedMainCategory
    ? marketplaceCategories.filter((category) => String(category.parentId) === String(selectedMainCategory.id))
    : [];
  useLayoutEffect(() => {
    const categoryList = categoryListRef.current;
    const categoryTrack = categoryTrackRef.current;
    if (!categoryList || !categoryTrack || marketplaceCategories.length === 0) {
      setCategoryMarqueeDistance(0);
      return undefined;
    }

    const measureCategoryList = () => {
      const listWidth = categoryList.getBoundingClientRect().width;
      const listGap = Number.parseFloat(window.getComputedStyle(categoryTrack).columnGap) || 0;
      setCategoryMarqueeDistance(listWidth + listGap);
    };

    measureCategoryList();
    const resizeObserver = new ResizeObserver(measureCategoryList);
    resizeObserver.observe(categoryList);
    return () => resizeObserver.disconnect();
  }, [isHeaderScrolled, marketplaceCategories]);
  useEffect(() => {
    const updateHeaderScrollState = () => setIsHeaderScrolled(window.scrollY > 24);
    updateHeaderScrollState();
    window.addEventListener('scroll', updateHeaderScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateHeaderScrollState);
  }, []);
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
    setMobileSearchOpen(true);
    window.requestAnimationFrame(() => mobileSearchRef.current?.focus());
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
    // vendor/admin and other non-essential links intentionally omitted for mobile
  ];

  useEffect(() => {
    if (!languageMenuOpen && !currencyMenuOpen && !mobileProfileOpen) {
      return;
    }

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!headerDropdownsRef.current?.contains(target) && !mobileUtilityRef.current?.contains(target) && !mobileProfileRef.current?.contains(target)) {
        setLanguageMenuOpen(false);
        setCurrencyMenuOpen(false);
        setMobileProfileOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [languageMenuOpen, currencyMenuOpen, mobileProfileOpen]);

  return (
    <div className="app-shell min-h-screen overflow-x-hidden transition-colors duration-300">
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-950/95 shadow-black/20' : 'border-slate-200 bg-white/95 shadow-slate-200/10'}`}>
        <div ref={mobileUtilityRef} className={`relative flex flex-nowrap items-center gap-1 border-t px-3 py-0 lg:hidden ${theme === 'dark' ? 'border-white/10 bg-slate-950/90' : 'border-slate-200 bg-white/95'}`}>
          <div className="relative min-w-0 flex-1">
            <button type="button" onClick={() => { setLanguageMenuOpen((value) => !value); setCurrencyMenuOpen(false); setMobileProfileOpen(false); }} aria-expanded={languageMenuOpen} aria-label="Select language" className={`mobile-header-compact-control flex h-[34px] w-full items-center justify-center gap-1 rounded-md border px-1.5 text-[12px] font-medium ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}>
              <Globe className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{languageLabel}</span><ChevronDown className="h-3 w-3 shrink-0" />
            </button>
            {languageMenuOpen ? <div className={`absolute left-0 top-full z-[70] mt-2 w-44 overflow-hidden rounded-xl border p-1 shadow-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}>
              {languageOptions.map((option) => <button key={option.key} type="button" onClick={() => { setLanguage(option.key); setLanguageMenuOpen(false); }} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}><span>{option.label}</span>{language === option.key ? <Check className="h-4 w-4 text-emerald-400" /> : null}</button>)}
            </div> : null}
          </div>
          <div className="relative min-w-0 flex-1">
            <button type="button" onClick={() => { setCurrencyMenuOpen((value) => !value); setLanguageMenuOpen(false); setMobileProfileOpen(false); }} aria-expanded={currencyMenuOpen} aria-label="Select currency" className={`mobile-header-compact-control flex h-[34px] w-full items-center justify-center gap-1 rounded-md border px-1.5 text-[12px] font-medium ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}>
              <span className="shrink-0">₹</span><span className="truncate">{currencyLabel}</span><ChevronDown className="h-3 w-3 shrink-0" />
            </button>
            {currencyMenuOpen ? <div className={`absolute right-0 top-full z-[70] mt-2 w-44 overflow-hidden rounded-xl border p-1 shadow-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}>
              {currencyOptions.map((option) => <button key={option.key} type="button" onClick={() => { setCurrency(option.key); setCurrencyMenuOpen(false); }} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-900 hover:bg-slate-100'}`}><span>{option.label}</span>{currency === option.key ? <Check className="h-4 w-4 text-emerald-400" /> : null}</button>)}
            </div> : null}
          </div>
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} className={`mobile-header-icon-control inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md border text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link
            to="/help"
            onClick={() => { setLanguageMenuOpen(false); setCurrencyMenuOpen(false); }}
            className={`mobile-header-compact-control inline-flex h-[34px] shrink-0 items-center justify-center rounded-full border px-3 text-[11px] font-medium leading-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}
          >
            {translate('help')}
          </Link>
        </div>

  <div className="mx-auto flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 sm:px-6 lg:px-8">
          {/* Logo component: uses /logo.png if present in public/, falls back to text */}
          <div className="flex min-w-0 items-center gap-2">
            {/* Shared header: logo always shown and links to home */}
            <Link to="/" className="inline-flex items-center flex-shrink-0">
              {/* Slightly smaller logo on mobile to avoid horizontal overflow */}
              <Logo className="w-[104px] sm:w-[150px] h-auto object-contain" />
           </Link>
            {showCustomerHeaderItems ? <CustomerLocationPicker mobile value={headerLocation} onSelect={setHeaderLocation} /> : null}
          </div>

          {showMarketplaceControls ? <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
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

          <div className="hidden items-center gap-2 md:flex">
            {showCustomerHeaderItems ? (
              <>
                <Link to="/auctions" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"><Gavel className="h-4 w-4" />Live Auction</Link>
                <MainHeaderActions />
              </>
            ) : (
              <MainHeaderActions />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5 lg:hidden">
            {showMarketplaceControls ? (
              isCustomerUser ? (
                <Link to="/customer/cart" aria-label={`Cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`} className={`mobile-header-icon-control relative inline-flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-900'}`}>
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemCount > 0 ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{cartItemCount > 99 ? '99+' : cartItemCount}</span> : null}
                </Link>
              ) : (
                <>
                  <button type="button" aria-label="Notifications" onClick={() => navigate(user?.type === 'vendor' ? '/vendor/notifications' : '/customer/notifications')} className={`mobile-header-icon-control relative inline-flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-900'}`}><Bell className="h-4 w-4" />{unreadCount > 0 ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span> : null}</button>
                  <Link to="/customer/offers" aria-label="Offers" className={`mobile-header-icon-control relative inline-flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`}><Tag className="h-4 w-4" /></Link>
                </>
              )
            ) : null}
          </div>
        </div>

        {showMarketplaceControls && isHomePage ? (
          <div className={`border-t px-3 py-1 lg:hidden transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
            <div data-header-search className={`relative flex h-[46px] items-center gap-1.5 rounded-xl border px-2 ${theme === 'dark' ? 'border-white/10 bg-slate-950/70' : 'border-slate-200 bg-slate-100'}`}>
              {mobileSearchOpen ? <button type="button" aria-label="Exit search" onClick={() => setMobileSearchOpen(false)} className={`mobile-header-search-action inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-white'}`}><ArrowLeft className="h-4 w-4" /></button> : <button type="button" aria-label="Open search" onClick={focusMobileSearch} className={`mobile-header-search-action inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-white'}`}><Search className="h-4 w-4" /></button>}
              <input ref={mobileSearchRef} value={headerSearch} onFocus={() => setMobileSearchOpen(true)} onChange={(event) => setHeaderSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitHeaderSearch(); }} placeholder="Search products & auctions" className={`w-full min-w-0 flex-1 bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`} />
              <span aria-hidden="true" className={`h-6 w-px shrink-0 ${theme === 'dark' ? 'bg-white/15' : 'bg-slate-300'}`} />
              <button type="button" aria-label="Visual search" onClick={focusMobileSearch} className={`mobile-header-search-action inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border ${theme === 'dark' ? 'border-white/15 text-slate-300 hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-300' : 'border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-white hover:text-blue-600'}`}><Camera className="h-4 w-4" /></button>
              <button type="button" aria-label="Voice search" onClick={focusMobileSearch} className={`mobile-header-search-action inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border ${theme === 'dark' ? 'border-white/15 text-slate-300 hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-300' : 'border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-white hover:text-blue-600'}`}><Mic className="h-4 w-4" /></button>
              {mobileSearchOpen ? <button type="button" aria-label="Close search" onClick={() => setMobileSearchOpen(false)} className={`mobile-header-search-action inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-white'}`}><X className="h-4 w-4" /></button> : null}
              {renderSearchSuggestions()}
            </div>
            <div className="mt-1.5 grid grid-cols-1 gap-2">
            </div>
          </div>
        ) : null}

        {showMarketplaceControls ? <nav className={`category-navigation border-t px-3 transition duration-300 sm:px-6 lg:px-8 ${isHeaderScrolled ? 'py-1' : 'py-2'} ${theme === 'dark' ? 'border-white/10 bg-slate-950/40' : 'border-slate-200 bg-white'}`} aria-label="Product categories">
          <div className="category-marquee-viewport mx-auto min-w-0 overflow-hidden">
            <div ref={categoryTrackRef} className="category-marquee-track flex w-max min-w-full items-center gap-2" style={{ '--category-marquee-distance': `${categoryMarqueeDistance}px` } as React.CSSProperties} aria-live="off">
              {[0, 1].map((copy) => <div key={copy} ref={copy === 0 ? categoryListRef : undefined} className="category-marquee-list flex shrink-0 items-center gap-2" aria-hidden={copy === 1}>
                {mainCategories.map((category) => <button key={`${copy}-${category.id}`} type="button" onClick={() => setSelectedMainCategoryId(category.id)} tabIndex={copy === 1 ? -1 : undefined} aria-current={String(category.id) === String(selectedMainCategoryId) ? 'true' : undefined} className="category-navigation-item inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition hover:bg-blue-500/10 sm:text-sm">
                  <span className={`category-navigation-icon flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-w-0 opacity-0' : 'max-w-7 opacity-100'}`}><CategoryIcon iconUrl={category.iconUrl} className="h-6 w-6" /></span><span className="max-w-[9rem] truncate">{category.name}</span>
                </button>)}
              </div>)}
            </div>
          </div>
          {selectedMainCategory ? <div className="category-subnavigation mx-auto min-w-0 overflow-x-auto border-t border-inherit py-1 scrollbar-hidden">
            <div className="flex min-w-max items-center justify-center gap-2">
              {selectedSubcategories.map((category) => <Link key={category.id} to={`/marketplace?categoryId=${encodeURIComponent(String(category.id))}`} className="category-navigation-item inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition hover:bg-blue-500/10 sm:text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden"><CategoryIcon iconUrl={category.iconUrl} className="h-5 w-5" /></span><span className="max-w-[9rem] truncate">{category.name}</span>
              </Link>)}
            </div>
          </div> : null}
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
                {!user ? <LoginRoleMenu compact onNavigate={() => setMobileMenuOpen(false)} /> : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <main className="overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>

      <Footer />
      {showMarketplaceControls ? <><nav className={`fixed inset-x-0 bottom-0 z-40 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden ${theme === 'dark' ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95'} backdrop-blur-xl`} aria-label="Mobile navigation"><div className="grid grid-cols-5 gap-1"><Link to="/" className="mobile-nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px]"><Home className="h-4 w-4" />Home</Link><Link to="/customer/cart" className="mobile-nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px]"><ShoppingCart className="h-4 w-4" />Cart</Link><Link to="/categories" className="mobile-nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px]"><Grid2X2 className="h-4 w-4" />Categories</Link><button type="button" onClick={() => setMobileProfileOpen((value) => !value)} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] ${mobileProfileOpen ? 'text-blue-500' : 'mobile-nav-item'}`}><UserRound className="h-4 w-4" />Account</button><button type="button" onClick={() => setMobileMenuOpen(true)} className="mobile-nav-item flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px]"><Menu className="h-4 w-4" />More</button></div></nav>{mobileProfileOpen && user ? <div ref={mobileProfileRef} className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 max-h-[calc(100dvh-9rem)] overflow-y-auto overflow-x-hidden rounded-xl border p-3 shadow-2xl md:hidden ${theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}><Link to={user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer'} onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Login</Link>{user.type === 'customer' ? <><Link to="/customer/orders" onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Orders</Link><Link to="/customer/wishlist" onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Wishlist</Link><Link to="/wallet" onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Wallet</Link><Link to="/customer/rewards" onClick={() => setMobileProfileOpen(false)} className={`block whitespace-normal break-words rounded-md px-3 py-2.5 text-sm leading-5 ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Rewards / Referral &amp; Earn</Link><Link to="/customer/offers" onClick={() => setMobileProfileOpen(false)} className={`block rounded-md px-3 py-2.5 text-sm ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}>Offers</Link></> : null}<button onClick={() => { setMobileProfileOpen(false); logout(); }} className="mt-2 min-h-11 w-full rounded-md bg-amber-500 px-3 py-2.5 text-sm font-medium text-slate-950 hover:bg-amber-400">Logout</button></div> : null}</> : null}
    </div>
  );
}

function LoginRoleMenu({ compact = false, onNavigate, onOpenChange, triggerLabel = 'Login' }: { compact?: boolean; onNavigate?: () => void; onOpenChange?: (open: boolean) => void; triggerLabel?: string }) {
  const { theme } = useThemeContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        onOpenChange?.(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onOpenChange, open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();
      if (!triggerRect || !menuRect) return;

      const safeMargin = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(320, Math.max(0, viewportWidth - safeMargin * 2));
      const height = Math.min(menuRect.height, viewportHeight - safeMargin * 2);
      const spaceBelow = viewportHeight - triggerRect.bottom - safeMargin;
      const top = spaceBelow >= height || spaceBelow >= triggerRect.top - safeMargin
        ? Math.min(triggerRect.bottom + 8, viewportHeight - safeMargin - height)
        : Math.max(safeMargin, triggerRect.top - 8 - height);
      const left = Math.min(Math.max(safeMargin, triggerRect.right - width), viewportWidth - safeMargin - width);
      setMenuPosition({ top, left, width });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const selectRole = (role: 'customer' | 'vendor') => {
    setOpen(false);
    onOpenChange?.(false);
    onNavigate?.();
    navigate('/login', { replace: true, state: { role } });
  };

  const triggerClass = compact
    ? `flex min-h-[48px] w-full items-center rounded-2xl border px-4 py-3 text-sm transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200'}`
    : `rounded-full border px-3 py-2 text-sm transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50'}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          onOpenChange?.(nextOpen);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            onOpenChange?.(false);
          }
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
            onOpenChange?.(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={triggerClass}
      >
        {triggerLabel}
      </button>
      {open ? createPortal(
        <div
          ref={menuRef}
          data-login-role-menu="true"
          role="menu"
          aria-label="Login to Bidzo"
          style={{ position: 'fixed', top: menuPosition?.top ?? 12, left: menuPosition?.left ?? 12, width: menuPosition?.width ?? 320, visibility: menuPosition ? 'visible' : 'hidden' }}
          className={`z-[70] overflow-hidden rounded-2xl border p-2 shadow-2xl ${theme === 'dark' ? 'border-white/10 bg-slate-900/95 shadow-black/50' : 'border-slate-200 bg-white/95 shadow-slate-300/40'} backdrop-blur-xl`}
        >
          <div className={`border-b px-3 pb-2 pt-1 text-sm font-semibold ${theme === 'dark' ? 'border-white/10 text-white' : 'border-slate-200 text-slate-950'}`}>Login to Bidzo</div>
          <button type="button" role="menuitem" onClick={() => selectRole('customer')} className={`flex min-h-16 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-blue-500/15 hover:text-white' : 'text-slate-800 hover:bg-blue-50'}`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-blue-400/15 text-blue-200' : 'bg-blue-100 text-blue-700'}`}><UserRound className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block text-sm font-semibold">Customer Login</span><span className={`mt-0.5 block text-xs leading-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Buy products, bid and manage orders.</span></span>
          </button>
          <button type="button" role="menuitem" onClick={() => selectRole('vendor')} className={`flex min-h-16 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${theme === 'dark' ? 'text-slate-200 hover:bg-emerald-500/15 hover:text-white' : 'text-slate-800 hover:bg-emerald-50'}`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-emerald-400/15 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}`}><Briefcase className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block text-sm font-semibold">Vendor Login</span><span className={`mt-0.5 block text-xs leading-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Sell products, manage auctions and grow your business.</span></span>
          </button>
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function MainHeaderActions() {
  const { theme, toggleTheme } = useThemeContext();
  const { currency, setCurrency } = useLocaleContext();
  const { user, logout } = useAuth();
  const { cart } = useCartContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cartItemCount = cart.items.reduce((total, item) => total + Math.max(0, Number(item.quantity) || 0), 0);
  const isCustomer = user?.type === 'customer' || user?.role === 'CUSTOMER';
  const isVendor = user?.type === 'vendor' || user?.role === 'VENDOR';
  const showCart = isCustomer;
  useEffect(() => {
    if (!open && !loginMenuOpen) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!menuRef.current?.contains(target) && !target?.closest('[data-login-role-menu]')) {
        setOpen(false);
        setLoginMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [loginMenuOpen, open]);

  const itemClass = `flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm whitespace-nowrap transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/10 hover:text-white' : 'text-slate-800 hover:bg-slate-100'}`;
  const iconClass = `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${theme === 'dark' ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`;
  const closeMenu = () => setOpen(false);

  return <div ref={menuRef} className="relative flex items-center gap-2">
    {showCart ? <Link to="/customer/cart" aria-label={`Cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`} className={`relative inline-flex min-h-10 items-center justify-center rounded-xl border px-3 py-2 transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-100'}`}>
      <ShoppingCart className="h-4 w-4" />
      <span className="ml-1.5 text-sm">Cart</span>
      {cartItemCount > 0 ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{cartItemCount}</span> : null}
    </Link> : null}
    <button type="button" onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open} className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'}`}>
      <UserRound className="h-4 w-4" />
      <span>Account</span>
      <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open || loginMenuOpen ? <div role="menu" aria-label="Account menu" className={`absolute right-0 top-full z-[70] mt-2 max-h-[calc(100vh-5rem)] w-[min(17rem,calc(100vw-1rem))] min-w-[15rem] overflow-hidden rounded-2xl border p-2 shadow-2xl ${loginMenuOpen ? 'invisible pointer-events-none' : ''} ${theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
      <div className={`border-b px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-500'}`}>Account</div>
      <div className="mt-1 space-y-1">
        {!user ? <button role="menuitem" type="button" onClick={() => { closeMenu(); navigate('/login', { replace: true, state: { role: 'customer' } }); }} className={itemClass}><span className={iconClass}><UserRound className="h-4 w-4" /></span><span>Login</span></button> : null}
        {!user ? <button role="menuitem" type="button" onClick={() => { closeMenu(); navigate('/login', { replace: true, state: { role: 'vendor' } }); }} className={itemClass}><span className={iconClass}><Store className="h-4 w-4" /></span><span>Become a Seller</span></button> : null}
        {isCustomer ? <>
          <Link role="menuitem" to="/customer/orders" onClick={closeMenu} className={itemClass}><span className={iconClass}><ShoppingBag className="h-4 w-4" /></span><span>Orders</span></Link>
          <Link role="menuitem" to="/customer/wishlist" onClick={closeMenu} className={itemClass}><span className={iconClass}><Tag className="h-4 w-4" /></span><span>Wishlist</span></Link>
          <Link role="menuitem" to="/customer/rewards" onClick={closeMenu} className={itemClass}><span className={iconClass}><ShoppingBag className="h-4 w-4" /></span><span>Rewards</span></Link>
          <Link role="menuitem" to="/customer/offers" onClick={closeMenu} className={itemClass}><span className={iconClass}><Tag className="h-4 w-4" /></span><span>Offers</span></Link>
        </> : null}
        {(isCustomer || isVendor) ? (
          <Link role="menuitem" to={isVendor ? '/vendor/notifications' : '/customer/notifications'} onClick={closeMenu} className={itemClass}>
            <span className={iconClass}><Bell className="h-4 w-4" /></span>
            <span>Notifications</span>
          </Link>
        ) : null}
        <Link role="menuitem" to="/help" onClick={closeMenu} className={itemClass}><span className={iconClass}><CircleHelp className="h-4 w-4" /></span><span>Help</span></Link>
        {user ? <button role="menuitem" type="button" onClick={() => { logout(); closeMenu(); }} className={`${itemClass} mt-1 border-t pt-3 ${theme === 'dark' ? 'border-white/10 text-amber-200 hover:bg-amber-500/10' : 'border-slate-200 text-amber-700 hover:bg-amber-50'}`}><span className={iconClass}><LogOut className="h-4 w-4" /></span><span>Logout</span></button> : null}
      </div>
    </div> : null}
  </div>;
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
          <LoginRoleMenu />
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
