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
  Gavel,
  Gift,
  Landmark,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  PackageCheck,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  ShoppingBag,
  Sparkles,
  Upload,
  Wallet,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { markAuctionAsRegistered, markRegistrationPaid, readAuctionFlowState, writeAuctionFlowState } from '../utils/auctionFlowState';
import { getPortalHome, useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { getOtpDeliveryPreference, normalizeOtpDeliveryChannel, type OtpDeliveryChannel } from '../api/adminSettingsApi';
import {
  forgotPassword,
  getStoredResetToken,
  getStoredVendorProfileId,
  resendRegistrationOtp,
  resetPassword,
  resolveVendorProfileId,
  setStoredVendorProfileId,
  validatePasswordRules,
  verifyRegistrationOtp,
  verifyResetOtp,
} from '../api/authApi';
import { getVendorDocuments, getVendorProfile, saveVendorKyc, updateVendorProfile, uploadVendorDocument, type VendorDocumentRecord } from '../api/vendorApi';
import { reverseGeocode } from '../utils/customerLocation';
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';

function friendlyAuthError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : '';
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid') && (normalized.includes('otp') || normalized.includes('code'))) return 'That OTP is incorrect. Please check the code and try again.';
  if (normalized.includes('expired')) return 'This OTP has expired. Please request a new code.';
  if (normalized.includes('already') || normalized.includes('exist') || normalized.includes('duplicate')) return 'An account with these details already exists. Try signing in instead.';
  if (normalized.includes('network') || normalized.includes('fetch') || normalized.includes('failed to fetch')) return "We couldn't complete your request right now. Please try again.";
  if (message && !/exception|stack|at\s+\w+\s*\(/i.test(message)) return message;
  return fallback;
}

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
  const { theme } = useThemeContext();

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {progressSteps.map((step, index) => {
        const status = index < activeStep ? 'complete' : index === activeStep ? 'current' : 'upcoming';
        const base = 'rounded-2xl border p-3 text-left transition';
        const classes =
          status === 'complete'
            ? theme === 'dark' ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
            : status === 'current'
              ? theme === 'dark' ? 'border-blue-400/30 bg-blue-500/10 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.2)]' : 'border-blue-300 bg-blue-50 text-blue-900 shadow-[0_0_0_1px_rgba(59,130,246,0.12)]'
              : theme === 'dark' ? 'border-white/10 bg-slate-950/40 text-slate-400' : 'border-slate-300 bg-slate-100 text-slate-600';

        return (
          <div key={step.title} className={`${base} ${classes}`}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {status === 'complete' ? <CheckCircle2 className="h-4 w-4" /> : <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${status === 'current' ? theme === 'dark' ? 'bg-blue-500/20 text-blue-200' : 'bg-blue-100 text-blue-700' : theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>{index + 1}</div>}
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

function FieldError({ message }: { message?: string | null }) {
  const { theme } = useThemeContext();
  if (!message) return null;

  return (
    <p role="alert" className={`mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm leading-5 ${theme === 'dark' ? 'border-rose-400/30 bg-rose-500/10 text-rose-200' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

function FormError({ message }: { message?: string | null }) {
  const { theme } = useThemeContext();
  if (!message) return null;

  return (
    <div role="alert" className={`mb-4 flex items-start gap-2 rounded-xl border px-3 py-3 text-sm leading-5 ${theme === 'dark' ? 'border-rose-400/30 bg-rose-500/10 text-rose-200' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function BrandJourneyPanel({ heading = 'Your marketplace journey starts here.', description = 'Explore products. Discover opportunities. Bid with confidence. Buy with ease.', theme }: { heading?: string; description?: string; theme: 'dark' | 'light' }) {
  const stages = [
    { label: 'Explore', icon: Search },
    { label: 'Discover', icon: Sparkles },
    { label: 'Bid', icon: Gavel },
    { label: 'Buy', icon: ShoppingBag },
    { label: 'Deliver', icon: PackageCheck },
  ];

  return (
    <div className={`bidzo-journey-panel relative overflow-hidden rounded-xl border p-5 sm:p-7 ${theme === 'dark' ? 'border-cyan-400/20 bg-gradient-to-br from-blue-600/20 via-slate-950 to-cyan-500/10' : 'border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50'}`}>
      <div className="bidzo-journey-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className={`bidzo-journey-watermark absolute -right-6 -top-10 select-none text-[190px] font-black leading-none ${theme === 'dark' ? 'text-white/[0.055]' : 'text-sky-900/[0.06]'}`} aria-hidden="true">B</div>
      <div className="relative z-10 flex h-full min-h-[420px] flex-col">
        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-cyan-200' : 'text-sky-700'}`}><Sparkles className="h-4 w-4" /> The Bidzo journey</div>
        <h3 className={`mt-4 max-w-md text-3xl font-semibold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>{heading}</h3>
        <p className={`mt-3 max-w-md text-sm leading-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>

        <div className="bidzo-journey-track relative mt-6 flex-1" aria-label="Explore, Discover, Bid, Buy and Deliver journey">
          <div className={`bidzo-journey-orbit absolute left-7 top-3 h-[245px] w-[150px] rounded-[50%] border-l-2 border-dashed ${theme === 'dark' ? 'border-cyan-300/30' : 'border-sky-400/40'}`} aria-hidden="true" />
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return <div key={stage.label} className={`bidzo-journey-stage absolute left-0 flex items-center gap-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`} style={{ top: `${index * 58}px`, animationDelay: `${index * 0.9}s` }}>
              <span className={`bidzo-journey-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-cyan-300/25 bg-slate-950/80 text-cyan-200' : 'border-sky-200 bg-white text-sky-700 shadow-sm'}`}><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold">{stage.label}</span>
            </div>;
          })}
          <div className={`absolute right-3 top-10 hidden rounded-full border px-3 py-2 text-xs ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-white/80 text-slate-600'} sm:block`}>Simple, secure, yours.</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[{ label: 'Secure', icon: ShieldCheck }, { label: 'Live Auctions', icon: Gavel }, { label: 'Marketplace', icon: ShoppingBag }].map(({ label, icon: Icon }) => <div key={label} className={`rounded-lg border px-2 py-2 text-center text-[11px] font-medium ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-white/80 text-slate-700'}`}><Icon className={`mx-auto mb-1 h-4 w-4 ${theme === 'dark' ? 'text-cyan-300' : 'text-sky-600'}`} />{label}</div>)}
        </div>
      </div>
    </div>
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
  const [notice, setNotice] = useState((location.state as { message?: string } | null)?.message ?? '');
  const expiryRole = typeof window !== 'undefined' ? sessionStorage.getItem('bidzo_expired_login_role') : null;
  const locationRole = (location.state as { role?: 'customer' | 'vendor' } | null)?.role;
  const [selectedRole, setSelectedRole] = useState<'customer' | 'vendor'>(locationRole ?? (expiryRole === 'vendor' ? 'vendor' : 'customer'));

  useEffect(() => {
    if (locationRole) setSelectedRole(locationRole);
  }, [locationRole]);

  useEffect(() => {
    if (expiryRole) sessionStorage.removeItem('bidzo_expired_login_role');
  }, [expiryRole]);

  const roleHeading = selectedRole === 'vendor' ? 'Vendor Login' : 'Customer Login';

  useEffect(() => {
    if (user) {
      navigate(getPortalHome(user), { replace: true });
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
      const user = await login(identifier, password, selectedRole);
      const redirectTo = getPortalHome(user);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors({ identifier: friendlyAuthError(error, 'Email/mobile number or password is incorrect.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    setNotice('');
    if (errors.identifier) {
      setErrors((prev) => ({ ...prev, identifier: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setNotice('');
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <section className={`mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
      <div className={`mx-auto flex w-full max-w-[1280px] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition duration-300 lg:grid lg:grid-cols-[1.08fr_0.92fr] ${theme === 'dark' ? 'border-white/10 bg-slate-950 shadow-[0_24px_70px_rgba(2,6,23,0.55)]' : 'border-slate-200 bg-white'}`}>
        <div className={`flex items-center justify-between px-4 py-2.5 sm:px-6 transition duration-300 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-slate-200 bg-slate-50'}`}>
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

        <div className="grid gap-6 p-4 sm:p-6 lg:col-span-2 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:p-8">
          <div className={`min-w-0 rounded-xl border p-5 transition duration-300 sm:p-7 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${theme === 'dark' ? 'border border-emerald-400/20 bg-emerald-500/10 text-emerald-200' : 'border border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
              <ShieldCheck className="h-4 w-4" />
              Secure marketplace access
            </div>

            <h3 className={`mt-4 text-2xl font-semibold sm:text-3xl ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
              Welcome back to Bidzo
            </h3>
            <p className={`mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Sign in to continue to your account
            </p>

            <div className="mt-4 space-y-3">
              <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-cyan-400/20 bg-cyan-500/10' : 'border-cyan-200 bg-cyan-50'}`}>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>{roleHeading}</p>
              </div>
              {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
              <label className="block">
                <span className={`mb-2 flex items-center gap-2 text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                  <Mail className={`h-4 w-4 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`} />
                  Email or phone number
                </span>
                <div className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 transition duration-200 ${touched.identifier && errors.identifier ? (theme === 'dark' ? 'border-amber-400/60 bg-amber-500/10' : 'border-amber-400 bg-amber-50') : (theme === 'dark' ? 'border-white/10 bg-slate-900/80 hover:border-cyan-400/30 focus-within:border-blue-400 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-400/15' : 'border-slate-300 bg-white hover:border-slate-400 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15')}`}>
                  <Mail className={`h-5 w-5 shrink-0 ${theme === 'dark' ? 'text-cyan-300' : 'text-blue-600'}`} />
                  <input
                    value={identifier}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, identifier: true }))}
                    className={`w-full bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`}
                    placeholder="Email address or 10-digit phone"
                  />
                </div>
                {touched.identifier && errors.identifier ? <FieldError message={errors.identifier} /> : <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Use your registered Bidzo account details.</p>}
              </label>

              <label className="block">
                <span className={`mb-2 flex items-center gap-2 text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>
                  <Lock className={`h-4 w-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                  Password
                </span>
                <div className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 transition duration-200 ${touched.password && errors.password ? (theme === 'dark' ? 'border-amber-400/60 bg-amber-500/10' : 'border-amber-400 bg-amber-50') : (theme === 'dark' ? 'border-white/10 bg-slate-900/80 hover:border-cyan-400/30 focus-within:border-blue-400 focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-400/15' : 'border-slate-300 bg-white hover:border-slate-400 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15')}`}>
                  <Lock className={`h-5 w-5 shrink-0 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    className={`w-full bg-transparent text-sm outline-none ${theme === 'dark' ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-500'}`}
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${theme === 'dark' ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.password && errors.password ? <FieldError message={errors.password} /> : <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Use the password from your latest Bidzo account setup.</p>}
              </label>

              <div className={`flex items-center justify-between gap-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>
                <label className={`flex min-h-6 items-center gap-2 transition ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className={`h-4 w-4 min-h-0 shrink-0 rounded border ${theme === 'dark' ? 'border-white/20 bg-slate-950 text-blue-500' : 'border-slate-400 bg-white text-blue-600'}`} />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className={`transition ${theme === 'dark' ? 'hover:text-white' : 'text-slate-900 hover:text-slate-700'}`}>Forgot password?</Link>
              </div>

              <p className={`text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Don't have an account? <Link to={selectedRole === 'vendor' ? '/register/vendor' : '/register/customer'} className={`font-semibold transition ${theme === 'dark' ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-600 hover:text-cyan-700'}`}>Create an account</Link></p>

              <button
                onClick={handleLogin}
                disabled={isSubmitting}
                className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(59,130,246,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <BrandJourneyPanel theme={theme} />
          <div className="hidden">
            <div className={`absolute inset-0 transition duration-300 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_40%)]' : 'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_40%)]'}`} />
            <div className={`absolute right-4 top-4 text-[120px] font-black leading-none transition duration-300 ${theme === 'dark' ? 'text-white/10' : 'text-slate-900/10'} sm:text-[180px]`}>B</div>
            <div className="relative">
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-cyan-200' : 'text-cyan-700'}`}>
                <ShoppingBag className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Bidzo marketplace</p>
              </div>
              <h3 className={`mt-4 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Explore. Bid. Buy.</h3>
              <p className={`mt-2 text-sm leading-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Everything you need in one marketplace.</p>

              <div className="mt-5 grid gap-3">
                  {[
                    { title: 'Secure & Protected', copy: 'Live bidding and secure transactions', icon: ShieldCheck },
                    { title: 'Real-time Auctions', copy: 'Participate in exciting live auctions', icon: Sparkles },
                    { title: 'Trusted Marketplace', copy: 'Discover products from sellers', icon: ShoppingBag },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-sm transition duration-300 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-white text-slate-900'}`}>
                        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`} />
                        <span><span className="block font-semibold">{item.title}</span><span className={`mt-0.5 block text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.copy}</span></span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RegisterPage() {
  return (
    <SectionShell title="Create your Bidzo account" subtitle="Choose how you want to use Bidzo.">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
        <ProgressIndicator activeStep={0} />
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/register/customer" className="group rounded-[24px] border border-blue-400/30 bg-blue-500/10 p-6 transition hover:-translate-y-1 hover:border-blue-300/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200"><ShoppingBag className="h-6 w-6" /></div>
            <h2 className="mt-5 text-xl font-semibold text-white">Customer</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Shop, bid and manage your purchases.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-200">Create customer account <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/register/vendor" className="group rounded-[24px] border border-emerald-400/30 bg-emerald-500/10 p-6 transition hover:-translate-y-1 hover:border-emerald-300/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200"><Briefcase className="h-6 w-6" /></div>
            <h2 className="mt-5 text-xl font-semibold text-white">Vendor</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Sell products, create auctions and receive payouts.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">Create vendor account <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">Sign in</Link></p>
      </div>
    </SectionShell>
  );
}

export function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();
  const { theme } = useThemeContext();
  const [form, setForm] = useState({ name: '', email: '', phone: '', referralCode: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; referralCode?: string; password?: string; confirmPassword?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: { name?: string; email?: string; phone?: string; referralCode?: string; password?: string; confirmPassword?: string } = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    if (!form.confirmPassword.trim()) nextErrors.confirmPassword = 'Please confirm your password.';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await registerCustomer(form, 'customer');
      navigate('/otp', { replace: true, state: { role: 'customer', email: form.email, phone: form.phone, registrationData: { phone: form.phone } } });
    } catch (error: any) {
      const message = friendlyAuthError(error, "We couldn't complete your request right now. Please try again.");
      if (form.referralCode.trim() && /referral/i.test(message)) {
        setErrors((current) => ({ ...current, referralCode: message }));
      } else {
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell title="Create your customer account" subtitle="Join Bidzo to discover products, bid in auctions and shop securely.">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submit} noValidate className={`rounded-[24px] border p-4 sm:p-8 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-300 bg-white shadow-sm'}`}>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            <Sparkles className="h-4 w-4" /> Step 1 of 4
          </div>
          <ProgressIndicator activeStep={0} />
          <div className="mt-4 space-y-4">
            <FormError message={submitError} />
            <FormField label="Full name" placeholder="As shown on your ID" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} icon={BadgeCheck} />
            <FieldError message={errors.name} />
            <FormField label="Email address" placeholder="name@company.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} icon={Mail} />
            <FieldError message={errors.email} />
            <FormField label="Phone number" placeholder="10-digit mobile number" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} icon={Phone} />
            <FieldError message={errors.phone} />
            <div>
              <FormField label="Referral Code" placeholder="Enter referral code" value={form.referralCode} onChange={(e) => setForm((s) => ({ ...s, referralCode: e.target.value }))} icon={Gift} />
              <p className="mt-1 text-xs text-slate-400">Have a referral code? Enter it to earn your welcome reward.</p>
            </div>
            <FieldError message={errors.referralCode} />
            <FormField label="Password" placeholder="Create a strong password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} icon={Lock} type="password" />
            <FieldError message={errors.password} />
            <FormField label="Confirm password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))} icon={Lock} type="password" />
            <FieldError message={errors.confirmPassword} />
          </div>
          <div className={`mt-5 flex items-start gap-2 rounded-2xl border p-3 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            <CircleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
            We’ll verify your email and phone before activation so your account is ready for secure bidding.
          </div>
          <button type="submit" disabled={isSubmitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Sending OTP…</> : <><span>Continue to OTP</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
        <BrandJourneyPanel heading="Start your Bidzo journey." description="Explore products. Discover opportunities. Bid with confidence. Buy with ease." theme={theme} />
        <div className="hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_40%)]" />
          <div className="absolute right-3 top-3 text-[110px] font-black leading-none text-white/10 sm:text-[160px]">BIDZO</div>
          <div className="relative">
            <div className="flex items-center gap-2 text-cyan-200">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Discover. Bid. Win.</p>
            </div>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Find products you love and compete in real-time auctions.</p>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_45px_rgba(2,6,23,0.35)]">
              <p className="text-sm font-semibold text-white">Your customer workspace</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Browse real inventory, save products, place bids and follow your orders from one account.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {['Browse products', 'Bid in auctions', 'Track orders'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3 text-center text-xs text-slate-300">{item}</div>)}
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
  const { theme } = useThemeContext();
  const [form, setForm] = useState({ businessName: '', ownerName: '', email: '', phone: '', gst: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<{ businessName?: string; ownerName?: string; email?: string; phone?: string; password?: string; confirmPassword?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: { businessName?: string; ownerName?: string; email?: string; phone?: string; password?: string; confirmPassword?: string } = {};
    if (!form.businessName.trim()) nextErrors.businessName = 'Business name is required.';
    if (!form.ownerName.trim()) nextErrors.ownerName = 'Owner name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    if (!form.confirmPassword.trim()) nextErrors.confirmPassword = 'Please confirm your password.';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const registrationResult = await registerVendor(form, 'vendor');
      const vendorId = resolveVendorProfileId(registrationResult);
      console.debug('[Bidzo registration] register response', {
        id: registrationResult?.id,
        userId: registrationResult?.userId,
        vendorId: registrationResult?.vendorId,
        vendorProfileId: registrationResult?.vendorProfileId,
        vendor_profile_id: (registrationResult as { vendor_profile_id?: string | number } | undefined)?.vendor_profile_id,
      });
      console.debug('[Bidzo registration] resolved vendor profile id', {
        vendorId,
        userId: registrationResult?.userId,
        vendorIdFromBackend: registrationResult?.vendorId,
        vendorProfileIdFromBackend: registrationResult?.vendorProfileId,
      });

      if (vendorId === undefined) {
        throw new Error('Vendor profile ID was not returned by the registration API. Please try again.');
      }

      setStoredVendorProfileId(vendorId);
      navigate('/otp', { replace: true, state: { role: 'vendor', email: form.email, phone: form.phone, registrationData: { phone: form.phone }, vendorId } });
    } catch (error: any) {
      setSubmitError(friendlyAuthError(error, "We couldn't complete your request right now. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell title="Create your vendor account" subtitle="Start selling products and managing auctions on Bidzo.">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submit} noValidate className={`rounded-[24px] border p-4 sm:p-8 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-300 bg-white shadow-sm'}`}>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <Briefcase className="h-4 w-4" /> Step 1 of 4
          </div>
          <ProgressIndicator activeStep={0} />
          <div className="mt-4 space-y-4">
            <FormError message={submitError} />
            <FormField label="Business name" placeholder="Your registered business" value={form.businessName} onChange={(e) => setForm((s) => ({ ...s, businessName: e.target.value }))} icon={Building2} accent="emerald" />
            <FieldError message={errors.businessName} />
            <FormField label="Owner name" placeholder="Legal representative" value={form.ownerName} onChange={(e) => setForm((s) => ({ ...s, ownerName: e.target.value }))} icon={BadgeCheck} accent="emerald" />
            <FieldError message={errors.ownerName} />
            <FormField label="Email address" placeholder="team@yourbrand.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} icon={Mail} accent="emerald" />
            <FieldError message={errors.email} />
            <FormField label="Phone number" placeholder="Business contact number" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} icon={Phone} accent="emerald" />
            <FieldError message={errors.phone} />
            <FormField label="Password" placeholder="Create a strong password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} icon={Lock} type="password" accent="emerald" />
            <FieldError message={errors.password} />
            <FormField label="Confirm password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))} icon={Lock} type="password" accent="emerald" />
            <FieldError message={errors.confirmPassword} />
            <FormField label="GST / tax ID (optional)" placeholder="Optional for faster onboarding" value={form.gst} onChange={(e) => setForm((s) => ({ ...s, gst: e.target.value }))} icon={FileCheck2} accent="emerald" />
          </div>
          <div className={`mt-5 flex items-start gap-2 rounded-2xl border p-3 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            <CircleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
            <span><strong>Next step: Complete KYC verification.</strong> Your account must be verified before you can start selling.</span>
          </div>
          <button type="submit" disabled={isSubmitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Sending OTP…</> : <><span>Continue to verification</span><ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
        <BrandJourneyPanel heading="Build your business with Bidzo." description="Explore products. Discover opportunities. Bid with confidence. Buy with ease." theme={theme} />
        <div className="hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_40%)]" />
          <div className="absolute right-3 top-3 text-[110px] font-black leading-none text-white/10 sm:text-[160px]">B</div>
          <div className="relative">
            <div className="flex items-center gap-2 text-emerald-200">
              <Briefcase className="h-4 w-4" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Grow your business with Bidzo</p>
            </div>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Powerful tools to sell, auction and grow your business.</p>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_45px_rgba(2,6,23,0.35)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 shadow-lg shadow-emerald-500/20">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Vendor workspace</p>
                  <p className="text-sm text-slate-400">Tools for products, auctions and payouts</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                Complete vendor verification after registration to unlock selling tools.
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
  const location = useLocation();
  const { pendingRole, clearPendingRole } = useAuth();
  const { theme } = useThemeContext();
  const state = (location.state || {}) as { role?: 'customer' | 'vendor'; email?: string; phone?: string; flow?: 'registration' | 'reset'; registrationData?: Record<string, string>; vendorId?: string | number; vendorProfileId?: string | number };
  const email = state.email || '';
  const phone = state.phone || state.registrationData?.phone || '';
  const flow = state.flow || 'registration';
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(flow === 'reset' ? 180 : 600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [otpChannel, setOtpChannel] = useState<OtpDeliveryChannel>('EMAIL');
  const [channelLoaded, setChannelLoaded] = useState(false);
  const [resendNotice, setResendNotice] = useState('');
  const [resendCooldown, setResendCooldown] = useState(flow === 'reset' ? 30 : 0);

  useEffect(() => {
    if (flow !== 'registration') {
      setOtpChannel('EMAIL');
      setChannelLoaded(true);
      return;
    }

    let isCancelled = false;
    getOtpDeliveryPreference()
      .then((channel) => {
        if (!isCancelled) {
          setOtpChannel(normalizeOtpDeliveryChannel(channel));
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setOtpChannel('EMAIL');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setChannelLoaded(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [flow]);

  const deliveryLabel = otpChannel === 'SMS' ? 'phone number' : 'email';
  const deliveryValue = otpChannel === 'SMS' ? (phone || 'your registered phone number') : (email || 'your registered email');

  useEffect(() => {
    if (flow === 'reset') {
      setMessage(`A password reset OTP has been sent to ${email || 'your registered email'}.`);
      return;
    }

    setMessage(`A verification OTP has been sent to ${deliveryValue}.`);
  }, [flow, email, otpChannel, phone]);

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => setResendCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const submit = async () => {
    if (isSubmitting) return;
    if (flow !== 'reset' && otpChannel === 'SMS' && !phone) { setError('Your phone number is missing. Please start again.'); return; }
    if (flow !== 'reset' && !email && otpChannel === 'EMAIL') { setError('Your email is missing. Please start again.'); return; }
    if (flow === 'reset' && !email) { setError('Your email is missing. Please start again.'); return; }
    if (!/^\d{6}$/.test(otp)) { setError(`Enter the 6-digit OTP sent to your ${deliveryLabel}.`); return; }
    setIsSubmitting(true);
    setError('');
    setResendNotice('');
    try {
      if (flow === 'reset') {
        const resetToken = await verifyResetOtp({ email, otp });
        navigate('/reset-password', { replace: true, state: { email, otp, resetToken: resetToken ?? getStoredResetToken() } });
      } else {
        setMessage('Creating your account...');
        await verifyRegistrationOtp({
          email: otpChannel === 'EMAIL' ? email : undefined,
          phoneNumber: otpChannel === 'SMS' ? phone : undefined,
          otp,
          channel: otpChannel,
        });
        clearPendingRole();
        if ((state.role || pendingRole) === 'vendor') {
          const vendorId = state.vendorId ?? state.vendorProfileId ?? getStoredVendorProfileId();
          if (vendorId !== undefined && vendorId !== null && vendorId !== '') {
            setStoredVendorProfileId(vendorId);
          }
        }
        const role = (state.role || pendingRole) === 'vendor' ? 'vendor' : 'customer';
        navigate('/login', { replace: true, state: { role, message: 'Account created successfully! Please log in to continue.' } });
      }
    } catch (reason: unknown) {
      if (flow !== 'reset') {
        setMessage(`A verification OTP has been sent to ${deliveryValue}.`);
      }
      setError(friendlyAuthError(reason, "We couldn't complete your request right now. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resend = async () => {
    if (flow !== 'reset' && otpChannel === 'SMS' && !phone) { setError('Your phone number is missing. Please start again.'); return; }
    if (flow === 'reset' && !email) { setError('Your email is missing. Please start again.'); return; }
    if (flow !== 'reset' && otpChannel === 'EMAIL' && !email) { setError('Your email is missing. Please start again.'); return; }
    setIsResending(true);
    setError('');
    setResendNotice('');
    try {
      if (flow === 'reset') {
        await forgotPassword(email);
        setResendCooldown(30);
        setMessage(`A new password reset OTP has been sent to ${email}.`);
      } else {
        const payload = {
          email: otpChannel === 'EMAIL' ? email : undefined,
          phoneNumber: otpChannel === 'SMS' ? phone : undefined,
          channel: otpChannel,
        };
        await resendRegistrationOtp(payload);
        const contact = otpChannel === 'SMS' ? phone : email;
        const successMessage = `✓ New OTP sent successfully to ${contact}`;
        setResendNotice(successMessage);
        setMessage(`A verification OTP has been sent to ${deliveryValue}.`);
      }
      setOtp(''); setSecondsLeft(flow === 'reset' ? 180 : 600);
    } catch (reason: unknown) {
      setError(friendlyAuthError(reason, "We couldn't complete your request right now. Please try again."));
    } finally {
      setIsResending(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');
  const updateOtpDigit = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return;
    const next = otp.padEnd(6, ' ').split('');
    digits.slice(0, 6 - index).split('').forEach((digit, offset) => { next[index + offset] = digit; });
    const nextOtp = next.join('').replace(/\s/g, '').slice(0, 6);
    setOtp(nextOtp);
    setError('');
    otpRefs.current[Math.min(index + digits.length, 5)]?.focus();
  };

  return (
    <SectionShell title="Verify your account" subtitle={channelLoaded ? `OTP sent to your ${deliveryLabel}` : 'OTP sent to your email'}>
      <div className={`mx-auto w-full max-w-2xl rounded-[24px] border p-4 text-center sm:p-8 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white shadow-sm'}`}>
        <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
          <ShieldCheck className="h-4 w-4" /> Secure confirmation
        </div>
        <ProgressIndicator activeStep={1} />
        <p className={`mt-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{message || `A verification OTP has been sent to ${deliveryValue}.`}</p>
        {resendNotice ? <p className="mt-2 text-sm font-medium text-emerald-300">{resendNotice}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <div className="mx-auto mt-5 flex max-w-xs justify-center gap-2" onPaste={(event) => { event.preventDefault(); const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); setOtp(pasted); setError(''); otpRefs.current[Math.min(pasted.length, 5)]?.focus(); }}>
          {Array.from({ length: 6 }).map((_, index) => <input key={index} ref={(element) => { otpRefs.current[index] = element; }} aria-label={`OTP digit ${index + 1}`} inputMode="numeric" maxLength={1} autoComplete={index === 0 ? 'one-time-code' : 'off'} value={otp[index] || ''} onChange={(event) => updateOtpDigit(index, event.target.value)} onKeyDown={(event) => { if (event.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus(); }} className="h-12 w-10 rounded-xl border border-blue-400/20 bg-slate-950/60 text-center text-xl font-semibold text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20 sm:h-14 sm:w-12" />)}
        </div>
        <p className={`mt-3 text-sm ${secondsLeft ? 'text-slate-400' : 'text-red-400'}`}>{secondsLeft ? `OTP expires in ${minutes}:${seconds}` : 'This OTP has expired.'}</p>
        {flow === 'reset' && resendCooldown > 0 ? <p className="mt-2 text-sm text-slate-400">Resend available in {resendCooldown}s</p> : null}
        <div className={`mt-6 rounded-2xl border p-4 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
          A one-time code keeps your account protected while we verify your identity.
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={submit} disabled={isSubmitting || isResending || secondsLeft === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> {flow === 'reset' ? 'Verifying…' : 'Creating account…'}</> : flow === 'reset' ? 'Verify OTP' : 'Verify account'}
          </button>
          <button onClick={resend} disabled={isSubmitting || isResending || (flow === 'reset' && resendCooldown > 0)} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {isResending ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Sending OTP…</> : flow === 'reset' && resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </SectionShell>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const submit = async () => {
    if (!email.trim()) {
      setError('Enter your registered email.');
      setSuccessMessage('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await forgotPassword(email.trim());
      setSuccessMessage('A reset OTP has been sent to your email.');
      navigate('/otp', { replace: true, state: { email: email.trim(), flow: 'reset' } });
    } catch (reason: unknown) {
      setError(friendlyAuthError(reason, "We couldn't complete your request right now. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell title="Forgot password" subtitle="Reset access securely">
      <div className={`mx-auto max-w-xl rounded-[24px] border p-4 sm:p-8 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white shadow-sm'}`}>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
          <Shield className="h-4 w-4" /> Recovery request
        </div>
        <div className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-white/10 bg-slate-950/60' : 'border-slate-300 bg-slate-100'}`}>
          <Mail className="h-4 w-4 text-blue-300" />
          <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); setSuccessMessage(''); }} className={`w-full bg-transparent text-sm outline-none placeholder:text-slate-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} placeholder="Registered email" />
        </div>
        <div className={`mt-4 grid gap-2 text-xs sm:grid-cols-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{['Enter email', 'Receive OTP', 'Verify OTP', 'New password', 'Sign in'].map((step, index) => <div key={step} className="rounded-xl border border-white/10 px-2 py-2 text-center"><span className="mr-1 font-semibold text-cyan-300">{index + 1}</span>{step}</div>)}</div>
        {error ? <p className="mt-3 text-sm text-amber-300">{error}</p> : null}
        {successMessage ? <p className="mt-3 text-sm text-emerald-300">{successMessage}</p> : null}
        <div className={`mt-4 rounded-2xl border p-4 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
          We’ll send a one-time code to your registered email so you can securely restore access.
        </div>
        <button onClick={submit} disabled={isSubmitting} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60 sm:w-auto">{isSubmitting ? 'Sending…' : 'Send reset OTP'}</button>
      </div>
    </SectionShell>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useThemeContext();
  const state = (location.state || {}) as { email?: string; otp?: string; resetToken?: string };
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordHints, setPasswordHints] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!state.email || !state.otp) {
      const storedToken = getStoredResetToken();
      if (!storedToken) {
        setError('Verify your password reset OTP first.');
      }
    }
  }, [state.email, state.otp]);

  const submit = async () => {
    if (!state.email || !state.otp) {
      setError('Verify your password reset OTP first.');
      return;
    }
    const rules = validatePasswordRules(password);
    setPasswordHints(rules);
    if (rules.length > 0) {
      setError('Choose a stronger password.');
      return;
    }
    if (!password) {
      setError('Enter a new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      const resetToken = state.resetToken ?? getStoredResetToken();
      await resetPassword({ email: state.email, otp: state.otp, newPassword: password, resetToken });
      setSuccessMessage('Password reset successful. Redirecting to login…');
      navigate('/login', { replace: true, state: { message: 'Password reset successfully. Please sign in.' } });
    } catch (reason: unknown) {
      setError(friendlyAuthError(reason, "We couldn't complete your request right now. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell title="Reset password" subtitle="Create a new password">
      <div className={`mx-auto max-w-xl rounded-[24px] border p-4 sm:p-8 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70' : 'border-slate-200 bg-white shadow-sm'}`}>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
          <Lock className="h-4 w-4" /> New credentials
        </div>
        <div className="mt-4 space-y-4">
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-white/10 bg-slate-950/60' : 'border-slate-300 bg-slate-100'}`}>
            <Lock className="h-4 w-4 text-slate-400" />
            <input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); setPasswordHints(validatePasswordRules(event.target.value)); }} className={`w-full bg-transparent text-sm outline-none placeholder:text-slate-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} placeholder="New password" />
          </div>
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-white/10 bg-slate-950/60' : 'border-slate-300 bg-slate-100'}`}>
            <Lock className="h-4 w-4 text-slate-400" />
            <input type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }} className={`w-full bg-transparent text-sm outline-none placeholder:text-slate-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} placeholder="Confirm password" />
          </div>
        </div>
        {passwordHints.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-amber-300">
            {passwordHints.map((hint) => <li key={hint}>• {hint}</li>)}
          </ul>
        ) : null}
        <div className={`mt-4 rounded-2xl border p-4 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
          Use a strong password with letters, numbers, and special characters for better protection.
        </div>
        {error ? <p className="mt-3 text-sm text-amber-300">{error}</p> : null}
        {successMessage ? <p className="mt-3 text-sm text-emerald-300">{successMessage}</p> : null}
        <button onClick={submit} disabled={isSubmitting} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-60 sm:w-auto">{isSubmitting ? 'Updating…' : 'Update password'}</button>
      </div>
    </SectionShell>
  );
}

export function KYCPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationForm, setLocationForm] = useState({ businessAddress: '', city: '', state: '', pincode: '', latitude: null as number | null, longitude: null as number | null });
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const initialLocationRef = useRef<typeof locationForm | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [existingDocuments, setExistingDocuments] = useState<Record<'aadhaar' | 'pan' | 'selfie', VendorDocumentRecord | null>>({ aadhaar: null, pan: null, selfie: null });
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<'aadhaar' | 'pan' | 'selfie' | null>(null);
  const [uploadingField, setUploadingField] = useState<'aadhaar' | 'pan' | 'selfie' | null>(null);
  const [documentErrors, setDocumentErrors] = useState<Record<'aadhaar' | 'pan' | 'selfie', string | null>>({ aadhaar: null, pan: null, selfie: null });
  const [kycError, setKycError] = useState<string | null>(null);

  const kycStorageKey = 'bidzo_vendor_kyc_documents';

  useEffect(() => {
    let active = true;
    getVendorProfile().then((profile) => {
      if (!active) return;
      const latitude = profile.latitude === null || profile.latitude === undefined || profile.latitude === '' ? Number.NaN : Number(profile.latitude);
      const longitude = profile.longitude === null || profile.longitude === undefined || profile.longitude === '' ? Number.NaN : Number(profile.longitude);
      const savedLocation = {
        businessAddress: String(profile.businessAddress ?? ''),
        city: String(profile.city ?? ''),
        state: String(profile.state ?? ''),
        pincode: String(profile.pincode ?? ''),
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null,
      };
      initialLocationRef.current = savedLocation;
      setLocationForm(savedLocation);
      setLocationDetected(Number.isFinite(latitude) && Number.isFinite(longitude));
      setLocationError(null);
    }).catch(() => {
      if (active) setLocationError('Unable to load saved business location. You can enter it manually.');
    }).finally(() => {
      if (active) setProfileLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const detectBusinessLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Current location is not available in this browser. Please enter your location manually.');
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const detected = await reverseGeocode(coords.latitude, coords.longitude);
        setLocationForm((current) => ({
          ...current,
          businessAddress: detected.displayName || current.businessAddress,
          city: detected.city || current.city,
          state: detected.state || current.state,
          pincode: detected.pincode || current.pincode,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
        setLocationDetected(true);
      } catch (error) {
        setLocationError(error instanceof Error ? error.message : 'Unable to identify this location. Please enter it manually.');
      } finally {
        setLocationLoading(false);
      }
    }, (error) => {
      setLocationLoading(false);
      setLocationError(error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Please enter your business location manually.' : 'Unable to access your current location. Please enter it manually.');
    }, { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 });
  };

  const validateBusinessLocation = () => {
    const hasLocationDetails = Boolean(locationForm.businessAddress.trim() || locationForm.city.trim() || locationForm.state.trim() || locationForm.pincode.trim() || locationForm.latitude !== null || locationForm.longitude !== null);
    if (!hasLocationDetails) return null;
    if (!locationForm.businessAddress.trim()) return 'Business address is required when location details are provided.';
    if (!locationForm.city.trim()) return 'City is required when location details are provided.';
    if (!locationForm.state.trim()) return 'State is required when location details are provided.';
    if ((locationForm.latitude !== null && (locationForm.latitude < -90 || locationForm.latitude > 90)) || (locationForm.longitude !== null && (locationForm.longitude < -180 || locationForm.longitude > 180))) return 'The detected latitude or longitude is outside the supported range.';
    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** index);
    return `${value < 10 && index > 0 ? value.toFixed(1) : value.toFixed(0)} ${units[index]}`;
  };

  const createStoredFile = (name: string, size: number, type: string) => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size, configurable: true });
    return file;
  };

  useEffect(() => {
    const routeState = location.state as { vendorId?: string | number; vendorProfileId?: string | number } | null;
    const authenticatedVendorId = user?.vendorProfileId ?? user?.vendorId;
    const stateVendorId = routeState?.vendorId ?? routeState?.vendorProfileId ?? authenticatedVendorId;
    const vendorProfileId = stateVendorId !== undefined && stateVendorId !== null && stateVendorId !== '' ? Number(stateVendorId) || String(stateVendorId) : undefined;

    if (vendorProfileId === undefined) {
      setDocumentsLoading(false);
      setDocumentsError('Vendor profile ID is missing. Please authenticate and reopen the KYC flow.');
      return;
    }

    let active = true;
    getVendorDocuments(vendorProfileId)
      .then((documents) => {
        if (!active) return;
        const next: Record<'aadhaar' | 'pan' | 'selfie', VendorDocumentRecord | null> = { aadhaar: null, pan: null, selfie: null };
        documents.forEach((document) => {
          const type = String(document.documentType ?? document.type ?? '').toUpperCase();
          if (type === 'ID_PROOF' || type.includes('AADHAAR') || type.includes('IDENTITY')) next.aadhaar = document;
          if (type === 'PAN') next.pan = document;
          if (type === 'SELFIE') next.selfie = document;
        });
        setExistingDocuments(next);
        setDocumentsError(null);
      })
      .catch((error) => {
        if (active) setDocumentsError(error instanceof Error ? error.message : 'Unable to load existing KYC documents.');
      })
      .finally(() => {
        if (active) setDocumentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [location.state, user?.vendorId, user?.vendorProfileId]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(kycStorageKey);
      if (!raw) return;
      const stored = JSON.parse(raw) as Partial<Record<'aadhaar' | 'pan' | 'selfie', { name: string; size: number; type: string }>>;
      if (stored.aadhaar) setAadhaarFile(createStoredFile(stored.aadhaar.name, stored.aadhaar.size, stored.aadhaar.type));
      if (stored.pan) setPanFile(createStoredFile(stored.pan.name, stored.pan.size, stored.pan.type));
      if (stored.selfie) setSelfieFile(createStoredFile(stored.selfie.name, stored.selfie.size, stored.selfie.type));
    } catch {
      // Ignore corrupted local state and keep blank uploads.
    }
  }, []);

  useEffect(() => {
    const payload = {
      aadhaar: aadhaarFile ? { name: aadhaarFile.name, size: aadhaarFile.size, type: aadhaarFile.type } : null,
      pan: panFile ? { name: panFile.name, size: panFile.size, type: panFile.type } : null,
      selfie: selfieFile ? { name: selfieFile.name, size: selfieFile.size, type: selfieFile.type } : null,
    };
    window.localStorage.setItem(kycStorageKey, JSON.stringify(payload));
  }, [aadhaarFile, panFile, selfieFile]);

  const submitKyc = async () => {
    const isApproved = (document?: VendorDocumentRecord | null) => ['APPROVED', 'VERIFIED', 'COMPLETED', 'COMPLETE'].includes(String(document?.status ?? '').toUpperCase());
    if ((!aadhaarFile && !existingDocuments.aadhaar) || (!panFile && !existingDocuments.pan)) {
      return;
    }

    const locationValidationError = validateBusinessLocation();
    if (locationValidationError) {
      setLocationError(locationValidationError);
      return;
    }

    setIsSubmitting(true);
    setDocumentErrors({ aadhaar: null, pan: null, selfie: null });
    setKycError(null);

    try {
      const routeState = location.state as { vendorId?: string | number; vendorProfileId?: string | number } | null;
      const authenticatedVendorId = user?.vendorProfileId ?? user?.vendorId;
      const stateVendorId = routeState?.vendorId ?? routeState?.vendorProfileId ?? authenticatedVendorId;
      const vendorProfileId = stateVendorId !== undefined && stateVendorId !== null && stateVendorId !== ''
        ? Number(stateVendorId) || String(stateVendorId)
        : undefined;

      if (vendorProfileId === undefined) {
        throw new Error('Vendor profile ID is missing. Please authenticate and reopen the KYC flow from the vendor dashboard.');
      }

      const hasLocationDetails = Boolean(locationForm.businessAddress.trim() || locationForm.city.trim() || locationForm.state.trim() || locationForm.pincode.trim() || locationForm.latitude !== null || locationForm.longitude !== null);
      const normalizedLocation = {
        businessAddress: locationForm.businessAddress.trim(),
        city: locationForm.city.trim(),
        state: locationForm.state.trim(),
        pincode: locationForm.pincode.trim(),
        latitude: hasLocationDetails ? locationForm.latitude : null,
        longitude: hasLocationDetails ? locationForm.longitude : null,
      };
      const locationChanged = JSON.stringify(normalizedLocation) !== JSON.stringify(initialLocationRef.current);
      if (locationChanged) {
        try {
          await updateVendorProfile(normalizedLocation);
          initialLocationRef.current = normalizedLocation;
        } catch (error) {
          setLocationError(error instanceof Error ? error.message : 'Unable to save business location.');
          setIsSubmitting(false);
          return;
        }
      }

      console.debug('[Bidzo vendor KYC] vendor profile id resolved', {
        vendorProfileId,
        routeStateVendorId: routeState?.vendorId,
        routeStateVendorProfileId: routeState?.vendorProfileId,
        authenticatedVendorId,
        fromRouteState: routeState?.vendorId !== undefined || routeState?.vendorProfileId !== undefined,
      });

      const uploadAadhaar = async () => {
        if (!aadhaarFile || isApproved(existingDocuments.aadhaar)) return;
        setUploadingField('aadhaar');
        console.debug('[Bidzo vendor KYC] uploading ID_PROOF before vendor document call', {
          vendorId: vendorProfileId,
          fileName: aadhaarFile.name,
          fileSize: aadhaarFile.size,
        });
        await uploadVendorDocument(vendorProfileId, 'ID_PROOF', aadhaarFile);
      };

      const uploadPan = async () => {
        if (!panFile || isApproved(existingDocuments.pan)) return;
        setUploadingField('pan');
        console.debug('[Bidzo vendor KYC] uploading PAN before vendor document call', {
          vendorId: vendorProfileId,
          fileName: panFile.name,
          fileSize: panFile.size,
        });
        await uploadVendorDocument(vendorProfileId, 'PAN', panFile);
      };

      const uploadSelfie = async () => {
        if (!selfieFile) return;
        setUploadingField('selfie');
        await uploadVendorDocument(vendorProfileId, 'SELFIE', selfieFile);
      };

      await uploadAadhaar();
      await uploadPan();
      await uploadSelfie();

      const uploadedDocs = await getVendorDocuments(vendorProfileId);
      const nextDocuments: Record<'aadhaar' | 'pan' | 'selfie', VendorDocumentRecord | null> = { aadhaar: null, pan: null, selfie: null };
      const normalizedTypes = uploadedDocs.map((doc) => String(doc.documentType ?? doc.type ?? '').toUpperCase());
      uploadedDocs.forEach((doc) => {
        const type = String(doc.documentType ?? doc.type ?? '').toUpperCase();
        if (type === 'ID_PROOF' || type.includes('AADHAAR') || type.includes('IDENTITY')) nextDocuments.aadhaar = doc;
        if (type === 'PAN') nextDocuments.pan = doc;
        if (type === 'SELFIE') nextDocuments.selfie = doc;
      });
      setExistingDocuments(nextDocuments);
      const hasIdProof = normalizedTypes.some((type) => type === 'ID_PROOF' || type.includes('AADHAAR') || type.includes('IDENTITY'));
      const hasPan = normalizedTypes.includes('PAN');
      console.debug('[Bidzo vendor KYC] persisted documents', { vendorProfileId, normalizedTypes });

      if (!hasIdProof || !hasPan) {
        throw new Error('The backend did not confirm both Aadhaar and PAN document rows were created.');
      }

      try {
        const idProofUrl = nextDocuments.aadhaar?.documentUrl ?? nextDocuments.aadhaar?.url ?? '';
        await saveVendorKyc(vendorProfileId, {
          documentType: 'ID_PROOF',
          documentNumber: nextDocuments.aadhaar?.documentNumber ?? '',
          documentUrl: idProofUrl,
          status: 'PENDING',
          remarks: '',
        });
      } catch (error) {
        setKycError(error instanceof Error ? error.message : 'Unable to save KYC record.');
        return;
      }

      navigate('/login', { replace: true, state: { role: 'vendor' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete KYC upload.';
      setDocumentErrors({
        aadhaar: message,
        pan: message,
        selfie: message,
      });
    } finally {
      setUploadingField(null);
      setIsSubmitting(false);
    }
  };

  const validateDocument = (file: File | null, field: 'aadhaar' | 'pan' | 'selfie') => {
    if (!file) return null;
    setDocumentErrors((current) => ({ ...current, [field]: null }));
    return file;
  };

  const handleFileSelection = async (file: File | null, field: 'aadhaar' | 'pan' | 'selfie') => {
    if (!file) return;

    const validFile = validateDocument(file, field);
    if (!validFile) return;

    if (field === 'aadhaar') setAadhaarFile(validFile);
    else if (field === 'pan') setPanFile(validFile);
    else setSelfieFile(validFile);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, field: 'aadhaar' | 'pan' | 'selfie') => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file, field);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, field: 'aadhaar' | 'pan' | 'selfie') => {
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
    existingDocument,
    accent,
    accept,
    note,
  }: {
    title: string;
    description: string;
    field: 'aadhaar' | 'pan' | 'selfie';
    file: File | null;
    existingDocument: VendorDocumentRecord | null;
    accent: 'blue' | 'emerald';
    accept: string;
    note: string;
  }) => {
    const isActive = draggingField === field;
    const accentClass = accent === 'emerald'
      ? 'border-emerald-400/20 bg-emerald-500/10'
      : 'border-blue-400/20 bg-blue-500/10';
    const isUploading = uploadingField === field;
    const existingStatus = String(existingDocument?.status ?? '').toUpperCase();
    const statusLabel = existingDocument ? existingStatus === 'APPROVED' || existingStatus === 'VERIFIED' ? 'Approved' : existingStatus === 'REJECTED' ? 'Rejected' : existingStatus === 'CHANGES_REQUESTED' ? 'Requires changes' : existingStatus === 'IN_REVIEW' ? 'In review' : 'Pending' : 'Not uploaded';
    const statusClass = statusLabel === 'Approved' ? 'text-emerald-300' : statusLabel === 'Rejected' || statusLabel === 'Requires changes' ? 'text-red-300' : statusLabel === 'Pending' || statusLabel === 'In review' ? 'text-amber-300' : 'text-slate-300';

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
          <span className={`text-xs font-medium ${statusClass}`}>{statusLabel}</span>
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
          {file ? <span className="text-emerald-200">Selected: {file.name} • {formatFileSize(file.size)}</span> : existingDocument?.fileName ? <span>Stored: {existingDocument.fileName}</span> : note}
        </div>
        {existingDocument?.documentUrl || existingDocument?.url ? <a href={existingDocument.documentUrl ?? existingDocument.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-blue-300 underline">Preview existing document</a> : null}
        {['REJECTED', 'CHANGES_REQUESTED'].includes(existingStatus) ? <p className="mt-2 text-xs text-red-300">{existingDocument?.reason ?? existingDocument?.remarks ?? 'Please re-upload this document.'}</p> : null}
        {documentErrors[field] ? <p className="mt-2 text-xs text-red-400">{documentErrors[field]}</p> : null}
        <label className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:text-white ${isUploading ? 'cursor-not-allowed opacity-60' : ''}`}>
          {isUploading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {isUploading ? 'Uploading…' : 'Choose file'}
          <input type="file" accept={accept} className="sr-only" disabled={isUploading} onChange={(event) => handleInputChange(event, field)} />
        </label>
      </div>
    );
  };

  const hasAllRequiredDocuments = Boolean((aadhaarFile || existingDocuments.aadhaar) && (panFile || existingDocuments.pan));

  return (
    <SectionShell title="Vendor verification" subtitle="Complete identity verification">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-4 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <FileCheck2 className="h-4 w-4" /> Verified identity
          </div>
          <ProgressIndicator activeStep={2} />
          <p className="text-sm text-slate-300">Upload the identity documents required to complete seller verification.</p>
          <section className="mt-5 rounded-[20px] border border-blue-400/20 bg-blue-500/10 p-4 sm:p-5" aria-labelledby="business-location-heading">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200"><MapPin className="h-5 w-5" /></span>
              <div>
                <h3 id="business-location-heading" className="text-lg font-semibold text-white">Business Location</h3>
                <p className="mt-1 text-sm leading-5 text-slate-300">Add your business/store location. This location will be used to show your products to nearby customers.</p>
              </div>
            </div>
            {profileLoading ? <p className="mt-4 text-sm text-slate-400">Loading saved business location...</p> : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-200">Business Address</span>
                <textarea value={locationForm.businessAddress} onChange={(event) => setLocationForm((current) => ({ ...current, businessAddress: event.target.value }))} placeholder="Enter complete business/store address" rows={3} className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">City</span>
                <input value={locationForm.city} onChange={(event) => setLocationForm((current) => ({ ...current, city: event.target.value }))} placeholder="Enter city" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">State</span>
                <input value={locationForm.state} onChange={(event) => setLocationForm((current) => ({ ...current, state: event.target.value }))} placeholder="Select or enter state" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Pincode</span>
                <input value={locationForm.pincode} onChange={(event) => setLocationForm((current) => ({ ...current, pincode: event.target.value }))} placeholder="Enter pincode" inputMode="numeric" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/50" />
              </label>
              <div className="flex items-end">
                <button type="button" onClick={detectBusinessLocation} disabled={locationLoading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-300/30 bg-blue-600/20 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60">
                  {locationLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  {locationLoading ? 'Detecting location...' : 'Use my current location'}
                </button>
              </div>
            </div>
            {locationDetected ? <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2 text-sm text-emerald-100"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><div><p className="font-semibold">Location detected</p><p className="mt-1 break-words text-emerald-200">{locationForm.city}{locationForm.state ? `, ${locationForm.state}` : ''}</p><p className="mt-1 text-emerald-200">{locationForm.pincode || 'Pincode not available'}</p></div></div>
                <button type="button" onClick={() => { setLocationDetected(false); setLocationForm((current) => ({ ...current, latitude: null, longitude: null })); }} className="shrink-0 text-xs font-semibold text-emerald-200 underline hover:text-white">Change location</button>
              </div>
            </div> : null}
            {locationError ? <p role="alert" className="mt-3 text-sm leading-5 text-amber-200">{locationError}</p> : null}
            <p className="mt-3 text-xs leading-5 text-slate-400">Latitude and longitude are captured automatically when available. You can continue with manual location details if permission is denied.</p>
          </section>
          <div className="mt-4 rounded-[24px] border border-dashed border-blue-400/20 bg-blue-500/10 p-6 text-center text-sm text-slate-300 sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/50">
              <Upload className="h-5 w-5 text-blue-200" />
            </div>
            <p className="mt-3 font-semibold text-white">Upload your KYC documents for secure vendor verification</p>
            <p className="mt-1 text-slate-300">JPG, JPEG, PNG up to 10MB</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1">Aadhaar</span>
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1">PAN</span>
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1">Selfie / Live Photo</span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {documentsLoading ? <div className="md:col-span-2 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Loading existing KYC documents...</div> : null}
            {documentsError ? <div className="md:col-span-2 rounded-[20px] border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">Unable to load existing KYC documents. You can retry by refreshing the page.</div> : null}
            {renderUploadCard({ title: 'Aadhaar / ID proof', description: 'Required for identity verification', field: 'aadhaar', file: aadhaarFile, existingDocument: existingDocuments.aadhaar, accent: 'blue', accept: 'image/*,.pdf', note: 'Drag and drop or browse to upload' })}
            {renderUploadCard({ title: 'PAN card', description: 'Required for tax and compliance review', field: 'pan', file: panFile, existingDocument: existingDocuments.pan, accent: 'emerald', accept: 'image/*,.pdf', note: 'Drag and drop or browse to upload' })}
            {renderUploadCard({ title: 'Selfie / Live Photo', description: 'Use the existing selfie verification requirement', field: 'selfie', file: selfieFile, existingDocument: existingDocuments.selfie, accent: 'blue', accept: 'image/*', note: 'Upload a clear face photo for identity verification' })}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white"><CircleAlert className="h-4 w-4 text-amber-300" /> Required documents and their approval status are checked by the backend.</div>
          </div>
          {kycError ? <div role="alert" className="mt-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3 text-sm text-amber-200">{kycError}</div> : null}
          <button onClick={submitKyc} disabled={!hasAllRequiredDocuments || isSubmitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {isSubmitting ? 'Submitting verification…' : 'Submit KYC'} <ArrowRight className="h-4 w-4" />
          </button>
          {!hasAllRequiredDocuments ? <p className="mt-3 text-sm text-red-400">Aadhaar and PAN are required for vendor approval. Upload both to continue.</p> : null}
        </div>
        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-amber-500/10 p-4 sm:p-8">
          <h3 className="text-xl font-semibold text-white">Verification checklist</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Aadhaar card upload</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />PAN card upload</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />Selfie / Live Photo upload</li>
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
    <SectionShell title="Registration fee" subtitle="Complete registration to activate your account">
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
              <p className="text-lg font-semibold text-white">Fee will be confirmed by the backend</p>
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
