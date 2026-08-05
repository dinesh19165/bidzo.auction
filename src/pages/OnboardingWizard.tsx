import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

type AccountType = 'customer' | 'vendor' | null;

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState<AccountType>(null);
  const [form, setForm] = useState<any>({});
  const { registerCustomer, registerVendor } = useAuth();
  const navigate = useNavigate();

  const choose = (type: AccountType) => {
    setAccount(type);
    setStep(1);
  };

  const submitRegistration = async () => {
    if (account === 'customer') {
      await registerCustomer(form);
      setStep(2);
    } else if (account === 'vendor') {
      await registerVendor(form);
      setStep(2);
    }
  };

  const verifyOtp = () => setStep(3);
  const finishProfile = () => {
    setStep(4);
    // final redirect after a short delay
    setTimeout(() => {
      if (account === 'customer') navigate('/welcome/customer');
      else navigate('/welcome/vendor');
    }, 800);
  };

  return (
    <SectionShell title="Register" subtitle="Create your account">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/70 p-4 sm:p-6">
          <p className="text-sm text-slate-300">Step {step} / 4</p>
          <div className="mt-3 h-2 rounded-full bg-white/5">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {step === 0 && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-6">
              <p className="text-sm font-semibold uppercase text-blue-300">Customer</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Buy, bid and save</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>• Buy products</li>
                <li>• Join auctions</li>
                <li>• Wishlist & Wallet</li>
              </ul>
              <button onClick={() => choose('customer')} className="mt-4 w-full rounded-full bg-blue-600 px-4 py-2 text-white sm:w-auto">Choose Customer</button>
            </div>
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-6">
              <p className="text-sm font-semibold uppercase text-emerald-300">Vendor</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Sell, auction and grow</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>• Sell products</li>
                <li>• Create auctions</li>
                <li>• Inventory & analytics</li>
              </ul>
              <button onClick={() => choose('vendor')} className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-white sm:w-auto">Choose Vendor</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-xl font-semibold text-white">{account === 'customer' ? 'Customer registration' : 'Vendor registration'}</h3>
            <div className="mt-4 grid gap-3">
              {account === 'vendor' && (
                <input placeholder="Business name" className="min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" onChange={(e) => setForm((s:any) => ({ ...s, businessName: e.target.value }))} />
              )}
              <input placeholder="Full name" className="min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" onChange={(e) => setForm((s:any) => ({ ...s, name: e.target.value }))} />
              <input placeholder="Email" className="min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" onChange={(e) => setForm((s:any) => ({ ...s, email: e.target.value }))} />
              <input placeholder="Phone" className="min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" onChange={(e) => setForm((s:any) => ({ ...s, phone: e.target.value }))} />
              <input placeholder="Password" type="password" className="min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" onChange={(e) => setForm((s:any) => ({ ...s, password: e.target.value }))} />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button onClick={() => setStep(0)} className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 sm:w-auto">Back</button>
                <button onClick={submitRegistration} className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm text-white sm:w-auto">Continue</button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-center sm:p-6">
            <p className="text-sm text-slate-400">We sent an OTP to your phone/email.</p>
            <div className="mt-4 flex justify-center gap-3">
              {['1','2','3','4','5','6'].map((d) => <div key={d} className="h-12 w-10 rounded-2xl border border-white/10 bg-slate-950/50 text-center text-lg font-semibold leading-[3rem] text-white">{d}</div>)}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setStep(1)} className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 sm:w-auto">Back</button>
              <button onClick={verifyOtp} className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm text-white sm:w-auto">Verify OTP</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-xl font-semibold text-white">Welcome {form.name || ''}!</h3>
            <p className="mt-2 text-sm text-slate-300">Quickly complete your profile to get tailored recommendations.</p>
            <div className="mt-4 grid gap-3">
              <input placeholder="Display name" className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" onChange={(e) => setForm((s:any) => ({ ...s, displayName: e.target.value }))} />
              <input placeholder="Location" className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" onChange={(e) => setForm((s:any) => ({ ...s, location: e.target.value }))} />
              <div className="mt-4 flex justify-stretch sm:justify-end">
                <button onClick={finishProfile} className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm text-white sm:w-auto">Finish setup</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </SectionShell>
  );
}
