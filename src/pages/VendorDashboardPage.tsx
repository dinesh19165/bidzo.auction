import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, PackageCheck, ShoppingBag, TrendingUp, Wallet, Truck, Upload, FileCheck2, ShieldCheck, LoaderCircle } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { Card } from '../components/common/Card';
import SalesChart from '../components/common/SalesChart';
import VendorSidebar from '../components/layout/VendorSidebar';
import { ErrorState, SkeletonCard } from '../components/loading/LoadingComponents';
import { getVendorDashboard, type VendorDashboardResponse } from '../api/vendorDashboardApi';
import { getStoredVendorProfileId } from '../api/authApi';
import { getVendorDocuments, uploadVendorDocument, type VendorDocumentRecord } from '../api/vendorApi';
import { useAuth } from '../context/AuthContext';

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

type KycIdType = 'aadhaar' | 'pan' | 'selfie';

type KycStatus = 'Pending' | 'Uploaded / Pending Verification' | 'Verified';

const formatFileSize = (bytes: number | undefined) => {
  const safeSize = typeof bytes === 'number' && Number.isFinite(bytes) ? bytes : 0;

  if (safeSize <= 0) {
    return '0 KB';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(safeSize) / Math.log(1024)), units.length - 1);
  const value = safeSize / (1024 ** index);
  return `${value < 10 && index > 0 ? value.toFixed(1) : value.toFixed(0)} ${units[index]}`;
};

