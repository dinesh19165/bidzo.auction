import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CheckCircle2, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';

const verificationSteps = [
  { title: 'Email verification', done: true },
  { title: 'Phone verification', done: true },
  { title: 'KYC review', done: false },
];

export function LoginPage() {
  return (
    <SectionShell title="Authentication" subtitle="Welcome back to Bidzo">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Customer & vendor access</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Secure sign-in for buyers and sellers</h3>
          <div className="mt-6 space-y-4">
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Email or phone" />
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Password" />
            <div className="flex items-center justify-between text-sm text-slate-400">
              <Link to="/forgot-password" className="hover:text-white">Forgot password?</Link>
              <Link to="/register" className="hover:text-white">Create account</Link>
            </div>
            <Link to="/dashboards/customer" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">
              Sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-8">
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
  return (
    <SectionShell title="Register" subtitle="Choose your account type">
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/register/customer" className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-white transition hover:border-blue-500/40">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Customer</p>
          <h3 className="mt-3 text-xl font-semibold">Buy products and bid in auctions</h3>
          <p className="mt-3 text-sm text-slate-400">Create a buyer profile, complete KYC, and unlock secure checkout.</p>
        </Link>
        <Link to="/register/vendor" className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 text-white transition hover:border-emerald-500/40">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Vendor</p>
          <h3 className="mt-3 text-xl font-semibold">Launch a storefront and sell with confidence</h3>
          <p className="mt-3 text-sm text-slate-400">Register your business, verify documents, and manage inventory and auctions.</p>
        </Link>
      </div>
    </SectionShell>
  );
}

export function CustomerRegisterPage() {
  return (
    <SectionShell title="Customer registration" subtitle="Create your buyer profile">
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <input className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Full name" />
          <input className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Email" />
          <input className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Phone" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">We’ll verify your email and phone before activation.</div>
          <Link to="/otp" className="mt-5 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Continue to OTP</Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-8">
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
  return (
    <SectionShell title="Vendor registration" subtitle="Create your seller storefront">
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <input className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Business name" />
          <input className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Email" />
          <input className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="GST / PAN" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Business verification unlocks inventory, auction tools and seller analytics.</div>
          <Link to="/kyc" className="mt-5 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Continue to verification</Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/15 to-blue-500/10 p-8">
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
  return (
    <SectionShell title="OTP verification" subtitle="Enter the code sent to your phone">
      <div className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-8 text-center">
        <p className="text-slate-300">Use 123456 for the static UI experience.</p>
        <div className="mt-4 flex justify-center gap-3">
          {['1', '2', '3', '4', '5', '6'].map((digit) => <div key={digit} className="h-12 w-10 rounded-2xl border border-white/10 bg-slate-950/50 text-center text-lg font-semibold leading-[3rem] text-white">{digit}</div>)}
        </div>
        <Link to="/registration-fee" className="mt-6 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Verify</Link>
      </div>
    </SectionShell>
  );
}

export function ForgotPasswordPage() {
  return (
    <SectionShell title="Forgot password" subtitle="Reset access securely">
      <div className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
        <input className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Registered email" />
        <Link to="/reset-password" className="mt-5 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Send reset link</Link>
      </div>
    </SectionShell>
  );
}

export function ResetPasswordPage() {
  return (
    <SectionShell title="Reset password" subtitle="Create a new password">
      <div className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
        <input className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="New password" />
        <input className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Confirm password" />
        <Link to="/login" className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Update password</Link>
      </div>
    </SectionShell>
  );
}

export function KYCPage() {
  return (
    <SectionShell title="KYC" subtitle="Identity verification">
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <p className="text-sm text-slate-300">Upload a government-issued ID, address proof, and selfie for review.</p>
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">Drop files here or browse your device</div>
          <Link to="/registration-fee" className="mt-5 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Submit KYC</Link>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-8">
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
  return (
    <SectionShell title="Registration fee" subtitle="Pay ₹20 to activate your account">
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="text-lg font-semibold text-white">Fee: ₹20</p>
            <p className="mt-2">Payment summary: secure verification + bidding access</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['UPI', 'Cards', 'Wallet', 'Net banking'].map((method) => <div key={method} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-300">{method}</div>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/payment/success" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">Pay now</Link>
            <Link to="/payment/failure" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200">Simulate failure</Link>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-8">
          <div className="flex items-center gap-2 text-amber-300"><Wallet className="h-4 w-4" /> Protected payment</div>
          <p className="mt-3 text-sm text-slate-300">Every transaction is encrypted and backed by real-time confirmation.</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-300"><Smartphone className="h-4 w-4" /> Instant receipts and status updates</div>
        </div>
      </div>
    </SectionShell>
  );
}
