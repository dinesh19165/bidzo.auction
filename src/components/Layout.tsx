import { Link } from 'react-router-dom';
import React, { useRef, useState } from 'react';
import Logo from './Logo';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Globe, Menu, Mic, Search, ShoppingBag, Store, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLInputElement>(null);

  const mobileLinks = [
    { to: '/', label: 'Home' },
    { to: '/marketplace', label: 'Marketplace' },
    { to: '/categories', label: 'Categories' },
    { to: '/auctions', label: 'Auctions' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
    { to: '/register/vendor', label: 'Become Seller' },
    { to: '/dashboards/customer', label: 'Customer Dashboard' },
    { to: '/dashboards/vendor', label: 'Vendor Dashboard' },
    { to: '/help', label: 'Help' },
    { to: '/contact', label: 'Contact' },
    { to: '/about', label: 'About' },
    { to: '/customer/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_25%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-black/20">
        <div className="border-b border-white/10">
          <div className="mx-auto flex flex-col gap-2 px-4 py-2 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="inline-flex flex-wrap items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-slate-100">
              <span className="font-medium">Free express shipping</span>
              <span className="text-slate-400">on orders over ₹5,000</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                <Globe className="h-3.5 w-3.5" /> English
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                ₹ INR
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
              <Link to="/help" className="rounded-full px-3 py-1 text-slate-300 transition hover:text-white">Help</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo component: uses /logo.png if present in public/, falls back to text */}
          <div>
            {/* Shared header: logo always shown and links to home */}
            <Link to="/" className="inline-flex items-center flex-shrink-0">
              <Logo className="w-[200px] h-[200px] object-contain" />
           </Link>
          </div>

          <div className="hidden flex-1 items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 lg:flex">
            <button type="button" aria-label="Focus search" onClick={() => desktopSearchRef.current?.focus()} className="inline-flex items-center justify-center rounded-full bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
              <Search className="h-4 w-4" />
            </button>
            <input
              ref={desktopSearchRef}
              placeholder="Search products, auctions, sellers..."
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
            <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300 xl:inline-flex">
              All categories
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
            <button type="button" aria-label="Voice search" onClick={() => desktopSearchRef.current?.focus()} className="inline-flex items-center justify-center rounded-full bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
              <Mic className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AuthActions />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 md:hidden">
            <button type="button" onClick={() => setMobileSearchOpen((value) => !value)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200">
              <Search className="h-4 w-4" />
            </button>
            <Link to="/login" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200">Login</Link>
            <Link to="/register" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white">Register</Link>
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {mobileSearchOpen ? (
          <div className="border-t border-white/10 bg-slate-900/70 px-4 py-3 md:hidden">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input placeholder="Search products, auctions, sellers..." className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" />
            </div>
          </div>
        ) : null}

        <div className="border-t border-white/10 bg-slate-900/75">
          <div className="mx-auto flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm text-slate-300 scrollbar-hidden sm:px-6 lg:px-8">
            {['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Furniture', 'Agriculture', 'Livestock', 'Services', 'Books', 'Pets'].map((item) => (
              <Link key={item} to="/marketplace" className="shrink-0 snap-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10">
                {item}
              </Link>
            ))}
            <Link to="/auctions" className="shrink-0 snap-start rounded-full bg-amber-500/10 px-3 py-1.5 font-medium text-amber-200 transition hover:bg-amber-500/20">
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
              className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
              aria-label="Close navigation menu"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-sm flex-col border-r border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40"
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
                  <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)} className="flex min-h-[48px] items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10">
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <main className="overflow-x-hidden">{children}</main>

      <footer className="border-t border-white/10 bg-slate-950/90">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
          <div>
            <p className="text-lg font-semibold">Bidzo</p>
            <p className="mt-3 text-sm text-slate-400">A premium marketplace for real products, live auctions, verified sellers, and fast delivery across India.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-slate-400">
              <span>© 2026 Bidzo</span>
              <span>All rights reserved</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Marketplace</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link to="/marketplace" className="hover:text-white">Marketplace</Link></li>
              <li><Link to="/auctions" className="hover:text-white">Auctions</Link></li>
              <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact us</Link></li>
              <li><Link to="/refund" className="hover:text-white">Refund policy</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white">About us</Link></li>
              <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Stay connected</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Twitter</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">LinkedIn</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Instagram</span>
            </div>
          </div>
        </div>
      </footer>
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
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/80 p-3 shadow-lg">
              <Link to={user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer'} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Dashboard</Link>
              {user.type === 'customer' ? <Link to="/customer/orders" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Orders</Link> : <Link to="/vendor/orders" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Orders</Link>}
              <Link to="/customer/wishlist" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Wishlist</Link>
              <Link to="/wallet" className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/5">Wallet</Link>
              <button onClick={() => logout()} className="mt-2 w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400">Logout</button>
            </div>
          ) : null}
        </div>
      )}

      {/* <Link to="/admin/super-dashboard" className="rounded-full border border-blue-400/30 bg-blue-600/10 px-3 py-2 text-sm font-medium text-blue-200 transition hover:bg-blue-600/20">ERP Admin</Link>
      <Link to="/customer/checkout" className="inline-flex items-center justify-center rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-500">
        <ShoppingBag className="h-4 w-4" />
      </Link> */}
    </div>
  );
}
