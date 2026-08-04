import { SectionShell } from '../../components/SectionShell';

export function AddMoneyPage() {
  return (
    <SectionShell title="Add money" subtitle="Top up your wallet">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Static wallet top-up experience for future payment integration.</p>
      </div>
    </SectionShell>
  );
}

export function WithdrawPage() {
  return (
    <SectionShell title="Withdraw" subtitle="Transfer funds securely">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-slate-300">
        <p>Withdrawal queue and payout configuration screen.</p>
      </div>
    </SectionShell>
  );
}
