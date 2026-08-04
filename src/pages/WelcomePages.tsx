import React from 'react';
import { Link } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { useAuth } from '../context/AuthContext';

export function CustomerWelcome() {
  const { user } = useAuth();
  return (
    <SectionShell title={`Welcome ${user?.name || ''}`} subtitle="Glad to have you on Bidzo">
      <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
          <h3 className="text-lg font-semibold text-white">Continue shopping</h3>
          <p className="mt-2 text-sm text-slate-300">Explore curated picks and active auctions.</p>
          <Link to="/marketplace" className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-white">Shop now</Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
          <h3 className="text-lg font-semibold text-white">Your activity</h3>
          <ul className="mt-3 text-sm text-slate-300 space-y-2">
            <li>Active bids: 2</li>
            <li>Orders: 0</li>
            <li>Wishlist items: 3</li>
          </ul>
          <Link to="/dashboards/customer" className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-slate-900">Go to dashboard</Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function VendorWelcome() {
  const { user } = useAuth();
  return (
    <SectionShell title={`Welcome ${user?.name || ''}`} subtitle="Your seller workspace is ready">
      <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
          <h3 className="text-lg font-semibold text-white">Create product</h3>
          <p className="mt-2 text-sm text-slate-300">Add inventory and start selling.</p>
          <Link to="/vendor/create-product" className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-white">Create product</Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
          <h3 className="text-lg font-semibold text-white">Seller actions</h3>
          <ul className="mt-3 text-sm text-slate-300 space-y-2">
            <li>Create auction</li>
            <li>Manage inventory</li>
            <li>View reports</li>
          </ul>
          <Link to="/dashboards/vendor" className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-slate-900">Go to vendor dashboard</Link>
        </div>
      </div>
    </SectionShell>
  );
}
