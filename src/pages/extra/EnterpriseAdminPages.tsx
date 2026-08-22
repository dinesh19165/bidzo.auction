import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Bell, Boxes, CheckCircle2, Clock3, CreditCard, Download, FileText, Filter, Gavel, Globe, LayoutGrid, Megaphone, MessageSquare, Plus, Search, Settings2, ShieldCheck, Store, TrendingUp, Truck, Users, Wallet2 } from 'lucide-react';
import { AdminShell } from '../../components/admin/AdminShell';
import { Card } from '../../components/common/Card';
import { Badge, PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { Table } from '../../components/common/Table';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { adminStats, chartSeries, franchiseDashboardKpis, rolePermissions } from '../../data/mockData';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { approveVendor, getPendingVendorApprovals, rejectVendor, type ApprovalRequest } from '../../api/approvalApi';
import { approveAdminWithdrawal, getAdminWalletSummary, getAdminWalletTransactions, getPendingAdminWithdrawals, rejectAdminWithdrawal, type AdminWalletSummary, type AdminWalletTransaction, type AdminWithdrawal } from '../../api/adminWalletApi';
import { EmptyState, ErrorState, SkeletonTable } from '../../components/loading/LoadingComponents';

const dashboardKpis = [
  { label: 'Total Customers', value: '18.2k', trend: '+12%' },
  { label: 'Total Vendors', value: '1.4k', trend: '+8%' },
  { label: 'Delivery Partners', value: '342', trend: '+5%' },
  { label: 'Total Franchises', value: '24', trend: '+3%' },
  { label: 'Total Products', value: '8.7k', trend: '+14%' },
  { label: 'Total Auctions', value: '2.4k', trend: '+9%' },
  { label: 'Live Auctions', value: '214', trend: '+6%' },
  { label: 'Orders Today', value: '1,284', trend: '+11%' },
  { label: 'Revenue Today', value: '₹18.5L', trend: '+16%' },
  { label: 'Monthly Revenue', value: '₹214L', trend: '+19%' },
  { label: 'Pending Vendor Approvals', value: '42', trend: 'Needs review' },
  { label: 'Pending Franchise Approvals', value: '7', trend: 'Needs review' },
];

const salesSeries = [
  { name: 'Jan', sales: 120, revenue: 80 },
  { name: 'Feb', sales: 140, revenue: 92 },
  { name: 'Mar', sales: 158, revenue: 104 },
  { name: 'Apr', sales: 174, revenue: 118 },
  { name: 'May', sales: 186, revenue: 126 },
  { name: 'Jun', sales: 208, revenue: 138 },
];

const userSeries = [
  { name: 'Jan', customers: 4200, vendors: 180, franchises: 8 },
  { name: 'Feb', customers: 4700, vendors: 205, franchises: 10 },
  { name: 'Mar', customers: 5300, vendors: 240, franchises: 12 },
  { name: 'Apr', customers: 6100, vendors: 280, franchises: 14 },
  { name: 'May', customers: 6900, vendors: 320, franchises: 18 },
  { name: 'Jun', customers: 7800, vendors: 360, franchises: 24 },
];

const pieData = [
  { name: 'Approved', value: 74 },
  { name: 'Pending', value: 16 },
  { name: 'Needs changes', value: 10 },
];

const activityRows = [
  { action: 'Vendor KYC approved', user: 'Ops team', time: '10 min ago' },
  { action: 'Auction reserve updated', user: 'Auction Ops', time: '34 min ago' },
  { action: 'Franchise onboarding accepted', user: 'Super Admin', time: '1h ago' },
];

const reportRows = [
  { title: 'Q2 sales summary', owner: 'Finance', format: 'PDF' },
  { title: 'Vendor performance', owner: 'Ops', format: 'Excel' },
  { title: 'Franchise growth', owner: 'Strategy', format: 'CSV' },
];

export function SuperAdminDashboardPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Super Admin Dashboard" breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]} activePath="/admin/super-dashboard" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Create report</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            <p className="mt-2 text-sm text-emerald-300">{item.trend}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Sales & Revenue</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Business performance trend</h3>
            </div>
            <SecondaryButton icon={<Filter className="h-4 w-4" />}>Filter</SecondaryButton>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesSeries}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#60a5fa" strokeWidth={3} />
                <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">System health</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Approval pipeline</h3>
            </div>
            <Badge>Live</Badge>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  <Cell fill="#34d399" />
                  <Cell fill="#60a5fa" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Recent activity</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Latest operations</h3>
            </div>
            <SecondaryButton icon={<Clock3 className="h-4 w-4" />}>View all</SecondaryButton>
          </div>
          <div className="mt-4 space-y-3">
            {activityRows.map((row) => (
              <div key={row.action} className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold text-white">{row.action}</p>
                  <p className="text-sm text-slate-400">{row.user}</p>
                </div>
                <span className="text-sm text-slate-400">{row.time}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">System alerts</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Active issues</h3>
            </div>
            <Badge className="bg-rose-500/10 text-rose-200">3 alerts</Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-[18px] border border-rose-500/20 bg-rose-500/10 p-3">3 vendor KYC verifications pending further review.</div>
            <div className="rounded-[18px] border border-amber-500/20 bg-amber-500/10 p-3">2 franchise documents require additional verification.</div>
            <div className="rounded-[18px] border border-emerald-500/20 bg-emerald-500/10 p-3">Platform availability is stable at 99.98%.</div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Quick actions</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Escalate and manage</h3>
            </div>
            <SecondaryButton icon={<ArrowRight className="h-4 w-4" />}>Open center</SecondaryButton>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {['Approve vendors', 'Review auctions', 'Create franchise', 'Publish CMS'].map((action) => (
              <div key={action} className="rounded-[18px] border border-white/10 bg-white/5 p-3 text-sm text-slate-300">{action}</div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">Growth overview</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Users, vendors and franchises</h3>
            </div>
            <Badge className="bg-violet-500/10 text-violet-200">Trend</Badge>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userSeries}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="customers" fill="#60a5fa" />
                <Bar dataKey="vendors" fill="#34d399" />
                <Bar dataKey="franchises" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

export function FranchiseDashboardAdminPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Franchise Dashboard" breadcrumbs={[{ label: 'Admin' }, { label: 'Franchise' }]} activePath="/admin/franchise-dashboard" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Create action</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {franchiseDashboardKpis.map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Revenue & orders</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Regional performance snapshot</h3>
            </div>
            <Badge>Updated 5m ago</Badge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              { label: 'Revenue', value: '₹12.6L' },
              { label: 'Orders', value: '386' },
              { label: 'Customers', value: '2,104' },
              { label: 'Vendors', value: '68' },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Top vendors</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Leading partners</h3>
            </div>
            <SecondaryButton icon={<Store className="h-4 w-4" />}>View all</SecondaryButton>
          </div>
          <div className="mt-4 space-y-3">
            {['Nova Tech', 'DriveHub', 'Urban Estates'].map((vendor) => (
              <div key={vendor} className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                <span className="font-semibold text-white">{vendor}</span>
                <Badge className="bg-emerald-500/10 text-emerald-200">High</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Pending approvals</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Operational queue</h3>
            </div>
            <Badge className="bg-amber-500/10 text-amber-200">14 pending</Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {['Vendor onboarding', 'Product review', 'Auction validation', 'Wallet verification'].map((item) => (
              <div key={item} className="rounded-[18px] border border-white/10 bg-white/5 p-3">{item}</div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">Recent activity</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Local operations</h3>
            </div>
            <SecondaryButton icon={<MessageSquare className="h-4 w-4" />}>Open feed</SecondaryButton>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">Delivery partner route updated for 5 high-priority orders.</div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">New product listing approved by franchise admin.</div>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

export function RolePermissionMatrixPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Role Based Access" breadcrumbs={[{ label: 'Admin' }, { label: 'Permissions' }]} activePath="/admin/permissions" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add role</PrimaryButton>}>
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Permission matrix</p>
            <p className="text-sm text-slate-400">Modules and action-level access for each role</p>
          </div>
          <SecondaryButton icon={<Search className="h-4 w-4" />}>Search roles</SecondaryButton>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Module</th>
                <th className="px-3 py-2">View</th>
                <th className="px-3 py-2">Create</th>
                <th className="px-3 py-2">Edit</th>
                <th className="px-3 py-2">Delete</th>
                <th className="px-3 py-2">Approve</th>
                <th className="px-3 py-2">Reject</th>
                <th className="px-3 py-2">Export</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {rolePermissions.map((role) => (
                <tr key={role.role} className="border-t border-white/10">
                  <td className="px-3 py-3 font-semibold text-white">{role.role}</td>
                  <td className="px-3 py-3">{role.scope}</td>
                  <td className="px-3 py-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /></td>
                  <td className="px-3 py-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /></td>
                  <td className="px-3 py-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /></td>
                  <td className="px-3 py-3"><Clock3 className="h-4 w-4 text-slate-500" /></td>
                  <td className="px-3 py-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /></td>
                  <td className="px-3 py-3"><CheckCircle2 className="h-4 w-4 text-amber-300" /></td>
                  <td className="px-3 py-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}

export function ApprovalCenterPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | string | null>(null);

  const loadApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      setApprovals(await getPendingVendorApprovals());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleAction = async (approval: ApprovalRequest, action: 'approve' | 'reject') => {
    setProcessingId(approval.vendorProfileId);
    setActionError(null);
    try {
      if (action === 'approve') await approveVendor(approval.vendorProfileId);
      if (action === 'reject') await rejectVendor(approval.vendorProfileId);
      await loadApprovals();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update approval.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Approval Center" breadcrumbs={[{ label: 'Admin' }, { label: 'Approvals' }]} activePath="/admin/approvals" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />} onClick={loadApprovals}>Refresh</PrimaryButton>}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Pending review</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Requests awaiting decision</h3>
            </div>
            <Badge className="bg-amber-500/10 text-amber-200">{approvals.length} objects</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {error ? <ErrorState title="Unable to load approvals" description={error} /> : null}
            {actionError ? <ErrorState title="Approval update failed" description={actionError} /> : null}
            {loading ? <SkeletonTable /> : approvals.length === 0 ? <EmptyState title="No pending approvals" description="There are no approval requests awaiting a decision." /> : approvals.map((row) => {
              const busy = processingId === row.vendorProfileId;
              return <div key={row.vendorProfileId} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{row.businessName}</p>
                    <p className="text-sm text-slate-400">{row.username || row.email || `User #${row.userId}`} • {row.verificationStatus}</p>
                  </div>
                  <Badge>{row.verificationStatus}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PrimaryButton disabled={busy} onClick={() => handleAction(row, 'approve')}>Approve</PrimaryButton>
                  <SecondaryButton disabled={busy} onClick={() => handleAction(row, 'reject')}>Reject</SecondaryButton>
                  <SecondaryButton disabled={busy}>Request changes</SecondaryButton>
                </div>
              </div>;
            })}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Verification queue</p>
              <h3 className="mt-1 text-lg font-semibold text-white">KYC and GST checks</h3>
            </div>
            <SecondaryButton icon={<FileText className="h-4 w-4" />}>Export queue</SecondaryButton>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">KYC verification pending for 7 users.</div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">GST verification pending for 4 vendors.</div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">5 documents require manual review.</div>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

export function SystemSettingsPage() {
  const cards = [
    { title: 'General', path: '/admin/settings/general', body: 'Platform name, locale, timezone and support contact.' },
    { title: 'Auction Rules', path: '/admin/settings/auction-rules', body: 'Bid increments, reserve pricing and close policies.' },
    { title: 'Registration Fee', path: '/admin/settings/registration-fee', body: 'Vendor and franchise onboarding charges.' },
    { title: 'Commission Rules', path: '/admin/settings/commission-rules', body: 'Marketplace commission tiers and schedules.' },
    { title: 'Platform Charges', path: '/admin/settings/platform-charges', body: 'Service fees and payment processing rules.' },
    { title: 'Shipping Rules', path: '/admin/settings/shipping-rules', body: 'Courier partners, SLA and delivery options.' },
    { title: 'Tax', path: '/admin/settings/tax', body: 'GST and regional tax configuration.' },
    { title: 'Email', path: '/admin/settings/email', body: 'SMTP, sender identity and transactional templates.' },
    { title: 'SMS', path: '/admin/settings/sms', body: 'SMS gateway and trust messaging settings.' },
    { title: 'Notification Templates', path: '/admin/settings/notification-templates', body: 'In-app, email and alert message patterns.' },
    { title: 'Security', path: '/admin/settings/security', body: 'Access control, encryption and login safeguards.' },
    { title: 'Localization', path: '/admin/settings/localization', body: 'Language, regional formatting and marketplace translations.' },
  ];

  return (
    <AdminShell title="Enterprise admin" subtitle="System Settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<Settings2 className="h-4 w-4" />}>Save changes</PrimaryButton>}>
      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.title} to={card.path} className="block h-full">
            <Card className="h-full p-6 transition hover:border-blue-500/40 hover:bg-slate-900/90">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">{card.title}</p>
              <p className="mt-3 text-sm text-slate-400">{card.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}

export function CMSPage() {
  const cards = [
    { title: 'Homepage Banners', path: '/admin/cms/banners', body: 'Manage homepage hero banners and promotional campaigns.' },
    { title: 'Categories', path: '/admin/cms/categories', body: 'Organize marketplace taxonomy and category pages.' },
    { title: 'FAQ', path: '/admin/cms/faq', body: 'Maintain customer help responses and common questions.' },
    { title: 'Blog', path: '/admin/cms/blog', body: 'Publish editorial and marketing stories.' },
    { title: 'Testimonials', path: '/admin/cms/testimonials', body: 'Feature buyer and vendor success stories.' },
    { title: 'Newsletter', path: '/admin/cms/newsletter', body: 'Manage subscriber lists and campaign enrollment.' },
    { title: 'Static Pages', path: '/admin/cms/pages', body: 'Control about, privacy and help content pages.' },
  ];

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Megaphone className="h-4 w-4" />}>Publish</PrimaryButton>}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} to={card.path} className="block h-full">
            <Card className="h-full p-6 transition hover:border-emerald-500/40 hover:bg-slate-900/90">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">{card.title}</p>
              <p className="mt-3 text-sm text-slate-400">{card.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}

export function ReportsPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Reports" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export all</PrimaryButton>}>
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Export UI</p>
            <p className="text-sm text-slate-400">Mock reporting workspace for operational and financial exports</p>
          </div>
          <SecondaryButton icon={<Filter className="h-4 w-4" />}>Apply filter</SecondaryButton>
        </div>
        <div className="p-4">
          <Table
            columns={[
              { key: 'title', label: 'Report' },
              { key: 'owner', label: 'Owner' },
              { key: 'format', label: 'Format' },
            ]}
            data={reportRows}
            className="p-0"
          />
        </div>
      </Card>
    </AdminShell>
  );
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, clearSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clearSession();
  }, [clearSession]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Enter email and password to continue.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const user = await login(email, password);
      if (!['ADMIN', 'SUPER_ADMIN', 'FRANCHISE_ADMIN'].includes(user.role || '')) {
        clearSession();
        throw new Error('Admin access required');
      }
      navigate('/admin/super-dashboard', { replace: true });
    } catch (err) {
      clearSession();
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.20),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a)] px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-center">
          <Link to="/" className="inline-flex items-center"><Logo /></Link>
        </div>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Super admin</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-blue-400" placeholder="admin@bidzo.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-blue-400" placeholder="admin123" />
          </div>

          {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div> : null}

          <PrimaryButton type="submit" fullWidth className="mt-2" disabled={submitting}>{submitting ? 'Signing in…' : 'Access dashboard'}</PrimaryButton>
        </form>
      </div>
    </div>
  );
}

export function FranchiseManagementAdminPage() {
  const [rows, setRows] = useState([
    { id: 1, name: 'Bengaluru Franchise', city: 'Bengaluru', admin: 'Asha Rao', revenue: '₹18.4L', status: 'Healthy', approval: 'Approved' },
    { id: 2, name: 'Mumbai Franchise', city: 'Mumbai', admin: 'Nilesh V.', revenue: '₹14.2L', status: 'Stable', approval: 'Pending' },
    { id: 3, name: 'Delhi Franchise', city: 'Delhi', admin: 'Riya Sen', revenue: '₹11.7L', status: 'Review', approval: 'Pending' },
    { id: 4, name: 'Hyderabad Franchise', city: 'Hyderabad', admin: 'Kiran Y.', revenue: '₹9.1L', status: 'Healthy', approval: 'Approved' },
  ]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const filtered = useMemo(() => rows.filter((row) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || [row.name, row.city, row.admin].join(' ').toLowerCase().includes(q);
    const matchesStatus = status === 'All' || row.status === status;
    return matchesSearch && matchesStatus;
  }), [rows, search, status]);

  const updateStatus = (id: number, next: string) => setRows((prev) => prev.map((row) => row.id === id ? { ...row, approval: next, status: next === 'Approved' ? 'Healthy' : next === 'Rejected' ? 'Review' : row.status } : row));

  return (
    <AdminShell title="Enterprise admin" subtitle="Franchise management" breadcrumbs={[{ label: 'Admin' }, { label: 'Franchise' }]} activePath="/admin/franchise" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add franchise</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Active franchises', '24'],
          ['Revenue this month', '₹86.3L'],
          ['Pending', '3'],
          ['Performance score', '91%'],
        ].map(([label, value]) => (
          <Card key={label} className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Search franchise" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white">
            <option>All</option>
            <option>Healthy</option>
            <option>Stable</option>
            <option>Review</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table columns={[
            { key: 'name', label: 'Franchise' },
            { key: 'city', label: 'City' },
            { key: 'admin', label: 'Admin' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Review' ? 'bg-amber-500/10 text-amber-200' : 'bg-blue-500/10 text-blue-200'}>{row.status}</Badge> },
            { key: 'approval', label: 'Approval', render: (row: any) => <Badge className={row.approval === 'Approved' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.approval}</Badge> },
            { key: 'actions', label: 'Actions', render: (row: any) => (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateStatus(row.id, 'Approved')} className="rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200">Approve</button>
                <button onClick={() => updateStatus(row.id, 'Rejected')} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Reject</button>
              </div>
            ) },
          ]} data={filtered} className="p-0" />
        </div>
      </Card>
    </AdminShell>
  );
}

export function VendorManagementAdminPage() {
  const [rows, setRows] = useState([
    { id: 1, name: 'Nova Tech', category: 'Electronics', kyc: 'Verified', status: 'Approved', rating: '4.9', revenue: '₹8.2L' },
    { id: 2, name: 'Urban Furnish', category: 'Furniture', kyc: 'Pending', status: 'Pending', rating: '4.5', revenue: '₹3.7L' },
    { id: 3, name: 'DriveHub', category: 'Automotive', kyc: 'Verified', status: 'Suspended', rating: '4.4', revenue: '₹6.9L' },
    { id: 4, name: 'Blue Leaf', category: 'Home Decor', kyc: 'Verified', status: 'Approved', rating: '4.8', revenue: '₹5.1L' },
  ]);

  const approve = (id: number) => setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'Approved' } : row));
  const suspend = (id: number) => setRows((prev) => prev.map((row) => row.id === id ? { ...row, status: 'Suspended' } : row));

  return (
    <AdminShell title="Enterprise admin" subtitle="Vendor management" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add vendor</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-4">
        {[['Approved vendors', '1,280'], ['Pending review', '42'], ['Suspended', '18'], ['KYC pending', '11']].map(([label, value]) => (
          <Card key={label} className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2"><Search className="h-4 w-4 text-slate-400" /><input className="bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Search vendors" /></div>
          <div className="flex gap-2"><SecondaryButton>Filter</SecondaryButton><SecondaryButton>Export</SecondaryButton></div>
        </div>

        <Table columns={[
          { key: 'name', label: 'Vendor' },
          { key: 'category', label: 'Category' },
          { key: 'kyc', label: 'KYC' },
          { key: 'rating', label: 'Rating' },
          { key: 'revenue', label: 'Revenue' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Suspended' ? 'bg-rose-500/10 text-rose-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
          { key: 'actions', label: 'Actions', render: (row: any) => (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => approve(row.id)} className="rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200">Approve</button>
              <button onClick={() => suspend(row.id)} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Suspend</button>
            </div>
          ) }
        ]} data={rows} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function OrdersManagementAdminPage() {
  const [orders, setOrders] = useState([
    { id: 'ORD-1001', customer: 'Arjun Sharma', vendor: 'Nova Tech', total: '₹86,000', status: 'Processing' },
    { id: 'ORD-1002', customer: 'Mina Patel', vendor: 'Urban Furnish', total: '₹48,000', status: 'Shipped' },
    { id: 'ORD-1003', customer: 'Rohan Mehta', vendor: 'Blue Leaf', total: '₹62,500', status: 'Cancelled' },
    { id: 'ORD-1004', customer: 'Sneha Roy', vendor: 'DriveHub', total: '₹34,900', status: 'Delivered' },
  ]);

  const updateStatus = (id: string, next: string) => setOrders((prev) => prev.map((order) => order.id === id ? { ...order, status: next } : order));

  return (
    <AdminShell title="Enterprise admin" subtitle="Order management" breadcrumbs={[{ label: 'Admin' }, { label: 'Orders' }]} activePath="/admin/orders" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Create order</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-4">
        {[['All orders', '2,841'], ['Pending', '194'], ['Shipped', '618'], ['Returned', '22']].map(([label, value]) => (
          <Card key={label} className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <Table columns={[
          { key: 'id', label: 'Order ID' },
          { key: 'customer', label: 'Customer' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'total', label: 'Total' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-200' : 'bg-blue-500/10 text-blue-200'}>{row.status}</Badge> },
          { key: 'actions', label: 'Actions', render: (row: any) => (
            <div className="flex gap-2">
              <button onClick={() => updateStatus(row.id, 'Shipped')} className="rounded-full bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200">Ship</button>
              <button onClick={() => updateStatus(row.id, 'Cancelled')} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Cancel</button>
            </div>
          ) }
        ]} data={orders} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function DeliveryManagementAdminPage() {
  const [partners] = useState([
    { id: 1, name: 'RapidRoute Logistics', status: 'Active', city: 'Bengaluru', deliveries: 182, rating: '4.8' },
    { id: 2, name: 'GreenLine Express', status: 'Pending', city: 'Mumbai', deliveries: 96, rating: '4.6' },
    { id: 3, name: 'SpeedMate', status: 'Offline', city: 'Hyderabad', deliveries: 54, rating: '4.3' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Delivery management" breadcrumbs={[{ label: 'Admin' }, { label: 'Delivery' }]} activePath="/admin/delivery" actions={<PrimaryButton icon={<Truck className="h-4 w-4" />}>Assign route</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-4">
        {[['Active partners', '342'], ['Assigned deliveries', '1,482'], ['Pending approvals', '19'], ['On-time rate', '96.2%']].map(([label, value]) => (
          <Card key={label} className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <Table columns={[
          { key: 'name', label: 'Partner' },
          { key: 'city', label: 'City' },
          { key: 'deliveries', label: 'Deliveries' },
          { key: 'rating', label: 'Rating' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Pending' ? 'bg-amber-500/10 text-amber-200' : 'bg-slate-500/10 text-slate-200'}>{row.status}</Badge> },
          { key: 'actions', label: 'Actions', render: () => <button className="rounded-full bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200">Assign</button> }
        ]} data={partners} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function WalletManagementAdminPage() {
  const [summary, setSummary] = useState<AdminWalletSummary | null>(null);
  const [transactions, setTransactions] = useState<AdminWalletTransaction[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<number | string | null>(null);

  const loadWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryResponse, transactionResponse] = await Promise.all([getAdminWalletSummary(), getAdminWalletTransactions()]);
      setSummary(summaryResponse);
      setTransactions(transactionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load wallet data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWallet(); }, []);

  const loadPendingWithdrawals = async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      setPendingWithdrawals(await getPendingAdminWithdrawals());
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : 'Unable to load pending withdrawals.');
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => { loadPendingWithdrawals(); }, []);

  const updatePendingWithdrawal = async (withdrawal: AdminWithdrawal, action: 'approve' | 'reject') => {
    setProcessingWithdrawalId(withdrawal.id);
    setPendingError(null);
    try {
      if (action === 'approve') {
        await approveAdminWithdrawal(withdrawal.id);
      } else {
        await rejectAdminWithdrawal(withdrawal.id);
      }
      await Promise.all([loadPendingWithdrawals(), loadWallet()]);
    } catch (err) {
      setPendingError(err instanceof Error ? err.message : `Unable to ${action} withdrawal.`);
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  const summaryValue = summary?.pendingAmount === undefined || summary?.pendingAmount === null
    ? '-'
    : String(summary.pendingAmount);

  return (
    <AdminShell title="Enterprise admin" subtitle="Wallet management" breadcrumbs={[{ label: 'Admin' }, { label: 'Wallet' }]} activePath="/admin/wallet" actions={<PrimaryButton icon={<Wallet2 className="h-4 w-4" />} onClick={loadWallet}>Export ledger</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-4">
        {['Gross wallet', 'Platform balance', 'Pending disbursal', 'Refund queue'].map((label) => (
          <Card key={label} className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{loading ? '…' : label === 'Pending disbursal' ? summaryValue : '-'}</p></Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        {error ? <ErrorState title="Unable to load wallet" description={error} /> : loading ? <SkeletonTable /> : transactions.length === 0 ? <EmptyState title="No wallet transactions" description="Wallet transactions will appear here when available." /> : <Table columns={[
          { key: 'id', label: 'ID' },
          { key: 'type', label: 'Type' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Pending' ? 'bg-amber-500/10 text-amber-200' : 'bg-blue-500/10 text-blue-200'}>{row.status}</Badge> },
          { key: 'date', label: 'Date' },
        ]} data={transactions.map((transaction) => ({ ...transaction, date: transaction.date || transaction.createdAt || '-' }))} className="p-0" />}
      </Card>

      <Card className="mt-6 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Pending payouts</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Vendor withdrawal requests</h3>
          </div>
          <Badge className="bg-amber-500/10 text-amber-200">{pendingWithdrawals.length} pending</Badge>
        </div>
        {pendingError ? <ErrorState title="Unable to load pending payouts" description={pendingError} /> : pendingLoading ? <SkeletonTable /> : pendingWithdrawals.length === 0 ? <EmptyState title="No pending payouts" description="Pending vendor withdrawals will appear here." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-slate-400"><tr><th className="px-3 py-3">Withdrawal ID</th><th className="px-3 py-3">Vendor</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Actions</th></tr></thead>
              <tbody className="text-slate-300">
                {pendingWithdrawals.map((withdrawal) => {
                  const busy = processingWithdrawalId === withdrawal.id;
                  return <tr key={withdrawal.id} className="border-t border-white/6"><td className="px-3 py-3">{withdrawal.id}</td><td className="px-3 py-3">{withdrawal.businessName || '-'}</td><td className="px-3 py-3">₹{Number(withdrawal.amount || 0).toLocaleString('en-IN')}</td><td className="px-3 py-3"><Badge className="bg-amber-500/10 text-amber-200">{String(withdrawal.status || 'PENDING')}</Badge></td><td className="px-3 py-3">{String(withdrawal.requestedAt || withdrawal.createdAt || '-')}</td><td className="px-3 py-3"><div className="flex gap-2"><PrimaryButton className="min-h-0 px-3 py-2 text-xs" disabled={busy} onClick={() => updatePendingWithdrawal(withdrawal, 'approve')}>{busy ? 'Working…' : 'Approve'}</PrimaryButton><SecondaryButton className="min-h-0 px-3 py-2 text-xs" disabled={busy} onClick={() => updatePendingWithdrawal(withdrawal, 'reject')}>Reject</SecondaryButton></div></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function AuctionManagementAdminPage() {
  const [auctions, setAuctions] = useState([
    { id: 201, title: 'Royal Enfield Classic 350', vendor: 'DriveHub', start: '12 Aug 2026', status: 'Live', bids: 38 },
    { id: 202, title: 'Vintage Camera Kit', vendor: 'Nova Tech', start: '13 Aug 2026', status: 'Upcoming', bids: 12 },
    { id: 203, title: 'Luxury Watch', vendor: 'Blue Leaf', start: '09 Aug 2026', status: 'Ended', bids: 74 },
    { id: 204, title: 'Designer Handbag', vendor: 'Urban Furnish', start: '10 Aug 2026', status: 'Pending', bids: 9 },
  ]);

  const updateStatus = (id: number, next: string) => setAuctions((prev) => prev.map((row) => row.id === id ? { ...row, status: next } : row));

  return (
    <AdminShell title="Enterprise admin" subtitle="Auction administration" breadcrumbs={[{ label: 'Admin' }, { label: 'Auctions' }]} activePath="/admin/auctions" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>Review auctions</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-4">
        {[['Live auctions', '214'], ['Upcoming', '82'], ['Completed', '1,286'], ['Pending approval', '12']].map(([label, value]) => (
          <Card key={label} className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <Table columns={[
          { key: 'title', label: 'Auction' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'start', label: 'Start' },
          { key: 'bids', label: 'Bids' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Live' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Ended' ? 'bg-slate-500/10 text-slate-200' : row.status === 'Pending' ? 'bg-amber-500/10 text-amber-200' : 'bg-blue-500/10 text-blue-200'}>{row.status}</Badge> },
          { key: 'actions', label: 'Actions', render: (row: any) => (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => updateStatus(row.id, 'Live')} className="rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200">Approve</button>
              <button onClick={() => updateStatus(row.id, 'Pending')} className="rounded-full bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-200">Pause</button>
            </div>
          ) }
        ]} data={auctions} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function ContentManagementAdminPage() {
  const [items, setItems] = useState([
    { id: 1, title: 'Homepage hero banner', section: 'Banners', status: 'Published' },
    { id: 2, title: 'Luxury watch category', section: 'Categories', status: 'Draft' },
    { id: 3, title: 'Seller onboarding help', section: 'Help content', status: 'Published' },
    { id: 4, title: 'Festival campaign', section: 'Promotions', status: 'Scheduled' },
  ]);

  const togglePublish = (id: number) => setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: item.status === 'Published' ? 'Draft' : 'Published' } : item));

  return (
    <AdminShell title="Enterprise admin" subtitle="Content management" breadcrumbs={[{ label: 'Admin' }, { label: 'Content' }]} activePath="/admin/content" actions={<PrimaryButton icon={<Megaphone className="h-4 w-4" />}>Publish new</PrimaryButton>}>
      <div className="grid gap-4 md:grid-cols-4">
        {[['Published', '48'], ['Drafts', '12'], ['Scheduled', '9'], ['Total assets', '69']].map(([label, value]) => (
          <Card key={label} className="p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <Table columns={[
          { key: 'title', label: 'Title' },
          { key: 'section', label: 'Section' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Published' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
          { key: 'actions', label: 'Actions', render: (row: any) => (
            <button onClick={() => togglePublish(row.id)} className="rounded-full bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200">{row.status === 'Published' ? 'Unpublish' : 'Publish'}</button>
          ) },
        ]} data={items} className="p-0" />
      </Card>
    </AdminShell>
  );
}

function ModuleGrid({ items }: { items: { title: string; path: string; summary: string; badge?: string }[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link key={item.path} to={item.path} className="group rounded-[24px] border border-white/10 bg-slate-950/70 p-5 transition hover:border-blue-500/40 hover:bg-slate-900/90">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">{item.badge || 'Module'}</span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-blue-300" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
          <p className="mt-3 text-sm text-slate-400">{item.summary}</p>
        </Link>
      ))}
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = 'text', placeholder = '', className = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <label className={`block text-sm text-slate-300 ${className}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none transition focus:border-blue-400" />
    </label>
  );
}

function LabeledTextarea({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none transition focus:border-blue-400" />
    </label>
  );
}

function FakeTable({ title, items }: { title: string; items: { label: string; value: string; tone?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate' }[] }) {
  return (
    <Card className="p-4">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">{title}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/5 px-3 py-3 text-sm">
            <span className="text-slate-300">{item.label}</span>
            <Badge className={item.tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-200' : item.tone === 'amber' ? 'bg-amber-500/10 text-amber-200' : item.tone === 'rose' ? 'bg-rose-500/10 text-rose-200' : item.tone === 'blue' ? 'bg-blue-500/10 text-blue-200' : 'bg-slate-500/10 text-slate-200'}>{item.value}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function CMSBannersPage() {
  const [items, setItems] = useState([
    { id: 1, title: 'Spring Deal', status: 'Active', order: 1, cta: 'Shop now', date: '01 Aug 2026' },
    { id: 2, title: 'Luxury Auction Week', status: 'Draft', order: 2, cta: 'Explore', date: '15 Aug 2026' },
  ]);

  const toggle = (id: number) => setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item));

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS banners" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Banners' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add banner</PrimaryButton>}>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-4">
          <Table columns={[
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
            { key: 'cta', label: 'CTA' },
            { key: 'date', label: 'Date' },
            { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={() => toggle(row.id)} className="rounded-full bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200">{row.status === 'Active' ? 'Deactivate' : 'Activate'}</button> },
          ]} data={items} className="p-0" />
        </Card>
        <FakeTable title="Banner overview" items={[{ label: 'Live banners', value: '6', tone: 'emerald' }, { label: 'Draft banners', value: '3', tone: 'amber' }, { label: 'Scheduled', value: '2', tone: 'blue' }]} />
      </div>
    </AdminShell>
  );
}

export function CMSCategoriesPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'Electronics', parent: 'Marketplace', order: 1, status: 'Active' },
    { id: 2, name: 'Luxury Watches', parent: 'Electronics', order: 2, status: 'Draft' },
  ]);

  const remove = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS categories" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Categories' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add category</PrimaryButton>}>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-4">
          <Table columns={[
            { key: 'name', label: 'Name' },
            { key: 'parent', label: 'Parent' },
            { key: 'order', label: 'Order' },
            { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
            { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={() => remove(row.id)} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Delete</button> },
          ]} data={items} className="p-0" />
        </Card>
        <FakeTable title="Taxonomy" items={[{ label: 'Top categories', value: '21', tone: 'blue' }, { label: 'Drafts', value: '4', tone: 'amber' }, { label: 'Featured', value: '8', tone: 'emerald' }]} />
      </div>
    </AdminShell>
  );
}

export function CMSFaqPage() {
  const [items, setItems] = useState([
    { id: 1, question: 'How do I bid?', answer: 'Register successfully and place bids above the current value.', status: 'Published', order: 1 },
    { id: 2, question: 'Can I cancel a bid?', answer: 'Bids may be withdrawn before the auction closes based on the policy.', status: 'Draft', order: 2 },
  ]);

  const remove = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS FAQ" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'FAQ' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add FAQ</PrimaryButton>}>
      <Card className="p-4">
        <Table columns={[
          { key: 'question', label: 'Question' },
          { key: 'answer', label: 'Answer' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Published' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
          { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={() => remove(row.id)} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Delete</button> },
        ]} data={items} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function CMSBlogPage() {
  const [items] = useState([
    { id: 1, title: 'How events drive conversion', author: 'Nikita', status: 'Published', category: 'Marketing' },
    { id: 2, title: 'Seller trust checklist', author: 'Rahul', status: 'Draft', category: 'Seller Growth' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS blog" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Blog' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Create blog</PrimaryButton>}>
      <Card className="p-4">
        <Table columns={[
          { key: 'title', label: 'Title' },
          { key: 'author', label: 'Author' },
          { key: 'category', label: 'Category' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Published' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
        ]} data={items} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function CMSTestimonialsPage() {
  const [items] = useState([
    { id: 1, customer: 'Aarav Nair', rating: '5/5', status: 'Published' },
    { id: 2, customer: 'Bhuvana S.', rating: '4/5', status: 'Draft' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS testimonials" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Testimonials' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add testimonial</PrimaryButton>}>
      <Card className="p-4">
        <Table columns={[
          { key: 'customer', label: 'Customer' },
          { key: 'rating', label: 'Rating' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Published' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
        ]} data={items} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function CMSNewsletterPage() {
  const [items] = useState([
    { id: 1, email: 'sam@example.com', status: 'Active', source: 'Homepage', subscribedAt: '12 Aug 2026' },
    { id: 2, email: 'raja@example.com', status: 'Unsubscribed', source: 'Checkout', subscribedAt: '08 Aug 2026' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS newsletter" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Newsletter' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}>
      <Card className="p-4">
        <Table columns={[
          { key: 'email', label: 'Email' },
          { key: 'source', label: 'Source' },
          { key: 'subscribedAt', label: 'Subscribed' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-200'}>{row.status}</Badge> },
        ]} data={items} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function CMSPagesPage() {
  const [items] = useState([
    { id: 1, title: 'About Us', status: 'Published' },
    { id: 2, title: 'Privacy Policy', status: 'Published' },
    { id: 3, title: 'Help', status: 'Draft' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Static pages" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Pages' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add page</PrimaryButton>}>
      <Card className="p-4">
        <Table columns={[
          { key: 'title', label: 'Page' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Published' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
        ]} data={items} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function SettingsGeneralPage() {
  const [platformName, setPlatformName] = useState('Bidzo');
  const [supportEmail, setSupportEmail] = useState('support@bidzo.com');
  const [currency, setCurrency] = useState('INR');

  return (
    <AdminShell title="Enterprise admin" subtitle="General settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'General' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<Settings2 className="h-4 w-4" />}>Save</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Platform name" value={platformName} onChange={setPlatformName} />
          <LabeledInput label="Support email" value={supportEmail} onChange={setSupportEmail} type="email" />
          <LabeledInput label="Timezone" value="Asia/Kolkata" onChange={() => undefined} />
          <LabeledInput label="Currency" value={currency} onChange={setCurrency} />
          <LabeledInput label="Address" value="Bengaluru, Karnataka" onChange={() => undefined} className="md:col-span-2" />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsAuctionRulesPage() {
  const [rules] = useState([
    { label: 'Minimum bid increment', value: '₹500' },
    { label: 'Auction duration', value: '4 hours' },
    { label: 'Auto close', value: 'Enabled' },
    { label: 'Bid cancellation', value: 'Allowed before close' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Auction rules" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Auction rules' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>Save rules</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule) => (
            <div key={rule.label} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">{rule.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{rule.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsRegistrationFeePage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Registration fee" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Registration fee' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />}>Save fee</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Vendor registration fee" value="₹5000" onChange={() => undefined} />
          <LabeledInput label="Franchise registration fee" value="₹25000" onChange={() => undefined} />
          <LabeledInput label="Customer registration fee" value="₹20" onChange={() => undefined} />
          <LabeledInput label="GST" value="18%" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsCommissionRulesPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Commission rules" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Commission rules' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<TrendingUp className="h-4 w-4" />}>Apply</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Vendor commission" value="8%" onChange={() => undefined} />
          <LabeledInput label="Auction commission" value="5%" onChange={() => undefined} />
          <LabeledInput label="Minimum commission" value="₹250" onChange={() => undefined} />
          <LabeledInput label="Maximum commission" value="₹15,000" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsPlatformChargesPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Platform charges" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Platform charges' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<CreditCard className="h-4 w-4" />}>Save</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Service fee" value="1.8%" onChange={() => undefined} />
          <LabeledInput label="Payment processing fee" value="2.2%" onChange={() => undefined} />
          <LabeledInput label="Convenience fee" value="₹30" onChange={() => undefined} />
          <LabeledInput label="Tax" value="18%" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsShippingRulesPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Shipping rules" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Shipping rules' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<Truck className="h-4 w-4" />}>Save</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Free shipping threshold" value="₹5000" onChange={() => undefined} />
          <LabeledInput label="Delivery SLA" value="48 hours" onChange={() => undefined} />
          <LabeledInput label="COD availability" value="Enabled" onChange={() => undefined} />
          <LabeledInput label="Courier options" value="Blue Dart, Delhivery" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsTaxPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Tax settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Tax' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<FileText className="h-4 w-4" />}>Save</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="GST" value="18%" onChange={() => undefined} />
          <LabeledInput label="CGST" value="9%" onChange={() => undefined} />
          <LabeledInput label="SGST" value="9%" onChange={() => undefined} />
          <LabeledInput label="IGST" value="18%" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsEmailPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Email settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Email' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<MessageSquare className="h-4 w-4" />}>Save</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="SMTP host" value="smtp.bidzo.com" onChange={() => undefined} />
          <LabeledInput label="Port" value="587" onChange={() => undefined} />
          <LabeledInput label="Sender name" value="Bidzo" onChange={() => undefined} />
          <LabeledInput label="Sender email" value="noreply@bidzo.com" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsSmsPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="SMS settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'SMS' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<MessageSquare className="h-4 w-4" />}>Save</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Provider" value="Twilio" onChange={() => undefined} />
          <LabeledInput label="Sender ID" value="BIDZO" onChange={() => undefined} />
          <LabeledInput label="OTP length" value="6 digits" onChange={() => undefined} />
          <LabeledInput label="Notification preferences" value="Enabled" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsNotificationTemplatesPage() {
  const [templates] = useState([
    { name: 'Welcome email', type: 'Email', status: 'Active' },
    { name: 'Bid confirmed', type: 'SMS', status: 'Active' },
    { name: 'Payment reminder', type: 'Push', status: 'Draft' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Notification templates" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Notification templates' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<Megaphone className="h-4 w-4" />}>Add template</PrimaryButton>}>
      <Card className="p-4">
        <Table columns={[
          { key: 'name', label: 'Template' },
          { key: 'type', label: 'Type' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
        ]} data={templates} className="p-0" />
      </Card>
    </AdminShell>
  );
}

export function SettingsSecurityPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Security settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Security' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />}>Save</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Password policy" value="8+ characters, 1 number, 1 symbol" onChange={() => undefined} />
          <LabeledInput label="Session timeout" value="30 minutes" onChange={() => undefined} />
          <LabeledInput label="Login attempts" value="5 attempts" onChange={() => undefined} />
          <LabeledInput label="2FA" value="Required for admins" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function SettingsLocalizationPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Localization" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Localization' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<Globe className="h-4 w-4" />}>Save</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Language" value="English" onChange={() => undefined} />
          <LabeledInput label="Currency" value="INR" onChange={() => undefined} />
          <LabeledInput label="Timezone" value="Asia/Kolkata" onChange={() => undefined} />
          <LabeledInput label="Date format" value="DD/MM/YYYY" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function ApprovalVendorsPage() {
  const [items] = useState([
    { id: 1, name: 'Nova Tech', status: 'Pending', type: 'Vendor' },
    { id: 2, name: 'Urban Furnish', status: 'Approved', type: 'Vendor' },
    { id: 3, name: 'Blue Leaf', status: 'Rejected', type: 'Vendor' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Vendor approvals" breadcrumbs={[{ label: 'Admin' }, { label: 'Approvals', to: '/admin/approvals' }, { label: 'Vendors' }]} activePath="/admin/approvals" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />}>Bulk approve</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Rejected' ? 'bg-rose-500/10 text-rose-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> }]} data={items} className="p-0" /></Card>
    </AdminShell>
  );
}

export function ApprovalFranchisesPage() {
  const [items] = useState([
    { id: 1, name: 'Bengaluru Franchise', status: 'Pending', type: 'Franchise' },
    { id: 2, name: 'Mumbai Franchise', status: 'Approved', type: 'Franchise' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Franchise approvals" breadcrumbs={[{ label: 'Admin' }, { label: 'Approvals', to: '/admin/approvals' }, { label: 'Franchises' }]} activePath="/admin/approvals" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />}>Review queue</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Rejected' ? 'bg-rose-500/10 text-rose-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> }]} data={items} className="p-0" /></Card>
    </AdminShell>
  );
}

export function ApprovalProductsPage() {
  const [items] = useState([
    { id: 1, name: 'Premium Camera', status: 'Pending', type: 'Product' },
    { id: 2, name: 'Designer Chair', status: 'Approved', type: 'Product' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Product approvals" breadcrumbs={[{ label: 'Admin' }, { label: 'Approvals', to: '/admin/approvals' }, { label: 'Products' }]} activePath="/admin/approvals" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />}>Approve selected</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Rejected' ? 'bg-rose-500/10 text-rose-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> }]} data={items} className="p-0" /></Card>
    </AdminShell>
  );
}

export function ApprovalAuctionsPage() {
  const [items] = useState([
    { id: 1, name: 'Royal Enfield', status: 'Pending', type: 'Auction' },
    { id: 2, name: 'Luxury Watch', status: 'Approved', type: 'Auction' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Auction approvals" breadcrumbs={[{ label: 'Admin' }, { label: 'Approvals', to: '/admin/approvals' }, { label: 'Auctions' }]} activePath="/admin/approvals" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>Review</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Rejected' ? 'bg-rose-500/10 text-rose-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> }]} data={items} className="p-0" /></Card>
    </AdminShell>
  );
}

export function ApprovalKycPage() {
  const [items] = useState([
    { id: 1, name: 'Priya K', status: 'Pending', type: 'KYC' },
    { id: 2, name: 'Sanjay M', status: 'Approved', type: 'KYC' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="KYC approvals" breadcrumbs={[{ label: 'Admin' }, { label: 'Approvals', to: '/admin/approvals' }, { label: 'KYC' }]} activePath="/admin/approvals" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />}>Verify queue</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Rejected' ? 'bg-rose-500/10 text-rose-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> }]} data={items} className="p-0" /></Card>
    </AdminShell>
  );
}

export function PermissionsRolesPage() {
  const [roles] = useState([
    { id: 1, name: 'Super Admin', scope: 'All modules' },
    { id: 2, name: 'Operations Manager', scope: 'Operations' },
    { id: 3, name: 'Finance Manager', scope: 'Finance' },
  ]);

  return (
    <AdminShell title="Enterprise admin" subtitle="Roles" breadcrumbs={[{ label: 'Admin' }, { label: 'Permissions', to: '/admin/permissions' }, { label: 'Roles' }]} activePath="/admin/permissions" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Create role</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'name', label: 'Role' }, { key: 'scope', label: 'Scope' }]} data={roles} className="p-0" /></Card>
    </AdminShell>
  );
}

export function PermissionsRoleCreatePage() {
  const [name, setName] = useState('');
  return (
    <AdminShell title="Enterprise admin" subtitle="Create role" breadcrumbs={[{ label: 'Admin' }, { label: 'Permissions', to: '/admin/permissions' }, { label: 'Create role' }]} activePath="/admin/permissions" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Save role</PrimaryButton>}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledInput label="Role name" value={name} onChange={setName} placeholder="Operations Manager" />
          <LabeledInput label="Scope" value="Operations" onChange={() => undefined} />
        </div>
      </Card>
    </AdminShell>
  );
}

export function PermissionsRoleDetailPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Role details" breadcrumbs={[{ label: 'Admin' }, { label: 'Permissions', to: '/admin/permissions' }, { label: 'Role detail' }]} activePath="/admin/permissions" actions={<PrimaryButton icon={<Users className="h-4 w-4" />}>Edit role</PrimaryButton>}>
      <Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Role: Super Admin</p><p>Scope: All modules</p><p>Permissions: View, Create, Edit, Delete, Approve, Export</p></div></Card>
    </AdminShell>
  );
}

export function PermissionsMatrixPage() {
  const rows = [
    { role: 'Super Admin', view: true, create: true, edit: true, delete: true, approve: true, export: true },
    { role: 'Finance Manager', view: true, create: false, edit: true, delete: false, approve: true, export: true },
  ];

  return (
    <AdminShell title="Enterprise admin" subtitle="Permission matrix" breadcrumbs={[{ label: 'Admin' }, { label: 'Permissions', to: '/admin/permissions' }, { label: 'Matrix' }]} activePath="/admin/permissions" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'role', label: 'Role' }, { key: 'view', label: 'View', render: (row: any) => <Badge className={row.view ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-200'}>{row.view ? 'Yes' : 'No'}</Badge> }, { key: 'create', label: 'Create', render: (row: any) => <Badge className={row.create ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-200'}>{row.create ? 'Yes' : 'No'}</Badge> }, { key: 'edit', label: 'Edit', render: (row: any) => <Badge className={row.edit ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-200'}>{row.edit ? 'Yes' : 'No'}</Badge> }, { key: 'delete', label: 'Delete', render: (row: any) => <Badge className={row.delete ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-200'}>{row.delete ? 'Yes' : 'No'}</Badge> }, { key: 'approve', label: 'Approve', render: (row: any) => <Badge className={row.approve ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-200'}>{row.approve ? 'Yes' : 'No'}</Badge> }, { key: 'export', label: 'Export', render: (row: any) => <Badge className={row.export ? 'bg-emerald-500/10 text-emerald-200' : 'bg-slate-500/10 text-slate-200'}>{row.export ? 'Yes' : 'No'}</Badge> }]} data={rows} className="p-0" /></Card>
    </AdminShell>
  );
}

export function ReportsSalesPage() { return <AdminShell title="Enterprise admin" subtitle="Sales report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Sales' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export CSV</PrimaryButton>}><Card className="p-6"><div className="grid gap-4 md:grid-cols-4"><div className="rounded-[18px] border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">Revenue</p><p className="mt-2 text-2xl font-semibold text-white">₹42.8L</p></div><div className="rounded-[18px] border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">Orders</p><p className="mt-2 text-2xl font-semibold text-white">1,284</p></div><div className="rounded-[18px] border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">Conversion</p><p className="mt-2 text-2xl font-semibold text-white">4.8%</p></div><div className="rounded-[18px] border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">Avg basket</p><p className="mt-2 text-2xl font-semibold text-white">₹2,642</p></div></div></Card></AdminShell>; }

export function ReportsRevenuePage() { return <AdminShell title="Enterprise admin" subtitle="Revenue report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Revenue' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="grid gap-4 md:grid-cols-3"><div className="rounded-[18px] border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">Gross Revenue</p><p className="mt-2 text-2xl font-semibold text-white">₹214L</p></div><div className="rounded-[18px] border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">Net Revenue</p><p className="mt-2 text-2xl font-semibold text-white">₹186L</p></div><div className="rounded-[18px] border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">Commission</p><p className="mt-2 text-2xl font-semibold text-white">₹28L</p></div></div></Card></AdminShell>; }

export function ReportsAuctionsPage() { return <AdminShell title="Enterprise admin" subtitle="Auction report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Auctions' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Live auctions: 214</p><p>Completed auctions: 1,286</p><p>Average closing bid: ₹82,400</p></div></Card></AdminShell>; }

export function ReportsVendorsPage() { return <AdminShell title="Enterprise admin" subtitle="Vendor report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Vendors' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Approved vendors: 1,280</p><p>Pending review: 42</p><p>Top category: Electronics</p></div></Card></AdminShell>; }

export function ReportsCustomersPage() { return <AdminShell title="Enterprise admin" subtitle="Customer report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Customers' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Total customers: 18.2k</p><p>Repeat buyers: 38%</p><p>Avg order value: ₹4,820</p></div></Card></AdminShell>; }

export function ReportsOrdersPage() { return <AdminShell title="Enterprise admin" subtitle="Orders report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Orders' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Orders today: 1,284</p><p>Delivered: 86%</p><p>Cancelled: 4%</p></div></Card></AdminShell>; }

export function ReportsDeliveryPage() { return <AdminShell title="Enterprise admin" subtitle="Delivery report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Delivery' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>On-time deliveries: 96.2%</p><p>Assigned partners: 342</p><p>Average SLA: 48 hours</p></div></Card></AdminShell>; }

export function ReportsWalletPage() { return <AdminShell title="Enterprise admin" subtitle="Wallet report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Wallet' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Gross wallet: ₹4.8Cr</p><p>Pending disbursal: ₹22.4L</p><p>Refund queue: ₹8.9L</p></div></Card></AdminShell>; }

export function ReportsCommissionPage() { return <AdminShell title="Enterprise admin" subtitle="Commission report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Commission' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Platform commission: ₹28L</p><p>Vendor settlements: ₹42L</p><p>Pending commission: ₹9.2L</p></div></Card></AdminShell>; }

export function ReportsFranchisePage() { return <AdminShell title="Enterprise admin" subtitle="Franchise report" breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: 'Franchise' }]} activePath="/admin/reports" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Active franchises: 24</p><p>Revenue this month: ₹86.3L</p><p>Top performing city: Bengaluru</p></div></Card></AdminShell>; }

export function ContentAnnouncementsPage() { return <AdminShell title="Enterprise admin" subtitle="Announcements" breadcrumbs={[{ label: 'Admin' }, { label: 'Content', to: '/admin/content' }, { label: 'Announcements' }]} activePath="/admin/content" actions={<PrimaryButton icon={<Megaphone className="h-4 w-4" />}>Announce</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }]} data={[{title:'New seller onboarding', status:'Published'}, {title:'Festival campaign', status:'Scheduled'}]} className="p-0" /></Card></AdminShell>; }
export function ContentNotificationsPage() { return <AdminShell title="Enterprise admin" subtitle="Notifications" breadcrumbs={[{ label: 'Admin' }, { label: 'Content', to: '/admin/content' }, { label: 'Notifications' }]} activePath="/admin/content" actions={<PrimaryButton icon={<Bell className="h-4 w-4" />}>Send</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }]} data={[{title:'Auction reminder', status:'Active'}, {title:'Platform upgrade', status:'Draft'}]} className="p-0" /></Card></AdminShell>; }
export function ContentFaqPage() { return <AdminShell title="Enterprise admin" subtitle="Content FAQ" breadcrumbs={[{ label: 'Admin' }, { label: 'Content', to: '/admin/content' }, { label: 'FAQ' }]} activePath="/admin/content" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add FAQ</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'question', label: 'Question' }, { key: 'status', label: 'Status' }]} data={[{question:'How do I sell?', status:'Published'}, {question:'How do I place a bid?', status:'Published'}]} className="p-0" /></Card></AdminShell>; }
export function ContentHelpPage() { return <AdminShell title="Enterprise admin" subtitle="Help content" breadcrumbs={[{ label: 'Admin' }, { label: 'Content', to: '/admin/content' }, { label: 'Help' }]} activePath="/admin/content" actions={<PrimaryButton icon={<FileText className="h-4 w-4" />}>Publish</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }]} data={[{title:'Seller onboarding', status:'Published'}, {title:'Wallet help', status:'Draft'}]} className="p-0" /></Card></AdminShell>; }

export const ContentCategoriesPage = CMSCategoriesPage;
export const ContentBannersPage = CMSBannersPage;

export function AuctionPendingPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Pending auctions" breadcrumbs={[{ label: 'Admin' }, { label: 'Auctions', to: '/admin/auctions' }, { label: 'Pending' }]} activePath="/admin/auctions" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>Review</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'title', label: 'Auction' }, { key: 'vendor', label: 'Vendor' }, { key: 'status', label: 'Status' }]} data={[{title:'Designer Handbag', vendor:'Urban Furnish', status:'Pending'}, {title:'Antique Lamp', vendor:'Blue Leaf', status:'Pending'}]} className="p-0" /></Card>
    </AdminShell>
  );
}

export function AuctionBidHistoryPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="Bid history" breadcrumbs={[{ label: 'Admin' }, { label: 'Auctions', to: '/admin/auctions' }, { label: 'Bid history' }]} activePath="/admin/auctions" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>Close</PrimaryButton>}>
      <Card className="p-4"><Table columns={[{ key: 'bidder', label: 'Bidder' }, { key: 'amount', label: 'Amount' }, { key: 'time', label: 'Time' }]} data={[{bidder:'Ananya', amount:'₹2,18,000', time:'2 mins ago'}, {bidder:'Karan', amount:'₹2,14,000', time:'4 mins ago'}]} className="p-0" /></Card>
    </AdminShell>
  );
}

export function AuctionLivePage() { return <AdminShell title="Enterprise admin" subtitle="Live auctions" breadcrumbs={[{ label: 'Admin' }, { label: 'Auctions', to: '/admin/auctions' }, { label: 'Live' }]} activePath="/admin/auctions" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>Review</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'title', label: 'Auction' }, { key: 'vendor', label: 'Vendor' }, { key: 'bids', label: 'Bids' }, { key: 'status', label: 'Status' }]} data={[{title:'Royal Enfield Classic', vendor:'DriveHub', bids:38, status:'Live'}, {title:'Luxury Watch', vendor:'Blue Leaf', bids:27, status:'Live'}]} className="p-0" /></Card></AdminShell>; }
export function AuctionUpcomingPage() { return <AdminShell title="Enterprise admin" subtitle="Upcoming auctions" breadcrumbs={[{ label: 'Admin' }, { label: 'Auctions', to: '/admin/auctions' }, { label: 'Upcoming' }]} activePath="/admin/auctions" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>Approve</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'title', label: 'Auction' }, { key: 'vendor', label: 'Vendor' }, { key: 'status', label: 'Status' }]} data={[{title:'Vintage Camera Kit', vendor:'Nova Tech', status:'Upcoming'}, {title:'Bespoke Watch', vendor:'Urban Furnish', status:'Upcoming'}]} className="p-0" /></Card></AdminShell>; }
export function AuctionCompletedPage() { return <AdminShell title="Enterprise admin" subtitle="Completed auctions" breadcrumbs={[{ label: 'Admin' }, { label: 'Auctions', to: '/admin/auctions' }, { label: 'Completed' }]} activePath="/admin/auctions" actions={<PrimaryButton icon={<FileText className="h-4 w-4" />}>Reports</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'title', label: 'Auction' }, { key: 'winner', label: 'Winner' }, { key: 'status', label: 'Status' }]} data={[{title:'Luxury Watch', winner:'Ananya', status:'Ended'}, {title:'Classic Bike', winner:'Karan', status:'Ended'}]} className="p-0" /></Card></AdminShell>; }
export function AuctionDetailAdminPage() { return <AdminShell title="Enterprise admin" subtitle="Auction details" breadcrumbs={[{ label: 'Admin' }, { label: 'Auctions', to: '/admin/auctions' }, { label: 'Auction details' }]} activePath="/admin/auctions" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>End auction</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Product: Royal Enfield Classic 350</p><p>Vendor: DriveHub</p><p>Current bid: ₹2,18,000</p><p>Bid count: 38</p><p>Status: Live</p></div></Card></AdminShell>; }

export function AdminOrderDetailPage() { return <AdminShell title="Enterprise admin" subtitle="Order details" breadcrumbs={[{ label: 'Admin' }, { label: 'Orders', to: '/admin/orders' }, { label: 'Order #ORD-1001' }]} activePath="/admin/orders" actions={<PrimaryButton icon={<Boxes className="h-4 w-4" />}>Update status</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Customer: Arjun Sharma</p><p>Vendor: Nova Tech</p><p>Products: Camera X × 1</p><p>Amount: ₹86,000</p><p>Payment: UPI</p><p>Delivery: RapidRoute</p><p>Status: Processing</p></div></Card></AdminShell>; }

export function DeliveryPartnersPage() { return <AdminShell title="Enterprise admin" subtitle="Delivery partners" breadcrumbs={[{ label: 'Admin' }, { label: 'Delivery', to: '/admin/delivery' }, { label: 'Partners' }]} activePath="/admin/delivery" actions={<PrimaryButton icon={<Truck className="h-4 w-4" />}>Add partner</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'name', label: 'Partner' }, { key: 'city', label: 'City' }, { key: 'status', label: 'Status' }]} data={[{name:'RapidRoute Logistics', city:'Bengaluru', status:'Active'}, {name:'GreenLine Express', city:'Mumbai', status:'Pending'}]} className="p-0" /></Card></AdminShell>; }
export function DeliveryPartnerDetailPage() { return <AdminShell title="Enterprise admin" subtitle="Delivery partner details" breadcrumbs={[{ label: 'Admin' }, { label: 'Delivery', to: '/admin/delivery' }, { label: 'Partner details' }]} activePath="/admin/delivery" actions={<PrimaryButton icon={<Truck className="h-4 w-4" />}>Assign route</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Name: RapidRoute Logistics</p><p>City: Bengaluru</p><p>Active deliveries: 182</p><p>On-time rate: 96.2%</p></div></Card></AdminShell>; }
export function DeliveryAssignmentsPage() { return <AdminShell title="Enterprise admin" subtitle="Delivery assignments" breadcrumbs={[{ label: 'Admin' }, { label: 'Delivery', to: '/admin/delivery' }, { label: 'Assignments' }]} activePath="/admin/delivery" actions={<PrimaryButton icon={<Truck className="h-4 w-4" />}>Assign</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'order', label: 'Order' }, { key: 'partner', label: 'Partner' }, { key: 'status', label: 'Status' }]} data={[{order:'ORD-1001', partner:'RapidRoute', status:'Assigned'}, {order:'ORD-1002', partner:'GreenLine', status:'In transit'}]} className="p-0" /></Card></AdminShell>; }
export function DeliveryPerformancePage() { return <AdminShell title="Enterprise admin" subtitle="Delivery performance" breadcrumbs={[{ label: 'Admin' }, { label: 'Delivery', to: '/admin/delivery' }, { label: 'Performance' }]} activePath="/admin/delivery" actions={<PrimaryButton icon={<TrendingUp className="h-4 w-4" />}>View stats</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>On-time rate: 96.2%</p><p>Avg delivery: 2.4 days</p><p>Failed deliveries: 18</p></div></Card></AdminShell>; }

export function WalletTransactionsPage() { return <AdminShell title="Enterprise admin" subtitle="Wallet transactions" breadcrumbs={[{ label: 'Admin' }, { label: 'Wallet', to: '/admin/wallet' }, { label: 'Transactions' }]} activePath="/admin/wallet" actions={<PrimaryButton icon={<Download className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'id', label: 'ID' }, { key: 'type', label: 'Type' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }]} data={[{id:'W-101', type:'Vendor payout', amount:'₹1,24,000', status:'Completed'}, {id:'W-102', type:'Platform commission', amount:'₹86,500', status:'Pending'}]} className="p-0" /></Card></AdminShell>; }
export function WalletWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | string | null>(null);

  const loadWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      setWithdrawals(await getPendingAdminWithdrawals());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load pending withdrawals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const updateWithdrawal = async (withdrawal: AdminWithdrawal, action: 'approve' | 'reject') => {
    setProcessingId(withdrawal.id);
    setError(null);
    setMessage(null);
    try {
      if (action === 'approve') {
        await approveAdminWithdrawal(withdrawal.id);
      } else {
        await rejectAdminWithdrawal(withdrawal.id);
      }
      setWithdrawals((current) => current.filter((item) => item.id !== withdrawal.id));
      setMessage(`Withdrawal ${action}d successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${action} withdrawal.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Withdrawals" breadcrumbs={[{ label: 'Admin' }, { label: 'Wallet', to: '/admin/wallet' }, { label: 'Withdrawals' }]} activePath="/admin/wallet" actions={<PrimaryButton icon={<Wallet2 className="h-4 w-4" />} onClick={loadWithdrawals}>Refresh</PrimaryButton>}>
      <Card className="p-4">
        {error ? <div className="mb-4"><ErrorState title="Withdrawal error" description={error} /></div> : null}
        {message ? <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}
        {loading ? <SkeletonTable /> : withdrawals.length === 0 ? <EmptyState title="No pending withdrawals" description="New vendor withdrawal requests will appear here." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-slate-400"><tr><th className="px-3 py-3">ID</th><th className="px-3 py-3">Vendor</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead>
              <tbody className="text-slate-300">
                {withdrawals.map((withdrawal) => {
                  const busy = processingId === withdrawal.id;
                  return <tr key={withdrawal.id} className="border-t border-white/6"><td className="px-3 py-3">{withdrawal.id}</td><td className="px-3 py-3">{String(withdrawal.vendorName || withdrawal.vendorEmail || 'Vendor')}</td><td className="px-3 py-3">₹{Number(withdrawal.amount || 0).toLocaleString('en-IN')}</td><td className="px-3 py-3">{String(withdrawal.status || 'PENDING')}</td><td className="px-3 py-3"><div className="flex gap-2"><PrimaryButton className="min-h-0 px-3 py-2 text-xs" disabled={busy} onClick={() => updateWithdrawal(withdrawal, 'approve')}>{busy ? 'Working…' : 'Approve'}</PrimaryButton><SecondaryButton className="min-h-0 px-3 py-2 text-xs" disabled={busy} onClick={() => updateWithdrawal(withdrawal, 'reject')}>Reject</SecondaryButton></div></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
export function WalletRefundsPage() { return <AdminShell title="Enterprise admin" subtitle="Refunds" breadcrumbs={[{ label: 'Admin' }, { label: 'Wallet', to: '/admin/wallet' }, { label: 'Refunds' }]} activePath="/admin/wallet" actions={<PrimaryButton icon={<CreditCard className="h-4 w-4" />}>Review</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'id', label: 'ID' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }]} data={[{id:'RF-301', amount:'₹7,200', status:'Queued'}, {id:'RF-302', amount:'₹3,400', status:'Completed'}]} className="p-0" /></Card></AdminShell>; }
export function WalletSettlementsPage() { return <AdminShell title="Enterprise admin" subtitle="Settlements" breadcrumbs={[{ label: 'Admin' }, { label: 'Wallet', to: '/admin/wallet' }, { label: 'Settlements' }]} activePath="/admin/wallet" actions={<PrimaryButton icon={<Wallet2 className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'id', label: 'ID' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }]} data={[{id:'SET-401', amount:'₹1,25,000', status:'Queued'}, {id:'SET-402', amount:'₹96,000', status:'Completed'}]} className="p-0" /></Card></AdminShell>; }
export function WalletCommissionsPage() { return <AdminShell title="Enterprise admin" subtitle="Commissions" breadcrumbs={[{ label: 'Admin' }, { label: 'Wallet', to: '/admin/wallet' }, { label: 'Commissions' }]} activePath="/admin/wallet" actions={<PrimaryButton icon={<TrendingUp className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'id', label: 'ID' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' }]} data={[{id:'COM-501', amount:'₹86,500', status:'Pending'}, {id:'COM-502', amount:'₹72,000', status:'Completed'}]} className="p-0" /></Card></AdminShell>; }
export function WalletTransactionDetailPage() { return <AdminShell title="Enterprise admin" subtitle="Transaction details" breadcrumbs={[{ label: 'Admin' }, { label: 'Wallet', to: '/admin/wallet' }, { label: 'Transaction details' }]} activePath="/admin/wallet" actions={<PrimaryButton icon={<FileText className="h-4 w-4" />}>Download</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>ID: W-101</p><p>Type: Vendor payout</p><p>Amount: ₹1,24,000</p><p>Status: Completed</p></div></Card></AdminShell>; }

export function FranchiseDetailPage() { return <AdminShell title="Enterprise admin" subtitle="Franchise details" breadcrumbs={[{ label: 'Admin' }, { label: 'Franchise', to: '/admin/franchise' }, { label: 'Details' }]} activePath="/admin/franchise" actions={<PrimaryButton icon={<Store className="h-4 w-4" />}>Update</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Name: Bengaluru Franchise</p><p>City: Bengaluru</p><p>Admin: Asha Rao</p><p>Revenue: ₹18.4L</p><p>Status: Healthy</p></div></Card></AdminShell>; }
export function FranchiseCreatePage() { return <AdminShell title="Enterprise admin" subtitle="Create franchise" breadcrumbs={[{ label: 'Admin' }, { label: 'Franchise', to: '/admin/franchise' }, { label: 'Create' }]} activePath="/admin/franchise" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Save</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>New franchise onboarding form placeholder.</p><p>Includes basic organization, city, admin, and compliance fields.</p></div></Card></AdminShell>; }
export function FranchiseEditPage() { return <AdminShell title="Enterprise admin" subtitle="Edit franchise" breadcrumbs={[{ label: 'Admin' }, { label: 'Franchise', to: '/admin/franchise' }, { label: 'Edit' }]} activePath="/admin/franchise" actions={<PrimaryButton icon={<Settings2 className="h-4 w-4" />}>Save changes</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Update franchise profile, contact details, and policies.</p></div></Card></AdminShell>; }
export function FranchiseVendorsPage() { return <AdminShell title="Enterprise admin" subtitle="Franchise vendors" breadcrumbs={[{ label: 'Admin' }, { label: 'Franchise', to: '/admin/franchise' }, { label: 'Vendors' }]} activePath="/admin/franchise" actions={<PrimaryButton icon={<Users className="h-4 w-4" />}>Add vendor</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'name', label: 'Vendor' }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status' }]} data={[{name:'Nova Tech', category:'Electronics', status:'Approved'}, {name:'Blue Leaf', category:'Home decor', status:'Pending'}]} className="p-0" /></Card></AdminShell>; }
export function FranchiseOrdersPage() { return <AdminShell title="Enterprise admin" subtitle="Franchise orders" breadcrumbs={[{ label: 'Admin' }, { label: 'Franchise', to: '/admin/franchise' }, { label: 'Orders' }]} activePath="/admin/franchise" actions={<PrimaryButton icon={<Boxes className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'id', label: 'Order ID' }, { key: 'customer', label: 'Customer' }, { key: 'total', label: 'Revenue' }]} data={[{id:'ORD-2001', customer:'Amit', total:'₹26,400'}, {id:'ORD-2002', customer:'Rekha', total:'₹19,800'}]} className="p-0" /></Card></AdminShell>; }
export function FranchisePerformancePage() { return <AdminShell title="Enterprise admin" subtitle="Franchise performance" breadcrumbs={[{ label: 'Admin' }, { label: 'Franchise', to: '/admin/franchise' }, { label: 'Performance' }]} activePath="/admin/franchise" actions={<PrimaryButton icon={<TrendingUp className="h-4 w-4" />}>View report</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Revenue this month: ₹86.3L</p><p>Order conversion: 21.4%</p><p>Customer retention: 72%</p></div></Card></AdminShell>; }

export function VendorDetailPage() { return <AdminShell title="Enterprise admin" subtitle="Vendor details" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors', to: '/admin/vendors' }, { label: 'Details' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<Store className="h-4 w-4" />}>Review</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Name: Nova Tech</p><p>Category: Electronics</p><p>KYC: Verified</p><p>Status: Approved</p><p>Revenue: ₹8.2L</p></div></Card></AdminShell>; }
export function VendorEditPage() { return <AdminShell title="Enterprise admin" subtitle="Edit vendor" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors', to: '/admin/vendors' }, { label: 'Edit' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<Settings2 className="h-4 w-4" />}>Save</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Vendor profile and compliance details editing form placeholder.</p></div></Card></AdminShell>; }
export function VendorProductsPage() { return <AdminShell title="Enterprise admin" subtitle="Vendor products" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors', to: '/admin/vendors' }, { label: 'Products' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<Plus className="h-4 w-4" />}>Add product</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'name', label: 'Product' }, { key: 'inventory', label: 'Inventory' }, { key: 'status', label: 'Status' }]} data={[{name:'Camera X', inventory:54, status:'Active'}, {name:'Smart Speaker', inventory:18, status:'Active'}]} className="p-0" /></Card></AdminShell>; }
export function VendorAuctionsPage() { return <AdminShell title="Enterprise admin" subtitle="Vendor auctions" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors', to: '/admin/vendors' }, { label: 'Auctions' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<Gavel className="h-4 w-4" />}>Review</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'title', label: 'Auction' }, { key: 'status', label: 'Status' }, { key: 'bids', label: 'Bids' }]} data={[{title:'Vintage Camera Kit', status:'Live', bids:12}, {title:'Classic Bike', status:'Ended', bids:48}]} className="p-0" /></Card></AdminShell>; }
export function VendorOrdersPage() { return <AdminShell title="Enterprise admin" subtitle="Vendor orders" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors', to: '/admin/vendors' }, { label: 'Orders' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<Boxes className="h-4 w-4" />}>Dispatch</PrimaryButton>}><Card className="p-4"><Table columns={[{ key: 'id', label: 'Order ID' }, { key: 'customer', label: 'Customer' }, { key: 'total', label: 'Total' }]} data={[{id:'ORD-1001', customer:'Arjun', total:'₹86,000'}, {id:'ORD-1005', customer:'Sneha', total:'₹63,500'}]} className="p-0" /></Card></AdminShell>; }
export function VendorWalletPage() { return <AdminShell title="Enterprise admin" subtitle="Vendor wallet" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors', to: '/admin/vendors' }, { label: 'Wallet' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<Wallet2 className="h-4 w-4" />}>Payout</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Available balance: ₹1,24,000</p><p>Ongoing settlements: ₹86,500</p><p>Pending payout: ₹18,500</p></div></Card></AdminShell>; }
export function VendorKycPage() { return <AdminShell title="Enterprise admin" subtitle="Vendor KYC" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors', to: '/admin/vendors' }, { label: 'KYC' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />}>Validate</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Identity: Verified</p><p>GST: Verified</p><p>Bank: Verified</p><p>Risk: Low</p></div></Card></AdminShell>; }
export function VendorPerformancePage() { return <AdminShell title="Enterprise admin" subtitle="Vendor performance" breadcrumbs={[{ label: 'Admin' }, { label: 'Vendors', to: '/admin/vendors' }, { label: 'Performance' }]} activePath="/admin/vendors" actions={<PrimaryButton icon={<TrendingUp className="h-4 w-4" />}>Export</PrimaryButton>}><Card className="p-6"><div className="space-y-3 text-sm text-slate-300"><p>Sales this month: ₹8.2L</p><p>Return rate: 2.1%</p><p>Repeat customers: 64%</p></div></Card></AdminShell>; }
