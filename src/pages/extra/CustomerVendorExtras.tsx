import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BadgeCheck, BellRing, CreditCard, Heart, MapPin, MessageCircleMore, PackageCheck, ReceiptText, Search, Settings, ShieldCheck, Sparkles, Store, Wallet2, ChevronLeft, X, Check, Clock, Eye, MessageSquare } from 'lucide-react';
import { SectionShell } from '../../components/SectionShell';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Badge, PrimaryButton, SecondaryButton } from '../../components/common/Buttons';
import { EmptyState, ErrorState, SkeletonCard, SkeletonTable } from '../../components/loading/LoadingComponents';
import VendorSidebar from '../../components/layout/VendorSidebar';
import { getCustomerProfile, saveCustomerProfile } from '../../api/customerApi';
import { getOrderById, getOrders } from '../../api/orderApi';
import { getAuctionById, getAuctionRegistrationStatus, getAuctionWinner, getEffectiveAuctionStatus } from '../../api/auctionApi';
import { getAuctionBids, placeBid } from '../../api/bidApi';
import { getPaymentsForOrder } from '../../api/paymentApi';
import { buildAddressPayload, getAddresses, getAddressById, createAddress, updateAddress, deleteAddress, type AddressResponse, type AddressRequest } from '../../api/addressApi';
import { useAuth } from '../../context/AuthContext';
import type { OrderResponseDto } from '../../types';
import { getMyBids, type BidResponse } from '../../api/bidApi';
import { deleteVendorProduct, getVendorProducts, getProductImage, formatCurrency as formatProductCurrency, mapSellingTypeLabel, updateVendorProduct, type VendorProductApiResponse } from '../../api/vendorProductApi';
import { getVendorAuctions, type VendorAuctionApiResponse } from '../../api/vendorAuctionApi';
import { getVendorOrders, type VendorOrderApiResponse } from '../../api/vendorOrderApi';
import { formatOrderNumber, getOrderCustomer, getOrderProductName, getOrderStatus, getOrderTotal, getOrderType, getOrderVendor } from '../../utils/orderDisplay';
import DeliveryAddressViewer from '../../components/orders/DeliveryAddressViewer';
import { getVendorRevenue } from '../../api/vendorRevenueApi';
import { getVendorVerificationStatus } from '../../api/vendorVerificationApi';
import { updateVendorProfile, getVendorProfile, getVendorBankRecord, saveVendorBankRecord, type VendorProfileResponse, type VendorBankRecord } from '../../api/vendorApi';
import { createVendorWithdrawal, getVendorWithdrawalBalance, getVendorWithdrawals, type WithdrawalBalance, type WithdrawalRecord } from '../../api/withdrawalApi';
import { addresses, customerBids, invoices, notifications, popularSearches, recentlyViewed, reviews, savedSearches, supportTickets, transactions, walletActivity, wishlistItems, vendorProducts, vendorAuctions, vendorReports, vendorShippingRules, vendorFeeHistory, vendorMessages, vendorNotifications } from '../../data/mockData';



function SubtlePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function toMoney(value: number | string | null | undefined): string {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
}

function statusTone(status: string | null | undefined) {
  return status === 'COMPLETE' ? 'text-emerald-300' : 'text-amber-300';
}

