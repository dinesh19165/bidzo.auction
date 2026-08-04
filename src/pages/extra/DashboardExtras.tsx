import { SectionShell } from '../../components/SectionShell';

export function SupportTicketsPage() {
  return (
    <SectionShell title="Support tickets" subtitle="Customer cases and resolutions">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Case #1023 • Delivery issue resolved in 2 hours.</p>
      </div>
    </SectionShell>
  );
}

export function InvoicesPage() {
  return (
    <SectionShell title="Invoices" subtitle="Billing and receipts">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Invoice INV-2401 • Paid successfully.</p>
      </div>
    </SectionShell>
  );
}

export function DownloadsPage() {
  return (
    <SectionShell title="Downloads" subtitle="Shared documents and reports">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Seller guide, KYC checklist, and product catalog templates.</p>
      </div>
    </SectionShell>
  );
}
