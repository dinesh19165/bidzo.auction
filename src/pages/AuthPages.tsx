import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  FileCheck2,
  Landmark,
  LoaderCircle,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  Wallet,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { markAuctionAsRegistered, markRegistrationPaid, readAuctionFlowState, writeAuctionFlowState } from '../utils/auctionFlowState';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, type ChangeEvent, type DragEvent } from 'react';

const verificationSteps = [
  { title: 'Email verification', done: true },
  { title: 'Phone verification', done: true },
  { title: 'KYC review', done: false },
];

const progressSteps = [
  { title: 'Create account', subtitle: 'Secure details' },
  { title: 'Verify identity', subtitle: 'OTP & KYC' },
  { title: 'Complete profile', subtitle: 'Preferences' },
  { title: 'Go live', subtitle: 'Ready to use' },
];

function ProgressIndicator({ activeStep }: { activeStep: number }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {progressSteps.map((step, index) => {
        const status = index < activeStep ? 'complete' : index === activeStep ? 'current' : 'upcoming';
        const base = 'rounded-2xl border p-3 text-left transition';
        const classes =
          status === 'complete'
            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
            : status === 'current'
              ? 'border-blue-400/30 bg-blue-500/10 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.2)]'
              : 'border-white/10 bg-slate-950/40 text-slate-400';

        return (
          <div key={step.title} className={`${base} ${classes}`}>
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

function FormField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  accent = 'blue',
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: any;
  accent?: 'blue' | 'emerald';
}) {
  const isFilled = Boolean(value);
  const accentClasses = accent === 'emerald'
    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    : 'border-blue-400/30 bg-blue-500/10 text-blue-100';

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
        {Icon ? <Icon className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        {label}
      </span>
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${isFilled ? accentClasses : 'border-white/10 bg-slate-950/60'}`}>
        <input
          value={value}
          type={type}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
    </label>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'vendor'>('customer');

  const roleOptions: Array<{ value: 'customer' | 'vendor'; label: string; description: string; features: string[] }> = [
    {
      value: 'customer',
      label: 'Customer',
      description: 'Buy products, join auctions, track orders',
      features: ['Buy products', 'Participate in auctions', 'Track orders'],
    },
    {
      value: 'vendor',
      label: 'Vendor',
      description: 'Sell products, manage auctions, grow sales',
      features: ['Sell products', 'Create and manage auctions', 'Manage orders and sales'],
    },
  ];

  const roleCopy = selectedRole === 'customer'
    ? {
        heading: 'Secure sign-in for buyers',
        description: 'Use your buyer account credentials to continue safely into your Bidzo workspace.',
        onboardingTitle: 'Customer onboarding',
        onboardingMessage: 'Protected checkout, instant bidding access, and order updates stay in one secure experience.',
      }
    : {
        heading: 'Secure sign-in for sellers',
        description: 'Use your seller account credentials to continue safely into your Bidzo workspace.',
        onboardingTitle: 'Vendor onboarding',
        onboardingMessage: 'Seller verification, approval steps, and daily visibility into orders and sales stay streamlined.',
      };

  const onboardingSteps = selectedRole === 'customer'
    ? [
        { title: 'Email Verification' },
        { title: 'Phone Verification' },
        { title: 'Bidding Access' },
      ]
    : [
        { title: 'Email Verification' },
        { title: 'Phone Verification' },
        { title: 'KYC Verification' },
        { title: 'Seller Approval' },
      ];

  const validate = (nextIdentifier = identifier, nextPassword = password) => {
    const nextErrors: { identifier?: string; password?: string } = {};
    if (!nextIdentifier.trim()) {
      nextErrors.identifier = 'Enter your registered email or phone number.';
    }
    if (!nextPassword.trim()) {
      nextErrors.password = 'Enter your password to continue.';
    }
    return nextErrors;
  };

  const handleLogin = async () => {
    const nextErrors = validate();
    setTouched({ identifier: true, password: true });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier || 'guest');
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    if (errors.identifier) {
      setErrors((prev) => ({ ...prev, identifier: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <SectionShell title="Authentication" subtitle="Welcome back to Bidzo">
      <div className="mx-auto grid w-full max-w-5xl gap-6 grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="w-full rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Secure sign-in with protected checkout
          </div>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] text-blue-300">Customer & vendor access</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Sign in for buyers and sellers</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const isActive = selectedRole === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRole(option.value)}
                  className={`rounded-2xl border p-4 text-left transition duration-200 ${isActive ? 'border-blue-400/40 bg-blue-500/10 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-slate-950/40 text-slate-300 hover:border-white/20 hover:bg-slate-950/60'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{option.label}</span>
                    {isActive ? <CheckCircle2 className="h-4 w-4 text-blue-300" /> : <ShieldCheck className="h-4 w-4 text-slate-500" />}
                  </div>
                  <p className={`mt-2 text-xs ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>{option.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.features.map((feature) => (
                      <span key={feature} className={`rounded-full px-2.5 py-1 text-[11px] ${isActive ? 'bg-slate-950/50 text-slate-100' : 'bg-white/5 text-slate-400'}`}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">{roleCopy.heading}</h3>
          <p className="mt-2 text-sm text-slate-400">{roleCopy.description}</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Mail className="h-4 w-4 text-blue-300" />
                Email or phone number
              </span>
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition duration-200 ${touched.identifier && errors.identifier ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/10 bg-slate-950/60 hover:border-white/20 focus-within:border-blue-400/50 focus-within:bg-slate-950/80'}`}>
                <input
                  value={identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, identifier: true }))}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="name@company.com or 10-digit phone"
                />
              </div>
              {touched.identifier && errors.identifier ? <p className="mt-2 text-sm text-amber-300">{errors.identifier}</p> : <p className="mt-2 text-sm text-slate-500">Customers use their buyer account. Vendors use their seller account.</p>}
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Lock className="h-4 w-4 text-slate-400" />
                Password
              </span>
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition duration-200 ${touched.password && errors.password ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/10 bg-slate-950/60 hover:border-white/20 focus-within:border-blue-400/50 focus-within:bg-slate-950/80'}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="rounded-full p-1 text-slate-400 transition hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.password && errors.password ? <p className="mt-2 text-sm text-amber-300">{errors.password}</p> : <p className="mt-2 text-sm text-slate-500">Use the password from your latest Bidzo account setup.</p>}
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-950 text-blue-500" />
              <span>Remember me for faster access next time</span>
            </label>

            <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/forgot-password" className="transition hover:text-white">Forgot password?</Link>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-center sm:text-right">
                <p className="text-slate-300">New to Bidzo?</p>
                <Link to="/register" className="font-medium text-blue-300 transition hover:text-blue-200">Create account</Link>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(59,130,246,0.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-blue-200">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.24em]">Quick onboarding</p>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">Role-based access made simple</h3>

          <div className="mt-5 space-y-3">
            {onboardingSteps.map((step, index) => (
              <div key={step.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                <span>{step.title}</span>
                {index < onboardingSteps.length - 1 ? <ArrowRight className="h-4 w-4 text-slate-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white">
              <Shield className="h-4 w-4 text-amber-300" />
              {roleCopy.onboardingTitle}
            </div>
            <p className="mt-2">{roleCopy.onboardingMessage}</p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function RegisterPage() {
  return (
    <SectionShell title="Register" subtitle="Choose account">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
        <div className="flex items-start gap-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-300" />
          <div>
            <p className="text-sm font-semibold text-white">Start with a secure, guided onboarding flow</p>
            <p className="mt-1 text-sm text-slate-300">Create your account in a few polished steps and verify your identity with confidence.</p>
          </div>
        </div>
        <ProgressIndicator activeStep={0} />
        <div className="flex justify-start">
          <Link to="/onboarding" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
            Start onboarding <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
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
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            <Sparkles className="h-4 w-4" /> Step 1 of 4
          </div>
          <ProgressIndicator activeStep={0} />
          <div className="mt-4 space-y-4">
            <FormField label="Full name" placeholder="As shown on your ID" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} icon={BadgeCheck} />
            <FormField label="Email address" placeholder="name@company.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} icon={Mail} />
            <FormField label="Phone number" placeholder="10-digit mobile number" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} icon={Phone} />
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            <CircleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
            We’ll verify your email and phone before activation so your account is ready for secure bidding.
          </div>
          <button onClick={submit} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
            Continue to OTP <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-blue-200">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.24em]">Why customers choose Bidzo</p>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">A more trusted buying experience</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Instant bid alerts and outbid notifications</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Protected checkout and secure wallet controls</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Wishlist, saved searches, and price tracking</li>
          </ul>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white"><Clock3 className="h-4 w-4 text-blue-300" /> Verification usually completes within minutes.</div>
          </div>
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
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <Briefcase className="h-4 w-4" /> Step 1 of 4
          </div>
          <ProgressIndicator activeStep={0} />
          <div className="mt-4 space-y-4">
            <FormField label="Business name" placeholder="Your registered business" value={form.businessName} onChange={(e) => setForm((s) => ({ ...s, businessName: e.target.value }))} icon={Building2} accent="emerald" />
            <FormField label="Owner name" placeholder="Legal representative" value={form.ownerName} onChange={(e) => setForm((s) => ({ ...s, ownerName: e.target.value }))} icon={BadgeCheck} accent="emerald" />
            <FormField label="Email address" placeholder="team@yourbrand.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} icon={Mail} accent="emerald" />
            <FormField label="Phone number" placeholder="Business contact number" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} icon={Phone} accent="emerald" />
            <FormField label="GST / tax ID (optional)" placeholder="Optional for faster onboarding" value={form.gst} onChange={(e) => setForm((s) => ({ ...s, gst: e.target.value }))} icon={FileCheck2} accent="emerald" />
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            <CircleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
            Verified seller accounts unlock inventory, auction tools, and premium analytics.
          </div>
          <button onClick={submit} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 sm:w-auto">
            Continue to verification <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="w-full rounded-[24px] border border-white/10 bg-gradient-to-br from-emerald-600/15 to-blue-500/10 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.24em]">Vendor onboarding checklist</p>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">Built for professional sellers</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Business details and secure bank verification</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Identity and store verification for trust</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Product and auction launch setup in one place</li>
          </ul>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white"><Sparkles className="h-4 w-4 text-emerald-300" /> Your storefront becomes more trustworthy as verification completes.</div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function OTPPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const verify = () => {
    if (user?.type === 'vendor') navigate('/registration-fee');
    else navigate('/dashboards/customer');
  };

  return (
    <SectionShell title="OTP verification" subtitle="Enter the code sent to your phone">
      <div className="mx-auto w-full max-w-2xl rounded-[24px] border border-white/10 bg-slate-900/70 p-4 text-center sm:p-8">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
          <ShieldCheck className="h-4 w-4" /> Secure confirmation
        </div>
        <ProgressIndicator activeStep={1} />
        <p className="mt-2 text-slate-300">Use 123456 for the static UI experience.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {['1', '2', '3', '4', '5', '6'].map((digit) => (
            <div key={digit} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-slate-950/60 text-lg font-semibold text-white shadow-[0_0_0_1px_rgba(59,130,246,0.18)]">
              {digit}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          A one-time code keeps your account protected while we verify your identity.
        </div>
        <button onClick={verify} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
          Verify account
        </button>
      </div>
    </SectionShell>
  );
}

export function ForgotPasswordPage() {
  return (
    <SectionShell title="Forgot password" subtitle="Reset access securely">
      <div className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
          <Shield className="h-4 w-4" /> Recovery request
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
          <Mail className="h-4 w-4 text-blue-300" />
          <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Registered email" />
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          We’ll email you a secure link to restore access to your Bidzo account.
        </div>
        <Link to="/reset-password" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
          Send reset link
        </Link>
      </div>
    </SectionShell>
  );
}

export function ResetPasswordPage() {
  return (
    <SectionShell title="Reset password" subtitle="Create a new password">
      <div className="mx-auto max-w-xl rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
          <Lock className="h-4 w-4" /> New credentials
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
            <Lock className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="New password" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
            <Lock className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Confirm password" />
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          Use a strong password with letters, numbers, and special characters for better protection.
        </div>
        <Link to="/login" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
          Update password
        </Link>
      </div>
    </SectionShell>
  );
}

export function KYCPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [draggingField, setDraggingField] = useState<'aadhaar' | 'pan' | null>(null);

  const submitKyc = () => {
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      navigate('/registration-fee');
    }, 1100);
  };

  const handleFileSelection = (file: File | null, field: 'aadhaar' | 'pan') => {
    if (!file) return;
    if (field === 'aadhaar') setAadhaarFile(file);
    else setPanFile(file);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: 'aadhaar' | 'pan') => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file, field);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, field: 'aadhaar' | 'pan') => {
    event.preventDefault();
    setDraggingField(null);
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFileSelection(file, field);
  };

  const renderUploadCard = ({
    title,
    description,
    field,
    file,
    accent,
  }: {
    title: string;
    description: string;
    field: 'aadhaar' | 'pan';
    file: File | null;
    accent: 'blue' | 'emerald';
  }) => {
    const isActive = draggingField === field;
    const accentClass = accent === 'emerald'
      ? 'border-emerald-400/20 bg-emerald-500/10'
      : 'border-blue-400/20 bg-blue-500/10';

    return (
      <div
        role="button"
        tabIndex={0}
        onDragOver={(event) => {
          event.preventDefault();
          setDraggingField(field);
        }}
        onDragLeave={() => setDraggingField(null)}
        onDrop={(event) => handleDrop(event, field)}
        className={`rounded-[20px] border p-4 transition ${isActive ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'} ${accentClass}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          </div>
          {file ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Upload className="h-5 w-5 text-slate-300" />}
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
          {file ? <span className="text-emerald-200">Uploaded: {file.name}</span> : 'Drag and drop or browse to upload'}
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:text-white">
          <Upload className="h-3.5 w-3.5" />
          Choose file
          <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => handleInputChange(event, field)} />
        </label>
      </div>
    );
  };

  return (
    <SectionShell title="KYC" subtitle="Identity verification">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            <FileCheck2 className="h-4 w-4" /> Verified identity
          </div>
          <ProgressIndicator activeStep={2} />
          <p className="text-sm text-slate-300">Upload your Aadhaar and PAN documents to complete seller verification.</p>
          <div className="mt-4 rounded-[24px] border border-dashed border-blue-400/20 bg-blue-500/10 p-6 text-center text-sm text-slate-300 sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/50">
              <Upload className="h-5 w-5 text-blue-200" />
            </div>
            <p className="mt-3 font-semibold text-white">Upload Aadhaar and PAN for secure verification</p>
            <p className="mt-1 text-slate-300">PNG, JPG, PDF up to 10MB</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1">Aadhaar</span>
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1">PAN</span>
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1">Selfie</span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {renderUploadCard({ title: 'Aadhaar card', description: 'Required for identity verification', field: 'aadhaar', file: aadhaarFile, accent: 'blue' })}
            {renderUploadCard({ title: 'PAN card', description: 'Required for tax and compliance review', field: 'pan', file: panFile, accent: 'emerald' })}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white"><CircleAlert className="h-4 w-4 text-amber-300" /> Make sure the document name, number, and photo are clearly visible.</div>
          </div>
          <button onClick={submitKyc} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
            {isSubmitting ? 'Submitting verification…' : 'Submit KYC'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-4 sm:p-8">
          <h3 className="text-xl font-semibold text-white">Verification checklist</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Aadhaar card upload</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />PAN card upload</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Business address proof</li>
          </ul>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white"><LoaderCircle className="h-4 w-4 text-blue-300" /> Reviews are usually completed within the same business day.</div>
          </div>
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
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
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
            <button
              type="button"
              disabled={isJoiningLive}
              onClick={() => {
                setIsJoiningLive(true);
                window.setTimeout(() => {
                  markAuctionAsRegistered(flowState.auctionId);
                  const nextState = markRegistrationPaid();
                  setFlowState(nextState);
                  navigate('/customer/auction-live', { replace: true });
                }, 3000);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isJoiningLive ? 'Joining Live Auction...' : 'Pay now'} <ArrowRight className="h-4 w-4" />
            </button>
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
