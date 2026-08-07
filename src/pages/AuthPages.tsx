import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Landmark, LoaderCircle, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { markAuctionAsRegistered, markRegistrationPaid, readAuctionFlowState, writeAuctionFlowState, type AuctionFlowState } from '../utils/auctionFlowState';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const verificationSteps = [
  { title: 'Email verification', done: true },
  { title: 'Phone verification', done: true },
  { title: 'KYC review', done: false },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');

  const handleLogin = async () => {
    await login(identifier || 'guest');
    // redirect based on mock user
    navigate('/');
  };

  return (
    <SectionShell title="Authentication" subtitle="Welcome back to Bidzo">
      <div className="mx-auto grid w-full max-w-5xl gap-6 grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="w-full rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Customer & vendor access</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Secure sign-in for buyers and sellers</h3>
          <div className="mt-6 space-y-4">
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Email or phone" />
            <input className="w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Password" />
            <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/forgot-password" className="hover:text-white">Forgot password?</Link>
              <Link to="/register" className="hover:text-white">Create account</Link>
            </div>
            <button onClick={handleLogin} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto">
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-4 sm:p-8">
          <h3 className="text-xl font-semibold text-white">Quick onboarding</h3>
          <div className="mt-5 space-y-3">
            {verificationSteps.map((step) => (
              <div key={step.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                <span>{step.title}</span>
                {step.done ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <ShieldCheck className="h-4 w-4 text-amber-300" />}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
            Verified buyers get instant bidding access and protected checkout for every purchase.
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function RegisterPage() {
  // Redirect entry to the full onboarding wizard
  return (
    <SectionShell title="Register" subtitle="Choose account">
      <div className="mx-auto flex max-w-3xl justify-start"><Link to="/onboarding" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white sm:w-auto">Start onboarding <ArrowRight className="h-4 w-4" /></Link></div>
    </SectionShell>
  );
}

export function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const submit = async () => {
    await registerCustomer(form);
    navigate('/otp');
  };

  return (
    <SectionShell title="Customer registration" subtitle="Create your buyer profile">
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Full name" />
          <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Email" />
          <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Phone" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">We’ll verify your email and phone before activation.</div>
          <button onClick={submit} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto">Continue to OTP</button>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-4 sm:p-8">
          <h3 className="text-xl font-semibold text-white">Benefits for buyers</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• Instant bid alerts and outbid notifications</li>
            <li>• Secure escrow-style payment protection</li>
            <li>• Wishlist, saved searches, and wallet controls</li>
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

export function VendorRegisterPage() {
  const navigate = useNavigate();
  const { registerVendor } = useAuth();
  const [form, setForm] = useState({ businessName: '', ownerName: '', email: '', phone: '', gst: '' });

  const submit = async () => {
    await registerVendor(form);
    navigate('/kyc');
  };

  return (
    <SectionShell title="Vendor registration" subtitle="Create your seller storefront">
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <input value={form.businessName} onChange={(e) => setForm((s) => ({ ...s, businessName: e.target.value }))} className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Business name" />
          <input value={form.ownerName} onChange={(e) => setForm((s) => ({ ...s, ownerName: e.target.value }))} className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Owner name" />
          <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Email" />
          <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Phone" />
          <input value={form.gst} onChange={(e) => setForm((s) => ({ ...s, gst: e.target.value }))} className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="GST (Optional)" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Business verification unlocks inventory, auction tools and seller analytics.</div>
          <button onClick={submit} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white sm:w-auto">Continue to verification</button>
        </div>
        <div className="w-full rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/15 to-blue-500/10 p-4 sm:p-8">
          <h3 className="text-xl font-semibold text-white">Vendor onboarding checklist</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• Business details and bank verification</li>
            <li>• Identity and store verification</li>
            <li>• Product and auction launch setup</li>
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

export function OTPPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const verify = () => {
    // mock verify and redirect
    if (user?.type === 'vendor') navigate('/registration-fee');
    else navigate('/dashboards/customer');
  };

  return (
    <SectionShell title="OTP verification" subtitle="Enter the code sent to your phone">
      <div className="mx-auto w-full max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-4 text-center sm:p-8">
        <p className="text-slate-300">Use 123456 for the static UI experience.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {['1', '2', '3', '4', '5', '6'].map((digit) => <div key={digit} className="flex h-12 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 text-lg font-semibold text-white">{digit}</div>)}
        </div>
        <button onClick={verify} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto">Verify</button>
      </div>
    </SectionShell>
  );
}

export function ForgotPasswordPage() {
  return (
    <SectionShell title="Forgot password" subtitle="Reset access securely">
      <div className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
        <input className="w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Registered email" />
        <Link to="/reset-password" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto">Send reset link</Link>
      </div>
    </SectionShell>
  );
}

export function ResetPasswordPage() {
  return (
    <SectionShell title="Reset password" subtitle="Create a new password">
      <div className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
        <input className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="New password" />
        <input className="mb-4 w-full min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Confirm password" />
        <Link to="/login" className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto">Update password</Link>
      </div>
    </SectionShell>
  );
}

export function KYCPage() {
  return (
    <SectionShell title="KYC" subtitle="Identity verification">
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <p className="text-sm text-slate-300">Upload a government-issued ID, address proof, and selfie for review.</p>
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400 sm:p-8">Drop files here or browse your device</div>
          <Link to="/registration-fee" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white sm:w-auto">Submit KYC</Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-4 sm:p-8">
          <h3 className="text-xl font-semibold text-white">Verification checklist</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>• PAN / GST certificate</li>
            <li>• Business address proof</li>
            <li>• Bank account ownership</li>
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

export function RegistrationFeePage() {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState(() => readAuctionFlowState());
  const [isJoiningLive, setIsJoiningLive] = useState(false);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (flowState.auctionStage === 'BID_CONFIRMATION') {
      const nextState = writeAuctionFlowState({ ...flowState, auctionStage: 'REGISTRATION_FEE' });
      setFlowState(nextState);
    }
  }, [flowState.auctionStage]);

  if (flowState.auctionStage === 'LIVE_AUCTION' || flowState.auctionStage === 'AUCTION_ENDED') {
    return <Navigate to="/customer/auction-live" replace />;
  }

  if (flowState.auctionStage === 'WINNER' || flowState.auctionStage === 'FINAL_PAYMENT' || flowState.auctionStage === 'ORDER_SUCCESS' || flowState.auctionStage === 'INVOICE' || flowState.auctionStage === 'OUTBID') {
    return <Navigate to="/customer/winner" replace />;
  }

  if (flowState.auctionStage !== 'REGISTRATION_FEE' && flowState.auctionStage !== 'REGISTRATION_PAYMENT' && flowState.auctionStage !== 'BID_CONFIRMATION') {
    return <Navigate to="/customer/watch-auction" replace />;
  }

  const methods = [
    { label: 'UPI', icon: Smartphone, accent: 'border-blue-400/30 bg-blue-500/10 text-blue-200' },
    { label: 'Cards', icon: CreditCard, accent: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200' },
    { label: 'Wallet', icon: Wallet, accent: 'border-amber-400/20 bg-amber-500/10 text-amber-200' },
    { label: 'Net banking', icon: Landmark, accent: 'border-slate-400/20 bg-white/5 text-slate-200' },
  ];

  return (
    <SectionShell title="Registration fee" subtitle="Pay ₹20 to activate your account">
      <div className="mb-6 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-white">Step 3 of 6 – Registration Required</p>
          <p className="text-slate-400">Registration</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-white">Fee: ₹20</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200"><ShieldCheck className="h-3.5 w-3.5" /> Secure</span>
            </div>
            <p className="mt-2">Payment summary: secure verification + bidding access</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <button key={method.label} type="button" className={`rounded-2xl border p-4 text-center text-sm transition hover:-translate-y-0.5 ${method.accent}`}>
                  <Icon className="mx-auto mb-2 h-5 w-5" />
                  {method.label}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" disabled={isJoiningLive} onClick={() => {
              setIsJoiningLive(true);
              window.setTimeout(() => {
                markAuctionAsRegistered(flowState.auctionId);
                const nextState = markRegistrationPaid();
                setFlowState(nextState);
                navigate('/customer/auction-live', { replace: true });
              }, 3000);
            }} className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{isJoiningLive ? 'Joining Live Auction...' : 'Pay now'} <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-amber-300"><Wallet className="h-4 w-4" /> Protected payment</div>
          <p className="mt-3 text-sm text-slate-300">Every transaction is encrypted and backed by real-time confirmation.</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-300"><Smartphone className="h-4 w-4" /> Instant receipts and status updates</div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white"><LoaderCircle className="h-4 w-4 animate-spin text-blue-300" /> Processing your secure payment</div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
