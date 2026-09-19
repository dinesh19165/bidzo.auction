import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BarChart3, Gavel, Home, Package, Percent } from 'lucide-react';

const items = [
  { label: 'Dashboard', to: '/dashboards/vendor' },
  { label: 'Products', to: '/vendor/products' },
  { label: 'Create product', to: '/vendor/create-product-wizard' },
  { label: 'Auctions', to: '/vendor/auction-analytics' },
  { label: 'Offers', to: '/vendor/offers' },
  { label: 'Inventory', to: '/vendor/inventory' },
  { label: 'Orders', to: '/vendor/orders' },
  { label: 'Wallet', to: '/vendor/wallet' },
  { label: 'Messages', to: '/vendor/messages' },
  { label: 'Reports', to: '/vendor/reports' },
  { label: 'Support', to: '/vendor/support' },
];

export function VendorSidebar() {
  const loc = useLocation();

  const vendorName = 'Vendor';

  return (
    <>
      <aside className="hidden w-64 shrink-0 space-y-3 lg:block">
        <div className="rounded-[16px] border border-white/6 bg-slate-900/60 p-4">

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
            <span className="text-sm font-semibold text-white">
              V
            </span>
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {vendorName}
            </div>

            <div className="text-xs text-slate-400">
              Seller • Premium
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={`block rounded-md px-3 py-2 text-sm ${
                loc.pathname.startsWith(it.to)
                  ? 'bg-emerald-600/10 text-emerald-300'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        </div>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-xl lg:hidden" aria-label="Vendor navigation">
        <div className="grid grid-cols-5 gap-1">
          {[{ label: 'Home', to: '/dashboards/vendor', icon: Home }, { label: 'Products', to: '/vendor/products', icon: Package }, { label: 'Auctions', to: '/vendor/auction-analytics', icon: Gavel }, { label: 'Offers', to: '/vendor/offers', icon: Percent }, { label: 'More', to: '/vendor/inventory', icon: BarChart3 }].map(({ label, to, icon: Icon }) => (
            <Link key={to} to={to} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] ${loc.pathname.startsWith(to) ? 'text-emerald-300' : 'text-slate-400 hover:text-slate-100'}`}>
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export default VendorSidebar;