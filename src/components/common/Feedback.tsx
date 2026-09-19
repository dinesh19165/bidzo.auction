import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { getVendorDocuments, getVendorProfile, type VendorDocumentRecord } from '../../api/vendorApi';
import { useThemeContext } from '../../context/ThemeContext';

interface ModalProps { open: boolean; title: string; children: ReactNode; onClose?: () => void; }
export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[24px] border border-white/10 bg-slate-900 p-4 text-white shadow-2xl sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="min-w-0 text-lg font-semibold">{title}</h3><button aria-label="Close dialog" onClick={onClose} className="min-h-11 min-w-11 shrink-0 text-slate-400">✕</button></div>{children}</motion.div></div>;
}

export function Drawer({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl sm:p-6">{children}</div>;
}

export function Tabs({ tabs, active, onChange }: { tabs: Array<{ label: string; value: string }>; active: string; onChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1"><button key={active} className="rounded-full px-3 py-2 text-sm" />{tabs.map((tab) => <button key={tab.value} onClick={() => onChange(tab.value)} className={`rounded-full px-3 py-2 text-sm ${active === tab.value ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}>{tab.label}</button>)}</div>;
}

export function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-[20px] border border-white/10 bg-white/5 p-4"><p className="font-semibold text-white">{title}</p><div className="mt-3 text-sm text-slate-300">{children}</div></div>;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return <div className="group relative inline-block">{children}<span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">{label}</span></div>;
}

export function Toast({ message }: { message: string }) {
  return <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">{message}</div>;
}

export function KycApprovalRequiredModal({ open, itemLabel, onComplete, onClose }: { open: boolean; itemLabel: 'product' | 'auction'; onComplete: () => void; onClose: () => void; }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/10 bg-slate-900 text-white shadow-2xl shadow-slate-950/50">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-xl font-semibold">KYC Approval Required</p>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-6 text-slate-300">{itemLabel === 'auction' ? 'Your KYC must be approved before publishing an auction.' : 'Your KYC is not approved yet. Please complete your KYC and wait for approval before publishing.'}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10">Cancel</button>
            <button type="button" onClick={onComplete} className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">Complete KYC</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const REQUIRED_KYC_DOCUMENTS = ['PAN', 'ID_PROOF', 'SELFIE'] as const;

function normalizeKycDocumentType(document: VendorDocumentRecord): string {
  const value = String(document.documentType ?? document.type ?? '').toUpperCase();
  if (value.includes('PAN')) return 'PAN';
  if (value.includes('SELFIE')) return 'SELFIE';
  if (value.includes('ID_PROOF') || value.includes('AADHAAR') || value.includes('IDENTITY')) return 'ID_PROOF';
  return '';
}

export function KycPublishWarning({ onComplete }: { onComplete: () => void }) {
  const { theme } = useThemeContext();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let active = true;
    const loadKycStatus = async () => {
      try {
        const profile = await getVendorProfile();
        const documents = await getVendorDocuments(profile.id);
        const documentStatus = new Map(
          documents.map((document) => [normalizeKycDocumentType(document), String(document.status ?? '').toUpperCase()])
        );
        const incomplete = REQUIRED_KYC_DOCUMENTS.some((type) => documentStatus.get(type) !== 'APPROVED');
        if (active) setShowWarning(incomplete);
      } catch {
        // The backend remains authoritative when document status cannot be loaded.
      }
    };

    void loadKycStatus();
    return () => {
      active = false;
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className={`mb-4 flex flex-col gap-3 rounded-2xl border p-3 text-sm sm:flex-row sm:items-center sm:justify-between ${theme === 'dark' ? 'border-amber-400/30 bg-amber-500/10 text-amber-100' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
      <div className="min-w-0">
        <p className="font-semibold">KYC approval required</p>
        <p className={`mt-1 text-xs leading-5 ${theme === 'dark' ? 'text-amber-100/80' : 'text-amber-800'}`}>Please complete and get approval for PAN, ID Proof, and Selfie before publishing.</p>
      </div>
      <button type="button" onClick={onComplete} className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition ${theme === 'dark' ? 'bg-amber-300 text-slate-950 hover:bg-amber-200' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>Complete KYC</button>
    </div>
  );
}
