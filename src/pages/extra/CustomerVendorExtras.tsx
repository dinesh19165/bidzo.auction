import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, BellRing, CreditCard, Heart, MapPin, MessageCircleMore, PackageCheck, ReceiptText, Search, Settings, ShieldCheck, Sparkles, Store, Wallet2 } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge, PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { EmptyState, SkeletonTable } from '../../components/loading/LoadingComponents';
import VendorSidebar from '../../components/layout/VendorSidebar';
import { addresses, customerBids, customerOrders, invoices, notifications, popularSearches, recentlyViewed, reviews, savedSearches, supportTickets, transactions, walletActivity, wishlistItems, vendorInventory, vendorProducts, vendorOrders, vendorAuctions, vendorReports, vendorShippingRules, vendorWithdrawals, vendorFeeHistory, vendorMessages, vendorNotifications } from '../../data/mockData';

function SubtlePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function CustomerProfilePage() {
  return (
    <SectionShell title="My profile" subtitle="Your verified buyer identity and delivery preferences">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SubtlePanel title="Account overview">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Name</span>
              <span className="font-semibold text-white">Asha Patel</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Verified status</span>
              <span className="font-semibold text-emerald-300">KYC approved</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Primary location</span>
              <span className="font-semibold text-white">Bengaluru</span>
            </div>
          </div>
        </SubtlePanel>
        <SubtlePanel title="Preferred delivery">
          <div className="rounded-[20px] border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-300" /> Fast express shipping to office and home</p>
            <p className="mt-3">Preferred payment methods: UPI, cards, and wallet.</p>
          </div>
        </SubtlePanel>
      </div>
    </SectionShell>
  );
}

