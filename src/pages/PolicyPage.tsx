import { SectionShell } from '../components/SectionShell';

export function PolicyPage({ title, subtitle, body }: { title: string; subtitle: string; body: string }) {
  return (
    <SectionShell title={title} subtitle={subtitle}>
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">{body}</div>
    </SectionShell>
  );
}
