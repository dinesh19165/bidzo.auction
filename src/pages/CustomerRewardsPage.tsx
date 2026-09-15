import { useEffect, useState } from 'react';
import { Copy, Gift, Share2, Sparkles, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { EmptyState, ErrorState } from '../components/loading/LoadingComponents';
import { getRewardsSummary, getLoyaltyTransactions, redeemLoyaltyPoints, type RewardsRecord } from '../api/rewardsApi';
import { getWalletLedger, type CustomerWalletLedger } from '../api/customerWalletApi';

function value(record: RewardsRecord | null, keys: string[]): unknown {
  if (!record) return undefined;
  return keys.map((key) => record[key]).find((item) => item !== undefined && item !== null && item !== '');
}

function formatMoney(input: unknown): string | null {
  const amount = Number(input);
  return Number.isFinite(amount) ? `₹${amount.toLocaleString('en-IN')}` : null;
}

function formatDate(input: unknown): string | null {
  if (!input) return null;
  const date = new Date(String(input));
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CustomerRewardsPage() {
  const [summary, setSummary] = useState<RewardsRecord | null>(null);
  const [transactions, setTransactions] = useState<RewardsRecord[]>([]);
  const [walletLedger, setWalletLedger] = useState<CustomerWalletLedger | null>(null);
  const [points, setPoints] = useState('');
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryResult, transactionResult, walletResult] = await Promise.all([getRewardsSummary(), getLoyaltyTransactions(), getWalletLedger()]);
      setSummary(summaryResult);
      setTransactions(transactionResult.items);
      setWalletLedger(walletResult);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load rewards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const copyReferral = async () => {
    const code = value(summary, ['referralCode', 'referral_code']);
    if (!code) return;
    await navigator.clipboard?.writeText(String(code));
    setMessage('Referral code copied.');
  };

  const shareReferral = async () => {
    const code = value(summary, ['referralCode', 'referral_code']);
    const referralUrl = value(summary, ['referralUrl', 'referral_url', 'shareUrl', 'share_url']);
    const shareData = { title: 'Referral & Earn', text: code ? `Use my referral code: ${String(code)}` : undefined, url: referralUrl ? String(referralUrl) : window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else await copyReferral();
  };

  const redeem = async () => {
    const amount = Number(points);
    const available = Number(value(summary, ['loyaltyPoints', 'availablePoints', 'points']));
    if (!Number.isInteger(amount) || amount <= 0) { setError('Enter a positive whole number of points.'); return; }
    if (Number.isFinite(available) && amount > available) { setError('The requested points exceed your available balance.'); return; }
    setRedeeming(true);
    setError(null);
    setMessage(null);
    try {
      await redeemLoyaltyPoints(amount);
      setPoints('');
      setMessage('Loyalty points redeemed successfully.');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to redeem loyalty points.');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <SectionShell title="Rewards" subtitle="Referral, loyalty and wallet benefits"><p className="text-sm text-slate-400">Loading rewards...</p></SectionShell>;
  if (error && !summary) return <SectionShell title="Rewards" subtitle="Referral, loyalty and wallet benefits"><ErrorState title="Unable to load rewards" description={error} /></SectionShell>;

  const referralEnabled = value(summary, ['referralEnabled', 'referral_enabled']);
  const loyaltyEnabled = value(summary, ['loyaltyEnabled', 'loyalty_enabled']);
  const referralCode = value(summary, ['referralCode', 'referral_code']);
  const walletBalance = formatMoney(value(summary, ['walletBalance', 'wallet_balance'])) || formatMoney(value(summary, ['balance'])) || formatMoney(walletLedger?.balance);
  const loyaltyPoints = value(summary, ['loyaltyPoints', 'availablePoints', 'points']);
  const referralReward = formatMoney(value(summary, ['referrerRewardAmount', 'referralReward', 'referrerReward'])) || formatMoney(value(summary, ['referralEarnings', 'referral_earnings']));
  const loyaltyStatus = value(summary, ['loyaltyStatus', 'loyalty_status']);

  return (
    <SectionShell title="Rewards" subtitle="Referral, loyalty and wallet benefits">
      <div className="mx-auto max-w-5xl space-y-4">
        {error ? <p className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p> : null}
        {message ? <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {walletBalance !== null ? <Link to="/customer/wallet" className="rounded-xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-blue-400/40"><WalletCards className="h-5 w-5 text-sky-300" /><p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Wallet balance</p><p className="mt-1 text-xl font-semibold text-white">{walletBalance}</p></Link> : null}
          {loyaltyPoints !== undefined ? <a href="#loyalty" className="rounded-xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-blue-400/40"><Sparkles className="h-5 w-5 text-amber-300" /><p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Loyalty points</p><p className="mt-1 text-xl font-semibold text-white">{String(loyaltyPoints)}</p></a> : null}
          {referralReward !== null ? <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4"><Gift className="h-5 w-5 text-emerald-300" /><p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Referral reward</p><p className="mt-1 text-xl font-semibold text-white">{referralReward}</p></div> : null}
        </div>

        <section className="rounded-xl border border-white/10 bg-slate-900/70 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Referral & Earn</p><h2 className="mt-1 text-lg font-semibold text-white">Invite friends with your code</h2></div><Gift className="h-5 w-5 text-sky-300" /></div>
          {referralEnabled === false ? <p className="mt-4 text-sm text-slate-400">Referral &amp; Earn is currently unavailable.</p> : referralCode ? <><p className="mt-4 text-sm text-slate-400">Your referral code</p><div className="mt-2 flex flex-col gap-2 sm:flex-row"><code className="min-w-0 flex-1 break-all rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-white">{String(referralCode)}</code><div className="flex gap-2"><button type="button" onClick={() => void copyReferral()} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-slate-200"><Copy className="h-4 w-4" /> Copy</button><button type="button" onClick={() => void shareReferral()} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white"><Share2 className="h-4 w-4" /> Share</button></div></div></> : <p className="mt-4 text-sm text-slate-400">A referral code is not available for this account.</p>}
          {value(summary, ['referralStatus', 'status']) ? <p className="mt-3 text-sm text-slate-300">Status: {String(value(summary, ['referralStatus', 'status']))}</p> : null}
        </section>

        <section id="loyalty" className="rounded-xl border border-white/10 bg-slate-900/70 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Loyalty points</p><h2 className="mt-1 text-lg font-semibold text-white">Use points when available</h2></div><Sparkles className="h-5 w-5 text-amber-300" /></div>
          {loyaltyEnabled === false ? <p className="mt-4 text-sm text-slate-400">Loyalty rewards are currently unavailable.</p> : <><div className="mt-4 grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-slate-400">Available points</p><p className="mt-1 text-xl font-semibold text-white">{loyaltyPoints !== undefined ? String(loyaltyPoints) : 'Not available'}</p></div>{loyaltyStatus ? <div><p className="text-xs text-slate-400">Status</p><p className="mt-1 text-sm font-medium text-white">{String(loyaltyStatus)}</p></div> : null}</div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input inputMode="numeric" value={points} onChange={(event) => setPoints(event.target.value.replace(/\D/g, ''))} placeholder="Points to redeem" className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none focus:border-blue-400/40" /><button type="button" disabled={redeeming} onClick={() => void redeem()} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-50">{redeeming ? 'Redeeming...' : 'Redeem points'}</button></div></>}
          <div className="mt-5 space-y-2">{transactions.length === 0 ? <p className="text-sm text-slate-400">No loyalty transactions yet.</p> : transactions.map((transaction, index) => <div key={String(transaction.id ?? index)} className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 py-3 text-sm"><div><p className="font-medium text-white">{String(transaction.type ?? transaction.description ?? 'Loyalty transaction')}</p>{transaction.description ? <p className="text-xs text-slate-400">{String(transaction.description)}</p> : null}</div><div className="text-right"><p className="font-semibold text-white">{String(transaction.points ?? transaction.amount ?? '')}</p>{formatDate(transaction.createdAt ?? transaction.date) ? <p className="text-xs text-slate-400">{formatDate(transaction.createdAt ?? transaction.date)}</p> : null}</div></div>)}</div>
        </section>
      </div>
    </SectionShell>
  );
}
