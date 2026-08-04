import { Link } from 'react-router-dom';
import { SectionShell } from '../../components/SectionShell';

export function NotFoundPage() {
  return (
    <SectionShell title="404" subtitle="Page not found">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-center text-slate-300">
        <p className="text-4xl font-semibold text-white">404</p>
        <p className="mt-3">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Go home</Link>
      </div>
    </SectionShell>
  );
}

export function MaintenancePage() {
  return (
    <SectionShell title="Maintenance" subtitle="We’ll be back shortly">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Scheduled maintenance is in progress. Please visit again soon.</p>
      </div>
    </SectionShell>
  );
}

export function ComingSoonPage() {
  return (
    <SectionShell title="Coming soon" subtitle="More modules are on the way">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>This feature area is being prepared for the next release.</p>
      </div>
    </SectionShell>
  );
}

export function NewsletterPage() {
  return (
    <SectionShell title="Newsletter" subtitle="Stay informed with premium updates">
      <div className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
        <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Email address" />
        <button className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Subscribe</button>
      </div>
    </SectionShell>
  );
}

export function PressPage() {
  return (
    <SectionShell title="Press" subtitle="Latest company announcements">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Bidzo announced new enterprise trading features and stronger seller verification workflows in Q3 2026.</p>
      </div>
    </SectionShell>
  );
}
