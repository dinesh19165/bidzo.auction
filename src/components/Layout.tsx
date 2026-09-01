import { Link } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe, Menu, Mic, Search, ShoppingBag, Store, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useLocaleContext } from '../context/LocaleContext';
import { Footer } from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useThemeContext();
  const { language, currency, languageLabel, currencyLabel, setLanguage, setCurrency, translate, formatCurrency } = useLocaleContext();
  const { user, logout } = useAuth();
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
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/categories', label: 'Categories' },
    { to: '/auctions', label: 'Auctions' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
    { to: '/register/vendor', label: 'Become Seller' },
    // vendor/admin and other non-essential links intentionally omitted for mobile
  ];

  return (
    <div className="app-shell min-h-screen overflow-x-hidden transition-colors duration-300">
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-950/95 shadow-black/20' : 'border-slate-200 bg-white/95 shadow-slate-200/10'}`}>
        <div className={`border-b transition duration-300 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <div className={`mx-auto flex flex-col gap-1 px-4 py-1 text-xs transition duration-300 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8`}>
            <p className={`inline-flex flex-wrap items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium transition duration-300 ${theme === 'dark' ? 'bg-blue-500/10 text-slate-100' : 'bg-slate-100 text-slate-950 border border-slate-200'}`}>
              <span className="font-medium">{translate('freeShipping')}</span>
              <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{translate('onOrdersOver', { amount: '₹5,000' })}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLanguageMenuOpen((value) => !value);
                    setCurrencyMenuOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition duration-300 ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                  aria-expanded={languageMenuOpen}
                  aria-label="Select language"
                >
                  <Globe className="h-3.5 w-3.5" /> {languageLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {languageMenuOpen ? (
                  <div className={`absolute left-0 mt-2 w-44 overflow-hidden rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-slate-950 shadow-black/40' : 'border-slate-200 bg-white shadow-slate-200/40'}`}>
                    {languageOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setLanguage(option.key);
                          setLanguageMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}
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
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition duration-300 ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                  aria-expanded={currencyMenuOpen}
                  aria-label="Select currency"
                >
                  {currencyLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {currencyMenuOpen ? (
                  <div className={`absolute left-0 mt-2 w-44 overflow-hidden rounded-2xl border ${theme === 'dark' ? 'border-white/10 bg-slate-950 shadow-black/40' : 'border-slate-200 bg-white shadow-slate-200/40'}`}>
                    {currencyOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setCurrency(option.key);
                          setCurrencyMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition ${theme === 'dark' ? 'text-slate-200 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-100'}`}
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

<div className="mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
          {/* Logo component: uses /logo.png if present in public/, falls back to text */}
          <div>
            {/* Shared header: logo always shown and links to home */}
            <Link to="/" className="inline-flex items-center flex-shrink-0">
              {/* Slightly smaller logo on mobile to avoid horizontal overflow */}
              <Logo className="w-[110px] sm:w-[150px] h-auto object-contain" />
           </Link>
          </div>

          <div className={`hidden flex-1 items-center gap-2 rounded-full px-2 py-1.5 lg:flex transition duration-300 ${theme === 'dark' ? 'border border-white/10 bg-slate-900/70' : 'border border-slate-200 bg-white shadow-sm'}`}>
            <button type="button" aria-label="Focus search" onClick={() => desktopSearchRef.current?.focus()} className={`inline-flex items-center justify-center rounded-full p-2 transition ${theme === 'dark' ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
              <Search className="h-4 w-4" />
            </button>
            <input
              ref={desktopSearchRef}
              placeholder={translate('searchPlaceholder')}
              className={`w-full bg-transparent text-sm outline-none transition duration-300 ${theme === 'dark' ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`}
            />
            <div className={`hidden items-center gap-1 rounded-full px-2 py-1 text-sm xl:inline-flex transition duration-300 ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-slate-300' : 'border border-slate-300 bg-slate-100 text-slate-900'}`}>
              {translate('allCategories')}
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
            <button type="button" aria-label="Voice search" onClick={() => desktopSearchRef.current?.focus()} className={`inline-flex items-center justify-center rounded-full p-2 transition ${theme === 'dark' ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
              <Mic className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AuthActions />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 md:hidden">
            <button type="button" onClick={() => setMobileSearchOpen((value) => !value)} className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-900'}`}>
              <Search className="h-4 w-4" />
            </button>
            {/* Mobile auth: if not logged in show Login/Register, else show compact profile trigger with dropdown */}
            {!user ? (
              <>
                <Link to="/login" className={`inline-flex min-h-[38px] items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition ${theme === 'dark' ? 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10' : 'border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                  Login
                </Link>
                <Link to="/register" className="inline-flex min-h-[38px] items-center justify-center rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">Register</Link>
              </>
            ) : (
              <div className="relative">
                <button type="button" onClick={() => setMobileProfileOpen((v) => !v)} className="inline-flex items-center justify-center rounded-full border p-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{user.name ? user.name.split(' ').map((s) => s[0]).slice(0,2).join('') : 'U'}</div>
                </button>
                {mobileProfileOpen ? (
                  <div className="fixed left-4 right-4 top-16 z-50 max-h-[60vh] overflow-auto rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-lg">
                    <Link to={user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer'} onClick={() => setMobileProfileOpen(false)} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Dashboard</Link>
                    {user.type === 'customer' ? <Link to="/customer/orders" onClick={() => setMobileProfileOpen(false)} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Orders</Link> : <Link to="/vendor/orders" onClick={() => setMobileProfileOpen(false)} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Orders</Link>}
                    <Link to="/customer/wishlist" onClick={() => setMobileProfileOpen(false)} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Wishlist</Link>
                    <Link to="/wallet" onClick={() => setMobileProfileOpen(false)} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Wallet</Link>
                    <button onClick={() => { setMobileProfileOpen(false); logout(); }} className="mt-2 w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400">Logout</button>
                  </div>
                ) : null}
              </div>
            )}

            <button type="button" onClick={() => setMobileMenuOpen(true)} className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-900'}`}>
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {mobileSearchOpen ? (
          <div className={`border-t px-4 py-3 md:hidden transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
            <div className={`flex items-center gap-2 rounded-full px-3 py-2 transition duration-300 ${theme === 'dark' ? 'border border-white/10 bg-slate-950/70' : 'border border-slate-200 bg-slate-100'}`}>
              <Search className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-900'}`} />
              <input placeholder="Search products, auctions, sellers..." className={`w-full bg-transparent text-sm outline-none transition duration-300 ${theme === 'dark' ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`} />
            </div>
          </div>
        ) : null}

        <div className={`border-t transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-900/75' : 'border-slate-200 bg-white'}`}>
          <div className={`mx-auto flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap px-4 py-1.5 text-sm transition duration-300 scrollbar-hidden sm:px-6 lg:px-8 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Furniture', 'Agriculture', 'Livestock', 'Services', 'Books', 'Pets'].map((item) => (
              <Link key={item} to="/marketplace" className={`shrink-0 snap-start rounded-full border px-3 py-1 transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                {item}
              </Link>
            ))}
            <Link to="/auctions" className={`shrink-0 snap-start rounded-full px-3 py-1 font-medium transition ${theme === 'dark' ? 'bg-amber-500/10 text-amber-200 hover:bg-amber-500/20' : 'border border-amber-300 bg-amber-200 text-amber-950 hover:bg-amber-300'}`}>
              Live auctions
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen ? (
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
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <Link to="/" className="inline-flex items-center"><Logo /></Link>
                  </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200">
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

      <main className="overflow-x-hidden">{children}</main>

      <Footer />
    </div>
  );
}

function AuthActions() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = user ? user.name.split(' ').map((s) => s[0]).slice(0, 2).join('') : '';
  return (
    <div className="flex items-center gap-3">
      {!user ? (
        <>
          <Link to="/login" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">Login</Link>
          <Link to="/register" className="rounded-full border border-white/10 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500">Register</Link>
          <Link to="/register/vendor" className="rounded-full border border-white/10 bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500">Become Seller</Link>
        </>
      ) : (
        <div className="relative">
          <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{initials}</div>
            <span className="hidden sm:inline">{user.name}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {open ? (
            // On small screens make the dropdown fixed and scrollable so it never gets clipped.
            // On sm+ screens keep the original absolute placement and sizing.
            <div className="fixed left-4 right-4 top-16 z-50 max-h-[60vh] overflow-auto rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-lg sm:static sm:left-auto sm:right-0 sm:top-auto sm:max-h-auto sm:overflow-visible sm:mt-2 sm:w-56">
              <Link to={user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer'} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Dashboard</Link>
              {user.type === 'customer' ? <Link to="/customer/orders" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Orders</Link> : <Link to="/vendor/orders" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Orders</Link>}
              <Link to="/customer/wishlist" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Wishlist</Link>
              <Link to="/wallet" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Wallet</Link>
              <button onClick={() => logout()} className="mt-2 w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400">Logout</button>
            </div>
          ) : null}
        </div>
      )}

      <Link to={user && ['ADMIN', 'SUPER_ADMIN', 'FRANCHISE_ADMIN'].includes(user.role || '') ? '/admin/super-dashboard' : '/admin/login'} className="rounded-full border border-blue-400/30 bg-blue-600/10 px-3 py-2 text-sm font-medium text-blue-200 transition hover:bg-blue-600/20">ERP Admin</Link>
      <Link to="/customer/checkout" className="inline-flex items-center justify-center rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-500">
        <ShoppingBag className="h-4 w-4" />
      </Link> 
    </div>
  );
}
