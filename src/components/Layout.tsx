import { Link, NavLink } from 'react-router-dom';
import { Bell, ChevronDown, Globe, Heart, MapPin, Microphone, Search, ShoppingBag, Store } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_25%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-black/20">
        <div className="border-b border-white/10">
          <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-slate-300 sm:px-6 lg:px-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-slate-100">
              <span className="font-medium">Free express shipping</span>
              <span className="text-slate-400">on orders over ₹5,000</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition hover:bg-white/10">
                <Globe className="h-3.5 w-3.5" /> English
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition hover:bg-white/10">
                ₹ INR
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <Link to="/help" className="rounded-full px-3 py-1 text-slate-300 transition hover:text-white">Help</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-3 shadow-lg shadow-blue-600/30">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-wide">Bidzo</p>
              <p className="text-xs text-slate-400">Premium marketplace</p>
            </div>
          </Link>

          <div className="hidden flex-1 items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 lg:flex">
            <button className="inline-flex items-center justify-center rounded-full bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
              <Search className="h-4 w-4" />
            </button>
            <input
              placeholder="Search products, auctions, sellers..."
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
            <button className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300 xl:inline-flex">
              All categories
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="inline-flex items-center justify-center rounded-full bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
              <Microphone className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10">
              <MapPin className="h-4 w-4" /> Bengaluru
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
              <Heart className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
              <MapPin className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center justify-center rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-500">
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 bg-slate-900/75">
          <div className="mx-auto flex flex-wrap items-center gap-3 px-4 py-3 text-sm text-slate-300 sm:px-6 lg:px-8">
            {['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Furniture', 'Agriculture', 'Livestock', 'Services', 'Books', 'Pets'].map((item) => (
              <Link key={item} to="/marketplace" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10">
                {item}
              </Link>
            ))}
            <Link to="/auctions" className="ml-auto rounded-full bg-amber-500/10 px-3 py-1.5 font-medium text-amber-200 transition hover:bg-amber-500/20">
              Live auctions
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 bg-slate-950/90">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div>
            <p className="text-lg font-semibold">Bidzo</p>
            <p className="mt-3 text-sm text-slate-400">A premium marketplace for real products, live auctions, verified sellers, and fast delivery across India.</p>
            <div className="mt-6 flex items-center gap-3 text-slate-400">
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
              <li><Link to="/policy" className="hover:text-white">Privacy</Link></li>
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
