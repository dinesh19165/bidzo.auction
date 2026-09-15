import { Bell, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../../context/NotificationContext';
import type { NotificationResponse } from '../../api/notificationApi';

function referencePath(notification: NotificationResponse): string | null {
  const type = String(notification.referenceType ?? '').toUpperCase();
  const id = notification.referenceId;
  if (id === undefined || id === null || String(id).trim() === '') return null;
  if (type === 'AUCTION') return `/auction/${encodeURIComponent(String(id))}`;
  if (type === 'ORDER') return `/customer/orders/${encodeURIComponent(String(id))}`;
  return null;
}

export function NotificationList({ compact = false, limit }: { compact?: boolean; limit?: number }) {
  const { items, loading, error, refresh, markRead } = useNotificationContext();
  const navigate = useNavigate();
  const visibleItems = limit ? items.slice(0, limit) : items;

  if (loading) return <p className="text-sm text-slate-400">Loading notifications...</p>;
  if (error) return <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200"><p>{error}</p><button type="button" onClick={() => void refresh()} className="mt-3 rounded-full border border-rose-300/30 px-3 py-1.5 text-xs hover:bg-rose-500/10">Retry</button></div>;
  if (visibleItems.length === 0) return <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400"><Bell className="mx-auto mb-2 h-5 w-5" />No notifications yet.</div>;

  return <div className={compact ? 'space-y-2' : 'space-y-3'}>{visibleItems.map((notification) => {
    const path = referencePath(notification);
    const open = async () => {
      try { await markRead(notification); } catch { return; }
      if (path) navigate(path);
    };
    return <div key={String(notification.id)} className={`rounded-2xl border bg-slate-900/70 p-4 ${notification.isRead ? 'border-white/10' : 'border-blue-500/40'}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => void open()} className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-white">{notification.title}</p>
          <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
        </button>
        {!notification.isRead ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" aria-label="Unread" /> : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>{notification.type}</span>
        <time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time>
        {path ? <Link to={path} onClick={() => void markRead(notification)} className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200">Open <ExternalLink className="h-3 w-3" /></Link> : null}
      </div>
    </div>;
  })}</div>;
}