export function CustomerProfilePage() {
  const [profile, setProfile] = useState<null | { id: number; firstName: string; lastName: string; phone: string; addressId: number | null; userId: number }>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', addressId: null as number | null });
  const [addressList, setAddressList] = useState<AddressResponse[]>([]);
  const [addressForm, setAddressForm] = useState<AddressRequest>({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: true });
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCustomerProfile();
        setProfile(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          addressId: data.addressId ?? null,
        });
      } catch (err: any) {
        if (!String(err?.message).toLowerCase().includes('not found')) {
          setError(err?.message || 'Unable to load your profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      setAddressLoading(true);
      try {
        setAddressList(await getAddresses());
      } catch (err: any) {
        setError(err?.message || 'Unable to load your addresses.');
      } finally {
        setAddressLoading(false);
      }
    };
    loadAddresses();
  }, []);

  const canEdit = true;

  const saveProfile = async () => {
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError('Phone must be a valid 10-digit Indian mobile number.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await saveCustomerProfile(form);
      setProfile(saved);
      setForm({
        firstName: saved.firstName || '',
        lastName: saved.lastName || '',
        phone: saved.phone || '',
        addressId: saved.addressId ?? null,
      });
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const createProfileAddress = async () => {
    const payloadResult = buildAddressPayload(addressForm);
    if (typeof payloadResult === 'string') {
      setError(payloadResult);
      return;
    }
    setCreatingAddress(true);
    setError(null);
    try {
      console.debug('ADD ADDRESS PAYLOAD', payloadResult);
      const created = await createAddress(payloadResult);
      setAddressList(await getAddresses());
      setForm((prev) => ({ ...prev, addressId: created.id }));
      setAddressForm({ label: '', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: true });
      setMessage('Address added successfully.');
    } catch (err: any) {
      setError(err?.message || 'Unable to create your address.');
    } finally {
      setCreatingAddress(false);
    }
  };

  return (
    <SectionShell title="My profile" subtitle="Your verified buyer identity and delivery preferences">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            <BadgeCheck className="h-4 w-4" /> Customer profile
          </div>
          {loading ? (
            <SkeletonCard />
          ) : (
            <div className="space-y-5">
              {error ? <ErrorState title="Profile error" description={error} /> : null}
              {message ? <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">First name</span>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    disabled={!canEdit}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
                    placeholder="Enter first name"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">Last name</span>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    disabled={!canEdit}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
                    placeholder="Enter last name"
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">Phone</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!canEdit}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
                    placeholder="Enter phone number"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">Address</span>
                  <select
                    value={form.addressId ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, addressId: e.target.value ? Number(e.target.value) : null }))}
                    disabled={!canEdit}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
                  >
                    <option value="">Select an address</option>
                    {addressList.map((address) => <option key={address.id} value={address.id}>{address.addressLine1}, {address.city}</option>)}
                  </select>
                </label>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Add a new address</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {([
                    ['fullName', 'Full name *'],
                    ['phone', 'Phone *'],
                    ['addressLine1', 'Address line 1 *'],
                    ['addressLine2', 'Address line 2'],
                    ['city', 'City *'],
                    ['state', 'State *'],
                    ['postalCode', 'Postal code *'],
                    ['country', 'Country'],
                  ] as const).map(([field, label]) => (
                    <label key={field} className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
                      <input
                        value={addressForm[field] || ''}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, [field]: e.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
                      />
                    </label>
                  ))}
                </div>
                <button type="button" onClick={createProfileAddress} disabled={creatingAddress || addressLoading} className="rounded-full border border-blue-400/30 px-4 py-2 text-sm font-medium text-blue-200 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60">
                  {creatingAddress ? 'Adding address...' : 'Add address'}
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving || !canEdit}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Update profile'}
                </button>
                <p className="text-sm text-slate-400">Update these details to keep checkout and delivery preferences current.</p>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">{profile ? 'Profile summary' : 'Why your profile matters'}</div>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            {profile ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-slate-400">Full name</p>
                  <p className="mt-2 text-white">{profile.firstName} {profile.lastName}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-slate-400">Phone</p>
                  <p className="mt-2 text-white">{profile.phone || 'Not provided'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-slate-400">Address</p>
                  <p className="mt-2 text-white">{addressList.find((address) => address.id === profile.addressId)?.addressLine1 || (profile.addressId ? `Address ${profile.addressId}` : 'Not set')}</p>
                  {addressList.find((address) => address.id === profile.addressId) ? <p className="mt-1 text-xs text-slate-400">{addressList.find((address) => address.id === profile.addressId)?.city}, {addressList.find((address) => address.id === profile.addressId)?.state}</p> : null}
                </div>
              </>
            ) : (
              <>
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">A complete customer profile unlocks faster checkout, personalized recommendations, and better order tracking.</p>
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Your address reference keeps delivery and shipping options aligned with your current location.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrders();
        if (!cancelled) {
          setOrders(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Unable to load your orders.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.toLowerCase();
    let filtered = orders.filter(
      (order) =>
        (order.orderNumber?.toLowerCase().includes(query) || `Order #${order.id}`.toLowerCase().includes(query)) &&
        (filterStatus === 'all' || order.orderStatus?.toLowerCase() === filterStatus)
    );
    return filtered;
  }, [orders, filterStatus, searchTerm]);

  if (loading) {
    return (
      <SectionShell title="My orders" subtitle="Your shipment and delivery history">
        <SkeletonTable />
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell title="My orders" subtitle="Your shipment and delivery history">
        <ErrorState title="Unable to load orders" description={error} />
      </SectionShell>
    );
  }

  return (
    <SectionShell title="My orders" subtitle="Your shipment and delivery history">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
          >
            <option value="all">All orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState title="No orders found" description="Your orders will appear here once you make a purchase." />
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                to={`/customer/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300 transition hover:border-blue-400/40 hover:bg-slate-900/90"
              >
                <div>
                  <p className="font-semibold text-white">{order.orderNumber || `Order #${order.id}`}</p>
                  <p className="mt-1 text-slate-400">{order.items?.length ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}` : 'No items'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">₹{Number(order.totalAmount).toLocaleString()}</p>
                  <p className="text-emerald-300">{order.orderStatus}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

export function CustomerAuctionsPage() {
  return (
    <SectionShell title="My auctions" subtitle="Items you listed or are watching as a buyer">
      <div className="space-y-3">
        {customerBids.map((bid) => (
          <Link key={bid.item} to={`/customer/auctions/${bid.item.toLowerCase().replace(/ /g, '-')}`} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300 transition hover:border-blue-400/40 hover:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{bid.item}</p>
              <p className="text-white">{bid.bid}</p>
            </div>
            <p className="mt-2">{bid.progress}</p>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomerBidsPage() {
  const [bids, setBids] = useState<BidResponse[]>([]);
  const [activeTab, setActiveTab] = useState<
    'all' | 'winning' | 'outbid' | 'closed'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBids = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyBids();

        if (!cancelled) {
          setBids(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.message ||
              'Unable to load your bids. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBids();

    return () => {
      cancelled = true;
    };
  }, []);

  const getBidStatus = (bid: BidResponse) => {
    const status = String(bid.status || '').toUpperCase();

    if (status === 'OUTBID') {
      return 'outbid';
    }

    if (
      status === 'ACCEPTED' ||
      status === 'WINNING' ||
      status === 'PENDING'
    ) {
      return 'winning';
    }

    return 'closed';
  };

  const filteredBids = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bids.filter((bid) => {
      const statusType = getBidStatus(bid);

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'winning' && statusType === 'winning') ||
        (activeTab === 'outbid' && statusType === 'outbid') ||
        (activeTab === 'closed' && statusType === 'closed');

      const matchesSearch =
        !query ||
        String(bid.id).includes(query) ||
        String(bid.auctionId).includes(query) ||
        String(bid.amount).includes(query) ||
        String(bid.status).toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [bids, activeTab, searchTerm]);

  const allCount = bids.length;

  const winningCount = bids.filter(
    (bid) => getBidStatus(bid) === 'winning'
  ).length;

  const outbidCount = bids.filter(
    (bid) => getBidStatus(bid) === 'outbid'
  ).length;

  const closedCount = bids.filter(
    (bid) => getBidStatus(bid) === 'closed'
  ).length;

  const formatAmount = (amount: string | number) => {
    const value = Number(amount);

    if (Number.isNaN(value)) {
      return '₹0';
    }

    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return 'Date unavailable';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status?: string) => {
    const normalized = String(status || '').toUpperCase();

    if (normalized === 'OUTBID') {
      return 'Outbid';
    }

    if (normalized === 'ACCEPTED') {
      return 'Winning';
    }

    if (normalized === 'WINNING') {
      return 'Winning';
    }

    if (normalized === 'PENDING') {
      return 'Pending';
    }

    if (normalized === 'CANCELLED') {
      return 'Cancelled';
    }

    return status || 'Unknown';
  };

  const getStatusClass = (status?: string) => {
    const normalized = String(status || '').toUpperCase();

    if (
      normalized === 'ACCEPTED' ||
      normalized === 'WINNING'
    ) {
      return 'bg-emerald-500/20 text-emerald-300';
    }

    if (normalized === 'OUTBID') {
      return 'bg-amber-500/20 text-amber-300';
    }

    if (normalized === 'PENDING') {
      return 'bg-blue-500/20 text-blue-300';
    }

    return 'bg-slate-500/20 text-slate-300';
  };

  const tabs = [
    {
      id: 'all',
      label: 'All',
      count: allCount,
    },
    {
      id: 'winning',
      label: 'Winning',
      count: winningCount,
    },
    {
      id: 'outbid',
      label: 'Outbid',
      count: outbidCount,
    },
    {
      id: 'closed',
      label: 'Closed',
      count: closedCount,
    },
  ];

  if (loading) {
    return (
      <SectionShell
        title="My active bids"
        subtitle="Track your bids across auctions"
      >
        <SkeletonTable />
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell
        title="My active bids"
        subtitle="Track your bids across auctions"
      >
        <ErrorState
          title="Unable to load bids"
          description={error}
        />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title="My active bids"
      subtitle="Track your bids across auctions"
    >
      <div className="space-y-5">

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by bid ID, auction ID, amount or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | 'all'
                    | 'winning'
                    | 'outbid'
                    | 'closed'
                )
              }
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-75">
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Empty */}
        {filteredBids.length === 0 ? (
          <EmptyState
            title={
              bids.length === 0
                ? 'No bids yet'
                : 'No bids found'
            }
            description={
              bids.length === 0
                ? 'Your bids will appear here when you participate in an auction.'
                : 'Try another search or select a different bid status.'
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">

            {filteredBids.map((bid) => {
              const statusType = getBidStatus(bid);

              return (
                <div
                  key={bid.id}
                  className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 transition hover:border-blue-400/30 hover:bg-slate-900/90"
                >
                  {/* Header */}
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Auction
                      </p>

                      <p className="mt-1 text-lg font-semibold text-white">
                        Auction #{bid.auctionId}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Bid #{bid.id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        bid.status
                      )}`}
                    >
                      {getStatusLabel(bid.status)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">

                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                      <span className="text-sm text-slate-400">
                        Your bid
                      </span>

                      <span className="text-lg font-semibold text-white">
                        {formatAmount(bid.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                      <span className="text-sm text-slate-400">
                        Status
                      </span>

                      <span className="text-sm font-medium text-white">
                        {getStatusLabel(bid.status)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                      <span className="text-sm text-slate-400">
                        Placed at
                      </span>

                      <span className="text-right text-sm text-slate-300">
                        {formatDate(bid.placedAt)}
                      </span>
                    </div>

                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="text-xs text-slate-500">
                      User ID: {bid.userId}
                    </div>

                    <Link
                      to={`/customer/auctions/${bid.auctionId}`}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                    >
                      View Auction
                    </Link>
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </SectionShell>
  );
}
export function CustomerWonAuctionsPage() {
  const [wonAuctions, setWonAuctions] = useState<
    Array<{
      auctionId: number;
      title: string;
      finalPrice: string;
      awardedAt: string;
      bidId: number;
    }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWonAuctions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get customer's real bids
        const bids = await getMyBids();

        // Only accepted/winning bids
        const winningBids = bids.filter((bid) => {
          const status = String(bid.status || '').toUpperCase();
          return status === 'ACCEPTED' || status === 'WINNING';
        });

        // Get real winner information for each auction
        const results = await Promise.all(
          winningBids.map(async (bid) => {
            try {
              const winner = await getAuctionWinner(bid.auctionId);

              // Make sure this bid is actually the winning bid
              if (
                winner.bidId !== bid.id ||
                winner.winnerId !== bid.userId
              ) {
                return null;
              }

              const auction = await getAuctionById(bid.auctionId);

              return {
                auctionId: auction.id,
                title: auction.title,
                finalPrice: winner.finalPrice,
                awardedAt: winner.awardedAt,
                bidId: winner.bidId,
              };
            } catch {
              return null;
            }
          })
        );

        if (!cancelled) {
          setWonAuctions(
            results.filter(
              (item): item is NonNullable<typeof item> => item !== null
            )
          );
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.message || 'Unable to load your won auctions.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWonAuctions();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatAmount = (amount: string | number) => {
    const value = Number(amount);

    if (Number.isNaN(value)) {
      return '₹0';
    }

    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return 'Date unavailable';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SectionShell
        title="Won auctions"
        subtitle="Concluded items you successfully secured"
      >
        <SkeletonTable />
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell
        title="Won auctions"
        subtitle="Concluded items you successfully secured"
      >
        <ErrorState
          title="Unable to load won auctions"
          description={error}
        />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title="Won auctions"
      subtitle="Concluded items you successfully secured"
    >
      {wonAuctions.length === 0 ? (
        <EmptyState
          title="No won auctions"
          description="Auctions you successfully win will appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {wonAuctions.map((auction) => (
            <div
              key={auction.auctionId}
              className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-slate-300 transition hover:border-emerald-400/30 hover:bg-slate-900/90"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Auction
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    {auction.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Auction #{auction.auctionId}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
                  Won
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-sm text-slate-400">
                    Final price
                  </span>

                  <span className="text-lg font-semibold text-white">
                    {formatAmount(auction.finalPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-sm text-slate-400">
                    Winning bid
                  </span>

                  <span className="text-sm font-medium text-emerald-300">
                    Bid #{auction.bidId}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <span className="text-sm text-slate-400">
                    Awarded at
                  </span>

                  <span className="text-right text-sm text-slate-300">
                    {formatDate(auction.awardedAt)}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <Link
                  to={`/customer/auctions/${auction.auctionId}`}
                  className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                >
                  View Auction
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [localWishlist, setLocalWishlist] = useState(wishlistItems);

  const filteredWishlist = useMemo(() => {
    let filtered = localWishlist.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortBy === 'price') {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceA - priceB;
      });
    }
    return filtered;
  }, [localWishlist, searchTerm, sortBy]);

  return (
    <SectionShell title="Wishlist" subtitle="Items you want to track for future deals">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="text"
            placeholder="Search wishlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
          >
            <option value="name">Sort by name</option>
            <option value="price">Sort by price</option>
          </select>
        </div>

        {filteredWishlist.length === 0 ? (
          <EmptyState title="Wishlist is empty" description="Add items to your wishlist to save them for later." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredWishlist.map((item) => (
              <div key={item.title} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-6">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-400">{item.note}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-lg font-semibold text-white">{item.price}</p>
                  <div className="flex gap-2">
                    <Link to="#" className="flex-1 text-center rounded-full bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500">
                      View
                    </Link>
                    <button
                      onClick={() => setLocalWishlist((prev) => prev.filter((i) => i.title !== item.title))}
                      className="rounded-full border border-rose-400/30 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-400/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

export function CustomerSavedSearchesPage() {
  const [showNewSearch, setShowNewSearch] = useState(false);
  const [newSearch, setNewSearch] = useState('');
  const [localSearches, setLocalSearches] = useState(savedSearches);
  const [activeAlerts, setActiveAlerts] = useState<Record<string, boolean>>({});

  const handleAddSearch = () => {
    if (newSearch.trim()) {
      setLocalSearches((prev) => [...prev, newSearch]);
      setActiveAlerts((prev) => ({ ...prev, [newSearch]: false }));
      setNewSearch('');
      setShowNewSearch(false);
    }
  };

  const toggleAlert = (search: string) => {
    setActiveAlerts((prev) => ({ ...prev, [search]: !prev[search] }));
  };

  return (
    <SectionShell title="Saved searches" subtitle="Search filters you revisit often">
      <div className="space-y-4">
        <button
          onClick={() => setShowNewSearch(!showNewSearch)}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          + Save search
        </button>

        {showNewSearch && (
          <div className="flex gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <input
              value={newSearch}
              onChange={(e) => setNewSearch(e.target.value)}
              placeholder="e.g., Luxury SUV, Gaming laptops"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSearch()}
            />
            <button onClick={handleAddSearch} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
              Save
            </button>
            <button onClick={() => setShowNewSearch(false)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
              Cancel
            </button>
          </div>
        )}

        {localSearches.length === 0 ? (
          <EmptyState title="No saved searches" description="Create saved searches to quickly find items you're interested in." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {localSearches.map((search) => (
              <div key={search} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300">
                <div className="flex-1">
                  <p className="font-semibold text-white">{search}</p>
                  <p className="text-xs text-slate-400">Created recently</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAlert(search)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${activeAlerts[search] ? 'bg-blue-600 text-white' : 'border border-white/10 text-slate-300 hover:bg-white/5'}`}
                  >
                    {activeAlerts[search] ? 'Alerts On' : 'Alerts Off'}
                  </button>
                  <button
                    onClick={() => setLocalSearches((prev) => prev.filter((s) => s !== search))}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

export function CustomerTransactionsPage() {
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.toLowerCase();
    let filtered = transactions.filter((tx) => tx.id.toLowerCase().includes(query) || tx.type.toLowerCase().includes(query));

    if (filterType === 'credit') filtered = filtered.filter((tx) => tx.amount.startsWith('+'));
    if (filterType === 'debit') filtered = filtered.filter((tx) => tx.amount.startsWith('-'));

    return filtered;
  }, [filterType, searchTerm]);

  return (
    <SectionShell title="Wallet transactions" subtitle="Your transaction history and activity">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
          >
            <option value="all">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState title="No transactions found" description="Your wallet transactions will appear here." />
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => (
              <Link key={tx.id} to={`#`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300 transition hover:bg-slate-900/90">
                <div>
                  <p className="font-semibold text-white">{tx.type}</p>
                  <p className="text-xs text-slate-400">{tx.id}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-slate-300'}`}>{tx.amount}</p>
                  <p className="text-xs text-slate-400">{tx.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

export function CustomerAddressesPage() {
  const [addressList, setAddressList] = useState<AddressResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressRequest>({ label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', isDefault: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAddresses();
        setAddressList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load addresses');
        console.log('Using mock data due to API error');
      } finally {
        setLoading(false);
      }
    };
    loadAddresses();
  }, []);

  const handleSave = async () => {
    const payloadResult = buildAddressPayload(form);
    if (typeof payloadResult === 'string') {
      setError(payloadResult);
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      console.debug('ADD ADDRESS PAYLOAD', payloadResult);
      if (editingId) {
        const updated = await updateAddress(editingId, payloadResult);
        setAddressList((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
        setMessage('Address updated successfully');
      } else {
        const created = await createAddress(payloadResult);
        setAddressList((prev) => [...prev, created]);
        setMessage('Address added successfully');
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr: AddressResponse) => {
    setForm({
      fullName: addr.fullName,
      label: 'Home',
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await deleteAddress(id);
      setAddressList((prev) => prev.filter((a) => a.id !== id));
      setMessage('Address deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const resetForm = () => {
    setForm({ label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', isDefault: true });
    setEditingId(null);
    setShowForm(false);
  };

  const displayAddresses = addressList && addressList.length > 0 ? addressList : addresses.map((a, i) => ({ id: i, customerId: 0, ...a, isDefault: i === 0, createdAt: new Date().toISOString() }));

  return (
    <SectionShell title="Addresses" subtitle="Saved delivery destinations">
      <div className="space-y-4">
        {error && <ErrorState title="Address error" description={error} />}
        {message && <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}

        <button
          onClick={() => {
            if (showForm) resetForm();
            else {
              setShowForm(true);
              setEditingId(null);
            }
          }}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          + Add address
        </button>

        {showForm && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Full name *</span>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Phone *</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="9876543210"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Address line 1 *</span>
              <input
                value={form.addressLine1}
                onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="Street address"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Address line 2</span>
              <input
                value={form.addressLine2}
                onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                placeholder="Apartment, suite, etc."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">City *</span>
                <input
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Bangalore"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">State *</span>
                <input
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="Karnataka"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Zip code *</span>
                <input
                  value={form.postalCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="500001"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Country</span>
                <input
                  value={form.country}
                  onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="India"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add'} address
              </button>
              <button onClick={resetForm} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonCard />
        ) : displayAddresses && displayAddresses.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {displayAddresses.map((addr: any) => (
              <div key={addr.id} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
                <div>
                  <p className="font-semibold text-white">{addr.fullName || addr.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{addr.phoneNumber}</p>
                  <p className="mt-2">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p className="mt-1 text-xs">
                    {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                  {addr.isDefault && <p className="mt-2 text-xs font-medium text-emerald-300">Default address</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleEdit(addr)} className="text-xs text-blue-400 hover:text-blue-300">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs text-rose-400 hover:text-rose-300">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No addresses" description="Add your first delivery address to get started" />
        )}
      </div>
    </SectionShell>
  );
}

export function CustomerMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([
    { id: '1', sender: 'Nova Tech', text: 'We can arrange a same-day handoff for your MacBook purchase.', time: '2:30 PM' },
    { id: '2', sender: 'You', text: 'That would be perfect. I can meet anytime after 4 PM today.', time: '2:35 PM' },
  ]);

  const conversations = [
    { name: 'Nova Tech', lastMessage: 'We can arrange a same-day handoff...', online: true, unread: 0 },
    { name: 'Support', lastMessage: 'Your KYC review is in progress...', online: false, unread: 1 },
    { name: 'Luxury Motors', lastMessage: 'The bike is in excellent condition...', online: true, unread: 0 },
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          sender: 'You',
          text: messageText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMessageText('');
    }
  };

  return (
    <SectionShell title="Messages" subtitle="Direct conversations with sellers and support">
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70">
          <div className="border-b border-white/10 p-4">
            <h3 className="text-sm font-semibold text-white">Conversations</h3>
          </div>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.name}
                onClick={() => setSelectedConversation(conv.name)}
                className={`w-full border-l-2 px-4 py-3 text-left text-sm transition ${
                  selectedConversation === conv.name
                    ? 'border-blue-500 bg-blue-600/10 text-white'
                    : 'border-transparent text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{conv.name}</span>
                  {conv.online && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">{conv.lastMessage}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/70">
          {selectedConversation ? (
            <>
              <div className="border-b border-white/10 p-4">
                <h3 className="text-sm font-semibold text-white">{selectedConversation}</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 p-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm max-w-xs ${
                        msg.sender === 'You'
                          ? 'bg-blue-600 text-white'
                          : 'border border-white/10 bg-white/5 text-slate-300'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="mt-1 text-xs opacity-70">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center p-12 text-slate-400">Select a conversation to start messaging</div>
          )}
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
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Medium' });
  const [localTickets, setLocalTickets] = useState(supportTickets);

  const handleCreateTicket = () => {
    if (form.subject && form.description) {
      const newTicket = {
        id: `TK-${Math.floor(Math.random() * 1000)}`,
        subject: form.subject,
        status: 'Pending',
      };
      setLocalTickets((prev) => [newTicket, ...prev]);
      setForm({ subject: '', description: '', priority: 'Medium' });
      setShowNewTicket(false);
    }
  };

  return (
    <SectionShell title="Support tickets" subtitle="Service requests and dispute updates">
      <div className="space-y-4">
        <button
          onClick={() => setShowNewTicket(!showNewTicket)}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          + Create ticket
        </button>

        {showNewTicket && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Subject</span>
              <input
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="What is this about?"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Priority</span>
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                rows={4}
              />
            </label>
            <div className="flex gap-2">
              <button onClick={handleCreateTicket} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
                Create ticket
              </button>
              <button onClick={() => setShowNewTicket(false)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {localTickets.length === 0 ? (
            <EmptyState title="No support tickets" description="Create a ticket to get help from our support team." />
          ) : (
            localTickets.map((ticket) => (
              <Link key={ticket.id} to={`#${ticket.id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300 transition hover:bg-slate-900/90">
                <div>
                  <p className="font-semibold text-white">{ticket.subject}</p>
                  <p className="text-xs text-slate-400">{ticket.id}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${ticket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                  {ticket.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

  const filteredInvoices = useMemo(() => {
    const query = searchTerm.toLowerCase();
    let filtered = invoices.filter((inv) => inv.id.toLowerCase().includes(query) || inv.amount.toLowerCase().includes(query));

    if (filterStatus === 'paid') filtered = filtered.filter((inv) => inv.due === 'Paid');
    if (filterStatus === 'pending') filtered = filtered.filter((inv) => inv.due !== 'Paid');

    return filtered;
  }, [filterStatus, searchTerm]);

  return (
    <SectionShell title="Invoices" subtitle="Receipts for your completed purchases">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {filteredInvoices.length === 0 ? (
          <EmptyState title="No invoices found" description="Your invoices will appear here." />
        ) : (
          <div className="space-y-2">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm text-slate-300 hover:bg-slate-900/90 transition">
                <div>
                  <p className="font-semibold text-white">{invoice.id}</p>
                  <p className="text-xs text-slate-400">{invoice.due}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-right">
                    <p className="font-semibold text-white">{invoice.amount}</p>
                    <p className="text-xs text-slate-400">
                      {invoice.due === 'Paid' ? 'Paid' : 'Scheduled'}
                    </p>
                  </span>
                  <button className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-full border border-blue-400/30 hover:bg-blue-400/10">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

export function CustomerSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    auctionReminders: true,
    orderUpdates: true,
    bidUpdates: true,
    twoFactorAuth: true,
    profilePrivate: false,
    marketingEmails: false,
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = () => {
    if (passwordForm.new === passwordForm.confirm && passwordForm.new.length >= 8) {
      // Frontend only - show success
      setPasswordForm({ current: '', new: '', confirm: '' });
      alert('Password changed successfully!');
    }
  };

  return (
    <SectionShell title="Settings" subtitle="Customize your account experience">
      <div className="space-y-6">
        {/* Notification Preferences */}
        <SubtlePanel title="Notification Preferences">
          <div className="space-y-3 text-sm text-slate-300">
            {[
              { key: 'emailNotifications' as const, label: 'Email notifications' },
              { key: 'pushNotifications' as const, label: 'Push notifications' },
              { key: 'auctionReminders' as const, label: 'Auction reminders' },
              { key: 'orderUpdates' as const, label: 'Order updates' },
              { key: 'bidUpdates' as const, label: 'Bid activity' },
              { key: 'marketingEmails' as const, label: 'Marketing emails' },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>{pref.label}</span>
                <button
                  onClick={() => handleToggle(pref.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings[pref.key] ? 'bg-emerald-600' : 'bg-slate-600'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings[pref.key] ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </SubtlePanel>

        {/* Security */}
        <SubtlePanel title="Security">
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span>Two-factor authentication</span>
                <button
                  onClick={() => handleToggle('twoFactorAuth')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings.twoFactorAuth ? 'bg-emerald-600' : 'bg-slate-600'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 font-semibold text-white">Change Password</p>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, new: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                />
                <button
                  onClick={handlePasswordChange}
                  disabled={!passwordForm.current || !passwordForm.new || passwordForm.new.length < 8}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </SubtlePanel>

        {/* Privacy */}
        <SubtlePanel title="Privacy">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Private profile</span>
              <button
                onClick={() => handleToggle('profilePrivate')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings.profilePrivate ? 'bg-emerald-600' : 'bg-slate-600'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.profilePrivate ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-400">When enabled, other users won't see your activity and profile details.</p>
          </div>
        </SubtlePanel>
      </div>
    </SectionShell>
  );
}

// Detail Pages
export function CustomerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponseDto | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<AddressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id || !/^\d+$/.test(id)) {
        setError('Invalid order identifier.');
        setLoading(false);
        return;
      }
      try {
        const orderData = await getOrderById(Number(id));
        setOrder(orderData);
        const embeddedAddress = orderData.deliveryAddress;
        if (embeddedAddress && typeof embeddedAddress === 'object') {
          const addressId = orderData.addressId ?? Number(embeddedAddress.id);
          const hasAddressDetails = Boolean(embeddedAddress.fullName && embeddedAddress.addressLine1 && embeddedAddress.city && embeddedAddress.state && embeddedAddress.postalCode && embeddedAddress.country);
          if (hasAddressDetails) {
            setResolvedAddress(null);
          } else if (Number.isFinite(addressId)) {
            try {
              setResolvedAddress(await getAddressById(addressId));
            } catch {
              setResolvedAddress(null);
            }
          }
        } else {
          setResolvedAddress(null);
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) return <SectionShell title="Order details" subtitle="Loading order"><SkeletonCard /></SectionShell>;
  if (error || !order) return <SectionShell title="Order details" subtitle="Order unavailable"><ErrorState title="Unable to load order details" description={error || 'Order not found.'} /></SectionShell>;

  const address = resolvedAddress ?? order.deliveryAddress;
  const addressValue = (keys: string[]) => {
    if (!address || typeof address !== 'object') return '';
    const addressRecord = address as Record<string, unknown>;
    return String(keys.map((key) => addressRecord[key]).find((value) => value !== undefined && value !== null && value !== '') ?? '');
  };
  const addressLines = typeof address === 'object' && address ? [
    addressValue(['fullName', 'name']),
    addressValue(['phone']),
    addressValue(['addressLine1']),
    addressValue(['addressLine2']),
    [addressValue(['city']), addressValue(['state'])].filter(Boolean).join(', '),
    [addressValue(['postalCode', 'zipCode'])].filter(Boolean).concat(addressValue(['country']) ? [addressValue(['country'])] : []).join(', '),
  ].filter(Boolean) : [];
  const productDisplay = order.items?.map((item) => item.productName || item.name || (item.productId ? `Product #${item.productId}` : 'Product details unavailable')).filter(Boolean).join(', ') || 'Product unavailable';
  const sellerDisplay = order.items?.map((item) => item.vendorName || item.sellerName).filter(Boolean).join(', ') || 'Not provided';

  return (
    <SectionShell title={`Order ${order.orderNumber || `#${order.id}`}`} subtitle="Order details and tracking information">
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between gap-4">
                  <span>Product</span>
                  <span className="text-right text-white font-medium">{productDisplay}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Seller</span>
                  <span className="text-right text-white font-medium">{sellerDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="text-white font-medium">₹{Number(order.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date</span>
                  <span className="text-white font-medium">{order.orderDate || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Delivery Information</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div>
                  <p className="text-slate-400">Delivery Address</p>
                  {address ? typeof address === 'string' ? <p className="mt-1 whitespace-pre-wrap text-white">{address}</p> : addressLines.length > 0 ? <div className="mt-1 space-y-1 text-white">{addressLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div> : <p className="mt-1 text-white">Address not available</p> : <p className="mt-1 text-white">Address not available</p>}
                </div>
                {order.trackingNumber ? <div>
                  <p className="text-slate-400">Tracking Number</p>
                  <p className="mt-1 text-white font-mono">{order.trackingNumber}</p>
                </div> : null}
                {order.expectedDeliveryDate ? <div>
                  <p className="text-slate-400">Expected Delivery</p>
                  <p className="mt-1 text-white">{order.expectedDeliveryDate}</p>
                </div> : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400 mb-2">Status</p>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-sm font-medium">
                {order.orderStatus}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400 mb-3 font-semibold">Actions</p>
              <div className="space-y-2">
                <button className="w-full rounded-full border border-blue-400/30 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-400/10">
                  Track Package
                </button>
                <button className="w-full rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5">
                  Contact Support
                </button>
                <button className="w-full rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5">
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerAuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core backend states
  const [auctionDetails, setAuctionDetails] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<any>(null);
  const [winner, setWinner] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Helper: Format currency
  const formatCurrency = (value: string | number): string => {
    const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(numeric)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  // Helper: Calculate time remaining
  const calculateTimeRemaining = (endAt?: string, status?: string): string => {
    if (!endAt || !status) return 'Loading...';
    if (status !== 'RUNNING') return status === 'ENDED' ? 'Ended' : status;

    const now = Date.now();
    const end = new Date(endAt).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s left`;
  };

  // Fetch auction details
  const fetchAuctionDetails = async () => {
    if (!id) return;
    try {
      const auctionId = Number(id);
      const auctionData = await getAuctionById(auctionId);
      setAuctionDetails(auctionData);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load auction details');
    }
  };

  // Fetch bids for the auction
  const fetchBids = async () => {
    if (!id) return;
    try {
      const auctionId = Number(id);
      const bidsData = await getAuctionBids(auctionId);
      setBids(bidsData);
    } catch (err: any) {
      console.warn('Failed to load bids:', err?.message);
    }
  };

  // Fetch registration status
  const fetchRegistrationStatus = async () => {
    if (!id) return;
    try {
      const auctionId = Number(id);
      const regStatus = await getAuctionRegistrationStatus(auctionId);
      setRegistrationStatus(regStatus);
    } catch (err: any) {
      console.warn('Failed to load registration status:', err?.message);
    }
  };

  // Fetch winner info (may return 404 if not finalized yet)
  const fetchWinner = async () => {
    if (!id) return;
    try {
      const auctionId = Number(id);
      const winnerData = await getAuctionWinner(auctionId);
      setWinner(winnerData);
    } catch (err: any) {
      // 404 or not-finalized-yet is expected, not an error
      if (err?.message?.includes('404') || err?.message?.includes('not found')) {
        setWinner(null);
      } else {
        console.warn('Failed to load winner:', err?.message);
      }
    }
  };

  // Fetch payment status for auction winner
  const fetchPaymentStatus = async () => {
    if (!id || !winner) return;
    try {
      const auctionId = Number(id);
      // Try to fetch auction-specific payment or check through winner's order
      // For now, we'll store the winner ID and check payment separately if needed
      const payments = await getPaymentsForOrder(winner.auctionId);
      if (payments && payments.length > 0) {
        setPaymentStatus(payments[0]);
      }
    } catch (err: any) {
      console.warn('Failed to load payment status:', err?.message);
    }
  };

  // Initial load: fetch all data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([fetchAuctionDetails(), fetchBids(), fetchRegistrationStatus()]);
      setLoading(false);
    };

    loadAllData();
  }, [id]);

  // After auction loads, check if it's ended to fetch winner
  useEffect(() => {
    if (auctionDetails?.status === 'ENDED') {
      fetchWinner();
    }
  }, [auctionDetails?.status]);

  // After winner loads, fetch payment status if user is winner
  useEffect(() => {
    if (winner && user && Number(user.id) === winner.winnerId) {
      fetchPaymentStatus();
    }
  }, [winner, user]);

  // Timer: Update time remaining every second
  useEffect(() => {
    if (!auctionDetails) return;

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(auctionDetails.endAt, auctionDetails.status));
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionDetails]);

  // Polling: Refresh auction status while RUNNING
  useEffect(() => {
    if (!auctionDetails || auctionDetails.status !== 'RUNNING') return;

    const pollInterval = setInterval(async () => {
      await fetchAuctionDetails();
      await fetchBids();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [auctionDetails?.status, id]);

  // When countdown reaches zero, re-fetch and check if status changed to ENDED
  useEffect(() => {
    if (!auctionDetails || timeRemaining !== '0h 0m 0s left') return;

    (async () => {
      await fetchAuctionDetails();
      await fetchBids();
    })();
  }, [timeRemaining]);

  // Handle place bid
  const handlePlaceBid = async () => {
    if (!bidAmount || !id || !user) return;

    setBidSubmitting(true);
    try {
      const auctionId = Number(id);
      const bidValue = Number(String(bidAmount).replace(/[^0-9.-]/g, ''));
      const result = await placeBid(auctionId, bidValue);

      // Success: refresh bids and auction details
      await fetchAuctionDetails();
      await fetchBids();

      setBidAmount('');
      setShowBidForm(false);
      // Show success feedback (could use toast here)
      alert('Bid placed successfully!');
    } catch (err: any) {
      alert(`Failed to place bid: ${err?.message || 'Unknown error'}`);
    } finally {
      setBidSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SectionShell title="Loading..." subtitle="Auction details">
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell title="Error" subtitle="Auction details">
        <ErrorState title="Failed to load auction" description={error} />
      </SectionShell>
    );
  }

  if (!auctionDetails) {
    return (
      <SectionShell title="Not found" subtitle="Auction details">
        <EmptyState title="Auction not found" description="This auction does not exist or has been removed." />
      </SectionShell>
    );
  }

  const currentBidAmount = bids.length > 0
    ? Math.max(...bids.map(b => Number(String(b.amount).replace(/[^0-9.-]/g, '')) || 0))
    : Number(String(auctionDetails.startingPrice).replace(/[^0-9.-]/g, '') || 0);

  const isAuctionEnded = auctionDetails.status === 'ENDED';
  const isUserWinner = winner && user && Number(user.id) === winner.winnerId;
  const isRegistered = registrationStatus?.paid === true;
  const canBid = !isAuctionEnded && isRegistered && user;

  return (
    <SectionShell title={auctionDetails.title} subtitle="Auction details and bidding">
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 overflow-hidden">
              <div className="w-full h-96 bg-slate-950 rounded-lg mb-6 flex items-center justify-center">
                <span className="text-slate-400">Auction Image</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">{auctionDetails.title}</h2>
              <p className="text-slate-300">{auctionDetails.description}</p>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <p><span className="text-slate-400">Start Price:</span> {formatCurrency(auctionDetails.startingPrice)}</p>
                <p><span className="text-slate-400">Status:</span> <span className={isAuctionEnded ? 'text-amber-400' : 'text-emerald-400'}>{auctionDetails.status}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400 mb-1">Current Bid</p>
              <p className="text-3xl font-semibold text-white">{formatCurrency(currentBidAmount)}</p>
              <p className="text-sm text-slate-400 mt-2">{bids.length} bids</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400 mb-2">Time Remaining</p>
              <p className={`text-lg font-semibold ${isAuctionEnded ? 'text-amber-300' : 'text-amber-300'}`}>
                {timeRemaining || calculateTimeRemaining(auctionDetails.endAt, auctionDetails.status)}
              </p>
            </div>

            {/* Registration Status */}
            {!isAuctionEnded && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-400 mb-2">Registration</p>
                {isRegistered ? (
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-sm font-medium">
                    Registered
                  </span>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-300">Register for ₹20 to bid</p>
                    <Link
                      to={`/customer/auctions/${id}/register`}
                      className="block text-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                      Register Now
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Bid Form */}
            {!isAuctionEnded && isRegistered && (
              <>
                <button
                  onClick={() => setShowBidForm(!showBidForm)}
                  disabled={!canBid}
                  className={`w-full rounded-full px-4 py-3 text-sm font-medium text-white transition ${
                    canBid
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  {canBid ? 'Place Bid' : 'Register to Bid'}
                </button>

                {showBidForm && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 space-y-3">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min bid: ${formatCurrency(currentBidAmount + 1000)}`}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white outline-none focus:border-blue-400/40"
                    />
                    <button
                      onClick={handlePlaceBid}
                      disabled={bidSubmitting || !bidAmount}
                      className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {bidSubmitting ? 'Placing bid...' : 'Confirm Bid'}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Auction Ended Info */}
            {isAuctionEnded && (
              <div className="rounded-2xl border border-white/10 bg-amber-500/10 p-6">
                <p className="text-sm text-amber-300 font-semibold">Auction Ended</p>
                <p className="text-sm text-amber-200 mt-2">This auction has ended. Bidding is no longer available.</p>
              </div>
            )}

            {/* Winner Info */}
            {isAuctionEnded && winner && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                <p className="text-sm font-semibold text-emerald-300">Winner</p>
                <div className="mt-3 space-y-2 text-sm text-emerald-100">
                  <p><span className="text-emerald-200">Winner ID:</span> {winner.winnerId}</p>
                  <p><span className="text-emerald-200">Final Price:</span> {formatCurrency(winner.finalPrice)}</p>
                  <p><span className="text-emerald-200">Bid ID:</span> {winner.bidId}</p>
                  <p><span className="text-emerald-200">Awarded:</span> {new Date(winner.awardedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Payment Section for Winner */}
            {isUserWinner && isAuctionEnded && (
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">
                <p className="text-sm font-semibold text-blue-300">Winner Payment</p>
                {paymentStatus?.status === 'COMPLETED' || paymentStatus?.status === 'SUCCESS' ? (
                  <div className="mt-3 rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-2 text-sm font-medium text-center">
                    Payment Completed
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-blue-100 mt-2">Amount: {formatCurrency(winner.finalPrice)}</p>
                    <button
                      type="button"
                      onClick={() => navigate(`/auction/${id}`)}
                      className="mt-3 block w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                    >
                      Pay Now
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bid History */}
        {bids.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bid History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...bids].reverse().map((bid, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm text-slate-300 border-b border-white/5 pb-2">
                  <span>Bid #{bid.id}</span>
                  <span className="font-semibold text-white">{formatCurrency(bid.amount)}</span>
                  <span className="text-xs text-slate-500">{new Date(bid.placedAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

export function VendorBusinessInfoPage() {
  const [verification, setVerification] = useState<{ businessDetails?: { status?: string; lastUpdated?: string; remarks?: string | null } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getVendorVerificationStatus();
        if (active) {
          setVerification(response);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load business verification status.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SectionShell title="Business information" subtitle="Set your storefront identity and legal profile">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SubtlePanel title="Store identity">
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Business details: {verification?.businessDetails?.status ?? 'PENDING'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Last updated: {verification?.businessDetails?.lastUpdated ?? 'Not available'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Remarks: {verification?.businessDetails?.remarks ?? 'No remarks'}</div>
          </div>
        </SubtlePanel>
        <SubtlePanel title="Trust signals">
          <div className="rounded-[20px] border border-white/10 bg-gradient-to-br from-emerald-600/10 to-blue-500/10 p-5 text-sm text-slate-300">
            <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-300" /> {loading ? 'Loading vendor status…' : error ? 'Verification unavailable' : verification?.businessDetails?.status === 'COMPLETE' ? 'Verified business profile recognised by buyers' : 'Business verification is still pending'}</p>
            <p className="mt-3">{error ? error : 'Your brand highlights are live on product pages and auction listings once backend verification is complete.'}</p>
          </div>
        </SubtlePanel>
      </div>
    </SectionShell>
  );
}

export function VendorGstPage() {
  const [verification, setVerification] = useState<{ gstAndBank?: { status?: string; lastUpdated?: string; remarks?: string | null } } | null>(null);
  const [profile, setProfile] = useState<VendorProfileResponse | null>(null);
  const [gstNumber, setGstNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vendorProfile, status] = await Promise.all([getVendorProfile(), getVendorVerificationStatus()]);
      setProfile(vendorProfile);
      setGstNumber(vendorProfile.gstNumber ?? vendorProfile.gst ?? '');
      setVerification(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load GST and bank status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveGst = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const nextProfile = await updateVendorProfile({ gstNumber: gstNumber.trim(), gst: gstNumber.trim() });
      setProfile((current) => ({ ...(current ?? { id: 0 }), ...nextProfile, gstNumber: nextProfile.gstNumber ?? nextProfile.gst ?? gstNumber.trim(), gst: nextProfile.gst ?? nextProfile.gstNumber ?? gstNumber.trim() }));
      setMessage('GST details saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save GST details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell title="GST details" subtitle="Tax compliance information for your seller account">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            `GST and bank status: ${verification?.gstAndBank?.status ?? 'PENDING'}`,
            `Last updated: ${verification?.gstAndBank?.lastUpdated ?? 'Not available'}`,
            `Remarks: ${verification?.gstAndBank?.remarks ?? 'No remarks'}`,
          ].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">{item}</div>)}
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">GST number</h3>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">{profile?.gstNumber || profile?.gst ? 'Saved' : 'Optional'}</span>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">GST / tax ID</span>
            <input type="text" value={gstNumber} onChange={(event) => setGstNumber(event.target.value)} placeholder="Enter GST number or leave blank" className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40" />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryButton disabled={saving || loading} onClick={saveGst}>{saving ? 'Saving…' : 'Save GST details'}</PrimaryButton>
          </div>

          <p className="mt-3 text-xs text-slate-400">GST is optional for onboarding, but it helps with compliance and tax reporting.</p>
        </div>

        {message ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}
        {error && <div className="mt-4"><ErrorState title="Verification error" description={error} /></div>}
        {loading && <div className="mt-4"><SkeletonCard /></div>}
      </div>
    </SectionShell>
  );
}

export function VendorBankPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<VendorProfileResponse | null>(null);
  const [bankRecord, setBankRecord] = useState<VendorBankRecord | null>(null);
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);
  const [form, setForm] = useState({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', branchName: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [vendorProfile, vendorBank] = await Promise.all([
          getVendorProfile(),
          getVendorBankRecord(),
        ]);
        if (!active) return;
        setProfile(vendorProfile);
        setBankRecord(vendorBank);

        setForm({
          accountHolderName: vendorBank?.accountHolderName ?? vendorBank?.account_holder_name ?? vendorProfile.accountHolderName ?? vendorProfile.account_holder_name ?? '',
          bankName: vendorBank?.bankName ?? vendorBank?.bank_name ?? vendorProfile.bankName ?? vendorProfile.bank_name ?? '',
          accountNumber: vendorBank?.accountNumber ?? vendorBank?.bankAccountNumber ?? vendorBank?.bank_account_number ?? vendorProfile.accountNumber ?? vendorProfile.bankAccountNumber ?? vendorProfile.bank_account_number ?? '',
          ifscCode: vendorBank?.ifsc ?? vendorBank?.ifsc_code ?? vendorBank?.ifscCode ?? vendorProfile.ifsc ?? vendorProfile.ifsc_code ?? vendorProfile.ifscCode ?? '',
          branchName: vendorBank?.branch ?? vendorBank?.branch_name ?? vendorBank?.branchName ?? vendorProfile.branchName ?? vendorProfile.branch_name ?? vendorProfile.bankBranch ?? vendorProfile.bank_branch ?? '',
        });
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load bank details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const saveBankDetails = async () => {
    const cleaned = {
      accountHolderName: form.accountHolderName.trim(),
      accountNumber: form.accountNumber.trim(),
      bankName: form.bankName.trim(),
      ifsc: form.ifscCode.trim(),
      branch: form.branchName.trim(),
    };

    if (!cleaned.bankName || !cleaned.accountNumber || !cleaned.ifsc || !cleaned.branch) {
      setError('Bank name, account number, IFSC and branch are required for payouts.');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        accountHolderName: cleaned.accountHolderName,
        bankName: cleaned.bankName,
        accountNumber: cleaned.accountNumber,
        ifsc: cleaned.ifsc,
        branch: cleaned.branch,
      };

      await saveVendorBankRecord(payload);

      const refreshed = await getVendorBankRecord();
      setBankRecord(refreshed);
      setProfile((current) => ({
        ...(current ?? { id: 0 }),
        accountHolderName: refreshed?.accountHolderName ?? refreshed?.account_holder_name ?? cleaned.accountHolderName,
        bankName: refreshed?.bankName ?? refreshed?.bank_name ?? cleaned.bankName,
        accountNumber: refreshed?.accountNumber ?? refreshed?.bankAccountNumber ?? cleaned.accountNumber,
        ifsc: refreshed?.ifsc ?? refreshed?.ifscCode ?? cleaned.ifsc,
        branch: refreshed?.branch ?? refreshed?.branchName ?? cleaned.branch,
        account_holder_name: refreshed?.accountHolderName ?? refreshed?.account_holder_name ?? cleaned.accountHolderName,
        bank_name: refreshed?.bankName ?? refreshed?.bank_name ?? cleaned.bankName,
        bank_account_number: refreshed?.accountNumber ?? refreshed?.bankAccountNumber ?? cleaned.accountNumber,
        ifsc_code: refreshed?.ifsc ?? refreshed?.ifscCode ?? cleaned.ifsc,
        branch_name: refreshed?.branch ?? refreshed?.branchName ?? cleaned.branch,
      }));
      setForm({
        accountHolderName: refreshed?.accountHolderName ?? refreshed?.account_holder_name ?? cleaned.accountHolderName,
        bankName: refreshed?.bankName ?? refreshed?.bank_name ?? cleaned.bankName,
        accountNumber: refreshed?.accountNumber ?? refreshed?.bankAccountNumber ?? cleaned.accountNumber,
        ifscCode: refreshed?.ifsc ?? refreshed?.ifscCode ?? cleaned.ifsc,
        branchName: refreshed?.branch ?? refreshed?.branchName ?? cleaned.branch,
      });
      setMessage('Bank details saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save bank details.');
    } finally {
      setSaving(false);
    }
  };

  const hasBankDetails = Boolean(profile?.bankAccountNumber || profile?.accountNumber || bankRecord?.accountNumber || form.accountNumber.trim());
  const hasRequiredBankFields = Boolean(form.bankName.trim() && form.accountNumber.trim() && form.ifscCode.trim() && form.branchName.trim());

  return (
    <SectionShell title="Bank details" subtitle="Secure payout and settlement setup">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
          <h3 className="text-lg font-semibold text-white">Saved bank account</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Account holder: {bankRecord?.accountHolderName ?? bankRecord?.account_holder_name ?? 'Not provided yet'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Bank name: {bankRecord?.bankName || profile?.bankName || 'Not provided yet'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Account number: {bankRecord?.accountNumber || bankRecord?.bankAccountNumber || profile?.accountNumber || profile?.bankAccountNumber || 'Not provided yet'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">IFSC: {bankRecord?.ifsc || bankRecord?.ifscCode || profile?.ifsc || profile?.ifscCode || 'Not provided yet'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">Branch: {bankRecord?.branch || bankRecord?.branchName || bankRecord?.bankBranch || profile?.branchName || profile?.bankBranch || 'Not provided yet'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">Bank proof: {bankRecord?.bankProofName || bankRecord?.bankDocumentName || profile?.bankProofName || profile?.bankDocumentName || 'Not provided yet'}{(bankRecord?.bankProofUrl || bankRecord?.bankDocumentUrl || profile?.bankProofUrl || profile?.bankDocumentUrl) ? <a href={bankRecord?.bankProofUrl || bankRecord?.bankDocumentUrl || profile?.bankProofUrl || profile?.bankDocumentUrl} target="_blank" rel="noreferrer" className="ml-2 text-emerald-300 underline">View</a> : null}</div>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Update bank details</h3>
            {!hasBankDetails && <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-200">Required for payouts</span>}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Account holder name</span>
              <input value={form.accountHolderName} onChange={(event) => setForm((current) => ({ ...current, accountHolderName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40" placeholder="Name as per bank account" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Bank name</span>
              <input value={form.bankName} onChange={(event) => setForm((current) => ({ ...current, bankName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40" placeholder="e.g. SBI" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Account number</span>
              <input value={form.accountNumber} onChange={(event) => setForm((current) => ({ ...current, accountNumber: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40" placeholder="Enter account number" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">IFSC code</span>
              <input value={form.ifscCode} onChange={(event) => setForm((current) => ({ ...current, ifscCode: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40" placeholder="e.g. SBIN0001234" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-300">Branch name</span>
              <input value={form.branchName} onChange={(event) => setForm((current) => ({ ...current, branchName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40" placeholder="Branch / location" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-300">Bank proof</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,pdf"
                onChange={(event) => setBankProofFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none file:mr-3 file:rounded-full file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
              />
              <span className="mt-2 block text-xs text-slate-400">Bank proof upload is currently separate from /api/vendors/me/bank and is not sent in the bank save payload until backend support is added.</span>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryButton disabled={saving || loading || !hasRequiredBankFields} onClick={saveBankDetails}>{saving ? 'Saving…' : 'Save bank details'}</PrimaryButton>
            {!hasRequiredBankFields && <span className="self-center text-xs text-amber-200">Complete the required bank fields before payout is enabled.</span>}
          </div>
        </div>

        {message ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}
        {error && <div className="mt-4"><ErrorState title="Bank update error" description={error} /></div>}
        {loading && <div className="mt-4"><SkeletonCard /></div>}
      </div>
    </SectionShell>
  );
}

export function VendorIdentityPage() {
  const [verification, setVerification] = useState<{ identityVerification?: { status?: string; lastUpdated?: string; remarks?: string | null } } | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await getVendorVerificationStatus();
        if (active) {
          setVerification(response);
        }
      } catch {
        // keep section visible and show pending when backend is unavailable
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SectionShell title="Identity verification" subtitle="Complete KYC for higher trust and limits">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p className={statusTone(verification?.identityVerification?.status)}>Identity verification status: {verification?.identityVerification?.status ?? 'PENDING'}</p>
        <p className="mt-3">Last updated: {verification?.identityVerification?.lastUpdated ?? 'Not available'}</p>
        <p className="mt-3">Remarks: {verification?.identityVerification?.remarks ?? 'No remarks'}</p>
      </div>
    </SectionShell>
  );
}

export function VendorStoreVerificationPage() {
  const [verification, setVerification] = useState<{ businessDetails?: { status?: string; lastUpdated?: string; remarks?: string | null }; gstAndBank?: { status?: string }; identityVerification?: { status?: string } } | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await getVendorVerificationStatus();
        if (active) {
          setVerification(response);
        }
      } catch {
        // do not invent status
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SectionShell title="Store verification" subtitle="Your storefront quality standards and review status">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-300">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: 'Business details', value: verification?.businessDetails?.status ?? 'PENDING' },
            { label: 'GST and bank', value: verification?.gstAndBank?.status ?? 'PENDING' },
            { label: 'Identity verification', value: verification?.identityVerification?.status ?? 'PENDING' },
          ].map((step) => (
            <div key={step.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-slate-400">{step.label}</p>
              <p className={`mt-2 font-semibold ${statusTone(step.value)}`}>{step.value}</p>
            </div>
          ))}
        </div>
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
  const [balance, setBalance] = useState<WithdrawalBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [balanceResponse, withdrawalsResponse] = await Promise.all([getVendorWithdrawalBalance(), getVendorWithdrawals()]);
        if (active) {
          setBalance(balanceResponse);
          setWithdrawals(withdrawalsResponse);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load withdrawal details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const availableBalance = balance?.availableBalance ?? balance?.balance ?? 0;

  return (
    <SectionShell title="Vendor wallet" subtitle="Payout balance and settlement insights" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Wallet' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <Card>
            {error ? <ErrorState title="Unable to load withdrawals" description={error} /> : null}
            {loading ? <SkeletonCard /> : (
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-slate-400">Available balance</p>
                <p className="mt-2 text-3xl font-semibold text-white">{toMoney(availableBalance)}</p>
                <p className="mt-1 text-sm text-slate-400">Settled: {toMoney(balance?.settledBalance)} • Pending: {toMoney(balance?.pendingBalance)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/vendor/withdraw" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Withdraw</Link>
                <Link to="/vendor/transactions" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">View transactions</Link>
              </div>
            </div>
            )}
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
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-t border-white/6 hover:bg-white/5">
                        <td className="px-3 py-3">{withdrawal.id}</td>
                        <td className="px-3 py-3">{toMoney(withdrawal.amount)}</td>
                        <td className="px-3 py-3"><Badge className={withdrawal.status?.toLowerCase() === 'pending' ? 'bg-amber-500/10 text-amber-200' : 'bg-emerald-500/10 text-emerald-200'}>{withdrawal.status || 'Unknown'}</Badge></td>
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
  const [balance, setBalance] = useState<WithdrawalBalance | null>(null);
  const [bankRecord, setBankRecord] = useState<VendorBankRecord | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [withdrawalBalanceResult, vendorBankResult] = await Promise.allSettled([
          getVendorWithdrawalBalance(),
          getVendorBankRecord(),
        ]);

        if (!active) return;

        if (withdrawalBalanceResult.status === 'fulfilled') {
          setBalance(withdrawalBalanceResult.value);
        } else if (withdrawalBalanceResult.reason instanceof Error) {
          setBalance({ availableBalance: 0, balance: 0 });
        }

        if (vendorBankResult.status === 'fulfilled') {
          setBankRecord(vendorBankResult.value);
        } else {
          setBankRecord(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load your balance and bank details.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const accountHolderName = String(bankRecord?.accountHolderName ?? bankRecord?.account_holder_name ?? '').trim();
  const bankName = String(bankRecord?.bankName ?? bankRecord?.bank_name ?? '').trim();
  const accountNumber = String(bankRecord?.accountNumber ?? bankRecord?.bankAccountNumber ?? bankRecord?.bank_account_number ?? '').trim();
  const ifsc = String(bankRecord?.ifsc ?? bankRecord?.ifscCode ?? bankRecord?.ifsc_code ?? '').trim();
  const branch = String(bankRecord?.branch ?? bankRecord?.branchName ?? bankRecord?.branch_name ?? bankRecord?.bankBranch ?? bankRecord?.bank_branch ?? '').trim();
  const hasCompleteBankDetails = Boolean(accountHolderName && bankName && accountNumber && ifsc && branch);
  const maskedAccountNumber = accountNumber ? `******${accountNumber.slice(-4)}` : 'Not provided yet';

  const submitWithdrawal = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid withdrawal amount.');
      return;
    }

    if (!hasCompleteBankDetails) {
      setError('Add your bank details before requesting a payout.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await createVendorWithdrawal(numericAmount);
      setAmount('');
      setMessage('Withdrawal request submitted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit withdrawal.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableBalance = balance?.availableBalance ?? balance?.balance ?? 0;

  return (
    <SectionShell title="Withdraw" subtitle="Transfer your earnings securely" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Withdraw' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <Card>
            {loading ? <SkeletonCard /> : (
              <>
                <p className="text-lg font-semibold text-white">Available balance: {toMoney(availableBalance)}</p>
                <p className="mt-2 text-sm text-slate-300">Pending: {toMoney(balance?.pendingBalance)} • Settled: {toMoney(balance?.settledBalance)}</p>
                {bankRecord ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Saved bank account</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-200">
                      <p><span className="text-slate-400">Account holder:</span> {accountHolderName || 'Not provided yet'}</p>
                      <p><span className="text-slate-400">Bank name:</span> {bankName || 'Not provided yet'}</p>
                      <p><span className="text-slate-400">Account number:</span> {maskedAccountNumber}</p>
                      <p><span className="text-slate-400">IFSC:</span> {ifsc || 'Not provided yet'}</p>
                      <p><span className="text-slate-400">Branch:</span> {branch || 'Not provided yet'}</p>
                    </div>
                  </div>
                ) : null}
              </>
            )}
            {!bankRecord && !loading ? (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                Add your bank account details in the bank settings page before requesting a payout.
              </div>
            ) : null}
            {error ? <div className="mt-4"><ErrorState title="Withdrawal error" description={error} /></div> : null}
            {message ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}
            <label className="mt-4 block max-w-md">
              <span className="mb-2 block text-sm font-medium text-slate-300">Withdrawal amount</span>
              <input type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-blue-400/40" placeholder="Enter amount" />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={submitWithdrawal} disabled={submitting || loading || !hasCompleteBankDetails} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Submitting…' : 'Request payout'}</button>
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
  const [revenue, setRevenue] = useState<{ totalRevenue?: number; completedRevenue?: number; pendingRevenue?: number; availableBalance?: number; totalOrders?: number; completedOrders?: number; dailyRevenue?: number; weeklyRevenue?: number; monthlyRevenue?: number; lastUpdated?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getVendorRevenue();
        if (active) {
          setRevenue(response);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load vendor revenue.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const metrics = [
    { label: 'Total revenue', value: toMoney(revenue?.totalRevenue) },
    { label: 'Completed revenue', value: toMoney(revenue?.completedRevenue) },
    { label: 'Pending revenue', value: toMoney(revenue?.pendingRevenue) },
    { label: 'Available balance', value: toMoney(revenue?.availableBalance) },
    { label: 'Daily revenue', value: toMoney(revenue?.dailyRevenue) },
    { label: 'Monthly revenue', value: toMoney(revenue?.monthlyRevenue) },
  ];

  return (
    <SectionShell title="Sales analytics" subtitle="Revenue, conversion and repeat buyer trends">
      {loading ? <SkeletonTable /> : error ? <ErrorState title="Revenue error" description={error} /> : (
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((report) => (
            <div key={report.label} className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4">
              <p className="text-sm text-slate-400">{report.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{report.value}</p>
            </div>
          ))}
          <div className="rounded-[20px] border border-white/10 bg-slate-900/70 p-4 md:col-span-3">
            <p className="text-sm text-slate-400">Last updated</p>
            <p className="mt-2 text-lg font-semibold text-white">{revenue?.lastUpdated ?? 'Not available'}</p>
          </div>
        </div>
      )}
    </SectionShell>
  );
}

export function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrderApiResponse[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVendorOrders();
        if (active) {
          setOrders(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load vendor orders.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();
    return orders.filter((order) => {
      const customerName = (order.customerName || order.customer || 'Customer').toLowerCase();
      const orderId = String(order.orderNumber || order.id).toLowerCase();
      const status = String(order.orderStatus || order.status || 'pending').toLowerCase();
      const matchesSearch = orderId.includes(query) || customerName.includes(query);
      const matchesStatus = statusFilter === 'All' || status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const pageOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const statusColors: Record<string, string> = {
    delivered: 'bg-emerald-500/10 text-emerald-200',
    shipped: 'bg-blue-500/10 text-blue-200',
    processing: 'bg-amber-500/10 text-amber-200',
    pending: 'bg-slate-500/10 text-slate-200',
    cancelled: 'bg-rose-500/10 text-rose-200',
  };
  const nextStatus = (order: VendorOrderApiResponse) => {
    const current = getOrderStatus(order).toUpperCase();
    const statuses = ['CONFIRMED', 'PACKING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const index = statuses.indexOf(current);
    return index >= 0 && index < statuses.length - 1 ? statuses[index + 1] : 'N/A';
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
            ) : error ? (
              <ErrorState title="Orders error" description={error} />
            ) : filteredOrders.length === 0 ? (
              <EmptyState title="No matching orders" description="There are no vendor orders for the current backend response." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] table-auto text-sm">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="px-3 py-3">Product Name</th>
                      <th className="px-3 py-3">Order Number</th>
                      <th className="px-3 py-3">Order Type</th>
                      <th className="px-3 py-3">Vendor</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Order Status</th>
                      <th className="px-3 py-3">Total Amount</th>
                      <th className="px-3 py-3">Delivery Address</th>
                      <th className="px-3 py-3">Next Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {pageOrders.map((order) => (
                      <tr key={order.id} className="border-t border-white/6 hover:bg-white/5">
                        <td className="px-3 py-3 text-white">{getOrderProductName(order)}</td>
                        <td className="px-3 py-3 font-medium text-white">{formatOrderNumber(order)}</td>
                        <td className="px-3 py-3">{getOrderType(order)}</td>
                        <td className="px-3 py-3">{getOrderVendor(order)}</td>
                        <td className="px-3 py-3">{getOrderCustomer(order)}</td>
                        <td className="px-3 py-3"><Badge className={statusColors[getOrderStatus(order).toLowerCase()] ?? 'bg-slate-500/10 text-slate-200'}>{getOrderStatus(order)}</Badge></td>
                        <td className="px-3 py-3">{getOrderTotal(order)}</td>
                        <td className="px-3 py-3"><DeliveryAddressViewer address={order.deliveryAddress} /></td>
                        <td className="px-3 py-3">{nextStatus(order)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && filteredOrders.length > 0 && (
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
  const [products, setProducts] = useState<VendorProductApiResponse[]>([]);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('All');
  const [sortKey, setSortKey] = useState<'name' | 'stock' | 'health'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await getVendorProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load vendor inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    void getVendorProducts()
      .then((data) => {
        if (active) {
          setProducts(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load vendor inventory.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredInventory = useMemo(() => {
    const normalized = search.toLowerCase().trim();
    let items = products.map((product) => {
      const stock = Number(product.stock ?? product.quantity ?? 0);
      const status = String(product.status || 'ACTIVE');
      const health = stock === 0 ? 'Out of stock' : stock < 5 ? 'Low stock' : 'Healthy';

      return {
        id: product.id,
        sku: String(product.sku || product.id),
        name: product.name,
        sellingType: String(product.sellingType || '').trim().toUpperCase(),
        stock,
        health,
        status,
        lastUpdated: 'Backend data',
      };
    }).filter((item) => item.name.toLowerCase().includes(normalized) || item.sku.toLowerCase().includes(normalized));
    if (healthFilter !== 'All') {
      items = items.filter((item) => item.health === healthFilter);
    }
    return items.sort((a, b) => {
      const left = (a as any)[sortKey];
      const right = (b as any)[sortKey];
      if (sortKey === 'stock') {
        const aValue = Number(left);
        const bValue = Number(right);
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortDir === 'asc' ? String(left).localeCompare(String(right)) : String(right).localeCompare(String(left));
    });
  }, [healthFilter, products, search, sortDir, sortKey]);

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

  const buildPublishPayload = (product: VendorProductApiResponse) => ({
    name: product.name,
    description: product.description ?? '',
    price: product.price,
    sku: product.sku,
    status: 'PUBLISHED' as const,
    brandId: product.brandId ?? null,
    categoryId: product.categoryId ?? null,
    sellingType: product.sellingType ?? 'DIRECT_BUY',
    quantity: product.quantity ?? product.stock ?? 0,
  });

  const handlePublish = async (productId: number) => {
    setError(null);
    const product = products.find((item) => item.id === productId);
    if (!product) {
      setError('Unable to find the selected vendor product.');
      return;
    }

    if (String(product.sellingType || '').trim().toUpperCase() === 'AUCTION') {
      window.location.assign(`/vendor/create-auction-wizard?productId=${productId}`);
      return;
    }

    setActionLoading(true);
    try {
      await updateVendorProduct(productId, buildPublishPayload(product));
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish vendor product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    setActionLoading(true);
    setError(null);
    try {
      await deleteVendorProduct(productId);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete vendor product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'delete') => {
    const productIds = products
      .filter((product) => selected.includes(String(product.sku || product.id)))
      .map((product) => product.id);

    setActionLoading(true);
    setError(null);
    try {
      if (action === 'publish') {
        await Promise.all(productIds.map((productId) => {
          const product = products.find((item) => item.id === productId);
          if (!product) {
            throw new Error('Unable to find one of the selected vendor products.');
          }
          return updateVendorProduct(productId, buildPublishPayload(product));
        }));
      } else {
        await Promise.all(productIds.map((productId) => deleteVendorProduct(productId)));
      }
      setSelected([]);
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${action} vendor products.`);
    } finally {
      setActionLoading(false);
    }
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
              <SecondaryButton onClick={() => handleBulkAction('publish')} disabled={selected.length === 0 || actionLoading}>Publish</SecondaryButton>
              <SecondaryButton onClick={() => handleBulkAction('delete')} disabled={selected.length === 0 || actionLoading}>Delete</SecondaryButton>
            </div>
          </div>

          <Card>
            {loading ? (
              <SkeletonTable />
            ) : error ? (
              <ErrorState title="Inventory error" description={error} />
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
                      <th className="px-3 py-3">Actions</th>
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
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => void handlePublish(item.id)} disabled={actionLoading} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 disabled:opacity-50">Publish</button>
                            <button onClick={() => void handleDelete(item.id)} disabled={actionLoading} className="rounded-full border border-rose-500/20 px-3 py-1 text-xs text-rose-200 disabled:opacity-50">Delete</button>
                          </div>
                        </td>
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
  const [products, setProducts] = useState<VendorProductApiResponse[]>([]);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState('All');
  const [auctionFilter, setAuctionFilter] = useState('All');
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
  setLoading(true);
  setError(null);

  try {
    const data = await getVendorProducts();

    if (active) {
      setProducts(
        data.filter(
          (product) =>
            String(product.status || '').toUpperCase() !== 'DISCONTINUED'
        )
      );
    }
  } catch (err) {
    if (active) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load vendor products.'
      );
    }
  } finally {
    if (active) {
      setLoading(false);
    }
  }
};

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const normalizedProducts = useMemo(() => {
    return products
      .filter((item) => {
        const searchText = `${item.name ?? ''} ${item.sku ?? ''} ${item.categoryId ?? ''}`.toLowerCase();
        const matchesSearch = !search || searchText.includes(search.trim().toLowerCase());
        const status = String(item.status || 'ACTIVE').toLowerCase();
        const sellingType = String(item.sellingType || 'DIRECT_BUY').toUpperCase();
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'Auction' && sellingType === 'AUCTION') || (statusFilter === 'Live' && status.includes('live')) || (statusFilter === 'Draft' && status.includes('draft')) || (statusFilter === 'Archived' && status.includes('archived')) || (statusFilter === 'All');
        const matchesCategory = categoryFilter === 'All' || String(item.categoryId ?? 'General') === categoryFilter;
        const stock = Number(item.stock ?? 0);
        const matchesStock = stockFilter === 'All' || (stockFilter === 'In stock' && stock > 0) || (stockFilter === 'Low stock' && stock > 0 && stock < 5) || (stockFilter === 'Out of stock' && stock === 0) || (stockFilter === 'Reserved' && stock > 0 && stock < 3);
        const matchesFeatured = featuredFilter === 'All' || (featuredFilter === 'Featured' ? true : true);
        const matchesAuction = auctionFilter === 'All' || (auctionFilter === 'Auction' && sellingType === 'AUCTION') || (auctionFilter === 'Regular' && sellingType !== 'AUCTION');
        return matchesSearch && matchesStatus && matchesCategory && matchesStock && matchesFeatured && matchesAuction;
      })
      .map((item) => ({
  id: item.id,
  sku: String(item.sku || item.id),
  name: item.name,
  category: item.categoryId != null ? `Category ${item.categoryId}` : 'General',
  price: toMoney(item.price),
  stock: Number(item.stock ?? 0),
  status: String(item.status || 'Active'),
  auctionStatus: mapSellingTypeLabel(item.sellingType),
  image: getProductImage(item),
  badge: mapSellingTypeLabel(item.sellingType),
  views: '0',
  favorites: 0,
  featured: true,
}))
      .sort((a, b) => {
        if (sortKey === 'price') {
          const left = Number(String(a.price).replace(/[^0-9]/g, '')) || 0;
          const right = Number(String(b.price).replace(/[^0-9]/g, '')) || 0;
          return sortDir === 'asc' ? left - right : right - left;
        }
        if (sortKey === 'stock') {
          return sortDir === 'asc' ? a.stock - b.stock : b.stock - a.stock;
        }
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      });
  }, [products, search, statusFilter, categoryFilter, stockFilter, featuredFilter, auctionFilter, sortDir, sortKey]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(normalizedProducts.length / pageSize));
  const currentProducts = normalizedProducts.slice((page - 1) * pageSize, page * pageSize);
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
const handleQuickAction = (action: string, item: { name: string }) => {
  alert(`${action} ${item.name}`);
};

const handleDeleteProduct = async (
  productId: number,
  productName: string
) => {
  if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
    return;
  }

  try {
    await deleteVendorProduct(productId);
    console.log('Deleted product:', productId);

    setProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );

    setSelected((prev) =>
      prev.filter((sku) => sku !== String(productId))
    );
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : 'Failed to delete product.'
    );
  }
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
                {Array.from(new Set(products.map((item) => String(item.categoryId ?? 'General')))).map((category) => (
                  <option key={category} value={category}>{category === 'General' ? 'General' : `Category ${category}`}</option>
                ))}
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
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as 'name' | 'price' | 'stock')} className="rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white">
                <option value="name">Sort by name</option>
                <option value="price">Sort by price</option>
                <option value="stock">Sort by stock</option>
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
          ) : error ? (
            <ErrorState title="Products error" description={error} />
          ) : normalizedProducts.length === 0 ? (
            <EmptyState title="No products found" description="There are no backend products for this vendor in the current response." />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                  <span>{normalizedProducts.length} products</span>
                  <span>{selected.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Duplicate', { name: `${selected.length} items` })}>Duplicate</SecondaryButton>
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Publish', { name: `${selected.length} items` })}>Publish</SecondaryButton>
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Feature', { name: `${selected.length} items` })}>Feature</SecondaryButton>
                  <SecondaryButton disabled={selected.length === 0} onClick={() => handleQuickAction('Archive', { name: `${selected.length} items` })}>Archive</SecondaryButton>

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
                          <Badge className={product.status.toLowerCase().includes('archived') ? 'bg-rose-500/10 text-rose-200' : 'bg-blue-500/10 text-blue-200'}>{product.status}</Badge>
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
                        <th className="px-3 py-3">Selling type</th>
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
                          <td className="px-3 py-3"><Badge className={item.status.toLowerCase().includes('archived') ? 'bg-rose-500/10 text-rose-200' : 'bg-emerald-500/10 text-emerald-200'}>{item.status}</Badge></td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Link to={`/vendor/edit-product-wizard/${item.sku}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Edit</Link>
                              <button onClick={() => handleQuickAction('Publish', item)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Publish</button>
                              <button onClick={() => handleQuickAction('Duplicate', item)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">Duplicate</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">Showing {currentProducts.length} of {normalizedProducts.length} products</p>
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
  const [auctions, setAuctions] = useState<VendorAuctionApiResponse[]>([]);
  const [tab, setTab] = useState<'Live' | 'Scheduled' | 'Ended'>('Live');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVendorAuctions();
        if (active) {
          setAuctions(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load vendor auctions.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAuctions();
    return () => {
      active = false;
    };
  }, []);

  const normalizedAuctions = auctions.map((auction) => {
    const effectiveStatus = getEffectiveAuctionStatus(auction.status, auction.startAt, auction.endAt);
    const normalizedStatus = effectiveStatus === 'RUNNING' ? 'Live' : effectiveStatus === 'SCHEDULED' ? 'Scheduled' : effectiveStatus === 'ENDED' ? 'Ended' : effectiveStatus === 'CANCELLED' ? 'Cancelled' : String(auction.status || 'SCHEDULED');
    return {
      id: auction.id,
      title: auction.title,
      status: normalizedStatus,
      currentBid: toMoney(auction.startingPrice ?? 0),
      highestBid: toMoney(auction.startingPrice ?? 0),
      remaining: auction.endAt ? new Date(auction.endAt).toLocaleString() : '—',
      type: 'Auction',
    };
  });

  const liveAuctions = normalizedAuctions.filter((auction) => auction.status === 'Live');
  const scheduledAuctions = normalizedAuctions.filter((auction) => auction.status === 'Scheduled');
  const endedAuctions = normalizedAuctions.filter((auction) => auction.status === 'Ended');
  const tabs = [
    { label: 'Live', count: liveAuctions.length },
    { label: 'Scheduled', count: scheduledAuctions.length },
    { label: 'Ended', count: endedAuctions.length },
  ];

  const current = tab === 'Live' ? liveAuctions : tab === 'Scheduled' ? scheduledAuctions : endedAuctions;

  return (
    <SectionShell title="Auction analytics" subtitle="Bid velocity and conversion insights" breadcrumbs={[{ label: 'Vendor', to: '/dashboards/vendor' }, { label: 'Auction analytics' }]}>
      <div className="lg:flex lg:gap-6">
        <VendorSidebar />
        <main className="flex-1">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6">
            {loading ? (
              <SkeletonTable />
            ) : error ? (
              <ErrorState title="Auction error" description={error} />
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  {tabs.map((item) => (
                    <button key={item.label} onClick={() => setTab(item.label as 'Live' | 'Scheduled' | 'Ended')} className={`rounded-full px-4 py-2 text-sm ${tab === item.label ? 'bg-emerald-500/10 text-emerald-200' : 'bg-white/5 text-slate-300'}`}>
                      {item.label} <span className="text-slate-400">({item.count})</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Total auctions</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{normalizedAuctions.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Live auctions</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{liveAuctions.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Average start price</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{toMoney(normalizedAuctions.reduce((sum, auction) => sum + Number(String(auction.currentBid).replace(/[^0-9]/g, '')) || 0, 0) / Math.max(1, normalizedAuctions.length))}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {current.length === 0 ? (
                    <EmptyState title="No auctions found" description="The backend returned no auctions for this vendor." />
                  ) : (
                    current.map((auction) => (
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
                              <p className="text-sm text-slate-400">Starting price</p>
                              <p className="text-white">{auction.currentBid}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">Ends</p>
                              <p className="text-white">{auction.remaining}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
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
