import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, LoaderCircle, Printer } from 'lucide-react';
import { downloadVendorPackingSlip } from '../../api/vendorOrderApi';
import { ApiError } from '../../api/apiClient';
import { printPdfBlobInWindow, runWithPdfActionLock, savePdfBlob } from '../../utils/pdfFile';

type Action = 'download' | 'print';
type Feedback = { type: 'success' | 'error'; message: string };

function safeErrorMessage(reason: unknown): string {
  if (reason instanceof ApiError && reason.status === 401) return 'Your session has expired. Sign in again and retry the packing slip.';
  if (reason instanceof ApiError && reason.status === 403) return 'You do not have permission to access this packing slip.';
  if (reason instanceof TypeError) return 'Unable to reach the server. Check your connection and try again.';
  if (reason instanceof Error && reason.message.trim().length <= 200
    && !/[\r\n<>]/.test(reason.message)
    && !/(?:stack\s*trace|traceback|password|token|secret|authorization|https?:\/\/)/i.test(reason.message)) {
    return reason.message;
  }
  return 'Unable to get the packing slip. Please try again.';
}

export function VendorPackingSlipActions({ orderId, orderNumber }: { orderId: number; orderNumber?: string }) {
  const [action, setAction] = useState<Action | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const actionLock = useRef({ current: false });
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const label = orderNumber || `BIDZO-${orderId}`;

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  const showFeedback = (next: Feedback) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(next);
    if (next.type === 'success') {
      feedbackTimer.current = setTimeout(() => setFeedback(null), 5000);
    }
  };

  const download = () => {
    void runWithPdfActionLock(actionLock.current, async () => {
      setAction('download');
      setFeedback(null);
      try {
        const file = await downloadVendorPackingSlip(orderId);
        savePdfBlob(file.blob, file.filename);
        showFeedback({ type: 'success', message: `Packing slip downloaded for order ${label}.` });
      } catch (reason) {
        showFeedback({ type: 'error', message: safeErrorMessage(reason) });
      } finally {
        setAction(null);
      }
    });
  };

  const print = () => {
    if (actionLock.current) return;
    const printWindow = window.open('about:blank', '_blank');
    if (!printWindow) {
      showFeedback({ type: 'error', message: 'Allow pop-ups to print the packing slip, then try again.' });
      return;
    }
    void runWithPdfActionLock(actionLock.current, async () => {
      setAction('print');
      setFeedback(null);
      try {
        const file = await downloadVendorPackingSlip(orderId);
        printPdfBlobInWindow(printWindow, file.blob);
        showFeedback({ type: 'success', message: `Packing slip opened for printing for order ${label}.` });
      } catch (reason) {
        printWindow.close();
        showFeedback({ type: 'error', message: safeErrorMessage(reason) });
      } finally {
        setAction(null);
      }
    });
  };

  return <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={download} disabled={action !== null} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
        {action === 'download' ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
        {action === 'download' ? 'Downloading…' : 'Download Packing Slip'}
      </button>
      <button type="button" onClick={print} disabled={action !== null} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
        {action === 'print' ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Printer className="h-4 w-4" aria-hidden="true" />}
        {action === 'print' ? 'Preparing print…' : 'Print Packing Slip'}
      </button>
    </div>
    {feedback ? <p role={feedback.type === 'success' ? 'status' : 'alert'} className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${feedback.type === 'success' ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/20 bg-rose-500/10 text-rose-200'}`}>
      {feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
      <span>{feedback.message}</span>
    </p> : null}
  </div>;
}
