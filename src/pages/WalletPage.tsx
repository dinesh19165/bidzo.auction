import { useEffect, useState } from 'react';
import { SectionShell } from '../components/SectionShell';
import { getTransactions, getWallet, type TransactionResponse } from '../api/walletApi';

export function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [wallet, txnList] = await Promise.all([getWallet(), getTransactions()]);
        setBalance(Number(wallet?.balance ?? 0));
        setTransactions(Array.isArray(txnList) ? txnList : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wallet');
      } finally {
        setIsLoading(false);
      }
    };

    loadWallet();
  }, []);

  if (isLoading) {
    return (
      <SectionShell title="Wallet" subtitle="Payments and transaction history">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500"></div>
            <p className="mt-4 text-slate-400">Loading your wallet...</p>
          </div>
        </div>
      </SectionShell>
    );
  }

  if (error) {
    return (
      <SectionShell title="Wallet" subtitle="Payments and transaction history">
        <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-6 text-slate-300">
          <p className="text-sm font-medium text-rose-200">Wallet Error</p>
          <p className="mt-2">{error}</p>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Wallet" subtitle="Payments and transaction history">
      <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Available balance</p>
            <p className="mt-2 text-3xl font-semibold text-white">₹{balance.toLocaleString()}</p>
          </div>
          <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Withdraw</button>
        </div>
        <div className="mt-6 space-y-3">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const amount = Number(tx.amount ?? 0);
              const formattedAmount = `₹${Math.abs(amount).toLocaleString()}`;
              const label = tx.description || tx.referenceId || tx.referenceType || tx.type || 'Transaction';
              const status = tx.status || (tx.type === 'credit' ? 'Completed' : 'Processed');

              return (
                <div key={String(tx.id ?? label)} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-white">{tx.type === 'credit' ? 'Credit' : 'Debit'}</p>
                    <p>{label}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{tx.type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`}</p>
                    <p>{status}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
