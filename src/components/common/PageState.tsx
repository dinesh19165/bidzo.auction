import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: 'default' | 'danger' | 'warning';
  children?: ReactNode;
}

export function PageState({ title, description, actionLabel, actionHref, tone = 'default', children }: PageStateProps) {
  const toneClasses = {
    default: 'border-white/10 bg-slate-900/70 text-slate-300',
    danger: 'border-red-500/20 bg-red-500/10 text-red-300',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
  }[tone];

  return (
    <div className={`rounded-[24px] border p-8 text-center shadow-lg shadow-slate-950/20 ${toneClasses}`}>
      <p className="text-3xl font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm">{description}</p>
      {children}
      {actionLabel && actionHref ? (
        <div className="mt-6">
          <Link to={actionHref} className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">{actionLabel}</Link>
        </div>
      ) : null}
    </div>
  );
}
