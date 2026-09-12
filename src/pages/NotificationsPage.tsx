import { SectionShell } from '../components/SectionShell';
import { useEffect, useState } from 'react';
import { getNotifications, type NotificationResponse } from '../api/notificationApi';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotifications().then((data) => setNotifications(Array.isArray(data) ? data : [])).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load notifications.')).finally(() => setLoading(false));
  }, []);

  return (
    <SectionShell title="Notifications" subtitle="Stay ahead of every update">
      {loading ? <p className="text-slate-400">Loading notifications...</p> : error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p> : notifications.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">No notifications yet.</p> : <div className="space-y-3">{notifications.map((notification) => <div key={notification.id} className={`rounded-[20px] border bg-slate-900/70 p-4 ${notification.isRead ? 'border-white/10' : 'border-blue-500/40'}`}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-white">{notification.title}</p><p className="mt-1 text-sm text-slate-300">{notification.message}</p></div><span className="whitespace-nowrap text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span></div></div>)}</div>}
    </SectionShell>
  );
}
