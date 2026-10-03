import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/apiClient';
import { getFranchiseAnalytics, getFranchiseCustomers, getFranchiseDashboard, getFranchiseOrder, getFranchiseOrders, getFranchiseProduct, getFranchiseProducts, getFranchiseVendor, getFranchiseVendors, type FranchiseRecord } from '../api/franchiseApi';
import { FranchiseAdminShell } from '../components/admin/FranchiseAdminShell';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { EmptyState, ErrorState, SkeletonCard, SkeletonTable } from '../components/loading/LoadingComponents';

function value(record: FranchiseRecord, keys: string[]): unknown {
  for (const key of keys) {
    const candidate = record[key];
    if (candidate !== undefined && candidate !== null && candidate !== '') return candidate;
  }
  return undefined;
}

function text(input: unknown): string {
  if (input === undefined || input === null || input === '') return 'Unavailable';
  if (typeof input === 'object' && !Array.isArray(input)) {
    const object = input as Record<string, unknown>;
    return text(object.name ?? object.title ?? object.label ?? object.businessName ?? object.storeName ?? object.email);
  }
  if (Array.isArray(input)) return input.length ? input.map(text).join(', ') : 'None';
  return String(input);
}

function idOf(record: FranchiseRecord): string {
  return text(value(record, ['id', 'vendorId', 'productId', 'orderId', 'userId']));
}

function productIdOf(record: FranchiseRecord): string {
  return text(value(record, ['id', 'productId']));
}

function date(input: unknown): string {
  if (!input) return 'Unavailable';
  const parsed = new Date(String(input));
  return Number.isNaN(parsed.getTime()) ? text(input) : parsed.toLocaleDateString();
}

function money(input: unknown): string {
  if (typeof input === 'number' || (typeof input === 'string' && input.trim() && Number.isFinite(Number(input)))) return `₹${Number(input).toLocaleString('en-IN')}`;
  return text(input);
}

function ErrorOrEmpty({ error, empty, title }: { error: unknown; empty: boolean; title: string }) {
  if (error) {
    const denied = error instanceof ApiError && error.status === 403;
    return <ErrorState title={denied ? 'Access denied' : `Unable to load ${title.toLowerCase()}`} description={denied ? 'You do not have permission to view this franchise data.' : error instanceof Error ? error.message : `The ${title.toLowerCase()} request failed.`} />;
  }
  return empty ? <EmptyState title={`No ${title.toLowerCase()} found`} description={`No ${title.toLowerCase()} were returned for this franchise.`} /> : null;
}

function useList<T extends FranchiseRecord>(loader: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    loader().then((data) => { if (active) setItems(data); }).catch((reason: unknown) => { if (active) setError(reason); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loader]);
  return { items, loading, error };
}

function useObject<T extends FranchiseRecord>(loader: () => Promise<T>, requestKey = '') {
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    let active = true;
    loader().then((data) => { if (active) setItem(data); }).catch((reason: unknown) => { if (active) setError(reason); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [requestKey]);
  return { item, loading, error };
}

function StatCard({ label, input, currency = false }: { label: string; input: unknown; currency?: boolean }) {
  const content = currency ? money(input) : text(input);
  return <Card className="p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p><p className="mt-2 break-words text-2xl font-semibold text-[var(--text-primary)]">{content}</p></Card>;
}

function metric(record: FranchiseRecord, keys: string[]): unknown {
  const direct = value(record, keys);
  if (direct !== undefined) return direct;
  for (const nestedKey of ['stats', 'metrics', 'summary']) {
    const nested = record[nestedKey];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const nestedValue = value(nested as FranchiseRecord, keys);
      if (nestedValue !== undefined) return nestedValue;
    }
  }
  return undefined;
}

function vendorBusiness(record: FranchiseRecord): string {
  const details = ['businessName', 'storeName', 'businessAddress', 'address', 'city', 'state', 'pincode']
    .map((key) => value(record, [key]))
    .filter((part) => part !== undefined)
    .map(text);
  return details.length ? [...new Set(details)].join(', ') : 'Unavailable';
}

function contactInfo(record: FranchiseRecord): string {
  const contact = ['email', 'phone', 'phoneNumber']
    .map((key) => value(record, [key]))
    .filter((part) => part !== undefined)
    .map(text);
  return contact.length ? [...new Set(contact)].join(' / ') : 'Unavailable';
}

function customerName(record: FranchiseRecord): string | undefined {
  const direct = value(record, ['customerName', 'name', 'fullName', 'username', 'customer_name', 'full_name']);
  if (direct !== undefined) return text(direct);
  const firstName = value(record, ['firstName', 'first_name']);
  const lastName = value(record, ['lastName', 'last_name']);
  const combined = [firstName, lastName].filter((part) => part !== undefined).map(String).join(' ').trim();
  if (combined) return combined;
  const nested = value(record, ['customer', 'user', 'profile', 'customerDetails', 'userDetails']);
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) return customerName(nested as FranchiseRecord);
  return undefined;
}

