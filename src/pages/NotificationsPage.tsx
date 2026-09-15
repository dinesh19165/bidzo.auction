import { SectionShell } from '../components/SectionShell';
import { NotificationList } from '../components/notifications/NotificationList';
import { useNotificationContext } from '../context/NotificationContext';

export function NotificationsPage() {
  const { markAllRead } = useNotificationContext();

  return (
    <SectionShell title="Notifications" subtitle="Stay ahead of every update">
      <div className="mb-4 flex justify-end"><button type="button" onClick={() => void markAllRead()} className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">Mark all as read</button></div>
      <NotificationList />
    </SectionShell>
  );
}
