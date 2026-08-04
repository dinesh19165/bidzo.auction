import { SectionShell } from '../components/SectionShell';

export function ContactPage() {
  return (
    <SectionShell title="Contact" subtitle="Reach the Bidzo team">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <p className="text-slate-300">Need assistance with onboarding, sellers, or enterprise rollout? Our team is ready to help with product demos and platform consultation.</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <p>✉ hello@bidzo.com</p>
            <p>☎ +91 80 4567 8900</p>
            <p>📍 Bengaluru, India</p>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-8">
          <h3 className="text-xl font-semibold text-white">Send a note</h3>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Your name" />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Your email" />
            <textarea className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="How can we help?" />
            <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Submit</button>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
