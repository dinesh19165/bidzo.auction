import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { BarChart3, Bell, Boxes, ClipboardCheck, LayoutGrid, LogOut, Megaphone, Package, Store, Users } from 'lucide-react';
import Logo from '../Logo';
import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { getFranchiseMe, type FranchiseMe } from '../../api/franchiseApi';
import { ApiError } from '../../api/apiClient';
import { ErrorState, SkeletonDashboard } from '../loading/LoadingComponents';
import { NotificationList } from '../notifications/NotificationList';

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
  const { unreadCount, refresh } = useNotificationContext();
  const [franchise, setFranchise] = useState<FranchiseMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationAnchorRef = useRef<HTMLDivElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const [notificationPosition, setNotificationPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

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

  useEffect(() => {
    if (activePath === '/franchise/dashboard') void refresh();
  }, [activePath, refresh]);

  useLayoutEffect(() => {
    if (!notificationsOpen || !notificationAnchorRef.current) return undefined;

    const updateNotificationPosition = () => {
      const anchorRect = notificationAnchorRef.current?.getBoundingClientRect();
      if (!anchorRect) return;

      const safeMargin = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const width = Math.min(420, Math.max(0, viewportWidth - safeMargin * 2));
      const left = Math.min(
        Math.max(safeMargin, anchorRect.right - width),
        Math.max(safeMargin, viewportWidth - safeMargin - width),
      );
      const top = anchorRect.bottom + 8;
      const availableHeight = Math.max(0, window.innerHeight - top - safeMargin);
      const maxHeight = Math.min(520, window.innerHeight * 0.7, availableHeight);
      setNotificationPosition({ top, left, width, maxHeight });
    };

    updateNotificationPosition();
    window.addEventListener('resize', updateNotificationPosition);
    window.addEventListener('scroll', updateNotificationPosition, true);
    return () => {
      window.removeEventListener('resize', updateNotificationPosition);
      window.removeEventListener('scroll', updateNotificationPosition, true);
    };
  }, [notificationsOpen]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!notificationAnchorRef.current?.contains(target) && !notificationPanelRef.current?.contains(target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [notificationsOpen]);

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
              <div className="flex items-center gap-2">
                {actions}
                <div ref={notificationAnchorRef} className="relative shrink-0">
                  <button type="button" aria-label="Notifications" aria-haspopup="dialog" aria-expanded={notificationsOpen} onClick={() => { const nextOpen = !notificationsOpen; setNotificationsOpen(nextOpen); if (nextOpen) void refresh(); }} className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] text-[var(--text-secondary)] transition hover:bg-blue-500/10 hover:text-[var(--text-primary)]">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
                  </button>
                  {notificationsOpen && typeof document !== 'undefined' ? createPortal(
                    <div ref={notificationPanelRef} role="dialog" aria-label="Notifications" style={{ position: 'fixed', top: notificationPosition?.top ?? 12, left: notificationPosition?.left ?? 12, width: notificationPosition?.width ?? 420, maxWidth: 'calc(100vw - 24px)', maxHeight: notificationPosition?.maxHeight ?? 'min(70vh, 520px)', visibility: notificationPosition ? 'visible' : 'hidden' }} className="z-[100] box-border flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-3 shadow-2xl">
                      <div className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border-color)] pb-2"><h2 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h2><span className="text-xs text-[var(--text-muted)]">{unreadCount} unread</span></div>
                      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"><NotificationList compact limit={10} /></div>
                    </div>,
                    document.body,
                  ) : null}
                </div>
              </div>
            </div>
            {breadcrumbs.length > 0 ? <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">{breadcrumbs.map((item, index) => <span key={`${item.label}-${index}`}>{item.to ? <Link to={item.to} className="hover:text-[var(--text-primary)]">{item.label}</Link> : item.label}{index < breadcrumbs.length - 1 ? ' / ' : ''}</span>)}</nav> : null}
          </header>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