export function CustomerOrdersPage() {
  return (
    <SectionShell title="My orders" subtitle="Your shipment and delivery history">
      <div className="space-y-3">
        {customerOrders.map((order) => (
          <div key={order.id} className="flex flex-wrap items-center justify-between rounded-[20px] border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
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
    </SectionShell>
  );
}

export function CustomerAuctionsPage() {
  return (
    <SectionShell title="My auctions" subtitle="Items you listed or are watching as a buyer">
      <div className="space-y-3">
        {customerBids.map((bid) => (
          <div key={bid.item} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{bid.item}</p>
              <p className="text-white">{bid.bid}</p>
            </div>
            <p className="mt-2">{bid.progress}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerBidsPage() {
  return (
    <SectionShell title="My active bids" subtitle="Live auctions currently in your watchlist">
      <div className="grid gap-4 lg:grid-cols-2">
        {customerBids.map((bid) => (
          <div key={bid.item} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <p className="font-semibold text-white">{bid.item}</p>
            <p className="mt-2 text-sm text-slate-400">Current bid • {bid.bid}</p>
            <p className="mt-4 text-sm text-amber-300">{bid.progress}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerWonAuctionsPage() {
  return (
    <SectionShell title="Won auctions" subtitle="Concluded items you successfully secured">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="font-semibold text-white">Classic Motorcycle</p>
            <p>Won for ₹8,20,000</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Paid</span>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerRecentlyViewedPage() {
  return (
    <SectionShell title="Recently viewed" subtitle="Items you explored recently">
      <div className="grid gap-4 md:grid-cols-2">
        {recentlyViewed.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <p className="font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-sm text-slate-400">{item.price}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerWatchlistPage() {
  return (
    <SectionShell title="Watchlist" subtitle="Items you want to track for future deals">
      <div className="grid gap-4 md:grid-cols-2">
        {wishlistItems.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <p className="font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-sm text-slate-400">{item.note}</p>
            <p className="mt-4 text-lg font-semibold text-white">{item.price}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerSavedSearchesPage() {
  return (
    <SectionShell title="Saved searches" subtitle="Search filters you revisit often">
      <div className="grid gap-3 md:grid-cols-2">
        {savedSearches.map((item) => (
          <div key={item} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">{item}</div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerTransactionsPage() {
  return (
    <SectionShell title="Transactions" subtitle="Your wallet history and credit activity">
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-white">{tx.type}</p>
              <p>{tx.id}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">{tx.amount}</p>
              <p>{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerAddressesPage() {
  return (
    <SectionShell title="Addresses" subtitle="Saved delivery destinations">
      <div className="grid gap-4 lg:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.label} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">{address.label}</p>
            <p className="mt-2">{address.detail}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerMessagesPage() {
  return (
    <SectionShell title="Messages" subtitle="Direct conversations with sellers and support">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
        <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white">Nova Tech</p>
            <span className="text-emerald-300">Online</span>
          </div>
          <p className="mt-2">We can arrange a same-day handoff for your MacBook purchase.</p>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerReviewsPage() {
  return (
    <SectionShell title="Reviews" subtitle="Your feedback and seller ratings">
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.author} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">{review.author}</p>
            <p className="mt-2">“{review.quote}”</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerSupportPage() {
  return (
    <SectionShell title="Support tickets" subtitle="Service requests and dispute updates">
      <div className="space-y-3">
        {supportTickets.map((ticket) => (
          <div key={ticket.id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-white">{ticket.subject}</p>
              <p>{ticket.id}</p>
            </div>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-300">{ticket.status}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerInvoicesPage() {
  return (
    <SectionShell title="Invoices" subtitle="Receipts for your completed purchases">
      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-white">{invoice.id}</p>
              <p>Due • {invoice.due}</p>
            </div>
            <span className="text-white">{invoice.amount}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerSettingsPage() {
  return (
    <SectionShell title="Settings" subtitle="Customize your account experience">
      <div className="grid gap-6 lg:grid-cols-2">
        <SubtlePanel title="Notification preferences">
          <div className="space-y-3 text-sm text-slate-300">
            {notifications.slice(0, 2).map((note) => <div key={note.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">{note.title}</div>)}
          </div>
        </SubtlePanel>
        <SubtlePanel title="Security and payments">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Two-step verification enabled</div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"><CreditCard className="h-4 w-4 text-blue-300" /> Saved payment methods are protected</div>
          </div>
        </SubtlePanel>
      </div>
    </SectionShell>
  );
}

export function VendorBusinessInfoPage() {
  return (
    <SectionShell title="Business information" subtitle="Set your storefront identity and legal profile">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SubtlePanel title="Store identity">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Business name: Nova Retail Ltd.</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Contact email: ops@novaretail.com</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Operational hours: 9AM–9PM</div>
          </div>
        </SubtlePanel>
        <SubtlePanel title="Trust signals">
          <div className="rounded-[20px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-300" /> Verified business profile recognised by buyers</p>
            <p className="mt-3">Your brand highlights are live on product pages and auction listings.</p>
          </div>
        </SubtlePanel>
      </div>
    </SectionShell>
  );
}

export function VendorGstPage() {
  return (
    <SectionShell title="GST details" subtitle="Tax compliance information for your seller account">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <div className="grid gap-3 md:grid-cols-2">
          {['GSTIN: 29AABCN1234M1Z5', 'PAN: AABCN1234M', 'State: Karnataka'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">{item}</div>)}
        </div>
      </div>
    </SectionShell>
  );
}

export function VendorBankPage() {
  return (
    <SectionShell title="Bank details" subtitle="Secure payout and settlement setup">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Bank: HDFC • Account ending 2410 • IFSC HDFC0001124</div>
      </div>
    </SectionShell>
  );
}

export function VendorIdentityPage() {
  return (
    <SectionShell title="Identity verification" subtitle="Complete KYC for higher trust and limits">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Director PAN, Aadhaar, and business ownership documents are submitted and pending final review.</p>
      </div>
    </SectionShell>
  );
}

export function VendorStoreVerificationPage() {
  return (
    <SectionShell title="Store verification" subtitle="Your storefront quality standards and review status">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Storefront review complete. Product quality, shipping terms, and return policy are now visible to customers.</p>
      </div>
    </SectionShell>
  );
}

export function VendorStoreProfilePage() {
  return (
    <SectionShell title="Store profile" subtitle="Present your brand experience to buyers">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SubtlePanel title="Storefront overview">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Store rating: 4.9</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Response time: under 1 hour</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Fulfillment: 98% on time</div>
          </div>
        </SubtlePanel>
        <SubtlePanel title="Promotion highlights">
          <div className="rounded-[20px] border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Store className="h-4 w-4 text-blue-300" /> Featured premium listings and premium shipping packages</p>
          </div>
        </SubtlePanel>
      </div>
    </SectionShell>
  );
}

export function VendorStoreSettingsPage() {
  return (
    <SectionShell title="Store settings" subtitle="Tune storefront visibility and buyer experience">
      <div className="grid gap-4 md:grid-cols-2">
        {['Shipping policy', 'Return policy', 'Inventory alerts', 'Auction visibility'].map((setting) => (
          <div key={setting} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">{setting}</div>
        ))}
      </div>
    </SectionShell>
  );
}

export function VendorSubscriptionPage() {
  return (
    <SectionShell title="Subscription" subtitle="Your marketplace plan and feature access">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300">
        <p className="text-lg font-semibold text-white">Premium Seller Plan</p>
        <p className="mt-2">Includes advanced analytics, live auction promotions, and priority support.</p>
      </div>
    </SectionShell>
  );
}

export function VendorWalletPage() {
  return (
    <SectionShell title="Vendor wallet" subtitle="Payout balance and settlement insights" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Wallet' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <Card>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-slate-400">Available balance</p>
                <p className="mt-2 text-3xl font-semibold text-white">₹2,48,000</p>
                <p className="mt-1 text-sm text-slate-400">Settled: ₹2,00,000 • Pending: ₹48,000</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/vendor/withdraw" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Withdraw</Link>
                <Link to="/vendor/transactions" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">View transactions</Link>
              </div>
            </div>
          </Card>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold text-white">Recent activity</h3>
              <div className="mt-4">
                <Table columns={[{ key: 'title', label: 'Activity' }, { key: 'amount', label: 'Amount' }, { key: 'time', label: 'When' }]} data={walletActivity as any} />
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white">Recent withdrawals</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] table-auto text-sm">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="px-3 py-3">Request</th>
                      <th className="px-3 py-3">Amount</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {vendorWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-t border-white/6 hover:bg-white/5">
                        <td className="px-3 py-3">{withdrawal.id}</td>
                        <td className="px-3 py-3">{withdrawal.amount}</td>
                        <td className="px-3 py-3"><Badge className={withdrawal.status === 'Pending' ? 'bg-amber-500/10 text-amber-200' : 'bg-emerald-500/10 text-emerald-200'}>{withdrawal.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </SectionShell>
  );
}

export function VendorWithdrawPage() {
  return (
    <SectionShell title="Withdraw" subtitle="Transfer your earnings securely" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Withdraw' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <Card>
            <p className="text-lg font-semibold text-white">Next payout scheduled for 12 Aug 2026</p>
            <p className="mt-2 text-sm text-slate-300">Pending: ₹48,000 • Available: ₹2,48,000</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Request payout</button>
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">View payout history</button>
            </div>
          </Card>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="text-lg font-semibold text-white">Fee summary</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {vendorFeeHistory.map((fee) => (
                  <div key={fee.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <p>{fee.title}</p>
                      <p className="font-semibold text-white">{fee.amount}</p>
                    </div>
                    <p className="mt-1 text-slate-400">{fee.category} • {fee.date}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white">Quick tips</h3>
              <p className="mt-4 text-sm text-slate-300">Keep settlements smooth by confirming shipment details within 24 hours and updating tracking numbers immediately.</p>
            </Card>
          </div>
        </main>
      </div>
    </SectionShell>
  );
}

export function VendorSalesAnalyticsPage() {
  return (
    <SectionShell title="Sales analytics" subtitle="Revenue, conversion and repeat buyer trends">
      <div className="grid gap-4 md:grid-cols-3">
        {vendorReports.metrics.map((report) => (
          <div key={report.label} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">{report.label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{report.value}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function VendorOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();
    return vendorOrders.filter((order) => {
      const matchesSearch = order.id.toLowerCase().includes(query) || order.customer.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pageOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const statusColors: Record<string, string> = {
    Delivered: 'bg-emerald-500/10 text-emerald-200',
    Shipped: 'bg-blue-500/10 text-blue-200',
    Processing: 'bg-amber-500/10 text-amber-200',
    Pending: 'bg-slate-500/10 text-slate-200',
  };

  return (
    <SectionShell title="Orders" subtitle="Your active and completed customer orders" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Orders' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search order or customer" className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-white" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option>All</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <Card>
            {loading ? (
              <SkeletonTable />
            ) : filteredOrders.length === 0 ? (
              <EmptyState title="No matching orders" description="Change your search or status filter to find orders." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] table-auto text-sm">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="px-3 py-3">Order</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Items</th>
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">Shipping</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {pageOrders.map((order) => (
                      <tr key={order.id} className="border-t border-white/6 hover:bg-white/5">
                        <td className="px-3 py-3 font-medium text-white">{order.id}</td>
                        <td className="px-3 py-3">{order.customer}</td>
                        <td className="px-3 py-3">{order.items}</td>
                        <td className="px-3 py-3">{order.total}</td>
                        <td className="px-3 py-3">{order.shipping}</td>
                        <td className="px-3 py-3"><Badge className={statusColors[order.status] ?? 'bg-slate-500/10 text-slate-200'}>{order.status}</Badge></td>
                        <td className="px-3 py-3">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredOrders.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                <span>Showing {pageOrders.length} of {filteredOrders.length} orders</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
                  <span>{page} / {pageCount}</span>
                  <button onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))} disabled={page === pageCount} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </SectionShell>
  );
}

export function VendorCustomersPage() {
  return (
    <SectionShell title="Customers" subtitle="Your repeat buyers and top outreach segments">
      <div className="grid gap-4 md:grid-cols-2">
        {['Asha Patel', 'Rohan Desai', 'Meera Nair'].map((customer) => (
          <div key={customer} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">{customer}</div>
        ))}
      </div>
    </SectionShell>
  );
}

export function VendorInventoryPage() {
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('All');
  const [sortKey, setSortKey] = useState<'name' | 'stock' | 'health'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const filteredInventory = useMemo(() => {
    const normalized = search.toLowerCase().trim();
    let items = vendorInventory.filter((item) => item.name.toLowerCase().includes(normalized) || item.sku.toLowerCase().includes(normalized));
    if (healthFilter !== 'All') {
      items = items.filter((item) => item.health === healthFilter);
    }
    return items.sort((a, b) => {
      const left = (a as any)[sortKey];
      const right = (b as any)[sortKey];
      if (sortKey === 'stock') {
        const aValue = Number((left as string).replace(/[^0-9]/g, ''));
        const bValue = Number((right as string).replace(/[^0-9]/g, ''));
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortDir === 'asc' ? String(left).localeCompare(String(right)) : String(right).localeCompare(String(left));
    });
  }, [healthFilter, search, sortDir, sortKey]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredInventory.length / pageSize));
  const currentInventory = filteredInventory.slice((page - 1) * pageSize, page * pageSize);
  const allCurrentSelected = currentInventory.length > 0 && currentInventory.every((item) => selected.includes(item.sku));

  const toggleSelection = (sku: string) => {
    setSelected((prev) => (prev.includes(sku) ? prev.filter((id) => id !== sku) : [...prev, sku]));
  };

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelected((prev) => prev.filter((id) => !currentInventory.some((item) => item.sku === id)));
      return;
    }
    setSelected((prev) => [...new Set([...prev, ...currentInventory.map((item) => item.sku)])]);
  };

  const handleBulkAction = (action: string) => {
    alert(`Bulk ${action} ${selected.length} items (UI only)`);
  };

  return (
    <SectionShell title="Inventory" subtitle="Stock health for your catalog" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Inventory' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products or SKU" className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-white" />
              <select value={healthFilter} onChange={(e) => { setHealthFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option>All</option>
                <option>High</option>
                <option>Healthy</option>
                <option>Low stock</option>
              </select>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option value="name">Sort by product</option>
                <option value="stock">Sort by stock</option>
                <option value="health">Sort by health</option>
              </select>
              <button onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{sortDir === 'asc' ? 'Asc' : 'Desc'}</button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <SecondaryButton onClick={() => handleBulkAction('archive')} disabled={selected.length === 0}>Archive</SecondaryButton>
              <SecondaryButton onClick={() => handleBulkAction('publish')} disabled={selected.length === 0}>Publish</SecondaryButton>
              <SecondaryButton onClick={() => handleBulkAction('delete')} disabled={selected.length === 0}>Delete</SecondaryButton>
            </div>
          </div>

          <Card>
            {loading ? (
              <SkeletonTable />
            ) : filteredInventory.length === 0 ? (
              <EmptyState title="No inventory found" description="Try adjusting your search or filter options to find listings." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-auto text-sm">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="px-3 py-3">
                        <input type="checkbox" checked={allCurrentSelected} onChange={toggleSelectAll} />
                      </th>
                      <th className="px-3 py-3">Product</th>
                      <th className="px-3 py-3">SKU</th>
                      <th className="px-3 py-3">Stock</th>
                      <th className="px-3 py-3">Health</th>
                      <th className="px-3 py-3">Last updated</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {currentInventory.map((item) => (
                      <tr key={item.sku} className="border-t border-white/6 hover:bg-white/5">
                        <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(item.sku)} onChange={() => toggleSelection(item.sku)} /></td>
                        <td className="px-3 py-3 font-medium text-white">{item.name}</td>
                        <td className="px-3 py-3">{item.sku}</td>
                        <td className="px-3 py-3">{item.stock}</td>
                        <td className="px-3 py-3"><Badge className={item.health === 'Low stock' ? 'bg-rose-500/10 text-rose-200' : 'bg-emerald-500/10 text-emerald-200'}>{item.health}</Badge></td>
                        <td className="px-3 py-3">{item.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredInventory.length > 0 && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">Showing {currentInventory.length} of {filteredInventory.length} items</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
                  <span className="text-sm text-slate-400">{page} / {pageCount}</span>
                  <button onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))} disabled={page === pageCount} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </SectionShell>
  );
}

export function VendorProductsPage() {
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState('All');
  const [auctionFilter, setAuctionFilter] = useState('All');
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock' | 'views' | 'favorites'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = search.toLowerCase().trim();
    let items = vendorProducts.filter((item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.sku.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized)
    );
    if (statusFilter !== 'All') {
      items = items.filter((item) => item.status === statusFilter);
    }
    if (categoryFilter !== 'All') {
      items = items.filter((item) => item.category === categoryFilter);
    }
    if (stockFilter !== 'All') {
      items = items.filter((item) => item.stockStatus === stockFilter);
    }
    if (featuredFilter !== 'All') {
      items = items.filter((item) => (featuredFilter === 'Featured') === item.featured);
    }
    if (auctionFilter !== 'All') {
      items = items.filter((item) =>
        auctionFilter === 'Auction' ? item.auctionStatus !== 'None' : item.auctionStatus === 'None'
      );
    }

    return items.sort((a, b) => {
      if (sortKey === 'price') {
        const aValue = Number(a.price.replace(/[^0-9]/g, ''));
        const bValue = Number(b.price.replace(/[^0-9]/g, ''));
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (sortKey === 'stock') {
        return sortDir === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      }
      if (sortKey === 'views') {
        return sortDir === 'asc' ? Number(a.views.replace(/[^0-9]/g, '')) - Number(b.views.replace(/[^0-9]/g, '')) : Number(b.views.replace(/[^0-9]/g, '')) - Number(a.views.replace(/[^0-9]/g, ''));
      }
      if (sortKey === 'favorites') {
        return sortDir === 'asc' ? Number(a.favorites) - Number(b.favorites) : Number(b.favorites) - Number(a.favorites);
      }
      return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
  }, [search, sortDir, sortKey, statusFilter, categoryFilter, stockFilter, featuredFilter, auctionFilter]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = currentProducts.length > 0 && currentProducts.every((item) => selected.includes(item.sku));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !currentProducts.some((item) => item.sku === id)));
      return;
    }
    setSelected((prev) => [...new Set([...prev, ...currentProducts.map((item) => item.sku)])]);
  };

  const toggleSelect = (sku: string) => {
    setSelected((prev) => (prev.includes(sku) ? prev.filter((id) => id !== sku) : [...prev, sku]));
  };

  const handleQuickAction = (action: string, item: any) => {
    alert(`${action} ${item.name} (UI only)`);
  };

  return (
    <SectionShell title="Products" subtitle="Manage your active catalog and promotions" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Products' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search product, SKU or category" className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-white" />
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option>All</option>
                <option>Live</option>
                <option>Auction</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option>All</option>
                <option>Laptops</option>
                <option>Luxury Watches</option>
                <option>Furniture</option>
                <option>Photography</option>
                <option>Wearables</option>
                <option>Electronics</option>
              </select>
              <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option>All</option>
                <option>In stock</option>
                <option>Low stock</option>
                <option>Out of stock</option>
                <option>Reserved</option>
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <select value={featuredFilter} onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option>All</option>
                <option>Featured</option>
                <option>Standard</option>
              </select>
              <select value={auctionFilter} onChange={(e) => { setAuctionFilter(e.target.value); setPage(1); }} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option>All</option>
                <option>Auction</option>
                <option>Regular</option>
              </select>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option value="name">Sort by name</option>
                <option value="price">Sort by price</option>
                <option value="stock">Sort by stock</option>
                <option value="views">Sort by views</option>
                <option value="favorites">Sort by favorites</option>
              </select>
              <button onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{sortDir === 'asc' ? 'Asc' : 'Desc'}</button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton onClick={() => setView('cards')} className={view === 'cards' ? 'bg-blue-500' : ''}>Card view</PrimaryButton>
              <SecondaryButton onClick={() => setView('table')} className={view === 'table' ? 'border-emerald-500/40 text-emerald-200' : ''}>Table view</SecondaryButton>
              <Link to="/vendor/create-product-wizard"><PrimaryButton>Create product</PrimaryButton></Link>
            </div>
          </div>

          {loading ? (
            <SkeletonTable />
          ) : filteredProducts.length === 0 ? (
            <EmptyState title="No products match" description="Try modifying your search or status filters." />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                  <span>{filteredProducts.length} products</span>
                  <span>{selected.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Duplicate', { name: `${selected.length} items` })}>Duplicate</SecondaryButton>
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Publish', { name: `${selected.length} items` })}>Publish</SecondaryButton>
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Feature', { name: `${selected.length} items` })}>Feature</SecondaryButton>
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Archive', { name: `${selected.length} items` })}>Archive</SecondaryButton>
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Delete', { name: `${selected.length} items` })}>Delete</SecondaryButton>
                </div>
              </div>

              {view === 'cards' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {currentProducts.map((product) => (
                    <Card key={product.sku} className="group transition hover:shadow-xl hover:shadow-slate-950/30">
                      <div className="relative overflow-hidden rounded-[20px] bg-slate-950/20">
                        <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
                        <div className="absolute inset-x-0 top-3 flex justify-between px-3">
                          <Badge className="bg-emerald-500/10 text-emerald-200">{product.badge}</Badge>
                          <Badge className={product.status === 'Archived' ? 'bg-rose-500/10 text-rose-200' : 'bg-blue-500/10 text-blue-200'}>{product.status}</Badge>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-lg font-semibold text-white">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{product.category}</p>
                        <p className="mt-3 text-xl font-semibold text-white">{product.price}</p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                          <span>{product.stock} in stock</span>
                          <span>{product.auctionStatus}</span>
                          <span>{product.views} views</span>
                          <span>{product.favorites} favorites</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <SecondaryButton onClick={() => handleQuickAction('Duplicate', product)}>Duplicate</SecondaryButton>
                        <SecondaryButton onClick={() => handleQuickAction('Feature', product)}>Feature</SecondaryButton>
                        <SecondaryButton onClick={() => handleQuickAction('Archive', product)}>Archive</SecondaryButton>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70">
                  <table className="w-full min-w-[860px] table-auto text-sm">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="px-3 py-3"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                        <th className="px-3 py-3">Product</th>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3">Price</th>
                        <th className="px-3 py-3">Stock</th>
                        <th className="px-3 py-3">Auction</th>
                        <th className="px-3 py-3">Views</th>
                        <th className="px-3 py-3">Favorites</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {currentProducts.map((item) => (
                        <tr key={item.sku} className="border-t border-white/6 hover:bg-white/5">
                          <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(item.sku)} onChange={() => toggleSelect(item.sku)} /></td>
                          <td className="px-3 py-3 font-medium text-white">{item.name}</td>
                          <td className="px-3 py-3">{item.category}</td>
                          <td className="px-3 py-3">{item.price}</td>
                          <td className="px-3 py-3">{item.stock}</td>
                          <td className="px-3 py-3">{item.auctionStatus}</td>
                          <td className="px-3 py-3">{item.views}</td>
                          <td className="px-3 py-3">{item.favorites}</td>
                          <td className="px-3 py-3"><Badge className={item.status === 'Archived' ? 'bg-rose-500/10 text-rose-200' : item.status === 'Auction' ? 'bg-amber-500/10 text-amber-200' : 'bg-emerald-500/10 text-emerald-200'}>{item.status}</Badge></td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Link to={`/vendor/edit-product-wizard/${item.sku}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Edit</Link>
                              <button onClick={() => handleQuickAction('Publish', item)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Publish</button>
                              <button onClick={() => handleQuickAction('Duplicate', item)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Duplicate</button>
                              <button onClick={() => handleQuickAction('Feature', item)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Feature</button>
                              <button onClick={() => handleQuickAction('Archive', item)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Archive</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">Showing {currentProducts.length} of {filteredProducts.length} products</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">Prev</button>
                  <span className="text-sm text-slate-400">{page} / {pageCount}</span>
                  <button onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))} disabled={page === pageCount} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </SectionShell>
  );
}

export function VendorProductVariantsPage() {
  return (
    <SectionShell title="Product variants" subtitle="Offer size, color and model variations">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Color: Black, Silver • Storage: 256GB, 512GB</p>
      </div>
    </SectionShell>
  );
}

export function VendorCreateProductPage() {
  return (
    <SectionShell title="Create product" subtitle="Launch a new listing with rich details">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Form includes title, category, price, inventory, SEO tags, and shipment policy.</p>
      </div>
    </SectionShell>
  );
}

export function VendorEditProductPage() {
  return (
    <SectionShell title="Edit product" subtitle="Adjust pricing, stock and product visibility">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Use this workspace to update offers, add new images, and revise copy quickly.</p>
        <div className="mt-4 flex gap-3">
          <Link to="/vendor/edit-product-wizard/1" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Open editor for product #1</Link>
          <Link to="/vendor/products" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Back to products</Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function VendorDeleteProductPage() {
  return (
    <SectionShell title="Delete product" subtitle="Remove an outdated listing carefully">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Deletion is blocked when the item has active bids or pending orders.</p>
      </div>
    </SectionShell>
  );
}

export function VendorCreateAuctionPage() {
  return (
    <SectionShell title="Create auction" subtitle="Start a new live bidding experience">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Reserve price, auto-bid rules, duration, and item descriptions are managed here.</p>
      </div>
    </SectionShell>
  );
}

export function VendorEditAuctionPage() {
  return (
    <SectionShell title="Edit auction" subtitle="Fine-tune reserve price and time controls">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Update bidding rules, promotion windows, and auction captions in one place.</p>
      </div>
    </SectionShell>
  );
}

export function VendorAuctionAnalyticsPage() {
  const [tab, setTab] = useState<'Live' | 'Scheduled' | 'Ended'>('Live');

  const liveAuctions = vendorAuctions.filter((auction) => auction.status === 'Live');
  const scheduledAuctions = vendorAuctions.filter((auction) => auction.status === 'Scheduled');
  const endedAuctions = vendorAuctions.filter((auction) => auction.status === 'Ended');
  const tabs = [
    { label: 'Live', count: liveAuctions.length },
    { label: 'Scheduled', count: scheduledAuctions.length },
    { label: 'Ended', count: endedAuctions.length },
  ];

  const current = tab === 'Live' ? liveAuctions : tab === 'Scheduled' ? scheduledAuctions : endedAuctions;

  const handleQuickAction = (action: string, item: any) => {
    alert(`${action} ${item.title} (UI only)`);
  };

  return (
    <SectionShell title="Auction analytics" subtitle="Bid velocity and conversion insights" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Auction analytics' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {tabs.map((item) => (
                <button key={item.label} onClick={() => setTab(item.label as any)} className={`rounded-full px-4 py-2 text-sm ${tab === item.label ? 'bg-emerald-500/10 text-emerald-200' : 'bg-white/5 text-slate-300'}`}>
                  {item.label} <span className="text-slate-400">({item.count})</span>
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Total auctions</p>
                <p className="mt-2 text-2xl font-semibold text-white">{vendorAuctions.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Active bids</p>
                <p className="mt-2 text-2xl font-semibold text-white">{vendorAuctions.reduce((sum, auction) => sum + Number(auction.bids), 0)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Average bid</p>
                <p className="mt-2 text-2xl font-semibold text-white">₹{Math.round(vendorAuctions.reduce((sum, auction) => sum + Number(auction.currentBid.replace(/[^0-9]/g, '')), 0) / Math.max(1, vendorAuctions.length))}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {current.map((auction) => (
                <Card key={auction.id} className="group transition hover:shadow-xl hover:shadow-slate-950/30">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{auction.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
                        <Badge className={auction.status === 'Live' ? 'bg-emerald-500/10 text-emerald-200' : auction.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-200' : 'bg-slate-500/10 text-slate-200'}>{auction.status}</Badge>
                        <span>{auction.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                      <div>
                        <p className="text-sm text-slate-400">Current bid</p>
                        <p className="text-white">{auction.currentBid}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Highest bid</p>
                        <p className="text-white">{auction.highestBid}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Remaining</p>
                        <p className="text-white">{auction.remaining}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <SecondaryButton onClick={() => handleQuickAction('Duplicate', auction)}>Duplicate</SecondaryButton>
                    {auction.status === 'Live' && <SecondaryButton onClick={() => handleQuickAction('Cancel', auction)}>Cancel</SecondaryButton>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SectionShell>
  );
}

export function VendorMessagesPage() {
  return (
    <SectionShell title="Messages" subtitle="Manage conversations with buyers and support" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Messages' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <div className="mb-4">
            <input placeholder="Search conversations" className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-white" />
          </div>
          <Card>
            <div className="space-y-3">
              {vendorMessages.map((message) => (
                <div key={message.id} className={`flex flex-col gap-3 rounded-2xl border border-white/10 px-4 py-4 ${message.unread ? 'bg-white/5' : 'bg-transparent'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{message.name}</p>
                      <p className="text-sm text-slate-400">{message.type}</p>
                    </div>
                    <Badge className={message.unread ? 'bg-amber-500/10 text-amber-200' : 'bg-slate-500/10 text-slate-200'}>{message.unread ? 'Unread' : 'Read'}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                    <p>{message.lastMessage}</p>
                    <p>{message.attachments} attachment{message.attachments !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </SectionShell>
  );
}

export function VendorNotificationsPage() {
  return (
    <SectionShell title="Notifications" subtitle="Alerts for bids, order updates and payments" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Notifications' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <Card>
            <div className="space-y-3">
              {vendorNotifications.map((note) => (
                <div key={note.id} className={`flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 ${note.unread ? 'bg-white/5' : 'bg-transparent'}`}>
                  <div>
                    <p className="font-semibold text-white">{note.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{note.time}</p>
                  </div>
                  <Badge className={note.unread ? 'bg-amber-500/10 text-amber-200' : 'bg-slate-500/10 text-slate-200'}>{note.category}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </SectionShell>
  );
}

export function VendorReviewsPage() {
  return (
    <SectionShell title="Reviews" subtitle="Buyer feedback and store credibility">
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.author} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">{review.author}</p>
            <p className="mt-2">“{review.quote}”</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function VendorSupportTicketsPage() {
  return (
    <SectionShell title="Support tickets" subtitle="Seller cases and issue tracking">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>Case #221 • Buyer request for replacement and refund workflow.</p>
      </div>
    </SectionShell>
  );
}

export function VendorReportsPage() {
  return (
    <SectionShell title="Reports" subtitle="Performance summaries for management and growth">
      <div className="grid gap-4 md:grid-cols-3">
        {vendorAuctions.map((auction) => (
          <div key={auction.title} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">{auction.title}</p>
            <p className="mt-2">{auction.bids} bids</p>
            <p className="mt-2 text-amber-300">{auction.status}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
