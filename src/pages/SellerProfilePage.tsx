import { BadgeCheck, MessageCircleMore, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { sellers, reviews } from '../data/mockData';

export function SellerProfilePage() {
  const seller = sellers[0];
  return (
    <SectionShell title="Seller profile" subtitle={seller.name}>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300"><BadgeCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Verified seller • {seller.sales} sales</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">Trusted by enterprise buyers</h3>
            </div>
          </div>
          <p className="mt-5 text-slate-300">This profile demonstrates premium listing quality, fast fulfillment, and smooth communication for large-value transactions.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Rating 4.9', 'Reply in 1h', '98% on-time'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{item}</div>)}
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/10 to-amber-500/10 p-5">
            <div className="flex items-center gap-2 text-amber-300"><TrendingUp className="h-4 w-4" /> 12% growth this month</div>
            <p className="mt-2 text-sm text-slate-300">High-performing seller with strong trust signals and consistent order quality.</p>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
          <h4 className="text-lg font-semibold text-white">Reviews</h4>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => <div key={review.author} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">{review.quote}</div>)}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