function customerOrderCount(record: FranchiseRecord): unknown {
  const keys = ['orderCount', 'ordersCount', 'totalOrders', 'totalOrderCount', 'numberOfOrders', 'order_count', 'orders_count', 'total_orders'];
  const count = metric(record, keys);
  if (count !== undefined) return count;
  const orders = value(record, ['orders']);
  return Array.isArray(orders) ? orders.length : undefined;
}

function customerStatus(record: FranchiseRecord): string | undefined {
  const status = value(record, ['accountStatus', 'customerStatus', 'status', 'userStatus', 'customer_status', 'account_status']);
  if (status !== undefined) return text(status);
  const active = value(record, ['active', 'isActive', 'enabled', 'isEnabled']);
  return typeof active === 'boolean' ? (active ? 'Active' : 'Inactive') : undefined;
}

export function FranchiseDashboardPage() {
  const { item, loading, error } = useObject(getFranchiseDashboard);
  return <FranchiseAdminShell title="Franchise Admin" subtitle="Dashboard" activePath="/franchise/dashboard" breadcrumbs={[{ label: 'Franchise' }, { label: 'Dashboard' }]}>
    {loading ? <div className="grid gap-4 md:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : error ? <ErrorOrEmpty error={error} empty={false} title="dashboard" /> : item ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total Vendors" input={metric(item, ['totalVendors', 'vendorCount'])} />
      <StatCard label="Active Vendors" input={metric(item, ['activeVendors'])} />
      <StatCard label="Total Products" input={metric(item, ['totalProducts', 'productCount'])} />
      <StatCard label="Active Products" input={metric(item, ['activeProducts'])} />
      <StatCard label="Total Orders" input={metric(item, ['totalOrders', 'orderCount'])} />
      <StatCard label="Pending Orders" input={metric(item, ['pendingOrders'])} />
      <StatCard label="Completed Orders" input={metric(item, ['completedOrders'])} />
      <StatCard label="Total Sales" input={metric(item, ['totalSales', 'sales'])} currency />
      <StatCard label="Total Customers" input={metric(item, ['totalCustomers', 'customerCount'])} />
      <StatCard label="Pending Product Inspections" input={metric(item, ['pendingProductInspections', 'pendingInspections'])} />
      <StatCard label="Advertisements" input={metric(item, ['advertisementCount', 'totalAdvertisements', 'advertisements'])} />
    </div> : null}
  </FranchiseAdminShell>;
}

const vendorColumns = [
  { key: 'vendor', label: 'Vendor', render: (row: FranchiseRecord) => text(value(row, ['vendorName', 'companyName', 'name', 'fullName'])) },
  { key: 'business', label: 'Store / Business', render: vendorBusiness },
  { key: 'contact', label: 'Contact', render: contactInfo },
  { key: 'status', label: 'Status', render: (row: FranchiseRecord) => text(value(row, ['status', 'vendorStatus', 'verificationStatus'])) },
  { key: 'products', label: 'Products', render: (row: FranchiseRecord) => text(value(row, ['productCount', 'totalProducts', 'productsCount'])) },
  { key: 'sales', label: 'Orders', render: (row: FranchiseRecord) => text(value(row, ['orderCount', 'totalOrders', 'ordersCount'])) },
  { key: 'details', label: '', render: (row: FranchiseRecord) => <Link className="text-blue-500 hover:underline" to={`/franchise/vendors/${encodeURIComponent(idOf(row))}`}>View</Link> },
];

export function FranchiseVendorsPage() {
  const result = useList(getFranchiseVendors);
  return <FranchiseAdminShell title="Franchise Admin" subtitle="Vendors" activePath="/franchise/vendors" breadcrumbs={[{ label: 'Franchise' }, { label: 'Vendors' }]}>
    {result.loading ? <SkeletonTable /> : result.error || result.items.length === 0 ? <ErrorOrEmpty error={result.error} empty={result.items.length === 0} title="vendors" /> : <Card className="overflow-hidden p-2"><Table columns={vendorColumns} data={result.items} /></Card>}
  </FranchiseAdminShell>;
}

function relatedName(input: unknown, keys: string[]): unknown {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? value(input as FranchiseRecord, keys)
    : undefined;
}

function vendorName(row: FranchiseRecord): string {
  const directName = value(row, ['vendorName', 'companyName', 'vendorCompanyName', 'sellerName']);
  if (directName !== undefined) return text(directName);

  const vendor = value(row, ['vendor', 'seller']);
  const embeddedName = relatedName(vendor, ['companyName', 'vendorName', 'name', 'businessName', 'storeName']);
  if (embeddedName !== undefined) return text(embeddedName);
  return typeof vendor === 'string' && !/^\d+$/.test(vendor) ? vendor : 'Unavailable';
}

