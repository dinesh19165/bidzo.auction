import { SectionShell } from '../../components/SectionShell';

export function CommissionSettingsPage() {
  return (
    <SectionShell title="Commission settings" subtitle="Marketplace fee rules" >
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Commission tiers for vendors, premium sellers, and enterprise accounts.</p>
      </div>
    </SectionShell>
  );
}

export function RefundsPage() {
  return (
    <SectionShell title="Refunds" subtitle="Dispute and refund handling">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Open disputes and reimbursement queue.</p>
      </div>
    </SectionShell>
  );
}

export function RolesPage() {
  return (
    <SectionShell title="Roles & permissions" subtitle="Manage team access">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Admin, Support, Vendor, Finance, and Operations roles.</p>
      </div>
    </SectionShell>
  );
}
