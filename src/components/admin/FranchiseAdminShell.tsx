import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BarChart3, Boxes, ClipboardCheck, LayoutGrid, LogOut, Megaphone, Package, Store, Users } from 'lucide-react';
import Logo from '../Logo';
import { useAuth } from '../../context/AuthContext';
import { getFranchiseMe, type FranchiseMe } from '../../api/franchiseApi';
import { ApiError } from '../../api/apiClient';
import { ErrorState, SkeletonDashboard } from '../loading/LoadingComponents';

const navItems = [
  { label: 'Dashboard', to: '/franchise/dashboard', icon: LayoutGrid },
  { label: 'Vendors', to: '/franchise/vendors', icon: Store },
  { label: 'Products', to: '/franchise/products', icon: Package },
  { label: 'Orders', to: '/franchise/orders', icon: Boxes },
  { label: 'Sales / Analytics', to: '/franchise/analytics', icon: BarChart3 },
  { label: 'Customers', to: '/franchise/customers', icon: Users },
  { label: 'Product Inspection', to: '/franchise/product-inspections', icon: ClipboardCheck },
  { label: 'Advertisements', to: '/franchise/advertisements', icon: Megaphone },
] as const;

type FranchiseAdminShellProps = {
  title: string;
  subtitle: string;
  activePath: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  actions?: ReactNode;
  children: ReactNode;
};

function text(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'object' && !Array.isArray(value)) {
    const object = value as Record<string, unknown>;
    return text(object.name ?? object.title ?? object.label ?? object.city ?? object.value);
  }
  return String(value);
}

export function franchiseDisplayName(franchise: FranchiseMe): string {
  return text(franchise.name ?? franchise.franchiseName ?? franchise.title) || 'Franchise';
}

export function franchiseDisplayLocation(franchise: FranchiseMe): string {
  const direct = text(franchise.location ?? franchise.address);
  if (direct) return direct;
  return [text(franchise.city), text(franchise.state), text(franchise.country)].filter(Boolean).join(', ');
}

export function FranchiseAdminShell({ title, subtitle, activePath, breadcrumbs = [], actions, children }: FranchiseAdminShellProps) {
  const { logout } = useAuth();
  const [franchise, setFranchise] = useState<FranchiseMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getFranchiseMe().then((value) => {
      if (active) setFranchise(value);
    }).catch((reason: unknown) => {
      if (active) setError(reason);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="min-h-screen bg-[var(--app-bg)] p-4 sm:p-6"><SkeletonDashboard /></div>;
  if (error) {
    const accessDenied = error instanceof ApiError && error.status === 403;
    return <div className="min-h-screen bg-[var(--app-bg)] p-4 sm:p-6"><ErrorState title={accessDenied ? 'Access denied' : 'Unable to load franchise'} description={accessDenied ? 'You do not have access to franchise administration.' : error instanceof Error ? error.message : 'The current franchise could not be loaded.'} /></div>;
  }
  if (!franchise) return null;

  const name = franchiseDisplayName(franchise);
  const location = franchiseDisplayLocation(franchise);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 rounded-[30px] border border-[var(--border-color)] bg-[var(--surface)] p-4 shadow-lg lg:w-72">
          <div className="flex items-center gap-3 rounded-[24px] border border-[var(--border-color)] bg-[var(--surface-muted)] p-3">
            <Link to="/franchise/dashboard" className="inline-flex min-w-0 items-center"><Logo /></Link>
          </div>
          <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-3">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{name}</p>
            {location ? <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{location}</p> : null}
          </div>
          <nav className="mt-5 grid grid-cols-2 gap-1 lg:block lg:space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return <NavLink key={item.to} to={item.to} className={`flex min-w-0 items-center gap-2 rounded-[16px] px-3 py-2.5 text-sm transition ${activePath === item.to ? 'bg-blue-600/20 text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'}`}><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{item.label}</span></NavLink>;
            })}
          </nav>
          <button type="button" onClick={logout} className="mt-6 flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-rose-500/10 hover:text-rose-500"><LogOut className="h-4 w-4" /><span>Logout</span></button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="rounded-[30px] border border-[var(--border-color)] bg-[var(--surface)] p-4 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">{title}</p><h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{subtitle}</h1><p className="mt-2 text-sm text-[var(--text-muted)]">{name}{location ? ` · ${location}` : ''}</p></div>
              <div className="flex items-center gap-2">{actions}</div>
            </div>
            {breadcrumbs.length > 0 ? <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">{breadcrumbs.map((item, index) => <span key={`${item.label}-${index}`}>{item.to ? <Link to={item.to} className="hover:text-[var(--text-primary)]">{item.label}</Link> : item.label}{index < breadcrumbs.length - 1 ? ' / ' : ''}</span>)}</nav> : null}
          </header>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
