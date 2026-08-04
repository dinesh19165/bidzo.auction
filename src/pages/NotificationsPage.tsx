import { SectionShell } from '../components/SectionShell';
import { notifications } from '../data/mockData';

export function NotificationsPage() {
  return (
    <SectionShell title="Notifications" subtitle="Stay ahead of every update">
      <div className="space-y-3">
        {notifications.map((note) => (
          <div key={note.title} className={`rounded-[20px] border border-white/10 bg-slate-900/70 p-4 ${note.unread ? 'border-blue-500/40' : ''}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{note.title}</p>
              <span className="text-xs text-slate-400">{note.time}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
