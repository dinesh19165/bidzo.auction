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
import { approveVendor, getPendingVendorApprovals, rejectVendor, requestVendorChanges, type ApprovalRequest } from '../../api/approvalApi';
import { approveVendorDocument } from '../../api/vendorApi';
import { approveAdminWithdrawal, getAdminWalletSummary, getAdminWalletTransactions, getPendingAdminWithdrawals, rejectAdminWithdrawal, type AdminWalletSummary, type AdminWalletTransaction, type AdminWithdrawal } from '../../api/adminWalletApi';
import { createAdminNotificationTemplate, deleteAdminNotificationTemplate, getAdminAuctionRules, getAdminCommissionRules, getAdminEmailSettings, getAdminGeneralSettings, getAdminLocalizationSettings, getAdminNotificationTemplates, getAdminPlatformCharges, getAdminRegistrationFeeSettings, getAdminSecuritySettings, getAdminShippingRules, getAdminSmsSettings, getAdminTaxSettings, updateAdminAuctionRules, updateAdminCommissionRules, updateAdminEmailSettings, updateAdminGeneralSettings, updateAdminLocalizationSettings, updateAdminPlatformCharges, updateAdminRegistrationFeeSettings, updateAdminSecuritySettings, updateAdminShippingRules, updateAdminSmsSettings, updateAdminTaxSettings, type NotificationTemplate } from '../../api/adminSettingsApi';
import { createBanner, createBlog, createCategory, createFaq, createPage, createTestimonial, deleteBanner, deleteBlog, deleteCategory, deleteFaq, deletePage, deleteTestimonial, getBanners, getBlogs, getCategories, getFaq, getPages, getTestimonials, updateBanner, updateBannerStatus, updateBlog, updateBlogStatus, updateCategory, updateCategoryFeatured, updateCategoryStatus, updateFaq, updateFaqStatus, updatePage, updatePageStatus, updateTestimonial, updateTestimonialStatus } from '../../api/cmsApi';
import { EmptyState, ErrorState, SkeletonTable } from '../../components/loading/LoadingComponents';
import { showToast } from '../../components/ui/toast';

const maskAccountNumber = (value?: string | number | null) => {
  const raw = String(value ?? '').trim();
  if (!raw || raw === '-' || raw === 'null' || raw === 'undefined') {
    return 'Bank details not provided';
  }

  const alreadyMasked = raw.startsWith('******') || raw.includes('*');
  if (alreadyMasked) {
    return raw;
  }

  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return raw;
  }

  if (digits.length <= 4) {
    return `******${digits}`;
  }

  return `******${digits.slice(-4)}`;
};

