export function TransactionCard({ title, amount }: { title: string; amount: string }) {
  return <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4"><div className="flex items-center justify-between"><p className="text-sm text-slate-300">{title}</p><p className="font-semibold text-white">{amount}</p></div></div>;
}

export function WalletBalance({ amount }: { amount: string }) {
  return <div className="rounded-[24px] border border-blue-500/20 bg-blue-500/10 p-6"><p className="text-sm text-blue-200">Available balance</p><p className="mt-2 text-3xl font-semibold text-white">{amount}</p></div>;
}
