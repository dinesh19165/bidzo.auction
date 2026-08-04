export function TrackingTimeline({ events }: { events: Array<{ title: string; time: string }> }) {
  return <div className="space-y-3">{events.map((event) => <div key={event.title} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between"><p className="text-sm font-medium text-white">{event.title}</p><span className="text-xs text-slate-500">{event.time}</span></div></div>)}</div>;
}

export function TrackingCard({ title, value }: { title: string; value: string }) {
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5"><p className="text-sm text-slate-400">{title}</p><p className="mt-2 text-xl font-semibold text-white">{value}</p></div>;
}
