export function SkeletonCard() {
  return <div className="h-40 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />;
}

export function SkeletonTable() {
  return <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-2xl border border-white/10 bg-white/5" />)}</div>;
}

export function SkeletonDashboard() {
  return <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-[24px] border border-white/10 bg-white/5" />)}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-10 text-center"><p className="font-semibold text-white">{title}</p><p className="mt-2 text-sm text-slate-400">{description}</p></div>;
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6"><p className="font-semibold text-red-200">{title}</p><p className="mt-2 text-sm text-red-300">{description}</p></div>;
}

export function Maintenance() {
  return <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/10 p-6 text-amber-200">This section is being upgraded.</div>;
}

export function NotFound() {
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-300">The page you requested could not be found.</div>;
}
