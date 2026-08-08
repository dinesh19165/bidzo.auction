import React from 'react';
import { Link } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, ShoppingBag, Store, Wallet } from 'lucide-react';

export function CustomerWelcome() {
  const { user } = useAuth();
  return (
    <SectionShell title={`Welcome ${user?.name || ''}`} subtitle="Glad to have you on Bidzo">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            <CheckCircle2 className="h-4 w-4" /> Account ready
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-white">Your buyer workspace is set up</h3>
          <p className="mt-3 text-sm text-slate-300">Explore curated picks, monitor bids, and enjoy a more secure buying experience from day one.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">Shop now <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/dashboards/customer" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:text-white">Go to dashboard</Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
            <ShoppingBag className="h-4 w-4" /> Your activity
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3"><span>Active bids</span><span className="font-semibold text-white">2</span></li>
            <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3"><span>Orders</span><span className="font-semibold text-white">0</span></li>
            <li className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3"><span>Wishlist items</span><span className="font-semibold text-white">3</span></li>
          </ul>
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-slate-300"><Wallet className="h-4 w-4 text-emerald-300" /> Wallet and payment preferences are ready to use.</div>
        </div>
      </div>
    </SectionShell>
  );
}

export function VendorWelcome() {
  const { user } = useAuth();
  return (
    <SectionShell title={`Welcome ${user?.name || ''}`} subtitle="Your seller workspace is ready">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/15 to-blue-500/10 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <Store className="h-4 w-4" /> Seller ready
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-white">Your storefront is ready to launch</h3>
          <p className="mt-3 text-sm text-slate-300">Add inventory, publish auctions, and manage orders with the confidence of a verified seller.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/vendor/create-product" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500">Create product <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/dashboards/vendor" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:text-white">Go to dashboard</Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
            <Store className="h-4 w-4" /> Seller actions
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">Create auction</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">Manage inventory</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">View reports</li>
          </ul>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-slate-300">Verification and trust signals help buyers view your seller profile with greater confidence.</div>
        </div>
      </div>
    </SectionShell>
  );
}
