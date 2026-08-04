import { useMemo } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, CreditCard, Download, FileText, Filter, Gavel, LayoutGrid, Megaphone, MessageSquare, Plus, Search, Settings2, ShieldCheck, Store, TrendingUp, Truck, Users, Wallet2 } from 'lucide-react';
import { AdminShell } from '../../components/admin/AdminShell';
import { Card } from '../../components/common/Card';
import { Badge, PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { Table } from '../../components/common/Table';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { adminStats, chartSeries, franchiseDashboardKpis, rolePermissions } from '../../data/mockData';

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

const approvalRows = [
  { name: 'Nova Tech', type: 'Vendor', submitted: '2h ago', risk: 'Medium' },
  { name: 'West Coast Franchise', type: 'Franchise', submitted: '3h ago', risk: 'High' },
  { name: 'Apex Motors', type: 'Product', submitted: '5h ago', risk: 'Low' },
  { name: 'Blue Leaf Auction', type: 'Auction', submitted: '6h ago', risk: 'Medium' },
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
  return (
    <AdminShell title="Enterprise admin" subtitle="Approval Center" breadcrumbs={[{ label: 'Admin' }, { label: 'Approvals' }]} activePath="/admin/approvals" actions={<PrimaryButton icon={<ShieldCheck className="h-4 w-4" />}>Bulk approve</PrimaryButton>}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Pending review</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Requests awaiting decision</h3>
            </div>
            <Badge className="bg-amber-500/10 text-amber-200">4 objects</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {approvalRows.map((row) => (
              <div key={row.name} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{row.name}</p>
                    <p className="text-sm text-slate-400">{row.type} • {row.submitted}</p>
                  </div>
                  <Badge>{row.risk}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <PrimaryButton>Approve</PrimaryButton>
                  <SecondaryButton>Reject</SecondaryButton>
                  <SecondaryButton>Request changes</SecondaryButton>
                </div>
              </div>
            ))}
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
  return (
    <AdminShell title="Enterprise admin" subtitle="System Settings" breadcrumbs={[{ label: 'Admin' }, { label: 'Settings' }]} activePath="/admin/settings" actions={<PrimaryButton icon={<Settings2 className="h-4 w-4" />}>Save changes</PrimaryButton>}>
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          ['General', 'Platform name, locale, timezone and support contact.'],
          ['Auction Rules', 'Bid increments, reserve pricing and close policies.'],
          ['Registration Fee', 'Vendor and franchise onboarding charges.'],
          ['Commission Rules', 'Marketplace commission tiers and schedules.'],
          ['Platform Charges', 'Service fees and payment processing rules.'],
          ['Shipping Rules', 'Courier partners, SLA and delivery options.'],
          ['Tax', 'GST and regional tax configuration.'],
          ['Email', 'SMTP, sender identity and transactional templates.'],
          ['SMS', 'SMS gateway and trust messaging settings.'],
          ['Notification Templates', 'In-app, email and alert message patterns.'],
        ].map(([title, body]) => (
          <Card key={title} className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">{title}</p>
            <p className="mt-3 text-sm text-slate-400">{body}</p>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}

export function CMSPage() {
  return (
    <AdminShell title="Enterprise admin" subtitle="CMS" breadcrumbs={[{ label: 'Admin' }, { label: 'CMS' }]} activePath="/admin/cms" actions={<PrimaryButton icon={<Megaphone className="h-4 w-4" />}>Publish</PrimaryButton>}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {['Homepage Banners', 'Categories', 'FAQ', 'Blog', 'Testimonials', 'Newsletter', 'Static Pages'].map((item) => (
          <Card key={item} className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">{item}</p>
            <p className="mt-3 text-sm text-slate-400">Mock content module ready for future content workflows.</p>
          </Card>
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
