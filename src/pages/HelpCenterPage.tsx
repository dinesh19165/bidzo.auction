import { Link } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';

export function HelpCenterPage() {
  return (
    <SectionShell title="Support" subtitle="How can we help?">
      <div className="mx-auto max-w-2xl border border-white/10 bg-slate-900/60 px-5 py-6 text-sm leading-7 text-slate-300 sm:px-7">
        <p>Find quick guidance for buying products, bidding in auctions, making payments, tracking orders, and managing your Bidzo account.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/faq" className="inline-flex min-h-10 items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">View FAQ</Link>
          <Link to="/contact" className="inline-flex min-h-10 items-center border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Contact Support</Link>
        </div>
      </div>
    </SectionShell>
  );
}
