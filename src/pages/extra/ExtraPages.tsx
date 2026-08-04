import { SectionShell } from '../../components/SectionShell';
import { PageState } from '../../components/common/PageState';

export function NotFoundPage() {
  return (
    <SectionShell title="404" subtitle="Page not found">
      <PageState title="404" description="The page you are looking for does not exist." actionLabel="Go home" actionHref="/" tone="warning" />
    </SectionShell>
  );
}

export function MaintenancePage() {
  return (
    <SectionShell title="Maintenance" subtitle="We’ll be back shortly">
      <PageState title="Maintenance" description="Scheduled maintenance is in progress. Please visit again soon." tone="warning" />
    </SectionShell>
  );
}

export function ComingSoonPage() {
  return (
    <SectionShell title="Coming soon" subtitle="More modules are on the way">
      <PageState title="Coming soon" description="This feature area is being prepared for the next release." tone="default" />
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
      <PageState title="Press" description="Bidzo announced new enterprise trading features and stronger seller verification workflows in Q3 2026." tone="default" />
    </SectionShell>
  );
}
