import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchJson } from '../../api/apiClient';
import type { ApiResponse } from '../../types';

import { Box, Home } from 'lucide-react';

interface VendorProfile {
  id: number;
  companyName: string;
  description?: string;
  status?: string;
  franchiseId?: number | null;
  userId: number;
}

const items = [
  { label: 'Dashboard', to: '/dashboards/vendor' },
  { label: 'Products', to: '/vendor/products' },
  { label: 'Create product', to: '/vendor/create-product-wizard' },
  { label: 'Auctions', to: '/vendor/auction-analytics' },
  { label: 'Inventory', to: '/vendor/inventory' },
  { label: 'Orders', to: '/vendor/orders' },
  { label: 'Wallet', to: '/vendor/wallet' },
  { label: 'Messages', to: '/vendor/messages' },
  { label: 'Reports', to: '/vendor/reports' },
  { label: 'Support', to: '/vendor/support' },
];

export function VendorSidebar() {
  const loc = useLocation();

  const [vendor, setVendor] = useState<VendorProfile | null>(null);

  useEffect(() => {
    const loadVendorProfile = async () => {
      try {
        const response = await fetchJson<ApiResponse<VendorProfile>>(
          '/api/vendors/me',
          {
            method: 'GET',
          }
        );

        if (response?.data) {
          setVendor(response.data);
        }
      } catch (error) {
        console.error('Failed to load vendor profile:', error);
      }
    };

    loadVendorProfile();
  }, []);

  return (
    <aside className="hidden w-64 shrink-0 space-y-3 lg:block">
      <div className="rounded-[16px] border border-white/6 bg-slate-900/60 p-4">

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
            <span className="text-sm font-semibold text-white">
              {vendor?.companyName?.charAt(0)?.toUpperCase() || 'V'}
            </span>
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {vendor?.companyName || 'Vendor'}
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
  );
}

export default VendorSidebar;