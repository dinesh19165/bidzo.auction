import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { useThemeContext } from '../context/ThemeContext';
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
  const { theme } = useThemeContext();
  const isFilled = Boolean(value);
  const accentClasses = accent === 'emerald'
    ? theme === 'dark'
      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
      : 'border-emerald-400/30 bg-emerald-100 text-slate-950'
    : theme === 'dark'
      ? 'border-blue-400/30 bg-blue-500/10 text-blue-100'
      : 'border-blue-400/30 bg-blue-100 text-slate-950';
  const normalClasses = theme === 'dark'
    ? 'border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500'
    : 'border-slate-300 bg-slate-100 text-slate-900 placeholder:text-slate-500';
  const labelClasses = theme === 'dark'
    ? 'mb-2 flex items-center gap-2 text-sm font-medium text-slate-300'
    : 'mb-2 flex items-center gap-2 text-sm font-medium text-slate-900';
  const iconClasses = theme === 'dark' ? 'h-4 w-4 text-slate-400' : 'h-4 w-4 text-slate-500';

  return (
    <label className="block">
      <span className={labelClasses}>
        {Icon ? <Icon className={iconClasses} /> : <Shield className={iconClasses} />}
        {label}
      </span>
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${isFilled ? accentClasses : normalClasses}`}>
        <input
          value={value}
          type={type}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </label>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const { theme } = useThemeContext();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'vendor'>((location.state as { role?: 'customer' | 'vendor' } | null)?.role ?? 'customer');

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

  useEffect(() => {
    if (user) {
      navigate(user.type === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer', { replace: true });
    }
  }, [navigate, user]);

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
      await login(identifier || 'guest', password, selectedRole);
      navigate(selectedRole === 'vendor' ? '/dashboards/vendor' : '/dashboards/customer', { replace: true });
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
    <SectionShell title="Authentication" subtitle="Welcome back to Bidzo" compact>
      <div className="mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_40%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(2,8,23,0.98))] shadow-[0_30px_90px_rgba(2,6,23,0.55)]">
        <div className={`flex items-center justify-between px-4 py-3 sm:px-8 transition duration-300 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500 to-cyan-400 shadow-cyan-500/20' : 'bg-blue-100 shadow-slate-200'}`}>
              <Sparkles className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Bidzo</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Marketplace access</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            <Link to="/" className={`transition ${theme === 'dark' ? 'hover:text-white' : 'hover:text-slate-900'}`}>Home</Link>
            <Link to="/about" className={`transition ${theme === 'dark' ? 'hover:text-white' : 'hover:text-slate-900'}`}>How it works</Link>
            <Link to="/help" className={`transition ${theme === 'dark' ? 'hover:text-white' : 'hover:text-slate-900'}`}>Help</Link>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={`rounded-[28px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6 transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-white/90 shadow-[inset_0_1px_0_rgba(15,23,42,0.04)]'}`}>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${theme === 'dark' ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-200' : 'border border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
              <ShieldCheck className="h-4 w-4" />
              Secure marketplace access
            </div>

            <h3 className={`mt-4 text-3xl font-semibold sm:text-4xl ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
              {selectedRole === 'vendor' ? 'Welcome back, Vendor' : 'Welcome back, Customer'}
            </h3>
            <p className={`mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              {selectedRole === 'vendor' ? 'Sign in to manage your marketplace' : 'Sign in to discover products and auctions'}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {roleOptions.map((option) => {
                const isActive = selectedRole === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedRole(option.value)}
                    className={`rounded-[24px] border p-4 text-left transition-all duration-300 ${isActive ? (theme === 'dark' ? 'border-cyan-400/40 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_18px_45px_rgba(14,165,233,0.16)]' : 'border-blue-200 bg-blue-100 text-slate-950 shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_18px_45px_rgba(59,130,246,0.16)]') : (theme === 'dark' ? 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/20 hover:bg-slate-900/80' : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50')}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{option.label}</span>
                      {isActive ? (
                        <CheckCircle2 className={theme === 'dark' ? 'h-4 w-4 text-cyan-300' : 'h-4 w-4 text-slate-900'} />
                      ) : (
                        <ShieldCheck className={theme === 'dark' ? 'h-4 w-4 text-slate-500' : 'h-4 w-4 text-slate-500'} />
                      )}
                    </div>
                    <p className={`mt-2 text-xs ${isActive ? (theme === 'dark' ? 'text-slate-100' : 'text-slate-700') : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>{option.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {option.features.map((feature) => (
                        <span key={feature} className={`rounded-full px-2.5 py-1 text-[11px] ${isActive ? (theme === 'dark' ? 'bg-slate-950/60 text-slate-50' : 'bg-slate-100 text-slate-900') : (theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-700')}`}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className={`mb-2 flex items-center gap-2 text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                  <Mail className={`h-4 w-4 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`} />
                  Email or phone number
                </span>
                <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition duration-200 ${touched.identifier && errors.identifier ? (theme === 'dark' ? 'border-amber-400/40 bg-amber-500/10' : 'border-amber-400/40 bg-amber-100') : (theme === 'dark' ? 'border-white/10 bg-slate-900/70 hover:border-cyan-400/30 focus-within:border-cyan-400/50 focus-within:bg-slate-900/90' : 'border-slate-300 bg-slate-100 hover:border-cyan-400/30 focus-within:border-cyan-400/50 focus-within:bg-slate-50')}`}>
                  <input
                    value={identifier}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, identifier: true }))}
                    className={`w-full bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`}
                    placeholder="name@company.com or 10-digit phone"
                  />
                </div>
                {touched.identifier && errors.identifier ? <p className="mt-2 text-sm text-amber-300">{errors.identifier}</p> : <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Use your registered Bidzo account details.</p>}
              </label>

              <label className="block">
                <span className={`mb-2 flex items-center gap-2 text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                  <Lock className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                  Password
                </span>
                <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition duration-200 ${touched.password && errors.password ? (theme === 'dark' ? 'border-amber-400/40 bg-amber-500/10' : 'border-amber-400/40 bg-amber-100') : (theme === 'dark' ? 'border-white/10 bg-slate-900/70 hover:border-cyan-400/30 focus-within:border-cyan-400/50 focus-within:bg-slate-900/90' : 'border-slate-300 bg-slate-100 hover:border-cyan-400/30 focus-within:border-cyan-400/50 focus-within:bg-slate-50')}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    className={`w-full bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`}
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className={`rounded-full p-1 transition ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.password && errors.password ? <p className="mt-2 text-sm text-amber-300">{errors.password}</p> : <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Use the password from your latest Bidzo account setup.</p>}
              </label>

              <label className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm transition ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-300 bg-slate-100 text-slate-900'}`}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className={`h-4 w-4 rounded border ${theme === 'dark' ? 'border-white/20 bg-slate-950 text-blue-500' : 'border-slate-400 bg-white text-blue-600'}`} />
                <span>Remember me for faster access next time</span>
              </label>

              <div className={`flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>
                <Link to="/forgot-password" className={`transition ${theme === 'dark' ? 'hover:text-white' : 'text-slate-900 hover:text-slate-700'}`}>Forgot password?</Link>
                <div className={`rounded-2xl border px-3 py-2 text-center sm:text-right transition ${theme === 'dark' ? 'border-white/10 bg-slate-900/60 text-slate-300' : 'border-slate-300 bg-slate-100 text-slate-900'}`}>
                  <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>New to Bidzo?</p>
                  <Link to="/register" className={`font-medium transition ${theme === 'dark' ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-600 hover:text-cyan-700'}`}>Create account</Link>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`relative overflow-hidden rounded-[28px] p-4 sm:p-7 transition duration-300 ${theme === 'dark' ? 'border border-cyan-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900/70 to-cyan-500/20' : 'border border-slate-200 bg-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)]'}`}>
            <div className={`absolute inset-0 transition duration-300 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_40%)]' : 'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_40%)]'}`} />
            <div className={`absolute right-4 top-4 text-[120px] font-black leading-none transition duration-300 ${theme === 'dark' ? 'text-white/10' : 'text-slate-900/10'} sm:text-[180px]`}>B</div>
            <div className="relative">
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-700'}`}>
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Everything you need to buy & sell</p>
              </div>

              <div className={`mt-4 rounded-[28px] p-4 transition duration-300 ${theme === 'dark' ? 'border border-white/10 bg-slate-950/70 shadow-[0_20px_45px_rgba(2,6,23,0.35)]' : 'border border-slate-200 bg-slate-50 shadow-sm'}`}>
                <div className={`flex items-center justify-between rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition duration-300 ${theme === 'dark' ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200' : 'border-cyan-200 bg-cyan-100 text-cyan-900'}`}>
                  <span>🔥 LIVE AUCTION</span>
                  <span className={`rounded-full px-2 py-1 transition duration-300 ${theme === 'dark' ? 'bg-cyan-500/20 text-cyan-200' : 'bg-cyan-100 text-cyan-900'}`}>02:14:05</span>
                </div>
                <div className={`mt-4 rounded-[24px] border p-4 transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_45%),linear-gradient(135deg,_rgba(8,15,35,0.96),_rgba(15,23,42,1))]' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-[11px] uppercase tracking-[0.24em] transition duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Product preview</p>
                      <p className={`mt-2 text-lg font-semibold transition duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Vintage Watch</p>
                    </div>
                    <div className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition duration-300 ${theme === 'dark' ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200' : 'border-emerald-200 bg-emerald-100 text-emerald-900'}`}>Live</div>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className={`text-[11px] uppercase tracking-[0.24em] transition duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Current bid</p>
                      <p className={`mt-1 text-3xl font-semibold transition duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>₹12,500</p>
                    </div>
                    <div className={`rounded-2xl border px-3 py-2 text-right text-sm transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-900'}`}>
                      <p className={`text-[11px] uppercase tracking-[0.24em] transition duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Bids</p>
                      <p className={`mt-1 font-semibold transition duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>128</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { title: 'Secure & Protected', icon: ShieldCheck },
                    { title: 'Real-time Bidding', icon: Sparkles },
                    { title: 'Trusted Marketplace', icon: CheckCircle2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className={`rounded-2xl border px-3 py-3 text-center text-sm transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-white text-slate-900'}`}>
                        <Icon className={`mx-auto mb-2 h-4 w-4 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`} />
                        {item.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
          <Link to="/register/customer" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
            Continue to customer registration <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

export function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const nextErrors: { name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string } = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    if (!form.confirmPassword.trim()) nextErrors.confirmPassword = 'Please confirm your password.';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    await registerCustomer(form, 'customer');
    navigate('/otp', { replace: true, state: { role: 'customer' } });
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
            {errors.name ? <p className="text-sm text-amber-300">{errors.name}</p> : null}
            <FormField label="Email address" placeholder="name@company.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} icon={Mail} />
            {errors.email ? <p className="text-sm text-amber-300">{errors.email}</p> : null}
            <FormField label="Phone number" placeholder="10-digit mobile number" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} icon={Phone} />
            {errors.phone ? <p className="text-sm text-amber-300">{errors.phone}</p> : null}
            <FormField label="Password" placeholder="Create a strong password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} icon={Lock} type="password" />
            {errors.password ? <p className="text-sm text-amber-300">{errors.password}</p> : null}
            <FormField label="Confirm password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))} icon={Lock} type="password" />
            {errors.confirmPassword ? <p className="text-sm text-amber-300">{errors.confirmPassword}</p> : null}
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            <CircleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
            We’ll verify your email and phone before activation so your account is ready for secure bidding.
          </div>
          <button onClick={submit} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto">
            Continue to OTP <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900/80 to-cyan-500/20 p-4 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_40%)]" />
          <div className="absolute right-3 top-3 text-[110px] font-black leading-none text-white/10 sm:text-[160px]">BIDZO</div>
          <div className="relative">
            <div className="flex items-center gap-2 text-cyan-200">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Discover. Bid. Win.</p>
            </div>
            <p className="mt-2 text-sm text-slate-400">Find products you love and compete in real-time auctions.</p>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-4 shadow-[0_20px_45px_rgba(2,6,23,0.35)]">
              <div className="flex items-center justify-between rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <span>🔥 LIVE AUCTION</span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-1">01:12:08</span>
              </div>
              <div className="mt-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_45%),linear-gradient(135deg,_rgba(8,15,35,0.96),_rgba(15,23,42,1))] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Product preview</p>
                    <p className="mt-2 text-lg font-semibold text-white">Vintage Rolex</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">Live</div>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Current bid</p>
                    <p className="mt-1 text-3xl font-semibold text-white">₹12,500</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-right text-sm text-slate-300">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Bids</p>
                    <p className="mt-1 font-semibold text-white">128</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['❤️ Saved', '⚡ Live Bidding', '🏆 Winning Bid'].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] font-medium text-slate-200">
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-white"><Clock3 className="h-4 w-4 text-cyan-300" /> Verification usually completes within minutes.</div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function VendorRegisterPage() {
  const navigate = useNavigate();
  const { registerVendor } = useAuth();
  const [form, setForm] = useState({ businessName: '', ownerName: '', email: '', phone: '', gst: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<{ businessName?: string; ownerName?: string; email?: string; phone?: string; password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const nextErrors: { businessName?: string; ownerName?: string; email?: string; phone?: string; password?: string; confirmPassword?: string } = {};
    if (!form.businessName.trim()) nextErrors.businessName = 'Business name is required.';
    if (!form.ownerName.trim()) nextErrors.ownerName = 'Owner name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    if (!form.confirmPassword.trim()) nextErrors.confirmPassword = 'Please confirm your password.';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    await registerVendor(form, 'vendor');
    navigate('/otp', { replace: true, state: { role: 'vendor' } });
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
            {errors.businessName ? <p className="text-sm text-amber-300">{errors.businessName}</p> : null}
            <FormField label="Owner name" placeholder="Legal representative" value={form.ownerName} onChange={(e) => setForm((s) => ({ ...s, ownerName: e.target.value }))} icon={BadgeCheck} accent="emerald" />
            {errors.ownerName ? <p className="text-sm text-amber-300">{errors.ownerName}</p> : null}
            <FormField label="Email address" placeholder="team@yourbrand.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} icon={Mail} accent="emerald" />
            {errors.email ? <p className="text-sm text-amber-300">{errors.email}</p> : null}
            <FormField label="Phone number" placeholder="Business contact number" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} icon={Phone} accent="emerald" />
            {errors.phone ? <p className="text-sm text-amber-300">{errors.phone}</p> : null}
            <FormField label="Password" placeholder="Create a strong password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} icon={Lock} type="password" accent="emerald" />
            {errors.password ? <p className="text-sm text-amber-300">{errors.password}</p> : null}
            <FormField label="Confirm password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))} icon={Lock} type="password" accent="emerald" />
            {errors.confirmPassword ? <p className="text-sm text-amber-300">{errors.confirmPassword}</p> : null}
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
        <div className="relative overflow-hidden rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-emerald-600/20 via-slate-900/80 to-cyan-500/20 p-4 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_40%)]" />
          <div className="absolute right-3 top-3 text-[110px] font-black leading-none text-white/10 sm:text-[160px]">B</div>
          <div className="relative">
            <div className="flex items-center gap-2 text-emerald-200">
              <Briefcase className="h-4 w-4" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Grow your business with Bidzo</p>
            </div>
            <p className="mt-2 text-sm text-slate-400">Powerful tools to sell, auction and grow your business.</p>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-4 shadow-[0_20px_45px_rgba(2,6,23,0.35)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 shadow-lg shadow-emerald-500/20">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Seller Dashboard</p>
                  <p className="text-sm text-slate-400">Everything to manage your store</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Products', value: '128' },
                  { label: 'Live Auctions', value: '24' },
                  { label: 'Orders', value: '86' },
                  { label: 'Sales', value: '₹2.4L' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['✓ Verified Seller', '₹2.4L Sales', '24 Active Listings'].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] font-medium text-slate-200">
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-white"><Sparkles className="h-4 w-4 text-emerald-300" /> Your storefront becomes more trustworthy as verification completes.</div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function OTPPage() {
  const navigate = useNavigate();
  const { pendingRole, clearPendingRole } = useAuth();

  const verify = () => {
    if (pendingRole === 'vendor') {
      clearPendingRole();
      navigate('/kyc', { replace: true, state: { role: 'vendor' } });
    } else {
      clearPendingRole();
      navigate('/login', { replace: true, state: { role: 'customer' } });
    }
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
    if (!aadhaarFile || !panFile) {
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      navigate('/login', { replace: true, state: { role: 'vendor' } });
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
    <SectionShell title="Vendor verification" subtitle="Complete identity verification">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <FileCheck2 className="h-4 w-4" /> Verified identity
          </div>
          <ProgressIndicator activeStep={2} />
          <p className="text-sm text-slate-300">Upload your Aadhaar and PAN documents to complete seller verification.</p>
          <div className="mt-4 rounded-[24px] border border-dashed border-blue-400/20 bg-blue-500/10 p-6 text-center text-sm text-slate-300 sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/50">
              <Upload className="h-5 w-5 text-blue-200" />
            </div>
            <p className="mt-3 font-semibold text-white">Upload Aadhaar and PAN for secure vendor verification</p>
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
            <div className="flex items-center gap-2 text-white"><CircleAlert className="h-4 w-4 text-amber-300" /> Aadhaar and PAN are mandatory for vendor approval. Upload both to continue.</div>
          </div>
          <button onClick={submitKyc} disabled={!aadhaarFile || !panFile || isSubmitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {isSubmitting ? 'Submitting verification…' : 'Submit KYC'} <ArrowRight className="h-4 w-4" />
          </button>
          {!aadhaarFile || !panFile ? <p className="mt-3 text-sm text-amber-300">Please upload both Aadhaar and PAN to continue.</p> : null}
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
  const { user } = useAuth();
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
                  if (user?.type === 'vendor') {
                    navigate('/login', { replace: true, state: { role: 'vendor' } });
                  } else {
                    navigate('/customer/auction-live', { replace: true });
                  }
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