function categoryName(row: FranchiseRecord): string {
  const directName = value(row, ['categoryName']);
  if (directName !== undefined) return text(directName);

  const category = value(row, ['category']);
  const embeddedName = relatedName(category, ['name', 'title', 'label']);
  if (embeddedName !== undefined) return text(embeddedName);
  return typeof category === 'string' && !/^\d+$/.test(category) ? category : 'Unavailable';
}

const productColumns = [
    { key: 'product', label: 'Product', render: (row: FranchiseRecord) => <div className="flex min-w-0 items-center gap-2"><ProductImage row={row} /><span className="min-w-0 truncate">{text(value(row, ['name', 'productName', 'title']))}</span></div> },
    { key: 'vendor', label: 'Vendor', render: (row: FranchiseRecord) => vendorName(row) },
    { key: 'category', label: 'Category', render: (row: FranchiseRecord) => categoryName(row) },
    { key: 'price', label: 'Price', render: (row: FranchiseRecord) => money(value(row, ['price', 'sellingPrice', 'amount'])) },
    { key: 'status', label: 'Status', render: (row: FranchiseRecord) => text(value(row, ['status', 'approvalStatus', 'inspectionStatus'])) },
    { key: 'created', label: 'Created', render: (row: FranchiseRecord) => date(value(row, ['createdAt', 'createdDate', 'createdOn', 'created_at'])) },
    { key: 'details', label: '', render: (row: FranchiseRecord) => <Link className="text-blue-500 hover:underline" to={`/franchise/products/${encodeURIComponent(productIdOf(row))}`}>View</Link> },
];

function ProductImage({ row }: { row: FranchiseRecord }) {
  const images = Array.isArray(row.images) ? row.images : [];
  const primary = images.find((image) => image && typeof image === 'object' && (image as FranchiseRecord).isPrimary) ?? images[0];
  const imageSource = relatedName(primary, ['url', 'imageUrl']);
  const source = value(row, ['imageUrl', 'image', 'thumbnail', 'primaryImageUrl']) ?? imageSource ?? (typeof primary === 'string' ? primary : undefined);
  return typeof source === 'string' && source ? <img src={source} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <span className="h-10 w-10 shrink-0 rounded-lg bg-[var(--surface-muted)]" />;
}

export function FranchiseProductsPage() {
  const result = useList(getFranchiseProducts);
  return <FranchiseAdminShell title="Franchise Admin" subtitle="Products" activePath="/franchise/products" breadcrumbs={[{ label: 'Franchise' }, { label: 'Products' }]}>
    {result.loading ? <SkeletonTable /> : result.error || result.items.length === 0 ? <ErrorOrEmpty error={result.error} empty={result.items.length === 0} title="products" /> : <Card className="overflow-hidden p-2"><Table columns={productColumns} data={result.items} /></Card>}
  </FranchiseAdminShell>;
}

const orderColumns = [
  { key: 'id', label: 'Order ID', render: (row: FranchiseRecord) => text(value(row, ['orderNumber', 'orderId', 'id'])) },
  { key: 'customer', label: 'Customer', render: (row: FranchiseRecord) => text(value(row, ['customerName', 'customer'])) },
  { key: 'vendor', label: 'Vendor', render: (row: FranchiseRecord) => text(value(row, ['vendorName', 'vendor'])) },
  { key: 'amount', label: 'Amount', render: (row: FranchiseRecord) => money(value(row, ['totalAmount', 'amount', 'total'])) },
  { key: 'status', label: 'Status', render: (row: FranchiseRecord) => text(value(row, ['status', 'orderStatus'])) },
  { key: 'date', label: 'Date', render: (row: FranchiseRecord) => date(value(row, ['createdAt', 'orderDate', 'date'])) },
  { key: 'details', label: '', render: (row: FranchiseRecord) => <Link className="text-blue-500 hover:underline" to={`/franchise/orders/${encodeURIComponent(idOf(row))}`}>View</Link> },
];

export function FranchiseOrdersPage() {
  const result = useList(getFranchiseOrders);
  return <FranchiseAdminShell title="Franchise Admin" subtitle="Orders" activePath="/franchise/orders" breadcrumbs={[{ label: 'Franchise' }, { label: 'Orders' }]}>
    {result.loading ? <SkeletonTable /> : result.error || result.items.length === 0 ? <ErrorOrEmpty error={result.error} empty={result.items.length === 0} title="orders" /> : <Card className="overflow-hidden p-2"><Table columns={orderColumns} data={result.items} /></Card>}
  </FranchiseAdminShell>;
}

