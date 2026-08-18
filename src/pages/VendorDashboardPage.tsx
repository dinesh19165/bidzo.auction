import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, PackageCheck, ShoppingBag, TrendingUp, Wallet, Truck } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { Card } from '../components/common/Card';
import SalesChart from '../components/common/SalesChart';
import VendorSidebar from '../components/layout/VendorSidebar';
import { ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { getVendorDashboard, type VendorDashboardResponse } from '../api/vendorDashboardApi';

const formatCurrency = (value: number | string | undefined | null) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export function VendorDashboardPage() {
  const [dashboard, setDashboard] = useState<VendorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVendorDashboard();
        if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load vendor dashboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboard ? [
    { label: 'Live Products', value: String(dashboard.liveProducts) },
    { label: 'Open Auctions', value: String(dashboard.openAuctions) },
    { label: 'Orders', value: String(dashboard.totalOrders) },
    { label: 'Revenue', value: formatCurrency(dashboard.totalRevenue) },
  ] : [];

  const salesMetrics = dashboard ? [
    { label: 'Daily revenue', value: formatCurrency(dashboard.dailyRevenue) },
    { label: 'Weekly revenue', value: formatCurrency(dashboard.weeklyRevenue) },
    { label: 'Monthly revenue', value: formatCurrency(dashboard.monthlyRevenue) },
    { label: 'Active products', value: String(dashboard.activeProducts) },
    { label: 'Live auctions', value: String(dashboard.liveAuctions) },
    { label: 'Repeat customers', value: `${dashboard.repeatCustomers}%` },
  ] : [];

  const verificationSteps = dashboard ? [
    { title: 'Business details', done: dashboard.verificationStatus.businessDetails === 'COMPLETE' },
    { title: 'GST and bank info', done: dashboard.verificationStatus.gstAndBank === 'COMPLETE' },
    { title: 'Identity verification', done: dashboard.verificationStatus.identityVerification === 'COMPLETE' },
  ] : [];

  const chartData = dashboard ? [
    { name: 'Daily', value: Number(dashboard.dailyRevenue || 0) },
    { name: 'Weekly', value: Number(dashboard.weeklyRevenue || 0) },
    { name: 'Monthly', value: Number(dashboard.monthlyRevenue || 0) },
  ] : [];

  return (
    <SectionShell title="Vendor dashboard" subtitle="Manage inventory, orders and growth from one trusted workspace" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Dashboard' }] }>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : error ? (
            <ErrorState title="Dashboard error" description={error} />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
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
                    {salesMetrics.slice(0, 3).map((report) => (
                      <div key={report.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-slate-400">{report.label}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{report.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-5">
                    <div className="flex items-center gap-2 text-amber-300"><TrendingUp className="h-4 w-4" /> {Number(dashboard?.repeatCustomers ?? 0)}% repeat customer rate</div>
                    <p className="mt-2 text-sm text-slate-300">Your current storefront metrics reflect the latest backend data for sales, orders, and buyer retention.</p>
                    <div className="mt-4">
                      <SalesChart data={chartData} />
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
                        { label: 'Create bike auction', icon: Truck, route: '/vendor/create-auction-wizard?type=bike' },
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
                {salesMetrics.slice(3).map((item) => (
                  <Card key={item.label}>
                    <h3 className="text-lg font-semibold text-white">{item.label}</h3>
                    <p className="mt-4 text-2xl font-semibold text-white">{item.value}</p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </SectionShell>
  );
}
