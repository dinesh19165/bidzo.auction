import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, WalletCards } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { EmptyState, ErrorState } from '../components/loading/LoadingComponents';
import { getWalletLedger, type CustomerWalletLedger } from '../api/customerWalletApi';

function formatMoney(value: unknown): string | null {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹${Math.abs(amount).toLocaleString('en-IN')}` : null;
}

export function CustomerWalletPage() {
  const [ledger, setLedger] = useState<CustomerWalletLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setLedger(await getWalletLedger());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load wallet ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (loading) return <SectionShell title="Wallet" subtitle="Your wallet and transaction history"><p className="text-sm text-slate-400">Loading wallet...</p></SectionShell>;
  if (error) return <SectionShell title="Wallet" subtitle="Your wallet and transaction history"><ErrorState title="Unable to load wallet" description={error} /></SectionShell>;

  const balance = formatMoney(ledger?.balance);
  return (
    <SectionShell title="Wallet" subtitle="Your wallet and transaction history">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-4 sm:p-5"><div><p className="text-xs uppercase tracking-wide text-slate-400">Available balance</p><p className="mt-1 text-2xl font-semibold text-white">{balance ?? 'Not available'}</p></div><WalletCards className="h-6 w-6 text-sky-300" /><Link to="/customer/rewards" className="w-full text-sm text-sky-300 hover:text-sky-200 sm:w-auto">View rewards</Link></div>
        <section className="rounded-xl border border-white/10 bg-slate-900/70 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-white">Transaction history</h2><button type="button" onClick={() => void load()} className="text-sm text-sky-300 hover:text-sky-200">Refresh</button></div>{!ledger?.transactions.length ? <div className="pt-4"><EmptyState title="No wallet transactions yet." description="Wallet activity will appear here when available." /></div> : <div className="mt-3 space-y-2">{ledger.transactions.map((transaction, index) => { const amount = Number(transaction.amount); const isCredit = transaction.type?.toLowerCase() === 'credit' || (Number.isFinite(amount) && amount >= 0); const date = transaction.createdAt || transaction.date; return <div key={String(transaction.id ?? index)} className="flex flex-wrap items-center gap-3 border-t border-white/10 py-3 text-sm"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isCredit ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>{isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><p className="break-words font-medium text-white">{transaction.description || transaction.referenceType || transaction.type || 'Transaction'}</p><p className="break-words text-xs text-slate-400">{transaction.referenceId || transaction.status || ''}{date ? ` ${date}` : ''}</p></div><p className={`shrink-0 font-semibold ${isCredit ? 'text-emerald-300' : 'text-rose-300'}`}>{isCredit ? '+' : '-'}{formatMoney(transaction.amount) ?? 'Not available'}</p></div>; })}</div>}</section>
      </div>
    </SectionShell>
  );
}
