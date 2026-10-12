import { useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Logo from '../Logo';
import type { ReactNode } from 'react';
import { Bell, BookOpen, Boxes, Building2, ChevronRight, FileText, Gavel, Inbox, Images, LayoutGrid, LogOut, Megaphone, Percent, Settings2, ShieldCheck, Store, Truck, Users, Wallet2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationContext } from '../../context/NotificationContext';
import { NotificationList } from '../notifications/NotificationList';

type Breadcrumb = { label: string; to?: string };

type AdminShellProps = {
  title: string;
  subtitle: string;
  breadcrumbs?: Breadcrumb[];
  children: ReactNode;
  activePath: string;
  actions?: ReactNode;
};

const navItems = [
  { label: 'Dashboard', to: '/admin/super-dashboard', icon: LayoutGrid },
  { label: 'Approvals', to: '/admin/approvals', icon: ShieldCheck },
  { label: 'Permissions', to: '/admin/permissions', icon: Users },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Settings', to: '/admin/settings', icon: Settings2 },
  { label: 'CMS', to: '/admin/cms', icon: Megaphone },
  { label: 'Promotional Banners', to: '/admin/promotional-banners', icon: Images },
  { label: 'Advertisements', to: '/admin/advertisements', icon: Megaphone },
  { label: 'Offers', to: '/admin/offers', icon: Percent },
  { label: 'Reports', to: '/admin/reports', icon: FileText },
  { label: 'Franchise', to: '/admin/franchise', icon: Building2 },
  { label: 'Vendors', to: '/admin/vendors', icon: Store },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Contact Messages', to: '/admin/contact', icon: Inbox },
  { label: 'Orders', to: '/admin/orders', icon: Boxes },
  { label: 'Delivery', to: '/admin/delivery', icon: Truck },
  { label: 'Wallet', to: '/admin/wallet', icon: Wallet2 },
  { label: 'Auctions', to: '/admin/auctions', icon: Gavel },
  { label: 'Content', to: '/admin/content', icon: BookOpen },
];

export function AdminShell({ title, subtitle, breadcrumbs = [], children, activePath, actions }: AdminShellProps) {
  const { logout } = useAuth();
  const { unreadCount, refresh, markAllRead } = useNotificationContext();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationAnchorRef = useRef<HTMLDivElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const [notificationPosition, setNotificationPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  useLayoutEffect(() => {
    if (!notificationsOpen || !notificationAnchorRef.current) return undefined;

    const updateNotificationPosition = () => {
      const anchorRect = notificationAnchorRef.current?.getBoundingClientRect();
      if (!anchorRect) return;

      const safeMargin = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(400, Math.max(0, viewportWidth - safeMargin * 2));
      const left = Math.min(
        Math.max(safeMargin, anchorRect.right - width),
        Math.max(safeMargin, viewportWidth - safeMargin - width),
      );
      const maximumHeight = Math.min(480, Math.max(0, viewportHeight - safeMargin * 2));
      const spaceBelow = viewportHeight - anchorRect.bottom - 8 - safeMargin;
      const spaceAbove = anchorRect.top - 8 - safeMargin;
      const placeBelow = spaceBelow >= Math.min(maximumHeight, 240) || spaceBelow >= spaceAbove;
      const top = placeBelow ? anchorRect.bottom + 8 : Math.max(safeMargin, anchorRect.top - 8 - maximumHeight);
      const maxHeight = Math.max(0, Math.min(maximumHeight, viewportHeight - top - safeMargin));
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

  useLayoutEffect(() => {
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_25%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
          <aside className="w-full shrink-0 rounded-[30px] border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl lg:w-72">
          <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 p-3">
            <Link to="/" className="inline-flex items-center"><Logo /></Link>
          </div>

          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.to;
              return (
                <NavLink key={item.to} to={item.to} className={`flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm transition ${isActive ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                  <Icon className="h-4 w-4" />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {item.to === '/admin/notifications' && unreadCount > 0 ? <span className="min-w-5 rounded-full bg-rose-500 px-1.5 text-center text-[10px] font-bold leading-5 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
                </NavLink>
              );
            })}
          </nav>
          <button type="button" onClick={logout} className="mt-6 flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-200">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </aside>

        <div className="flex-1">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">{title}</p>
                <h1 className="mt-1 text-2xl font-semibold text-white">{subtitle}</h1>
              </div>
              <div className="flex items-center gap-2">
                {actions}
                <div ref={notificationAnchorRef} className="relative shrink-0">
                  <button type="button" aria-label="Notifications" aria-haspopup="dialog" aria-expanded={notificationsOpen} onClick={() => { const nextOpen = !notificationsOpen; setNotificationsOpen(nextOpen); if (nextOpen) void refresh(); }} className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span> : null}
                  </button>
                  {notificationsOpen && typeof document !== 'undefined' ? createPortal(
                    <div ref={notificationPanelRef} role="dialog" aria-label="Notifications" style={{ position: 'fixed', top: notificationPosition?.top ?? 12, left: notificationPosition?.left ?? 12, width: notificationPosition?.width ?? 400, maxWidth: 'calc(100vw - 24px)', maxHeight: notificationPosition?.maxHeight ?? 'min(480px, calc(100vh - 24px))', boxSizing: 'border-box', visibility: notificationPosition ? 'visible' : 'hidden' }} className="z-[100] flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-2xl">
                      <div className="mb-3 flex min-w-0 shrink-0 items-center justify-between gap-3 border-b border-white/10 pb-2"><h2 className="min-w-0 whitespace-nowrap text-sm font-semibold text-white">Notifications</h2><div className="ml-auto flex shrink-0 items-center gap-3"><span className="whitespace-nowrap text-xs text-slate-400">{unreadCount} unread</span>{unreadCount > 0 ? <button type="button" onClick={() => void markAllRead()} className="whitespace-nowrap text-xs font-medium text-blue-300 hover:text-blue-200">Mark all read</button> : null}</div></div>
                      <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overscroll-contain"><NotificationList compact limit={10} /></div>
                      <Link to="/admin/notifications" onClick={() => setNotificationsOpen(false)} className="mt-3 flex shrink-0 justify-center border-t border-white/10 pt-3 text-xs font-medium text-blue-300 hover:text-blue-200">View all notifications</Link>
                    </div>,
                    document.body,
                  ) : null}
                </div>
              </div>
            </div>

            {breadcrumbs.length > 0 && (
              <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400" aria-label="Breadcrumb">
                {breadcrumbs.map((item, index) => (
                  <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
                    {item.to ? <Link to={item.to} className="transition hover:text-white">{item.label}</Link> : <span>{item.label}</span>}
                    {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4" />}
                  </span>
                ))}
              </nav>
            )}
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