export function VendorDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<VendorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kycOpen, setKycOpen] = useState(false);
  const [vendorId, setVendorId] = useState<string | number | undefined>(() => {
    const authenticatedVendorId = user?.vendorProfileId ?? user?.vendorId ?? getStoredVendorProfileId();
    return authenticatedVendorId !== undefined && authenticatedVendorId !== null && authenticatedVendorId !== '' ? String(authenticatedVendorId) : undefined;
  });
  const [documentMap, setDocumentMap] = useState<Record<KycIdType, VendorDocumentRecord | null>>({
    aadhaar: null,
    pan: null,
    selfie: null,
  });
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [uploadingField, setUploadingField] = useState<KycIdType | null>(null);
  const [kycMessage, setKycMessage] = useState<string | null>(null);
  const [kycError, setKycError] = useState<string | null>(null);

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

  useEffect(() => {
    const authenticatedVendorId = user?.vendorProfileId ?? user?.vendorId;
    const resolved = authenticatedVendorId !== undefined && authenticatedVendorId !== null && authenticatedVendorId !== '' ? String(authenticatedVendorId) : undefined;
    setVendorId(resolved);
  }, [user]);

  const loadKycDocuments = async (resolvedVendorId?: string | number) => {
    if (!resolvedVendorId) {
      setDocumentMap({ aadhaar: null, pan: null, selfie: null });
      return;
    }

    try {
      const docs = await getVendorDocuments(resolvedVendorId);
      const nextMap: Record<KycIdType, VendorDocumentRecord | null> = { aadhaar: null, pan: null, selfie: null };

      for (const doc of docs) {
        const type = String(doc.documentType ?? doc.type ?? '').toUpperCase();
        const selfieMatch = doc.documentType === 'SELFIE' || doc.type === 'SELFIE' || type === 'SELFIE';
        if (type === 'ID_PROOF') {
          nextMap.aadhaar = doc;
        }
        if (type === 'PAN') {
          nextMap.pan = doc;
        }
        if (selfieMatch || type === 'SELFIE') {
          nextMap.selfie = doc;
        }
      }

      setDocumentMap(nextMap);
      setAadhaarNumber(nextMap.aadhaar?.documentNumber || '');
      setPanNumber(nextMap.pan?.documentNumber || '');
      setKycError(null);
    } catch (err) {
      setKycError(err instanceof Error ? err.message : 'Unable to load KYC documents.');
    }
  };

  useEffect(() => {
    if (!vendorId) {
      setDocumentMap({ aadhaar: null, pan: null, selfie: null });
      return;
    }

    void loadKycDocuments(vendorId);
  }, [vendorId]);

  const normalizeDocumentStatus = (status?: string) => String(status ?? '').toUpperCase();

  const getDocumentStatusLabel = (status?: string) => {
    const normalized = normalizeDocumentStatus(status);
    if (normalized === 'CHANGES_REQUESTED') return 'Changes Requested';
    if (normalized === 'APPROVED' || normalized === 'VERIFIED') return 'Approved';
    if (normalized === 'REJECTED') return 'Rejected';
    if (normalized === 'IN_REVIEW') return 'In Review';
    if (normalized === 'PENDING') return 'Pending Review';
    return 'Pending Verification';
  };

  const getDocumentReason = (doc?: VendorDocumentRecord | null) => {
    const reason = doc?.remarks ?? doc?.reason ?? '';
    return reason.trim() || 'Admin requested this document to be re-uploaded.';
  };

  const kycStatus = useMemo<KycStatus>(() => {
    const hasAadhaar = Boolean(documentMap.aadhaar);
    const hasPan = Boolean(documentMap.pan);
    const isApproved = [documentMap.aadhaar?.status, documentMap.pan?.status].some((status) => {
      const normalized = String(status ?? '').toUpperCase();
      return normalized === 'APPROVED' || normalized === 'VERIFIED';
    });

    if (isApproved && hasAadhaar && hasPan) {
      return 'Verified';
    }

    if (hasAadhaar || hasPan) {
      return 'Uploaded / Pending Verification';
    }

    return 'Pending';
  }, [documentMap]);

  const handleFileSelection = (field: KycIdType, file: File | null) => {
    if (!file) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setKycError('File size must be 10 MB or less.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png)$/i)) {
      setKycError('Only JPG, JPEG, and PNG files are allowed.');
      return;
    }

    setKycError(null);
    if (field === 'aadhaar') {
      setAadhaarFile(file);
    } else if (field === 'pan') {
      setPanFile(file);
    } else {
      setSelfieFile(file);
    }
  };

  const uploadDocument = async (field: KycIdType) => {
    if (!vendorId) {
      setKycError('Vendor profile ID is missing. Please complete registration and log in again.');
      return;
    }

    const file = field === 'aadhaar' ? aadhaarFile : field === 'pan' ? panFile : selfieFile;
    const number = field === 'aadhaar' ? aadhaarNumber : panNumber;
    const isSelfie = field === 'selfie';

    if (!file) {
      setKycError(`Please choose a ${isSelfie ? 'SELFIE' : field === 'aadhaar' ? 'Aadhaar' : 'PAN'} file first.`);
      return;
    }

    if (!isSelfie && !number.trim()) {
      setKycError(`Please enter the ${field === 'aadhaar' ? 'Aadhaar' : 'PAN'} number.`);
      return;
    }

    setUploadingField(field);
    setKycError(null);
    setKycMessage(null);

    try {
      const documentType = isSelfie ? 'SELFIE' as const : field === 'aadhaar' ? 'ID_PROOF' as const : 'PAN' as const;
      await uploadVendorDocument(vendorId, documentType, file, isSelfie ? '' : number.trim());
      setKycMessage(`${isSelfie ? 'SELFIE' : field === 'aadhaar' ? 'Aadhaar' : 'PAN'} uploaded successfully.`);
      await loadKycDocuments(vendorId);
    } catch (err) {
      setKycError(err instanceof Error ? err.message : `Unable to upload ${isSelfie ? 'SELFIE' : field === 'aadhaar' ? 'Aadhaar' : 'PAN'} document.`);
    } finally {
      setUploadingField(null);
    }
  };

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
                      {verificationSteps.map((step) => {
                        const isBankStep = step.title === 'GST and bank info';
                        const row = (
                          <div key={step.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                            <span>{step.title}</span>
                            <span className={step.done ? 'text-emerald-300' : 'text-amber-300'}>{step.done ? 'Complete' : 'Pending'}</span>
                          </div>
                        );

                        if (!isBankStep) {
                          return row;
                        }

                        return (
                          <Link key={step.title} to="/vendor/bank" className="block rounded-2xl transition hover:border-emerald-400/30 hover:bg-emerald-500/5">
                            {row}
                          </Link>
                        );
                      })}
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                          <span>Identity verification</span>
                          <span className={kycStatus === 'Verified' ? 'text-emerald-300' : kycStatus === 'Uploaded / Pending Verification' ? 'text-amber-300' : 'text-slate-300'}>{kycStatus}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setKycOpen((current) => !current)}
                          disabled={kycStatus === 'Verified'}
                          className={`mt-3 inline-flex w-full items-center justify-center rounded-full px-3 py-2 text-sm font-medium transition ${kycStatus === 'Verified' ? 'cursor-not-allowed bg-emerald-700/60 text-emerald-100 opacity-80' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                        >
                          {kycStatus === 'Verified' ? 'Verified' : 'Complete KYC'}
                        </button>

                        {kycOpen ? (
                          <div className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                            {kycMessage ? <p className="text-sm text-emerald-300">{kycMessage}</p> : null}
                            {kycError ? <p className="text-sm text-amber-300">{kycError}</p> : null}

                            {(['aadhaar', 'pan', 'selfie'] as KycIdType[]).map((field) => {
                              const isAadhaar = field === 'aadhaar';
                              const isSelfie = field === 'selfie';
                              const file = isAadhaar ? aadhaarFile : field === 'pan' ? panFile : selfieFile;
                              const label = isAadhaar ? 'Aadhaar Card' : field === 'pan' ? 'PAN Card' : 'SELFIE';
                              const number = isAadhaar ? aadhaarNumber : panNumber;
                              const setNumber = isAadhaar ? setAadhaarNumber : setPanNumber;
                              const existingDoc = documentMap[field];
                              const uploaded = Boolean(existingDoc);
                              const status = normalizeDocumentStatus(existingDoc?.status);
                              const isChangesRequested = status === 'CHANGES_REQUESTED';
                              const isApproved = status === 'APPROVED' || status === 'VERIFIED';
                              const isRejected = status === 'REJECTED';

                              return (
                                <div key={field} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-white">{label}</p>
                                    <span className={isChangesRequested ? 'text-amber-300' : isApproved ? 'text-emerald-300' : isRejected ? 'text-rose-300' : uploaded ? 'text-amber-300' : 'text-slate-300'}>{
                                      isChangesRequested ? 'Changes Requested' : uploaded ? getDocumentStatusLabel(existingDoc?.status) : 'Pending'
                                    }</span>
                                  </div>

                                  {isChangesRequested ? (
                                    <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
                                      <div className="font-medium">Admin requested changes</div>
                                      <div className="mt-1">Reason: {getDocumentReason(existingDoc)}</div>
                                    </div>
                                  ) : null}

                                  <div className="mt-3 space-y-2">
                                    {!isSelfie ? (
                                      <>
                                        <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">{isAadhaar ? 'Aadhaar number' : 'PAN number'}</label>
                                        <input
                                          value={number}
                                          onChange={(event) => {
                                            setNumber(event.target.value);
                                            setKycError(null);
                                          }}
                                          placeholder={isAadhaar ? 'Enter Aadhaar number' : 'Enter PAN number'}
                                          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                                        />
                                      </>
                                    ) : (
                                      <div className="text-xs text-slate-400">No document number required for SELFIE uploads.</div>
                                    )}
                                    <label className="mt-2 block">
                                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Upload file</span>
                                      <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={(event) => {
                                          const selectedFile = event.target.files?.[0] ?? null;
                                          handleFileSelection(field, selectedFile);
                                          event.currentTarget.value = '';
                                        }}
                                        className="mt-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                                      />
                                    </label>
                                    <div className="text-xs text-slate-400">
                                      Accept: JPG, JPEG, PNG • Max 10 MB
                                    </div>
                                    {(file || existingDoc?.fileName) ? (
                                      <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                                        <div>Selected: {file ? file.name : existingDoc?.fileName || 'No file selected'}</div>
                                        <div>Size: {file ? formatFileSize(file.size) : existingDoc?.fileName ? 'Stored on backend' : '0 KB'}</div>
                                      </div>
                                    ) : null}
                                  </div>

                                  <button
                                    type="button"
                                    disabled={uploadingField !== null || !file || (!isSelfie && !number.trim())}
                                    onClick={() => uploadDocument(field)}
                                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {uploadingField === field ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {uploadingField === field ? 'Uploading…' : isChangesRequested ? `Re-upload ${isSelfie ? 'SELFIE' : isAadhaar ? 'Aadhaar' : 'PAN'}` : isSelfie ? 'Upload SELFIE' : 'Upload'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
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
