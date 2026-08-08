import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { CheckCircle2, ShieldCheck, Sparkles, BadgeCheck } from 'lucide-react';

export default function OnboardingWizard() {
  const navigate = useNavigate();

  return (
    <SectionShell title="Register" subtitle="Create your account">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            <Sparkles className="h-4 w-4" /> Customer onboarding
          </div>

          <div className="mt-6 grid gap-4 grid-cols-1">
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-950/50 p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
                <BadgeCheck className="h-4 w-4" /> Customer
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">Buy, bid and save</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Buy products and join auctions</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Track bids, wishlist, and wallet activity</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Enjoy protected checkout and fast support</li>
              </ul>
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Continue with customer registration and OTP verification.
              </div>
              <button onClick={() => navigate('/register/customer', { replace: true })} className="mt-4 w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">Continue to customer registration</button>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
