import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, Mail, Phone, Lock, ShieldCheck, Sparkles, Briefcase, BadgeCheck, Building2 } from 'lucide-react';

type AccountType = 'customer' | 'vendor' | null;

const wizardSteps = [
  { title: 'Choose account', subtitle: 'Pick your role' },
  { title: 'Create profile', subtitle: 'Secure details' },
  { title: 'Verify identity', subtitle: 'OTP & KYC' },
  { title: 'Complete setup', subtitle: 'Ready to go' },
];

function ProgressBar({ activeStep }: { activeStep: number }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {wizardSteps.map((step, index) => {
        const status = index < activeStep ? 'complete' : index === activeStep ? 'current' : 'upcoming';
        const classes = status === 'complete'
          ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
          : status === 'current'
            ? 'border-blue-400/30 bg-blue-500/10 text-white'
            : 'border-white/10 bg-slate-950/40 text-slate-400';

        return (
          <div key={step.title} className={`rounded-2xl border p-3 ${classes}`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {status === 'complete' ? <CheckCircle2 className="h-4 w-4" /> : <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${status === 'current' ? 'bg-blue-500/20 text-blue-200' : 'bg-white/10 text-slate-400'}`}>{index + 1}</div>}
              <span>{step.title}</span>
            </div>
            <p className="mt-1 text-xs opacity-80">{step.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}

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
    setTimeout(() => {
      if (account === 'customer') navigate('/welcome/customer');
      else navigate('/welcome/vendor');
    }, 800);
  };

  return (
    <SectionShell title="Register" subtitle="Create your account">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            <Sparkles className="h-4 w-4" /> Guided onboarding
          </div>
          <ProgressBar activeStep={step} />

          {step === 0 && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
                <button onClick={() => choose('customer')} className="mt-4 w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">Choose customer</button>
              </div>
              <div className="flex h-full flex-col rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-600/15 to-blue-500/10 p-4 sm:p-6">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
                  <Briefcase className="h-4 w-4" /> Vendor
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">Sell, auction and grow</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Create listings and launch auctions</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Manage inventory, orders, and analytics</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Build a verified seller reputation</li>
                </ul>
                <button onClick={() => choose('vendor')} className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 sm:w-auto">Choose vendor</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 sm:p-6">
              <h3 className="text-xl font-semibold text-white">{account === 'customer' ? 'Customer registration' : 'Vendor registration'}</h3>
              <div className="mt-4 grid gap-3">
                {account === 'vendor' && (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                    <Building2 className="h-4 w-4 text-emerald-300" />
                    <input placeholder="Business name" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" onChange={(e) => setForm((s: any) => ({ ...s, businessName: e.target.value }))} />
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <BadgeCheck className="h-4 w-4 text-blue-300" />
                  <input placeholder="Full name" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <Mail className="h-4 w-4 text-blue-300" />
                  <input placeholder="Email" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" onChange={(e) => setForm((s: any) => ({ ...s, email: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <Phone className="h-4 w-4 text-blue-300" />
                  <input placeholder="Phone" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" onChange={(e) => setForm((s: any) => ({ ...s, phone: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input placeholder="Password" type="password" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" onChange={(e) => setForm((s: any) => ({ ...s, password: e.target.value }))} />
                </div>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button onClick={() => setStep(0)} className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:text-white sm:w-auto">Back</button>
                  <button onClick={submitRegistration} className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">Continue</button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-center sm:p-6">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
                <ShieldCheck className="h-4 w-4" /> One-time verification
              </div>
              <p className="mt-3 text-sm text-slate-400">We sent an OTP to your phone or email.</p>
              <div className="mt-4 flex justify-center gap-3">
                {['1', '2', '3', '4', '5', '6'].map((digit) => (
                  <div key={digit} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-slate-900/70 text-lg font-semibold text-white">
                    {digit}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button onClick={() => setStep(1)} className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:text-white sm:w-auto">Back</button>
                <button onClick={verifyOtp} className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">Verify OTP</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Welcome aboard
              </div>
              <h3 className="mt-2 text-xl font-semibold text-white">Welcome {form.name || ''}!</h3>
              <p className="mt-2 text-sm text-slate-300">Complete the profile and get tailored recommendations, stronger trust signals, and quicker access to premium features.</p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <BadgeCheck className="h-4 w-4 text-emerald-300" />
                  <input placeholder="Display name" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" onChange={(e) => setForm((s: any) => ({ ...s, displayName: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                  <Building2 className="h-4 w-4 text-blue-300" />
                  <input placeholder="Location" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" onChange={(e) => setForm((s: any) => ({ ...s, location: e.target.value }))} />
                </div>
                <div className="mt-2 flex justify-stretch sm:justify-end">
                  <button onClick={finishProfile} className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 sm:w-auto">Finish setup</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
