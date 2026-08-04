import { SectionShell } from '../components/SectionShell';
import { transactions } from '../data/mockData';

export function WalletPage() {
  return (
    <SectionShell title="Wallet" subtitle="Payments and transaction history">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Available balance</p>
            <p className="mt-2 text-3xl font-semibold text-white">₹82,500</p>
          </div>
          <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Withdraw</button>
        </div>
        <div className="mt-6 space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-white">{tx.type}</p>
                <p>{tx.id}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{tx.amount}</p>
                <p>{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
