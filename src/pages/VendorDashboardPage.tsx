import { Link } from 'react-router-dom';
import { BarChart3, PackageCheck, ShoppingBag, TrendingUp, Wallet, MessageCircleMore, ClipboardList } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { vendorStats, transactions, reviews, vendorInventory, vendorOrders, vendorAuctions, vendorReports, verificationSteps } from '../data/mockData';
import { Card } from '../components/common/Card';
import SalesChart from '../components/common/SalesChart';
import VendorSidebar from '../components/layout/VendorSidebar';

export function VendorDashboardPage() {
  return (
    <SectionShell title="Vendor dashboard" subtitle="Manage inventory, orders and growth from one trusted workspace" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Dashboard' }] }>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {vendorStats.map((item) => (
              <Card key={item.label} className="shadow-lg shadow-slate-950/20">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">Sales overview</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Performance this month</h3>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Healthy</div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {vendorReports.map((report) => (
                  <div key={report.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">{report.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{report.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-5">
                <div className="flex items-center gap-2 text-amber-300"><TrendingUp className="h-4 w-4" /> 24% uplift on repeat purchases</div>
                <p className="mt-2 text-sm text-slate-300">Your storefront is outperforming recent demand thresholds thanks to faster shipping and responsive support.</p>
                <div className="mt-4">
                  <SalesChart />
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold text-white">Verification status</h3>
                <div className="mt-4 space-y-3">
                  {verificationSteps.map((step) => (
                    <div key={step.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      <span>{step.title}</span>
                      <span className={step.done ? 'text-emerald-300' : 'text-amber-300'}>{step.done ? 'Complete' : 'Pending'}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold text-white">Quick actions</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Inventory', icon: PackageCheck, route: '/products' },
                    { label: 'Create product', icon: ShoppingBag, route: '/vendor/create-product-wizard' },
                    { label: 'Create auction', icon: BarChart3, route: '/vendor/create-auction-wizard' },
                    { label: 'Wallet', icon: Wallet, route: '/vendor/wallet' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} to={item.route} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 hover:border-emerald-500/40">
                        <Icon className="mb-2 h-4 w-4 text-emerald-300" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card>
              <h3 className="text-lg font-semibold text-white">Inventory health</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {vendorInventory.map((item) => (
                  <div key={item.sku} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="mt-1">{item.sku} • {item.stock}</p>
                    <p className="mt-1 text-emerald-300">{item.health}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white">Orders</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {vendorOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-semibold text-white">{order.id}</p>
                    <p className="mt-1">{order.customer} • {order.total}</p>
                    <p className="mt-1 text-blue-300">{order.status}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white">Active auctions</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {vendorAuctions.map((auction) => (
                  <div key={auction.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-semibold text-white">{auction.title}</p>
                    <p className="mt-1">{auction.bids} bids</p>
                    <p className="mt-1 text-amber-300">{auction.status}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold text-white">Latest transactions</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {transactions.map((tx) => <div key={tx.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">{tx.type} • {tx.amount} • {tx.status}</div>)}
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-white">Recent reviews</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {reviews.map((review) => <div key={review.author} className="rounded-2xl border border-white/10 bg-white/5 p-3">{review.author}: {review.quote}</div>) }
              </div>
            </Card>
          </div>
        </main>
      </div>
    </SectionShell>
  );
}
