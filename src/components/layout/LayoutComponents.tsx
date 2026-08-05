import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Bell, Gavel, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import Logo from '../Logo';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export function Navbar({ theme, toggleTheme }: NavbarProps) {
  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Centralized logo component */}
        <Link to="/" className="inline-flex items-center"><Logo /></Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {[
            ['Marketplace', '/marketplace'],
            ['Auctions', '/auctions'],
            ['Customer', '/dashboards/customer'],
            ['Vendor', '/dashboards/vendor'],
            ['Admin', '/dashboards/admin']
          ].map(([label, to]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `${isActive ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`rounded-full border p-2.5 transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className={`rounded-full border p-2.5 transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Search className="h-4 w-4" />
          </button>
          <button className={`rounded-full border p-2.5 transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileNavbar({ theme, toggleTheme }: NavbarProps) {
  return (
    <div className={`flex items-center justify-between border-b px-4 py-3 md:hidden ${theme === 'dark' ? 'border-white/10 bg-slate-950/90' : 'border-slate-200 bg-white/90'}`}>
      <Link to="/" className="inline-flex items-center"><Logo /></Link>
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className={`rounded-full border p-2 ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className={`rounded-full border p-2 ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
          <Menu className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function MegaMenu({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div className={`rounded-3xl border p-4 shadow-xl ${theme === 'dark' ? 'border-white/10 bg-slate-900/95' : 'border-slate-200 bg-white/95'}`}>
      <div className="grid gap-4 md:grid-cols-3">
        {['Collections', 'Live Auctions', 'Vendor Tools'].map((item) => (
          <div key={item} className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item}</p>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Premium experiences tailored to enterprise buyers and sellers.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ theme, children }: { theme: 'dark' | 'light'; children: ReactNode }) {
  return (
    <aside className={`rounded-[24px] border p-5 shadow-lg ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white/70'}`}>
      {children}
    </aside>
  );
}

export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.to ? <Link to={item.to} className="transition hover:text-blue-500">{item.label}</Link> : <span className="font-medium text-slate-700">{item.label}</span>}
          {index < items.length - 1 && <span>/</span>}
        </div>
      ))}
    </nav>
  );
}

export function Footer({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <footer className={`border-t ${theme === 'dark' ? 'border-white/10 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Bidzo</p>
            <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Enterprise-grade auction and marketplace experiences for modern commerce.</p>
          </div>
        <div>
          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Company</p>
          <ul className={`mt-3 space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            <li><Link to="/about" className="hover:text-blue-500">About</Link></li>
            <li><Link to="/careers" className="hover:text-blue-500">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-blue-500">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Resources</p>
          <ul className={`mt-3 space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            <li><Link to="/faq" className="hover:text-blue-500">FAQ</Link></li>
            <li><Link to="/blog" className="hover:text-blue-500">Blog</Link></li>
            <li><Link to="/help" className="hover:text-blue-500">Help Center</Link></li>
          </ul>
        </div>
        <div>
          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Policies</p>
          <ul className={`mt-3 space-y-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            <li><Link to="/privacy" className="hover:text-blue-500">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-blue-500">Terms</Link></li>
            <li><Link to="/refund" className="hover:text-blue-500">Refunds</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
