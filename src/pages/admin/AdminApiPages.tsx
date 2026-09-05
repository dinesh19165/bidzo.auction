import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminShell } from '../../components/admin/AdminShell';
import { Card } from '../../components/common/Card';
import { PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { EmptyState, ErrorState, SkeletonTable } from '../../components/loading/LoadingComponents';
import DeliveryAddressViewer from '../../components/orders/DeliveryAddressViewer';
import { ApiError } from '../../api/apiClient';
import { formatOrderNumber, getOrderCustomer, getOrderProductName, getOrderStatus, getOrderTotal, getOrderType, getOrderVendor } from '../../utils/orderDisplay';
import {
  getAdminAuction, getAdminAuctionsPaginated, getAdminAuctionsByStatus, searchAdminAuctions,
  getAdminCustomer, getAdminCustomersPaginated, getAdminCustomerOrders, getAdminCustomerBids, getAdminCustomerPayments, activateAdminCustomer, deactivateAdminCustomer, getAdminOrder, getAdminOrders, getAdminOrdersPaginated, getAdminOrdersByStatus, getAdminOrdersByDateRange, searchAdminOrders,
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
  orders: { label: 'Orders', load: getAdminOrdersPaginated, statuses: ['CONFIRMED', 'PACKING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
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
  const [processingOrderId, setProcessingOrderId] = useState<string | number | null>(null);

  const orderDateError = resource === 'orders' && startDate && endDate && startDate > endDate ? 'Date From must be on or before Date To.' : null;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = String(resource) === 'orders'
        ? await getAdminOrders()
        : String(resource) === 'customers'
          ? await getAdminCustomersPaginated({ page, pageSize: 10, search, active: status === 'ACTIVE' ? true : status === 'INACTIVE' ? false : undefined })
        : startDate && endDate && resource === 'orders'
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

  useEffect(() => { load(); }, [resource, page, status, search]);

  const visibleItems = useMemo(() => {
    if (String(resource) !== 'orders') return result.items;
    const query = search.trim().toLowerCase();
    const from = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const to = endDate ? new Date(`${endDate}T00:00:00`).getTime() + 24 * 60 * 60 * 1000 : null;
    const filtered = orderDateError ? [] : result.items.filter((item) => {
      const searchable = [item.id, item.orderNumber, item.customerName, item.customer, item.userName, item.userEmail, item.customerEmail, item.orderStatus, item.status]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => typeof value === 'object' ? JSON.stringify(value) : String(value))
        .join(' ')
        .toLowerCase();
      if (query && !searchable.includes(query)) return false;
      const itemStatus = String(item.orderStatus ?? item.status ?? '').toLowerCase();
      if (status && itemStatus !== status.toLowerCase()) return false;
      const orderTime = new Date(String(item.orderDate ?? item.createdAt ?? '')).getTime();
      if (from !== null && (!Number.isFinite(orderTime) || orderTime < from)) return false;
      if (to !== null && (!Number.isFinite(orderTime) || orderTime >= to)) return false;
      return true;
    });
    return filtered.sort((firstOrder, secondOrder) => new Date(String(secondOrder.orderDate ?? secondOrder.createdAt ?? '')).getTime() - new Date(String(firstOrder.orderDate ?? firstOrder.createdAt ?? '')).getTime());
  }, [endDate, orderDateError, result.items, resource, search, startDate, status]);

  const pagedItems = String(resource) === 'orders' ? visibleItems.slice(page * result.pageSize, (page + 1) * result.pageSize) : result.items;
  const displayedTotal = String(resource) === 'orders' ? visibleItems.length : result.total;
  const displayedTotalPages = Math.max(1, Math.ceil(displayedTotal / result.pageSize));

  useEffect(() => {
    if (resource === 'orders' && page >= displayedTotalPages) setPage(Math.max(0, displayedTotalPages - 1));
  }, [displayedTotalPages, page, resource]);

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

  const nextOrderStatus = (currentStatus: unknown) => {
    const nextStatuses = ['CONFIRMED', 'PACKING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const index = nextStatuses.indexOf(String(currentStatus ?? '').toUpperCase());
    return index >= 0 && index < nextStatuses.length - 1 ? nextStatuses[index + 1] : null;
  };

  const updateOrderStatus = async (order: AdminRecord) => {
    const id = order.id;
    const nextStatus = nextOrderStatus(order.orderStatus ?? order.status);
    if ((typeof id !== 'string' && typeof id !== 'number') || !nextStatus || processingOrderId !== null) return;
    setProcessingOrderId(id);
    setError(null);
    setMessage(null);
    try {
      await updateAdminOrderStatus(id, nextStatus);
      setResult((current) => ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, orderStatus: nextStatus } : item) }));
      setMessage(`Order status updated to ${nextStatus}.`);
    } catch (err) {
      const statusMessage = err instanceof ApiError
        ? err.status === 400 ? 'This order status transition is not valid.' : err.status === 403 ? "You don't have permission to update order statuses." : err.status >= 500 ? 'The server could not update this order. Please try again.' : err.message
        : err instanceof Error ? err.message : 'Unable to update order status.';
      setError(statusMessage);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const clearOrderFilters = () => {
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const clearCustomerFilters = () => {
    setSearch('');
    setStatus('');
    setPage(0);
  };

  if (String(resource) === 'orders') {
    return (
      <AdminShell title="Enterprise admin" subtitle="Orders management" breadcrumbs={[{ label: 'Admin' }, { label: 'Orders' }]} activePath="/admin/orders">
        <Card className="p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search orders..." className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"><option value="">All statuses</option>{config.statuses?.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white" />
            <input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white" />
            <PrimaryButton onClick={load}>Refresh</PrimaryButton>
            <SecondaryButton onClick={clearOrderFilters}>Clear All</SecondaryButton>
          </div>
          {orderDateError ? <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{orderDateError}</div> : null}
          {error ? <ErrorState title="Unable to load orders" description={error} /> : loading ? <SkeletonTable /> : pagedItems.length === 0 ? <EmptyState title="No orders found" description="There are no records matching the current filters." /> : <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="text-slate-400"><tr>{['productName', 'orderNumber', 'orderType', 'vendor', 'customer', 'orderStatus', 'totalAmount', 'deliveryAddress'].map((column) => <th key={column} className="px-3 py-3">{titleCase(column)}</th>)}<th className="px-3 py-3">Next Status</th></tr></thead><tbody className="text-slate-300">{pagedItems.map((item, index) => <tr key={String(item.id ?? index)} className="border-t border-white/6">{[getOrderProductName(item), formatOrderNumber(item), getOrderType(item), getOrderVendor(item), getOrderCustomer(item), getOrderStatus(item), getOrderTotal(item)].map((display, displayIndex) => <td key={displayIndex} className="px-3 py-3">{displayIndex === 5 ? <span className="font-medium text-cyan-200">{display}</span> : display}</td>)}<td className="px-3 py-3"><DeliveryAddressViewer address={item.deliveryAddress as Record<string, unknown> | string | null | undefined} /></td><td className="px-3 py-3">{nextOrderStatus(item.orderStatus ?? item.status) ? <SecondaryButton disabled={processingOrderId !== null} onClick={() => updateOrderStatus(item)}>{processingOrderId === item.id ? 'Updating...' : `Move to ${nextOrderStatus(item.orderStatus ?? item.status)}`}</SecondaryButton> : <span className="text-slate-500">No further transition</span>}</td></tr>)}</tbody></table></div>}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>{displayedTotal} total</span><div className="flex gap-2"><SecondaryButton disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>Previous</SecondaryButton><SecondaryButton disabled={page + 1 >= displayedTotalPages} onClick={() => setPage((current) => current + 1)}>Next</SecondaryButton></div></div>
        </Card>
      </AdminShell>
    );
  }

  if (String(resource) === 'customers') {
    const customerId = (customer: AdminRecord): string | number | undefined => {
      const id = customer.userId ?? customer.id;
      return typeof id === 'string' || typeof id === 'number' ? id : undefined;
    };
    const isCustomerActive = (customer: AdminRecord) => customer.active === true || customer.isActive === true || String(customer.status ?? '').toUpperCase() === 'ACTIVE';
    const customerPageCount = Math.max(1, Math.ceil(result.total / result.pageSize));
    return (
      <AdminShell title="Enterprise admin" subtitle="Customers management" breadcrumbs={[{ label: 'Admin' }, { label: 'Customers' }]} activePath="/admin/customers">
        <Card className="p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search customers..." className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"><option value="">All customers</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
            <PrimaryButton onClick={load}>Refresh</PrimaryButton>
            <SecondaryButton onClick={clearCustomerFilters}>Clear All</SecondaryButton>
          </div>
          {message ? <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}
          {error ? <ErrorState title="Unable to load customers" description={error} /> : loading ? <SkeletonTable /> : result.items.length === 0 ? <EmptyState title="No customers found" description="There are no customers matching the current filters." /> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-slate-400"><tr>{['name', 'username', 'email', 'phone', 'status', 'registration'].map((column) => <th key={column} className="px-3 py-3">{titleCase(column)}</th>)}<th className="px-3 py-3">Actions</th></tr></thead><tbody className="text-slate-300">{result.items.map((customer, index) => { const id = customerId(customer); const active = isCustomerActive(customer); return <tr key={String(id ?? index)} className="border-t border-white/6"><td className="px-3 py-3 text-white">{String(customer.name ?? customer.fullName ?? '-')}</td><td className="px-3 py-3">{String(customer.username ?? '-')}</td><td className="px-3 py-3">{String(customer.email ?? '-')}</td><td className="px-3 py-3">{String(customer.phone ?? customer.phoneNumber ?? '-')}</td><td className="px-3 py-3"><span className={active ? 'text-emerald-300' : 'text-amber-300'}>{active ? 'ACTIVE' : 'INACTIVE'}</span></td><td className="px-3 py-3">{String(customer.createdAt ?? customer.registrationDate ?? customer.registeredAt ?? '-')}</td><td className="flex gap-2 px-3 py-3"><SecondaryButton disabled={id === undefined || processingVendorId !== null} onClick={() => { if (id === undefined) return; setProcessingVendorId(id); setError(null); (active ? deactivateAdminCustomer(id) : activateAdminCustomer(id)).then(() => { setMessage(`Customer ${active ? 'deactivated' : 'activated'} successfully.`); return load(); }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to update customer status.')).finally(() => setProcessingVendorId(null)); }}>{processingVendorId === id ? 'Updating...' : active ? 'Deactivate' : 'Activate'}</SecondaryButton>{id !== undefined ? <Link to={`/admin/customers/${id}`} className="inline-flex items-center rounded-full border border-blue-400/30 px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/10">View Details</Link> : null}</td></tr>; })}</tbody></table></div>}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>{result.total} total</span><div className="flex gap-2"><SecondaryButton disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>Previous</SecondaryButton><SecondaryButton disabled={page + 1 >= customerPageCount} onClick={() => setPage((current) => current + 1)}>Next</SecondaryButton></div></div>
        </Card>
      </AdminShell>
    );
  }

  if (String(resource) === 'auctions') {
    const customerInfo = (auction: AdminRecord) => {
      const nested = (auction.customer ?? auction.winner ?? auction.customerDetails) as Record<string, unknown> | undefined;
      const id = auction.customerId ?? auction.userId ?? nested?.id ?? nested?.userId;
      const customerId = typeof id === 'string' || typeof id === 'number' ? id : undefined;
      const name = auction.customerName ?? auction.customer ?? nested?.name ?? nested?.fullName ?? nested?.username;
      const email = auction.customerEmail ?? nested?.email;
      const label = [name, email].filter((value) => typeof value === 'string' && value.trim()).join(' / ') || 'N/A';
      return { customerId, label };
    };
    const auctionPageCount = Math.max(1, Math.ceil(result.total / result.pageSize));
    return (
      <AdminShell title="Enterprise admin" subtitle="Auctions management" breadcrumbs={[{ label: 'Admin' }, { label: 'Auctions' }]} activePath="/admin/auctions">
        <Card className="p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} onKeyDown={(event) => { if (event.key === 'Enter') { setPage(0); load(); } }} placeholder="Search auctions..." className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"><option value="">All statuses</option>{config.statuses?.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <PrimaryButton onClick={load}>Refresh</PrimaryButton>
          </div>
          {error ? <ErrorState title="Unable to load auctions" description={error} /> : loading ? <SkeletonTable /> : result.items.length === 0 ? <EmptyState title="No auctions found" description="There are no auctions matching the current filters." /> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-slate-400"><tr>{['id', 'title', 'status'].map((column) => <th key={column} className="px-3 py-3">{titleCase(column)}</th>)}<th className="px-3 py-3">Customer</th><th className="px-3 py-3">Actions</th></tr></thead><tbody className="text-slate-300">{result.items.map((auction, index) => { const customer = customerInfo(auction); return <tr key={String(auction.id ?? index)} className="border-t border-white/6"><td className="px-3 py-3">{value(auction, ['id'])}</td><td className="px-3 py-3 text-white">{value(auction, ['title', 'name'])}</td><td className="px-3 py-3"><span className="font-medium text-cyan-200">{value(auction, ['status', 'auctionStatus'])}</span></td><td className="px-3 py-3">{customer.label}</td><td className="px-3 py-3">{customer.customerId !== undefined ? <Link to={`/admin/customers/${customer.customerId}`} className="inline-flex items-center rounded-full border border-blue-400/30 px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/10">View Customer Details</Link> : <span className="text-slate-500">N/A</span>}</td></tr>; })}</tbody></table></div>}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>{result.total} total</span><div className="flex gap-2"><SecondaryButton disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>Previous</SecondaryButton><SecondaryButton disabled={page + 1 >= auctionPageCount} onClick={() => setPage((current) => current + 1)}>Next</SecondaryButton></div></div>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Enterprise admin" subtitle={`${config.label} management`} breadcrumbs={[{ label: 'Admin' }, { label: config.label }]} activePath={`/admin/${resource}`}>
      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
          <input value={search} onChange={(event) => { setSearch(event.target.value); if (resource === 'orders') setPage(0); }} onKeyDown={(event) => { if (event.key === 'Enter') { setPage(0); load(); } }} placeholder={`Search ${config.label.toLowerCase()}...`} className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />
          {config.statuses ? <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"><option value="">All statuses</option>{config.statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select> : null}
          {(resource === 'orders' || resource === 'payments') ? <><input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); if (resource === 'orders') setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white" /><input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); if (resource === 'orders') setPage(0); }} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white" /></> : null}
          <PrimaryButton onClick={load}>Refresh</PrimaryButton>
        </div>
        {message ? <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}
        {error ? <ErrorState title={`Unable to load ${config.label.toLowerCase()}`} description={error} /> : loading ? <SkeletonTable /> : result.items.length === 0 ? <EmptyState title={`No ${config.label.toLowerCase()} found`} description="There are no records matching the current filters." /> : <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-slate-400"><tr>{columns.map((column) => <th key={column} className="px-3 py-3">{titleCase(column)}</th>)}{resource === 'orders' ? <th className="px-3 py-3">Next Status</th> : null}</tr></thead><tbody className="text-slate-300">{result.items.map((item, index) => <tr key={String(item.userId ?? item.id ?? index)} className="border-t border-white/6">{columns.map((column) => <td key={column} className="px-3 py-3">{resource === 'vendors' && column === 'status' ? <span className={item.active === true ? 'text-emerald-300' : 'text-amber-300'}>{item.active === true ? 'ACTIVE' : 'DEACTIVATED'}</span> : resource === 'vendors' && column === 'action' ? <SecondaryButton disabled={processingVendorId !== null} onClick={() => updateVendorStatus(item)}>{processingVendorId === item.userId ? 'Updating...' : item.active === true ? 'Deactivate' : 'Activate'}</SecondaryButton> : resource === 'orders' && column === 'orderStatus' ? <span className="font-medium text-cyan-200">{value(item, [column])}</span> : resource === 'orders' && column === 'deliveryAddress' ? <DeliveryAddressViewer address={item.deliveryAddress as Record<string, unknown> | string | null | undefined} /> : value(item, [column])}</td>)}{resource === 'orders' ? <td className="px-3 py-3">{nextOrderStatus(item.orderStatus ?? item.status) ? <SecondaryButton disabled={processingOrderId !== null} onClick={() => updateOrderStatus(item)}>{processingOrderId === item.id ? 'Updating...' : `Move to ${nextOrderStatus(item.orderStatus ?? item.status)}`}</SecondaryButton> : <span className="text-slate-500">No further transition</span>}</td> : null}</tr>)}</tbody></table></div>}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>{result.total} total</span><div className="flex gap-2"><SecondaryButton disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>Previous</SecondaryButton><SecondaryButton disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</SecondaryButton></div></div>
      </Card>
    </AdminShell>
  );
}

const maskAccountNumber = (value: unknown) => {
  const raw = String(value ?? '').trim();
  if (!raw || raw === '-' || raw === 'null' || raw === 'undefined') {
    return 'Not provided';
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

    const renderDetailValue = (key: string, item: unknown) => resource === 'orders' && key === 'deliveryAddress'
      ? <DeliveryAddressViewer address={item as Record<string, unknown> | string | null | undefined} />
      : String(item ?? '-');

    const customerAddress = resource === 'customers' && record ? record.address ?? record.savedAddress ?? record.deliveryAddress ?? (Array.isArray(record.addresses) ? record.addresses[0] : null) : null;

    if (resource === 'customers') {
      return <AdminShell title="Enterprise admin" subtitle="Customer details" breadcrumbs={[{ label: 'Admin' }, { label: 'Customers', to: '/admin/customers' }, { label: 'Details' }]} activePath="/admin/customers">
        <Card className="p-6">
          {error ? <ErrorState title="Unable to load customer" description={error} /> : loading ? <SkeletonTable /> : record ? <div className="space-y-4 text-sm text-slate-300">
            <div className="grid gap-3 md:grid-cols-2">{Object.entries(record).filter(([key, item]) => typeof item !== 'object' && !['address', 'savedAddress', 'deliveryAddress'].includes(key)).map(([key, item]) => <div key={key} className="flex justify-between gap-4 border-b border-white/6 py-3"><span className="text-slate-400">{titleCase(key)}</span><span className="text-right text-white">{String(item ?? '-')}</span></div>)}</div>
            {customerAddress ? <div className="border-t border-white/10 pt-4"><p className="mb-3 text-base font-semibold text-white">Saved address</p><DeliveryAddressViewer address={customerAddress as Record<string, unknown> | string | null | undefined} /></div> : null}
            <div className="border-t border-white/10 pt-4"><p className="font-semibold text-white">Related activity</p>{Object.entries(related).map(([label, items]) => <p key={label} className="mt-2 text-slate-400">{label}: {items.length}</p>)}</div>
          </div> : <EmptyState title="Customer not found" description="The requested customer is unavailable." />}
        </Card>
      </AdminShell>;
    }

  const vendorBankFields = resource === 'vendors' && record ? {
    accountHolderName: String(value(record, ['accountHolderName', 'account_holder_name', 'bankAccountHolderName', 'holderName']) ?? 'Not provided'),
    bankName: String(value(record, ['bankName', 'bank_name', 'bank', 'bankAccountName']) ?? 'Not provided'),
    accountNumber: String(value(record, ['bankAccountNumber', 'bank_account_number', 'accountNumber', 'account_number', 'bankNumber']) ?? 'Not provided'),
    ifscCode: String(value(record, ['ifscCode', 'ifsc_code', 'ifsc', 'bankIfsc']) ?? 'Not provided'),
    branchName: String(value(record, ['branchName', 'branch_name', 'bankBranch', 'bank_branch', 'branch']) ?? 'Not provided'),
    gstNumber: String(value(record, ['gstNumber', 'gst_number', 'gst', 'gstNo']) ?? 'Not provided'),
    documentName: String(value(record, ['bankDocumentName', 'bank_document_name', 'bankProofName', 'bank_proof_name', 'documentName', 'bankStatementName']) ?? 'No bank document provided'),
    documentUrl: typeof record.bankDocumentUrl === 'string' ? record.bankDocumentUrl : typeof record.bank_document_url === 'string' ? record.bank_document_url : typeof record.bankProofUrl === 'string' ? record.bankProofUrl : typeof record.bank_proof_url === 'string' ? record.bank_proof_url : typeof record.documentUrl === 'string' ? record.documentUrl : '',
    bankStatus: String(value(record, ['bankVerificationStatus', 'bank_verification_status', 'bankStatus', 'verificationStatus', 'payoutStatus']) ?? 'Not available'),
  } : null;

  return <AdminShell title="Enterprise admin" subtitle={`${titleCase(resource)} details`} breadcrumbs={[{ label: 'Admin' }, { label: titleCase(resource), to: `/admin/${resource}` }, { label: 'Details' }]} activePath={`/admin/${resource}`}><Card className="p-6">{message ? <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}{error ? <ErrorState title="Unable to load details" description={error} /> : loading ? <SkeletonTable /> : record ? <div className="space-y-3 text-sm text-slate-300">{Object.entries(record).filter(([, item]) => typeof item !== 'object').map(([key, item]) => <div key={key} className="flex justify-between gap-4 border-b border-white/6 py-3"><span className="text-slate-400">{titleCase(key)}</span><span className="text-right text-white">{String(item ?? '-')}</span></div>)}{resource === 'orders' && record.deliveryAddress ? <div className="border-t border-white/10 pt-4"><p className="mb-3 text-base font-semibold text-white">Delivery address</p><DeliveryAddressViewer address={record.deliveryAddress as Record<string, unknown> | string | null | undefined} /></div> : null}{vendorBankFields ? <div className="border-t border-white/10 pt-4"><p className="mb-3 text-base font-semibold text-white">Vendor payout details</p><div className="grid gap-3 md:grid-cols-2">{[
        { label: 'GST number', value: vendorBankFields.gstNumber },
        { label: 'Account holder', value: vendorBankFields.accountHolderName },
        { label: 'Bank name', value: vendorBankFields.bankName },
        { label: 'Account number', value: vendorBankFields.accountNumber },
        { label: 'IFSC', value: vendorBankFields.ifscCode },
        { label: 'Branch', value: vendorBankFields.branchName },
      ].map((field) => <div key={field.label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-slate-400">{field.label}</p><p className="mt-2 text-white">{field.value !== '-' ? field.value : 'Bank details not provided'}</p></div>)}{vendorBankFields.documentName !== '-' ? <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2"><p className="text-slate-400">Bank proof</p><div className="mt-2 flex items-center justify-between gap-3"><span className="text-white">{vendorBankFields.documentName}</span>{vendorBankFields.documentUrl ? <a href={vendorBankFields.documentUrl} target="_blank" rel="noreferrer" className="text-emerald-300 underline">View</a> : null}</div></div> : <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2"><p className="text-slate-400">Bank proof</p><p className="mt-2 text-white">No bank document provided</p></div>}</div></div> : null}{Object.entries(related).map(([label, items]) => <div key={label} className="border-t border-white/10 pt-4"><p className="font-semibold text-white">{label} ({items.length})</p>{items.slice(0, 5).map((item, index) => <p key={String(item.id ?? index)} className="mt-2 text-slate-400">{value(item, ['name', 'title', 'orderNumber', 'amount', 'status', 'id'])}</p>)}</div>)}{(resource === 'orders' || resource === 'products') ? <div className="flex gap-3 pt-3"><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-white"><option value="">Update status</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="PROCESSING">PROCESSING</option><option value="SHIPPED">SHIPPED</option><option value="DELIVERED">DELIVERED</option><option value="CANCELLED">CANCELLED</option></select><PrimaryButton onClick={updateStatus}>Save status</PrimaryButton></div> : null}</div> : <EmptyState title="Record not found" description="The requested record is unavailable." />}</Card></AdminShell>;
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
