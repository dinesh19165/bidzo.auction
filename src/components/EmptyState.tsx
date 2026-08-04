import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, actionLink }: { title: string; description?: string; actionLabel?: string; actionLink?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-300">{description}</p> : null}
      {actionLabel && actionLink ? (
        <div className="mt-4">
          <Link to={actionLink} className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-white">{actionLabel}</Link>
        </div>
      ) : null}
    </div>
  );
}
