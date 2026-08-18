import { Link } from 'react-router-dom';
import { BellRing, Heart, MessageCircleMore, PackageCheck, ReceiptText, Wallet2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionShell } from '../components/SectionShell';
import { StatisticCard } from '../components/cards/MarketplaceCards';
import { getCustomerDashboard, type CustomerDashboardResponse } from '../api/customerApi';

export function CustomerDashboardPage() {
  const [dashboardData, setDashboardData] = useState<CustomerDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCustomerDashboard();
        setDashboardData(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const profile = dashboardData?.profile ?? null;
  const activeBidsCount = dashboardData?.activeBidsCount ?? 0;
  const wonAuctionsCount = dashboardData?.wonAuctionsCount ?? 0;
  const wishlistCount = dashboardData?.wishlistCount ?? 0;
  const walletBalance = dashboardData?.walletBalance ?? 0;
  const recentTransactions = Array.isArray(dashboardData?.recentTransactions) ? dashboardData.recentTransactions : [];
  const recentOrders = Array.isArray(dashboardData?.recentOrders) ? dashboardData.recentOrders : [];
  const profileCompletionPercentage = dashboardData?.profileCompletionPercentage ?? 0;
  const unreadMessageCount = dashboardData?.unreadMessageCount ?? 0;
  const unreadNotificationCount = dashboardData?.unreadNotificationCount ?? 0;
  const pendingInvoicesCount = dashboardData?.pendingInvoicesCount ?? 0;

  const displayName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email || 'Customer' : 'Customer';

  const stats = [
    { label: 'Active Bids', value: activeBidsCount.toString() },
    { label: 'Won Auctions', value: wonAuctionsCount.toString() },
    { label: 'Wishlist', value: wishlistCount.toString() },
    { label: 'Wallet Balance', value: `₹${walletBalance.toLocaleString()}` },
  ];

  if (isLoading) {
    return (
      <SectionShell title="Customer dashboard" subtitle="Your buying hub for orders, bids and wallet activity">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500"></div>
            <p className="mt-4 text-slate-400">Loading your dashboard...</p>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell title="Customer dashboard" subtitle="Your buying hub for orders, bids and wallet activity">
        <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-6">
          <p className="text-sm font-medium text-rose-200">Dashboard Error</p>
          <p className="mt-2 text-slate-300">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Customer dashboard" subtitle={`Welcome back, ${displayName}`}>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const routes: Record<string, string> = {
            'Active Bids': '/customer/bids',
            'Won Auctions': '/customer/auctions/won',
            'Wishlist': '/customer/wishlist',
            'Wallet Balance': '/customer/wallet',
          };

          return (
            <Link key={item.label} to={routes[item.label] || '#'} className="transition hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10">
              <StatisticCard label={item.label} value={item.value} />
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Profile completion</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{profileCompletionPercentage}% complete</h3>
          <div className="mt-4 w-full rounded-full bg-white/5">
            <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${profileCompletionPercentage}%` }} />
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
            {recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 4).map((tx, index) => (
                <div key={String(tx.id ?? index)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{tx.type || 'Transaction'}</p>
                    <p className="text-slate-400">{tx.id ? `#${tx.id}` : 'Transaction'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{typeof tx.amount === 'number' ? `₹${tx.amount.toLocaleString()}` : (tx.amount ?? '—')}</p>
                    <p className="text-slate-400">{tx.status || 'Pending'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No recent transactions</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 grid-cols-1 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Orders</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Recent purchases</h3>
              </div>
              <Link to="/customer/invoices" className="text-sm text-slate-300 hover:text-white">Invoices</Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <Link key={String(order.id ?? index)} to={`/customer/orders/${order.id ?? index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:border-blue-400/40 hover:bg-white/10">
                    <div>
                      <p className="font-semibold text-white">{order.orderNumber || 'Order'}</p>
                      <p>{order.id ? `#${order.id}` : 'Order reference'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{typeof order.totalAmount === 'number' ? `₹${order.totalAmount.toLocaleString()}` : '₹0'}</p>
                      <p className="text-emerald-300">{order.status || 'Processing'}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-slate-400">No recent orders</p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Active bids</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Auction momentum</h3>
              </div>
              <Link to="/customer/auctions/live" className="text-sm text-slate-300 hover:text-white">View auctions</Link>
            </div>
            <div className="mt-4 space-y-3">
              {activeBidsCount > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">You are currently bidding on {activeBidsCount} auction{activeBidsCount === 1 ? '' : 's'}</p>
                    <p className="text-white">{activeBidsCount}</p>
                  </div>
                  <p className="mt-2">Keep an eye on active auctions to stay ahead.</p>
                </div>
              ) : (
                <p className="text-slate-400">No active bids</p>
              )}
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
              <Link to="/customer/wallet" className="text-sm text-slate-300 hover:text-white">Manage</Link>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">₹{walletBalance.toLocaleString()}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Wallet2 className="h-4 w-4 text-blue-300" /> Wallet status</span>
                <span className="font-semibold text-white">{walletBalance > 0 ? 'Active' : 'Empty'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white">Quick access</h3>
            <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2">
              {[
                { label: 'Wishlist', icon: Heart, value: `${wishlistCount} items`, route: '/customer/wishlist' },
                { label: 'Messages', icon: MessageCircleMore, value: `${unreadMessageCount} unread`, route: '/customer/messages' },
                { label: 'Notifications', icon: BellRing, value: `${unreadNotificationCount} unread`, route: '/customer/notifications' },
                { label: 'Invoices', icon: ReceiptText, value: `${pendingInvoicesCount} pending`, route: '/customer/invoices' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} to={item.route} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 hover:border-blue-500/40">
                    <Icon className="mb-2 h-4 w-4 text-blue-300" />
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-xs">{item.value}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Unread notifications</h3>
            <BellRing className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-4 text-sm text-slate-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-3">{unreadNotificationCount} unread notifications</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Unread messages</h3>
            <MessageCircleMore className="h-4 w-4 text-blue-300" />
          </div>
          <div className="mt-4 text-sm text-slate-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-3">{unreadMessageCount} unread messages</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Pending invoices</h3>
            <PackageCheck className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="mt-4 text-sm text-slate-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-3">{pendingInvoicesCount} pending invoices</p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