export function FranchiseCustomersPage() {
  const result = useList(getFranchiseCustomers);
  const columns = [
    { key: 'name', label: 'Customer', render: (row: FranchiseRecord) => customerName(row) ?? 'Unavailable' },
    { key: 'contact', label: 'Contact', render: contactInfo },
    { key: 'orders', label: 'Orders', render: (row: FranchiseRecord) => text(customerOrderCount(row)) },
    { key: 'status', label: 'Status', render: (row: FranchiseRecord) => customerStatus(row) ?? 'Unavailable' },
  ];
  return <FranchiseAdminShell title="Franchise Admin" subtitle="Customers" activePath="/franchise/customers" breadcrumbs={[{ label: 'Franchise' }, { label: 'Customers' }]}>
    {result.loading ? <SkeletonTable /> : result.error || result.items.length === 0 ? <ErrorOrEmpty error={result.error} empty={result.items.length === 0} title="customers" /> : <Card className="overflow-hidden p-2"><Table columns={columns} data={result.items} /></Card>}
  </FranchiseAdminShell>;
}

export function FranchiseAnalyticsPage() {
  const result = useObject(getFranchiseAnalytics);
  const analytics = result.item;
  const vendorSales = analytics ? value(analytics, ['vendorSales', 'salesByVendor']) : undefined;
  const productSales = analytics ? value(analytics, ['productSales', 'salesByProduct']) : undefined;
  const breakdown = (input: unknown): FranchiseRecord[] => Array.isArray(input) ? input.filter((item): item is FranchiseRecord => Boolean(item && typeof item === 'object')) : [];
  return <FranchiseAdminShell title="Franchise Admin" subtitle="Sales / Analytics" activePath="/franchise/analytics" breadcrumbs={[{ label: 'Franchise' }, { label: 'Sales / Analytics' }]}>
    {result.loading ? <div className="grid gap-4 md:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : result.error ? <ErrorOrEmpty error={result.error} empty={false} title="analytics" /> : analytics ? <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Total Sales" input={metric(analytics, ['totalSales', 'sales'])} currency /><StatCard label="Order Count" input={metric(analytics, ['orderCount', 'totalOrders', 'orders'])} /><StatCard label="Daily Sales" input={metric(analytics, ['dailySales'])} currency /><StatCard label="Monthly Sales" input={metric(analytics, ['monthlySales'])} currency /></div><Breakdown title="Vendor Sales" rows={breakdown(vendorSales)} /><Breakdown title="Product Sales" rows={breakdown(productSales)} /></div> : null}
  </FranchiseAdminShell>;
}

function Breakdown({ title, rows }: { title: string; rows: FranchiseRecord[] }) {
  if (rows.length === 0) return null;
  return <Card className="p-4"><h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">{title}</h2><Table columns={[{ key: 'name', label: 'Name', render: (row: FranchiseRecord) => text(value(row, ['name', 'vendorName', 'productName', 'label'])) }, { key: 'sales', label: 'Sales', render: (row: FranchiseRecord) => money(value(row, ['sales', 'totalSales', 'amount', 'value'])) }, { key: 'orders', label: 'Orders', render: (row: FranchiseRecord) => text(value(row, ['orders', 'orderCount', 'count'])) }]} data={rows} /></Card>;
}

export function FranchiseEntityDetailPage({ resource }: { resource: 'vendor' | 'product' | 'order' }) {
  const { id = '' } = useParams();
  const loaders = { vendor: getFranchiseVendor, product: getFranchiseProduct, order: getFranchiseOrder };
  const result = useObject(() => loaders[resource](id), `${resource}:${id}`);
  const label = resource[0].toUpperCase() + resource.slice(1);
  return <FranchiseAdminShell title="Franchise Admin" subtitle={`${label} details`} activePath={`/franchise/${resource}s`} breadcrumbs={[{ label: 'Franchise', to: '/franchise/dashboard' }, { label: label }]}>
    {result.loading ? <SkeletonTable /> : result.error ? <ErrorOrEmpty error={result.error} empty={false} title={resource} /> : result.item ? <Card className="p-4"><dl className="grid gap-4 sm:grid-cols-2">{Object.entries(result.item).map(([key, item]) => <div key={key} className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{key}</dt><dd className="mt-1 break-words text-sm text-[var(--text-primary)]">{text(item)}</dd></div>)}</dl></Card> : null}
  </FranchiseAdminShell>;
}

export function FranchiseUnavailablePage({ title, description }: { title: string; description: string }) {
  return <FranchiseAdminShell title="Franchise Admin" subtitle={title} activePath={title === 'Product Inspection' ? '/franchise/product-inspections' : '/franchise/advertisements'} breadcrumbs={[{ label: 'Franchise' }, { label: title }]}><EmptyState title="Endpoint unavailable" description={description} /></FranchiseAdminShell>;
}