const getSafeValue = (record: Record<string, unknown> | null | undefined, keys: string[]) => {
  if (!record) return '';
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return '';
};

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
  const [approvingDocumentId, setApprovingDocumentId] = useState<number | string | null>(null);
  const [requestChangesVendorId, setRequestChangesVendorId] = useState<number | string | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, boolean>>({
    AADHAAR: true,
    PAN: true,
    SELFIE: true,
  });

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

  const bankVerificationRows = approvals.filter((row) =>
    Boolean(
      row.accountHolderName || row.bankName || row.accountNumber || row.ifsc || row.branch || row.gstNumber
    )
  );

  const maskAccountNumber = (value?: string) => {
    if (!value) return 'Not provided';
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Not provided';
    return digits.length <= 4 ? `******${digits}` : `******${digits.slice(-4)}`;
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

  const handleApproveDocument = async (vendorProfileId: number | string, documentId: number | string) => {
    setApprovingDocumentId(documentId);
    setActionError(null);
    try {
      await approveVendorDocument(vendorProfileId, documentId);
      await loadApprovals();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to approve document.');
    } finally {
      setApprovingDocumentId(null);
    }
  };

  const handleRequestChanges = async (vendorProfileId: number | string) => {
    const selected = Object.entries(selectedDocuments)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key === 'AADHAAR' ? 'ID_PROOF' : key as 'PAN' | 'SELFIE');

    if (selected.length === 0 || !requestReason.trim()) {
      setActionError('Select at least one document and provide a reason to request changes.');
      return;
    }

    setProcessingId(vendorProfileId);
    setActionError(null);
    try {
      await requestVendorChanges(vendorProfileId, selected, requestReason.trim());
      setRequestChangesVendorId(null);
      setRequestReason('');
      setSelectedDocuments({ AADHAAR: true, PAN: true, SELFIE: true });
      await loadApprovals();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to request changes.');
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
                <div className="mt-3 space-y-2">
                  {(row.documents ?? []).map((doc) => {
                    const normalizedType = String(doc.type ?? '').toUpperCase();
                    const isSelfieDocument = normalizedType.includes('SELFIE') || String(doc.type ?? '').toUpperCase() === 'SELFIE';
                    const displayLabel = normalizedType.includes('ID_PROOF') || normalizedType.includes('AADHAAR') || normalizedType.includes('IDENTITY') ? 'Aadhaar' : normalizedType.includes('PAN') ? 'PAN' : isSelfieDocument ? 'SELFIE' : 'Document';
                    const isApproved = normalizedType && String(doc.status ?? '').toUpperCase() === 'APPROVED';
                    const isApprovingThisDocument = approvingDocumentId === doc.id;

                    return (
                      <div key={`${row.vendorProfileId}-${doc.id ?? doc.type}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-white">{displayLabel}</span>
                          <Badge>{String(doc.status ?? 'PENDING').toUpperCase() === 'APPROVED' ? 'APPROVED' : String(doc.status ?? 'PENDING').toUpperCase() === 'CHANGES_REQUESTED' ? 'CHANGES REQUESTED' : 'PENDING REVIEW'}</Badge>
                        </div>
                        {doc.fileName ? <p className="mt-2 text-xs text-slate-400">Uploaded file: {doc.fileName}</p> : null}
                        {doc.documentNumber ? <p className="mt-2 text-xs text-slate-400">Document number: {doc.documentNumber}</p> : null}
                        {doc.documentUrl ? <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-blue-300 underline">View document</a> : null}
                        {doc.reason ? <p className="mt-2 text-xs text-amber-200">Reason: {doc.reason}</p> : null}
                        {!isApproved && doc.id !== undefined && doc.id !== null ? (
                          <SecondaryButton
                            disabled={isApprovingThisDocument}
                            onClick={() => handleApproveDocument(row.vendorProfileId, doc.id!)}
                            className="mt-3 w-full"
                          >
                            {isApprovingThisDocument ? `Approving ${displayLabel}...` : isSelfieDocument ? 'Approve SELFIE' : `Approve ${displayLabel}`}
                          </SecondaryButton>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PrimaryButton disabled={busy} onClick={() => handleAction(row, 'approve')}>Approve Vendor</PrimaryButton>
                  <SecondaryButton disabled={busy} onClick={() => handleAction(row, 'reject')}>Reject</SecondaryButton>
                  <SecondaryButton disabled={busy} onClick={() => {
                    setRequestChangesVendorId(row.vendorProfileId);
                    setRequestReason('');
                    setSelectedDocuments({ AADHAAR: true, PAN: true, SELFIE: true });
                  }}>Request changes</SecondaryButton>
                </div>
                {requestChangesVendorId === row.vendorProfileId ? (
                  <div className="mt-3 rounded-2xl border border-amber-500/30 bg-slate-950/60 p-3">
                    <div className="mb-2 text-sm font-semibold text-white">Request changes for this vendor</div>
                    <div className="space-y-2 text-sm text-slate-200">
                      {['AADHAAR', 'PAN', 'SELFIE'].map((document) => (
                        <label key={document} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedDocuments[document])}
                            onChange={() => setSelectedDocuments((current) => ({ ...current, [document]: !current[document] }))}
                          />
                          {document}
                        </label>
                      ))}
                    </div>
                    <textarea
                      value={requestReason}
                      onChange={(event) => setRequestReason(event.target.value)}
                      placeholder="Describe the issue..."
                      className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                      rows={3}
                    />
                    <div className="mt-3 flex gap-2">
                      <PrimaryButton disabled={busy || !requestReason.trim()} onClick={() => handleRequestChanges(row.vendorProfileId)}>Send request</PrimaryButton>
                      <SecondaryButton onClick={() => setRequestChangesVendorId(null)}>Cancel</SecondaryButton>
                    </div>
                  </div>
                ) : null}
              </div>;
            })}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Verification queue</p>
              <h3 className="mt-1 text-lg font-semibold text-white">KYC, GST and bank checks</h3>
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
      const withdrawals = await getPendingAdminWithdrawals();

      const enrichedWithdrawals = await Promise.all(withdrawals.map(async (withdrawal) => {
        const withdrawalRecord = withdrawal as Record<string, unknown>;
        const vendorObj = withdrawalRecord.vendor as Record<string, unknown> | undefined;
        const vendorId = withdrawalRecord.vendorId ?? withdrawalRecord.vendor_id ?? vendorObj?.id;
        if (!vendorId) {
          return withdrawal;
        }

        try {
          const vendor = await import('../../api/adminApi').then(({ getAdminVendor }) => getAdminVendor(String(vendorId)));
          const vendorRecord = vendor as Record<string, unknown> | null;
          const bankAccountNumber = getSafeValue(vendorRecord, ['bankAccountNumber', 'bank_account_number', 'accountNumber', 'account_number']);
          const bankName = getSafeValue(vendorRecord, ['bankName', 'bank_name', 'bank']);
          const ifsc = getSafeValue(vendorRecord, ['ifsc', 'ifscCode', 'ifsc_code', 'ifscCode']);
          const branch = getSafeValue(vendorRecord, ['branch', 'branchName', 'branch_name', 'branchName']);
          const accountHolderName = getSafeValue(vendorRecord, ['accountHolderName', 'account_holder_name', 'bankAccountHolderName']);

          return {
            ...withdrawal,
            vendorName: getSafeValue(vendorRecord, ['username', 'name', 'businessName', 'companyName']) || withdrawal.vendorName || withdrawal.businessName || 'Vendor',
            vendorEmail: getSafeValue(vendorRecord, ['email', 'vendorEmail']) || withdrawal.vendorEmail || '',
            bankName: bankName || withdrawal.bankName || '',
            accountNumber: bankAccountNumber || withdrawal.accountNumber || withdrawal.bankAccountNumber || '',
            ifsc: ifsc || withdrawal.ifsc || withdrawal.ifscCode || '',
            branch: branch || withdrawal.branch || withdrawal.branchName || withdrawal.bankBranch || '',
            accountHolderName: accountHolderName || withdrawal.accountHolderName || '',
          };
        } catch {
          return withdrawal;
        }
      }));

      setPendingWithdrawals(enrichedWithdrawals);
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
          { key: 'vendorName', label: 'Vendor', render: (row: any) => <span>{row.vendorName || '—'}</span> },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-200' : row.status === 'Pending' ? 'bg-amber-500/10 text-amber-200' : 'bg-blue-500/10 text-blue-200'}>{row.status}</Badge> },
          { key: 'date', label: 'Date' },
        ]} data={transactions.map((transaction) => ({
          ...transaction,
          vendorName: transaction.vendorName || '—',
          date: transaction.date || transaction.createdAt || '-',
        }))} className="p-0" />}
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
                  const vendorName = withdrawal.vendorName || withdrawal.businessName || 'Vendor';
                  const vendorEmail = withdrawal.vendorEmail || '';
                  const bankName = withdrawal.bankName || withdrawal.accountHolderName || withdrawal.ifsc || withdrawal.branch || withdrawal.accountNumber ? (withdrawal.bankName || 'Bank details available') : '';
                  const accountNumber = withdrawal.accountNumber || withdrawal.bankAccountNumber || '';
                  const ifsc = withdrawal.ifsc || withdrawal.ifscCode || '';
                  const branch = withdrawal.branch || withdrawal.branchName || withdrawal.bankBranch || '';
                  const hasBankDetails = Boolean(bankName || accountNumber || ifsc || branch || withdrawal.accountHolderName);

                  return (
                    <>
                      <tr key={withdrawal.id} className="border-t border-white/6">
                        <td className="px-3 py-3">{withdrawal.id}</td>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <div>{vendorName}</div>
                            {vendorEmail ? <div className="text-xs text-slate-400">{vendorEmail}</div> : null}
                          </div>
                        </td>
                        <td className="px-3 py-3">₹{Number(withdrawal.amount || 0).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-3"><Badge className="bg-amber-500/10 text-amber-200">{String(withdrawal.status || 'PENDING')}</Badge></td>
                        <td className="px-3 py-3">{String(withdrawal.requestedAt || withdrawal.createdAt || '-')}</td>
                        <td className="px-3 py-3"><div className="flex gap-2"><PrimaryButton className="min-h-0 px-3 py-2 text-xs" disabled={busy} onClick={() => updatePendingWithdrawal(withdrawal, 'approve')}>{busy ? 'Working…' : 'Approve'}</PrimaryButton><SecondaryButton className="min-h-0 px-3 py-2 text-xs" disabled={busy} onClick={() => updatePendingWithdrawal(withdrawal, 'reject')}>Reject</SecondaryButton></div></td>
                      </tr>
                      <tr key={`${withdrawal.id}-bank`} className="border-b border-white/6 bg-slate-950/30">
                        <td colSpan={6} className="px-3 py-3">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Bank details</div>
                            {hasBankDetails ? (
                              <div className="grid gap-3 md:grid-cols-2">
                                <div><span className="text-slate-400">Account holder:</span> <span className="text-white">{withdrawal.accountHolderName || 'Not provided'}</span></div>
                                <div><span className="text-slate-400">Bank:</span> <span className="text-white">{withdrawal.bankName || 'Not provided'}</span></div>
                                <div><span className="text-slate-400">Account number:</span> <span className="text-white">{accountNumber ? maskAccountNumber(accountNumber) : 'Not provided'}</span></div>
                                <div><span className="text-slate-400">IFSC:</span> <span className="text-white">{ifsc || 'Not provided'}</span></div>
                                <div className="md:col-span-2"><span className="text-slate-400">Branch:</span> <span className="text-white">{branch || 'Not provided'}</span></div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-300">Bank details not provided</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    </>
                  );
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

function ToggleSwitch({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-3">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${enabled ? 'text-emerald-300' : 'text-slate-400'}`}>{enabled ? 'Enabled' : 'Disabled'}</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-500/80' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
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

const normalizeCmsStatus = (value: unknown) => String(value ?? 'DRAFT').trim().toUpperCase();

const toCmsString = (value: unknown, fallback = '') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

export function CMSBannersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({ title: '', status: 'DRAFT' });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBanners();
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const handleCreate = async () => {
    try {
      const payload = { title: draft.title || 'New banner', status: normalizeCmsStatus(draft.status), imageUrl: '', ctaLabel: 'Shop now', ctaUrl: '#', isPublished: normalizeCmsStatus(draft.status) === 'PUBLISHED' };
      const created = await createBanner(payload);
      setItems((prev) => [created, ...prev]);
      setDraft({ title: '', status: 'DRAFT' });
      setIsCreating(false);
      showToast('Banner created', 'The CMS banner was saved successfully.', 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to create banner';
      setError(message);
      showToast('Banner save failed', message, 'warning');
    }
  };

  const handleToggleStatus = async (row: any) => {
    try {
      const nextStatus = normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const updated = await updateBannerStatus(row.id, nextStatus);
      setItems((prev) => prev.map((item) => item.id === row.id ? { ...item, ...updated } : item));
      showToast('Banner status updated', `Status changed to ${nextStatus}.`, 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to update banner status';
      showToast('Status update failed', message, 'warning');
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS banners" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Banners' }]} activePath="/admin/cms" actions={<PrimaryButton onClick={() => setIsCreating((prev) => !prev)} icon={<Plus className="h-4 w-4" />}>Add banner</PrimaryButton>}>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-4">
          {isCreating && (
            <div className="mb-4 rounded-[18px] border border-white/10 bg-slate-900/80 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <LabeledInput label="Title" value={draft.title} onChange={(value) => setDraft((prev) => ({ ...prev, title: value }))} />
                <div className="space-y-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                  <select value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none">
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <SecondaryButton onClick={() => setIsCreating(false)}>Cancel</SecondaryButton>
                <PrimaryButton onClick={handleCreate}>Save</PrimaryButton>
              </div>
            </div>
          )}
          {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
          {loading ? <div className="text-sm text-slate-400">Loading banners...</div> : (
            <Table columns={[
              { key: 'title', label: 'Title' },
              { key: 'status', label: 'Status', render: (row: any) => <Badge className={normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{normalizeCmsStatus(row.status)}</Badge> },
              { key: 'ctaLabel', label: 'CTA', render: (row: any) => <span>{toCmsString(row.ctaLabel || row.cta, '—')}</span> },
              { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={() => handleToggleStatus(row)} className="rounded-full bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200">{normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button> },
            ]} data={items} className="p-0" />
          )}
        </Card>
        <FakeTable title="Banner overview" items={[{ label: 'Live banners', value: String(items.filter((item) => normalizeCmsStatus(item.status) === 'PUBLISHED').length), tone: 'emerald' }, { label: 'Draft banners', value: String(items.filter((item) => normalizeCmsStatus(item.status) === 'DRAFT').length), tone: 'amber' }]} />
      </div>
    </AdminShell>
  );
}

export function CMSCategoriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', status: 'DRAFT', featured: false });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const handleCreate = async () => {
    try {
      const created = await createCategory({ name: draft.name || 'New category', status: normalizeCmsStatus(draft.status), featured: draft.featured });
      setItems((prev) => [created, ...prev]);
      setDraft({ name: '', status: 'DRAFT', featured: false });
      setIsCreating(false);
      showToast('Category created', 'The CMS category was saved successfully.', 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to create category';
      setError(message);
      showToast('Category save failed', message, 'warning');
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteCategory(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast('Category deleted', 'The item was removed from the CMS list.', 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to delete category';
      showToast('Delete failed', message, 'warning');
    }
  };

  const handleFeaturedToggle = async (row: any) => {
    try {
      const next = !Boolean(row.featured);
      await updateCategoryFeatured(row.id, next);
      setItems((prev) => prev.map((item) => item.id === row.id ? { ...item, featured: next } : item));
      showToast('Featured status updated', `Category is now ${next ? 'featured' : 'not featured'}.`, 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to update featured status';
      showToast('Featured update failed', message, 'warning');
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS categories" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Categories' }]} activePath="/admin/cms" actions={<PrimaryButton onClick={() => setIsCreating((prev) => !prev)} icon={<Plus className="h-4 w-4" />}>Add category</PrimaryButton>}>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-4">
          {isCreating && (
            <div className="mb-4 rounded-[18px] border border-white/10 bg-slate-900/80 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <LabeledInput label="Name" value={draft.name} onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))} />
                <div className="space-y-2">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                  <select value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none">
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((prev) => ({ ...prev, featured: event.target.checked }))} className="h-4 w-4 rounded border-white/20 bg-slate-900" />
                Featured
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <SecondaryButton onClick={() => setIsCreating(false)}>Cancel</SecondaryButton>
                <PrimaryButton onClick={handleCreate}>Save</PrimaryButton>
              </div>
            </div>
          )}
          {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
          {loading ? <div className="text-sm text-slate-400">Loading categories...</div> : (
            <Table columns={[
              { key: 'name', label: 'Name' },
              { key: 'status', label: 'Status', render: (row: any) => <Badge className={normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{normalizeCmsStatus(row.status)}</Badge> },
              { key: 'featured', label: 'Featured', render: (row: any) => <button onClick={() => handleFeaturedToggle(row)} className="rounded-full bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200">{row.featured ? 'Featured' : 'Not featured'}</button> },
              { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={() => handleDelete(row.id)} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Delete</button> },
            ]} data={items} className="p-0" />
          )}
        </Card>
        <FakeTable title="Taxonomy" items={[{ label: 'Top categories', value: String(items.length), tone: 'blue' }, { label: 'Featured', value: String(items.filter((item) => Boolean(item.featured)).length), tone: 'emerald' }]} />
      </div>
    </AdminShell>
  );
}

export function CMSFaqPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({ question: '', answer: '', status: 'DRAFT' });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFaq();
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load FAQ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const handleCreate = async () => {
    try {
      const created = await createFaq({ question: draft.question || 'New question', answer: draft.answer || 'Answer pending', status: normalizeCmsStatus(draft.status), featured: false });
      setItems((prev) => [created, ...prev]);
      setDraft({ question: '', answer: '', status: 'DRAFT' });
      setIsCreating(false);
      showToast('FAQ created', 'The FAQ item was saved successfully.', 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to create FAQ';
      setError(message);
      showToast('FAQ save failed', message, 'warning');
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS FAQ" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'FAQ' }]} activePath="/admin/cms" actions={<PrimaryButton onClick={() => setIsCreating((prev) => !prev)} icon={<Plus className="h-4 w-4" />}>Add FAQ</PrimaryButton>}>
      <Card className="p-4">
        {isCreating && (
          <div className="mb-4 rounded-[18px] border border-white/10 bg-slate-900/80 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <LabeledInput label="Question" value={draft.question} onChange={(value) => setDraft((prev) => ({ ...prev, question: value }))} />
              <div className="space-y-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                <select value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <LabeledTextarea label="Answer" value={draft.answer} onChange={(value) => setDraft((prev) => ({ ...prev, answer: value }))} />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <SecondaryButton onClick={() => setIsCreating(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleCreate}>Save</PrimaryButton>
            </div>
          </div>
        )}
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading FAQ...</div> : (
          <Table columns={[
            { key: 'question', label: 'Question' },
            { key: 'answer', label: 'Answer' },
            { key: 'status', label: 'Status', render: (row: any) => <Badge className={normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{normalizeCmsStatus(row.status)}</Badge> },
            { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={async () => { try { await deleteFaq(row.id); setItems((prev) => prev.filter((item) => item.id !== row.id)); showToast('FAQ deleted', 'The item was removed successfully.', 'success'); } catch (saveError) { showToast('Delete failed', saveError instanceof Error ? saveError.message : 'Failed to delete FAQ', 'warning'); } }} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Delete</button> },
          ]} data={items} className="p-0" />
        )}
      </Card>
    </AdminShell>
  );
}

export function CMSBlogPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({ title: '', author: '', category: '', status: 'DRAFT' });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlogs();
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const handleCreate = async () => {
    try {
      const created = await createBlog({ title: draft.title || 'New blog post', author: draft.author || 'Admin', category: draft.category || 'General', status: normalizeCmsStatus(draft.status) });
      setItems((prev) => [created, ...prev]);
      setDraft({ title: '', author: '', category: '', status: 'DRAFT' });
      setIsCreating(false);
      showToast('Blog post created', 'The CMS blog post was saved successfully.', 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to create blog post';
      setError(message);
      showToast('Blog save failed', message, 'warning');
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS blog" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Blog' }]} activePath="/admin/cms" actions={<PrimaryButton onClick={() => setIsCreating((prev) => !prev)} icon={<Plus className="h-4 w-4" />}>Create blog</PrimaryButton>}>
      <Card className="p-4">
        {isCreating && (
          <div className="mb-4 rounded-[18px] border border-white/10 bg-slate-900/80 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <LabeledInput label="Title" value={draft.title} onChange={(value) => setDraft((prev) => ({ ...prev, title: value }))} />
              <LabeledInput label="Author" value={draft.author} onChange={(value) => setDraft((prev) => ({ ...prev, author: value }))} />
              <LabeledInput label="Category" value={draft.category} onChange={(value) => setDraft((prev) => ({ ...prev, category: value }))} />
            </div>
            <div className="mt-3 flex justify-end gap-3">
              <SecondaryButton onClick={() => setIsCreating(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleCreate}>Save</PrimaryButton>
            </div>
          </div>
        )}
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading blog posts...</div> : (
          <Table columns={[
            { key: 'title', label: 'Title' },
            { key: 'author', label: 'Author' },
            { key: 'category', label: 'Category' },
            { key: 'status', label: 'Status', render: (row: any) => <Badge className={normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{normalizeCmsStatus(row.status)}</Badge> },
            { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={async () => { try { await deleteBlog(row.id); setItems((prev) => prev.filter((item) => item.id !== row.id)); showToast('Blog deleted', 'The post was removed successfully.', 'success'); } catch (saveError) { showToast('Delete failed', saveError instanceof Error ? saveError.message : 'Failed to delete blog post', 'warning'); } }} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Delete</button> },
          ]} data={items} className="p-0" />
        )}
      </Card>
    </AdminShell>
  );
}

export function CMSTestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [draft, setDraft] = useState({ customerName: '', rating: '5', content: '', status: 'DRAFT', imageUrl: '' });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTestimonials();
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const resetDraft = () => {
    setDraft({ customerName: '', rating: '5', content: '', status: 'DRAFT', imageUrl: '' });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        customerName: draft.customerName || 'Customer',
        rating: Number(draft.rating || 5),
        content: draft.content || '',
        imageUrl: draft.imageUrl || '',
        status: normalizeCmsStatus(draft.status),
      };

      if (editingId !== null) {
        const updated = await updateTestimonial(editingId, payload);
        setItems((prev) => prev.map((item) => item.id === editingId ? { ...item, ...updated } : item));
        showToast('Testimonial updated', 'The testimonial was saved successfully.', 'success');
      } else {
        const created = await createTestimonial(payload);
        setItems((prev) => [created, ...prev]);
        showToast('Testimonial created', 'The testimonial was added successfully.', 'success');
      }
      resetDraft();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save testimonial';
      setError(message);
      showToast('Testimonial save failed', message, 'warning');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await deleteTestimonial(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast('Testimonial deleted', 'The testimonial was removed successfully.', 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to delete testimonial';
      showToast('Delete failed', message, 'warning');
    }
  };

  const handleStatusToggle = async (row: any) => {
    try {
      const nextStatus = normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const updated = await updateTestimonialStatus(row.id, nextStatus);
      setItems((prev) => prev.map((item) => item.id === row.id ? { ...item, ...updated } : item));
      showToast('Testimonial status updated', `The testimonial is now ${nextStatus}.`, 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to update testimonial status';
      showToast('Status update failed', message, 'warning');
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="CMS testimonials" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Testimonials' }]} activePath="/admin/cms" actions={<PrimaryButton onClick={() => { setEditingId(null); setDraft({ customerName: '', rating: '5', content: '', status: 'DRAFT', imageUrl: '' }); setIsCreating((prev) => !prev); }} icon={<Plus className="h-4 w-4" />}>Add testimonial</PrimaryButton>}>
      <Card className="p-4">
        {isCreating && (
          <div className="mb-4 rounded-[18px] border border-white/10 bg-slate-900/80 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <LabeledInput label="Customer name" value={draft.customerName} onChange={(value) => setDraft((prev) => ({ ...prev, customerName: value }))} />
              <LabeledInput label="Rating" value={draft.rating} onChange={(value) => setDraft((prev) => ({ ...prev, rating: value }))} />
            </div>
            <div className="mt-3">
              <LabeledTextarea label="Message" value={draft.content} onChange={(value) => setDraft((prev) => ({ ...prev, content: value }))} />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <LabeledInput label="Image URL" value={draft.imageUrl} onChange={(value) => setDraft((prev) => ({ ...prev, imageUrl: value }))} />
              <div className="space-y-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                <select value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <SecondaryButton onClick={resetDraft}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingId !== null ? 'Update' : 'Create'}</PrimaryButton>
            </div>
          </div>
        )}
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading testimonials...</div> : (
          <Table columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'rating', label: 'Rating' },
            { key: 'status', label: 'Status', render: (row: any) => <Badge className={normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{normalizeCmsStatus(row.status)}</Badge> },
            { key: 'actions', label: 'Actions', render: (row: any) => <div className="flex gap-2"><button onClick={() => { setEditingId(row.id); setDraft({ customerName: toCmsString(row.customerName || row.name, ''), rating: String(row.rating ?? 5), content: toCmsString(row.content || row.message, ''), status: normalizeCmsStatus(row.status), imageUrl: toCmsString(row.imageUrl, '') }); setIsCreating(true); }} className="rounded-full bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200">Edit</button><button onClick={() => handleStatusToggle(row)} className="rounded-full bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200">{normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'Draft' : 'Publish'}</button><button onClick={() => handleDelete(row.id)} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Delete</button></div> },
          ]} data={items} className="p-0" />
        )}
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
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({ title: '', status: 'DRAFT' });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPages();
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const handleCreate = async () => {
    try {
      const created = await createPage({ title: draft.title || 'New page', status: normalizeCmsStatus(draft.status) });
      setItems((prev) => [created, ...prev]);
      setDraft({ title: '', status: 'DRAFT' });
      setIsCreating(false);
      showToast('Page created', 'The CMS page was saved successfully.', 'success');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to create page';
      setError(message);
      showToast('Page save failed', message, 'warning');
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Static pages" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS', to: '/admin/cms' }, { label: 'Pages' }]} activePath="/admin/cms" actions={<PrimaryButton onClick={() => setIsCreating((prev) => !prev)} icon={<Plus className="h-4 w-4" />}>Add page</PrimaryButton>}>
      <Card className="p-4">
        {isCreating && (
          <div className="mb-4 rounded-[18px] border border-white/10 bg-slate-900/80 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <LabeledInput label="Page title" value={draft.title} onChange={(value) => setDraft((prev) => ({ ...prev, title: value }))} />
              <div className="space-y-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                <select value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-white outline-none">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <SecondaryButton onClick={() => setIsCreating(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleCreate}>Save</PrimaryButton>
            </div>
          </div>
        )}
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading pages...</div> : (
          <Table columns={[
            { key: 'title', label: 'Page' },
            { key: 'status', label: 'Status', render: (row: any) => <Badge className={normalizeCmsStatus(row.status) === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{normalizeCmsStatus(row.status)}</Badge> },
            { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={async () => { try { await deletePage(row.id); setItems((prev) => prev.filter((item) => item.id !== row.id)); showToast('Page deleted', 'The page was removed successfully.', 'success'); } catch (saveError) { showToast('Delete failed', saveError instanceof Error ? saveError.message : 'Failed to delete page', 'warning'); } }} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Delete</button> },
          ]} data={items} className="p-0" />
        )}
      </Card>
    </AdminShell>
  );
}

const toSettingValue = (record: Record<string, unknown> | null | undefined, keys: string[]) => {
  if (!record) return '';
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return '';
};

const toCommissionValue = (value: unknown) => (value === null || value === undefined ? '' : String(value));

export function SettingsGeneralPage() {
  const [form, setForm] = useState({
    platformName: '',
    supportEmail: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminGeneralSettings();
        if (!active) return;
        setForm({
          platformName: toSettingValue(data, ['platformName', 'platform_name', 'name']),
          supportEmail: toSettingValue(data, ['supportEmail', 'support_email', 'email']),
          timezone: toSettingValue(data, ['timezone', 'timeZone']),
          currency: toSettingValue(data, ['currency', 'defaultCurrency']),
          address: toSettingValue(data, ['address', 'officeAddress', 'location']),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load general settings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminGeneralSettings();
      const saved = await updateAdminGeneralSettings({
        ...(current || {}),
        platformName: form.platformName,
        platform_name: form.platformName,
        supportEmail: form.supportEmail,
        support_email: form.supportEmail,
        timezone: form.timezone,
        currency: form.currency,
        address: form.address,
      });
      setForm({
        platformName: toSettingValue(saved, ['platformName', 'platform_name', 'name']),
        supportEmail: toSettingValue(saved, ['supportEmail', 'support_email', 'email']),
        timezone: toSettingValue(saved, ['timezone', 'timeZone']) || 'Asia/Kolkata',
        currency: toSettingValue(saved, ['currency', 'defaultCurrency']) || 'INR',
        address: toSettingValue(saved, ['address', 'officeAddress', 'location']),
      });
      setSuccess('General settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save general settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="General settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'General' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<Settings2 className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading general settings...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="Platform name" value={form.platformName} onChange={(value) => setForm((prev) => ({ ...prev, platformName: value }))} />
            <LabeledInput label="Support email" value={form.supportEmail} onChange={(value) => setForm((prev) => ({ ...prev, supportEmail: value }))} type="email" />
            <LabeledInput label="Timezone" value={form.timezone || 'Asia/Kolkata'} onChange={(value) => setForm((prev) => ({ ...prev, timezone: value }))} />
            <LabeledInput label="Currency" value={form.currency || 'INR'} onChange={(value) => setForm((prev) => ({ ...prev, currency: value }))} />
            <LabeledInput label="Address" value={form.address} onChange={(value) => setForm((prev) => ({ ...prev, address: value }))} className="md:col-span-2" />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsAuctionRulesPage() {
  const [rules, setRules] = useState<Record<string, string>>({
    bidIncrement: '',
    auctionDuration: '',
    autoClose: '',
    bidCancellation: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminAuctionRules();
        if (!active) return;
        setRules({
          bidIncrement: toSettingValue(data, ['minimumBidIncrement', 'minimum_bid_increment', 'bidIncrement', 'bid_increment']),
          auctionDuration: toSettingValue(data, ['auctionDuration', 'auction_duration', 'duration']),
          autoClose: toSettingValue(data, ['autoClose', 'auto_close', 'autoCloseEnabled']),
          bidCancellation: toSettingValue(data, ['bidCancellation', 'bid_cancellation', 'cancellationPolicy']),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load auction rules');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminAuctionRules();
      const saved = await updateAdminAuctionRules({
        ...(current || {}),
        minimumBidIncrement: rules.bidIncrement,
        minimum_bid_increment: rules.bidIncrement,
        auctionDuration: rules.auctionDuration,
        auction_duration: rules.auctionDuration,
        autoClose: rules.autoClose,
        auto_close: rules.autoClose,
        bidCancellation: rules.bidCancellation,
        bid_cancellation: rules.bidCancellation,
      });
      setRules({
        bidIncrement: toSettingValue(saved, ['minimumBidIncrement', 'minimum_bid_increment', 'bidIncrement', 'bid_increment']),
        auctionDuration: toSettingValue(saved, ['auctionDuration', 'auction_duration', 'duration']),
        autoClose: toSettingValue(saved, ['autoClose', 'auto_close', 'autoCloseEnabled']),
        bidCancellation: toSettingValue(saved, ['bidCancellation', 'bid_cancellation', 'cancellationPolicy']),
      });
      setSuccess('Auction rules saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save auction rules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Auction rules" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Auction rules' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<Gavel className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save rules'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading auction rules...</div> : (
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledInput label="Minimum bid increment" value={rules.bidIncrement} onChange={(value) => setRules((prev) => ({ ...prev, bidIncrement: value }))} />
            <LabeledInput label="Auction duration" value={rules.auctionDuration} onChange={(value) => setRules((prev) => ({ ...prev, auctionDuration: value }))} />
            <LabeledInput label="Auto close" value={rules.autoClose} onChange={(value) => setRules((prev) => ({ ...prev, autoClose: value }))} />
            <LabeledInput label="Bid cancellation" value={rules.bidCancellation} onChange={(value) => setRules((prev) => ({ ...prev, bidCancellation: value }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsRegistrationFeePage() {
  const [form, setForm] = useState({
    vendor: '',
    franchise: '',
    customer: '',
    gst: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminRegistrationFeeSettings();
        if (!active) return;
        setForm({
          vendor: toSettingValue(data, ['vendorRegistrationFee', 'vendor_registration_fee', 'registrationFee', 'vendorFee']),
          franchise: toSettingValue(data, ['franchiseRegistrationFee', 'franchise_registration_fee', 'franchiseFee']),
          customer: toSettingValue(data, ['customerRegistrationFee', 'customer_registration_fee', 'customerFee']),
          gst: toSettingValue(data, ['gst', 'gstRate', 'taxRate']),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load registration fee settings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminRegistrationFeeSettings();
      const saved = await updateAdminRegistrationFeeSettings({
        ...(current || {}),
        vendorRegistrationFee: form.vendor,
        vendor_registration_fee: form.vendor,
        franchiseRegistrationFee: form.franchise,
        franchise_registration_fee: form.franchise,
        customerRegistrationFee: form.customer,
        customer_registration_fee: form.customer,
        gst: form.gst,
        gstRate: form.gst,
      });
      setForm({
        vendor: toSettingValue(saved, ['vendorRegistrationFee', 'vendor_registration_fee', 'registrationFee', 'vendorFee']),
        franchise: toSettingValue(saved, ['franchiseRegistrationFee', 'franchise_registration_fee', 'franchiseFee']),
        customer: toSettingValue(saved, ['customerRegistrationFee', 'customer_registration_fee', 'customerFee']),
        gst: toSettingValue(saved, ['gst', 'gstRate', 'taxRate']),
      });
      setSuccess('Registration fee settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save registration fee settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Registration fee" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Registration fee' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<ShieldCheck className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save fee'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading registration fee settings...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="Vendor registration fee" value={form.vendor} onChange={(value) => setForm((prev) => ({ ...prev, vendor: value }))} />
            <LabeledInput label="Franchise registration fee" value={form.franchise} onChange={(value) => setForm((prev) => ({ ...prev, franchise: value }))} />
            <LabeledInput label="Customer registration fee" value={form.customer} onChange={(value) => setForm((prev) => ({ ...prev, customer: value }))} />
            <LabeledInput label="GST" value={form.gst} onChange={(value) => setForm((prev) => ({ ...prev, gst: value }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsCommissionRulesPage() {
  const [form, setForm] = useState({
    vendorCommission: '',
    auctionCommission: '',
    minimumCommission: '',
    maximumCommission: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminCommissionRules();
        if (!active) return;
        setForm({
          vendorCommission: toCommissionValue(
            data.vendorCommissionPercent
              ?? data.vendor_commission_percent
              ?? data.vendorCommissionRate
              ?? data.vendor_commission_rate
              ?? data.vendorCommission
              ?? data.vendor_commission
          ),
          auctionCommission: toCommissionValue(
            data.auctionCommissionPercent
              ?? data.auction_commission_percent
              ?? data.auctionCommissionRate
              ?? data.auction_commission_rate
              ?? data.auctionCommission
              ?? data.auction_commission
          ),
          minimumCommission: toCommissionValue(
            data.minimumCommission
              ?? data.minimum_commission
              ?? data.minCommission
              ?? data.min_commission
          ),
          maximumCommission: toCommissionValue(
            data.maximumCommission
              ?? data.maximum_commission
              ?? data.maxCommission
              ?? data.max_commission
          ),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load commission rules');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminCommissionRules();
      const payload = {
        ...(current || {}),
        vendorCommissionPercent: form.vendorCommission,
        vendor_commission_percent: form.vendorCommission,
        auctionCommissionPercent: form.auctionCommission,
        auction_commission_percent: form.auctionCommission,
        minimumCommission: form.minimumCommission,
        minimum_commission: form.minimumCommission,
        maximumCommission: form.maximumCommission,
        maximum_commission: form.maximumCommission,
      };
      const saved = await updateAdminCommissionRules(payload);
      setForm({
        vendorCommission: toCommissionValue(
          saved.vendorCommissionPercent
            ?? saved.vendor_commission_percent
            ?? saved.vendorCommissionRate
            ?? saved.vendor_commission_rate
            ?? saved.vendorCommission
            ?? saved.vendor_commission
        ),
        auctionCommission: toCommissionValue(
          saved.auctionCommissionPercent
            ?? saved.auction_commission_percent
            ?? saved.auctionCommissionRate
            ?? saved.auction_commission_rate
            ?? saved.auctionCommission
            ?? saved.auction_commission
        ),
        minimumCommission: toCommissionValue(
          saved.minimumCommission
            ?? saved.minimum_commission
            ?? saved.minCommission
            ?? saved.min_commission
        ),
        maximumCommission: toCommissionValue(
          saved.maximumCommission
            ?? saved.maximum_commission
            ?? saved.maxCommission
            ?? saved.max_commission
        ),
      });
      setSuccess('Commission rules saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save commission rules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Commission rules" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Commission rules' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<TrendingUp className="h-4 w-4" />}>{saving ? 'Saving...' : 'Apply'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading commission rules...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="Vendor commission" value={form.vendorCommission} onChange={(value) => setForm((prev) => ({ ...prev, vendorCommission: value }))} />
            <LabeledInput label="Auction commission" value={form.auctionCommission} onChange={(value) => setForm((prev) => ({ ...prev, auctionCommission: value }))} />
            <LabeledInput label="Minimum commission" value={form.minimumCommission} onChange={(value) => setForm((prev) => ({ ...prev, minimumCommission: value }))} />
            <LabeledInput label="Maximum commission" value={form.maximumCommission} onChange={(value) => setForm((prev) => ({ ...prev, maximumCommission: value }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsPlatformChargesPage() {
  const [form, setForm] = useState({
    serviceFee: '',
    paymentProcessingFee: '',
    convenienceFee: '',
    tax: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminPlatformCharges();
        if (!active) return;
        setForm({
          serviceFee: toSettingValue(data, ['serviceFee', 'service_fee', 'serviceCharge']),
          paymentProcessingFee: toSettingValue(data, ['paymentProcessingFee', 'payment_processing_fee', 'paymentFee']),
          convenienceFee: toSettingValue(data, ['convenienceFee', 'convenience_fee']),
          tax: toSettingValue(data, ['tax', 'taxRate', 'taxPercentage']),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load platform charges');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminPlatformCharges();
      const saved = await updateAdminPlatformCharges({
        ...(current || {}),
        serviceFee: form.serviceFee,
        service_fee: form.serviceFee,
        paymentProcessingFee: form.paymentProcessingFee,
        payment_processing_fee: form.paymentProcessingFee,
        convenienceFee: form.convenienceFee,
        convenience_fee: form.convenienceFee,
        tax: form.tax,
        taxRate: form.tax,
      });
      setForm({
        serviceFee: toSettingValue(saved, ['serviceFee', 'service_fee', 'serviceCharge']),
        paymentProcessingFee: toSettingValue(saved, ['paymentProcessingFee', 'payment_processing_fee', 'paymentFee']),
        convenienceFee: toSettingValue(saved, ['convenienceFee', 'convenience_fee']),
        tax: toSettingValue(saved, ['tax', 'taxRate', 'taxPercentage']),
      });
      setSuccess('Platform charges saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save platform charges');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Platform charges" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Platform charges' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<CreditCard className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading platform charges...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="Service fee" value={form.serviceFee} onChange={(value) => setForm((prev) => ({ ...prev, serviceFee: value }))} />
            <LabeledInput label="Payment processing fee" value={form.paymentProcessingFee} onChange={(value) => setForm((prev) => ({ ...prev, paymentProcessingFee: value }))} />
            <LabeledInput label="Convenience fee" value={form.convenienceFee} onChange={(value) => setForm((prev) => ({ ...prev, convenienceFee: value }))} />
            <LabeledInput label="Tax" value={form.tax} onChange={(value) => setForm((prev) => ({ ...prev, tax: value }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsShippingRulesPage() {
  const [form, setForm] = useState({
    threshold: '',
    sla: '',
    cod: '',
    couriers: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminShippingRules();
        if (!active) return;
        setForm({
          threshold: toSettingValue(data, ['freeShippingThreshold', 'free_shipping_threshold', 'shippingThreshold']),
          sla: toSettingValue(data, ['deliverySla', 'delivery_sla', 'sla']),
          cod: toSettingValue(data, ['codAvailability', 'cod_availability', 'cod']),
          couriers: toSettingValue(data, ['courierOptions', 'courier_options', 'couriers']),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load shipping rules');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminShippingRules();
      const saved = await updateAdminShippingRules({
        ...(current || {}),
        freeShippingThreshold: form.threshold,
        free_shipping_threshold: form.threshold,
        deliverySla: form.sla,
        delivery_sla: form.sla,
        codAvailability: form.cod,
        cod_availability: form.cod,
        courierOptions: form.couriers,
        courier_options: form.couriers,
      });
      setForm({
        threshold: toSettingValue(saved, ['freeShippingThreshold', 'free_shipping_threshold', 'shippingThreshold']),
        sla: toSettingValue(saved, ['deliverySla', 'delivery_sla', 'sla']),
        cod: toSettingValue(saved, ['codAvailability', 'cod_availability', 'cod']),
        couriers: toSettingValue(saved, ['courierOptions', 'courier_options', 'couriers']),
      });
      setSuccess('Shipping rules saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save shipping rules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Shipping rules" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Shipping rules' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<Truck className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading shipping rules...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="Free shipping threshold" value={form.threshold} onChange={(value) => setForm((prev) => ({ ...prev, threshold: value }))} />
            <LabeledInput label="Delivery SLA" value={form.sla} onChange={(value) => setForm((prev) => ({ ...prev, sla: value }))} />
            <LabeledInput label="COD availability" value={form.cod} onChange={(value) => setForm((prev) => ({ ...prev, cod: value }))} />
            <LabeledInput label="Courier options" value={form.couriers} onChange={(value) => setForm((prev) => ({ ...prev, couriers: value }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsTaxPage() {
  const [form, setForm] = useState({
    gst: '',
    cgst: '',
    sgst: '',
    igst: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminTaxSettings();
        if (!active) return;
        setForm({
          gst: toSettingValue(data, ['gst', 'gstRate']),
          cgst: toSettingValue(data, ['cgst', 'cgstRate']),
          sgst: toSettingValue(data, ['sgst', 'sgstRate']),
          igst: toSettingValue(data, ['igst', 'igstRate']),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load tax settings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminTaxSettings();
      const saved = await updateAdminTaxSettings({
        ...(current || {}),
        gst: form.gst,
        gstRate: form.gst,
        cgst: form.cgst,
        cgstRate: form.cgst,
        sgst: form.sgst,
        sgstRate: form.sgst,
        igst: form.igst,
        igstRate: form.igst,
      });
      setForm({
        gst: toSettingValue(saved, ['gst', 'gstRate']),
        cgst: toSettingValue(saved, ['cgst', 'cgstRate']),
        sgst: toSettingValue(saved, ['sgst', 'sgstRate']),
        igst: toSettingValue(saved, ['igst', 'igstRate']),
      });
      setSuccess('Tax settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save tax settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Tax settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Tax' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<FileText className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading tax settings...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="GST" value={form.gst} onChange={(value) => setForm((prev) => ({ ...prev, gst: value }))} />
            <LabeledInput label="CGST" value={form.cgst} onChange={(value) => setForm((prev) => ({ ...prev, cgst: value }))} />
            <LabeledInput label="SGST" value={form.sgst} onChange={(value) => setForm((prev) => ({ ...prev, sgst: value }))} />
            <LabeledInput label="IGST" value={form.igst} onChange={(value) => setForm((prev) => ({ ...prev, igst: value }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsEmailPage() {
  const [form, setForm] = useState({
    smtpHost: '',
    smtpPort: '',
    senderName: '',
    senderEmail: '',
    enabled: 'true',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminEmailSettings();
        if (!active) return;
        setForm({
          smtpHost: data.smtpHost || '',
          smtpPort: String(data.smtpPort ?? ''),
          senderName: data.senderName || '',
          senderEmail: data.senderEmail || '',
          enabled: data.enabled ? 'true' : 'false',
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load email settings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = {
        smtpHost: form.smtpHost,
        smtpPort: Number(form.smtpPort) || 0,
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        enabled: form.enabled === 'true',
      };
      const saved = await updateAdminEmailSettings(payload);
      setForm({
        smtpHost: saved.smtpHost || '',
        smtpPort: String(saved.smtpPort ?? ''),
        senderName: saved.senderName || '',
        senderEmail: saved.senderEmail || '',
        enabled: saved.enabled ? 'true' : 'false',
      });
      setSuccess('Email settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Email settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Email' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<MessageSquare className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading email settings...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="SMTP host" value={form.smtpHost} onChange={(value) => setForm((prev) => ({ ...prev, smtpHost: value }))} />
            <LabeledInput label="Port" value={form.smtpPort} onChange={(value) => setForm((prev) => ({ ...prev, smtpPort: value }))} />
            <LabeledInput label="Sender name" value={form.senderName} onChange={(value) => setForm((prev) => ({ ...prev, senderName: value }))} />
            <LabeledInput label="Sender email" value={form.senderEmail} onChange={(value) => setForm((prev) => ({ ...prev, senderEmail: value }))} type="email" />
            <ToggleSwitch label="Email status" enabled={form.enabled === 'true'} onChange={(value) => setForm((prev) => ({ ...prev, enabled: value ? 'true' : 'false' }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsSmsPage() {
  const [form, setForm] = useState({
    provider: '',
    senderId: '',
    otpLength: '',
    enabled: 'true',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminSmsSettings();
        if (!active) return;
        setForm({
          provider: data.provider || '',
          senderId: data.senderId || '',
          otpLength: String(data.otpLength ?? ''),
          enabled: data.enabled ? 'true' : 'false',
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load SMS settings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = {
        provider: form.provider,
        senderId: form.senderId,
        otpLength: Number(form.otpLength) || 0,
        enabled: form.enabled === 'true',
      };
      const saved = await updateAdminSmsSettings(payload);
      setForm({
        provider: saved.provider || '',
        senderId: saved.senderId || '',
        otpLength: String(saved.otpLength ?? ''),
        enabled: saved.enabled ? 'true' : 'false',
      });
      setSuccess('SMS settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save SMS settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="SMS settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'SMS' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<MessageSquare className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading SMS settings...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="Provider" value={form.provider} onChange={(value) => setForm((prev) => ({ ...prev, provider: value }))} />
            <LabeledInput label="Sender ID" value={form.senderId} onChange={(value) => setForm((prev) => ({ ...prev, senderId: value }))} />
            <LabeledInput label="OTP length" value={form.otpLength} onChange={(value) => setForm((prev) => ({ ...prev, otpLength: value }))} />
            <ToggleSwitch label="SMS status" enabled={form.enabled === 'true'} onChange={(value) => setForm((prev) => ({ ...prev, enabled: value ? 'true' : 'false' }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsNotificationTemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminNotificationTemplates();
      setTemplates(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load notification templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleCreateTemplate = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const next = await createAdminNotificationTemplate({
        name: 'New Template',
        type: 'Email',
        status: 'Draft',
      });
      setTemplates((prev) => [next, ...prev]);
      setSuccess('Template created successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number | string) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await deleteAdminNotificationTemplate(id);
      setTemplates((prev) => prev.filter((template) => template.id !== id));
      setSuccess('Template deleted successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to delete template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Notification templates" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Notification templates' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleCreateTemplate} disabled={saving || loading} icon={<Megaphone className="h-4 w-4" />}>{saving ? 'Saving...' : 'Add template'}</PrimaryButton>}>
      <Card className="p-4">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading templates...</div> : (
          <Table columns={[
            { key: 'name', label: 'Template' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status', render: (row: any) => <Badge className={row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}>{row.status}</Badge> },
            { key: 'actions', label: 'Actions', render: (row: any) => <button onClick={() => handleDeleteTemplate(row.id)} className="rounded-full bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200">Delete</button> },
          ]} data={templates} className="p-0" />
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsSecurityPage() {
  const [form, setForm] = useState({
    passwordPolicy: '',
    sessionTimeout: '',
    loginAttempts: '',
    twoFactorAuth: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminSecuritySettings();
        if (!active) return;
        setForm({
          passwordPolicy: toSettingValue(data, ['passwordPolicy', 'password_policy']),
          sessionTimeout: toSettingValue(data, ['sessionTimeout', 'session_timeout']),
          loginAttempts: toSettingValue(data, ['loginAttempts', 'login_attempts']),
          twoFactorAuth: toSettingValue(data, ['twoFactorAuth', 'two_factor_auth', '2fa']),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load security settings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminSecuritySettings();
      const saved = await updateAdminSecuritySettings({
        ...(current || {}),
        passwordPolicy: form.passwordPolicy,
        password_policy: form.passwordPolicy,
        sessionTimeout: form.sessionTimeout,
        session_timeout: form.sessionTimeout,
        loginAttempts: form.loginAttempts,
        login_attempts: form.loginAttempts,
        twoFactorAuth: form.twoFactorAuth,
        two_factor_auth: form.twoFactorAuth,
      });
      setForm({
        passwordPolicy: toSettingValue(saved, ['passwordPolicy', 'password_policy']),
        sessionTimeout: toSettingValue(saved, ['sessionTimeout', 'session_timeout']),
        loginAttempts: toSettingValue(saved, ['loginAttempts', 'login_attempts']),
        twoFactorAuth: toSettingValue(saved, ['twoFactorAuth', 'two_factor_auth', '2fa']),
      });
      setSuccess('Security settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Security settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Security' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<ShieldCheck className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading security settings...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="Password policy" value={form.passwordPolicy} onChange={(value) => setForm((prev) => ({ ...prev, passwordPolicy: value }))} />
            <LabeledInput label="Session timeout" value={form.sessionTimeout} onChange={(value) => setForm((prev) => ({ ...prev, sessionTimeout: value }))} />
            <LabeledInput label="Login attempts" value={form.loginAttempts} onChange={(value) => setForm((prev) => ({ ...prev, loginAttempts: value }))} />
            <LabeledInput label="2FA" value={form.twoFactorAuth} onChange={(value) => setForm((prev) => ({ ...prev, twoFactorAuth: value }))} />
          </div>
        )}
      </Card>
    </AdminShell>
  );
}

export function SettingsLocalizationPage() {
  const [form, setForm] = useState({
    language: '',
    currency: '',
    timezone: '',
    dateFormat: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminLocalizationSettings();
        if (!active) return;
        setForm({
          language: toSettingValue(data, ['language', 'defaultLanguage']),
          currency: toSettingValue(data, ['currency', 'defaultCurrency']),
          timezone: toSettingValue(data, ['timezone', 'timeZone']),
          dateFormat: toSettingValue(data, ['dateFormat', 'date_format']),
        });
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load localization settings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const current = await getAdminLocalizationSettings();
      const saved = await updateAdminLocalizationSettings({
        ...(current || {}),
        language: form.language,
        defaultLanguage: form.language,
        currency: form.currency,
        defaultCurrency: form.currency,
        timezone: form.timezone,
        timeZone: form.timezone,
        dateFormat: form.dateFormat,
        date_format: form.dateFormat,
      });
      setForm({
        language: toSettingValue(saved, ['language', 'defaultLanguage']),
        currency: toSettingValue(saved, ['currency', 'defaultCurrency']),
        timezone: toSettingValue(saved, ['timezone', 'timeZone']),
        dateFormat: toSettingValue(saved, ['dateFormat', 'date_format']),
      });
      setSuccess('Localization settings saved successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save localization settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle="Localization" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings', to: '/admin/settings' }, { label: 'Localization' }]} activePath="/admin/settings" actions={<PrimaryButton onClick={handleSave} disabled={saving || loading} icon={<Globe className="h-4 w-4" />}>{saving ? 'Saving...' : 'Save'}</PrimaryButton>}>
      <Card className="p-6">
        {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}
        {loading ? <div className="text-sm text-slate-400">Loading localization settings...</div> : (
          <div className="grid gap-5 md:grid-cols-2">
            <LabeledInput label="Language" value={form.language} onChange={(value) => setForm((prev) => ({ ...prev, language: value }))} />
            <LabeledInput label="Currency" value={form.currency} onChange={(value) => setForm((prev) => ({ ...prev, currency: value }))} />
            <LabeledInput label="Timezone" value={form.timezone} onChange={(value) => setForm((prev) => ({ ...prev, timezone: value }))} />
            <LabeledInput label="Date format" value={form.dateFormat} onChange={(value) => setForm((prev) => ({ ...prev, dateFormat: value }))} />
          </div>
        )}
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
