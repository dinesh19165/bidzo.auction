import { Link, NavLink } from 'react-router-dom';
import Logo from '../Logo';
import type { ReactNode } from 'react';
import { Activity, Bell, BookOpen, Boxes, Building2, ChevronRight, FileText, Gavel, LayoutGrid, Megaphone, Search, Settings2, ShieldCheck, Store, Truck, Users, Wallet2 } from 'lucide-react';

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
  { label: 'Settings', to: '/admin/settings', icon: Settings2 },
  { label: 'CMS', to: '/admin/cms', icon: Megaphone },
  { label: 'Reports', to: '/admin/reports', icon: FileText },
  { label: 'Franchise', to: '/admin/franchise', icon: Building2 },
  { label: 'Vendors', to: '/admin/vendors', icon: Store },
  { label: 'Orders', to: '/admin/orders', icon: Boxes },
  { label: 'Delivery', to: '/admin/delivery', icon: Truck },
  { label: 'Wallet', to: '/admin/wallet', icon: Wallet2 },
  { label: 'Auctions', to: '/admin/auctions', icon: Gavel },
  { label: 'Content', to: '/admin/content', icon: BookOpen },
];

export function AdminShell({ title, subtitle, breadcrumbs = [], children, activePath, actions }: AdminShellProps) {
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
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">{title}</p>
                <h1 className="mt-1 text-2xl font-semibold text-white">{subtitle}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10">
                  <Search className="h-4 w-4" />
                </button>
                <button className="rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                </button>
                {actions}
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
