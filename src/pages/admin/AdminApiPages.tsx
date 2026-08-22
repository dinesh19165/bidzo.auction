import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminShell } from '../../components/admin/AdminShell';
import { Card } from '../../components/common/Card';
import { PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { EmptyState, ErrorState, SkeletonTable } from '../../components/loading/LoadingComponents';
import DeliveryAddressViewer from '../../components/orders/DeliveryAddressViewer';
import {
  getAdminAuction, getAdminAuctionsPaginated, getAdminAuctionsByStatus, searchAdminAuctions,
  getAdminCustomer, getAdminCustomersPaginated, getAdminCustomerOrders, getAdminCustomerBids, getAdminCustomerPayments, getAdminOrder, getAdminOrdersPaginated, getAdminOrdersByStatus, getAdminOrdersByDateRange, searchAdminOrders,
  getAdminDashboard, getAdminPayment, getAdminPaymentsPaginated, getAdminPaymentsByStatus, getAdminPaymentsByDateRange, searchAdminPayments,
  getAdminProduct, getAdminProductsPaginated, getAdminProductsByStatus, searchAdminProducts,
  getAdminUser, getAdminUsersPaginated, getAdminUsersByRole, searchAdminUsers,
  activateAdminVendor, deactivateAdminVendor, getAdminVendor, getAdminVendorsPaginated, getAdminVendorProducts, getAdminVendorAuctions, getAdminVendorOrders, getAdminAuctionBids, getAdminAuctionWinner, getAdminProductVariants, updateAdminOrderStatus, updateAdminProductStatus,
  getAdminRevenueReport, getAdminOrdersReport, getAdminAuctionsReport, getAdminUsersReport, getAdminPaymentsReport,
  type AdminPage, type AdminQuery, type AdminRecord,
} from '../../api/adminApi';

function value(record: AdminRecord, keys: string[]) {
  const found = keys.map((key) => record[key]).find((item) => item !== undefined && item !== null && item !== '');
  if (found instanceof Object) return JSON.stringify(found);
  return String(found ?? '-');
}

function titleCase(input: string) {
  if (input === 'phoneNumber') return 'Phone Number';
  return input.charAt(0).toUpperCase() + input.slice(1);
}

type Resource = 'users' | 'customers' | 'vendors' | 'orders' | 'products' | 'payments' | 'auctions';

const resourceConfig: Record<Resource, { label: string; load: (query: AdminQuery) => Promise<AdminPage>; statuses?: string[] }> = {
  users: { label: 'Users', load: getAdminUsersPaginated, statuses: ['ACTIVE', 'INACTIVE'] },
  customers: { label: 'Customers', load: getAdminCustomersPaginated, statuses: ['ACTIVE', 'INACTIVE'] },
  vendors: { label: 'Vendors', load: getAdminVendorsPaginated, statuses: ['ACTIVE', 'INACTIVE', 'PENDING'] },
  orders: { label: 'Orders', load: getAdminOrdersPaginated, statuses: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
  products: { label: 'Products', load: getAdminProductsPaginated, statuses: ['ACTIVE', 'INACTIVE', 'PENDING'] },
  payments: { label: 'Payments', load: getAdminPaymentsPaginated, statuses: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
  auctions: { label: 'Auctions', load: getAdminAuctionsPaginated, statuses: ['LIVE', 'UPCOMING', 'COMPLETED', 'PENDING'] },
};

export function AdminResourcePage({ resource }: { resource: Resource }) {
  const config = resourceConfig[resource];
  const [result, setResult] = useState<AdminPage>({ items: [], page: 0, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingVendorId, setProcessingVendorId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = startDate && endDate && resource === 'orders'
        ? await getAdminOrdersByDateRange(startDate, endDate)
        : startDate && endDate && resource === 'payments'
          ? await getAdminPaymentsByDateRange(startDate, endDate)
          : status
        ? await (resource === 'orders' ? getAdminOrdersByStatus(status) : resource === 'products' ? getAdminProductsByStatus(status) : resource === 'auctions' ? getAdminAuctionsByStatus(status) : resource === 'payments' ? getAdminPaymentsByStatus(status) : config.load({ page, pageSize: 10, status }))
        : search
          ? await (resource === 'users' ? searchAdminUsers(search) : resource === 'orders' ? searchAdminOrders(search) : resource === 'products' ? searchAdminProducts(search) : resource === 'auctions' ? searchAdminAuctions(search) : resource === 'payments' ? searchAdminPayments(search) : config.load({ page, pageSize: 10, search }))
          : await config.load({ page, pageSize: 10 });
      setResult(Array.isArray(next) ? { items: next, page: 0, pageSize: 10, total: next.length } : next);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to load ${config.label.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [resource, page, status]);

  const first = result.items[0] || {};
  const columns = resource === 'vendors'
    ? ['username', 'email', 'phoneNumber', 'businessName', 'status', 'action']
    : resource === 'orders'
      ? ['id', 'orderDate', 'orderNumber', 'orderStatus', 'totalAmount', 'deliveryAddress']
    : Object.keys(first).filter((key) => !['description', 'updatedAt', 'createdAt', 'items'].includes(key)).slice(0, 5);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  const updateVendorStatus = async (vendor: AdminRecord) => {
    const userId = vendor.userId;
    if ((typeof userId !== 'string' && typeof userId !== 'number') || processingVendorId !== null) return;
    const isActive = vendor.active === true;
    if (!isActive || window.confirm('Are you sure you want to deactivate this vendor?')) {
      setProcessingVendorId(userId);
      setError(null);
      try {
        if (isActive) await deactivateAdminVendor(userId);
        else await activateAdminVendor(userId);
        setMessage(`Vendor ${isActive ? 'deactivated' : 'activated'} successfully.`);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to update vendor status.');
      } finally {
        setProcessingVendorId(null);
      }
    }
  };

  return (
    <AdminShell title="Enterprise admin" subtitle={`${config.label} management`} breadcrumbs={[{ label: 'Admin' }, { label: config.label }]} activePath={`/admin/${resource}`}>
      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
          <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { setPage(0); load(); } }} placeholder={`Search ${config.label.toLowerCase()}...`} className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />
          {config.statuses ? <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"><option value="">All statuses</option>{config.statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select> : null}
          {(resource === 'orders' || resource === 'payments') ? <><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white" /><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white" /></> : null}
          <PrimaryButton onClick={load}>Refresh</PrimaryButton>
        </div>
        {message ? <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}
        {error ? <ErrorState title={`Unable to load ${config.label.toLowerCase()}`} description={error} /> : loading ? <SkeletonTable /> : result.items.length === 0 ? <EmptyState title={`No ${config.label.toLowerCase()} found`} description="There are no records matching the current filters." /> : <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-slate-400"><tr>{columns.map((column) => <th key={column} className="px-3 py-3">{titleCase(column)}</th>)}</tr></thead><tbody className="text-slate-300">{result.items.map((item, index) => <tr key={String(item.userId ?? item.id ?? index)} className="border-t border-white/6">{columns.map((column) => <td key={column} className="px-3 py-3">{resource === 'vendors' && column === 'status' ? <span className={item.active === true ? 'text-emerald-300' : 'text-amber-300'}>{item.active === true ? 'ACTIVE' : 'DEACTIVATED'}</span> : resource === 'vendors' && column === 'action' ? <SecondaryButton disabled={processingVendorId !== null} onClick={() => updateVendorStatus(item)}>{processingVendorId === item.userId ? 'Updating...' : item.active === true ? 'Deactivate' : 'Activate'}</SecondaryButton> : resource === 'orders' && column === 'deliveryAddress' ? <DeliveryAddressViewer address={item.deliveryAddress as Record<string, unknown> | string | null | undefined} /> : value(item, [column])}</td>)}</tr>)}</tbody></table></div>}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>{result.total} total</span><div className="flex gap-2"><SecondaryButton disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>Previous</SecondaryButton><SecondaryButton disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</SecondaryButton></div></div>
      </Card>
    </AdminShell>
  );
}

const detailLoaders: Record<Resource, (id: string) => Promise<AdminRecord>> = { users: getAdminUser, customers: getAdminCustomer, vendors: getAdminVendor, orders: getAdminOrder, products: getAdminProduct, payments: getAdminPayment, auctions: getAdminAuction };

export function AdminResourceDetailPage({ resource }: { resource: Resource }) {
  const { id = '' } = useParams();
  const [record, setRecord] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [related, setRelated] = useState<Record<string, AdminRecord[]>>({});
  const load = async () => { setLoading(true); setError(null); try { setRecord(await detailLoaders[resource](id)); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load details.'); } finally { setLoading(false); } };
  useEffect(() => {
    load();
    const relationLoaders: Partial<Record<Resource, Array<[string, () => Promise<AdminRecord[]>]>>> = {
      customers: [['Orders', () => getAdminCustomerOrders(id)], ['Bids', () => getAdminCustomerBids(id)], ['Payments', () => getAdminCustomerPayments(id)]],
      vendors: [['Products', () => getAdminVendorProducts(id)], ['Auctions', () => getAdminVendorAuctions(id)], ['Orders', () => getAdminVendorOrders(id)]],
      auctions: [['Bids', () => getAdminAuctionBids(id)], ['Winner', async () => [await getAdminAuctionWinner(id)]]],
      products: [['Variants', () => getAdminProductVariants(id)]],
    };
    const loaders = relationLoaders[resource] || [];
    Promise.all(loaders.map(async ([label, loader]) => [label, await loader()] as const)).then((entries) => setRelated(Object.fromEntries(entries))).catch(() => setRelated({}));
  }, [id, resource]);
  const updateStatus = async () => { if (!status) return; try { if (resource === 'orders') { await updateAdminOrderStatus(id, status); } else if (resource === 'products') { await updateAdminProductStatus(id, status); } setMessage('Status updated successfully.'); await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update status.'); } };
  return <AdminShell title="Enterprise admin" subtitle={`${titleCase(resource)} details`} breadcrumbs={[{ label: 'Admin' }, { label: titleCase(resource), to: `/admin/${resource}` }, { label: 'Details' }]} activePath={`/admin/${resource}`}><Card className="p-6">{message ? <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}{error ? <ErrorState title="Unable to load details" description={error} /> : loading ? <SkeletonTable /> : record ? <div className="space-y-3 text-sm text-slate-300">{Object.entries(record).filter(([, item]) => typeof item !== 'object').map(([key, item]) => <div key={key} className="flex justify-between gap-4 border-b border-white/6 py-3"><span className="text-slate-400">{titleCase(key)}</span><span className="text-right text-white">{String(item ?? '-')}</span></div>)}{Object.entries(related).map(([label, items]) => <div key={label} className="border-t border-white/10 pt-4"><p className="font-semibold text-white">{label} ({items.length})</p>{items.slice(0, 5).map((item, index) => <p key={String(item.id ?? index)} className="mt-2 text-slate-400">{value(item, ['name', 'title', 'orderNumber', 'amount', 'status', 'id'])}</p>)}</div>)}{(resource === 'orders' || resource === 'products') ? <div className="flex gap-3 pt-3"><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-white"><option value="">Update status</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="PROCESSING">PROCESSING</option><option value="SHIPPED">SHIPPED</option><option value="DELIVERED">DELIVERED</option><option value="CANCELLED">CANCELLED</option></select><PrimaryButton onClick={updateStatus}>Save status</PrimaryButton></div> : null}</div> : <EmptyState title="Record not found" description="The requested record is unavailable." />}</Card></AdminShell>;
}

export function AdminDashboardApiPage() {
  const [data, setData] = useState<AdminRecord | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { getAdminDashboard().then(setData).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard.')).finally(() => setLoading(false)); }, []);
  return <AdminShell title="Enterprise admin" subtitle="Admin dashboard" breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]} activePath="/admin/dashboard"><Card className="p-6">{error ? <ErrorState title="Unable to load dashboard" description={error} /> : loading ? <SkeletonTable /> : data ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Object.entries(data).filter(([, item]) => typeof item !== 'object').map(([key, item]) => <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">{titleCase(key)}</p><p className="mt-2 text-2xl font-semibold text-white">{String(item ?? '-')}</p></div>)}</div> : <EmptyState title="No dashboard data" description="The backend returned no dashboard metrics." />}</Card></AdminShell>;
}

export function AdminReportApiPage({ report }: { report: 'revenue' | 'orders' | 'auctions' | 'users' | 'payments' }) {
  const loaders = { revenue: getAdminRevenueReport, orders: getAdminOrdersReport, auctions: getAdminAuctionsReport, users: getAdminUsersReport, payments: getAdminPaymentsReport };
  const [data, setData] = useState<AdminRecord | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { loaders[report]().then(setData).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load report.')).finally(() => setLoading(false)); }, [report]);
  return <AdminShell title="Enterprise admin" subtitle={`${titleCase(report)} report`} breadcrumbs={[{ label: 'Admin' }, { label: 'Reports', to: '/admin/reports' }, { label: titleCase(report) }]} activePath="/admin/reports"><Card className="p-6">{error ? <ErrorState title="Unable to load report" description={error} /> : loading ? <SkeletonTable /> : data ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Object.entries(data).filter(([, item]) => typeof item !== 'object').map(([key, item]) => <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-400">{titleCase(key)}</p><p className="mt-2 text-xl font-semibold text-white">{String(item ?? '-')}</p></div>)}</div> : <EmptyState title="No report data" description="The backend returned no report data." />}</Card></AdminShell>;
}
