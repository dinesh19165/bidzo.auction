import { useState } from 'react';
import { SectionShell } from '../components/SectionShell';
import { submitContactMessage } from '../api/contactApi';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!form.email.trim()) nextErrors.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Please enter a valid email address.';
    if (!form.message.trim()) nextErrors.message = 'Please enter a message.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
    setSuccessMessage('');
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');
    try {
      await submitContactMessage({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() });
      setForm({ name: '', email: '', message: '' });
      setSuccessMessage('Your message has been submitted successfully. Our support team will get back to you soon.');
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : 'Unable to submit your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionShell title="Support" subtitle="Contact Bidzo">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <p className="text-slate-300">Need help with an order, auction, payment, or account? Contact the Bidzo support team for assistance.</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <p>✉ hello@bidzo.com</p>
            <p>☎ +91 80 4567 8900</p>
            <p>📍 Bengaluru, India</p>
          </div>
        </div>
        <form onSubmit={submit} noValidate className="rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
          <h3 className="text-xl font-semibold text-white">Send a note</h3>
          <div className="mt-4 space-y-3">
            {submitError ? <p role="alert" className="border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{submitError}</p> : null}
            {successMessage ? <p role="status" className="border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm leading-5 text-emerald-200">{successMessage}</p> : null}
            <label className="block text-sm text-slate-300">Name<input aria-label="Name" value={form.name} onChange={(event) => updateField('name', event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-400/60" placeholder="Your name" />{errors.name ? <span className="mt-1 block text-xs text-rose-300">{errors.name}</span> : null}</label>
            <label className="block text-sm text-slate-300">Email<input aria-label="Email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-400/60" placeholder="Your email" />{errors.email ? <span className="mt-1 block text-xs text-rose-300">{errors.email}</span> : null}</label>
            <label className="block text-sm text-slate-300">Message<textarea aria-label="Message" value={form.message} onChange={(event) => updateField('message', event.target.value)} className="mt-1.5 min-h-32 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none focus:border-blue-400/60" placeholder="How can we help?" />{errors.message ? <span className="mt-1 block text-xs text-rose-300">{errors.message}</span> : null}</label>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Sending...' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </SectionShell>
  );
}
