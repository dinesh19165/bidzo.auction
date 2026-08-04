import { Link } from 'react-router-dom';
import { BellRing, Heart, MessageCircleMore, PackageCheck, ReceiptText, Search, Settings, Wallet2 } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { customerStats, notifications, transactions, wishlistItems, customerOrders, customerBids, recentlyViewed, savedSearches, addresses, supportTickets, invoices, walletActivity } from '../data/mockData';
import { StatisticCard } from '../components/cards/MarketplaceCards';

export function CustomerDashboardPage() {
  const profileParts = [savedSearches.length > 0, wishlistItems.length > 0, addresses.length > 0, notifications.length > 0];
  const completion = Math.round((profileParts.filter(Boolean).length / profileParts.length) * 100);
  return (
    <SectionShell title="Customer dashboard" subtitle="Your buying hub for orders, bids and wallet activity">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {customerStats.map((item) => (
          <StatisticCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Profile completion</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{completion}% complete</h3>
          <div className="mt-4 w-full rounded-full bg-white/5">
            <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-300">Complete your profile to get verified badges, faster checkout, and personalized recommendations.</p>
          <div className="mt-4">
            <Link to="/customer/profile" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Complete profile</Link>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Recent transactions</p>
            <Link to="/customer/transactions" className="text-sm text-slate-300 hover:text-white">All</Link>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{tx.type}</p>
                  <p className="text-slate-400">{tx.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{tx.amount}</p>
                  <p className="text-slate-400">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Orders</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Recent purchases</h3>
              </div>
              <Link to="/invoices" className="text-sm text-slate-300 hover:text-white">Invoices</Link>
            </div>
            <div className="mt-4 space-y-3">
              {customerOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-white">{order.item}</p>
                    <p>{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{order.total}</p>
                    <p className="text-emerald-300">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Active bids</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Auction momentum</h3>
              </div>
              <Link to="/auctions" className="text-sm text-slate-300 hover:text-white">View auctions</Link>
            </div>
            <div className="mt-4 space-y-3">
              {customerBids.map((bid) => (
                <div key={bid.item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{bid.item}</p>
                    <p className="text-white">{bid.bid}</p>
                  </div>
                  <p className="mt-2">{bid.progress}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Wallet</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Available balance</h3>
              </div>
              <Link to="/wallet" className="text-sm text-slate-300 hover:text-white">Manage</Link>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">₹82,500</p>
            <div className="mt-4 space-y-3">
              {walletActivity.map((entry) => (
                <div key={entry.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <span>{entry.title}</span>
                  <span className="font-semibold text-white">{entry.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-lg font-semibold text-white">Quick access</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[{ label: 'Wishlist', icon: Heart, route: '/customer/wishlist' }, { label: 'Messages', icon: MessageCircleMore, route: '/customer/messages' }, { label: 'Notifications', icon: BellRing, route: '/customer/notifications' }, { label: 'Settings', icon: Settings, route: '/customer/settings' }].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} to={item.route} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 hover:border-blue-500/40">
                    <Icon className="mb-2 h-4 w-4 text-blue-300" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Wishlist</h3>
            <Heart className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {wishlistItems.map((item) => <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">{item.title} • {item.price}</div>)}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Saved searches</h3>
            <Search className="h-4 w-4 text-blue-300" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {savedSearches.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3">{item}</div>)}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Addresses</h3>
            <PackageCheck className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {addresses.map((address) => <div key={address.label} className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="font-semibold text-white">{address.label}</p><p className="mt-1">{address.detail}</p></div>)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Support tickets</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {supportTickets.map((ticket) => <div key={ticket.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">{ticket.subject} • {ticket.status}</div>)}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Invoices</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {invoices.map((invoice) => <div key={invoice.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">{invoice.id} • {invoice.amount} • {invoice.due}</div>)}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
